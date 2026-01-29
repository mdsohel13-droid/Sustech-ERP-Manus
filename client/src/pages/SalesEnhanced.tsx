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

const PRODUCTS = [
  { id: "fan", name: "Atomberg Gorilla Fan", category: "fan" },
  { id: "ess_small", name: "Growatt ESS (Small)", category: "ess" },
  { id: "ess_commercial", name: "Growatt ESS (Commercial)", category: "ess" },
  { id: "solar_jinko", name: "Jinko Solar PV Panel", category: "solar_pv" },
  { id: "solar_ja", name: "JA Solar PV Panel", category: "solar_pv" },
  { id: "epc_project", name: "EPC Solar Project", category: "epc_project" },
  { id: "testing", name: "Electrical Testing & Inspection", category: "testing" },
  { id: "installation", name: "Installation Work", category: "installation" },
];

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
  
  // Fetch product details when selectedProductId changes
  const { data: selectedProduct } = trpc.salesEnhanced.getProductById.useQuery(
    { productId: selectedProductId || 0 },
    { enabled: selectedProductId !== null && selectedProductId > 0 }
  );

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
    
    return {
      totalSales,
      openOpportunities: 36,
      salesThisMonth,
      revenueThisQuarter,
      topProducts,
      topSalesperson,
      activitiesCount: dailySales?.length || 0,
    };
  }, [dailySales]);
  
  // Sales Performance chart data
  const salesPerformanceData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      revenue: Math.floor(40000 + Math.random() * 30000),
      trend: Math.floor(30000 + Math.random() * 25000),
    }));
  }, []);
  
  // Sales Pipeline chart data
  const salesPipelineData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return months.map((month) => ({
      month,
      value: Math.floor(100000 + Math.random() * 250000),
    }));
  }, []);
  
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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track sales performance and revenue</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
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
          <Button variant="outline" onClick={handleExportDaily}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Top KPI Row - Colorful Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 opacity-75" />
            <p className="text-sm opacity-90">Total Sales</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(dashboardStats.totalSales, currency)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Open Opportunities</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold">{dashboardStats.openOpportunities}</p>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">15%</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Sales This Month</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(dashboardStats.salesThisMonth, currency)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Revenue This Quarter</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(dashboardStats.revenueThisQuarter, currency)}</p>
          <div className="mt-1">
            <ResponsiveContainer width="100%" height={30}>
              <AreaChart data={[{v:20},{v:35},{v:25},{v:45},{v:30},{v:50}]}>
                <Area type="monotone" dataKey="v" stroke="#fff" fill="rgba(255,255,255,0.3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Funnel + Sales Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salesFunnelData.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.count}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stage.stage}</span>
                      {stage.value > 0 && <span className="text-xs text-muted-foreground">${stage.value.toLocaleString()}</span>}
                    </div>
                    <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(stage.count / 72) * 100}%`, backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Sales Performance</CardTitle>
            <select className="text-xs border rounded px-2 py-1 bg-background">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salesPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="trend" stroke="#22c55e" fill="rgba(34, 197, 94, 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Revenue
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Market trend
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue Forecast</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(dashboardStats.totalSales * 1.2, currency)}</p>
                <p className="text-xs text-green-600 mt-0.5">High potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deals Closing Soon</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-green-600">16</p>
                  <span className="text-sm text-muted-foreground">{formatCurrency(92800, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">16 deals closing in next 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top Salesperson</p>
                <p className="text-sm font-medium">{dashboardStats.topSalesperson?.name || "N/A"}</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(dashboardStats.topSalesperson?.revenue || 0, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overdue Invoices</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-orange-600">8</p>
                  <span className="text-sm text-muted-foreground">{formatCurrency(16200, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">0 invoices overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities + Sales Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Activities</CardTitle>
              <div className="flex gap-2 text-xs">
                <Button variant="ghost" size="sm" className="h-6 px-2">All</Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">Tasks</Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">Calls</Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">Meetings</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {activitiesData.slice(0, 5).map((activity: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {activity.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-semibold">{formatCurrency(activity.amount, currency)}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Complete</Badge>
                    </td>
                  </tr>
                ))}
                {activitiesData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">No recent activities</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 w-full">View all</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesPipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Top Products</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600">View all</Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">#</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dashboardStats.topProducts.map((product: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{idx + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(product.revenue, currency)}</td>
                </tr>
              ))}
              {dashboardStats.topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">No sales data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            Daily Sales
          </TabsTrigger>
          <TabsTrigger value="weekly">Weekly Targets</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Targets</TabsTrigger>
          <TabsTrigger value="salespeople">Salespeople</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      products={PRODUCTS}
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
                        products={PRODUCTS}
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
                onProductClick={(productId: number | string) => {
                  const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;
                  setSelectedProductId(numProductId);
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
                      products={PRODUCTS}
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
                      products={PRODUCTS}
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
                {PRODUCTS.map((product) => (
                  <Card key={product.id} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant="outline" className="w-fit text-xs mt-2">{product.category}</Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salespeople Tab */}
        <TabsContent value="salespeople" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Salespeople Management</CardTitle>
                  <CardDescription>Active salespeople available for sales tracking</CardDescription>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/hr'}>
                  Manage in HR Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {salespeople && salespeople.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Total Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salespeople.map((person: any) => {
                      const totalSales = dailySales
                        ?.filter((s: any) => s.salespersonId === person.id)
                        .reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount || 0), 0) || 0;
                      return (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">{person.name}</TableCell>
                          <TableCell>{person.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                              {person.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold">৳{totalSales.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">No salespeople added yet.</p>
                  <Button onClick={() => window.location.href = '/hr'}>Go to HR Module</Button>
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
        open={productModalOpen && selectedProductId !== null}
        onOpenChange={setProductModalOpen}
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
            <TableCell className="font-medium cursor-pointer hover:text-blue-600 hover:underline" onClick={() => onProductClick(sale.productId)}>{sale.productName}</TableCell>
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
    salesGrowth: 12, // Placeholder - can be calculated from historical data
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
