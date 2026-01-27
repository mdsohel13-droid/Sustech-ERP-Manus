import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, TrendingUpIcon } from "lucide-react";
import { getFinanceMetrics, generateTrendData } from "@/lib/analyticsUtils";

export function FinanceAnalyticsDashboard() {
  const metrics = getFinanceMetrics({});
  const trendData = generateTrendData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value).replace("BDT", "৳");
  };

  const financeMetrics = [
    {
      label: "Total Revenue",
      value: metrics.totalRevenue,
      change: metrics.revenueChange,
      trend: "up" as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      label: "Total Expenses",
      value: metrics.totalExpenses,
      change: metrics.expensesChange,
      trend: "up" as const,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-red-600",
    },
    {
      label: "Net Profit",
      value: metrics.netProfit,
      change: 15.3,
      trend: "up" as const,
      icon: <TrendingUpIcon className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      label: "Profit Margin",
      value: metrics.profitMargin,
      change: 2.1,
      trend: "up" as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ];

  const cashFlowData = [
    { month: "Jan", inflow: 130000, outflow: 95000 },
    { month: "Feb", inflow: 145000, outflow: 100000 },
    { month: "Mar", inflow: 156500, outflow: 105000 },
    { month: "Apr", inflow: 142000, outflow: 98000 },
    { month: "May", inflow: 168000, outflow: 110000 },
    { month: "Jun", inflow: 185000, outflow: 115000 },
  ];

  const expenseBreakdown = [
    { name: "Salaries", value: 350000, color: "#3b82f6" },
    { name: "Operations", value: 180000, color: "#10b981" },
    { name: "Marketing", value: 95000, color: "#f59e0b" },
    { name: "Utilities", value: 45000, color: "#8b5cf6" },
    { name: "Other", value: 10000, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Finance Analytics</h2>
        <p className="text-muted-foreground">Financial performance, cash flow, and expense analysis</p>
      </div>

      {/* Finance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">
                    {metric.label.includes("Margin") ? `${metric.value}%` : formatCurrency(metric.value as number)}
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

      {/* Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="inflow" fill="#10b981" name="Cash Inflow" />
              <Bar dataKey="outflow" fill="#ef4444" name="Cash Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown & AR/AP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receivables & Payables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Accounts Receivable</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(metrics.accountsReceivable)}</p>
              <p className="text-xs text-blue-800 mt-2">Outstanding invoices from customers</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900">Accounts Payable</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(metrics.accountsPayable)}</p>
              <p className="text-xs text-orange-800 mt-2">Outstanding payments to vendors</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">Net Position</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(metrics.accountsReceivable - metrics.accountsPayable)}
              </p>
              <p className="text-xs text-green-800 mt-2">AR minus AP balance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
