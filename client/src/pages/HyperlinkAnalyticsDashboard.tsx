import React, { useState, useEffect } from "react";
import { hyperlinkAnalytics, getModuleIcon, formatModuleName } from "@/lib/hyperlinkUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function HyperlinkAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(hyperlinkAnalytics.getAnalytics());
  const [activeTab, setActiveTab] = useState<"overview" | "modules" | "paths" | "top">("overview");

  useEffect(() => {
    // Load events from localStorage
    hyperlinkAnalytics.loadEvents();
    setAnalytics(hyperlinkAnalytics.getAnalytics());

    // Refresh analytics every 5 seconds
    const interval = setInterval(() => {
      setAnalytics(hyperlinkAnalytics.getAnalytics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const moduleData = Object.entries(analytics.clicksByModule).map(([module, clicks]) => ({
    name: formatModuleName(module),
    clicks,
  }));

  const navigationData = analytics.navigationPaths.slice(0, 10).map((path) => ({
    name: `${formatModuleName(path.from)} → ${formatModuleName(path.to)}`,
    clicks: path.count,
  }));

  const handleExport = () => {
    const data = hyperlinkAnalytics.exportAnalytics();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hyperlink-analytics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      hyperlinkAnalytics.clearEvents();
      setAnalytics(hyperlinkAnalytics.getAnalytics());
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hyperlink Analytics</h1>
          <p className="text-muted-foreground mt-1">Track user navigation patterns and module usage</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            📥 Export
          </Button>
          <Button onClick={handleClear} variant="outline" className="text-red-600">
            🗑️ Clear
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Hyperlink interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(analytics.clicksByModule).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Modules with hyperlinks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Navigation Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.navigationPaths.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Cross-module paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Clicks/Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(analytics.clicksByModule).length > 0
                ? Math.round(analytics.totalClicks / Object.keys(analytics.clicksByModule).length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average per module</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(["overview", "modules", "paths", "top"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" && "📊 Overview"}
            {tab === "modules" && "📦 By Module"}
            {tab === "paths" && "🔄 Navigation Paths"}
            {tab === "top" && "⭐ Top Hyperlinks"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clicks by Module</CardTitle>
              <CardDescription>Distribution of hyperlink clicks across modules</CardDescription>
            </CardHeader>
            <CardContent>
              {moduleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module Distribution</CardTitle>
              <CardDescription>Percentage of clicks per module</CardDescription>
            </CardHeader>
            <CardContent>
              {moduleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moduleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="clicks"
                    >
                      {moduleData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <Card>
          <CardHeader>
            <CardTitle>Clicks by Module</CardTitle>
            <CardDescription>Detailed breakdown of hyperlink usage per module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.clicksByModule)
                .sort(([, a], [, b]) => b - a)
                .map(([module, clicks]) => (
                  <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getModuleIcon(module)}</span>
                      <div>
                        <p className="font-medium">{formatModuleName(module)}</p>
                        <p className="text-xs text-muted-foreground">{module}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{clicks} clicks</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Paths Tab */}
      {activeTab === "paths" && (
        <Card>
          <CardHeader>
            <CardTitle>Navigation Paths</CardTitle>
            <CardDescription>Most common cross-module navigation routes</CardDescription>
          </CardHeader>
          <CardContent>
            {navigationData.length > 0 ? (
              <div className="space-y-3">
                {navigationData.map((path, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{path.name}</span>
                    </div>
                    <Badge>{path.clicks} navigations</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No navigation data yet
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Hyperlinks Tab */}
      {activeTab === "top" && (
        <Card>
          <CardHeader>
            <CardTitle>Top Hyperlinks</CardTitle>
            <CardDescription>Most frequently clicked hyperlinks</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topHyperlinks.length > 0 ? (
              <div className="space-y-3">
                {analytics.topHyperlinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getModuleIcon(link.module)}</span>
                      <div>
                        <p className="font-medium">{link.field}</p>
                        <p className="text-xs text-muted-foreground">{formatModuleName(link.module)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge>{link.clicks} clicks</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((link.clicks / analytics.totalClicks) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No hyperlink data yet
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
