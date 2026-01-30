import { getDb } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  scmInventoryLedger,
  stockReservations,
  purchaseOrders,
  purchaseOrderItems,
  salesOrderItems,
  productInventory,
} from "../../drizzle/schema";

export interface AtpResult {
  productId: number;
  warehouseId?: number;
  currentStock: number;
  reservedQty: number;
  incomingPOQty: number;
  atpQty: number;
  atpDate: Date | null;
  breakdown: {
    onHand: number;
    reserved: number;
    incoming: Array<{
      poNumber: string;
      qty: number;
      expectedDate: Date | null;
    }>;
  };
}

export async function calculateATP(
  productId: number,
  warehouseId?: number
): Promise<AtpResult> {
  const currentStock = await getCurrentStock(productId, warehouseId);
  const reservedQty = await getReservedQuantity(productId, warehouseId);
  const incomingPOs = await getIncomingPurchaseOrders(productId);
  const incomingPOQty = incomingPOs.reduce((sum, po) => sum + po.qty, 0);
  const atpQty = currentStock - reservedQty + incomingPOQty;
  let atpDate: Date | null = null;
  if (atpQty > 0) {
    atpDate = new Date();
  } else if (incomingPOs.length > 0) {
    const sortedPOs = incomingPOs
      .filter(po => po.expectedDate)
      .sort((a, b) => (a.expectedDate!.getTime() - b.expectedDate!.getTime()));
    
    let cumulativeQty = currentStock - reservedQty;
    for (const po of sortedPOs) {
      cumulativeQty += po.qty;
      if (cumulativeQty > 0) {
        atpDate = po.expectedDate;
        break;
      }
    }
  }

  return {
    productId,
    warehouseId,
    currentStock,
    reservedQty,
    incomingPOQty,
    atpQty,
    atpDate,
    breakdown: {
      onHand: currentStock,
      reserved: reservedQty,
      incoming: incomingPOs,
    },
  };
}

export async function getCurrentStock(
  productId: number,
  warehouseId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const conditions = [eq(scmInventoryLedger.productId, productId)];
  if (warehouseId) {
    conditions.push(eq(scmInventoryLedger.warehouseId, warehouseId));
  }

  const result = await db
    .select({
      totalQty: sql<string>`COALESCE(SUM(${scmInventoryLedger.qtyChange}), 0)`,
    })
    .from(scmInventoryLedger)
    .where(and(...conditions));

  if (parseFloat(result[0]?.totalQty || "0") === 0) {
    const fallback = await db
      .select({
        totalQty: sql<string>`COALESCE(SUM(${productInventory.quantity}), 0)`,
      })
      .from(productInventory)
      .where(
        warehouseId
          ? and(
              eq(productInventory.productId, productId),
              eq(productInventory.warehouseId, warehouseId)
            )
          : eq(productInventory.productId, productId)
      );
    return parseFloat(fallback[0]?.totalQty || "0");
  }

  return parseFloat(result[0]?.totalQty || "0");
}

export async function getReservedQuantity(
  productId: number,
  warehouseId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const conditions = [
    eq(stockReservations.productId, productId),
    eq(stockReservations.status, "active"),
  ];
  if (warehouseId) {
    conditions.push(eq(stockReservations.warehouseId, warehouseId));
  }

  const result = await db
    .select({
      totalReserved: sql<string>`COALESCE(SUM(${stockReservations.reservedQty}), 0)`,
    })
    .from(stockReservations)
    .where(and(...conditions));

  return parseFloat(result[0]?.totalReserved || "0");
}

export async function getIncomingPurchaseOrders(
  productId: number
): Promise<Array<{ poNumber: string; qty: number; expectedDate: Date | null }>> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      poNumber: purchaseOrders.poNumber,
      quantity: purchaseOrderItems.quantity,
      receivedQuantity: purchaseOrderItems.receivedQuantity,
      expectedDate: purchaseOrders.expectedDeliveryDate,
    })
    .from(purchaseOrderItems)
    .innerJoin(purchaseOrders, eq(purchaseOrderItems.purchaseOrderId, purchaseOrders.id))
    .where(
      and(
        eq(purchaseOrderItems.productId, productId),
        sql`${purchaseOrders.status} IN ('sent', 'confirmed', 'in_transit')`
      )
    );

  return result.map(row => ({
    poNumber: row.poNumber,
    qty: (row.quantity || 0) - (row.receivedQuantity || 0),
    expectedDate: row.expectedDate ? new Date(row.expectedDate) : null,
  }));
}

export async function reserveStock(
  productId: number,
  warehouseId: number,
  salesOrderId: number,
  salesOrderItemId: number,
  quantity: number,
  createdBy?: number
): Promise<{ success: boolean; reservationId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const atp = await calculateATP(productId, warehouseId);
  
  if (atp.atpQty < quantity) {
    return {
      success: false,
      error: `Insufficient ATP. Available: ${atp.atpQty}, Requested: ${quantity}`,
    };
  }

  const [reservation] = await db
    .insert(stockReservations)
    .values({
      productId,
      warehouseId,
      salesOrderId,
      salesOrderItemId,
      reservedQty: quantity.toString(),
      status: "active",
      createdBy,
    })
    .returning();

  await db
    .update(salesOrderItems)
    .set({ reservedQty: quantity.toString() })
    .where(eq(salesOrderItems.id, salesOrderItemId));

  return {
    success: true,
    reservationId: reservation.id,
  };
}

export async function releaseReservation(
  reservationId: number,
  releasedBy?: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [reservation] = await db
    .select()
    .from(stockReservations)
    .where(eq(stockReservations.id, reservationId));

  if (!reservation) {
    return { success: false, error: "Reservation not found" };
  }

  if (reservation.status !== "active") {
    return { success: false, error: `Reservation is already ${reservation.status}` };
  }

  await db
    .update(stockReservations)
    .set({
      status: "released",
      releasedAt: new Date(),
      releasedBy,
    })
    .where(eq(stockReservations.id, reservationId));

  await db
    .update(salesOrderItems)
    .set({ reservedQty: "0" })
    .where(eq(salesOrderItems.id, reservation.salesOrderItemId));

  return { success: true };
}

export async function consumeReservation(
  reservationId: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [reservation] = await db
    .select()
    .from(stockReservations)
    .where(eq(stockReservations.id, reservationId));

  if (!reservation) {
    return { success: false, error: "Reservation not found" };
  }

  if (reservation.status !== "active") {
    return { success: false, error: `Reservation is already ${reservation.status}` };
  }

  await db
    .update(stockReservations)
    .set({
      status: "consumed",
      consumedAt: new Date(),
    })
    .where(eq(stockReservations.id, reservationId));

  return { success: true };
}
