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
  const { data: teamMembers } = trpc.team.getAllMembers.useQuery(undefined, { refetchInterval: 30000 });

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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Good afternoon, Admin! 👋</h1>
              <p className="text-blue-100">{format(new Date(), "EEEE, MMMM dd")}</p>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">System Online</span>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Revenue MTD</p>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue, currency)}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Orders Today</p>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Active Tenders</p>
              <p className="text-3xl font-bold">{activeTenders}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Tasks Due</p>
              <p className="text-3xl font-bold">{tasksDue}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button onClick={() => navigate("/sales")} className="border-2 border-dashed border-yellow-300 rounded-lg p-6 hover:bg-yellow-50 transition text-center">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm font-medium text-gray-700">New Order</p>
            </button>
            <button onClick={() => navigate("/financial")} className="border-2 border-dashed border-green-300 rounded-lg p-6 hover:bg-green-50 transition text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium text-gray-700">Create Invoice</p>
            </button>
            <button onClick={() => navigate("/inventory")} className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:bg-purple-50 transition text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Add Product</p>
            </button>
            <button onClick={() => navigate("/customers")} className="border-2 border-dashed border-pink-300 rounded-lg p-6 hover:bg-pink-50 transition text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-pink-600" />
              <p className="text-sm font-medium text-gray-700">New Customer</p>
            </button>
            <button onClick={() => navigate("/income-expense")} className="border-2 border-dashed border-orange-300 rounded-lg p-6 hover:bg-orange-50 transition text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium text-gray-700">Record Expense</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue, currency)}</p>
                  <p className="text-sm text-green-600 mt-2">
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
                  <p className="text-sm text-gray-600 mb-1">Sales Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-sm text-green-600 mt-2">
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
                  <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
                  <p className="text-3xl font-bold text-gray-900">$892,156</p>
                  <p className="text-sm text-red-600 mt-2">
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
                  <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
                  <p className="text-sm text-green-600 mt-2">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Revenue Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue vs expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="expense" fill="#10b981" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tender & Quotation */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tender & Quotation</CardTitle>
                <CardDescription>Pipeline overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{activeTenders}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">3</p>
                    <p className="text-xs text-gray-600">Due Soon</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">42%</p>
                    <p className="text-xs text-gray-600">Win Rate</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">12</p>
                    <p className="text-xs text-gray-600">Won YTD</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Pipeline Value</p>
                  <p className="text-2xl font-bold text-purple-600">$13.5M</p>
                  <p className="text-xs text-gray-500 mt-2">68% of annual target achieved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Tasks and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Tasks</CardTitle>
                <Badge variant="secondary">{pendingTasks.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks && pendingTasks.length > 0 ? (
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
                <p className="text-sm text-gray-500 text-center py-4">No pending tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/action-tracker")}>View all</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Modules */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Quick Access Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <button
                  key={module.name}
                  onClick={() => navigate(module.path)}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-6 hover:shadow-lg hover:border-gray-400 transition text-left`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${module.bgColor} p-3 rounded-lg`}>
                      <ModuleIcon className={`w-6 h-6 ${module.color}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{module.name}</h3>
                  <p className="text-xs text-gray-600 mb-4">{module.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {module.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">{metric.label}</p>
                        <p className="text-sm font-bold text-gray-900">{metric.value}</p>
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
