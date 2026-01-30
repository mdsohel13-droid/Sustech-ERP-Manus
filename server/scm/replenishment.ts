import { getDb } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  scmProductExtensions,
  productInventory,
  salesProducts,
  replenishmentRequests,
  purchaseOrders,
  purchaseOrderItems,
} from "../../drizzle/schema";
import { getCurrentStock } from "./atp-calculator";

export interface EoqResult {
  productId: number;
  eoq: number;
  annualDemand: number;
  orderCost: number;
  holdingCost: number;
  optimalOrdersPerYear: number;
  totalAnnualCost: number;
}

export interface ReplenishmentCheck {
  productId: number;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  needsReplenishment: boolean;
  suggestedQty: number;
  eoqDetails: EoqResult | null;
}

export function calculateEOQ(
  annualDemand: number,
  orderCost: number,
  holdingCostPercent: number,
  unitCost: number
): EoqResult | null {
  if (annualDemand <= 0 || orderCost <= 0 || holdingCostPercent <= 0 || unitCost <= 0) {
    return null;
  }

  const holdingCost = (holdingCostPercent / 100) * unitCost;
  const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  const optimalOrdersPerYear = annualDemand / eoq;
  const orderingCostPerYear = optimalOrdersPerYear * orderCost;
  const holdingCostPerYear = (eoq / 2) * holdingCost;
  const totalAnnualCost = orderingCostPerYear + holdingCostPerYear;

  return {
    productId: 0,
    eoq: Math.round(eoq),
    annualDemand,
    orderCost,
    holdingCost,
    optimalOrdersPerYear: Math.round(optimalOrdersPerYear * 10) / 10,
    totalAnnualCost: Math.round(totalAnnualCost * 100) / 100,
  };
}

export async function checkReplenishment(
  productId: number,
  warehouseId?: number
): Promise<ReplenishmentCheck> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [product] = await db
    .select({
      id: salesProducts.id,
      name: salesProducts.name,
      purchasePrice: salesProducts.purchasePrice,
    })
    .from(salesProducts)
    .where(eq(salesProducts.id, productId));

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  const [extension] = await db
    .select()
    .from(scmProductExtensions)
    .where(eq(scmProductExtensions.productId, productId));

  const inventoryConditions = warehouseId
    ? and(
        eq(productInventory.productId, productId),
        eq(productInventory.warehouseId, warehouseId)
      )
    : eq(productInventory.productId, productId);

  const [inventory] = await db
    .select()
    .from(productInventory)
    .where(inventoryConditions);

  const currentStock = await getCurrentStock(productId, warehouseId);
  const reorderPoint = parseFloat(inventory?.reorderPoint || extension?.safetyStock || "0");
  const safetyStock = parseFloat(extension?.safetyStock || "0");
  const needsReplenishment = currentStock <= reorderPoint;
  let eoqDetails: EoqResult | null = null;
  let suggestedQty = 0;

  if (extension) {
    const annualDemand = parseFloat(extension.annualDemand || "0");
    const orderCost = parseFloat(extension.orderCost || "0");
    const holdingCostPercent = parseFloat(extension.holdingCostPercent || "0");
    const unitCost = parseFloat(product.purchasePrice || "0");

    if (annualDemand > 0 && orderCost > 0 && holdingCostPercent > 0 && unitCost > 0) {
      eoqDetails = calculateEOQ(annualDemand, orderCost, holdingCostPercent, unitCost);
      if (eoqDetails) {
        eoqDetails.productId = productId;
        suggestedQty = eoqDetails.eoq;
      }
    }
  }

  if (suggestedQty === 0 && needsReplenishment) {
    const maxStock = parseFloat(inventory?.maxStockLevel || "0");
    suggestedQty = maxStock > 0 ? maxStock - currentStock : reorderPoint * 2;
  }

  return {
    productId,
    productName: product.name,
    currentStock,
    reorderPoint,
    safetyStock,
    needsReplenishment,
    suggestedQty: Math.max(0, Math.round(suggestedQty)),
    eoqDetails,
  };
}

