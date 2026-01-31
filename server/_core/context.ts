import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";
import { parse as parseCookie } from "cookie";

// Demo user object - static, not from database
const DEMO_USER: User = {
  id: -1,
  openId: "demo-admin-user",
  name: "Demo Admin",
  email: "demo@sustech.com",
  role: "admin",
  loginMethod: "demo",
  passwordHash: null,
  mustChangePassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  isDemoMode: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let isDemoMode = false;

  const cookies = parseCookie(opts.req.headers.cookie || "");
  
  // Check for password-based login cookie
  const userId = cookies["erp-user-id"];
  if (userId) {
    user = await db.getUserById(parseInt(userId)) ?? null;
    if (user) {
      return { req: opts.req, res: opts.res, user, isDemoMode: false };
    }
  }

  // Check for demo mode cookie - use static demo user, no database access
  if (cookies["erp-demo-mode"] === "true") {
    return { req: opts.req, res: opts.res, user: DEMO_USER, isDemoMode: true };
  }

  // Also check for X-Demo-Mode header for API testing
  const demoHeader = opts.req.headers["x-demo-mode"];
  if (demoHeader === "true") {
    return { req: opts.req, res: opts.res, user: DEMO_USER, isDemoMode: true };
  }

  // Check for demo query parameter as fallback (for browsers blocking cookies)
  const referer = opts.req.headers.referer || opts.req.url || "";
  if (referer.includes("demo=true") || referer.includes("demo_mode=true")) {
    opts.res.setHeader('Set-Cookie', 'erp-demo-mode=true; Path=/; Max-Age=86400; SameSite=Lax');
    return { req: opts.req, res: opts.res, user: DEMO_USER, isDemoMode: true };
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
    isDemoMode: false,
  };
}
