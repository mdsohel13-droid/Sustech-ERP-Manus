/**
 * Cross-Module Navigation Utilities
 * Enables seamless hyperlink navigation between related data across all ERP modules
 */

export type ModuleLink = {
  module: string;
  id: number | string;
  label: string;
  type: 'view' | 'edit' | 'detail';
};

export type CrossModuleRelationship = {
  source: string;
  target: string;
  relationship: string;
  linkField: string;
};

// Define all cross-module relationships
export const moduleRelationships: CrossModuleRelationship[] = [
  // Sales relationships
  { source: 'sales', target: 'customers', relationship: 'Customer', linkField: 'customerId' },
  { source: 'sales', target: 'products', relationship: 'Products', linkField: 'productIds' },
  { source: 'sales', target: 'financial', relationship: 'Invoice', linkField: 'invoiceId' },
  
  // Purchases relationships
  { source: 'purchases', target: 'vendors', relationship: 'Vendor', linkField: 'vendorId' },
  { source: 'purchases', target: 'products', relationship: 'Products', linkField: 'productIds' },
  { source: 'purchases', target: 'financial', relationship: 'Bill', linkField: 'billId' },
  
  // Products relationships
  { source: 'products', target: 'inventory', relationship: 'Stock', linkField: 'productId' },
  { source: 'products', target: 'sales', relationship: 'Sales Orders', linkField: 'productId' },
  { source: 'products', target: 'purchases', relationship: 'Purchase Orders', linkField: 'productId' },
  
  // Customers relationships
  { source: 'customers', target: 'sales', relationship: 'Sales Orders', linkField: 'customerId' },
  { source: 'customers', target: 'financial', relationship: 'AR Aging', linkField: 'customerId' },
  
  // Financial relationships
  { source: 'financial', target: 'sales', relationship: 'Sales Invoices', linkField: 'salesOrderId' },
  { source: 'financial', target: 'purchases', relationship: 'Purchase Bills', linkField: 'purchaseOrderId' },
  { source: 'financial', target: 'customers', relationship: 'Customer', linkField: 'customerId' },
  
  // Projects relationships
  { source: 'projects', target: 'hr', relationship: 'Team Members', linkField: 'teamMemberIds' },
  { source: 'projects', target: 'budget', relationship: 'Budget', linkField: 'budgetId' },
  { source: 'projects', target: 'financial', relationship: 'Project Costs', linkField: 'projectId' },
  
  // HR relationships
  { source: 'hr', target: 'projects', relationship: 'Assigned Projects', linkField: 'employeeId' },
  { source: 'hr', target: 'financial', relationship: 'Payroll', linkField: 'employeeId' }
];

// Navigation route mapping
export const moduleRoutes = {
  sales: '/sales',
  purchases: '/purchases',
  products: '/products',
  customers: '/customers',
  financial: '/financial',
  projects: '/projects',
  hr: '/hr',
  inventory: '/inventory',
  crm: '/crm',
  budget: '/budget',
  vendors: '/purchases#vendors',
  settings: '/settings'
};

/**
 * Generate a hyperlink for cross-module navigation
 */
export function generateCrossModuleLink(
  sourceModule: string,
  targetModule: string,
  targetId: number | string,
  label: string
): ModuleLink {
  return {
    module: targetModule,
    id: targetId,
    label,
    type: 'detail'
  };
}

/**
 * Get the navigation URL for a module link
 */
export function getNavigationUrl(link: ModuleLink): string {
  const baseRoute = moduleRoutes[link.module] || '/';
  return `${baseRoute}?id=${link.id}&view=${link.type}`;
}

/**
 * Get all related modules for a given module
 */
export function getRelatedModules(module: string): string[] {
  const related = new Set<string>();
  
  moduleRelationships.forEach(rel => {
    if (rel.source === module) {
      related.add(rel.target);
    }
    if (rel.target === module) {
      related.add(rel.source);
    }
  });
  
  return Array.from(related);
}

/**
 * Get relationship details between two modules
 */
export function getRelationshipDetails(source: string, target: string): CrossModuleRelationship | undefined {
  return moduleRelationships.find(
    rel => (rel.source === source && rel.target === target) ||
           (rel.source === target && rel.target === source)
  );
}

/**
 * Create a clickable link component data
 */
export function createClickableLink(
  text: string,
  module: string,
  id: number | string,
  className?: string
): {
  text: string;
  href: string;
  module: string;
  id: number | string;
  className?: string;
} {
  return {
    text,
    href: getNavigationUrl({ module, id, label: text, type: 'detail' }),
    module,
    id,
    className
  };
}

/**
 * Get breadcrumb navigation for a record
 */
export function getBreadcrumbNavigation(
  currentModule: string,
  currentId: number | string,
  parentModule?: string,
  parentId?: number | string
): Array<{ label: string; href: string; module: string }> {
  const breadcrumbs = [];
  
  if (parentModule && parentId) {
    breadcrumbs.push({
      label: parentModule.charAt(0).toUpperCase() + parentModule.slice(1),
      href: `${moduleRoutes[parentModule]}?id=${parentId}`,
      module: parentModule
    });
  }
  
  breadcrumbs.push({
    label: currentModule.charAt(0).toUpperCase() + currentModule.slice(1),
    href: `${moduleRoutes[currentModule]}?id=${currentId}`,
    module: currentModule
  });
  
  return breadcrumbs;
}

/**
 * Get all available actions for a record based on its module
 */
export function getRecordActions(module: string, recordId: number | string) {
  const actions = [
    { label: 'View Details', action: 'view', href: `${moduleRoutes[module]}?id=${recordId}&view=detail` },
    { label: 'Edit', action: 'edit', href: `${moduleRoutes[module]}?id=${recordId}&view=edit` },
    { label: 'Delete', action: 'delete', href: '#' },
    { label: 'Print', action: 'print', href: `${moduleRoutes[module]}?id=${recordId}&view=print` },
    { label: 'Export', action: 'export', href: `${moduleRoutes[module]}?id=${recordId}&view=export` }
  ];
  
  return actions;
}

/**
 * Validate cross-module link
 */
export function validateCrossModuleLink(sourceModule: string, targetModule: string): boolean {
  return moduleRelationships.some(
    rel => (rel.source === sourceModule && rel.target === targetModule) ||
           (rel.source === targetModule && rel.target === sourceModule)
  );
}

/**
 * Get hyperlink metadata for UI rendering
 */
export function getHyperlinkMetadata(module: string, id: number | string, label: string) {
  return {
    module,
    id,
    label,
    url: getNavigationUrl({ module, id, label, type: 'detail' }),
    relatedModules: getRelatedModules(module),
    actions: getRecordActions(module, id),
    className: 'text-blue-600 hover:underline cursor-pointer font-semibold'
  };
}
