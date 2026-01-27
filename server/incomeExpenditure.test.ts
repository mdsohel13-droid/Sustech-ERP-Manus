import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Income & Expenditure Module", () => {
  let testUserId: number;
  let testIncomeId: number;
  let testExpenditureId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-income-exp-user",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    });

    const users = await db.getAllUsers();
    const testUser = users.find((u) => u.openId === "test-income-exp-user");
    if (!testUser) throw new Error("Test user not created");
    testUserId = testUser.id;
  });

  it("should create income entry", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const result = await caller.incomeExpenditure.create({
      date: "2026-01-15",
      type: "income",
      category: "sales_product",
      subcategory: "Solar Panels",
      amount: "50000",
      currency: "BDT",
      description: "Sale of 10 solar panels",
      referenceNumber: "INV-2026-001",
      paymentMethod: "bank_transfer",
    });

    expect(result.success).toBe(true);

    // Verify it was created
    const allEntries = await caller.incomeExpenditure.getAll();
    const incomeEntry = allEntries.find(
      (e) => e.type === "income" && e.referenceNumber === "INV-2026-001"
    );
    expect(incomeEntry).toBeDefined();
    expect(incomeEntry?.category).toBe("sales_product");
    expect(Number(incomeEntry?.amount)).toBe(50000);
    
    testIncomeId = incomeEntry!.id;
  });

  it("should create expenditure entry", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const result = await caller.incomeExpenditure.create({
      date: "2026-01-16",
      type: "expenditure",
      category: "salary",
      subcategory: "Engineering Team",
      amount: "30000",
      currency: "BDT",
      description: "Monthly salaries for January",
      referenceNumber: "PAY-2026-001",
      paymentMethod: "bank_transfer",
    });

    expect(result.success).toBe(true);

    // Verify it was created
    const allEntries = await caller.incomeExpenditure.getAll();
    const expenditureEntry = allEntries.find(
      (e) => e.type === "expenditure" && e.referenceNumber === "PAY-2026-001"
    );
    expect(expenditureEntry).toBeDefined();
    expect(expenditureEntry?.category).toBe("salary");
    expect(Number(expenditureEntry?.amount)).toBe(30000);
    
    testExpenditureId = expenditureEntry!.id;
  });

  it("should calculate summary correctly", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const summary = await caller.incomeExpenditure.getSummary();

    expect(summary).toBeDefined();
    expect(Number(summary.totalIncome)).toBeGreaterThanOrEqual(50000);
    expect(Number(summary.totalExpenditure)).toBeGreaterThanOrEqual(30000);
    expect(Number(summary.netPosition)).toBe(
      Number(summary.totalIncome) - Number(summary.totalExpenditure)
    );
  });

  it("should get income by category", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const incomeByCategory = await caller.incomeExpenditure.getIncomeByCategory();

    expect(incomeByCategory).toBeDefined();
    expect(Array.isArray(incomeByCategory)).toBe(true);
    
    const salesProductCategory = incomeByCategory.find(
      (c) => c.category === "sales_product"
    );
    expect(salesProductCategory).toBeDefined();
    expect(Number(salesProductCategory?.total)).toBeGreaterThanOrEqual(50000);
  });

  it("should get expenditure by category", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const expenditureByCategory = await caller.incomeExpenditure.getExpenditureByCategory();

    expect(expenditureByCategory).toBeDefined();
    expect(Array.isArray(expenditureByCategory)).toBe(true);
    
    const salaryCategory = expenditureByCategory.find(
      (c) => c.category === "salary"
    );
    expect(salaryCategory).toBeDefined();
    expect(Number(salaryCategory?.total)).toBeGreaterThanOrEqual(30000);
  });

  it("should update income entry", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const result = await caller.incomeExpenditure.update({
      id: testIncomeId,
      amount: "55000",
      description: "Updated: Sale of 11 solar panels",
    });

    expect(result.success).toBe(true);

    // Verify update
    const allEntries = await caller.incomeExpenditure.getAll();
    const updatedEntry = allEntries.find((e) => e.id === testIncomeId);
    expect(updatedEntry).toBeDefined();
    expect(Number(updatedEntry?.amount)).toBe(55000);
    expect(updatedEntry?.description).toContain("Updated");
  });

  it("should delete expenditure entry", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    const result = await caller.incomeExpenditure.delete({
      id: testExpenditureId,
    });

    expect(result.success).toBe(true);

    // Verify deletion
    const allEntries = await caller.incomeExpenditure.getAll();
    const deletedEntry = allEntries.find((e) => e.id === testExpenditureId);
    expect(deletedEntry).toBeUndefined();
  });

  it("should handle multi-currency entries", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-income-exp-user", role: "admin" },
    });

    // Create USD income entry
    await caller.incomeExpenditure.create({
      date: "2026-01-17",
      type: "income",
      category: "consulting",
      amount: "1000",
      currency: "USD",
      description: "Consulting services in USD",
      referenceNumber: "INV-USD-001",
    });

    // Create EUR expenditure entry
    await caller.incomeExpenditure.create({
      date: "2026-01-18",
      type: "expenditure",
      category: "equipment",
      amount: "500",
      currency: "EUR",
      description: "Equipment purchase in EUR",
      referenceNumber: "PO-EUR-001",
    });

    const allEntries = await caller.incomeExpenditure.getAll();
    
    const usdEntry = allEntries.find((e) => e.currency === "USD");
    const eurEntry = allEntries.find((e) => e.currency === "EUR");
    
    expect(usdEntry).toBeDefined();
    expect(eurEntry).toBeDefined();
    expect(usdEntry?.currency).toBe("USD");
    expect(eurEntry?.currency).toBe("EUR");
  });
});
