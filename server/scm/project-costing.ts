import { getDb } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  projectWbs,
  projectMaterialConsumption,
  scmInventoryLedger,
  salesProducts,
  productInventory,
  projects,
} from "../../drizzle/schema";
import { getCurrentStock } from "./atp-calculator";

export interface WbsCostSummary {
  wbsId: number;
  wbsCode: string;
  wbsName: string;
  budgetAmount: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  children?: WbsCostSummary[];
}

export interface ProjectCostSummary {
  projectId: number;
  projectName: string;
  totalBudget: number;
  totalActualCost: number;
  totalVariance: number;
  wbsBreakdown: WbsCostSummary[];
  materialCosts: number;
  lastUpdated: Date;
}

export interface MaterialConsumptionResult {
  success: boolean;
  consumptionId?: number;
  ledgerEntryId?: number;
  totalCost?: number;
  error?: string;
}

export async function consumeMaterialForProject(
  projectId: number,
  productId: number,
  warehouseId: number,
  quantity: number,
  wbsId?: number,
  performedBy?: number,
  notes?: string
): Promise<MaterialConsumptionResult> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const currentStock = await getCurrentStock(productId, warehouseId);
  
  if (currentStock < quantity) {
    return {
      success: false,
      error: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`,
    };
  }

  const [product] = await db
    .select()
    .from(salesProducts)
    .where(eq(salesProducts.id, productId));

  if (!product) {
    return { success: false, error: "Product not found" };
  }

  const valuationRate = parseFloat(product.purchasePrice || "0");
  const totalCost = valuationRate * quantity;

  const [ledgerEntry] = await db
    .insert(scmInventoryLedger)
    .values({
      productId,
      warehouseId,
      qtyChange: (-quantity).toString(),
      valuationRate: valuationRate.toString(),
      valuationAmount: (-totalCost).toString(),
      projectId,
      referenceDocType: "project_consumption",
      notes: notes || `Material consumed for project`,
      performedBy,
    })
    .returning();

  const [consumption] = await db
    .insert(projectMaterialConsumption)
    .values({
      projectId,
      wbsId,
      productId,
      warehouseId,
      quantity: quantity.toString(),
      valuationRate: valuationRate.toString(),
      totalCost: totalCost.toString(),
      ledgerEntryId: ledgerEntry.id,
      consumptionDate: new Date().toISOString().split("T")[0],
      notes,
      performedBy,
    })
    .returning();

  if (wbsId) {
    await db
      .update(projectWbs)
      .set({
        actualCost: sql`CAST(${projectWbs.actualCost} AS DECIMAL) + ${totalCost}`,
        updatedAt: new Date(),
      })
      .where(eq(projectWbs.id, wbsId));
  }

  const [existingInventory] = await db
    .select()
    .from(productInventory)
    .where(
      and(
        eq(productInventory.productId, productId),
        eq(productInventory.warehouseId, warehouseId)
      )
    );

  if (existingInventory) {
    await db
      .update(productInventory)
      .set({
        quantity: sql`CAST(${productInventory.quantity} AS DECIMAL) - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(productInventory.id, existingInventory.id));
  }

  return {
    success: true,
    consumptionId: consumption.id,
    ledgerEntryId: ledgerEntry.id,
    totalCost,
  };
}

export async function createWbs(
  projectId: number,
  wbsCode: string,
  name: string,
  description?: string,
  parentWbsId?: number,
  budgetAmount?: number,
  createdBy?: number
): Promise<{ success: boolean; wbsId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [existing] = await db
    .select()
    .from(projectWbs)
    .where(
      and(
        eq(projectWbs.projectId, projectId),
        eq(projectWbs.wbsCode, wbsCode)
      )
    );

  if (existing) {
    return { success: false, error: `WBS code ${wbsCode} already exists for this project` };
  }

  const [wbs] = await db
    .insert(projectWbs)
    .values({
      projectId,
      wbsCode,
      name,
      description,
      parentWbsId,
      budgetAmount: (budgetAmount || 0).toString(),
      createdBy,
    })
    .returning();

  return { success: true, wbsId: wbs.id };
}

