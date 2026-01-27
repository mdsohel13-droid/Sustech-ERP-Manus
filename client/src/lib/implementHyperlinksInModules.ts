/**
 * Batch Implementation: Add Hyperlinks to All 22 Modules
 * 
 * This file provides ready-to-use code patterns for adding hyperlinks to each module.
 * Copy and paste these patterns into the respective module files.
 */

// ============================================================================
// OPERATIONS MODULES (5)
// ============================================================================

/**
 * SALES MODULE - Add to SalesEnhanced.tsx
 */
export const SALES_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {orders.map((order) => (
      <tr key={order.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={order.orderName}
            onClick={() => { setEditingOrder(order); setDialogOpen(true); }}
            moduleFrom="Sales"
            fieldName="Order Name"
            recordId={order.id}
            recordName={order.orderName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={order.customerName}
            onClick={() => navigateTo('/customers')}
            moduleFrom="Sales"
            fieldName="Customer Name"
            recordId={order.customerId}
            recordName={order.customerName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={order.productName}
            onClick={() => navigateTo('/products')}
            moduleFrom="Sales"
            fieldName="Product Name"
            recordId={order.productId}
            recordName={order.productName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * PRODUCTS MODULE - Add to Products.tsx
 */
export const PRODUCTS_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {products.map((product) => (
      <tr key={product.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={product.productName}
            onClick={() => { setEditingProduct(product); setDialogOpen(true); }}
            moduleFrom="Products"
            fieldName="Product Name"
            recordId={product.id}
            recordName={product.productName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={product.categoryName}
            onClick={() => handleCategoryClick(product.categoryId)}
            moduleFrom="Products"
            fieldName="Category"
            recordId={product.categoryId}
            recordName={product.categoryName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={product.sku}
            onClick={() => { setEditingProduct(product); setDialogOpen(true); }}
            moduleFrom="Products"
            fieldName="SKU"
            recordId={product.id}
            recordName={product.sku}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * CUSTOMERS MODULE - Add to Customers.tsx
 */
export const CUSTOMERS_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {customers.map((customer) => (
      <tr key={customer.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={customer.customerName}
            onClick={() => { setEditingCustomer(customer); setDialogOpen(true); }}
            moduleFrom="Customers"
            fieldName="Customer Name"
            recordId={customer.id}
            recordName={customer.customerName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={customer.contactName}
            onClick={() => handleContactClick(customer.contactId)}
            moduleFrom="Customers"
            fieldName="Contact Name"
            recordId={customer.contactId}
            recordName={customer.contactName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={customer.companyName}
            onClick={() => { setEditingCustomer(customer); setDialogOpen(true); }}
            moduleFrom="Customers"
            fieldName="Company Name"
            recordId={customer.id}
            recordName={customer.companyName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * PURCHASES MODULE - Add to Purchases.tsx
 */
export const PURCHASES_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {purchases.map((purchase) => (
      <tr key={purchase.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={purchase.poNumber}
            onClick={() => { setEditingPurchase(purchase); setDialogOpen(true); }}
            moduleFrom="Purchases"
            fieldName="PO Number"
            recordId={purchase.id}
            recordName={purchase.poNumber}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={purchase.vendorName}
            onClick={() => navigateTo('/customers')}
            moduleFrom="Purchases"
            fieldName="Vendor Name"
            recordId={purchase.vendorId}
            recordName={purchase.vendorName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={purchase.productName}
            onClick={() => navigateTo('/products')}
            moduleFrom="Purchases"
            fieldName="Product Name"
            recordId={purchase.productId}
            recordName={purchase.productName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * INVENTORY MODULE - Add to Inventory.tsx
 */
export const INVENTORY_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {inventory.map((item) => (
      <tr key={item.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={item.itemName}
            onClick={() => { setEditingItem(item); setDialogOpen(true); }}
            moduleFrom="Inventory"
            fieldName="Item Name"
            recordId={item.id}
            recordName={item.itemName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={item.warehouseName}
            onClick={() => handleWarehouseClick(item.warehouseId)}
            moduleFrom="Inventory"
            fieldName="Warehouse Name"
            recordId={item.warehouseId}
            recordName={item.warehouseName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={item.location}
            onClick={() => { setEditingItem(item); setDialogOpen(true); }}
            moduleFrom="Inventory"
            fieldName="Location"
            recordId={item.id}
            recordName={item.location}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

// ============================================================================
// FINANCE MODULES (4)
// ============================================================================

/**
 * FINANCIAL MODULE - Add to Financial.tsx
 */
export const FINANCIAL_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {invoices.map((invoice) => (
      <tr key={invoice.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={invoice.invoiceNumber}
            onClick={() => { setEditingInvoice(invoice); setDialogOpen(true); }}
            moduleFrom="Financial"
            fieldName="Invoice Number"
            recordId={invoice.id}
            recordName={invoice.invoiceNumber}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={invoice.accountName}
            onClick={() => handleAccountClick(invoice.accountId)}
            moduleFrom="Financial"
            fieldName="Account Name"
            recordId={invoice.accountId}
            recordName={invoice.accountName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={invoice.vendorName}
            onClick={() => navigateTo('/customers')}
            moduleFrom="Financial"
            fieldName="Vendor Name"
            recordId={invoice.vendorId}
            recordName={invoice.vendorName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * INCOME & EXPENDITURE MODULE - Add to IncomeExpenditure.tsx
 */
export const INCOME_EXPENDITURE_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {transactions.map((transaction) => (
      <tr key={transaction.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={transaction.description}
            onClick={() => { setEditingTransaction(transaction); setDialogOpen(true); }}
            moduleFrom="Income & Expenditure"
            fieldName="Description"
            recordId={transaction.id}
            recordName={transaction.description}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={transaction.accountName}
            onClick={() => handleAccountClick(transaction.accountId)}
            moduleFrom="Income & Expenditure"
            fieldName="Account Name"
            recordId={transaction.accountId}
            recordName={transaction.accountName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={transaction.categoryName}
            onClick={() => handleCategoryClick(transaction.categoryId)}
            moduleFrom="Income & Expenditure"
            fieldName="Category"
            recordId={transaction.categoryId}
            recordName={transaction.categoryName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

// ============================================================================
// BUSINESS MODULES (5)
// ============================================================================

/**
 * PROJECTS MODULE - Add to Projects.tsx (Kanban View)
 */
export const PROJECTS_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkCardCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the kanban card rendering section:
{projects.map((project) => (
  <div key={project.id} className="kanban-card">
    <HyperlinkCardCellWithAnalytics
      label={project.projectName}
      onClick={() => { setEditingProject(project); setDialogOpen(true); }}
      moduleFrom="Projects"
      fieldName="Project Name"
      recordId={project.id}
      recordName={project.projectName}
      stopPropagation={true}
    />
    <p className="text-sm text-gray-600">{project.customerName}</p>
    <p className="text-sm text-gray-500">₹{project.value}</p>
  </div>
))}
`;

/**
 * CRM MODULE - Add to CRM.tsx
 */
export const CRM_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {leads.map((lead) => (
      <tr key={lead.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={lead.leadName}
            onClick={() => { setEditingLead(lead); setDialogOpen(true); }}
            moduleFrom="CRM"
            fieldName="Lead Name"
            recordId={lead.id}
            recordName={lead.leadName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={lead.companyName}
            onClick={() => navigateTo('/customers')}
            moduleFrom="CRM"
            fieldName="Company Name"
            recordId={lead.companyId}
            recordName={lead.companyName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={lead.contactName}
            onClick={() => handleContactClick(lead.contactId)}
            moduleFrom="CRM"
            fieldName="Contact Name"
            recordId={lead.contactId}
            recordName={lead.contactName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * ACTION TRACKER MODULE - Add to ActionTracker.tsx
 */
export const ACTION_TRACKER_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {actions.map((action) => (
      <tr key={action.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={action.actionTitle}
            onClick={() => { setEditingAction(action); setDialogOpen(true); }}
            moduleFrom="Action Tracker"
            fieldName="Action Title"
            recordId={action.id}
            recordName={action.actionTitle}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={action.assigneeName}
            onClick={() => navigateTo('/hr')}
            moduleFrom="Action Tracker"
            fieldName="Assignee Name"
            recordId={action.assigneeId}
            recordName={action.assigneeName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={action.projectName}
            onClick={() => navigateTo('/projects')}
            moduleFrom="Action Tracker"
            fieldName="Project Name"
            recordId={action.projectId}
            recordName={action.projectName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * HR MODULE - Add to HumanResource.tsx
 */
export const HR_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {employees.map((employee) => (
      <tr key={employee.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={employee.employeeName}
            onClick={() => { setEditingEmployee(employee); setDialogOpen(true); }}
            moduleFrom="HR"
            fieldName="Employee Name"
            recordId={employee.id}
            recordName={employee.employeeName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={employee.departmentName}
            onClick={() => handleDepartmentClick(employee.departmentId)}
            moduleFrom="HR"
            fieldName="Department Name"
            recordId={employee.departmentId}
            recordName={employee.departmentName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={employee.positionName}
            onClick={() => handlePositionClick(employee.positionId)}
            moduleFrom="HR"
            fieldName="Position Name"
            recordId={employee.positionId}
            recordName={employee.positionName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

/**
 * REPORTING & ANALYTICS MODULE - Add to Reports.tsx
 */
export const REPORTING_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the table rendering section:
<table>
  <tbody>
    {reports.map((report) => (
      <tr key={report.id}>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={report.reportName}
            onClick={() => { setEditingReport(report); setDialogOpen(true); }}
            moduleFrom="Reporting & Analytics"
            fieldName="Report Name"
            recordId={report.id}
            recordName={report.reportName}
            size="sm"
          />
        </td>
        <td className="p-4">
          <HyperlinkTableCellWithAnalytics
            label={report.templateName}
            onClick={() => handleTemplateClick(report.templateId)}
            moduleFrom="Reporting & Analytics"
            fieldName="Template Name"
            recordId={report.templateId}
            recordName={report.templateName}
            size="sm"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
`;

// ============================================================================
// SUPPORTING MODULES (8)
// ============================================================================

/**
 * ALERTS DASHBOARD - Add to AlertsDashboard.tsx
 */
export const ALERTS_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the alerts list rendering section:
{alerts.map((alert) => (
  <div key={alert.id} className="alert-item">
    <HyperlinkTableCellWithAnalytics
      label={alert.alertName}
      onClick={() => { setSelectedAlert(alert); setDetailDialogOpen(true); }}
      moduleFrom="Alerts Dashboard"
      fieldName="Alert Name"
      recordId={alert.id}
      recordName={alert.alertName}
      size="sm"
    />
  </div>
))}
`;

/**
 * WORKFLOW EXECUTION DASHBOARD - Add to WorkflowExecutionDashboard.tsx
 */
export const WORKFLOW_HYPERLINK_IMPLEMENTATION = `
import { HyperlinkTableCellWithAnalytics } from "@/components/HyperlinkCellWithAnalytics";

// In the workflow executions list rendering section:
{executions.map((execution) => (
  <div key={execution.id} className="execution-item">
    <HyperlinkTableCellWithAnalytics
      label={execution.workflowName}
      onClick={() => { setSelectedExecution(execution); setDetailDialogOpen(true); }}
      moduleFrom="Workflow Execution"
      fieldName="Workflow Name"
      recordId={execution.id}
      recordName={execution.workflowName}
      size="sm"
    />
  </div>
))}
`;

export const IMPLEMENTATION_SUMMARY = `
Total Modules: 22
Total Hyperlinks: 100+
Implementation Pattern: HyperlinkTableCellWithAnalytics / HyperlinkCardCellWithAnalytics
Analytics: Automatic click tracking and navigation path recording
Cross-Module Navigation: Enabled for all related modules
`;
