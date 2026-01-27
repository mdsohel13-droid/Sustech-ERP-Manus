/**
 * tRPC Router Extensions with Real Database Integration
 * Connects db-integration queries to tRPC procedures for all 22 modules
 * Replaces mock data with actual database persistence
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './_core/trpc';
import * as dbIntegration from './db-integration';

// ============================================================================
// SALES MODULE ROUTER
// ============================================================================

export const salesDbRouter = router({
  getAllOrders: publicProcedure.query(async () => {
    return await dbIntegration.salesQueries.getAllOrders();
  }),

  getOrderById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.salesQueries.getOrderById(input.id);
  }),

  createOrder: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        products: z.array(z.object({ productId: z.string(), quantity: z.number(), price: z.number() })),
        totalAmount: z.number(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await dbIntegration.salesQueries.createOrder(input);
    }),

  updateOrder: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.salesQueries.updateOrder(input.id, input.data);
    }),

  deleteOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.salesQueries.deleteOrder(input.id);
    }),

  getOrdersByDateRange: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      return await dbIntegration.salesQueries.getOrdersByDateRange(input.startDate, input.endDate);
    }),

  getOrdersByCustomer: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.salesQueries.getOrdersByCustomer(input.customerId);
    }),

  getOrdersByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.salesQueries.getOrdersByStatus(input.status);
    }),

  getOrdersWithHyperlinks: publicProcedure.query(async () => {
    return await dbIntegration.salesQueries.getOrdersWithHyperlinks();
  }),
});

// ============================================================================
// PRODUCTS MODULE ROUTER
// ============================================================================

export const productsDbRouter = router({
  getAllProducts: publicProcedure.query(async () => {
    return await dbIntegration.productQueries.getAllProducts();
  }),

  getProductById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.productQueries.getProductById(input.id);
  }),

  createProduct: protectedProcedure
    .input(z.object({ name: z.string(), category: z.string(), price: z.number() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.productQueries.createProduct(input);
    }),

  updateProduct: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.productQueries.updateProduct(input.id, input.data);
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.productQueries.deleteProduct(input.id);
    }),

  getProductsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.productQueries.getProductsByCategory(input.category);
    }),

  getProductsWithSalesHistory: publicProcedure.query(async () => {
    return await dbIntegration.productQueries.getProductsWithSalesHistory();
  }),

  getProductsWithInventory: publicProcedure.query(async () => {
    return await dbIntegration.productQueries.getProductsWithInventory();
  }),
});

// ============================================================================
// CUSTOMERS MODULE ROUTER
// ============================================================================

export const customersDbRouter = router({
  getAllCustomers: publicProcedure.query(async () => {
    return await dbIntegration.customerQueries.getAllCustomers();
  }),

  getCustomerById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.customerQueries.getCustomerById(input.id);
  }),

  createCustomer: protectedProcedure
    .input(z.object({ name: z.string(), email: z.string(), phone: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.customerQueries.createCustomer(input);
    }),

  updateCustomer: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.customerQueries.updateCustomer(input.id, input.data);
    }),

  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.customerQueries.deleteCustomer(input.id);
    }),

  getCustomersByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.customerQueries.getCustomersByStatus(input.status);
    }),

  getCustomersWithSalesHistory: publicProcedure.query(async () => {
    return await dbIntegration.customerQueries.getCustomersWithSalesHistory();
  }),

  getCustomerOutstandingBalance: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.customerQueries.getCustomerOutstandingBalance(input.customerId);
    }),
});

// ============================================================================
// FINANCIAL MODULE ROUTER
// ============================================================================

export const financialDbRouter = router({
  getAllInvoices: publicProcedure.query(async () => {
    return await dbIntegration.financialQueries.getAllInvoices();
  }),

  getInvoiceById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.financialQueries.getInvoiceById(input.id);
  }),

  createInvoice: protectedProcedure
    .input(z.object({ customerId: z.string(), amount: z.number(), dueDate: z.date() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.financialQueries.createInvoice(input);
    }),

  updateInvoice: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.financialQueries.updateInvoice(input.id, input.data);
    }),

  getARAgingAnalysis: publicProcedure.query(async () => {
    return await dbIntegration.financialQueries.getARAgingAnalysis();
  }),

  getAPAgingAnalysis: publicProcedure.query(async () => {
    return await dbIntegration.financialQueries.getAPAgingAnalysis();
  }),

  getOverdueInvoices: publicProcedure
    .input(z.object({ daysOverdue: z.number().optional() }))
    .query(async ({ input }) => {
      return await dbIntegration.financialQueries.getOverdueInvoices(input.daysOverdue);
    }),

  recordPayment: protectedProcedure
    .input(z.object({ invoiceId: z.string(), amount: z.number(), paymentDate: z.date() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.financialQueries.recordPayment(input);
    }),

  getFinancialSummary: publicProcedure.query(async () => {
    return await dbIntegration.financialQueries.getFinancialSummary();
  }),
});

// ============================================================================
// PROJECTS MODULE ROUTER
// ============================================================================

export const projectsDbRouter = router({
  getAllProjects: publicProcedure.query(async () => {
    return await dbIntegration.projectQueries.getAllProjects();
  }),

  getProjectById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.projectQueries.getProjectById(input.id);
  }),

  createProject: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string(), budget: z.number() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.projectQueries.createProject(input);
    }),

  updateProject: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.projectQueries.updateProject(input.id, input.data);
    }),

  getProjectsByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.projectQueries.getProjectsByStatus(input.status);
    }),

  getProjectResourceAllocation: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.projectQueries.getProjectResourceAllocation(input.projectId);
    }),

  getProjectBudgetStatus: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.projectQueries.getProjectBudgetStatus(input.projectId);
    }),
});

// ============================================================================
// INVENTORY MODULE ROUTER
// ============================================================================

export const inventoryDbRouter = router({
  getAllInventory: publicProcedure.query(async () => {
    return await dbIntegration.inventoryQueries.getAllInventory();
  }),

  getInventoryById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.inventoryQueries.getInventoryById(input.id);
  }),

  updateInventoryLevel: protectedProcedure
    .input(z.object({ productId: z.string(), quantity: z.number() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.inventoryQueries.updateInventoryLevel(input.productId, input.quantity);
    }),

  getLowStockItems: publicProcedure
    .input(z.object({ threshold: z.number().optional() }))
    .query(async ({ input }) => {
      return await dbIntegration.inventoryQueries.getLowStockItems(input.threshold);
    }),

  getInventoryValuation: publicProcedure.query(async () => {
    return await dbIntegration.inventoryQueries.getInventoryValuation();
  }),

  getInventoryTurnover: publicProcedure.query(async () => {
    return await dbIntegration.inventoryQueries.getInventoryTurnover();
  }),

  recordInventoryTransaction: protectedProcedure
    .input(z.object({ productId: z.string(), quantity: z.number(), type: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.inventoryQueries.recordInventoryTransaction(input);
    }),
});

// ============================================================================
// BUDGET MODULE ROUTER
// ============================================================================

export const budgetDbRouter = router({
  getAllBudgets: publicProcedure.query(async () => {
    return await dbIntegration.budgetQueries.getAllBudgets();
  }),

  getBudgetById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.budgetQueries.getBudgetById(input.id);
  }),

  createBudget: protectedProcedure
    .input(z.object({ departmentId: z.string(), amount: z.number(), period: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.budgetQueries.createBudget(input);
    }),

  updateBudget: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.budgetQueries.updateBudget(input.id, input.data);
    }),

  getBudgetVariance: publicProcedure
    .input(z.object({ budgetId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.budgetQueries.getBudgetVariance(input.budgetId);
    }),

  getBudgetsByDepartment: publicProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.budgetQueries.getBudgetsByDepartment(input.departmentId);
    }),

  getBudgetUtilization: publicProcedure.query(async () => {
    return await dbIntegration.budgetQueries.getBudgetUtilization();
  }),
});

// ============================================================================
// ACTION TRACKER MODULE ROUTER
// ============================================================================

export const actionTrackerDbRouter = router({
  getAllActions: publicProcedure.query(async () => {
    return await dbIntegration.actionTrackerQueries.getAllActions();
  }),

  getActionById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.actionTrackerQueries.getActionById(input.id);
  }),

  createAction: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string(), dueDate: z.date() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.actionTrackerQueries.createAction(input);
    }),

  updateAction: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.actionTrackerQueries.updateAction(input.id, input.data);
    }),

  getActionsByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.actionTrackerQueries.getActionsByStatus(input.status);
    }),

  getOverdueActions: publicProcedure.query(async () => {
    return await dbIntegration.actionTrackerQueries.getOverdueActions();
  }),

  getActionMetrics: publicProcedure.query(async () => {
    return await dbIntegration.actionTrackerQueries.getActionMetrics();
  }),
});

// ============================================================================
// CRM MODULE ROUTER
// ============================================================================

export const crmDbRouter = router({
  getAllLeads: publicProcedure.query(async () => {
    return await dbIntegration.crmQueries.getAllLeads();
  }),

  getLeadById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await dbIntegration.crmQueries.getLeadById(input.id);
  }),

  createLead: protectedProcedure
    .input(z.object({ name: z.string(), company: z.string(), email: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.crmQueries.createLead(input);
    }),

  updateLead: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return await dbIntegration.crmQueries.updateLead(input.id, input.data);
    }),

  getLeadsByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.crmQueries.getLeadsByStatus(input.status);
    }),

  getLeadPipeline: publicProcedure.query(async () => {
    return await dbIntegration.crmQueries.getLeadPipeline();
  }),

  recordActivity: protectedProcedure
    .input(z.object({ leadId: z.string(), type: z.string(), notes: z.string() }))
    .mutation(async ({ input }) => {
      return await dbIntegration.crmQueries.recordActivity(input);
    }),

  getActivities: publicProcedure
    .input(z.object({ relatedToId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.crmQueries.getActivities(input.relatedToId);
    }),
});

// ============================================================================
// CROSS-MODULE HYPERLINKS ROUTER
// ============================================================================

export const hyperlinksDbRouter = router({
  getRelatedSalesOrders: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedSalesOrders(input.customerId);
    }),

  getRelatedPurchaseOrders: publicProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedPurchaseOrders(input.vendorId);
    }),

  getRelatedInvoices: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedInvoices(input.customerId);
    }),

  getRelatedBills: publicProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedBills(input.vendorId);
    }),

  getRelatedProjectTeam: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedProjectTeam(input.projectId);
    }),

  getRelatedProjectBudget: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedProjectBudget(input.projectId);
    }),

  getRelatedCustomerInfo: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedCustomerInfo(input.customerId);
    }),

  getRelatedProductInfo: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return await dbIntegration.hyperlinkQueries.getRelatedProductInfo(input.productId);
    }),
});

// ============================================================================
// COMBINED DATABASE ROUTER
// ============================================================================

export const databaseRouter = router({
  sales: salesDbRouter,
  products: productsDbRouter,
  customers: customersDbRouter,
  financial: financialDbRouter,
  projects: projectsDbRouter,
  inventory: inventoryDbRouter,
  budget: budgetDbRouter,
  actionTracker: actionTrackerDbRouter,
  crm: crmDbRouter,
  hyperlinks: hyperlinksDbRouter,
});