export async function getWbsTree(projectId: number): Promise<WbsCostSummary[]> {
  const db = await getDb();
  if (!db) return [];

  const allWbs = await db
    .select()
    .from(projectWbs)
    .where(eq(projectWbs.projectId, projectId));

  const buildTree = (parentId: number | null): WbsCostSummary[] => {
    return allWbs
      .filter(w => w.parentWbsId === parentId)
      .map(w => {
        const budget = parseFloat(w.budgetAmount || "0");
        const actual = parseFloat(w.actualCost || "0");
        const variance = budget - actual;
        const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
        
        const children = buildTree(w.id);
        
        return {
          wbsId: w.id,
          wbsCode: w.wbsCode,
          wbsName: w.name,
          budgetAmount: budget,
          actualCost: actual,
          variance,
          variancePercent: Math.round(variancePercent * 10) / 10,
          children: children.length > 0 ? children : undefined,
        };
      });
  };

  return buildTree(null);
}

export async function getProjectCostSummary(
  projectId: number
): Promise<ProjectCostSummary | null> {
  const db = await getDb();
  if (!db) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return null;
  }

  const wbsBreakdown = await getWbsTree(projectId);

  const totalBudget = wbsBreakdown.reduce((sum, w) => sum + w.budgetAmount, 0);
  const totalActualCost = wbsBreakdown.reduce((sum, w) => sum + w.actualCost, 0);

  const materialCostsResult = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${projectMaterialConsumption.totalCost} AS DECIMAL)), 0)`,
    })
    .from(projectMaterialConsumption)
    .where(eq(projectMaterialConsumption.projectId, projectId));

  const materialCosts = parseFloat(materialCostsResult[0]?.total || "0");

  return {
    projectId,
    projectName: project.name,
    totalBudget,
    totalActualCost,
    totalVariance: totalBudget - totalActualCost,
    wbsBreakdown,
    materialCosts,
    lastUpdated: new Date(),
  };
}

export async function getProjectMaterialHistory(
  projectId: number,
  wbsId?: number
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(projectMaterialConsumption.projectId, projectId)];
  if (wbsId) {
    conditions.push(eq(projectMaterialConsumption.wbsId, wbsId));
  }

  const history = await db
    .select({
      id: projectMaterialConsumption.id,
      productId: projectMaterialConsumption.productId,
      productName: salesProducts.name,
      quantity: projectMaterialConsumption.quantity,
      valuationRate: projectMaterialConsumption.valuationRate,
      totalCost: projectMaterialConsumption.totalCost,
      consumptionDate: projectMaterialConsumption.consumptionDate,
      wbsId: projectMaterialConsumption.wbsId,
      wbsCode: projectWbs.wbsCode,
      wbsName: projectWbs.name,
      notes: projectMaterialConsumption.notes,
    })
    .from(projectMaterialConsumption)
    .leftJoin(salesProducts, eq(projectMaterialConsumption.productId, salesProducts.id))
    .leftJoin(projectWbs, eq(projectMaterialConsumption.wbsId, projectWbs.id))
    .where(and(...conditions))
    .orderBy(sql`${projectMaterialConsumption.consumptionDate} DESC`);

  return history;
}

export async function updateWbsBudget(
  wbsId: number,
  newBudget: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [wbs] = await db
    .select()
    .from(projectWbs)
    .where(eq(projectWbs.id, wbsId));

  if (!wbs) {
    return { success: false, error: "WBS not found" };
  }

  await db
    .update(projectWbs)
    .set({
      budgetAmount: newBudget.toString(),
      updatedAt: new Date(),
    })
    .where(eq(projectWbs.id, wbsId));

  return { success: true };
}
