import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "admin" | "manager" | "viewer" | "user" = "admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("User Management (Admin Only)", () => {
  it("allows admin to get all users", async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const users = await caller.users.getAll();
    expect(Array.isArray(users)).toBe(true);
  });

  it("prevents non-admin from accessing user list", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.getAll()).rejects.toThrow("Admin access required");
  });

  it("prevents non-admin from updating user roles", async () => {
    const { ctx } = createMockContext("manager");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateRole({ userId: 2, role: "admin" })
    ).rejects.toThrow("Admin access required");
  });

  it("prevents user from deleting their own account", async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.delete({ userId: 1 })
    ).rejects.toThrow("Cannot delete your own account");
  });
});

describe("Sales Tracking", () => {
  it("creates a sales product successfully", async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sales.createProduct({
      name: "Test Product",
      category: "solar_pv",
      unit: "kW",
      targetPrice: "1000",
    });

    expect(result.success).toBe(true);
  });

  it("retrieves all sales products", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const products = await caller.sales.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it("creates sales tracking entry with valid data", async () => {
    const { ctx } = createMockContext("manager");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sales.createTracking({
      productId: 1,
      weekStartDate: new Date().toISOString(),
      weekEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target: "100",
      actual: "85",
    });

    expect(result.success).toBe(true);
  });

  it("retrieves sales performance summary", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.sales.getPerformanceSummary();
    expect(Array.isArray(summary)).toBe(true);
  });
});

describe("Dashboard Overview", () => {
  it("returns comprehensive dashboard overview", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const overview = await caller.dashboard.getOverview();
    
    expect(overview).toHaveProperty("ar");
    expect(overview).toHaveProperty("ap");
    expect(overview).toHaveProperty("projects");
    expect(overview).toHaveProperty("customers");
  });

  it("calculates AR summary correctly", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const arSummary = await caller.financial.getARSummary();
    
    expect(arSummary).toHaveProperty("total");
    expect(arSummary).toHaveProperty("pending");
    expect(arSummary).toHaveProperty("overdue");
    expect(typeof arSummary.total).toBe("string");
  });
});

describe("AI Insights Generation", () => {
  it("generates insights from dashboard data", { timeout: 15000 }, async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.insights.generate();
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("retrieves stored insights", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const insights = await caller.dashboard.getInsights();
    expect(Array.isArray(insights)).toBe(true);
  });
});

describe("Role-Based Access Control", () => {
  it("allows manager to create financial entries", async () => {
    const { ctx } = createMockContext("manager");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.createAR({
      customerName: "Test Customer",
      amount: "5000",
      dueDate: new Date().toISOString(),
      invoiceNumber: "INV-001",
      notes: "Test entry",
    });

    expect(result.success).toBe(true);
  });

  it("allows viewer to read financial data", async () => {
    const { ctx } = createMockContext("viewer");
    const caller = appRouter.createCaller(ctx);

    const arList = await caller.financial.getAllAR();
    expect(Array.isArray(arList)).toBe(true);
  });

  it("allows all authenticated users to view dashboard", async () => {
    const roles: Array<"admin" | "manager" | "viewer" | "user"> = ["admin", "manager", "viewer", "user"];
    
    for (const role of roles) {
      const { ctx } = createMockContext(role);
      const caller = appRouter.createCaller(ctx);
      
      const overview = await caller.dashboard.getOverview();
      expect(overview).toBeDefined();
    }
  });
});
