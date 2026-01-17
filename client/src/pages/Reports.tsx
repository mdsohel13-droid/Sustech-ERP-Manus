import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Briefcase,
  Download,
  Pin,
  PinOff,
  Search,
  Filter,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency as formatCurrencyUtil } from "@/lib/currencyUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from "recharts";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "sales" | "finance" | "inventory" | "hr" | "projects";
  pinned: boolean;
}

const REPORT_TEMPLATES: ReportCard[] = [
  { id: "sales-overview", title: "Sales Overview", description: "Revenue, orders, and sales trends", icon: TrendingUp, category: "sales", pinned: true },
  { id: "revenue-by-product", title: "Revenue by Product", description: "Top performing products", icon: Package, category: "sales", pinned: false },
  { id: "customer-analysis", title: "Customer Analysis", description: "Customer segments and lifetime value", icon: Users, category: "sales", pinned: false },
  { id: "profit-loss", title: "Profit & Loss", description: "Income statement summary", icon: DollarSign, category: "finance", pinned: true },
  { id: "cash-flow", title: "Cash Flow", description: "Cash inflows and outflows", icon: LineChart, category: "finance", pinned: false },
  { id: "ar-aging", title: "AR Aging Report", description: "Receivables by age bucket", icon: FileText, category: "finance", pinned: false },
  { id: "inventory-valuation", title: "Inventory Valuation", description: "Stock value and turnover", icon: Package, category: "inventory", pinned: false },
  { id: "stock-movement", title: "Stock Movement", description: "Inventory in/out tracking", icon: BarChart3, category: "inventory", pinned: false },
  { id: "employee-performance", title: "Employee Performance", description: "KPIs and productivity metrics", icon: Users, category: "hr", pinned: false },
  { id: "attendance-summary", title: "Attendance Summary", description: "Attendance and leave tracking", icon: Calendar, category: "hr", pinned: false },
  { id: "project-status", title: "Project Status", description: "Active projects and milestones", icon: Briefcase, category: "projects", pinned: true },
  { id: "project-profitability", title: "Project Profitability", description: "Revenue vs costs by project", icon: PieChart, category: "projects", pinned: false },
];

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function Reports() {
  const { currency } = useCurrency();
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, currency);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pinnedReports, setPinnedReports] = useState<string[]>(["sales-overview", "profit-loss", "project-status"]);
  const [selectedReport, setSelectedReport] = useState<string | null>("sales-overview");
  const [dateRange, setDateRange] = useState("this-month");

  // Fetch data
  const { data: projects } = trpc.projects.getAll.useQuery();
  const { data: customers } = trpc.customers.getAll.useQuery();
  const { data: incomeExpenditure } = trpc.incomeExpenditure.getAll.useQuery();

  // Sample data for charts
  const salesData = useMemo(() => [
    { month: 'Jan', revenue: 45000, orders: 12 },
    { month: 'Feb', revenue: 52000, orders: 15 },
    { month: 'Mar', revenue: 48000, orders: 14 },
    { month: 'Apr', revenue: 61000, orders: 18 },
    { month: 'May', revenue: 55000, orders: 16 },
    { month: 'Jun', revenue: 67000, orders: 20 },
  ], []);

  const categoryData = useMemo(() => [
    { name: 'Products', value: 45 },
    { name: 'Services', value: 30 },
    { name: 'Subscriptions', value: 15 },
    { name: 'Other', value: 10 },
  ], []);

  const cashFlowData = useMemo(() => [
    { month: 'Jan', inflow: 50000, outflow: 35000 },
    { month: 'Feb', inflow: 55000, outflow: 40000 },
    { month: 'Mar', inflow: 48000, outflow: 38000 },
    { month: 'Apr', inflow: 62000, outflow: 42000 },
    { month: 'May', inflow: 58000, outflow: 45000 },
    { month: 'Jun', inflow: 70000, outflow: 48000 },
  ], []);

  const projectStatusData = useMemo(() => {
    if (!projects) return [];
    const stages = ['proposal', 'planning', 'in_progress', 'testing', 'completed'];
    return stages.map(stage => ({
      stage: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: projects.filter(p => p.stage === stage).length
    }));
  }, [projects]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return REPORT_TEMPLATES.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const togglePin = (reportId: string) => {
    setPinnedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "sales-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(328000)}</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">95</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(3453)}</p>
                    </div>
                    <div className="flex items-center text-red-600 text-sm">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "profit-loss":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(450000)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(285000)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(165000)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">36.7%</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="inflow" fill="#22c55e" name="Inflow" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="outflow" fill="#ef4444" name="Outflow" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "project-status":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{projects?.filter(p => p.stage === 'execution').length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{projects?.filter(p => p.stage === 'won').length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(projects?.reduce((sum, p) => sum + (Number(p.value) || 0), 0) || 0)}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projects by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStatusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis type="category" dataKey="stage" stroke="#9ca3af" fontSize={12} width={100} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg">Select a Report</h3>
            <p className="text-muted-foreground mt-1">Choose a report from the sidebar to view analytics</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Query Bar */}
        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ask AI: 'Show me top 10 customers by revenue' or 'Compare sales Q1 vs Q2'"
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button size="sm">
                <Search className="w-4 h-4 mr-2" />
                Query
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search & Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {["all", "sales", "finance", "inventory", "hr", "projects"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === cat 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Pinned Reports */}
            {pinnedReports.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </h3>
                <div className="space-y-1">
                  {REPORT_TEMPLATES.filter(r => pinnedReports.includes(r.id)).map(report => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        selectedReport === report.id 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <report.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{report.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Reports */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">All Reports</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedReport === report.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <report.icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{report.description}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(report.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {pinnedReports.includes(report.id) ? (
                        <PinOff className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Pin className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {REPORT_TEMPLATES.find(r => r.id === selectedReport)?.title || "Select Report"}
                  </CardTitle>
                  <CardDescription>
                    {REPORT_TEMPLATES.find(r => r.id === selectedReport)?.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderReportContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
