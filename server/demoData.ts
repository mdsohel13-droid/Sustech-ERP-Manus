export const demoData = {
  dashboardStats: {
    totalRevenue: 1250000,
    totalExpenses: 875000,
    netProfit: 375000,
    activeProjects: 12,
    pendingInvoices: 8,
    overduePayments: 3,
    totalCustomers: 156,
    totalEmployees: 45,
  },
  
  recentSales: [
    { id: 1, customer: "ABC Corporation", amount: 45000, date: "2026-01-28", status: "paid" },
    { id: 2, customer: "XYZ Industries", amount: 32000, date: "2026-01-27", status: "pending" },
    { id: 3, customer: "Tech Solutions Ltd", amount: 28500, date: "2026-01-26", status: "paid" },
    { id: 4, customer: "Global Trading Co", amount: 51000, date: "2026-01-25", status: "overdue" },
    { id: 5, customer: "Prime Services", amount: 19500, date: "2026-01-24", status: "paid" },
  ],
  
  projects: [
    { id: 1, name: "ERP Implementation", client: "ABC Corp", status: "in_progress", progress: 65, budget: 150000 },
    { id: 2, name: "Website Redesign", client: "XYZ Ltd", status: "in_progress", progress: 45, budget: 45000 },
    { id: 3, name: "Mobile App Development", client: "Tech Solutions", status: "planning", progress: 15, budget: 95000 },
    { id: 4, name: "Data Migration", client: "Global Trading", status: "completed", progress: 100, budget: 35000 },
    { id: 5, name: "Security Audit", client: "Prime Services", status: "in_progress", progress: 80, budget: 25000 },
  ],
  
  employees: [
    { id: 1, name: "John Smith", department: "Engineering", position: "Senior Developer", email: "john@demo.com" },
    { id: 2, name: "Sarah Johnson", department: "Sales", position: "Sales Manager", email: "sarah@demo.com" },
    { id: 3, name: "Mike Chen", department: "Finance", position: "Accountant", email: "mike@demo.com" },
    { id: 4, name: "Emily Brown", department: "HR", position: "HR Manager", email: "emily@demo.com" },
    { id: 5, name: "David Wilson", department: "Engineering", position: "Junior Developer", email: "david@demo.com" },
  ],
  
  customers: [
    { id: 1, name: "ABC Corporation", email: "contact@abc.com", phone: "+1234567890", balance: 45000 },
    { id: 2, name: "XYZ Industries", email: "info@xyz.com", phone: "+1234567891", balance: 32000 },
    { id: 3, name: "Tech Solutions Ltd", email: "hello@techsol.com", phone: "+1234567892", balance: 0 },
    { id: 4, name: "Global Trading Co", email: "sales@global.com", phone: "+1234567893", balance: 51000 },
    { id: 5, name: "Prime Services", email: "support@prime.com", phone: "+1234567894", balance: 0 },
  ],
  
  accountsReceivable: [
    { id: 1, customer: "ABC Corporation", invoiceNumber: "INV-001", amount: 45000, dueDate: "2026-02-15", status: "pending" },
    { id: 2, customer: "XYZ Industries", invoiceNumber: "INV-002", amount: 32000, dueDate: "2026-02-10", status: "pending" },
    { id: 3, customer: "Global Trading Co", invoiceNumber: "INV-003", amount: 51000, dueDate: "2026-01-20", status: "overdue" },
  ],
  
  accountsPayable: [
    { id: 1, vendor: "Office Supplies Inc", invoiceNumber: "VND-001", amount: 5500, dueDate: "2026-02-01", status: "pending" },
    { id: 2, vendor: "Tech Hardware Co", invoiceNumber: "VND-002", amount: 12000, dueDate: "2026-02-05", status: "pending" },
    { id: 3, vendor: "Cloud Services Ltd", invoiceNumber: "VND-003", amount: 8500, dueDate: "2026-01-28", status: "paid" },
  ],
  
  chartData: {
    monthlySales: [
      { month: "Jan", sales: 125000, target: 120000 },
      { month: "Feb", sales: 118000, target: 120000 },
      { month: "Mar", sales: 142000, target: 130000 },
      { month: "Apr", sales: 135000, target: 130000 },
      { month: "May", sales: 155000, target: 140000 },
      { month: "Jun", sales: 148000, target: 140000 },
    ],
    expenseBreakdown: [
      { category: "Salaries", amount: 450000 },
      { category: "Operations", amount: 180000 },
      { category: "Marketing", amount: 95000 },
      { category: "Technology", amount: 85000 },
      { category: "Other", amount: 65000 },
    ],
  },
  
  notifications: [
    { id: 1, type: "info", message: "This is a demo environment with sample data", timestamp: new Date().toISOString() },
    { id: 2, type: "warning", message: "Demo mode: Changes will not be saved", timestamp: new Date().toISOString() },
  ],
};

export function getDemoResponse(message: string = "Demo mode: This action is not available in demo mode") {
  return { success: false, message, isDemoMode: true };
}

export function getDemoReadOnlyMessage() {
  return "Demo mode is read-only. Changes are not saved to protect production data.";
}
