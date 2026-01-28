import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import * as db from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export const managerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['admin', 'manager'].includes(ctx.user.role)) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Manager or admin access required" 
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

function getClientInfo(ctx: TrpcContext): { ipAddress?: string; userAgent?: string } {
  const req = ctx.req;
  if (!req) return {};
  
  const ipAddress = 
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress;
  
  const userAgent = req.headers["user-agent"] as string;
  
  return { ipAddress, userAgent };
}

export function createAuditedProcedure(options: {
  action: "create" | "update" | "delete" | "view" | "export";
  module: string;
  entityType: string;
  getEntityId: (input: any, result?: any) => string;
  getEntityName?: (input: any, result?: any) => string;
}) {
  return protectedProcedure.use(async ({ ctx, next, input }) => {
    const { ipAddress, userAgent } = getClientInfo(ctx);
    const startTime = Date.now();
    
    try {
      const result = await next();
      
      const entityId = options.getEntityId(input, result);
      const entityName = options.getEntityName?.(input, result);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: options.action,
        module: options.module,
        entityType: options.entityType,
        entityId: String(entityId),
        entityName,
        newValues: options.action === "create" ? JSON.stringify(input) : undefined,
        ipAddress,
        userAgent,
        status: "success",
      });
      
      return result;
    } catch (error) {
      await db.createAuditLog({
        userId: ctx.user.id,
        action: options.action,
        module: options.module,
        entityType: options.entityType,
        entityId: options.getEntityId(input) || "unknown",
        ipAddress,
        userAgent,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });
}
