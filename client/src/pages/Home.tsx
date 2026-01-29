import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { useMemo } from "react";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  Target,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  Truck,
  Building2,
  UserCheck,
  UserX,
  Timer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const { currency } = useCurrency();
  const [, navigate] = useLocation();

  // Fetch all data with real-time refresh
  const { data: projects } = trpc.projects.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: customers } = trpc.customers.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: salesData } = trpc.sales.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: arData } = trpc.financial.getAccountsReceivable.useQuery(undefined, { refetchInterval: 30000 });
  const { data: apData } = trpc.financial.getAccountsPayable.useQuery(undefined, { refetchInterval: 30000 });
  const { data: incomeExpData } = trpc.incomeExpenditure.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: tenderData } = trpc.tenderQuotation.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: actionItems } = trpc.actionTracker.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: teamMembers } = trpc.hr.getAllEmployees.useQuery(undefined, { refetchInterval: 30000 });
  const { data: productsData } = trpc.products.getActiveProducts.useQuery(undefined, { refetchInterval: 30000 });
  const { data: inventoryData } = trpc.products.getAllInventoryWithProducts.useQuery(undefined, { refetchInterval: 30000 });

  // Calculate HRM metrics
  const hrmMetrics = useMemo(() => {
    const totalEmployees = teamMembers?.length || 0;
    const presentToday = Math.round(totalEmployees * 0.92); // Simulated
    const onLeave = Math.round(totalEmployees * 0.05);
    const absent = totalEmployees - presentToday - onLeave;
    return { totalEmployees, presentToday, onLeave, absent };
  }, [teamMembers]);

  // Calculate Project metrics (stages: testing, lead, proposal, won, execution)
  const projectMetrics = useMemo(() => {
    if (!projects) return { running: 0, completed: 0, postponed: 0, cancelled: 0, total: 0, completionRate: 0 };
    const running = projects.filter(p => p.stage === "execution" || p.stage === "lead" || p.stage === "proposal").length;
    const completed = projects.filter(p => p.stage === "won").length;
    const postponed = projects.filter(p => p.stage === "testing").length;
    const cancelled = 0; // No cancelled stage in current schema
    const total = projects.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { running, completed, postponed, cancelled, total, completionRate };
  }, [projects]);

  // Project donut chart data
  const projectChartData = [
    { name: "Running", value: projectMetrics.running, color: "#3b82f6" },
    { name: "Completed", value: projectMetrics.completed, color: "#22c55e" },
    { name: "Postponed", value: projectMetrics.postponed, color: "#f59e0b" },
    { name: "Cancelled", value: projectMetrics.cancelled, color: "#ef4444" },
  ].filter(d => d.value > 0);

  // Calculate Sales & Finance metrics
  const financeMetrics = useMemo(() => {
    const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || "0"), 0) || 0;
    const totalAR = arData?.reduce((sum, ar) => sum + parseFloat(ar.amount || "0"), 0) || 0;
    const totalAP = apData?.reduce((sum, ap) => sum + parseFloat(ap.amount || "0"), 0) || 0;
    const totalIncome = incomeExpData?.filter(i => i.type === "income").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    const totalExpense = incomeExpData?.filter(i => i.type === "expenditure").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    return { totalSales, totalAR, totalAP, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
  }, [salesData, arData, apData, incomeExpData]);

  // Revenue trend data
  const revenueTrendData = [
    { month: "Aug", revenue: 18000, expense: 12000 },
    { month: "Sep", revenue: 22000, expense: 14000 },
    { month: "Oct", revenue: 19000, expense: 13000 },
    { month: "Nov", revenue: 25000, expense: 15000 },
    { month: "Dec", revenue: 28000, expense: 17000 },
    { month: "Jan", revenue: financeMetrics.totalSales || 23000, expense: financeMetrics.totalExpense || 14000 },
  ];

  // Calculate Inventory metrics from real inventory data
  const inventoryMetrics = useMemo(() => {
    const totalProducts = productsData?.length || 0;
    if (!inventoryData || inventoryData.length === 0) {
      return { totalProducts, totalStock: 0, stockValue: 0, lowStockCount: 0, outOfStock: 0 };
    }
    const totalStock = inventoryData.reduce((sum, inv: any) => sum + (inv.quantity || 0), 0);
    const stockValue = inventoryData.reduce((sum, inv: any) => {
      const product = inv.product as any;
      const price = product ? parseFloat(product.sellingPrice || product.selling_price || "0") : 0;
      return sum + (inv.quantity || 0) * price;
    }, 0);
    const lowStockCount = inventoryData.filter((inv: any) => {
      const qty = inv.quantity || 0;
      const product = inv.product as any;
      const reorder = product?.reorderLevel || product?.reorder_level || 10;
      return qty > 0 && qty <= reorder;
    }).length;
    const outOfStock = inventoryData.filter((inv: any) => (inv.quantity || 0) === 0).length;
    return { totalProducts, totalStock, stockValue, lowStockCount, outOfStock };
  }, [productsData, inventoryData]);

  // Calculate Tender metrics
  const tenderMetrics = useMemo(() => {
    if (!tenderData) return { pending: 0, submitted: 0, won: 0, pipelineValue: 0, winRate: 0 };
    const activeTenders = tenderData.filter(t => !t.archivedAt);
    const pending = activeTenders.filter(t => t.status === "not_started" || t.status === "preparing").length;
    const submitted = activeTenders.filter(t => t.status === "submitted").length;
    const won = activeTenders.filter(t => t.status === "win" || t.status === "po_received").length;
    const total = activeTenders.length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const pipelineValue = activeTenders.reduce((sum, t) => sum + parseFloat(t.estimatedValue || "0"), 0);
    return { pending, submitted, won, pipelineValue, winRate };
  }, [tenderData]);

  // Calculate Action Tracker metrics (statuses: open, in_progress, resolved, closed)
  const actionMetrics = useMemo(() => {
    if (!actionItems) return { pending: 0, overdue: 0, completed: 0, highPriority: 0 };
    const pending = actionItems.filter(a => a.status === "open" || a.status === "in_progress").length;
    const overdue = actionItems.filter(a => {
      if (a.status === "resolved" || a.status === "closed") return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < new Date();
    }).length;
    const completed = actionItems.filter(a => a.status === "resolved" || a.status === "closed").length;
    const highPriority = actionItems.filter(a => a.priority === "high" && a.status !== "resolved" && a.status !== "closed").length;
    return { pending, overdue, completed, highPriority };
  }, [actionItems]);

  // Pending action items (top 5)
  const pendingActions = useMemo(() => {
    return actionItems?.filter(a => a.status === "open" || a.status === "in_progress").slice(0, 5) || [];
  }, [actionItems]);

  // Purchase/SCM metrics (simulated based on available data)
  const purchaseMetrics = useMemo(() => {
    const pendingRequisitions = {
      operations: 12,
      marketing: 5,
      it: 8,
      hr: 3,
      finance: 2,
    };
    const totalPending = Object.values(pendingRequisitions).reduce((a, b) => a + b, 0);
    return { pendingRequisitions, totalPending };
  }, []);

  // AI Insights
  type Insight = {
    type: string;
    module: string;
    message: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  const aiInsights = useMemo(() => {
    const insights: Insight[] = [];
    if (inventoryMetrics.lowStockCount > 0) {
      insights.push({
        type: "warning",
        module: "Inventory",
        message: `${inventoryMetrics.lowStockCount} products are running low on stock. Consider reordering soon.`,
        icon: Package,
      });
    }
    if (actionMetrics.overdue > 0) {
      insights.push({
        type: "alert",
        module: "Action Tracker",
        message: `${actionMetrics.overdue} action items are overdue. Review and update priorities.`,
        icon: AlertTriangle,
      });
    }
    if (tenderMetrics.pending > 0) {
      insights.push({
        type: "info",
        module: "Tenders",
        message: `${tenderMetrics.pending} tenders pending submission. Check deadlines.`,
        icon: FileText,
      });
    }
    if (financeMetrics.totalAR > 50000) {
      insights.push({
        type: "info",
        module: "Finance",
        message: `Outstanding receivables: ${formatCurrency(financeMetrics.totalAR, currency)}. Follow up on collections.`,
        icon: DollarSign,
      });
    }
    if (projectMetrics.running > 5) {
      insights.push({
        type: "info",
        module: "Projects",
        message: `${projectMetrics.running} active projects. Monitor resource allocation.`,
        icon: Target,
      });
    }
    return insights.slice(0, 4);
  }, [inventoryMetrics, actionMetrics, tenderMetrics, financeMetrics, projectMetrics, currency]);

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "alert": return "border-red-200 bg-red-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
            <p className="text-gray-500">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            System Online
          </Badge>
        </div>

        {/* Row 1: HRM Overview & Project Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HRM Overview */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  HRM Overview
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/hr")} className="text-indigo-600">
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-indigo-600 mb-2" />
                  <p className="text-2xl font-bold text-indigo-700">{hrmMetrics.totalEmployees}</p>
                  <p className="text-xs text-gray-600">Total Employees</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <UserCheck className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{hrmMetrics.presentToday}</p>
                  <p className="text-xs text-gray-600">Present Today</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">{hrmMetrics.onLeave}</p>
                  <p className="text-xs text-gray-600">On Leave</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <UserX className="w-6 h-6 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-700">{hrmMetrics.absent}</p>
                  <p className="text-xs text-gray-600">Absent</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Project Dashboard */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Project & Tenders
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-blue-600">
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectChartData.length > 0 ? projectChartData : [{ name: "No Data", value: 1, color: "#e5e7eb" }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        {(projectChartData.length > 0 ? projectChartData : [{ name: "No Data", value: 1, color: "#e5e7eb" }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Running: <strong>{projectMetrics.running}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Completed: <strong>{projectMetrics.completed}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Postponed: <strong>{projectMetrics.postponed}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Cancelled: <strong>{projectMetrics.cancelled}</strong></span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-lg font-bold text-blue-700">{projectMetrics.completionRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Sales & Finance + Inventory Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales & Finance */}
          <Card className="lg:col-span-2 border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Sales & Finance
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/financial")} className="text-green-600">
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Sales</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(financeMetrics.totalSales, currency)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Receivables</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(financeMetrics.totalAR, currency)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-600">Payables</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(financeMetrics.totalAP, currency)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Net Profit</p>
                  <p className={`text-lg font-bold ${financeMetrics.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(financeMetrics.netProfit, currency)}
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Summary */}
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600" />
                  Inventory
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} className="text-teal-600">
                  View <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-teal-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock Value</span>
                <span className="text-lg font-bold text-teal-700">{formatCurrency(inventoryMetrics.stockValue, currency)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{inventoryMetrics.totalProducts}</p>
                  <p className="text-xs text-gray-600">Total Products</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{inventoryMetrics.totalStock}</p>
                  <p className="text-xs text-gray-600">Total Stock</p>
                </div>
              </div>
              {inventoryMetrics.lowStockCount > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">{inventoryMetrics.lowStockCount} items low on stock</span>
                </div>
              )}
              {inventoryMetrics.outOfStock > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{inventoryMetrics.outOfStock} items out of stock</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Action Tracker + Tender Summary + Purchase Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Tracker */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                  Action Tracker
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/action-tracker")} className="text-orange-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-orange-700">{actionMetrics.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-700">{actionMetrics.overdue}</p>
                  <p className="text-xs text-gray-600">Overdue</p>
                </div>
              </div>
              <div className="space-y-2">
                {pendingActions.length > 0 ? pendingActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border-l-2 border-l-orange-400">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.assignedTo || "Unassigned"}</p>
                    </div>
                    <Badge className={getPriorityColor(action.priority)} variant="secondary">
                      {action.priority || "Normal"}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No pending actions</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tender Summary */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Tender Summary
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/tender-quotation")} className="text-purple-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-yellow-700">{tenderMetrics.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-700">{tenderMetrics.submitted}</p>
                  <p className="text-xs text-gray-600">Submitted</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-green-700">{tenderMetrics.won}</p>
                  <p className="text-xs text-gray-600">Won</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Pipeline Value</span>
                  <span className="text-lg font-bold text-purple-700">{formatCurrency(tenderMetrics.pipelineValue, currency)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Win Rate</span>
                  <span className="text-lg font-bold text-gray-700">{tenderMetrics.winRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Overview */}
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-600" />
                  Purchase Overview
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/purchase")} className="text-cyan-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-cyan-50 rounded-lg mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Requisitions</span>
                <span className="text-xl font-bold text-cyan-700">{purchaseMetrics.totalPending}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">BY DEPARTMENT</p>
                {Object.entries(purchaseMetrics.pendingRequisitions).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-gray-600">{dept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(count / purchaseMetrics.totalPending) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-6">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 4: AI Smart Insights */}
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiInsights.map((insight, idx) => {
                  const InsightIcon = insight.icon;
                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <InsightIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-2 text-xs">{insight.module}</Badge>
                          <p className="text-sm text-gray-700">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Lightbulb className="w-5 h-5 mr-2" />
                <span>All systems running smoothly. No critical insights at this time.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: "Sales", icon: ShoppingCart, path: "/sales", color: "bg-blue-100 text-blue-600" },
            { name: "Inventory", icon: Package, path: "/inventory", color: "bg-teal-100 text-teal-600" },
            { name: "Finance", icon: DollarSign, path: "/financial", color: "bg-green-100 text-green-600" },
            { name: "CRM", icon: Users, path: "/customers", color: "bg-purple-100 text-purple-600" },
            { name: "HR", icon: Briefcase, path: "/hr", color: "bg-pink-100 text-pink-600" },
            { name: "Projects", icon: Target, path: "/projects", color: "bg-orange-100 text-orange-600" },
            { name: "Tenders", icon: FileText, path: "/tender-quotation", color: "bg-indigo-100 text-indigo-600" },
            { name: "Actions", icon: ClipboardList, path: "/action-tracker", color: "bg-yellow-100 text-yellow-600" },
          ].map((module) => {
            const ModuleIcon = module.icon;
            return (
              <button
                key={module.name}
                onClick={() => navigate(module.path)}
                className="p-4 bg-white border rounded-lg hover:shadow-md transition flex flex-col items-center gap-2"
              >
                <div className={`p-2 rounded-lg ${module.color}`}>
                  <ModuleIcon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{module.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
