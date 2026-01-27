import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, PieChart, Download, Filter, Plus, Eye, Edit2, Trash2, TrendingUp, Calendar } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'sales' | 'financial' | 'inventory' | 'hr' | 'custom';
  description: string;
  lastRun: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  owner: string;
  status: 'active' | 'inactive';
  recipients: number;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: number;
  lastModified: string;
  owner: string;
  shared: boolean;
  views: number;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'on-track' | 'at-risk' | 'off-track';
}

export default function ReportingAnalyticsEnhanced() {
  const [activeTab, setActiveTab] = useState<'dashboards' | 'reports' | 'kpis' | 'exports'>('dashboards');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const dashboards: Dashboard[] = [
    {
      id: '1',
      name: 'Executive Dashboard',
      description: 'High-level business metrics and KPIs',
      widgets: 12,
      lastModified: '2026-01-24',
      owner: 'CFO',
      shared: true,
      views: 245,
    },
    {
      id: '2',
      name: 'Sales Performance',
      description: 'Sales metrics, pipeline, and forecasting',
      widgets: 8,
      lastModified: '2026-01-23',
      owner: 'Sales Manager',
      shared: true,
      views: 156,
    },
    {
      id: '3',
      name: 'Operations Dashboard',
      description: 'Inventory, projects, and resource utilization',
      widgets: 10,
      lastModified: '2026-01-22',
      owner: 'Operations Manager',
      shared: false,
      views: 89,
    },
    {
      id: '4',
      name: 'Financial Overview',
      description: 'Revenue, expenses, and profitability',
      widgets: 9,
      lastModified: '2026-01-21',
      owner: 'Finance Manager',
      shared: true,
      views: 312,
    },
  ];

  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Sales Report',
      type: 'sales',
      description: 'Comprehensive sales analysis by product, region, and customer',
      lastRun: '2026-01-24',
      frequency: 'monthly',
      owner: 'Sales Manager',
      status: 'active',
      recipients: 8,
    },
    {
      id: '2',
      name: 'Financial Statement',
      type: 'financial',
      description: 'Income statement, balance sheet, and cash flow',
      lastRun: '2026-01-24',
      frequency: 'monthly',
      owner: 'Finance Manager',
      status: 'active',
      recipients: 5,
    },
    {
      id: '3',
      name: 'Inventory Valuation',
      type: 'inventory',
      description: 'Stock levels, valuation, and movement analysis',
      lastRun: '2026-01-23',
      frequency: 'weekly',
      owner: 'Inventory Manager',
      status: 'active',
      recipients: 3,
    },
    {
      id: '4',
      name: 'HR Analytics',
      type: 'hr',
      description: 'Headcount, turnover, and performance metrics',
      lastRun: '2026-01-22',
      frequency: 'monthly',
      owner: 'HR Manager',
      status: 'active',
      recipients: 4,
    },
    {
      id: '5',
      name: 'Custom Project Report',
      type: 'custom',
      description: 'Project status, budget, and timeline tracking',
      lastRun: '2026-01-20',
      frequency: 'on-demand',
      owner: 'Project Manager',
      status: 'inactive',
      recipients: 2,
    },
  ];

  const kpis: KPI[] = [
    {
      id: '1',
      name: 'Total Revenue',
      value: 2500000,
      target: 2800000,
      unit: '৳',
      trend: 'up',
      trendPercent: 8.5,
      status: 'on-track',
    },
    {
      id: '2',
      name: 'Gross Profit Margin',
      value: 42,
      target: 45,
      unit: '%',
      trend: 'down',
      trendPercent: -2.3,
      status: 'at-risk',
    },
    {
      id: '3',
      name: 'Customer Satisfaction',
      value: 4.6,
      target: 4.8,
      unit: '/5',
      trend: 'stable',
      trendPercent: 0,
      status: 'on-track',
    },
    {
      id: '4',
      name: 'On-Time Delivery',
      value: 96,
      target: 98,
      unit: '%',
      trend: 'up',
      trendPercent: 1.2,
      status: 'on-track',
    },
    {
      id: '5',
      name: 'Inventory Turnover',
      value: 6.8,
      target: 7.5,
      unit: 'x/year',
      trend: 'down',
      trendPercent: -3.1,
      status: 'off-track',
    },
    {
      id: '6',
      name: 'Employee Productivity',
      value: 88,
      target: 90,
      unit: '%',
      trend: 'up',
      trendPercent: 2.1,
      status: 'on-track',
    },
  ];

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowDetailDialog(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'inventory':
        return 'bg-purple-100 text-purple-800';
      case 'hr':
        return 'bg-orange-100 text-orange-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'off-track':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reporting & Analytics</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['dashboards', 'reports', 'kpis', 'exports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboards Tab */}
      {activeTab === 'dashboards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboards.map(dashboard => (
            <Card key={dashboard.id} className="hover:shadow-lg cursor-pointer transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-blue-600 hover:underline">{dashboard.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
                  </div>
                  {dashboard.shared && (
                    <Badge variant="secondary">Shared</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Widgets</span>
                    <span className="font-semibold">{dashboard.widgets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Owner</span>
                    <span className="font-semibold text-blue-600 hover:underline">{dashboard.owner}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{dashboard.views}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewReport(report)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Last Run</p>
                    <p className="font-semibold">{report.lastRun}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Frequency</p>
                    <p className="font-semibold capitalize">{report.frequency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Owner</p>
                    <p className="font-semibold text-blue-600 hover:underline">{report.owner}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recipients</p>
                    <p className="font-semibold">{report.recipients}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map(kpi => (
            <Card key={kpi.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
                  <Badge className={getStatusColor(kpi.status)}>
                    {kpi.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold">
                      {kpi.value.toLocaleString()}
                      <span className="text-lg text-gray-600 ml-1">{kpi.unit}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Target</p>
                      <p className="font-semibold">
                        {kpi.target.toLocaleString()}
                        <span className="text-sm text-gray-600 ml-1">{kpi.unit}</span>
                      </p>
                    </div>
                    <div className={`text-right ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      <p className="text-xs">Trend</p>
                      <p className="font-semibold flex items-center justify-end gap-1">
                        {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                        {Math.abs(kpi.trendPercent)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        kpi.status === 'on-track' ? 'bg-green-600' :
                        kpi.status === 'at-risk' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exports Tab */}
      {activeTab === 'exports' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Sales Report (PDF)</h3>
                      <p className="text-sm text-gray-600">Monthly sales analysis</p>
                    </div>
                    <Button className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Financial Data (Excel)</h3>
                      <p className="text-sm text-gray-600">Complete financial statements</p>
                    </div>
                    <Button className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Inventory Report (CSV)</h3>
                      <p className="text-sm text-gray-600">Stock levels and movements</p>
                    </div>
                    <Button className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedReport && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedReport.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <Badge className={getTypeColor(selectedReport.type)}>
                    {selectedReport.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={selectedReport.status === 'active' ? 'default' : 'secondary'}>
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedReport.owner}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Last Run</p>
                <p className="font-semibold">{selectedReport.lastRun}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Recipients</p>
                <p className="font-semibold">{selectedReport.recipients} people</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Report Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Name</label>
              <Input placeholder="Enter report name" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Sales</option>
                <option>Financial</option>
                <option>Inventory</option>
                <option>HR</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annual</option>
                <option>On-Demand</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Enter description" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
