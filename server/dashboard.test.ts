import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
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

describe("dashboard.getOverview", () => {
  it("returns overview data structure with AR, AP, projects, and customers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getOverview();

    expect(result).toHaveProperty("ar");
    expect(result).toHaveProperty("ap");
    expect(result).toHaveProperty("projects");
    expect(result).toHaveProperty("customers");

    expect(result.ar).toHaveProperty("total");
    expect(result.ar).toHaveProperty("pending");
    expect(result.ar).toHaveProperty("overdue");

    expect(result.ap).toHaveProperty("total");
    expect(result.ap).toHaveProperty("pending");
    expect(result.ap).toHaveProperty("overdue");

    expect(Array.isArray(result.projects)).toBe(true);
    expect(Array.isArray(result.customers)).toBe(true);
  });
});

describe("dashboard.getInsights", () => {
  it("returns array of recent insights", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getInsights();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("financial AR/AP operations", () => {
  it("creates and retrieves AR entries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const createResult = await caller.financial.createAR({
      customerName: "Test Customer",
      amount: "1000.00",
      dueDate: "2026-02-01",
      invoiceNumber: "INV-001",
      notes: "Test AR entry",
    });

    expect(createResult).toHaveProperty("success", true);

    const arList = await caller.financial.getAllAR();
    expect(Array.isArray(arList)).toBe(true);
  });

  it("creates and retrieves AP entries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const createResult = await caller.financial.createAP({
      vendorName: "Test Vendor",
      amount: "500.00",
      dueDate: "2026-02-15",
      invoiceNumber: "BILL-001",
      notes: "Test AP entry",
    });

    expect(createResult).toHaveProperty("success", true);

    const apList = await caller.financial.getAllAP();
    expect(Array.isArray(apList)).toBe(true);
  });
});

describe("project operations", () => {
  it("creates and retrieves projects", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const createResult = await caller.projects.create({
      name: "Test Solar Project",
      customerName: "ABC Corp",
      value: "50000.00",
      description: "Solar panel installation",
      expectedCloseDate: "2026-03-01",
      priority: "high",
    });

    expect(createResult).toHaveProperty("success", true);

    const projects = await caller.projects.getAll();
    expect(Array.isArray(projects)).toBe(true);
  });

  it("retrieves project statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.projects.getStats();
    expect(Array.isArray(stats)).toBe(true);
  });
});

describe("customer operations", () => {
  it("creates and retrieves customers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const createResult = await caller.customers.create({
      name: "Test Customer Inc",
      email: "contact@testcustomer.com",
      phone: "+1234567890",
      company: "Test Company",
      status: "hot",
      notes: "High priority lead",
    });

    expect(createResult).toHaveProperty("success", true);

    const customers = await caller.customers.getAll();
    expect(Array.isArray(customers)).toBe(true);
  });

  it("retrieves customer statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.customers.getStats();
    expect(Array.isArray(stats)).toBe(true);
  });
});
