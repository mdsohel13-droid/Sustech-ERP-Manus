import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Briefcase, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  TrendingDown,
  Activity,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { DateRangeFilter, type DateRange } from "@/components/DateRangeFilter";
import { startOfMonth, endOfMonth } from "date-fns";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const { data: overview, isLoading } = trpc.dashboard.getOverview.useQuery();
  const { data: insights } = trpc.dashboard.getInsights.useQuery();
  const { data: overdueTenders } = trpc.tenderQuotation.getOverdue.useQuery();
  const { data: upcomingTenders } = trpc.tenderQuotation.getUpcoming.useQuery({ daysAhead: 4 });
  const { data: openActions } = trpc.actionTracker.getOpen.useQuery();
  const { currency } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-12 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const arTotal = Number(overview?.ar.total || 0);
  const arOverdue = Number(overview?.ar.overdue || 0);
  const apTotal = Number(overview?.ap.total || 0);
  const apOverdue = Number(overview?.ap.overdue || 0);
  const netPosition = arTotal - apTotal;

  const projectsByStage = overview?.projects || [];
  const totalProjects = projectsByStage.reduce((sum, p) => sum + Number(p.count), 0);
  const totalProjectValue = projectsByStage.reduce((sum, p) => sum + Number(p.totalValue), 0);

  const customersByStatus = overview?.customers || [];
  const totalCustomers = customersByStatus.reduce((sum, c) => sum + Number(c.count), 0);
  const hotCustomers = customersByStatus.find(c => c.status === 'hot')?.count || 0;

  // Mock data for charts (replace with real data from backend)
  const revenueData = [
    { month: 'Jul', revenue: 18000, target: 20000 },
    { month: 'Aug', revenue: 22000, target: 20000 },
    { month: 'Sep', revenue: 19000, target: 20000 },
    { month: 'Oct', revenue: 25000, target: 20000 },
    { month: 'Nov', revenue: 21000, target: 20000 },
    { month: 'Dec', revenue: 23000, target: 20000 },
  ];

  const projectStatusData = projectsByStage.map(p => ({
    name: p.stage,
    value: Number(p.count),
    amount: Number(p.totalValue)
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const cashFlowData = [
    { month: 'Jul', income: 25000, expense: 18000 },
    { month: 'Aug', income: 28000, expense: 20000 },
    { month: 'Sep', income: 26000, expense: 19000 },
    { month: 'Oct', income: 32000, expense: 22000 },
    { month: 'Nov', income: 29000, expense: 21000 },
    { month: 'Dec', income: 31000, expense: 23000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive view of business health, projects, and team performance
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics Grid - Enhanced with Icons and Colors */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Financial Health */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NET POSITION</CardTitle>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatCurrency(netPosition, currency)}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">AR:</span>
                <span className="font-semibold text-green-600">{formatCurrency(arTotal, currency)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">AP:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(apTotal, currency)}</span>
              </div>
            </div>
            {(arOverdue > 0 || apOverdue > 0) && (
              <div className="flex items-center gap-1 mt-3 text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue items detected</span>
              </div>
            )}
            <Link href="/financial">
              <Button variant="link" className="mt-2 p-0 h-auto text-blue-600">
                View Details <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ACTIVE PROJECTS</CardTitle>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalProjects}</div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Total Value: {formatCurrency(totalProjectValue, currency)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {projectsByStage.slice(0, 2).map((stage) => (
                <div key={stage.stage} className="flex flex-col">
                  <span className="text-muted-foreground capitalize">{stage.stage}</span>
                  <span className="font-semibold">{stage.count}</span>
                </div>
              ))}
            </div>
            <Link href="/projects">
              <Button variant="link" className="mt-2 p-0 h-auto text-purple-600">
                View Pipeline <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL CUSTOMERS</CardTitle>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalCustomers}</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-muted-foreground">{hotCustomers} Hot</span>
                </span>
                <span className="font-semibold text-red-600">High priority leads</span>
              </div>
              {customersByStatus.slice(0, 2).map((status) => (
                <div key={status.status} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{status.status}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
            <Link href="/customers">
              <Button variant="link" className="mt-2 p-0 h-auto text-green-600">
                View CRM <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">QUICK ACTIONS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Add New Project
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
            <Link href="/financial">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </Link>
            <Link href="/ideas">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lightbulb className="mr-2 h-4 w-4" />
                Capture Idea
              </Button>
            </Link>
            <Link href="/action-tracker">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Action Tracker
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Notifications & Alerts Section */}
      {((overdueTenders && overdueTenders.length > 0) || (upcomingTenders && upcomingTenders.length > 0) || (openActions && openActions.length > 0)) && (
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Overdue Tenders/Quotations */}
          {overdueTenders && overdueTenders.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Overdue Follow-ups ({overdueTenders.length})
                </CardTitle>
                <CardDescription>Tenders/Quotations requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {overdueTenders.slice(0, 5).map((item: any) => (
                    <Link key={item.id} href="/tender-quotation">
                      <div className="p-2 bg-red-50 dark:bg-red-950 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer">
                        <p className="font-medium text-sm truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.clientName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {overdueTenders.length > 5 && (
                  <Link href="/tender-quotation">
                    <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-red-600">
                      View all {overdueTenders.length} items →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tenders/Quotations */}
          {upcomingTenders && upcomingTenders.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
                  <Clock className="h-4 w-4" />
                  Upcoming Follow-ups ({upcomingTenders.length})
                </CardTitle>
                <CardDescription>Due in the next 4 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {upcomingTenders.slice(0, 5).map((item: any) => (
                    <Link key={item.id} href="/tender-quotation">
                      <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors cursor-pointer">
                        <p className="font-medium text-sm truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.clientName} • Due: {item.followUpDate && new Date(item.followUpDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {upcomingTenders.length > 5 && (
                  <Link href="/tender-quotation">
                    <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-orange-600">
                      View all {upcomingTenders.length} items →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Open Action Items */}
          {openActions && openActions.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
                  <Target className="h-4 w-4" />
                  Open Action Items ({openActions.length})
                </CardTitle>
                <CardDescription>Pending actions and decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {openActions.slice(0, 5).map((item: any) => (
                    <Link key={item.id} href="/action-tracker">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {openActions.length > 5 && (
                  <Link href="/action-tracker">
                    <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-blue-600">
                      View all {openActions.length} items →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue vs target (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Project Status Distribution
            </CardTitle>
            <CardDescription>Current projects by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} projects`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Cash Flow Analysis
            </CardTitle>
            <CardDescription>Income vs Expenses (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>Data-driven recommendations for your business</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("AI Insights generation started")}
              >
                Generate AI Insights
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Notification sent")}
              >
                Check & Notify
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {insights && insights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {insight.insightType.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{insight.summary}</p>
                    {insight.recommendations && (
                      <p className="text-sm text-blue-600 mt-2 font-medium">{insight.recommendations}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No insights available. Click "Generate AI Insights" to analyze your data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
