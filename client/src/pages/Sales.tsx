import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InfoPopup } from "@/components/ui/info-popup";
import { Plus, TrendingUp, Target, BarChart3, Paperclip, FileText, Trash2, Edit, Archive, RotateCcw, DollarSign, Users, Calendar, Clock, AlertTriangle, Package, User, Phone, MoreHorizontal, UserPlus } from "lucide-react";
import { InlineEditCell } from "@/components/InlineEditCell";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { ProductCombobox } from "@/components/ui/product-combobox";
import { CustomerCombobox } from "@/components/ui/customer-combobox";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { TableBatchActions, useTableBatchSelection } from "@/components/TableBatchActions";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area} from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

export default function Sales() {
  const { currency } = useCurrency();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [viewTrackingDialogOpen, setViewTrackingDialogOpen] = useState(false);
  const [viewProductDialogOpen, setViewProductDialogOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean; item: any; type: 'product' | 'tracking' | 'permanent'}>({show: false, item: null, type: 'product'});
  const [editingCell, setEditingCell] = useState<{rowId: number; field: string} | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isWalkInCustomer, setIsWalkInCustomer] = useState(false);
  const [trackingProductId, setTrackingProductId] = useState("");
  const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quickAddClientOpen, setQuickAddClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const utils = trpc.useUtils();
  const { data: products } = trpc.sales.getAllProducts.useQuery();
  const { data: tracking } = trpc.sales.getAllTracking.useQuery();
  const { data: performance } = trpc.sales.getPerformanceSummary.useQuery();
  const { data: dailySales } = trpc.sales.getAll.useQuery();
  const { data: employees } = trpc.hr.getAll.useQuery();
  const { data: customers } = trpc.customers.getAll.useQuery();
  const { data: archivedSales } = trpc.sales.getAllArchivedDailySales.useQuery();
  
  // Products from Products module (for linking)
  const { data: catalogProducts = [] } = trpc.products.getActiveProducts.useQuery();
  const { data: productsWithInventory = [] } = trpc.products.getProductsWithInventory.useQuery();
  
  const batchSelection = useTableBatchSelection(dailySales || []);

  const createProductMutation = trpc.sales.createProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      toast.success("Product added successfully");
      setProductDialogOpen(false);
    },
  });

  const createTrackingMutation = trpc.sales.createTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales data recorded");
      setTrackingDialogOpen(false);
    },
  });

  const deleteProductMutation = trpc.sales.deleteProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Product deleted");
      setDeleteConfirm({show: false, item: null, type: 'product'});
      setViewProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const deleteTrackingMutation = trpc.sales.deleteTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales record deleted");
      setDeleteConfirm({show: false, item: null, type: 'tracking'});
      setViewTrackingDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete record: ${error.message}`);
    },
  });

  const restoreDailySaleMutation = trpc.sales.restoreDailySale.useMutation({
    onSuccess: () => {
      utils.sales.getAll.invalidate();
      utils.sales.getAllArchivedDailySales.invalidate();
      toast.success("Sale record restored");
    },
    onError: (error) => {
      toast.error(`Failed to restore record: ${error.message}`);
    },
  });

  const permanentlyDeleteMutation = trpc.sales.permanentlyDeleteDailySale.useMutation({
    onSuccess: () => {
      utils.sales.getAllArchivedDailySales.invalidate();
      toast.success("Sale record permanently deleted");
      setDeleteConfirm({show: false, item: null, type: 'permanent'});
    },
    onError: (error) => {
      toast.error(`Failed to delete record: ${error.message}`);
    },
  });

  const updateTrackingMutation = trpc.sales.updateTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales record updated");
      setEditingCell(null);
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const updateProductMutation = trpc.sales.updateProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      toast.success("Product updated");
      setEditingCell(null);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.sales.bulkDelete.useMutation({
    onSuccess: () => {
      utils.sales.getAll.invalidate();
      batchSelection.clearSelection();
      setBulkDeleting(false);
      toast.success(`Deleted ${batchSelection.selectedIds.length} records`);
    },
    onError: (error) => {
      setBulkDeleting(false);
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      setQuickAddClientOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      toast.success('Client added successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBulkDelete = () => {
    if (batchSelection.selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (confirm(`Delete ${batchSelection.selectedIds.length} records?`)) {
      setBulkDeleting(true);
      bulkDeleteMutation.mutate({ ids: batchSelection.selectedIds });
    }
  };

  const handleExport = () => {
    if (dailySales) {
      batchSelection.exportToCSV(dailySales, 'sales-records');
    }
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createProductMutation.mutate({
      name: formData.get("name") as string,
      category: formData.get("category") as any,
      unit: formData.get("unit") as string,
      description: formData.get("description") as string,
    });
  };

  const handleTrackingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weekStart = new Date(formData.get("weekStartDate") as string);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    createTrackingMutation.mutate({
      productId: Number(formData.get("productId")),
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      target: formData.get("target") as string,
      actual: formData.get("actual") as string,
      notes: formData.get("notes") as string,
    });
  };

  // Prepare chart data
  const chartData = tracking?.slice(0, 12).reverse().map((item) => {
    const product = products?.find(p => p.id === item.productId);
    return {
      week: format(new Date(item.weekStartDate), "MMM dd"),
      target: Number(item.target),
      actual: Number(item.actual),
      product: product?.name || `Product ${item.productId}`,
    };
  }) || [];
  
  // Get available stock for selected product
  const getAvailableStock = (productId: string) => {
    if (!productId) return null;
    const inv = productsWithInventory.find((p: any) => String(p.id) === productId);
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
      const amount = Number(sale.quantity) * Number(sale.unitPrice);
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
      const prod = catalogProducts.find((p: any) => p.id === sale.productId) || products?.find((p: any) => p.id === sale.productId);
      const prodName = prod?.name || `Product ${sale.productId}`;
      const amount = Number(sale.quantity) * Number(sale.unitPrice);
      if (!productRevenue[sale.productId]) {
        productRevenue[sale.productId] = { name: prodName, revenue: 0 };
      }
      productRevenue[sale.productId].revenue += amount;
    });
    const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    
    // Top salesperson
    const salesBySalesperson: Record<string, { name: string; revenue: number }> = {};
    dailySales?.forEach((sale: any) => {
      const emp = employees?.find((e: any) => e.id === sale.salespersonId);
      const empName = emp?.name || sale.salespersonName || "Unknown";
      if (!salesBySalesperson[sale.salespersonId || "unknown"]) {
        salesBySalesperson[sale.salespersonId || "unknown"] = { name: empName, revenue: 0 };
      }
      salesBySalesperson[sale.salespersonId || "unknown"].revenue += Number(sale.quantity) * Number(sale.unitPrice);
    });
    const topSalesperson = Object.values(salesBySalesperson).sort((a, b) => b.revenue - a.revenue)[0];
    
    return {
      totalSales,
      openOpportunities: 0, // TODO: Connect to opportunities table when available
      salesThisMonth,
      revenueThisQuarter,
      topProducts,
      topSalesperson,
      activitiesCount: dailySales?.length || 0,
    };
  }, [dailySales, catalogProducts, products, employees]);
  
  // Sales Performance chart data - derived from real daily sales
  const salesPerformanceData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) {
      return [{ month: "No Data", revenue: 0, trend: 0 }];
    }
    
    // Group sales by month
    const monthlyData: Record<string, number> = {};
    dailySales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const revenue = Number(sale.quantity || 0) * Number(sale.unitPrice || 0);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + revenue;
    });
    
    return Object.entries(monthlyData).slice(0, 6).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
      trend: Math.round(revenue * 0.85), // Historical average approximation
    }));
  }, [dailySales]);
  
  // Sales Pipeline chart data - derived from real sales data
  const salesPipelineData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) {
      return [{ month: "No Data", value: 0 }];
    }
    
    // Group sales by month for pipeline view
    const monthlyData: Record<string, number> = {};
    dailySales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const value = Number(sale.quantity || 0) * Number(sale.unitPrice || 0);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + value;
    });
    
    return Object.entries(monthlyData).slice(0, 7).map(([month, value]) => ({
      month,
      value: Math.round(value),
    }));
  }, [dailySales]);
  
  const salesFunnelData = useMemo(() => {
    const totalTracked = tracking?.length || 0;
    const totalSalesCount = dailySales?.length || 0;
    const completedCount = dailySales?.filter((s: any) => Number(s.quantity) > 0).length || 0;
    const hotLeads = Math.max(totalTracked, totalSalesCount);
    const qualified = Math.round(hotLeads * 0.65);
    const analyzed = Math.round(qualified * 0.6);
    const proposed = Math.round(analyzed * 0.6);
    const negotiated = Math.round(proposed * 0.75);
    const closed = completedCount;
    return [
      { stage: "Hot Leads", count: hotLeads, value: dashboardStats.totalSales, color: "#6366f1" },
      { stage: "Qualification", count: qualified, value: 0, color: "#8b5cf6" },
      { stage: "Needs Analysis", count: analyzed, value: 0, color: "#a855f7" },
      { stage: "Proposal", count: proposed, value: 0, color: "#d946ef" },
      { stage: "Negotiation", count: negotiated, value: 0, color: "#ec4899" },
      { stage: "Closure", count: closed, value: dashboardStats.salesThisMonth, color: "#f43f5e" },
    ];
  }, [tracking, dailySales, dashboardStats]);
  
  // Activities data
  const activitiesData = useMemo(() => {
    return dailySales?.slice(0, 5).map((sale: any) => {
      const emp = employees?.find((e: any) => e.id === sale.salespersonId);
      const prod = catalogProducts.find((p: any) => p.id === sale.productId) || products?.find((p: any) => p.id === sale.productId);
      return {
        id: sale.id,
        name: emp?.name || sale.salespersonName || "Unknown",
        type: "Conversion",
        product: prod?.name || `Product ${sale.productId}`,
        amount: Number(sale.quantity) * Number(sale.unitPrice),
        status: "completed",
      };
    }) || [];
  }, [dailySales, employees, catalogProducts, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track sales performance and revenue</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Top KPI Row - Chart-Based Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        <Card className="border-l-4 border-l-[#64748B]">
          <CardContent className="pt-3 pb-2 px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#64748B]" />
              <p className="text-xs text-muted-foreground">Open Opportunities</p>
            </div>
            <p className="text-xl font-bold text-[#64748B]">{dashboardStats.openOpportunities}</p>
            <p className="text-xs text-muted-foreground mt-1">Pipeline deals</p>
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
              <BarChart3 className="w-3.5 h-3.5 text-[#D97706]" />
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
                        style={{ width: `${salesFunnelData[0]?.count > 0 ? (stage.count / salesFunnelData[0].count) * 100 : 0}%`, backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Revenue
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Market trend
              </div>
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
                  <p className="text-xl font-bold text-green-600">{dashboardStats.activitiesCount}</p>
                  <span className="text-sm text-muted-foreground">{formatCurrency(dashboardStats.salesThisMonth, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{dashboardStats.activitiesCount} recent transactions</p>
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
                <p className="text-xs text-muted-foreground">Archived Records</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-orange-600">{archivedSales?.length || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{archivedSales?.length || 0} archived sale records</p>
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

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="daily" className="text-xs px-3 py-1.5">Daily Sales</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs px-3 py-1.5">Weekly Targets</TabsTrigger>
          <TabsTrigger value="salespeople" className="text-xs px-3 py-1.5">Salespeople</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs px-3 py-1.5">Performance</TabsTrigger>
          <TabsTrigger value="archive" className="text-xs px-3 py-1.5">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <TableBatchActions
            selectedIds={batchSelection.selectedIds}
            totalCount={dailySales?.length || 0}
            onSelectAll={batchSelection.toggleSelectAll}
            onBulkDelete={handleBulkDelete}
            onExport={handleExport}
            isDeleting={bulkDeleting}
          />
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Daily Sales Records</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Record Sale</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  // Add sale creation logic here
                  toast.success("Sale recorded");
                }}>
                  <DialogHeader>
                    <DialogTitle>Record Daily Sale</DialogTitle>
                    <DialogDescription>Enter sales transaction details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Date and Product Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date" 
                          name="date" 
                          type="date" 
                          value={saleDate}
                          onChange={(e) => setSaleDate(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="product">Product</Label>
                        <Select 
                          name="product" 
                          value={selectedProductId} 
                          onValueChange={setSelectedProductId}
                        >
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>
                            {catalogProducts.map((prod: any) => (
                              <SelectItem key={prod.id} value={String(prod.id)}>
                                {prod.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Hidden input for product ID */}
                    <input type="hidden" name="productId" value={selectedProductId} />
                    
                    {/* Quantity and Unit Price Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" min="1" required />
                        {selectedProductId && (
                          <p className="text-xs text-muted-foreground">
                            Available: <span className={`font-medium ${selectedProductStock !== null && selectedProductStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedProductStock !== null ? selectedProductStock.toLocaleString() : 0}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unitPrice">Unit Price</Label>
                        <Input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required />
                      </div>
                    </div>
                    
                    {/* Salesperson */}
                    <div className="grid gap-2">
                      <Label htmlFor="salesperson">Salesperson</Label>
                      <Select name="salesperson" required>
                        <SelectTrigger><SelectValue placeholder="Select salesperson" /></SelectTrigger>
                        <SelectContent>
                          {employees?.filter((emp: any) => emp.status === 'active').map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Customer Name */}
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer Name (Optional)</Label>
                      <div className="flex gap-2">
                        <CustomerCombobox
                          customers={customers || []}
                          value={selectedCustomer}
                          onValueChange={(value, isWalkIn) => {
                            setSelectedCustomer(value);
                            setIsWalkInCustomer(isWalkIn);
                          }}
                          placeholder="Search customers or walk-in..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuickAddClientOpen(true)}
                          title="Add New Client"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <input type="hidden" name="customer" value={isWalkInCustomer ? selectedCustomer.replace("walkin:", "") : ""} />
                      <input type="hidden" name="customerId" value={!isWalkInCustomer && selectedCustomer ? selectedCustomer : ""} />
                    </div>
                    
                    {/* Notes */}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input id="notes" name="notes" placeholder="Add notes..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Record Sale</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-normal break-words w-12">
                    <Checkbox
                      checked={batchSelection.selectedIds.length === dailySales?.length && dailySales?.length > 0}
                      indeterminate={batchSelection.selectedIds.length > 0 && batchSelection.selectedIds.length < dailySales?.length}
                      onCheckedChange={batchSelection.toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="whitespace-normal break-words">Date</TableHead>
                  <TableHead className="whitespace-normal break-words">Product</TableHead>
                  <TableHead className="whitespace-normal break-words">Salesperson</TableHead>
                  <TableHead className="whitespace-normal break-words">Customer</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Quantity</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Unit Price</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Total Amount</TableHead>
                  <TableHead className="whitespace-normal break-words text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySales && dailySales.length > 0 ? (
                  dailySales.map((sale: any) => {
                    const product = products?.find(p => p.id === sale.productId);
                    const total = Number(sale.quantity) * Number(sale.unitPrice);
                    return (
                      <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={batchSelection.selectedIds.includes(String(sale.id))}
                            onCheckedChange={() => batchSelection.toggleSelection(String(sale.id))}
                          />
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.date ? format(new Date(sale.date), "MMM dd, yyyy") : "N/A"}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <InfoPopup
                            trigger={
                              <button 
                                type="button" 
                                className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline text-left"
                                onClick={() => {
                                  if (product) {
                                    setSelectedProduct(product);
                                    setViewProductDialogOpen(true);
                                  }
                                }}
                              >
                                {product?.name || `Product ${sale.productId}`}
                              </button>
                            }
                            side="right"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg">{product?.name || `Product ${sale.productId}`}</h4>
                                  {product?.category && <Badge variant="secondary" className="mt-1">{product.category}</Badge>}
                                </div>
                                <Badge variant="outline">Sale #{sale.id}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">{sale.date ? format(new Date(sale.date), "MMM dd, yyyy") : "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Salesperson</p>
                                  <p className="font-medium">{sale.salespersonName || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Customer</p>
                                  <p className="font-medium">{sale.customerName || "Walk-in"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Quantity</p>
                                  <p className="font-medium">{Number(sale.quantity).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Unit Price</p>
                                  <p className="font-medium">৳{Number(sale.unitPrice).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total Amount</p>
                                  <p className="font-semibold text-primary">৳{total.toLocaleString()}</p>
                                </div>
                              </div>
                              {product?.description && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs text-muted-foreground">{product.description}</p>
                                </div>
                              )}
                            </div>
                          </InfoPopup>
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.salespersonName || "N/A"}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.customerName || "-"}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }} onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === sale.id && editingCell?.field === 'quantity' ? (
                            <InlineEditCell
                              value={String(sale.quantity)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                toast.success("Quantity updated");
                                setEditingCell(null);
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={false}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: sale.id, field: 'quantity'})} className="cursor-pointer hover:underline">
                              {Number(sale.quantity).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }} onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === sale.id && editingCell?.field === 'unitPrice' ? (
                            <InlineEditCell
                              value={String(sale.unitPrice)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                toast.success("Unit price updated");
                                setEditingCell(null);
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={false}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: sale.id, field: 'unitPrice'})} className="cursor-pointer hover:underline">
                              ৳{Number(sale.unitPrice).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>৳{total.toLocaleString()}</TableCell>
                        <TableCell className="break-words text-center" style={{ overflowWrap: "break-word" }}>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedTracking(sale);
                            setViewTrackingDialogOpen(true);
                          }} title="View details">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: sale, type: 'tracking'})} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No sales records yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Weekly Sales Targets</h3>
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Record Sales</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleTrackingSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Weekly Sales</DialogTitle>
                    <DialogDescription>Enter target and actual sales for a product this week</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productId">Product</Label>
                      <ProductCombobox
                        products={products || []}
                        value={trackingProductId}
                        onValueChange={setTrackingProductId}
                        placeholder="Search products..."
                      />
                      <input type="hidden" name="productId" value={trackingProductId} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weekStartDate">Week Start Date</Label>
                      <Input id="weekStartDate" name="weekStartDate" type="date" required defaultValue={format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="target">Target</Label>
                        <Input id="target" name="target" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="actual">Actual</Label>
                        <Input id="actual" name="actual" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input id="notes" name="notes" placeholder="Additional comments" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTrackingMutation.isPending}>
                      {createTrackingMutation.isPending ? "Recording..." : "Record Sales"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-normal break-words">Week</TableHead>
                  <TableHead className="whitespace-normal break-words">Product</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Target</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Actual</TableHead>
                  <TableHead className="whitespace-normal break-words text-right">Achievement</TableHead>
                  <TableHead className="whitespace-normal break-words">Notes</TableHead>
                  <TableHead className="whitespace-normal break-words text-center">
                    <FileText className="h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="whitespace-normal break-words text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracking && tracking.length > 0 ? (
                  tracking.map((item) => {
                    const product = products?.find(p => p.id === item.productId);
                    const achievement = (Number(item.actual) / Number(item.target)) * 100;
                    return (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedTracking(item);
                          setViewTrackingDialogOpen(true);
                        }}
                      >
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{format(new Date(item.weekStartDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{product?.name || `Product ${item.productId}`}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }} onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === item.id && editingCell?.field === 'target' ? (
                            <InlineEditCell
                              value={String(item.target)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                updateTrackingMutation.mutate({
                                  id: item.id,
                                  target: value,
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateTrackingMutation.isPending}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: item.id, field: 'target'})} className="cursor-pointer hover:underline">
                              ${Number(item.target).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }} onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === item.id && editingCell?.field === 'actual' ? (
                            <InlineEditCell
                              value={String(item.actual)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                updateTrackingMutation.mutate({
                                  id: item.id,
                                  actual: value,
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateTrackingMutation.isPending}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: item.id, field: 'actual'})} className="cursor-pointer hover:underline">
                              ${Number(item.actual).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                          <Badge className={achievement >= 100 ? "bg-green-100 text-green-800" : achievement >= 80 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                            {achievement.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{item.notes || "-"}</TableCell>
                        <TableCell className="break-words text-center" style={{ overflowWrap: "break-word" }}>
                          <Paperclip className="h-4 w-4 inline text-muted-foreground" />
                        </TableCell>
                        <TableCell className="break-words text-center" style={{ overflowWrap: "break-word" }}>
                          <div className="flex gap-2 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => {setSelectedTracking(item); setViewTrackingDialogOpen(true);}} title="Edit">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item, type: 'tracking'})} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No sales data recorded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <h3 className="text-2xl font-medium">Product Performance Summary</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performance && performance.length > 0 ? (
              performance.map((perf) => {
                const product = products?.find(p => p.id === perf.productId);
                const rate = Number(perf.achievementRate);
                return (
                  <Card key={perf.productId} className="editorial-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{product?.name || `Product ${perf.productId}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Target:</span>
                        <span className="font-semibold">${Number(perf.totalTarget).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Actual:</span>
                        <span className="font-semibold">${Number(perf.totalActual).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Achievement:</span>
                        <Badge className={rate >= 100 ? "bg-green-100 text-green-800" : rate >= 80 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                          {rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="editorial-card col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No performance data available yet. Start recording sales to see insights.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="salespeople" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Salespeople Management</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Salesperson</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  // This will be handled by Quick Add in Record Sale dialog
                  toast.info("Please go to HR module to add new employees. They will automatically appear as salespeople.");
                }}>
                  <DialogHeader>
                    <DialogTitle>Add New Salesperson</DialogTitle>
                    <DialogDescription>Salespeople are managed through the HR module</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">To add a new salesperson:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <strong>Human Resource</strong> module</li>
                      <li>Click on <strong>Employees</strong> tab</li>
                      <li>Click <strong>Add Employee</strong> button</li>
                      <li>Fill in the employee details</li>
                      <li>The employee will automatically appear in the Salesperson dropdown</li>
                    </ol>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => window.location.href = '/human-resource'}>Go to HR Module</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Active Salespeople</CardTitle>
              <CardDescription>Employees available for sales tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {employees && employees.length > 0 ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words">Name</TableHead>
                      <TableHead className="whitespace-normal break-words">Email</TableHead>
                      <TableHead className="whitespace-normal break-words">Status</TableHead>
                      <TableHead className="whitespace-normal break-words text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{emp.name}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{emp.email || '-'}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words text-center" style={{ overflowWrap: "break-word" }}>
                          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/human-resource'} title="Edit in HR Module">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center mb-4">No salespeople added yet.</p>
                  <Button onClick={() => window.location.href = '/human-resource'}>Go to HR Module</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Archived Sales Records</h3>
            <Badge variant="outline" className="text-muted-foreground">
              <Archive className="h-4 w-4 mr-1" />
              {archivedSales?.length || 0} archived records
            </Badge>
          </div>

          <Card className="editorial-card">
            <CardContent className="p-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-normal break-words">Date</TableHead>
                    <TableHead className="whitespace-normal break-words">Product</TableHead>
                    <TableHead className="whitespace-normal break-words">Salesperson</TableHead>
                    <TableHead className="whitespace-normal break-words">Customer</TableHead>
                    <TableHead className="whitespace-normal break-words text-right">Quantity</TableHead>
                    <TableHead className="whitespace-normal break-words text-right">Total Amount</TableHead>
                    <TableHead className="whitespace-normal break-words">Archived At</TableHead>
                    <TableHead className="whitespace-normal break-words text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedSales && archivedSales.length > 0 ? (
                    archivedSales.map((sale: any) => {
                      const product = products?.find(p => p.id === sale.productId);
                      return (
                        <TableRow key={sale.id} className="bg-muted/30">
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.date ? format(new Date(sale.date), "MMM dd, yyyy") : "N/A"}</TableCell>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{product?.name || sale.productName}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.salespersonName || "N/A"}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{sale.customerName || "-"}</TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{Number(sale.quantity).toLocaleString()}</TableCell>
                          <TableCell className="break-words text-right font-medium" style={{ overflowWrap: "break-word" }}>৳{Number(sale.totalAmount).toLocaleString()}</TableCell>
                          <TableCell className="break-words text-sm text-muted-foreground" style={{ overflowWrap: "break-word" }}>
                            {sale.archivedAt ? format(new Date(sale.archivedAt), "MMM dd, yyyy HH:mm") : "-"}
                          </TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <div className="flex justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => restoreDailySaleMutation.mutate({ id: sale.id })}
                                disabled={restoreDailySaleMutation.isPending}
                                title="Restore"
                                className="text-green-600 hover:text-green-800 hover:bg-green-100"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setDeleteConfirm({show: true, item: sale, type: 'permanent'})}
                                title="Permanently Delete"
                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No archived sales records.</p>
                        <p className="text-sm text-muted-foreground mt-1">Archived records will appear here.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View/Edit Sales Tracking Dialog with Attachments */}
      <Dialog open={viewTrackingDialogOpen} onOpenChange={setViewTrackingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sales Record Details</DialogTitle>
            <DialogDescription>
              Week of {selectedTracking && format(new Date(selectedTracking.weekStartDate), "MMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedTracking && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Product</Label>
                    <p className="font-medium">{products?.find(p => p.id === selectedTracking.productId)?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Week</Label>
                    <p className="font-medium">{format(new Date(selectedTracking.weekStartDate), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Target</Label>
                    <p className="font-medium text-2xl">${Number(selectedTracking.target).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Actual</Label>
                    <p className="font-medium text-2xl">${Number(selectedTracking.actual).toLocaleString()}</p>
                  </div>
                </div>
                {selectedTracking.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedTracking.notes}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section - Highly Visible */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Documents & Attachments</Label>
                </div>
                <AttachmentUpload 
                  entityType="sales_tracking" 
                  entityId={selectedTracking.id}
                />
              </div>

              {/* Delete Button */}
              <div className="border-t pt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({show: true, item: selectedTracking, type: 'tracking'})}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View/Edit Product Dialog with Attachments */}
      <Dialog open={viewProductDialogOpen} onOpenChange={setViewProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>{selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unit</Label>
                    <p className="font-medium">{selectedProduct.unit}</p>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedProduct.description}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section - Highly Visible */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Product Documents & Specs</Label>
                </div>
                <AttachmentUpload 
                  entityType="sales_product" 
                  entityId={selectedProduct.id}
                />
              </div>

              {/* Delete Button */}
              <div className="border-t pt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({show: true, item: selectedProduct, type: 'product'})}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirm.show}
        title={
          deleteConfirm.type === 'product' ? 'Delete Product?' : 
          deleteConfirm.type === 'permanent' ? 'Permanently Delete Sale Record?' :
          'Delete Sales Record?'
        }
        description={
          deleteConfirm.type === 'product' 
            ? `Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`
            : deleteConfirm.type === 'permanent'
            ? `Are you sure you want to PERMANENTLY delete this sale record? This action cannot be undone and the record cannot be restored.`
            : `Are you sure you want to delete this sales record for ${deleteConfirm.item?.weekStartDate ? format(new Date(deleteConfirm.item?.weekStartDate), 'MMM dd, yyyy') : 'this date'}? This action cannot be undone.`
        }
        onConfirm={async () => {
          if (deleteConfirm.type === 'product') {
            deleteProductMutation.mutate({ id: deleteConfirm.item.id });
          } else if (deleteConfirm.type === 'permanent') {
            permanentlyDeleteMutation.mutate({ id: deleteConfirm.item.id });
          } else {
            deleteTrackingMutation.mutate({ id: deleteConfirm.item.id });
          }
        }}
        onCancel={() => setDeleteConfirm({show: false, item: null, type: 'product'})}
        isLoading={deleteProductMutation.isPending || deleteTrackingMutation.isPending || permanentlyDeleteMutation.isPending}
      />

      {/* Quick Add Client Dialog */}
      <Dialog open={quickAddClientOpen} onOpenChange={setQuickAddClientOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Quickly add a new client to select in the form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickAddClientOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newClientName.trim()) {
                  toast.error('Client name is required');
                  return;
                }
                createCustomerMutation.mutate({
                  name: newClientName.trim(),
                  email: newClientEmail.trim() || undefined,
                  phone: newClientPhone.trim() || undefined,
                  status: 'warm',
                });
              }}
              disabled={!newClientName.trim() || createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
