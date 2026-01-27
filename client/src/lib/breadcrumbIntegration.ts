/**
 * Breadcrumb Integration for All Modules
 * 
 * Add these hooks to the top of each module component to automatically
 * set up breadcrumbs for that module.
 */

import { usePageBreadcrumbs, MODULE_BREADCRUMBS } from "@/components/BreadcrumbNavigation";

// ============================================================================
// OPERATIONS MODULES (5)
// ============================================================================

/**
 * SALES MODULE - Add to SalesEnhanced.tsx
 */
export function useSalesBreadcrumbs() {
  usePageBreadcrumbs("Sales", []);
}

/**
 * PRODUCTS MODULE - Add to Products.tsx
 */
export function useProductsBreadcrumbs() {
  usePageBreadcrumbs("Products", []);
}

/**
 * CUSTOMERS MODULE - Add to Customers.tsx
 */
export function useCustomersBreadcrumbs() {
  usePageBreadcrumbs("Customers", []);
}

/**
 * PURCHASES MODULE - Add to Purchases.tsx
 */
export function usePurchasesBreadcrumbs() {
  usePageBreadcrumbs("Purchases", []);
}

/**
 * INVENTORY MODULE - Add to Inventory.tsx
 */
export function useInventoryBreadcrumbs() {
  usePageBreadcrumbs("Inventory", []);
}

// ============================================================================
// FINANCE MODULES (4)
// ============================================================================

/**
 * FINANCIAL MODULE - Add to Financial.tsx
 */
export function useFinancialBreadcrumbs() {
  usePageBreadcrumbs("Financial", []);
}

/**
 * INCOME & EXPENDITURE MODULE - Add to IncomeExpenditure.tsx
 */
export function useIncomeExpenditureBreadcrumbs() {
  usePageBreadcrumbs("Income & Expenditure", []);
}

/**
 * BUDGET MODULE - Add to Budget.tsx (if exists)
 */
export function useBudgetBreadcrumbs() {
  usePageBreadcrumbs("Budget", []);
}

/**
 * TENDER/QUOTATION MODULE - Add to TenderQuotation.tsx
 */
export function useTenderQuotationBreadcrumbs() {
  usePageBreadcrumbs("Tender/Quotation", []);
}

// ============================================================================
// BUSINESS MODULES (5)
// ============================================================================

/**
 * PROJECTS MODULE - Add to Projects.tsx
 */
export function useProjectsBreadcrumbs() {
  usePageBreadcrumbs("Projects", []);
}

/**
 * CRM MODULE - Add to CRM.tsx (if exists)
 */
export function useCRMBreadcrumbs() {
  usePageBreadcrumbs("CRM", []);
}

/**
 * ACTION TRACKER MODULE - Add to ActionTracker.tsx
 */
export function useActionTrackerBreadcrumbs() {
  usePageBreadcrumbs("Action Tracker", []);
}

/**
 * HR MODULE - Add to HumanResource.tsx
 */
export function useHRBreadcrumbs() {
  usePageBreadcrumbs("Human Resource", []);
}

/**
 * REPORTING & ANALYTICS MODULE - Add to Reports.tsx
 */
export function useReportingBreadcrumbs() {
  usePageBreadcrumbs("Reports", []);
}

// ============================================================================
// SUPPORTING MODULES (8)
// ============================================================================

/**
 * DASHBOARD MODULE - Add to Home.tsx
 */
export function useDashboardBreadcrumbs() {
  usePageBreadcrumbs("Home", []);
}

/**
 * ALERTS DASHBOARD - Add to AlertsDashboard.tsx
 */
export function useAlertsDashboardBreadcrumbs() {
  usePageBreadcrumbs("Alerts Dashboard", []);
}

/**
 * WORKFLOW EXECUTION DASHBOARD - Add to WorkflowExecutionDashboard.tsx
 */
export function useWorkflowExecutionBreadcrumbs() {
  usePageBreadcrumbs("Workflow Execution", []);
}

/**
 * ADMIN SETTINGS - Add to AdminSettings.tsx (if exists)
 */
export function useAdminSettingsBreadcrumbs() {
  usePageBreadcrumbs("Admin Settings", []);
}

/**
 * REPORTS EXPORT - Add to ReportsExport.tsx
 */
