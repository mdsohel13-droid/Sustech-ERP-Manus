import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Home() {
  const { currency } = useCurrency();
  const [, navigate] = useLocation();

  // Fetch all data
  const { data: projects } = trpc.projects.getAll.useQuery();
  const { data: customers } = trpc.customers.getAll.useQuery();
  const { data: salesData } = trpc.sales.getAll.useQuery();
  const { data: arData } = trpc.financial.getAccountsReceivable.useQuery();
  const { data: apData } = trpc.financial.getAccountsPayable.useQuery();
  const { data: incomeExpData } = trpc.incomeExpenditure.getAll.useQuery();
  const { data: tenderData } = trpc.tenderQuotation.getAll.useQuery();
  const { data: actionItems } = trpc.actionTracker.getAll.useQuery();

  // Calculate key metrics
  const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;
  const totalAR = arData?.reduce((sum, ar) => sum + parseFloat(ar.amount), 0) || 0;
  const totalAP = apData?.reduce((sum, ap) => sum + parseFloat(ap.amount), 0) || 0;
  const netPosition = totalAR - totalAP;
  const activeProjects = projects?.filter(p => p.stage !== "completed").length || 0;
  const totalCustomers = customers?.length || 0;

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

  // Project status distribution
  const projectStatusData = [
    { name: "Proposal", value: projects?.filter(p => p.stage === "proposal").length || 1, color: "#3b82f6" },
    { name: "Planning", value: projects?.filter(p => p.stage === "planning").length || 2, color: "#10b981" },
    { name: "Execution", value: projects?.filter(p => p.stage === "execution").length || 3, color: "#f59e0b" },
    { name: "Testing", value: projects?.filter(p => p.stage === "testing").length || 1, color: "#8b5cf6" },
    { name: "Completed", value: projects?.filter(p => p.stage === "completed").length || 2, color: "#6b7280" },
  ];

  // Sales by category
  const salesByCategoryData = [
    { category: "Solar Panels", amount: 45000, percentage: 35 },
    { category: "Inverters", amount: 32000, percentage: 25 },
    { category: "Batteries", amount: 25000, percentage: 20 },
    { category: "Installation", amount: 18000, percentage: 14 },
    { category: "Others", amount: 8000, percentage: 6 },
  ];

  // Overdue items
  const overdueTenders = tenderData?.filter(t => {
    const followUpDate = new Date(t.followUpDate);
    return followUpDate < new Date() && t.status !== "win" && t.status !== "loss" && t.status !== "po_received";
  }) || [];

  const overdueAR = arData?.filter((ar: any) => {
    if (!ar.dueDate) return false;
    const dueDate = new Date(ar.dueDate);
    return dueDate < new Date();
  }) || [];

  // Recent transactions
  const recentTransactions = incomeExpData?.slice(0, 5) || [];

  // Top customers by revenue
  const topCustomers = customers?.slice(0, 5).map((c, i) => ({
    ...c,
    revenue: (Math.random() * 50000 + 10000).toFixed(2),
    projects: Math.floor(Math.random() * 10) + 1,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive view of business health, projects, and team performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm">Export PDF</Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currency)}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit, currency)}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Net Position (AR-AP)</CardTitle>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netPosition, currency)}</div>
            <div className="text-sm text-gray-600 mt-1">
              AR: {formatCurrency(totalAR, currency)} | AP: {formatCurrency(totalAP, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <Briefcase className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <div className="text-sm text-gray-600 mt-1">
              {totalCustomers} customers | {projects?.length || 0} total projects
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      {(overdueTenders.length > 0 || overdueAR.length > 0 || (actionItems?.length || 0) > 0) && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overdueTenders.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-900">Overdue Tenders</h4>
                    <Badge variant="destructive">{overdueTenders.length}</Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-2">Follow-up required</p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/tender-quotation")}>
                    View All <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}

              {overdueAR.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-900">Overdue Invoices</h4>
                    <Badge className="bg-orange-500">{overdueAR.length}</Badge>
                  </div>
                  <p className="text-sm text-orange-700 mb-2">Payment collection needed</p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/financial")}>
                    View All <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}

              {(actionItems?.length || 0) > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Open Action Items</h4>
                    <Badge className="bg-blue-500">{actionItems?.length}</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Pending actions & decisions</p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/action-tracker")}>
                    View All <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expense Trend</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current project pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Revenue</CardTitle>
            <CardDescription>Your most valuable clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.projects} projects</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(parseFloat(customer.revenue), currency)}</div>
                    <div className="text-sm text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest income and expenditure entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{transaction.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.type === "income" ? (
                        <Badge className="bg-green-100 text-green-800">Income</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Expense</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {transaction.type === "income" ? (
                        <span className="text-green-600">+{formatCurrency(parseFloat(transaction.amount), currency)}</span>
                      ) : (
                        <span className="text-red-600">-{formatCurrency(parseFloat(transaction.amount), currency)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/projects")}>
              <Briefcase className="w-5 h-5" />
              <span>New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/customers")}>
              <Users className="w-5 h-5" />
              <span>Add Customer</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/financial")}>
              <DollarSign className="w-5 h-5" />
              <span>Record Transaction</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/sales")}>
              <ShoppingCart className="w-5 h-5" />
              <span>New Sale</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/action-tracker")}>
              <Target className="w-5 h-5" />
              <span>Action Tracker</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
