import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, RefreshCw, AlertCircle, CheckCircle, Clock, User, FileText } from "lucide-react";

/**
 * Audit Trail Dashboard
 * Displays comprehensive audit logs and user activity tracking
 */
export default function AuditTrailDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock audit data
  const auditData = {
    totalActivities: 3847,
    successCount: 3756,
    failureCount: 91,
    successRate: 97.6,
    uniqueUsers: 24,
    activitiesByType: [
      { type: "VIEW", count: 1456, percentage: 37.9 },
      { type: "UPDATE", count: 987, percentage: 25.7 },
      { type: "CREATE", count: 654, percentage: 17.0 },
      { type: "DELETE", count: 234, percentage: 6.1 },
      { type: "EXPORT", count: 189, percentage: 4.9 },
      { type: "APPROVE", count: 127, percentage: 3.3 },
    ],
    recentActivities: [
      {
        id: "act-001",
        user: "Md. Sohel Sikder",
        action: "UPDATE",
        resource: "Sales Order #SO-2025-001",
        timestamp: new Date(Date.now() - 5 * 60000),
        status: "success",
        details: "Updated order status to Confirmed",
      },
      {
        id: "act-002",
        user: "Fatima Khan",
        action: "CREATE",
        resource: "Project: Website Redesign",
        timestamp: new Date(Date.now() - 15 * 60000),
        status: "success",
        details: "Created new project with budget ₹500,000",
      },
      {
        id: "act-003",
        user: "Ahmed Hassan",
        action: "DELETE",
        resource: "Customer: ABC Corp",
        timestamp: new Date(Date.now() - 30 * 60000),
        status: "failure",
        details: "Failed: Customer has active orders",
      },
      {
        id: "act-004",
        user: "Md. Sohel Sikder",
        action: "EXPORT",
        resource: "Financial Report",
        timestamp: new Date(Date.now() - 45 * 60000),
        status: "success",
        details: "Exported 156 invoices as PDF",
      },
      {
        id: "act-005",
        user: "Zainab Ali",
        action: "APPROVE",
        resource: "Tender: IT Services",
        timestamp: new Date(Date.now() - 60 * 60000),
        status: "success",
        details: "Approved tender with comment: Proceed with vendor",
      },
    ],
    userActivity: [
      { user: "Md. Sohel Sikder", activities: 287, lastActive: "2 minutes ago" },
      { user: "Fatima Khan", activities: 234, lastActive: "15 minutes ago" },
      { user: "Ahmed Hassan", activities: 198, lastActive: "1 hour ago" },
      { user: "Zainab Ali", activities: 156, lastActive: "3 hours ago" },
      { user: "Rahman Hossain", activities: 142, lastActive: "5 hours ago" },
    ],
    hourlyActivity: [
      { hour: "00:00", activities: 45, errors: 2 },
      { hour: "04:00", activities: 32, errors: 1 },
      { hour: "08:00", activities: 156, errors: 4 },
      { hour: "12:00", activities: 487, errors: 12 },
      { hour: "16:00", activities: 512, errors: 15 },
      { hour: "20:00", activities: 298, errors: 8 },
      { hour: "23:00", activities: 67, errors: 2 },
    ],
    failedActivities: [
      {
        id: "fail-001",
        user: "Ahmed Hassan",
        action: "DELETE",
        resource: "Customer: ABC Corp",
        timestamp: new Date(Date.now() - 30 * 60000),
        error: "Customer has active orders",
      },
      {
        id: "fail-002",
        user: "Rahman Hossain",
        action: "UPDATE",
        resource: "Invoice #INV-2025-001",
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        error: "Invoice is locked for editing",
      },
      {
        id: "fail-003",
        user: "Fatima Khan",
        action: "CREATE",
        resource: "Budget",
        timestamp: new Date(Date.now() - 4 * 60 * 60000),
        error: "Budget exceeds department limit",
      },
    ],
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(auditData, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute("download", `audit-trail-${dateRange}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredActivities = auditData.recentActivities.filter(
    (activity) =>
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail & Compliance</h1>
          <p className="text-gray-600 mt-2">Monitor user activities and system changes</p>
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
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditData.totalActivities.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-2">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{auditData.successRate}%</div>
            <p className="text-xs text-gray-600 mt-2">{auditData.successCount} successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditData.failureCount}</div>
            <p className="text-xs text-gray-600 mt-2">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditData.uniqueUsers}</div>
            <p className="text-xs text-gray-600 mt-2">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Compliant</div>
            <p className="text-xs text-gray-600 mt-2">All logs retained</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities" className="gap-2">
            <FileText className="w-4 h-4" />
            Recent Activities
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <User className="w-4 h-4" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="failures" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Failed Activities
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Clock className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Recent Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest user actions and system changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{activity.user}</span>
                          <Badge
                            variant={activity.action === "DELETE" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {activity.action}
                          </Badge>
                          {activity.status === "success" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{activity.resource}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
              <CardDescription>Activity count and last active time by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditData.userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{user.user}</p>
                      <p className="text-xs text-gray-600">Last active: {user.lastActive}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{user.activities}</p>
                      <p className="text-xs text-gray-600">activities</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Activities Tab */}
        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Activities</CardTitle>
              <CardDescription>Activities that resulted in errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditData.failedActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{activity.user}</span>
                          <Badge variant="destructive" className="text-xs">
                            {activity.action}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{activity.resource}</p>
                        <p className="text-xs text-red-600 mt-2">Error: {activity.error}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>Breakdown of activities by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={auditData.activitiesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity</CardTitle>
              <CardDescription>Activities and errors by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={auditData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activities" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Notes */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Compliance & Retention</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>• All audit logs are retained for 7 years as per regulatory requirements</p>
          <p>• Activity logs are immutable and cannot be modified after creation</p>
          <p>• All failed activities are flagged for review and investigation</p>
          <p>• User access is logged and tracked for security purposes</p>
        </CardContent>
      </Card>
    </div>
  );
}
