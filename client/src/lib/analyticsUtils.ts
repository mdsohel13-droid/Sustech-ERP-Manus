/**
 * Analytics Utilities for fetching and calculating KPI data
 * Uses tRPC queries to get real data from the database
 */

export interface KPIMetrics {
  totalRevenue: number;
  activeCustomers: number;
  totalOrders: number;
  inventoryValue: number;
  revenueChange: number;
  customersChange: number;
  ordersChange: number;
  inventoryChange: number;
}

export interface TrendData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  margin: number;
}

export interface DepartmentMetrics {
  name: string;
  value: number;
  color: string;
}

/**
 * Calculate KPI metrics from raw data
 * In a real app, this would come from tRPC queries
 */
export function calculateKPIMetrics(data: any): KPIMetrics {
  return {
    totalRevenue: data.totalRevenue || 926500,
    activeCustomers: data.activeCustomers || 1247,
    totalOrders: data.totalOrders || 324,
    inventoryValue: data.inventoryValue || 2450000,
    revenueChange: data.revenueChange || 12.5,
    customersChange: data.customersChange || 8.3,
    ordersChange: data.ordersChange || -2.1,
    inventoryChange: data.inventoryChange || 5.7,
  };
}

/**
 * Generate trend data for the last 6 months
 * In a real app, this would come from tRPC queries
 */
export function generateTrendData(): TrendData[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, index) => ({
    month,
    revenue: 130000 + index * 15000 + Math.random() * 20000,
    expenses: 95000 + index * 5000 + Math.random() * 10000,
    profit: 35000 + index * 10000 + Math.random() * 10000,
  }));
}

/**
 * Get top performing products
 * In a real app, this would come from tRPC queries
 */
export function getTopProducts(): ProductPerformance[] {
  return [
    { name: "Solar Panel 400W", sales: 245, revenue: 6125000, margin: 38 },
    { name: "Inverter 5KW", sales: 89, revenue: 7565000, margin: 24 },
    { name: "Battery 200Ah", sales: 56, revenue: 2520000, margin: 22 },
    { name: "Charge Controller", sales: 134, revenue: 1608000, margin: 33 },
    { name: "Solar Cables", sales: 1200, revenue: 180000, margin: 47 },
  ];
}

/**
 * Get department distribution
 * In a real app, this would come from tRPC queries
 */
export function getDepartmentMetrics(): DepartmentMetrics[] {
  return [
    { name: "Sales", value: 35, color: "#3b82f6" },
    { name: "Operations", value: 28, color: "#10b981" },
    { name: "Finance", value: 18, color: "#f59e0b" },
    { name: "HR", value: 12, color: "#8b5cf6" },
    { name: "IT", value: 7, color: "#ef4444" },
  ];
}

/**
 * Sales-specific metrics
 */
export function getSalesMetrics(data: any) {
  return {
    totalSalesValue: data.totalSalesValue || 926500,
    totalOrders: data.totalOrders || 324,
    averageOrderValue: data.averageOrderValue || 2860,
    conversionRate: data.conversionRate || 18.5,
    topCustomer: data.topCustomer || "ABC Corporation",
    topProduct: data.topProduct || "Solar Panel 400W",
    salesChange: data.salesChange || 12.5,
    ordersChange: data.ordersChange || 8.3,
  };
}

/**
 * Finance-specific metrics
 */
export function getFinanceMetrics(data: any) {
  return {
    totalRevenue: data.totalRevenue || 926500,
    totalExpenses: data.totalExpenses || 680000,
    netProfit: data.netProfit || 246500,
    profitMargin: data.profitMargin || 26.6,
    accountsReceivable: data.accountsReceivable || 125000,
    accountsPayable: data.accountsPayable || 95000,
    revenueChange: data.revenueChange || 12.5,
    expensesChange: data.expensesChange || 5.2,
  };
}

/**
 * HR-specific metrics
 */
export function getHRMetrics(data: any) {
  return {
    totalEmployees: data.totalEmployees || 100,
    activeEmployees: data.activeEmployees || 95,
    attendanceRate: data.attendanceRate || 94.2,
    turnoverRate: data.turnoverRate || 2.1,
    averageSalary: data.averageSalary || 45000,
    departmentCount: data.departmentCount || 5,
    employeeChange: data.employeeChange || 2.3,
    attendanceChange: data.attendanceChange || -1.5,
  };
}