export async function checkAllReplenishments(
  warehouseId?: number
): Promise<ReplenishmentCheck[]> {
  const db = await getDb();
  if (!db) return [];

  const lowStockCondition = warehouseId
    ? and(
        eq(productInventory.warehouseId, warehouseId),
        sql`CAST(${productInventory.quantity} AS DECIMAL) <= CAST(COALESCE(${productInventory.reorderPoint}, '0') AS DECIMAL)`
      )
    : sql`CAST(${productInventory.quantity} AS DECIMAL) <= CAST(COALESCE(${productInventory.reorderPoint}, '0') AS DECIMAL)`;

  const lowStockProducts = await db
    .select({
      productId: productInventory.productId,
    })
    .from(productInventory)
    .where(lowStockCondition);

  const results: ReplenishmentCheck[] = [];
  for (const { productId } of lowStockProducts) {
    try {
      const check = await checkReplenishment(productId, warehouseId);
      if (check.needsReplenishment) {
        results.push(check);
      }
    } catch {
      // Skip products with errors
    }
  }

  return results;
}

export async function createReplenishmentRequest(
  productId: number,
  warehouseId: number,
  createdBy?: number
): Promise<{ success: boolean; requestId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const check = await checkReplenishment(productId, warehouseId);

  if (!check.needsReplenishment) {
    return {
      success: false,
      error: "Product does not need replenishment at this time",
    };
  }

  const [request] = await db
    .insert(replenishmentRequests)
    .values({
      productId,
      warehouseId,
      currentStock: check.currentStock.toString(),
      reorderPoint: check.reorderPoint.toString(),
      suggestedQty: check.suggestedQty.toString(),
      eoqCalculation: check.eoqDetails ? JSON.stringify(check.eoqDetails) : null,
      status: "pending",
      createdBy,
    })
    .returning();

  return {
    success: true,
    requestId: request.id,
  };
}

export async function approveReplenishmentRequest(
  requestId: number,
  approvedBy: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [request] = await db
    .select()
    .from(replenishmentRequests)
    .where(eq(replenishmentRequests.id, requestId));

  if (!request) {
    return { success: false, error: "Request not found" };
  }

  if (request.status !== "pending") {
    return { success: false, error: `Request is already ${request.status}` };
  }

  await db
    .update(replenishmentRequests)
    .set({
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(replenishmentRequests.id, requestId));

  return { success: true };
}

export async function convertToPurchaseOrder(
  requestId: number,
  vendorId: number,
  createdBy: number
): Promise<{ success: boolean; poId?: number; poNumber?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [request] = await db
    .select()
    .from(replenishmentRequests)
    .where(eq(replenishmentRequests.id, requestId));

  if (!request) {
    return { success: false, error: "Request not found" };
  }

  if (request.status !== "approved") {
    return { success: false, error: "Request must be approved before converting to PO" };
  }

  const [product] = await db
    .select()
    .from(salesProducts)
    .where(eq(salesProducts.id, request.productId));

  if (!product) {
    return { success: false, error: "Product not found" };
  }

  const poNumber = `PO-${Date.now()}`;
  const unitPrice = parseFloat(product.purchasePrice || "0");
  const quantity = parseFloat(request.suggestedQty);
  const totalAmount = unitPrice * quantity;

  const [po] = await db
    .insert(purchaseOrders)
    .values({
      poNumber,
      vendorId,
      orderDate: new Date().toISOString().split("T")[0],
      status: "draft",
      subtotal: totalAmount.toString(),
      totalAmount: totalAmount.toString(),
      createdBy,
    })
    .returning();

  await db.insert(purchaseOrderItems).values({
    purchaseOrderId: po.id,
    productId: request.productId,
    productName: product.name,
    quantity: Math.round(quantity),
    unitPrice: unitPrice.toString(),
    totalAmount: totalAmount.toString(),
  });

  await db
    .update(replenishmentRequests)
    .set({
      status: "converted_to_po",
      purchaseOrderId: po.id,
      updatedAt: new Date(),
    })
    .where(eq(replenishmentRequests.id, requestId));

  return {
    success: true,
    poId: po.id,
    poNumber: po.poNumber,
  };
}
