import { eq, and, desc, sql, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  rfqs, InsertRFQ,
  rfqLines, InsertRFQLine,
  rfqResponses, InsertRFQResponse,
  vendorBidsTable, InsertVendorBid,
  shipments, InsertShipment,
  shipmentLines, InsertShipmentLine,
  shipmentTracking, InsertShipmentTrackingEvent,
  supplierRiskScores, InsertSupplierRiskScore,
  inventoryLots, InsertInventoryLot,
  scmAuditTrail, InsertScmAuditTrail,
  vendors,
  purchaseOrders,
  purchaseOrderItems,
} from "../drizzle/schema";
import crypto from "crypto";

async function db() {
  const instance = await getDb();
  if (!instance) throw new Error("Database not available");
  return instance;
}

function computeHash(data: string, previousHash?: string): string {
  const input = previousHash ? `${previousHash}:${data}` : data;
  return crypto.createHash("sha256").update(input).digest("hex");
}

// ============ RFQ Functions ============

export async function createRFQ(data: InsertRFQ) {
  const d = await db();
  const count = await d.select({ count: sql<number>`count(*)` }).from(rfqs);
  const num = (Number(count[0]?.count) || 0) + 1;
  const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(num).padStart(4, "0")}`;
  const result = await d.insert(rfqs).values({ ...data, rfqNumber }).returning();
  return result[0];
}

export async function getAllRFQs() {
  const d = await db();
  return await d.select().from(rfqs).where(eq(rfqs.isArchived, false)).orderBy(desc(rfqs.createdAt));
}

export async function getRFQById(id: number) {
  const d = await db();
  const result = await d.select().from(rfqs).where(eq(rfqs.id, id));
  return result[0];
}

export async function updateRFQ(id: number, data: Partial<InsertRFQ>) {
  const d = await db();
  return await d.update(rfqs).set({ ...data, updatedAt: new Date() }).where(eq(rfqs.id, id)).returning();
}

export async function deleteRFQ(id: number) {
  const d = await db();
  return await d.update(rfqs).set({ isArchived: true }).where(eq(rfqs.id, id));
}

// RFQ Lines
export async function addRFQLine(data: InsertRFQLine) {
  const d = await db();
  const result = await d.insert(rfqLines).values(data).returning();
  return result[0];
}

export async function getRFQLines(rfqId: number) {
  const d = await db();
  return await d.select().from(rfqLines).where(eq(rfqLines.rfqId, rfqId));
}

export async function deleteRFQLine(id: number) {
  const d = await db();
  return await d.delete(rfqLines).where(eq(rfqLines.id, id));
}

// RFQ Responses
export async function addRFQResponse(data: InsertRFQResponse) {
  const d = await db();
  const result = await d.insert(rfqResponses).values(data).returning();
  return result[0];
}

export async function getRFQResponses(rfqId: number) {
  const d = await db();
  return await d.select().from(rfqResponses).where(eq(rfqResponses.rfqId, rfqId)).orderBy(asc(rfqResponses.rank));
}

export async function updateRFQResponse(id: number, data: Partial<InsertRFQResponse>) {
  const d = await db();
  return await d.update(rfqResponses).set(data).where(eq(rfqResponses.id, id)).returning();
}

// Vendor Bids
export async function addVendorBid(data: InsertVendorBid) {
  const d = await db();
  const result = await d.insert(vendorBidsTable).values(data).returning();
  return result[0];
}

export async function getVendorBids(rfqResponseId: number) {
  const d = await db();
  return await d.select().from(vendorBidsTable).where(eq(vendorBidsTable.rfqResponseId, rfqResponseId));
}

/**
 * Evaluate all vendor responses for an RFQ using weighted scoring
 * Price (40%), Delivery Time (30%), Vendor Rating (20%), Payment Terms (10%)
 */
export async function evaluateRFQResponses(rfqId: number) {
  const d = await db();
  const responses = await d.select().from(rfqResponses).where(eq(rfqResponses.rfqId, rfqId));

  if (responses.length === 0) return [];

  const minPrice = Math.min(
    ...responses.map((r) => parseFloat(r.totalQuotedValue || "0")).filter((v) => v > 0)
  );

  const scored = await Promise.all(
    responses.map(async (response) => {
      const price = parseFloat(response.totalQuotedValue || "0");
      const priceScore = minPrice > 0 && price > 0 ? Math.max(0, 100 - ((price / minPrice - 1) * 100)) : 50;

      const days = response.deliveryDays || 30;
      const deliveryScore = days <= 7 ? 100 : days <= 14 ? 80 : days <= 21 ? 60 : 40;

      const vendor = await d.select().from(vendors).where(eq(vendors.id, response.vendorId));
      const vendorRating = parseFloat(vendor[0]?.rating || "3") * 20;

      const terms = response.paymentTerms || "";
      const paymentScore = terms.includes("30") ? 100 : terms.includes("15") ? 80 : terms.includes("45") ? 60 : 40;

      const totalScore = priceScore * 0.4 + deliveryScore * 0.3 + vendorRating * 0.2 + paymentScore * 0.1;

      return { ...response, evaluationScore: totalScore.toFixed(2) };
    })
  );

  scored.sort((a, b) => parseFloat(b.evaluationScore) - parseFloat(a.evaluationScore));

  for (let i = 0; i < scored.length; i++) {
    await d
      .update(rfqResponses)
      .set({
        evaluationScore: scored[i].evaluationScore,
        rank: i + 1,
        status: "evaluated",
      })
      .where(eq(rfqResponses.id, scored[i].id));
  }

  await d.update(rfqs).set({ status: "evaluated", updatedAt: new Date() }).where(eq(rfqs.id, rfqId));

  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}

/**
 * Accept the best vendor response and convert to Purchase Order
 */
export async function acceptRFQResponse(responseId: number, userId?: number) {
  const d = await db();
  const response = await d.select().from(rfqResponses).where(eq(rfqResponses.id, responseId));
  if (!response[0]) throw new Error("Response not found");

  const rfq = await d.select().from(rfqs).where(eq(rfqs.id, response[0].rfqId));
  if (!rfq[0]) throw new Error("RFQ not found");

  await d.update(rfqResponses).set({ status: "accepted" }).where(eq(rfqResponses.id, responseId));

  const otherResponses = await d
    .select()
    .from(rfqResponses)
    .where(and(eq(rfqResponses.rfqId, rfq[0].id), sql`${rfqResponses.id} != ${responseId}`));
  for (const other of otherResponses) {
    await d.update(rfqResponses).set({ status: "rejected" }).where(eq(rfqResponses.id, other.id));
  }

  await d.update(rfqs).set({ status: "closed", updatedAt: new Date() }).where(eq(rfqs.id, rfq[0].id));

  const poCount = await d.select({ count: sql<number>`count(*)` }).from(purchaseOrders);
  const poNum = (Number(poCount[0]?.count) || 0) + 1;
  const poNumber = `PO-${new Date().getFullYear()}-${String(poNum).padStart(4, "0")}`;

  const lines = await d.select().from(rfqLines).where(eq(rfqLines.rfqId, rfq[0].id));
  const bids = await d.select().from(vendorBidsTable).where(eq(vendorBidsTable.rfqResponseId, responseId));

  const totalAmount = parseFloat(response[0].totalQuotedValue || "0");

  const po = await d
    .insert(purchaseOrders)
    .values({
      poNumber,
      vendorId: response[0].vendorId,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: rfq[0].requiredDeliveryDate,
      totalAmount: totalAmount.toFixed(2),
      subtotal: totalAmount.toFixed(2),
      status: "draft",
      notes: `Auto-generated from RFQ ${rfq[0].rfqNumber}`,
      createdBy: userId,
    })
    .returning();

  for (const line of lines) {
    const bid = bids.find((b) => b.rfqLineId === line.id);
    await d.insert(purchaseOrderItems).values({
      purchaseOrderId: po[0].id,
      productId: line.productId,
      productName: line.productName,
      quantity: parseInt(line.quantity) || 1,
      unitPrice: bid?.unitPrice || line.estimatedUnitPrice || "0",
      totalAmount: bid?.lineTotal || "0",
    });
  }

  return po[0];
}

// ============ Shipment Functions ============

export async function createShipment(data: InsertShipment) {
  const d = await db();
  const count = await d.select({ count: sql<number>`count(*)` }).from(shipments);
  const num = (Number(count[0]?.count) || 0) + 1;
  const prefix = data.shipmentType === "inbound" ? "IN" : data.shipmentType === "outbound" ? "OUT" : "TRF";
  const shipmentNumber = `${prefix}-${new Date().getFullYear()}-${String(num).padStart(4, "0")}`;
  const result = await d.insert(shipments).values({ ...data, shipmentNumber }).returning();
  return result[0];
}

export async function getAllShipments() {
  const d = await db();
  return await d.select().from(shipments).where(eq(shipments.isArchived, false)).orderBy(desc(shipments.createdAt));
}

export async function getShipmentById(id: number) {
  const d = await db();
  const result = await d.select().from(shipments).where(eq(shipments.id, id));
  return result[0];
}

export async function updateShipment(id: number, data: Partial<InsertShipment>) {
  const d = await db();
  return await d.update(shipments).set({ ...data, updatedAt: new Date() }).where(eq(shipments.id, id)).returning();
}

export async function addShipmentLine(data: InsertShipmentLine) {
  const d = await db();
  return await d.insert(shipmentLines).values(data).returning();
}

export async function getShipmentLines(shipmentId: number) {
  const d = await db();
  return await d.select().from(shipmentLines).where(eq(shipmentLines.shipmentId, shipmentId));
}

export async function addShipmentTrackingEvent(data: InsertShipmentTrackingEvent) {
  const d = await db();
  return await d.insert(shipmentTracking).values(data).returning();
}

export async function getShipmentTrackingEvents(shipmentId: number) {
  const d = await db();
  return await d.select().from(shipmentTracking).where(eq(shipmentTracking.shipmentId, shipmentId)).orderBy(desc(shipmentTracking.eventTimestamp));
}

export async function updateShipmentStatus(id: number, status: string, userId?: number) {
  const d = await db();
  const updates: any = { status, updatedAt: new Date() };
  if (status === "delivered") {
    updates.actualDeliveryDate = new Date().toISOString().split("T")[0];
  }
  await d.update(shipments).set(updates).where(eq(shipments.id, id));

  await d.insert(shipmentTracking).values({
    shipmentId: id,
    trackingEvent: `Status changed to ${status.toUpperCase()}`,
    eventTimestamp: new Date(),
    eventDescription: `Shipment status updated to ${status}`,
    createdBy: userId,
  });

  return { success: true };
}

// ============ Supplier Risk Scoring ============

export async function calculateSupplierRiskScore(vendorId: number, userId?: number) {
  const d = await db();
  const vendor = await d.select().from(vendors).where(eq(vendors.id, vendorId));
  if (!vendor[0]) throw new Error("Vendor not found");

  const pos = await d.select().from(purchaseOrders).where(eq(purchaseOrders.vendorId, vendorId));
  const totalPOs = pos.length;

  const deliveredPOs = pos.filter((po) => po.status === "received" && po.receivedDate && po.expectedDeliveryDate);
  const onTimePOs = deliveredPOs.filter((po) => {
    const received = new Date(po.receivedDate!);
    const expected = new Date(po.expectedDeliveryDate!);
    return received <= expected;
  });
  const onTimeRate = deliveredPOs.length > 0 ? (onTimePOs.length / deliveredPOs.length) * 100 : 50;

  const vendorRating = parseFloat(vendor[0].rating || "3");
  const qualityScore = vendorRating * 20;

  const avgPrice = pos.reduce((sum, po) => sum + parseFloat(po.totalAmount || "0"), 0) / Math.max(totalPOs, 1);
  const priceCompetitiveness = avgPrice > 0 ? Math.min(100, Math.max(0, 100 - (avgPrice / 10000) * 10)) : 50;

  const responsiveness = totalPOs > 5 ? 80 : totalPOs > 2 ? 60 : 40;
  const complianceScore = vendor[0].status === "active" ? 90 : vendor[0].status === "inactive" ? 40 : 10;

  const riskScore = 100 - (
    onTimeRate * 0.35 +
    qualityScore * 0.25 +
    priceCompetitiveness * 0.15 +
    responsiveness * 0.15 +
    complianceScore * 0.10
  );

  const clampedScore = Math.max(0, Math.min(100, riskScore));
  const riskLevel = clampedScore < 25 ? "low" : clampedScore < 50 ? "medium" : clampedScore < 75 ? "high" : "critical";

  const result = await d
    .insert(supplierRiskScores)
    .values({
      vendorId,
      riskScore: clampedScore.toFixed(2),
      riskLevel: riskLevel as any,
      onTimeDeliveryRate: onTimeRate.toFixed(2),
      qualityScore: qualityScore.toFixed(2),
      priceCompetitiveness: priceCompetitiveness.toFixed(2),
      responsiveness: responsiveness.toFixed(2),
      complianceScore: complianceScore.toFixed(2),
      assessmentDate: new Date().toISOString().split("T")[0],
      assessedBy: userId,
    })
    .returning();

  await createScmAuditEntry("supplier_risk_score", result[0].id, "create", JSON.stringify(result[0]), userId);

  return result[0];
}

export async function getSupplierRiskScores(vendorId?: number) {
  const d = await db();
  if (vendorId) {
    return await d
      .select()
      .from(supplierRiskScores)
      .where(eq(supplierRiskScores.vendorId, vendorId))
      .orderBy(desc(supplierRiskScores.createdAt));
  }
  return await d.select().from(supplierRiskScores).orderBy(desc(supplierRiskScores.createdAt));
}

export async function getLatestRiskScoresForAllVendors() {
  const d = await db();
  const allVendors = await d.select().from(vendors).where(eq(vendors.isArchived, false));
  const results: Array<{ vendor: typeof allVendors[0]; latestScore: any }> = [];
  for (const vendor of allVendors) {
    const scores = await d
      .select()
      .from(supplierRiskScores)
      .where(eq(supplierRiskScores.vendorId, vendor.id))
      .orderBy(desc(supplierRiskScores.createdAt))
      .limit(1);
    results.push({
      vendor,
      latestScore: scores[0] || null,
    });
  }
  return results;
}

// ============ Inventory Lots ============

export async function createInventoryLot(data: InsertInventoryLot) {
  const d = await db();
  const result = await d.insert(inventoryLots).values(data).returning();
  return result[0];
}

export async function getInventoryLots(productId?: number, warehouseId?: number) {
  const d = await db();
  let query = d.select().from(inventoryLots);
  if (productId && warehouseId) {
    return await query.where(and(eq(inventoryLots.productId, productId), eq(inventoryLots.warehouseId, warehouseId)));
  } else if (productId) {
    return await query.where(eq(inventoryLots.productId, productId));
  }
  return await query.orderBy(desc(inventoryLots.createdAt));
}

// ============ SCM Audit Trail (Hash-based) ============

export async function createScmAuditEntry(
  entityType: string,
  entityId: number,
  action: string,
  dataSnapshot: string,
  performedBy?: number
) {
  const d = await db();
  const lastEntry = await d
    .select()
    .from(scmAuditTrail)
    .where(eq(scmAuditTrail.entityType, entityType))
    .orderBy(desc(scmAuditTrail.createdAt))
    .limit(1);

  const previousHash = lastEntry[0]?.dataHash || undefined;
  const dataHash = computeHash(dataSnapshot, previousHash);

  const result = await d
    .insert(scmAuditTrail)
    .values({
      entityType,
      entityId,
      action,
      dataSnapshot,
      dataHash,
      previousHash: previousHash || null,
      performedBy,
    })
    .returning();

  return result[0];
}

export async function getScmAuditTrail(entityType?: string, entityId?: number) {
  const d = await db();
  if (entityType && entityId) {
    return await d
      .select()
      .from(scmAuditTrail)
      .where(and(eq(scmAuditTrail.entityType, entityType), eq(scmAuditTrail.entityId, entityId)))
      .orderBy(desc(scmAuditTrail.createdAt));
  } else if (entityType) {
    return await d
      .select()
      .from(scmAuditTrail)
      .where(eq(scmAuditTrail.entityType, entityType))
      .orderBy(desc(scmAuditTrail.createdAt));
  }
  return await d.select().from(scmAuditTrail).orderBy(desc(scmAuditTrail.createdAt)).limit(100);
}

export async function verifyAuditChain(entityType: string) {
  const d = await db();
  const entries = await d
    .select()
    .from(scmAuditTrail)
    .where(eq(scmAuditTrail.entityType, entityType))
    .orderBy(asc(scmAuditTrail.createdAt));

  let valid = true;
  for (let i = 0; i < entries.length; i++) {
    const expected = computeHash(entries[i].dataSnapshot, entries[i].previousHash || undefined);
    if (expected !== entries[i].dataHash) {
      valid = false;
      break;
    }
  }
  return { valid, totalEntries: entries.length };
}

// ============ SCM Dashboard KPIs ============

export async function getSCMDashboardKPIs() {
  const d = await db();

  const rfqCount = await d.select({ count: sql<number>`count(*)` }).from(rfqs).where(eq(rfqs.isArchived, false));
  const openRfqs = await d
    .select({ count: sql<number>`count(*)` })
    .from(rfqs)
    .where(and(eq(rfqs.isArchived, false), sql`${rfqs.status} IN ('draft', 'sent', 'responses_received')`));

  const shipmentCount = await d.select({ count: sql<number>`count(*)` }).from(shipments).where(eq(shipments.isArchived, false));
  const inTransitShipments = await d
    .select({ count: sql<number>`count(*)` })
    .from(shipments)
    .where(and(eq(shipments.isArchived, false), sql`${shipments.status} IN ('shipped', 'in_transit')`));
  const deliveredShipments = await d
    .select({ count: sql<number>`count(*)` })
    .from(shipments)
    .where(and(eq(shipments.isArchived, false), eq(shipments.status, "delivered")));

  const highRiskVendors = await d
    .select({ count: sql<number>`count(DISTINCT ${supplierRiskScores.vendorId})` })
    .from(supplierRiskScores)
    .where(sql`${supplierRiskScores.riskLevel} IN ('high', 'critical')`);

  const lotCount = await d.select({ count: sql<number>`count(*)` }).from(inventoryLots);

  return {
    totalRFQs: Number(rfqCount[0]?.count) || 0,
    openRFQs: Number(openRfqs[0]?.count) || 0,
    totalShipments: Number(shipmentCount[0]?.count) || 0,
    inTransitShipments: Number(inTransitShipments[0]?.count) || 0,
    deliveredShipments: Number(deliveredShipments[0]?.count) || 0,
    highRiskVendors: Number(highRiskVendors[0]?.count) || 0,
    totalLots: Number(lotCount[0]?.count) || 0,
  };
}
