import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  Target,
  Package,
  ShoppingCart,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Zap,
  BarChart3,
  Activity,
  Calendar,
  Flag,
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
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

  // Calculate key metrics
  const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;
  const totalAR = arData?.reduce((sum, ar) => sum + parseFloat(ar.amount), 0) || 0;
  const totalAP = apData?.reduce((sum, ap) => sum + parseFloat(ap.amount), 0) || 0;
  const activeProjects = projects?.filter(p => p.stage !== "completed").length || 0;
  const totalCustomers = customers?.length || 0;
  const totalOrders = salesData?.length || 0;
  const activeTenders = tenderData?.filter(t => t.status === "active").length || 0;
  const tasksDue = actionItems?.filter(a => a.status !== "completed").length || 0;

  // Calculate income vs expenses
  const totalIncome = incomeExpData?.filter(i => i.type === "income").reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;
  const totalExpense = incomeExpData?.filter(i => i.type === "expenditure").reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;
  const netProfit = totalIncome - totalExpense;

  // Revenue trend data (last 6 months)
  const revenueTrendData = [
    { month: "Aug", revenue: 18000, expense: 12000 },
    { month: "Sep", revenue: 22000, expense: 14000 },
    { month: "Oct", revenue: 19000, expense: 13000 },
    { month: "Nov", revenue: 25000, expense: 15000 },
    { month: "Dec", revenue: 28000, expense: 17000 },
    { month: "Jan", revenue: totalRevenue || 23000, expense: totalExpense || 14000 },
  ];

  // Pending tasks (first 4)
  const pendingTasks = actionItems?.filter(a => a.status !== "completed").slice(0, 4) || [];

  // Recent activity (last 5 items)
  const recentActivities = [
    { id: 1, type: "order", title: "New Sales Order #2847", description: "Acme Corp - 50 units", time: "2 min ago", icon: ShoppingCart },
    { id: 2, type: "stock", title: "Stock Received - PO #1832", description: "100 units added", time: "15 min ago", icon: Package },
    { id: 3, type: "payment", title: "Payment Pending", description: "TechStart - $8,200", time: "1 hour ago", icon: DollarSign },
    { id: 4, type: "lead", title: "Lead Converted", description: "GlobalTech Solutions", time: "2 hours ago", icon: Users },
  ];

  // Module cards data
  const moduleCards = [
    {
      name: "Sales",
      description: "Manage orders, quotations, and invoicing",
      icon: ShoppingCart,
      metrics: [
        { label: "Orders Today", value: String(totalOrders) },
        { label: "Pending", value: String(salesData?.filter(s => s.status === "pending").length || 0) },
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/sales",
    },
    {
      name: "Inventory",
      description: "Track stock levels and movements",
      icon: Package,
      metrics: [
        { label: "Total SKUs", value: "1,847" },
        { label: "Low Stock", value: "12" },
      ],
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      path: "/inventory",
    },
    {
      name: "Finance",
      description: "General ledger, AR/AP, and reporting",
      icon: DollarSign,
      metrics: [
        { label: "Receivables", value: formatCurrency(totalAR, currency) },
        { label: "Payables", value: formatCurrency(totalAP, currency) },
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/financial",
    },
    {
      name: "CRM",
      description: "Customer relationships and leads",
      icon: Users,
      metrics: [
        { label: "Active Leads", value: "156" },
        { label: "Conversion", value: "24%" },
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/customers",
    },
    {
      name: "HR",
      description: "Employee management and payroll",
      icon: Briefcase,
      metrics: [
        { label: "Employees", value: String(teamMembers?.length || 0) },
        { label: "On Leave", value: "4" },
      ],
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      path: "/hr",
    },
    {
      name: "Projects",
      description: "Track project costs and progress",
      icon: Target,
      metrics: [
        { label: "Active", value: String(activeProjects) },
        { label: "On Track", value: String(projects?.filter(p => p.stage === "execution").length || 0) },
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      path: "/projects",
    },
  ];

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-l-4 border-red-500";
      case "medium":
        return "bg-orange-100 text-orange-800 border-l-4 border-orange-500";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500";
      default:
        return "bg-gray-100 text-gray-800 border-l-4 border-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-primary rounded-lg p-6 text-primary-foreground">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Good afternoon, Admin! 👋</h1>
              <p className="text-primary-foreground/80">{format(new Date(), "EEEE, MMMM dd")}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-primary-foreground">System Online</span>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-primary-foreground/70 text-sm mb-1">Revenue MTD</p>
              <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(totalRevenue, currency)}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-primary-foreground/70 text-sm mb-1">Orders Today</p>
              <p className="text-3xl font-bold text-primary-foreground">{totalOrders}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-primary-foreground/70 text-sm mb-1">Active Tenders</p>
              <p className="text-3xl font-bold text-primary-foreground">{activeTenders}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-primary-foreground/70 text-sm mb-1">Tasks Due</p>
              <p className="text-3xl font-bold text-primary-foreground">{tasksDue}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button onClick={() => navigate("/sales")} className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:bg-primary/5 transition text-center bg-card">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">New Order</p>
            </button>
            <button onClick={() => navigate("/financial")} className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:bg-primary/5 transition text-center bg-card">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Create Invoice</p>
            </button>
            <button onClick={() => navigate("/inventory")} className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:bg-primary/5 transition text-center bg-card">
              <Plus className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Add Product</p>
            </button>
            <button onClick={() => navigate("/customers")} className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:bg-primary/5 transition text-center bg-card">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">New Customer</p>
            </button>
            <button onClick={() => navigate("/income-expense")} className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:bg-primary/5 transition text-center bg-card">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Record Expense</p>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue, currency)}</p>
                  <p className="text-xs text-green-600 mt-2">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +12.5% vs last month
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Orders */}
          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Sales Orders</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-xs text-green-600 mt-2">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +8.2% vs last month
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Value */}
          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Inventory Value</p>
                  <p className="text-2xl font-bold text-foreground">$892,156</p>
                  <p className="text-xs text-red-600 mt-2">
                    <TrendingDown className="w-4 h-4 inline mr-1" />
                    -2.4% vs last month
                  </p>
                </div>
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Customers</p>
                  <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
                  <p className="text-xs text-green-600 mt-2">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +18.7% vs last month
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue vs expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--chart-1)" />
                  <Bar dataKey="expense" fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tender & Quotation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Tender & Quotation</CardTitle>
              <CardDescription>Pipeline overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{activeTenders}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">3</p>
                    <p className="text-xs text-muted-foreground mt-1">Due Soon</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">42%</p>
                    <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Pipeline Value</p>
                    <p className="text-lg font-bold text-foreground">$13.5M</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">68% of annual target achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground">Pending Tasks</CardTitle>
                <CardDescription>{pendingTasks.length} pending</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/action-tracker")}>
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs opacity-75 mt-1">{task.assignedTo || "Unassigned"}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <Badge variant="outline" className="text-xs">{String(task.priority || "Normal")}</Badge>
                        <span>{task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate : new Date(task.dueDate).toLocaleDateString()) : "No due date"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="bg-muted p-2 rounded-lg h-fit">
                        <ActivityIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Modules */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Quick Access Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((module, idx) => {
              const ModuleIcon = module.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(module.path)}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-6 hover:shadow-lg hover:border-gray-400 transition text-left`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${module.bgColor} p-3 rounded-lg`}>
                      <ModuleIcon className={`w-6 h-6 ${module.color}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{module.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{module.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {module.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-sm font-bold text-foreground">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
