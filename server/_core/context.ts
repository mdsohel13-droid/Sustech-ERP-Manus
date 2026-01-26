import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";
import { parse as parseCookie } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Check for demo mode cookie first (for development/testing)
  const cookies = parseCookie(opts.req.headers.cookie || "");
  if (cookies["erp-demo-mode"] === "true") {
    user = await db.getUserByOpenId("demo-admin-user") ?? null;
    if (user) {
      return { req: opts.req, res: opts.res, user };
    }
  }

  // Also check for X-Demo-Mode header for API testing
  const demoHeader = opts.req.headers["x-demo-mode"];
  if (demoHeader === "true") {
    user = await db.getUserByOpenId("demo-admin-user") ?? null;
    if (user) {
      return { req: opts.req, res: opts.res, user };
    }
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
