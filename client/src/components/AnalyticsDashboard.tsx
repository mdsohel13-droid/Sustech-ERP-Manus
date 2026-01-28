import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface KPIData {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getKPIs.useQuery();
  const { data: trendData, isLoading: trendLoading } = trpc.dashboard.getRevenueTrends.useQuery();
  const { data: productData, isLoading: productLoading } = trpc.dashboard.getTopProducts.useQuery();
  const { data: departmentData, isLoading: deptLoading } = trpc.dashboard.getDepartmentDistribution.useQuery();

  const isLoading = kpiLoading || trendLoading || productLoading || deptLoading;

  const kpis: KPIData[] = kpiData ? [
    {
      label: "Total Revenue",
      value: kpiData.totalRevenue,
      change: kpiData.revenueChange,
      trend: kpiData.revenueChange >= 0 ? "up" : "down",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      label: "Active Customers",
      value: kpiData.activeCustomers,
      change: kpiData.customersChange,
      trend: kpiData.customersChange >= 0 ? "up" : "down",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      label: "Total Orders",
      value: kpiData.totalOrders,
      change: kpiData.ordersChange,
      trend: kpiData.ordersChange >= 0 ? "up" : "down",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      label: "Inventory Value",
      value: kpiData.inventoryValue,
      change: kpiData.inventoryChange,
      trend: kpiData.inventoryChange >= 0 ? "up" : "down",
      icon: <Package className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ] : [];

  const chartData = trendData || [];
  const productPerformance = productData || [];
  const deptData = departmentData || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value).replace("BDT", "৳");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `৳${(value / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {chartData.length === 0 && productPerformance.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No data available yet. Add sales and transactions to see analytics.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
