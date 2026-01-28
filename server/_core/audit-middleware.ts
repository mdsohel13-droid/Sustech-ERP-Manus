import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

export interface AuditLogEntry {
  userId: number;
  action: "create" | "update" | "delete" | "view" | "export";
  module: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldValues?: string;
  newValues?: string;
  changes?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
}

export async function createAuditLog(
  db: any,
  entry: AuditLogEntry
): Promise<void> {
  try {
    await db.createAuditLog(entry);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export function diffObjects(
  oldObj: Record<string, any> | null,
  newObj: Record<string, any>
): { changes: string[]; oldValues: Record<string, any>; newValues: Record<string, any> } {
  const changes: string[] = [];
  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj),
  ]);

  for (const key of allKeys) {
    if (key === "updatedAt" || key === "createdAt") continue;
    
    const oldVal = oldObj?.[key];
    const newVal = newObj[key];
    
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push(key);
      if (oldVal !== undefined) oldValues[key] = oldVal;
      if (newVal !== undefined) newValues[key] = newVal;
    }
  }

  return { changes, oldValues, newValues };
}

export function getClientInfo(ctx: TrpcContext): { ipAddress?: string; userAgent?: string } {
  const req = ctx.req;
  if (!req) return {};
  
  const ipAddress = 
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress;
  
  const userAgent = req.headers["user-agent"] as string;
  
  return { ipAddress, userAgent };
}

export type AuditedMutationOptions = {
  module: string;
  entityType: string;
  action: "create" | "update" | "delete";
  getEntityId: (input: any, result?: any) => string;
  getEntityName?: (input: any, result?: any) => string;
  getOldRecord?: (input: any, db: any) => Promise<Record<string, any> | null>;
};

export function createAuditWrapper(
  db: any,
  ctx: TrpcContext,
  options: AuditedMutationOptions
) {
  return async <T>(
    input: any,
    mutation: () => Promise<T>
  ): Promise<T> => {
    const { ipAddress, userAgent } = getClientInfo(ctx);
    let oldRecord: Record<string, any> | null = null;
    
    if (options.action === "update" || options.action === "delete") {
      if (options.getOldRecord) {
        oldRecord = await options.getOldRecord(input, db);
      }
    }

    try {
      const result = await mutation();
      
      const entityId = options.getEntityId(input, result);
      const entityName = options.getEntityName?.(input, result);
      
      let logEntry: AuditLogEntry = {
        userId: ctx.user!.id,
        action: options.action,
        module: options.module,
        entityType: options.entityType,
        entityId,
        entityName,
        ipAddress,
        userAgent,
        status: "success",
      };

      if (options.action === "create") {
        logEntry.newValues = JSON.stringify(input);
      } else if (options.action === "update" && oldRecord) {
        const diff = diffObjects(oldRecord, input);
        logEntry.oldValues = JSON.stringify(diff.oldValues);
        logEntry.newValues = JSON.stringify(diff.newValues);
        logEntry.changes = diff.changes.join(", ");
      } else if (options.action === "delete" && oldRecord) {
        logEntry.oldValues = JSON.stringify(oldRecord);
      }

      await createAuditLog(db, logEntry);
      return result;
    } catch (error) {
      await createAuditLog(db, {
        userId: ctx.user!.id,
        action: options.action,
        module: options.module,
        entityType: options.entityType,
        entityId: options.getEntityId(input),
        ipAddress,
        userAgent,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}
