/**
 * Hyperlink Implementation Configuration for All 22 Modules
 * This file documents all hyperlink implementations across the ERP system
 */

export interface HyperlinkConfig {
  module: string;
  entries: {
    field: string;
    type: "name" | "id" | "description" | "code";
    action: "edit" | "view" | "navigate";
    context?: string;
  }[];
}

export const hyperlinkConfigurations: HyperlinkConfig[] = [
  // Operations Modules (5)
  {
    module: "Sales",
    entries: [
      { field: "Order Name", type: "name", action: "edit", context: "Open order details" },
      { field: "Customer Name", type: "name", action: "navigate", context: "Go to customer profile" },
      { field: "Product Name", type: "name", action: "navigate", context: "View product details" },
      { field: "Invoice Number", type: "id", action: "view", context: "View invoice" },
    ],
  },
  {
    module: "Products",
    entries: [
      { field: "Product Name", type: "name", action: "edit", context: "Edit product" },
      { field: "Category Name", type: "name", action: "navigate", context: "View category" },
      { field: "Supplier Name", type: "name", action: "navigate", context: "View supplier" },
      { field: "SKU", type: "code", action: "view", context: "View product by SKU" },
    ],
  },
  {
    module: "Customers",
    entries: [
      { field: "Customer Name", type: "name", action: "edit", context: "Edit customer" },
      { field: "Contact Name", type: "name", action: "navigate", context: "View contact" },
      { field: "Company Name", type: "name", action: "navigate", context: "View company" },
      { field: "Email", type: "id", action: "view", context: "View customer details" },
    ],
  },
  {
    module: "Purchases",
    entries: [
      { field: "PO Number", type: "id", action: "edit", context: "Edit purchase order" },
      { field: "Vendor Name", type: "name", action: "navigate", context: "View vendor" },
      { field: "Product Name", type: "name", action: "navigate", context: "View product" },
      { field: "Reference", type: "code", action: "view", context: "View reference" },
    ],
  },
  {
    module: "Inventory",
    entries: [
      { field: "Item Name", type: "name", action: "edit", context: "Edit inventory item" },
      { field: "Warehouse Name", type: "name", action: "navigate", context: "View warehouse" },
      { field: "Location", type: "name", action: "navigate", context: "View location" },
      { field: "SKU", type: "code", action: "view", context: "View by SKU" },
    ],
  },

  // Finance Modules (4)
  {
    module: "Financial",
    entries: [
      { field: "Invoice Number", type: "id", action: "edit", context: "Edit invoice" },
      { field: "Account Name", type: "name", action: "navigate", context: "View account" },
      { field: "Vendor Name", type: "name", action: "navigate", context: "View vendor" },
      { field: "Reference", type: "code", action: "view", context: "View reference" },
    ],
  },
  {
    module: "Income & Expenditure",
    entries: [
      { field: "Description", type: "description", action: "edit", context: "Edit transaction" },
      { field: "Account Name", type: "name", action: "navigate", context: "View account" },
      { field: "Category Name", type: "name", action: "navigate", context: "View category" },
      { field: "Reference", type: "code", action: "view", context: "View reference" },
    ],
  },
  {
    module: "Budget",
    entries: [
      { field: "Budget Name", type: "name", action: "edit", context: "Edit budget" },
      { field: "Department Name", type: "name", action: "navigate", context: "View department" },
      { field: "Category Name", type: "name", action: "navigate", context: "View category" },
      { field: "Code", type: "code", action: "view", context: "View by code" },
    ],
  },
  {
    module: "Tender/Quotation",
    entries: [
      { field: "Tender Name", type: "name", action: "edit", context: "Edit tender" },
      { field: "Vendor Name", type: "name", action: "navigate", context: "View vendor" },
      { field: "Item Name", type: "name", action: "navigate", context: "View item" },
      { field: "Reference", type: "code", action: "view", context: "View reference" },
    ],
  },

  // Business Modules (5)
  {
    module: "Projects",
    entries: [
      { field: "Project Name", type: "name", action: "edit", context: "Edit project" },
      { field: "Customer Name", type: "name", action: "navigate", context: "View customer" },
      { field: "Team Member Name", type: "name", action: "navigate", context: "View team member" },
      { field: "Status", type: "code", action: "view", context: "View by status" },
    ],
  },
  {
    module: "CRM",
    entries: [
      { field: "Lead Name", type: "name", action: "edit", context: "Edit lead" },
      { field: "Company Name", type: "name", action: "navigate", context: "View company" },
      { field: "Contact Name", type: "name", action: "navigate", context: "View contact" },
      { field: "Activity Description", type: "description", action: "view", context: "View activity" },
    ],
  },
  {
    module: "Action Tracker",
    entries: [
      { field: "Action Title", type: "name", action: "edit", context: "Edit action" },
      { field: "Assignee Name", type: "name", action: "navigate", context: "View assignee" },
      { field: "Project Name", type: "name", action: "navigate", context: "View project" },
      { field: "Status", type: "code", action: "view", context: "View by status" },
    ],
  },
  {
    module: "HR",
    entries: [
      { field: "Employee Name", type: "name", action: "edit", context: "Edit employee" },
      { field: "Department Name", type: "name", action: "navigate", context: "View department" },
      { field: "Position Name", type: "name", action: "navigate", context: "View position" },
      { field: "Employee ID", type: "id", action: "view", context: "View by ID" },
    ],
  },
  {
    module: "Reporting & Analytics",
    entries: [
      { field: "Report Name", type: "name", action: "edit", context: "Edit report" },
      { field: "Metric Name", type: "name", action: "navigate", context: "View metric" },
      { field: "Dashboard Name", type: "name", action: "navigate", context: "View dashboard" },
      { field: "Template", type: "code", action: "view", context: "View template" },
    ],
  },

  // Supporting Modules (8)
  {
    module: "Dashboard",
    entries: [
      { field: "Widget Title", type: "name", action: "edit", context: "Edit widget" },
      { field: "Metric Name", type: "name", action: "navigate", context: "View metric" },
    ],
  },
  {
    module: "Alerts Dashboard",
    entries: [
      { field: "Alert Name", type: "name", action: "view", context: "View alert details" },
      { field: "Module Name", type: "name", action: "navigate", context: "Go to module" },
    ],
  },
  {
    module: "Workflow Execution",
    entries: [
      { field: "Workflow Name", type: "name", action: "view", context: "View workflow" },
      { field: "Trigger Name", type: "name", action: "navigate", context: "View trigger" },
    ],
  },
  {
    module: "Admin Settings",
    entries: [
      { field: "Configuration Name", type: "name", action: "edit", context: "Edit configuration" },
    ],
  },
  {
    module: "Reports Export",
    entries: [
      { field: "Report Name", type: "name", action: "edit", context: "Edit report" },
      { field: "Template Name", type: "name", action: "navigate", context: "View template" },
    ],
  },
  {
    module: "DashboardCustomizable",
    entries: [
      { field: "Widget Name", type: "name", action: "edit", context: "Edit widget" },
    ],
  },
  {
    module: "Customizable Dashboard",
    entries: [
      { field: "Widget Name", type: "name", action: "edit", context: "Edit widget" },
    ],
  },
];

/**
 * Get hyperlink configuration for a specific module
 */
export function getModuleHyperlinkConfig(moduleName: string): HyperlinkConfig | undefined {
  return hyperlinkConfigurations.find(
    (config) => config.module.toLowerCase() === moduleName.toLowerCase()
  );
}

/**
 * Get all modules with hyperlink implementations
 */
export function getAllModulesWithHyperlinks(): string[] {
  return hyperlinkConfigurations.map((config) => config.module);
}

/**
 * Count total hyperlink entries across all modules
 */
export function getTotalHyperlinkCount(): number {
  return hyperlinkConfigurations.reduce((sum, config) => sum + config.entries.length, 0);
}

/**
 * Get hyperlink statistics
 */
export function getHyperlinkStatistics() {
  return {
    totalModules: hyperlinkConfigurations.length,
    totalEntries: getTotalHyperlinkCount(),
    moduleBreakdown: hyperlinkConfigurations.map((config) => ({
      module: config.module,
      entries: config.entries.length,
    })),
  };
}
