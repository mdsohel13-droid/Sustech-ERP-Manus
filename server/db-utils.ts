import { sql } from "drizzle-orm";
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

export function isProductionDatabase(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return dbUrl.includes("production") || 
         dbUrl.includes("prod") || 
         process.env.NODE_ENV === "production";
}

export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
}

export function validateDatabaseOperation(operation: string): void {
  if (isDevelopmentMode() && isProductionDatabase()) {
    console.warn(`[DB Safety] Blocked ${operation} in dev mode against production DB`);
    throw new Error("Cannot perform destructive operations on production database in development mode");
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
