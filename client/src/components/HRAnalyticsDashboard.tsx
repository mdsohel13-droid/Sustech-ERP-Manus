import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, UserCheck, Clock, AlertCircle } from "lucide-react";
import { getHRMetrics, getDepartmentMetrics } from "@/lib/analyticsUtils";

export function HRAnalyticsDashboard() {
  const metrics = getHRMetrics({});
  const departmentData = getDepartmentMetrics();

  const hrMetrics = [
    {
      label: "Total Employees",
      value: metrics.totalEmployees,
      change: metrics.employeeChange,
      trend: "up" as const,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      label: "Active Employees",
      value: metrics.activeEmployees,
      change: 0.5,
      trend: "up" as const,
      icon: <UserCheck className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      label: "Attendance Rate",
      value: `${metrics.attendanceRate}%`,
      change: metrics.attendanceChange,
      trend: "down" as const,
      icon: <Clock className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      label: "Turnover Rate",
      value: `${metrics.turnoverRate}%`,
      change: -0.3,
      trend: "down" as const,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-red-600",
    },
  ];

  const attendanceData = [
    { month: "Jan", present: 1900, absent: 100, leave: 200 },
    { month: "Feb", present: 1880, absent: 120, leave: 200 },
    { month: "Mar", present: 1920, absent: 80, leave: 200 },
    { month: "Apr", present: 1910, absent: 90, leave: 200 },
    { month: "May", present: 1930, absent: 70, leave: 200 },
    { month: "Jun", present: 1940, absent: 60, leave: 200 },
  ];

  const salaryData = [
    { range: "20k-30k", count: 15 },
    { range: "30k-40k", count: 28 },
    { range: "40k-50k", count: 32 },
    { range: "50k-60k", count: 18 },
    { range: "60k+", count: 7 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value).replace("BDT", "৳");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">HR Analytics</h2>
        <p className="text-muted-foreground">Employee metrics, attendance, and workforce insights</p>
      </div>

      {/* HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hrMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
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

      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="leave" fill="#f59e0b" name="Leave" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department & Salary Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Distribution by Department</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* HR Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            HR Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900">✓ Strong Attendance</p>
            <p className="text-xs text-green-800 mt-1">Attendance rate of {metrics.attendanceRate}% is excellent. Team commitment is high.</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">ℹ️ Average Salary</p>
            <p className="text-xs text-blue-800 mt-1">Current average salary is {formatCurrency(metrics.averageSalary)} with {metrics.departmentCount} departments.</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-900">⚠️ Low Turnover</p>
            <p className="text-xs text-orange-800 mt-1">Turnover rate of {metrics.turnoverRate}% is healthy. Consider retention programs for key talent.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
