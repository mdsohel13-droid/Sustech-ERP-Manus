import { sql, eq } from "drizzle-orm";
import { getDb } from "./db";
import { auditLogs } from "../drizzle/schema";

export interface AuditLogEntry {
  userId: number;
  action: "create" | "update" | "delete" | "view" | "export";
  entityType: string;
  entityId: number;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  origin?: string;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available for audit logging");
    return;
  }

  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      module: entry.entityType,
      entityType: entry.entityType,
      entityId: String(entry.entityId),
      entityName: entry.origin || "unknown",
      oldValues: entry.previousData ? JSON.stringify(entry.previousData) : null,
      newValues: entry.newData ? JSON.stringify(entry.newData) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      status: "success",
    });
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
  }
}

export interface ProtectedOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  blocked?: boolean;
}

export function isProductionDatabase(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  const dbEnv = process.env.DB_ENV || "";
  return dbUrl.includes("production") || 
         dbUrl.includes("prod") || 
         dbEnv === "production" ||
         process.env.REPLIT_DEPLOYMENT === "1";
}

export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
}

export function checkDataProtection(): { canProceed: boolean; reason?: string } {
  const isDev = isDevelopmentMode();
  const isProdDb = isProductionDatabase();
  
  if (isDev && isProdDb) {
    return { 
      canProceed: false, 
      reason: "Development environment cannot modify production database" 
    };
  }
  return { canProceed: true };
}

export function enforceDataProtection(operation: string): void {
  const protection = checkDataProtection();
  if (!protection.canProceed) {
    console.error(`[DATA PROTECTION] BLOCKED: ${operation} - ${protection.reason}`);
    throw new Error(`Data Protection: ${operation} blocked - ${protection.reason}`);
  }
}

export async function protectedDelete<T>(
  entityType: string,
  entityId: number,
  userId: number,
  fetchEntity: () => Promise<T | null>,
  performDelete: () => Promise<void>
): Promise<ProtectedOperationResult> {
  const protection = checkDataProtection();
  if (!protection.canProceed) {
    console.warn(`[Data Protection] Blocked delete of ${entityType}:${entityId} - ${protection.reason}`);
    return { success: false, blocked: true, error: protection.reason };
  }

  try {
    const existingData = await fetchEntity();
    if (!existingData) {
      return { success: false, error: `${entityType} not found` };
    }

    await createAuditLog({
      userId,
      action: "delete",
      entityType,
      entityId,
      previousData: existingData as Record<string, unknown>,
      origin: "api",
    });

    await performDelete();
    console.log(`[Data Protection] Successfully deleted ${entityType}:${entityId} by user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`[Data Protection] Delete failed for ${entityType}:${entityId}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function protectedSoftDelete<T>(
  entityType: string,
  entityId: number,
  userId: number,
  fetchEntity: () => Promise<T | null>,
  performArchive: () => Promise<void>
): Promise<ProtectedOperationResult> {
  const protection = checkDataProtection();
  if (!protection.canProceed) {
    console.warn(`[Data Protection] Blocked archive of ${entityType}:${entityId} - ${protection.reason}`);
    return { success: false, blocked: true, error: protection.reason };
  }

  try {
    const existingData = await fetchEntity();
    if (!existingData) {
      return { success: false, error: `${entityType} not found` };
    }

    await createAuditLog({
      userId,
      action: "update",
      entityType,
      entityId,
      previousData: existingData as Record<string, unknown>,
      newData: { isArchived: true, _operation: "soft_delete" },
      origin: "api",
    });

    await performArchive();
    console.log(`[Data Protection] Successfully archived ${entityType}:${entityId} by user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`[Data Protection] Archive failed for ${entityType}:${entityId}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function protectedUpdate<T>(
  entityType: string,
  entityId: number,
  userId: number,
  fetchEntity: () => Promise<T | null>,
  performUpdate: () => Promise<T>,
  updateData: Record<string, unknown>
): Promise<ProtectedOperationResult<T>> {
  const protection = checkDataProtection();
  if (!protection.canProceed) {
    console.warn(`[Data Protection] Blocked update of ${entityType}:${entityId} - ${protection.reason}`);
    return { success: false, blocked: true, error: protection.reason };
  }

  try {
    const existingData = await fetchEntity();
    if (!existingData) {
      return { success: false, error: `${entityType} not found` };
    }

    await createAuditLog({
      userId,
      action: "update",
      entityType,
      entityId,
      previousData: existingData as Record<string, unknown>,
      newData: updateData,
      origin: "api",
    });

    const result = await performUpdate();
    console.log(`[Data Protection] Successfully updated ${entityType}:${entityId} by user ${userId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[Data Protection] Update failed for ${entityType}:${entityId}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>
): Promise<T> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    return await operation(tx);
  });
}

export async function safeDelete(
  table: any,
  id: number,
  userId: number,
  entityType: string,
  getExisting: () => Promise<any>
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await getExisting();
    if (!existing) {
      return { success: false, error: "Record not found" };
    }

    await createAuditLog({
      userId,
      action: "delete",
      entityType,
      entityId: id,
      previousData: existing,
      origin: "api",
    });

    return { success: true };
  } catch (error) {
    console.error(`[SafeDelete] Failed to delete ${entityType}:`, error);
    return { success: false, error: String(error) };
  }
}

export function logDatabaseSafetyInfo(): void {
  const isProduction = isProductionDatabase();
  const isDev = isDevelopmentMode();
  console.log(`[DB Safety] Environment: ${isDev ? 'Development' : 'Production'}`);
  console.log(`[DB Safety] Database Type: ${isProduction ? 'PRODUCTION' : 'Development'}`);
  if (isDev && isProduction) {
    console.warn(`[DB Safety] WARNING: Development mode connected to production database!`);
  }
}

export interface DataIntegrityCheck {
  table: string;
  issue: string;
  severity: "warning" | "error";
  recommendation: string;
}

export async function runDataIntegrityChecks(): Promise<DataIntegrityCheck[]> {
  const issues: DataIntegrityCheck[] = [];
  return issues;
}
