/**
 * Batch Implementation Guide for Adding Hyperlinks to All 22 Modules
 * 
 * This file provides the configuration and patterns for adding HyperlinkCellWithAnalytics
 * to all 22 modules. Each module entry specifies which fields should be hyperlinks.
 */

export interface ModuleHyperlinkConfig {
  moduleName: string;
  displayName: string;
  primaryField: string;
  hyperlinks: Array<{
    fieldName: string;
    displayName: string;
    type: "table" | "kanban" | "list";
    navigationModule?: string;
  }>;
}

/**
 * Complete hyperlink configuration for all 22 modules
 */
export const moduleHyperlinkConfigs: ModuleHyperlinkConfig[] = [
  // Operations Modules (5)
  {
    moduleName: "Sales",
    displayName: "Sales",
    primaryField: "orderName",
    hyperlinks: [
      { fieldName: "orderName", displayName: "Order Name", type: "table", navigationModule: "Sales" },
      { fieldName: "customerName", displayName: "Customer Name", type: "table", navigationModule: "Customers" },
      { fieldName: "productName", displayName: "Product Name", type: "table", navigationModule: "Products" },
      { fieldName: "projectName", displayName: "Project Name", type: "table", navigationModule: "Projects" },
    ],
  },
  {
    moduleName: "Products",
    displayName: "Products",
    primaryField: "productName",
    hyperlinks: [
      { fieldName: "productName", displayName: "Product Name", type: "table", navigationModule: "Products" },
      { fieldName: "categoryName", displayName: "Category Name", type: "table", navigationModule: "Products" },
      { fieldName: "supplierName", displayName: "Supplier Name", type: "table", navigationModule: "Customers" },
      { fieldName: "sku", displayName: "SKU", type: "table", navigationModule: "Products" },
    ],
  },
  {
    moduleName: "Customers",
    displayName: "Customers",
    primaryField: "customerName",
    hyperlinks: [
      { fieldName: "customerName", displayName: "Customer Name", type: "table", navigationModule: "Customers" },
      { fieldName: "contactName", displayName: "Contact Name", type: "table", navigationModule: "Customers" },
      { fieldName: "companyName", displayName: "Company Name", type: "table", navigationModule: "Customers" },
      { fieldName: "email", displayName: "Email", type: "table", navigationModule: "Customers" },
    ],
  },
  {
    moduleName: "Purchases",
    displayName: "Purchases",
    primaryField: "poNumber",
    hyperlinks: [
      { fieldName: "poNumber", displayName: "PO Number", type: "table", navigationModule: "Purchases" },
      { fieldName: "vendorName", displayName: "Vendor Name", type: "table", navigationModule: "Customers" },
      { fieldName: "productName", displayName: "Product Name", type: "table", navigationModule: "Products" },
      { fieldName: "reference", displayName: "Reference", type: "table", navigationModule: "Purchases" },
    ],
  },
  {
    moduleName: "Inventory",
    displayName: "Inventory",
    primaryField: "itemName",
    hyperlinks: [
      { fieldName: "itemName", displayName: "Item Name", type: "table", navigationModule: "Inventory" },
      { fieldName: "warehouseName", displayName: "Warehouse Name", type: "table", navigationModule: "Inventory" },
      { fieldName: "location", displayName: "Location", type: "table", navigationModule: "Inventory" },
      { fieldName: "sku", displayName: "SKU", type: "table", navigationModule: "Products" },
    ],
  },

  // Finance Modules (4)
  {
    moduleName: "Financial",
    displayName: "Financial",
    primaryField: "invoiceNumber",
    hyperlinks: [
      { fieldName: "invoiceNumber", displayName: "Invoice Number", type: "table", navigationModule: "Financial" },
      { fieldName: "accountName", displayName: "Account Name", type: "table", navigationModule: "Financial" },
      { fieldName: "vendorName", displayName: "Vendor Name", type: "table", navigationModule: "Customers" },
      { fieldName: "reference", displayName: "Reference", type: "table", navigationModule: "Financial" },
    ],
  },
  {
    moduleName: "Income & Expenditure",
    displayName: "Income & Expenditure",
    primaryField: "description",
    hyperlinks: [
      { fieldName: "description", displayName: "Description", type: "table", navigationModule: "Financial" },
      { fieldName: "accountName", displayName: "Account Name", type: "table", navigationModule: "Financial" },
      { fieldName: "categoryName", displayName: "Category Name", type: "table", navigationModule: "Financial" },
      { fieldName: "reference", displayName: "Reference", type: "table", navigationModule: "Financial" },
    ],
  },
  {
    moduleName: "Budget",
    displayName: "Budget",
    primaryField: "budgetName",
    hyperlinks: [
      { fieldName: "budgetName", displayName: "Budget Name", type: "table", navigationModule: "Budget" },
      { fieldName: "departmentName", displayName: "Department Name", type: "table", navigationModule: "HR" },
      { fieldName: "categoryName", displayName: "Category Name", type: "table", navigationModule: "Financial" },
      { fieldName: "code", displayName: "Code", type: "table", navigationModule: "Budget" },
    ],
  },
  {
    moduleName: "Tender/Quotation",
    displayName: "Tender/Quotation",
    primaryField: "tenderName",
    hyperlinks: [
      { fieldName: "tenderName", displayName: "Tender Name", type: "table", navigationModule: "Tender/Quotation" },
      { fieldName: "vendorName", displayName: "Vendor Name", type: "table", navigationModule: "Customers" },
      { fieldName: "itemName", displayName: "Item Name", type: "table", navigationModule: "Products" },
      { fieldName: "reference", displayName: "Reference", type: "table", navigationModule: "Tender/Quotation" },
    ],
  },

  // Business Modules (5)
  {
    moduleName: "Projects",
    displayName: "Projects",
    primaryField: "projectName",
    hyperlinks: [
      { fieldName: "projectName", displayName: "Project Name", type: "kanban", navigationModule: "Projects" },
      { fieldName: "customerName", displayName: "Customer Name", type: "kanban", navigationModule: "Customers" },
      { fieldName: "teamMemberName", displayName: "Team Member Name", type: "kanban", navigationModule: "HR" },
      { fieldName: "status", displayName: "Status", type: "kanban", navigationModule: "Projects" },
    ],
  },
  {
    moduleName: "CRM",
    displayName: "CRM",
    primaryField: "leadName",
    hyperlinks: [
      { fieldName: "leadName", displayName: "Lead Name", type: "table", navigationModule: "CRM" },
      { fieldName: "companyName", displayName: "Company Name", type: "table", navigationModule: "Customers" },
      { fieldName: "contactName", displayName: "Contact Name", type: "table", navigationModule: "Customers" },
      { fieldName: "activityDescription", displayName: "Activity Description", type: "table", navigationModule: "CRM" },
    ],
  },
  {
    moduleName: "Action Tracker",
    displayName: "Action Tracker",
    primaryField: "actionTitle",
    hyperlinks: [
      { fieldName: "actionTitle", displayName: "Action Title", type: "table", navigationModule: "Action Tracker" },
      { fieldName: "assigneeName", displayName: "Assignee Name", type: "table", navigationModule: "HR" },
      { fieldName: "projectName", displayName: "Project Name", type: "table", navigationModule: "Projects" },
      { fieldName: "status", displayName: "Status", type: "table", navigationModule: "Action Tracker" },
    ],
  },
  {
    moduleName: "HR",
    displayName: "HR",
    primaryField: "employeeName",
    hyperlinks: [
      { fieldName: "employeeName", displayName: "Employee Name", type: "table", navigationModule: "HR" },
      { fieldName: "departmentName", displayName: "Department Name", type: "table", navigationModule: "HR" },
      { fieldName: "positionName", displayName: "Position Name", type: "table", navigationModule: "HR" },
      { fieldName: "employeeId", displayName: "Employee ID", type: "table", navigationModule: "HR" },
    ],
  },
  {
    moduleName: "Reporting & Analytics",
    displayName: "Reporting & Analytics",
    primaryField: "reportName",
    hyperlinks: [
      { fieldName: "reportName", displayName: "Report Name", type: "table", navigationModule: "Reporting & Analytics" },
      { fieldName: "metricName", displayName: "Metric Name", type: "table", navigationModule: "Dashboard" },
      { fieldName: "templateName", displayName: "Template Name", type: "table", navigationModule: "Reporting & Analytics" },
      { fieldName: "dashboardName", displayName: "Dashboard Name", type: "table", navigationModule: "Dashboard" },
    ],
  },

  // Supporting Modules (8)
  {
    moduleName: "Dashboard",
    displayName: "Dashboard",
    primaryField: "widgetName",
    hyperlinks: [
      { fieldName: "widgetName", displayName: "Widget Name", type: "table", navigationModule: "Dashboard" },
      { fieldName: "metricName", displayName: "Metric Name", type: "table", navigationModule: "Dashboard" },
    ],
  },
  {
    moduleName: "Alerts Dashboard",
    displayName: "Alerts Dashboard",
    primaryField: "alertName",
    hyperlinks: [
      { fieldName: "alertName", displayName: "Alert Name", type: "table", navigationModule: "Alerts Dashboard" },
      { fieldName: "moduleName", displayName: "Module Name", type: "table", navigationModule: "Dashboard" },
    ],
  },
  {
    moduleName: "Workflow Execution",
    displayName: "Workflow Execution",
    primaryField: "workflowName",
    hyperlinks: [
      { fieldName: "workflowName", displayName: "Workflow Name", type: "table", navigationModule: "Workflow Execution" },
      { fieldName: "triggerName", displayName: "Trigger Name", type: "table", navigationModule: "Workflow Execution" },
    ],
  },
  {
    moduleName: "Admin Settings",
    displayName: "Admin Settings",
    primaryField: "configurationName",
    hyperlinks: [
      { fieldName: "configurationName", displayName: "Configuration Name", type: "table", navigationModule: "Admin Settings" },
    ],
  },
  {
    moduleName: "Reports Export",
    displayName: "Reports Export",
    primaryField: "reportName",
    hyperlinks: [
      { fieldName: "reportName", displayName: "Report Name", type: "table", navigationModule: "Reports Export" },
      { fieldName: "templateName", displayName: "Template Name", type: "table", navigationModule: "Reports Export" },
    ],
  },
  {
    moduleName: "DashboardCustomizable",
    displayName: "DashboardCustomizable",
    primaryField: "widgetName",
    hyperlinks: [
      { fieldName: "widgetName", displayName: "Widget Name", type: "table", navigationModule: "Dashboard" },
    ],
  },
  {
    moduleName: "Customizable Dashboard",
    displayName: "Customizable Dashboard",
    primaryField: "widgetName",
    hyperlinks: [
      { fieldName: "widgetName", displayName: "Widget Name", type: "table", navigationModule: "Dashboard" },
    ],
  },
  {
    moduleName: "HyperlinkAnalyticsDashboard",
    displayName: "Hyperlink Analytics",
    primaryField: "moduleName",
    hyperlinks: [
      { fieldName: "moduleName", displayName: "Module Name", type: "table", navigationModule: "Dashboard" },
    ],
  },
];

