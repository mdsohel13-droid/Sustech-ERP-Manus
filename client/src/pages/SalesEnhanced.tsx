import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, BarChart3, Download, Undo2, Trash2, MoreHorizontal, Pencil, Archive, AlertTriangle, User, Package } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

// Products are now loaded dynamically from the Products module via catalogProducts query

const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function SalesEnhanced() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();
  const [dailyDialogOpen, setDailyDialogOpen] = useState(false);
  const [weeklyDialogOpen, setWeeklyDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSaleProduct, setSelectedSaleProduct] = useState<any>(null);
  
  // Fetch product details when selectedProductId changes (for Products module products)
  const { data: dbProduct } = trpc.salesEnhanced.getProductById.useQuery(
    { productId: selectedProductId || 0 },
    { enabled: selectedProductId !== null && selectedProductId > 0 }
  );
  
  // Clear selected sale product when modal closes
  const handleModalClose = (open: boolean) => {
    setProductModalOpen(open);
    if (!open) {
      setSelectedSaleProduct(null);
      setSelectedProductId(null);
    }
  };
  
  // Build product info for modal - use sale record data or database product
  const selectedProduct = selectedSaleProduct ? {
    id: selectedSaleProduct.productId,
    name: selectedSaleProduct.productName,
    category: "sales",
    description: `Sale recorded on ${format(new Date(selectedSaleProduct.date), "dd MMM yyyy")}`,
    specs: {
      "Unit Price": `৳${parseFloat(selectedSaleProduct.unitPrice).toLocaleString()}`,
      "Quantity Sold": String(selectedSaleProduct.quantity),
      "Total Amount": `৳${parseFloat(selectedSaleProduct.totalAmount).toLocaleString()}`,
      "Salesperson": selectedSaleProduct.salespersonName || "Unknown",
      "Customer": selectedSaleProduct.customerName || "Walk-in",
    }
  } : dbProduct;

  // Fetch data
  const { data: dailySales, isLoading: loadingDaily } = trpc.salesEnhanced.getDailySales.useQuery({
    startDate: getStartDate(selectedPeriod),
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: archivedDailySales, isLoading: loadingArchived } = trpc.salesEnhanced.getArchivedDailySales.useQuery({
    startDate: getStartDate(selectedPeriod),
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: archivedWeeklyTargets, isLoading: loadingArchivedWeekly } = trpc.salesEnhanced.getArchivedWeeklyTargets.useQuery();
  const { data: archivedMonthlyTargets, isLoading: loadingArchivedMonthly } = trpc.salesEnhanced.getArchivedMonthlyTargets.useQuery();

  const { data: weeklyTargets, isLoading: loadingWeekly } = trpc.salesEnhanced.getWeeklyTargets.useQuery();
  const { data: monthlyTargets, isLoading: loadingMonthly } = trpc.salesEnhanced.getMonthlyTargets.useQuery();
  const { data: salespeople } = trpc.salesEnhanced.getSalespeople.useQuery();

  // Mutations
  const createDailySale = trpc.salesEnhanced.createDailySale.useMutation({
    onSuccess: () => {
      // Invalidate with the current query parameters to trigger immediate refetch
      utils.salesEnhanced.getDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      setDailyDialogOpen(false);
      toast.success("Daily sale recorded successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createWeeklyTarget = trpc.salesEnhanced.createWeeklyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getWeeklyTargets.invalidate();
      setWeeklyDialogOpen(false);
      toast.success("Weekly target set successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createMonthlyTarget = trpc.salesEnhanced.createMonthlyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getMonthlyTargets.invalidate();
      setMonthlyDialogOpen(false);
      toast.success("Monthly target set successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateWeeklyTarget = trpc.salesEnhanced.updateWeeklyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getWeeklyTargets.invalidate();
      toast.success("Weekly target updated successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const archiveWeeklyTarget = trpc.salesEnhanced.archiveWeeklyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getWeeklyTargets.invalidate();
      utils.salesEnhanced.getArchivedWeeklyTargets.invalidate();
      toast.success("Weekly target archived successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMonthlyTarget = trpc.salesEnhanced.updateMonthlyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getMonthlyTargets.invalidate();
      toast.success("Monthly target updated successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const archiveMonthlyTarget = trpc.salesEnhanced.archiveMonthlyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getMonthlyTargets.invalidate();
      utils.salesEnhanced.getArchivedMonthlyTargets.invalidate();
      toast.success("Monthly target archived successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const restoreWeeklyTarget = trpc.salesEnhanced.restoreWeeklyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getWeeklyTargets.invalidate();
      utils.salesEnhanced.getArchivedWeeklyTargets.invalidate();
      toast.success("Weekly target restored successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const restoreMonthlyTarget = trpc.salesEnhanced.restoreMonthlyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getMonthlyTargets.invalidate();
      utils.salesEnhanced.getArchivedMonthlyTargets.invalidate();
      toast.success("Monthly target restored successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateDailySale = trpc.salesEnhanced.updateDailySale.useMutation({
    onSuccess: () => {
      // Invalidate with the current query parameters to trigger immediate refetch
      utils.salesEnhanced.getDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      setEditDialogOpen(false);
      setEditingId(null);
      toast.success("Sale updated successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const archiveDailySale = trpc.salesEnhanced.archiveDailySale.useMutation({
    onSuccess: () => {
      // Invalidate both daily sales and archived sales queries
      utils.salesEnhanced.getDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      utils.salesEnhanced.getArchivedDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Sale archived successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const restoreDailySale = trpc.salesEnhanced.restoreDailySale.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      utils.salesEnhanced.getArchivedDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Sale restored successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const permanentlyDeleteSale = trpc.salesEnhanced.permanentlyDeleteDailySale.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getArchivedDailySales.invalidate({
        startDate: getStartDate(selectedPeriod),
        endDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Sale permanently deleted");
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Calculate analytics
  const analytics = calculateAnalytics(dailySales || [], weeklyTargets || [], monthlyTargets || []);
  
  // Products from Products module (for linking)
  const { data: catalogProducts = [] } = trpc.products.getActiveProducts.useQuery();
  const { data: productsWithInventory = [] } = trpc.products.getProductsWithInventory.useQuery();
  
  // Get available stock for selected product
  const getAvailableStock = (productId: number | null) => {
    if (!productId) return null;
    const inv = productsWithInventory.find((p: any) => p.id === productId);
    return inv?.totalStock ? parseFloat(String(inv.totalStock)) : 0;
  };
  
  const selectedProductStock = selectedProductId ? getAvailableStock(selectedProductId) : null;
  
  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const quarterStart = startOfQuarter(now);
    const quarterEnd = endOfQuarter(now);
    
    let totalSales = 0;
    let salesThisMonth = 0;
    let revenueThisQuarter = 0;
    
    dailySales?.forEach((sale: any) => {
      const saleDate = new Date(sale.date);
      const amount = Number(sale.totalAmount);
      totalSales += amount;
      
      if (saleDate >= monthStart && saleDate <= monthEnd) {
        salesThisMonth += amount;
      }
      if (saleDate >= quarterStart && saleDate <= quarterEnd) {
        revenueThisQuarter += amount;
      }
    });
    
    // Top products by revenue
    const productRevenue: Record<string, { name: string; revenue: number }> = {};
    dailySales?.forEach((sale: any) => {
      const prodName = sale.productName || `Product ${sale.productId}`;
      if (!productRevenue[sale.productId]) {
        productRevenue[sale.productId] = { name: prodName, revenue: 0 };
      }
      productRevenue[sale.productId].revenue += Number(sale.totalAmount);
    });
    const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    // Top salesperson
    const salesBySalesperson: Record<string, { name: string; revenue: number }> = {};
    dailySales?.forEach((sale: any) => {
      const empName = sale.salespersonName || "Unknown";
      if (!salesBySalesperson[sale.salespersonId || "unknown"]) {
        salesBySalesperson[sale.salespersonId || "unknown"] = { name: empName, revenue: 0 };
      }
      salesBySalesperson[sale.salespersonId || "unknown"].revenue += Number(sale.totalAmount);
    });
    const topSalesperson = Object.values(salesBySalesperson).sort((a, b) => b.revenue - a.revenue)[0];
    
    // Calculate deals closing this month (sales from last 7 days)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSales = dailySales?.filter((s: any) => new Date(s.date) >= last7Days) || [];
    const dealsClosing = recentSales.length;
    const dealsClosingValue = recentSales.reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount || 0), 0);
    
    // Calculate open opportunities (unique customers with sales this month)
    const uniqueCustomers = new Set(dailySales?.map((s: any) => s.customerId || s.customerName).filter(Boolean));
    const openOpportunities = uniqueCustomers.size || 0;
    
    return {
      totalSales,
      openOpportunities,
      salesThisMonth,
      revenueThisQuarter,
      topProducts,
      topSalesperson,
      activitiesCount: dailySales?.length || 0,
      dealsClosing,
      dealsClosingValue,
      // Forecast: current quarter sales projected (sales so far * days remaining / days passed)
      forecast: revenueThisQuarter > 0 ? revenueThisQuarter * 1.2 : totalSales * 1.2,
    };
  }, [dailySales]);
  
  // Sales Performance chart data - group by month from actual sales
  const salesPerformanceData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) return [];
    
    const monthlyData: Record<string, number> = {};
    dailySales.forEach((sale: any) => {
      const month = format(new Date(sale.date), "MMM");
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(sale.totalAmount || 0);
    });
    
    // Get last 6 months with data, or pad with zeros
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      last6Months.push(allMonths[idx]);
    }
    
    return last6Months.map((month) => ({
      month,
      revenue: monthlyData[month] || 0,
    }));
  }, [dailySales]);
  
  // Sales Pipeline chart data - group by week from actual sales
  const salesPipelineData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) return [];
    
    const weeklyData: Record<string, number> = {};
    dailySales.forEach((sale: any) => {
      const week = format(new Date(sale.date), "wo"); // Week number
      weeklyData[week] = (weeklyData[week] || 0) + parseFloat(sale.totalAmount || 0);
    });
    
    // Get unique weeks sorted
    const weeks = Object.keys(weeklyData).sort((a, b) => parseInt(a) - parseInt(b)).slice(-7);
    return weeks.map((week) => ({
      week: `W${week.replace(/[a-z]/gi, '')}`,
      value: weeklyData[week] || 0,
    }));
  }, [dailySales]);
  
  // Sales Funnel data
  const salesFunnelData = useMemo(() => [
    { stage: "Hot Leads", count: 72, value: 78390, color: "#6366f1" },
    { stage: "Qualification", count: 48, value: 0, color: "#8b5cf6" },
    { stage: "Needs Analysis", count: 29, value: 0, color: "#a855f7" },
    { stage: "Proposal", count: 18, value: 0, color: "#d946ef" },
    { stage: "Negotiation", count: 14, value: 0, color: "#ec4899" },
    { stage: "Closure", count: 9, value: 0, color: "#f43f5e" },
  ], []);
  
  // Activities data
  const activitiesData = useMemo(() => {
    return dailySales?.slice(0, 5).map((sale: any) => ({
      id: sale.id,
      name: sale.salespersonName || "Unknown",
      type: "Conversion",
      product: sale.productName || `Product ${sale.productId}`,
      amount: Number(sale.totalAmount),
      status: "completed",
    })) || [];
  }, [dailySales]);

  // Export handlers
  const handleExportDaily = () => {
    if (!dailySales || dailySales.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(
      dailySales.map((sale: any) => ({
        Date: format(new Date(sale.date), "dd/MM/yyyy"),
        Product: sale.productName,
        Salesperson: sale.salespersonName,
        Quantity: sale.quantity,
        "Unit Price": sale.unitPrice,
        "Total Amount": sale.totalAmount,
        Customer: sale.customerName || "-",
      })),
      `daily-sales-${format(new Date(), "yyyy-MM-dd")}`
    );
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground text-sm">Track sales performance and revenue</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportDaily}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* ============ DASHBOARD INFOGRAPHICS - 35% ============ */}
      <div className="space-y-3">
        {/* Top KPI Row - Chart-Based Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-[#2563EB]">
            <CardContent className="pt-3 pb-2 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#2563EB]" />
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </div>
              <p className="text-xl font-bold text-[#2563EB]">{formatCurrency(dashboardStats.totalSales, currency)}</p>
              <div className="mt-1">
                <ResponsiveContainer width="100%" height={32}>
                  <AreaChart data={salesPerformanceData}>
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="rgba(37,99,235,0.12)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#8B5CF6]">
            <CardContent className="pt-3 pb-2 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <p className="text-xs text-muted-foreground">Unique Customers</p>
              </div>
              <p className="text-xl font-bold text-[#8B5CF6]">{dashboardStats.openOpportunities}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {dashboardStats.activitiesCount > 0 ? `${Math.round((dashboardStats.openOpportunities / dashboardStats.activitiesCount) * 100)}% of transactions` : 'No data yet'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#16A34A]">
            <CardContent className="pt-3 pb-2 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <p className="text-xs text-muted-foreground">Sales This Month</p>
              </div>
              <p className="text-xl font-bold text-[#16A34A]">{formatCurrency(dashboardStats.salesThisMonth, currency)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {dashboardStats.totalSales > 0 ? `${((dashboardStats.salesThisMonth / dashboardStats.totalSales) * 100).toFixed(1)}% of total` : 'No sales yet'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#D97706]">
            <CardContent className="pt-3 pb-2 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3 h-3 text-[#D97706]" />
                <p className="text-xs text-muted-foreground">Revenue This Quarter</p>
              </div>
              <p className="text-xl font-bold text-[#D97706]">{formatCurrency(dashboardStats.revenueThisQuarter, currency)}</p>
              <div className="mt-1">
                <ResponsiveContainer width="100%" height={32}>
                  <LineChart data={salesPerformanceData}>
                    <Line type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mini Charts Row + Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Compact Sales Performance Chart */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Sales Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={salesPerformanceData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  fill="rgba(99, 102, 241, 0.2)" 
                  strokeWidth={2}
                  label={{ position: 'top', fontSize: 9, fill: '#6366f1', formatter: (value: number) => value > 0 ? `${(value/1000).toFixed(0)}k` : '' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Compact Sales Pipeline Chart */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Sales Pipeline</h3>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={salesPipelineData}>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar 
                  dataKey="value" 
                  fill="#8b5cf6" 
                  radius={[3, 3, 0, 0]}
                  label={{ position: 'top', fontSize: 9, fill: '#8b5cf6', formatter: (value: number) => value > 0 ? `${(value/1000).toFixed(0)}k` : '' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Key Status Indicators - Using Dynamic Data */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border rounded-lg p-2.5 border-l-4 border-l-purple-500">
              <p className="text-[10px] text-muted-foreground">Top Salesperson</p>
              <p className="text-xs font-medium truncate">{dashboardStats.topSalesperson?.name || "N/A"}</p>
              <p className="text-sm font-bold text-purple-600">{formatCurrency(dashboardStats.topSalesperson?.revenue || 0, currency)}</p>
            </div>
            <div className="border rounded-lg p-2.5 border-l-4 border-l-green-500">
              <p className="text-[10px] text-muted-foreground">Deals Closing (7 days)</p>
              <p className="text-xs font-medium">{dashboardStats.dealsClosing} deals</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(dashboardStats.dealsClosingValue, currency)}</p>
            </div>
            <div className="border rounded-lg p-2.5 border-l-4 border-l-blue-500">
              <p className="text-[10px] text-muted-foreground">Forecast</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(dashboardStats.forecast, currency)}</p>
            </div>
            <div className="border rounded-lg p-2.5 border-l-4 border-l-orange-500">
              <p className="text-[10px] text-muted-foreground">Transactions</p>
              <p className="text-xs font-medium">{dashboardStats.activitiesCount} records</p>
              <p className="text-sm font-bold text-orange-600">{formatCurrency(dashboardStats.totalSales, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ DATA ENTRY & TRACKING - 65% ============ */}
      {/* Main Content Tabs */}
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="daily" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Daily Sales
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs px-3 py-1.5">Weekly Targets</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs px-3 py-1.5">Monthly Targets</TabsTrigger>
          <TabsTrigger value="salespeople" className="text-xs px-3 py-1.5">Salespeople</TabsTrigger>
          <TabsTrigger value="archive" className="text-xs px-3 py-1.5">Archive</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs px-3 py-1.5">Analytics</TabsTrigger>
        </TabsList>

        {/* Daily Sales Tab */}
        <TabsContent value="daily" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Sales Records</CardTitle>
                  <CardDescription>Track individual sales transactions with salesperson details</CardDescription>
                </div>
                <Dialog open={dailyDialogOpen} onOpenChange={setDailyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Sale
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Daily Sale</DialogTitle>
                      <DialogDescription>Enter sales transaction details</DialogDescription>
                    </DialogHeader>
                    <DailySaleForm
                      products={catalogProducts.map((p: any) => ({ id: String(p.id), name: p.name, category: p.category || "other" }))}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createDailySale.mutate(data)}
                      isLoading={createDailySale.isPending}
                    />
                  </DialogContent>
                </Dialog>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Sale</DialogTitle>
                      <DialogDescription>Update sales transaction details</DialogDescription>
                    </DialogHeader>
                    {editingId && dailySales && (
                      <DailySaleForm
                        products={catalogProducts.map((p: any) => ({ id: String(p.id), name: p.name, category: p.category || "other" }))}
                        salespeople={salespeople || []}
                        initialData={dailySales.find((s: any) => s.id === editingId)}
                        onSubmit={(data) => updateDailySale.mutate({ id: editingId, ...data })}
                        isLoading={updateDailySale.isPending}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DailySalesTable 
                sales={dailySales || []} 
                isLoading={loadingDaily}
                onEdit={(sale: any) => {
                  setEditingId(sale.id);
                  setEditDialogOpen(true);
                }}
                onArchive={(id: number) => archiveDailySale.mutate({ id })}
                onProductClick={(sale: any) => {
                  setSelectedSaleProduct(sale);
                  setSelectedProductId(sale.productId);
                  setProductModalOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Targets Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Sales Targets</CardTitle>
                  <CardDescription>Set and track weekly performance goals</CardDescription>
                </div>
                <Dialog open={weeklyDialogOpen} onOpenChange={setWeeklyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Weekly Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Weekly Target</DialogTitle>
                      <DialogDescription>Define sales goals for the week</DialogDescription>
                    </DialogHeader>
                    <WeeklyTargetForm
                      products={catalogProducts.map((p: any) => ({ id: String(p.id), name: p.name, category: p.category || "other" }))}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createWeeklyTarget.mutate(data)}
                      isLoading={createWeeklyTarget.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <WeeklyTargetsTable 
                targets={weeklyTargets || []} 
                isLoading={loadingWeekly} 
                onEdit={(target: any) => {
                  toast.info("Edit functionality coming soon");
                }}
                onArchive={(id: number) => archiveWeeklyTarget.mutate({ id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Targets Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Sales Targets</CardTitle>
                  <CardDescription>Set and track monthly performance goals</CardDescription>
                </div>
                <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Monthly Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Monthly Target</DialogTitle>
                      <DialogDescription>Define sales goals for the month</DialogDescription>
                    </DialogHeader>
                    <MonthlyTargetForm
                      products={catalogProducts.map((p: any) => ({ id: String(p.id), name: p.name, category: p.category || "other" }))}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createMonthlyTarget.mutate(data)}
                      isLoading={createMonthlyTarget.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyTargetsTable 
                targets={monthlyTargets || []} 
                isLoading={loadingMonthly} 
                onEdit={(target: any) => {
                  toast.info("Edit functionality coming soon");
                }}
                onArchive={(id: number) => archiveMonthlyTarget.mutate({ id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="editorial-card">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="editorial-card">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.productData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="editorial-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Salesperson Performance</CardTitle>
                <CardDescription>Individual sales achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.salespersonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#10b981" />
                    <Bar dataKey="target" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Available products for sales tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogProducts.map((product: any) => (
                  <Card key={product.id} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant="outline" className="w-fit text-xs mt-2">{product.category || "other"}</Badge>
                    </CardHeader>
                  </Card>
                ))}
                {catalogProducts.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No products found. Add products in the Products module.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salespeople Tab */}
        <TabsContent value="salespeople" className="space-y-4">
          {/* Salesperson Performance Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-3 pb-2 px-4">
                <p className="text-xs text-muted-foreground">Active Salespeople</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{salespeople?.filter((p: any) => p.status === 'active').length || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">of {salespeople?.length || 0} total</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-3 pb-2 px-4">
                <p className="text-xs text-muted-foreground">Total Team Sales</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(dashboardStats.totalSales, currency)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-cyan-500">
              <CardContent className="pt-3 pb-2 px-4">
                <p className="text-xs text-muted-foreground">Avg. Per Person</p>
                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(salespeople?.length ? dashboardStats.totalSales / salespeople.length : 0, currency)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-rose-500">
              <CardContent className="pt-3 pb-2 px-4">
                <p className="text-xs text-muted-foreground">Top Performer</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400 truncate">{dashboardStats.topSalesperson?.name || "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Salesperson Performance Table with Target Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Salesperson Performance & Target Analysis</CardTitle>
                  <CardDescription className="text-xs">Track individual performance against targets by person and product category</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/hr'}>
                  Manage in HR
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {salespeople && salespeople.length > 0 ? (
                <div className="space-y-4">
                  {/* Performance Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Salesperson</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total Sales</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="text-right">Avg. Deal Size</TableHead>
                        <TableHead className="text-center">Target Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salespeople.map((person: any) => {
                        const personSales = dailySales?.filter((s: any) => s.salespersonId === person.id) || [];
                        const totalSales = personSales.reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount || 0), 0);
                        const transactionCount = personSales.length;
                        const avgDealSize = transactionCount > 0 ? totalSales / transactionCount : 0;
                        
                        // Get target from monthlyTargets for this salesperson
                        const personTarget = monthlyTargets?.find((t: any) => t.salespersonId === person.id);
                        const weeklyPersonTarget = weeklyTargets?.find((t: any) => t.salespersonId === person.id);
                        const hasTarget = personTarget || weeklyPersonTarget;
                        const monthlyTargetValue = personTarget ? parseFloat(personTarget.targetAmount) : (weeklyPersonTarget ? parseFloat(weeklyPersonTarget.targetAmount) * 4 : 0);
                        const targetProgress = hasTarget && monthlyTargetValue > 0 ? Math.min((totalSales / monthlyTargetValue) * 100, 100) : -1;
                        
                        return (
                          <TableRow key={person.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{person.name}</p>
                                  <p className="text-xs text-muted-foreground">{person.email || '-'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={person.status === 'active' ? 'default' : 'secondary'} className={person.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                                {person.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(totalSales, currency)}</TableCell>
                            <TableCell className="text-right">{transactionCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(avgDealSize, currency)}</TableCell>
                            <TableCell>
                              {targetProgress >= 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${targetProgress >= 100 ? 'bg-green-500' : targetProgress >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                      style={{ width: `${targetProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium w-10">{targetProgress.toFixed(0)}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No target set</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Sales by Product Analysis */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium mb-3">Sales by Product</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(() => {
                        // Derive category from productName patterns
                        const getCategoryFromProduct = (productName: string): string => {
                          const name = productName?.toLowerCase() || "";
                          if (name.includes("fan") || name.includes("atomberg")) return "Fans";
                          if (name.includes("solar") || name.includes("pv") || name.includes("panel")) return "Solar";
                          if (name.includes("ess") || name.includes("battery") || name.includes("growatt")) return "Energy Storage";
                          if (name.includes("epc") || name.includes("project")) return "EPC Projects";
                          if (name.includes("testing") || name.includes("inspection")) return "Testing";
                          if (name.includes("installation")) return "Installation";
                          return "Other";
                        };
                        
                        const categorySales: Record<string, { total: number; count: number }> = {};
                        dailySales?.forEach((sale: any) => {
                          const category = getCategoryFromProduct(sale.productName);
                          if (!categorySales[category]) {
                            categorySales[category] = { total: 0, count: 0 };
                          }
                          categorySales[category].total += parseFloat(sale.totalAmount || 0);
                          categorySales[category].count += 1;
                        });
                        
                        const categories = Object.entries(categorySales).sort((a, b) => b[1].total - a[1].total);
                        const colors = ["bg-blue-100 border-blue-500", "bg-green-100 border-green-500", "bg-purple-100 border-purple-500", "bg-amber-100 border-amber-500"];
                        
                        return categories.length > 0 ? categories.slice(0, 4).map(([category, data], idx) => (
                          <div key={category} className={`border rounded-lg p-3 border-l-4 ${colors[idx % colors.length]}`}>
                            <p className="text-xs text-muted-foreground">{category}</p>
                            <p className="text-lg font-bold">{formatCurrency(data.total, currency)}</p>
                            <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                          </div>
                        )) : (
                          <div className="col-span-4 text-center py-4 text-muted-foreground">No product data available</div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Top Performers Leaderboard */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium mb-3">Performance Leaderboard</h4>
                    <div className="space-y-2">
                      {salespeople
                        .map((person: any) => {
                          const personSales = dailySales?.filter((s: any) => s.salespersonId === person.id) || [];
                          const totalSales = personSales.reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount || 0), 0);
                          return { ...person, totalSales };
                        })
                        .sort((a: any, b: any) => b.totalSales - a.totalSales)
                        .slice(0, 5)
                        .map((person: any, idx: number) => (
                          <div key={person.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-400 text-amber-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-muted text-muted-foreground'}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{person.name}</p>
                            </div>
                            <p className="text-sm font-bold">{formatCurrency(person.totalSales, currency)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center mb-3 text-sm">No salespeople added yet.</p>
                  <Button size="sm" onClick={() => window.location.href = '/hr'}>Go to HR Module</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Archived Sales Records</CardTitle>
              <CardDescription>Deleted sales records are stored here for reference</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingArchived ? (
                <div className="text-center py-8 text-muted-foreground">Loading archived records...</div>
              ) : archivedDailySales && archivedDailySales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Salesperson</th>
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
                        <th className="text-right py-3 px-4 font-semibold">Total Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedDailySales.map((sale: any) => (
                        <tr key={sale.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{format(new Date(sale.date), "dd MMM yyyy")}</td>
                          <td className="py-3 px-4 font-medium">{sale.productName}</td>
                          <td className="py-3 px-4">{sale.salespersonName}</td>
                          <td className="py-3 px-4">{sale.customerName || "-"}</td>
                          <td className="py-3 px-4 text-right">{sale.quantity}</td>
                          <td className="py-3 px-4 text-right">৳{parseFloat(sale.unitPrice).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-semibold">৳{parseFloat(sale.totalAmount).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => restoreDailySale.mutate({ id: sale.id })}
                                disabled={restoreDailySale.isPending}
                              >
                                <Undo2 className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm("Are you sure you want to permanently delete this sale record? This action cannot be undone.")) {
                                    permanentlyDeleteSale.mutate({ id: sale.id });
                                  }
                                }}
                                disabled={permanentlyDeleteSale.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Archived sales records will appear here</p>
                  <p className="text-sm text-muted-foreground">When you archive a sale, it will be moved to this section</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Archived Weekly Targets */}
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Archived Weekly Targets</CardTitle>
              <CardDescription>Archived weekly sales targets</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingArchivedWeekly ? (
                <div className="text-center py-8 text-muted-foreground">Loading archived weekly targets...</div>
              ) : archivedWeeklyTargets && archivedWeeklyTargets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Week Period</th>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Salesperson</th>
                        <th className="text-right py-3 px-4 font-semibold">Target</th>
                        <th className="text-right py-3 px-4 font-semibold">Achieved</th>
                        <th className="text-left py-3 px-4 font-semibold">Archived Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedWeeklyTargets.map((target: any) => (
                        <tr key={target.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {format(new Date(target.weekStartDate), "dd MMM")} - {format(new Date(target.weekEndDate), "dd MMM yyyy")}
                          </td>
                          <td className="py-3 px-4 font-medium">{target.productName}</td>
                          <td className="py-3 px-4">{target.salespersonId ? "Individual" : "Team"}</td>
                          <td className="py-3 px-4 text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</td>
                          <td className="py-3 px-4">{target.archivedAt ? format(new Date(target.archivedAt), "dd MMM yyyy") : "-"}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => restoreWeeklyTarget.mutate({ id: target.id })}
                              disabled={restoreWeeklyTarget.isPending}
                            >
                              <Undo2 className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No archived weekly targets</div>
              )}
            </CardContent>
          </Card>

          {/* Archived Monthly Targets */}
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Archived Monthly Targets</CardTitle>
              <CardDescription>Archived monthly sales targets</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingArchivedMonthly ? (
                <div className="text-center py-8 text-muted-foreground">Loading archived monthly targets...</div>
              ) : archivedMonthlyTargets && archivedMonthlyTargets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Month</th>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Salesperson</th>
                        <th className="text-right py-3 px-4 font-semibold">Target</th>
                        <th className="text-right py-3 px-4 font-semibold">Achieved</th>
                        <th className="text-left py-3 px-4 font-semibold">Archived Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedMonthlyTargets.map((target: any) => (
                        <tr key={target.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{format(new Date(target.year, target.month - 1, 1), "MMMM yyyy")}</td>
                          <td className="py-3 px-4 font-medium">{target.productName}</td>
                          <td className="py-3 px-4">{target.salespersonId ? "Individual" : "Team"}</td>
                          <td className="py-3 px-4 text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</td>
                          <td className="py-3 px-4">{target.archivedAt ? format(new Date(target.archivedAt), "dd MMM yyyy") : "-"}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => restoreMonthlyTarget.mutate({ id: target.id })}
                              disabled={restoreMonthlyTarget.isPending}
                            >
                              <Undo2 className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No archived monthly targets</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={productModalOpen && (selectedProductId !== null || selectedSaleProduct !== null)}
        onOpenChange={handleModalClose}
        product={selectedProduct || null}
      />
    </div>
  );
}

// Helper Components
function DailySaleForm({ products, salespeople, onSubmit, isLoading, initialData }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean; initialData?: any }) {
  const [formData, setFormData] = useState({
    date: initialData ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    productId: initialData ? initialData.productId : "",
    quantity: initialData ? initialData.quantity.toString() : "",
    unitPrice: initialData ? initialData.unitPrice.toString() : "",
    salespersonId: initialData ? initialData.salespersonId.toString() : "",
    customerName: initialData?.customerName || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    const salesperson = salespeople.find((s: any) => s.id.toString() === formData.salespersonId);
    
    onSubmit({
      date: formData.date,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount: (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toString(),
      salespersonId: parseInt(formData.salespersonId),
      salespersonName: salesperson?.name || "",
      customerName: formData.customerName,
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product: any) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price (৳)</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="salesperson">Salesperson</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.info("Go to Sales > Salespeople tab to manage salespeople");
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            + Quick Add
          </Button>
        </div>
        <Select value={formData.salespersonId} onValueChange={(value) => setFormData({ ...formData, salespersonId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson" />
          </SelectTrigger>
          <SelectContent>
            {salespeople?.filter((p: any) => p.status === 'active').map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
            {salespeople?.filter((p: any) => p.status !== 'active').length > 0 && (
              <>
                <div className="px-2 py-1 text-xs text-muted-foreground border-t">Inactive</div>
                {salespeople?.filter((p: any) => p.status !== 'active').map((person: any) => (
                  <SelectItem key={person.id} value={person.id.toString()} disabled>
                    {person.name} ({person.status})
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name (Optional)</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {formData.quantity && formData.unitPrice && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Total Amount: ৳{(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString()}
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Recording..." : "Record Sale"}
      </Button>
    </form>
  );
}

function WeeklyTargetForm({ products, salespeople, onSubmit, isLoading }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    weekStartDate: "",
    weekEndDate: "",
    productId: "",
    targetAmount: "",
    salespersonId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    
    onSubmit({
      weekStartDate: formData.weekStartDate,
      weekEndDate: formData.weekEndDate,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      targetAmount: formData.targetAmount,
      salespersonId: formData.salespersonId ? parseInt(formData.salespersonId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weekStartDate">Week Start Date</Label>
          <Input
            id="weekStartDate"
            type="date"
            value={formData.weekStartDate}
            onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekEndDate">Week End Date</Label>
          <Input
            id="weekEndDate"
            type="date"
            value={formData.weekEndDate}
            onChange={(e) => setFormData({ ...formData, weekEndDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product: any) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (৳)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesperson">Salesperson (Optional - Leave empty for team target)</Label>
        <Select value={formData.salespersonId || "team"} onValueChange={(value) => setFormData({ ...formData, salespersonId: value === "team" ? "" : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson or leave for team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team Target</SelectItem>
            {salespeople.map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Setting..." : "Set Weekly Target"}
      </Button>
    </form>
  );
}

function MonthlyTargetForm({ products, salespeople, onSubmit, isLoading }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    productId: "",
    targetAmount: "",
    salespersonId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    
    onSubmit({
      month: formData.month,
      year: formData.year,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      targetAmount: formData.targetAmount,
      salespersonId: formData.salespersonId ? parseInt(formData.salespersonId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select value={formData.month.toString()} onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {format(new Date(2024, i, 1), "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product: any) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (৳)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesperson">Salesperson (Optional - Leave empty for team target)</Label>
        <Select value={formData.salespersonId || "team"} onValueChange={(value) => setFormData({ ...formData, salespersonId: value === "team" ? "" : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson or leave for team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team Target</SelectItem>
            {salespeople.map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Setting..." : "Set Monthly Target"}
      </Button>
    </form>
  );
}

function DailySalesTable({ sales, isLoading, onEdit, onArchive, onProductClick }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sales data...</div>;
  }

  if (!sales || sales.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No sales recorded yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Total Amount</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale: any) => (
          <TableRow key={sale.id}>
            <TableCell>{format(new Date(sale.date), "dd MMM yyyy")}</TableCell>
            <TableCell className="font-medium cursor-pointer hover:text-blue-600 hover:underline" onClick={() => onProductClick(sale)}>{sale.productName}</TableCell>
            <TableCell>{sale.salespersonName}</TableCell>
            <TableCell className="font-medium cursor-pointer hover:text-blue-600 hover:underline">{sale.customerName || "-"}</TableCell>
            <TableCell className="text-right">{sale.quantity}</TableCell>
            <TableCell className="text-right">৳{parseFloat(sale.unitPrice).toLocaleString()}</TableCell>
            <TableCell className="text-right font-semibold">৳{parseFloat(sale.totalAmount).toLocaleString()}</TableCell>
            <TableCell className="text-center">
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => onEdit(sale)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onArchive(sale.id)}>Archive</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WeeklyTargetsTable({ targets, isLoading, onEdit, onArchive }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading targets...</div>;
  }

  if (!targets || targets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No weekly targets set yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Week Period</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Achieved</TableHead>
          <TableHead className="text-right">Achievement</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target: any) => {
          const achievementRate = (parseFloat(target.achievedAmount) / parseFloat(target.targetAmount)) * 100;
          return (
            <TableRow key={target.id}>
              <TableCell>
                {format(new Date(target.weekStartDate), "dd MMM")} - {format(new Date(target.weekEndDate), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{target.productName}</TableCell>
              <TableCell>{target.salespersonId ? "Individual" : "Team"}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold">{achievementRate.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge
                  variant={achievementRate >= 100 ? "default" : achievementRate >= 80 ? "secondary" : "destructive"}
                >
                  {achievementRate >= 100 ? "Achieved" : achievementRate >= 80 ? "On Track" : "Behind"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => onEdit(target)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onArchive(target.id)}>Archive</Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function MonthlyTargetsTable({ targets, isLoading, onEdit, onArchive }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading targets...</div>;
  }

  if (!targets || targets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No monthly targets set yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Achieved</TableHead>
          <TableHead className="text-right">Achievement</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target: any) => {
          const achievementRate = (parseFloat(target.achievedAmount) / parseFloat(target.targetAmount)) * 100;
          return (
            <TableRow key={target.id}>
              <TableCell>
                {format(new Date(target.year, target.month - 1, 1), "MMMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{target.productName}</TableCell>
              <TableCell>{target.salespersonId ? "Individual" : "Team"}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold">{achievementRate.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge
                  variant={achievementRate >= 100 ? "default" : achievementRate >= 80 ? "secondary" : "destructive"}
                >
                  {achievementRate >= 100 ? "Achieved" : achievementRate >= 80 ? "On Track" : "Behind"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => onEdit(target)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onArchive(target.id)}>Archive</Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Helper functions
function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case "today":
      return format(now, "yyyy-MM-dd");
    case "this_week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return format(weekStart, "yyyy-MM-dd");
    case "this_month":
      return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
    case "this_quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      return format(new Date(now.getFullYear(), quarter * 3, 1), "yyyy-MM-dd");
    case "this_year":
      return format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd");
    default:
      return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
  }
}

function calculateAnalytics(dailySales: any[], weeklyTargets: any[], monthlyTargets: any[]) {
  const totalSales = dailySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || "0"), 0);
  const totalTransactions = dailySales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Calculate achievement rate from monthly targets
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthTargets = monthlyTargets.filter(
    (t: any) => t.month === currentMonth && t.year === currentYear
  );
  const totalTarget = currentMonthTargets.reduce((sum, t) => sum + parseFloat(t.targetAmount || "0"), 0);
  const totalAchieved = currentMonthTargets.reduce((sum, t) => sum + parseFloat(t.achievedAmount || "0"), 0);
  const achievementRate = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  // Active salespeople
  const uniqueSalespeople = new Set(dailySales.map(s => s.salespersonName));
  const activeSalespeople = uniqueSalespeople.size;

  // Top salesperson
  const salespersonSales: Record<string, number> = {};
  dailySales.forEach(sale => {
    salespersonSales[sale.salespersonName] = (salespersonSales[sale.salespersonName] || 0) + parseFloat(sale.totalAmount);
  });
  const topSalesperson = Object.entries(salespersonSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Trend data
  const salesByDate: Record<string, number> = {};
  dailySales.forEach(sale => {
    const date = format(new Date(sale.date), "MMM dd");
    salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.totalAmount);
  });
  const trendData = Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));

  // Product data
  const salesByProduct: Record<string, number> = {};
  dailySales.forEach(sale => {
    salesByProduct[sale.productName] = (salesByProduct[sale.productName] || 0) + parseFloat(sale.totalAmount);
  });
  const productData = Object.entries(salesByProduct).map(([name, value]) => ({ name, value }));

  // Salesperson data
  const salespersonData = Object.entries(salespersonSales).map(([name, sales]) => ({
    name,
    sales,
    target: 0, // Can be enhanced with actual targets
  }));

  return {
    totalSales,
    salesGrowth: 0, // TODO: Calculate from historical data when available
    achievementRate,
    totalTransactions,
    avgTransactionValue,
    activeSalespeople,
    topSalesperson,
    trendData,
    productData,
    salespersonData,
  };
}
