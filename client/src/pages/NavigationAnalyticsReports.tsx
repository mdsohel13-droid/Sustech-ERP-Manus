import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, RefreshCw, TrendingUp, Users, Navigation, Zap } from "lucide-react";

/**
 * Navigation Analytics Reports Page
 * Provides comprehensive analytics on user navigation patterns, hyperlink usage,
 * and module popularity for optimizing information architecture.
 */
export default function NavigationAnalyticsReports() {
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for navigation analytics
  const navigationData = {
    totalNavigations: 2847,
    uniqueUsers: 156,
    averageSessionDuration: 12.5,
    bounceRate: 18.3,
    mostVisitedModules: [
      { module: "Sales", visits: 487, percentage: 17.1 },
      { module: "Projects", visits: 412, percentage: 14.5 },
      { module: "Financial", visits: 356, percentage: 12.5 },
      { module: "Customers", visits: 298, percentage: 10.5 },
      { module: "CRM", visits: 267, percentage: 9.4 },
      { module: "Others", visits: 1027, percentage: 36.1 },
    ],
    navigationPaths: [
      { path: "Home → Sales → Customers", count: 156, percentage: 5.5 },
      { path: "Home → Projects → Financial", count: 142, percentage: 5.0 },
      { path: "Home → CRM → Customers", count: 128, percentage: 4.5 },
      { path: "Home → Financial → Budget", count: 115, percentage: 4.0 },
      { path: "Home → Action Tracker → Projects", count: 103, percentage: 3.6 },
      { path: "Other paths", count: 2303, percentage: 81.0 },
    ],
    topHyperlinks: [
      { name: "Customer Name (Sales)", clicks: 487, module: "Sales", field: "Customer Name" },
      { name: "Project Name (Projects)", clicks: 412, module: "Projects", field: "Project Name" },
      { name: "Invoice Number (Financial)", clicks: 356, module: "Financial", field: "Invoice Number" },
      { name: "Order Name (Sales)", clicks: 298, module: "Sales", field: "Order Name" },
      { name: "Lead Name (CRM)", clicks: 267, module: "CRM", field: "Lead Name" },
      { name: "Employee Name (HR)", clicks: 234, module: "HR", field: "Employee Name" },
    ],
    hourlyActivity: [
      { hour: "00:00", navigations: 45 },
      { hour: "04:00", navigations: 32 },
      { hour: "08:00", navigations: 156 },
      { hour: "12:00", navigations: 287 },
      { hour: "16:00", navigations: 312 },
      { hour: "20:00", navigations: 198 },
      { hour: "23:00", navigations: 67 },
    ],
    modulePerformance: [
      { module: "Sales", avgTimeSpent: 4.2, bounceRate: 12.3, conversions: 87 },
      { module: "Projects", avgTimeSpent: 5.8, bounceRate: 15.6, conversions: 72 },
      { module: "Financial", avgTimeSpent: 3.9, bounceRate: 18.9, conversions: 65 },
      { module: "Customers", avgTimeSpent: 3.2, bounceRate: 22.1, conversions: 58 },
      { module: "CRM", avgTimeSpent: 4.5, bounceRate: 16.7, conversions: 64 },
      { module: "HR", avgTimeSpent: 2.8, bounceRate: 25.3, conversions: 42 },
    ],
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExport = (format: string) => {
    // Export analytics data in specified format
    const data = JSON.stringify(navigationData, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute("download", `navigation-analytics-${dateRange}.${format}`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Analytics Reports</h1>
          <p className="text-gray-600 mt-2">Analyze user navigation patterns and module usage</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Navigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{navigationData.totalNavigations.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-2">↑ 12.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{navigationData.uniqueUsers}</div>
            <p className="text-xs text-green-600 mt-2">↑ 8.3% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{navigationData.averageSessionDuration}m</div>
            <p className="text-xs text-red-600 mt-2">↓ 2.1% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{navigationData.bounceRate}%</div>
            <p className="text-xs text-green-600 mt-2">↓ 3.2% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" className="gap-2">
            <Navigation className="w-4 h-4" />
            Module Usage
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Navigation Paths
          </TabsTrigger>
          <TabsTrigger value="hyperlinks" className="gap-2">
            <Zap className="w-4 h-4" />
            Top Hyperlinks
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Users className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Module Usage Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Modules</CardTitle>
              <CardDescription>Module usage distribution over the selected period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={navigationData.mostVisitedModules}
                    dataKey="visits"
                    nameKey="module"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {navigationData.mostVisitedModules.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} visits`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {navigationData.mostVisitedModules.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.module}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.visits}</div>
                      <div className="text-xs text-gray-600">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity</CardTitle>
              <CardDescription>Navigation activity by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={navigationData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="navigations" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Navigation Paths</CardTitle>
              <CardDescription>Most common user navigation sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {navigationData.navigationPaths.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.path}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.count} times
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{item.percentage}% of all navigations</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Hyperlinks Tab */}
        <TabsContent value="hyperlinks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Clicked Hyperlinks</CardTitle>
              <CardDescription>Top performing hyperlinks driving navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={navigationData.topHyperlinks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                {navigationData.topHyperlinks.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.module} → {item.field}</div>
                    </div>
                    <div className="font-bold text-blue-600">{item.clicks}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis for each module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Module</th>
                      <th className="text-left py-3 px-4 font-semibold">Avg Time Spent</th>
                      <th className="text-left py-3 px-4 font-semibold">Bounce Rate</th>
                      <th className="text-left py-3 px-4 font-semibold">Conversions</th>
                      <th className="text-left py-3 px-4 font-semibold">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {navigationData.modulePerformance.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.module}</td>
                        <td className="py-3 px-4">{item.avgTimeSpent}m</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.bounceRate < 15
                                ? "bg-green-100 text-green-800"
                                : item.bounceRate < 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.bounceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">{item.conversions}</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.bounceRate < 15
                                  ? "bg-green-500"
                                  : item.bounceRate < 20
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${100 - item.bounceRate}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <p>
            • <strong>Optimize Sales Module:</strong> With 17.1% of all navigations, consider adding quick shortcuts or favorites for top hyperlinks
          </p>
          <p>
            • <strong>Improve CRM Engagement:</strong> CRM has a 16.7% bounce rate. Review navigation paths and consider adding contextual help
          </p>
          <p>
            • <strong>Streamline HR Access:</strong> HR module shows lowest engagement (2.8m avg time). Consider reorganizing or improving discoverability
          </p>
          <p>
            • <strong>Leverage Top Paths:</strong> The "Home → Sales → Customers" path accounts for 5.5% of navigations. Consider creating a shortcut
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