/**
 * Implementation pattern for table cells
 */
export const tableHyperlinkPattern = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

<table>
  <tbody>
    {items.map((item) => (
      <tr key={item.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={item.fieldName}
            onClick={() => { setEditingItem(item); setDialogOpen(true); }}
            moduleFrom="ModuleName"
            fieldName="Field Display Name"
            recordId={item.id}
            recordName={item.fieldName}
            size="sm"
          />
        </td>
        {/* Other columns */}
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * Implementation pattern for kanban cards
 */
export const kanbanHyperlinkPattern = `
import { HyperlinkCardCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

{items.map((item) => (
  <div key={item.id} className="kanban-card">
    <HyperlinkCardCellWithAnalytics
      label={item.projectName}
      onClick={() => { setEditingItem(item); setDialogOpen(true); }}
      moduleFrom="Projects"
      fieldName="Project Name"
      recordId={item.id}
      recordName={item.projectName}
      stopPropagation={true}
    />
    {/* Other content */}
  </div>
))}
`;

/**
 * Implementation pattern for list items
 */
export const listHyperlinkPattern = `
import { HyperlinkListItemWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

<ul>
  {items.map((item) => (
    <li key={item.id}>
      <HyperlinkListItemWithAnalytics
        label={item.leadName}
        onClick={() => { setEditingItem(item); setDialogOpen(true); }}
        moduleFrom="CRM"
        fieldName="Lead Name"
        recordId={item.id}
        recordName={item.leadName}
      />
    </li>
  ))}
</ul>
`;

/**
 * Get configuration for a specific module
 */
export function getModuleConfig(moduleName: string): ModuleHyperlinkConfig | undefined {
  return moduleHyperlinkConfigs.find((config) => config.moduleName === moduleName);
}

/**
 * Get all modules that need hyperlink implementation
 */
export function getAllModules(): string[] {
  return moduleHyperlinkConfigs.map((config) => config.moduleName);
}

/**
 * Get hyperlink fields for a specific module
 */
export function getModuleHyperlinks(moduleName: string) {
  const config = getModuleConfig(moduleName);
  return config?.hyperlinks || [];
}
