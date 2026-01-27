import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package, AlertCircle, Calendar, Download, Filter } from "lucide-react";

interface KPIData {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  margin: number;
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Sample data for charts
  const chartData: ChartData[] = [
    { month: "Jan", revenue: 130000, expenses: 95000, profit: 35000 },
    { month: "Feb", revenue: 145000, expenses: 100000, profit: 45000 },
    { month: "Mar", revenue: 156500, expenses: 105000, profit: 51500 },
    { month: "Apr", revenue: 142000, expenses: 98000, profit: 44000 },
    { month: "May", revenue: 168000, expenses: 110000, profit: 58000 },
    { month: "Jun", revenue: 185000, expenses: 115000, profit: 70000 },
  ];

  const productPerformance: ProductPerformance[] = [
    { name: "Solar Panel 400W", sales: 245, revenue: 6125000, margin: 38 },
    { name: "Inverter 5KW", sales: 89, revenue: 7565000, margin: 24 },
    { name: "Battery 200Ah", sales: 56, revenue: 2520000, margin: 22 },
    { name: "Charge Controller", sales: 134, revenue: 1608000, margin: 33 },
    { name: "Solar Cables", sales: 1200, revenue: 180000, margin: 47 },
  ];

  const departmentData = [
    { name: "Sales", value: 35, color: "#3b82f6" },
    { name: "Operations", value: 28, color: "#10b981" },
    { name: "Finance", value: 18, color: "#f59e0b" },
    { name: "HR", value: 12, color: "#8b5cf6" },
    { name: "IT", value: 7, color: "#ef4444" },
  ];

  const kpis: KPIData[] = useMemo(() => [
    {
      label: "Total Revenue",
      value: 926500,
      change: 12.5,
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      label: "Active Customers",
      value: 1247,
      change: 8.3,
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      label: "Total Orders",
      value: 324,
      change: -2.1,
      trend: "down",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      label: "Inventory Value",
      value: 2450000,
      change: 5.7,
      trend: "up",
      icon: <Package className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ], []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value).replace("BDT", "৳");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & KPIs</h2>
          <p className="text-muted-foreground">Real-time business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold">
                    {kpi.label.includes("Revenue") || kpi.label.includes("Inventory")
                      ? formatCurrency(kpi.value)
                      : kpi.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={kpi.trend === "up" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                      {kpi.trend === "up" ? "+" : ""}{kpi.change}% from last period
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center ${kpi.color}`}>
                  <div className={kpi.color}>{kpi.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenue & Expense Trend</span>
              <span className="text-xs font-normal text-muted-foreground">Last 6 months</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top Performing Products</span>
            <span className="text-xs font-normal text-muted-foreground">By revenue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productPerformance.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{product.sales} sales</span>
                    <span>{formatCurrency(product.revenue)}</span>
                    <span className="text-green-600">{product.margin}% margin</span>
                  </div>
                </div>
                <div className="w-24 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full relative">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{ width: `${product.margin}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Business Insights & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900">⚠️ Low Stock Alert</p>
              <p className="text-xs text-orange-800 mt-1">3 products are below minimum stock levels. Reorder recommended.</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">✓ Revenue Growth</p>
              <p className="text-xs text-green-800 mt-1">Revenue increased by 12.5% compared to last month. Excellent performance!</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">ℹ️ Customer Insight</p>
              <p className="text-xs text-blue-800 mt-1">Top customer (ABC Corp) accounts for 8% of total revenue. Consider loyalty program.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