export function useReportsExportBreadcrumbs() {
  usePageBreadcrumbs("Reports Export", []);
}

/**
 * CUSTOMIZABLE DASHBOARD - Add to DashboardCustomizable.tsx
 */
export function useCustomizableDashboardBreadcrumbs() {
  usePageBreadcrumbs("Customizable Dashboard", []);
}

/**
 * HYPERLINK ANALYTICS - Add to HyperlinkAnalyticsDashboard.tsx
 */
export function useHyperlinkAnalyticsBreadcrumbs() {
  usePageBreadcrumbs("Hyperlink Analytics", []);
}

/**
 * SETTINGS - Add to Settings.tsx
 */
export function useSettingsBreadcrumbs() {
  usePageBreadcrumbs("Settings", []);
}

// ============================================================================
// IMPLEMENTATION PATTERNS
// ============================================================================

/**
 * Pattern 1: Simple page-level breadcrumb
 * Add this to the top of your module component:
 * 
 * export function SalesEnhanced() {
 *   useSalesBreadcrumbs();
 *   // ... rest of component
 * }
 */

/**
 * Pattern 2: Nested page breadcrumb with parent
 * Add this to a detail view component:
 * 
 * export function OrderDetailsDialog({ orderId }) {
 *   usePageBreadcrumbs(`Order #${orderId}`, [MODULE_BREADCRUMBS.sales]);
 *   // ... rest of component
 * }
 */

/**
 * Pattern 3: Manual breadcrumb management
 * For complex navigation scenarios:
 * 
 * import { useBreadcrumb } from "@/components/BreadcrumbNavigation";
 * 
 * export function ComplexModule() {
 *   const { setBreadcrumbs, addBreadcrumb } = useBreadcrumb();
 *   
 *   useEffect(() => {
 *     setBreadcrumbs([
 *       { label: "Home", path: "/" },
 *       { label: "Sales", path: "/sales" },
 *       { label: "Order #123", path: "/sales/order/123" },
 *     ]);
 *   }, [setBreadcrumbs]);
 *   
 *   // ... rest of component
 * }
 */

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

export const BREADCRUMB_IMPLEMENTATION_CHECKLIST = `
OPERATIONS MODULES:
- [ ] Add useSalesBreadcrumbs() to SalesEnhanced.tsx
- [ ] Add useProductsBreadcrumbs() to Products.tsx
- [ ] Add useCustomersBreadcrumbs() to Customers.tsx
- [ ] Add usePurchasesBreadcrumbs() to Purchases.tsx
- [ ] Add useInventoryBreadcrumbs() to Inventory.tsx

FINANCE MODULES:
- [ ] Add useFinancialBreadcrumbs() to Financial.tsx
- [ ] Add useIncomeExpenditureBreadcrumbs() to IncomeExpenditure.tsx
- [ ] Add useBudgetBreadcrumbs() to Budget.tsx
- [ ] Add useTenderQuotationBreadcrumbs() to TenderQuotation.tsx

BUSINESS MODULES:
- [ ] Add useProjectsBreadcrumbs() to Projects.tsx
- [ ] Add useCRMBreadcrumbs() to CRM.tsx
- [ ] Add useActionTrackerBreadcrumbs() to ActionTracker.tsx
- [ ] Add useHRBreadcrumbs() to HumanResource.tsx
- [ ] Add useReportingBreadcrumbs() to Reports.tsx

SUPPORTING MODULES:
- [ ] Add useDashboardBreadcrumbs() to Home.tsx
- [ ] Add useAlertsDashboardBreadcrumbs() to AlertsDashboard.tsx
- [ ] Add useWorkflowExecutionBreadcrumbs() to WorkflowExecutionDashboard.tsx
- [ ] Add useAdminSettingsBreadcrumbs() to AdminSettings.tsx
- [ ] Add useReportsExportBreadcrumbs() to ReportsExport.tsx
- [ ] Add useCustomizableDashboardBreadcrumbs() to DashboardCustomizable.tsx
- [ ] Add useHyperlinkAnalyticsBreadcrumbs() to HyperlinkAnalyticsDashboard.tsx
- [ ] Add useSettingsBreadcrumbs() to Settings.tsx

TOTAL: 23 modules to integrate
`;
