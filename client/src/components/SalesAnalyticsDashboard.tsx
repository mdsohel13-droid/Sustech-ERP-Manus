import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Target } from "lucide-react";
import { getSalesMetrics, generateTrendData } from "@/lib/analyticsUtils";

export function SalesAnalyticsDashboard() {
  const metrics = getSalesMetrics({});
  const trendData = generateTrendData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value).replace("BDT", "৳");
  };

  const salesMetrics = [
    {
      label: "Total Sales Value",
      value: metrics.totalSalesValue,
      change: metrics.salesChange,
      trend: "up" as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      label: "Total Orders",
      value: metrics.totalOrders,
      change: metrics.ordersChange,
      trend: metrics.ordersChange > 0 ? "up" : "down",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      label: "Average Order Value",
      value: metrics.averageOrderValue,
      change: 3.2,
      trend: "up" as const,
      icon: <Target className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      label: "Conversion Rate",
      value: metrics.conversionRate,
      change: 1.5,
      trend: "up" as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sales Analytics</h2>
        <p className="text-muted-foreground">Real-time sales performance and customer insights</p>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">
                    {metric.label.includes("Value") ? formatCurrency(metric.value as number) : metric.value}
                    {metric.label.includes("Rate") && "%"}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={metric.trend === "up" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                      {metric.trend === "up" ? "+" : ""}{metric.change}% from last period
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center ${metric.color}`}>
                  <div className={metric.color}>{metric.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Sales Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.topCustomer}</p>
            <p className="text-sm text-muted-foreground mt-2">Accounts for 8% of total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Product</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.topProduct}</p>
            <p className="text-sm text-muted-foreground mt-2">245 units sold this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
