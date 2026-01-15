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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Enhanced Sales Module", () => {
  describe("Daily Sales", () => {
    it("creates a daily sale record", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.salesEnhanced.createDailySale({
        date: "2026-01-15",
        productId: 1,
        productName: "Atomberg Fan",
        quantity: "10",
        unitPrice: "2500",
        totalAmount: "25000",
        salespersonId: 1,
        salespersonName: "John Doe",
        customerName: "ABC Corporation",
        notes: "Bulk order",
      });

      expect(result).toEqual({ success: true });
    });

    it("retrieves daily sales within date range", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const sales = await caller.salesEnhanced.getDailySales({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });

      expect(Array.isArray(sales)).toBe(true);
    });
  });

  describe("Weekly Targets", () => {
    it("creates a weekly target", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.salesEnhanced.createWeeklyTarget({
        weekStartDate: "2026-01-13",
        weekEndDate: "2026-01-19",
        productId: 1,
        productName: "Atomberg Fan",
        targetAmount: "100000",
        salespersonId: 1,
      });

      expect(result).toEqual({ success: true });
    });

    it("retrieves all weekly targets", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const targets = await caller.salesEnhanced.getWeeklyTargets();

      expect(Array.isArray(targets)).toBe(true);
    });
  });

  describe("Monthly Targets", () => {
    it("creates a monthly target", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.salesEnhanced.createMonthlyTarget({
        month: 1,
        year: 2026,
        productId: 1,
        productName: "Atomberg Fan",
        targetAmount: "500000",
        salespersonId: 1,
      });

      expect(result).toEqual({ success: true });
    });

    it("retrieves all monthly targets", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const targets = await caller.salesEnhanced.getMonthlyTargets();

      expect(Array.isArray(targets)).toBe(true);
    });
  });

  describe("Salespeople Management", () => {
    it("creates a salesperson", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.salesEnhanced.createSalesperson({
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+8801712345678",
      });

      expect(result).toEqual({ success: true });
    });

    it("retrieves all salespeople", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const salespeople = await caller.salesEnhanced.getSalespeople();

      expect(Array.isArray(salespeople)).toBe(true);
    });
  });
});
