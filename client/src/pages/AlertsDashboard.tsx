import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Filter, Eye, EyeOff, Bell, Settings } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  category: 'financial' | 'inventory' | 'operations' | 'hr' | 'sales' | 'projects';
  status: 'healthy' | 'warning' | 'critical';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  affectedItems?: string[];
  recommendedAction?: string;
  acknowledged: boolean;
}

interface AlertMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface AlertPreference {
  category: string;
  enabled: boolean;
  channels: ('email' | 'sms' | 'in-app' | 'webhook')[];
}

export default function AlertsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history' | 'preferences'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - Active alerts
  const activeAlerts: Alert[] = [
    {
      id: 'alert-1',
      name: 'Invoices Overdue 90+ Days',
      category: 'financial',
      status: 'critical',
      severity: 'critical',
      message: 'Multiple invoices are overdue by 90+ days, affecting cash flow',
      value: 3,
      threshold: 0,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      affectedItems: ['INV-2025-001', 'INV-2025-002', 'INV-2025-003'],
      recommendedAction: 'Contact customers immediately and arrange payment plans',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      name: 'Products Below Reorder Point',
      category: 'inventory',
      status: 'warning',
      severity: 'warning',
      message: 'Multiple products have fallen below their reorder points',
      value: 5,
      threshold: 0,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      affectedItems: ['SKU-001', 'SKU-002', 'SKU-003', 'SKU-004', 'SKU-005'],
      recommendedAction: 'Create purchase orders for low stock items',
      acknowledged: false,
    },
    {
      id: 'alert-3',
      name: 'Department Budget Exceeded',
      category: 'financial',
      status: 'critical',
      severity: 'critical',
      message: 'Operations department has exceeded its quarterly budget by 15%',
      value: 115,
      threshold: 100,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      affectedItems: ['Operations'],
      recommendedAction: 'Review expenses and seek approval for budget increase',
      acknowledged: false,
    },
    {
      id: 'alert-4',
      name: 'Overdue Action Items',
      category: 'operations',
      status: 'warning',
      severity: 'warning',
      message: 'Several action items are overdue and require immediate attention',
      value: 4,
      threshold: 0,
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      affectedItems: ['ACTION-001', 'ACTION-002', 'ACTION-003', 'ACTION-004'],
      recommendedAction: 'Prioritize and complete overdue action items',
      acknowledged: false,
    },
    {
      id: 'alert-5',
      name: 'High Credit Exposure to Customer',
      category: 'sales',
      status: 'warning',
      severity: 'warning',
      message: 'Customer ABC Corp has reached 85% of their credit limit',
      value: 85,
      threshold: 80,
      timestamp: new Date(Date.now() - 120 * 60 * 1000),
      affectedItems: ['CUST-ABC-001'],
      recommendedAction: 'Review credit terms and consider reducing exposure',
      acknowledged: false,
    },
    {
      id: 'alert-6',
      name: 'Project Behind Schedule',
      category: 'projects',
      status: 'warning',
      severity: 'warning',
      message: 'Project X is 2 weeks behind schedule',
      value: 14,
      threshold: 0,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      affectedItems: ['PROJECT-X'],
      recommendedAction: 'Review project schedule and allocate additional resources',
      acknowledged: false,
    },
  ];

  // Mock metrics
  const metrics: AlertMetrics = {
    totalAlerts: activeAlerts.length,
    criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
    warningAlerts: activeAlerts.filter(a => a.severity === 'warning').length,
    infoAlerts: activeAlerts.filter(a => a.severity === 'info').length,
    systemStatus: activeAlerts.some(a => a.severity === 'critical') ? 'critical' : 'warning',
    lastUpdated: new Date(),
  };

  // Alert preferences
  const [preferences, setPreferences] = useState<AlertPreference[]>([
    {
      category: 'financial',
      enabled: true,
      channels: ['email', 'in-app'],
    },
    {
      category: 'inventory',
      enabled: true,
      channels: ['email', 'in-app'],
    },
    {
      category: 'operations',
      enabled: true,
      channels: ['in-app'],
    },
    {
      category: 'hr',
      enabled: true,
      channels: ['email'],
    },
    {
      category: 'sales',
      enabled: true,
      channels: ['email', 'in-app'],
    },
    {
      category: 'projects',
      enabled: true,
      channels: ['in-app'],
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      case 'inventory':
        return 'bg-green-100 text-green-800';
      case 'operations':
        return 'bg-blue-100 text-blue-800';
      case 'hr':
        return 'bg-pink-100 text-pink-800';
      case 'sales':
        return 'bg-orange-100 text-orange-800';
      case 'projects':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailDialog(true);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    // In production, this would call a tRPC mutation
    console.log('Acknowledging alert:', alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    // In production, this would call a tRPC mutation
    console.log('Dismissing alert:', alertId);
  };

  const filteredAlerts = activeAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alerts & Monitoring Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button onClick={() => setShowPreferencesDialog(true)} variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </Button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className={`p-4 rounded-lg border-l-4 ${
        metrics.systemStatus === 'critical'
          ? 'bg-red-50 border-red-500'
          : metrics.systemStatus === 'warning'
          ? 'bg-yellow-50 border-yellow-500'
          : 'bg-green-50 border-green-500'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg capitalize">{metrics.systemStatus} System Status</h2>
            <p className="text-sm text-gray-600 mt-1">Last updated: {metrics.lastUpdated.toLocaleTimeString()}</p>
          </div>
          {metrics.systemStatus === 'critical' && (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.criticalAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.warningAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Bell className="w-4 h-4 text-blue-600" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics.infoAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Informational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92%</div>
            <p className="text-xs text-gray-500 mt-1">Avg. 4.2 hrs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'active', 'history', 'preferences'].map(tab => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts
                .filter(a => a.severity === 'critical')
                .map(alert => (
                  <div key={alert.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-red-900">{alert.name}</h4>
                        <p className="text-xs text-red-700 mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Warning Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Warning Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts
                .filter(a => a.severity === 'warning')
                .map(alert => (
                  <div key={alert.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-yellow-900">{alert.name}</h4>
                        <p className="text-xs text-yellow-700 mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Alerts by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['financial', 'inventory', 'operations', 'hr', 'sales', 'projects'].map(category => {
                const count = activeAlerts.filter(a => a.category === category).length;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <Badge className={getCategoryColor(category)}>{category}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-64 px-3 py-2 border rounded-md"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="financial">Financial</option>
              <option value="inventory">Inventory</option>
              <option value="operations">Operations</option>
              <option value="hr">HR</option>
              <option value="sales">Sales</option>
              <option value="projects">Projects</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.name}</h3>
                        <Badge className={getCategoryColor(alert.category)}>
                          {alert.category}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      {alert.affectedItems && alert.affectedItems.length > 0 && (
                        <div className="text-xs mb-2">
                          <span className="font-semibold">Affected Items:</span> {alert.affectedItems.join(', ')}
                        </div>
                      )}
                      <p className="text-xs text-gray-600">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(alert)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Alert History (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-center py-8 text-gray-600">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Alert history will be displayed here</p>
              <p className="text-sm">Showing resolved and acknowledged alerts from the past 30 days</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          {preferences.map(pref => (
            <Card key={pref.category}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">{pref.category} Alerts</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreferences(prefs =>
                        prefs.map(p =>
                          p.category === pref.category ? { ...p, enabled: !p.enabled } : p
                        )
                      );
                    }}
                  >
                    {pref.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Notification Channels:</p>
                  <div className="flex gap-4">
                    {['email', 'sms', 'in-app', 'webhook'].map(channel => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.channels.includes(channel as any)}
                          onChange={(e) => {
                            setPreferences(prefs =>
                              prefs.map(p =>
                                p.category === pref.category
                                  ? {
                                      ...p,
                                      channels: e.target.checked
                                        ? [...p.channels, channel as any]
                                        : p.channels.filter(c => c !== channel),
                                    }
                                  : p
                              )
                            );
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Detail Dialog */}
      {selectedAlert && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAlert.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Severity</p>
                <Badge className={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity.toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Category</p>
                <Badge className={getCategoryColor(selectedAlert.category)}>
                  {selectedAlert.category}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Message</p>
                <p className="text-sm font-medium">{selectedAlert.message}</p>
              </div>

              {selectedAlert.value !== undefined && selectedAlert.threshold !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-sm font-medium">
                    {selectedAlert.value} (Threshold: {selectedAlert.threshold})
                  </p>
                </div>
              )}

              {selectedAlert.affectedItems && selectedAlert.affectedItems.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Affected Items</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAlert.affectedItems.map(item => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Recommended Action</p>
                <p className="text-sm font-medium">{selectedAlert.recommendedAction}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="text-sm font-medium">{selectedAlert.timestamp.toLocaleString()}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              <Button onClick={() => handleAcknowledgeAlert(selectedAlert.id)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Preferences Dialog */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alert Preferences</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Auto Refresh Interval</label>
              <select className="w-full px-3 py-2 border rounded-md mt-1">
                <option>Every 30 seconds</option>
                <option>Every 1 minute</option>
                <option>Every 5 minutes</option>
                <option>Every 10 minutes</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Sound Notifications</label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
                <Button variant="outline" size="sm">
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Desktop Notifications</label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
                <Button variant="outline" size="sm">
                  Disabled
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreferencesDialog(false)}>
              Close
            </Button>
            <Button onClick={() => setShowPreferencesDialog(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
