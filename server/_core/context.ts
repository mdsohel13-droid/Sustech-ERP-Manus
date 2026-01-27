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

  const cookies = parseCookie(opts.req.headers.cookie || "");
  
  // Check for password-based login cookie
  const userId = cookies["erp-user-id"];
  if (userId) {
    user = await db.getUserById(parseInt(userId)) ?? null;
    if (user) {
      return { req: opts.req, res: opts.res, user };
    }
  }

  // Check for demo mode cookie (for development/testing)
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

  // Check for demo query parameter as fallback (for browsers blocking cookies)
  const referer = opts.req.headers.referer || opts.req.url || "";
  if (referer.includes("demo=true") || referer.includes("demo_mode=true")) {
    user = await db.getUserByOpenId("demo-admin-user") ?? null;
    if (user) {
      opts.res.setHeader('Set-Cookie', 'erp-demo-mode=true; Path=/; Max-Age=86400; SameSite=Lax');
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
