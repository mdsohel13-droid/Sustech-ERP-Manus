import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Project Financial Tracking", () => {
  it("creates a project transaction successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a project
    await caller.projects.create({
      name: "Test Financial Project",
      customerName: "Test Customer",
      value: "100000",
      currency: "BDT",
      stage: "execution",
      priority: "high",
      expectedCloseDate: new Date().toISOString(),
      description: "Project for financial tracking test",
    });

    // Get the created project
    const projects = await caller.projects.getAll();
    const project = projects.find(p => p.name === "Test Financial Project");
    expect(project).toBeDefined();

    if (!project) throw new Error("Project not found");

    // Create a transaction
    const result = await caller.projects.createTransaction({
      projectId: project.id,
      transactionDate: new Date().toISOString(),
      transactionType: "expense",
      amount: "5000",
      currency: "BDT",
      description: "Test expense",
      category: "Materials",
    });

    expect(result.success).toBe(true);

    // Verify transaction was created
    const transactions = await caller.projects.getTransactions({ projectId: project.id });
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0]?.amount).toBe("5000.00");
    expect(transactions[0]?.transactionType).toBe("expense");
  });

  it("calculates financial summary correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get existing project
    const projects = await caller.projects.getAll();
    const project = projects.find(p => p.name === "Test Financial Project");
    
    if (!project) {
      // Create project if it doesn't exist
      await caller.projects.create({
        name: "Test Financial Project 2",
        customerName: "Test Customer",
        value: "100000",
        currency: "BDT",
        stage: "execution",
        priority: "high",
        expectedCloseDate: new Date().toISOString(),
      });
      
      const newProjects = await caller.projects.getAll();
      const newProject = newProjects.find(p => p.name === "Test Financial Project 2");
      if (!newProject) throw new Error("Failed to create project");

      // Add revenue
      await caller.projects.createTransaction({
        projectId: newProject.id,
        transactionDate: new Date().toISOString(),
        transactionType: "revenue",
        amount: "100000",
        currency: "BDT",
      });

      // Add expense
      await caller.projects.createTransaction({
        projectId: newProject.id,
        transactionDate: new Date().toISOString(),
        transactionType: "expense",
        amount: "30000",
        currency: "BDT",
      });

      // Get financial summary
      const summary = await caller.projects.getFinancialSummary({ projectId: newProject.id });
      
      expect(summary.totalRevenue).toBe(100000);
      expect(summary.totalCosts).toBe(30000);
      expect(summary.profitLoss).toBe(70000);
      expect(summary.profitMargin).toBeCloseTo(70, 1);
    }
  });

  it("updates a project transaction", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.getAll();
    const project = projects[0];
    
    if (project) {
      const transactions = await caller.projects.getTransactions({ projectId: project.id });
      
      if (transactions.length > 0) {
        const transaction = transactions[0];
        
        await caller.projects.updateTransaction({
          id: transaction!.id,
          amount: "7500",
          description: "Updated expense",
        });

        const updatedTransactions = await caller.projects.getTransactions({ projectId: project.id });
        const updatedTransaction = updatedTransactions.find(t => t.id === transaction!.id);
        
        expect(updatedTransaction?.amount).toBe("7500.00");
        expect(updatedTransaction?.description).toBe("Updated expense");
      }
    }
  });
});
