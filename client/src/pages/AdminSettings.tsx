import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertCircle,
  Bell,
  Settings,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AlertThreshold {
  id: string;
  name: string;
  category: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  threshold: number;
  threshold2?: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

interface WorkflowTriggerCondition {
  id: string;
  triggerId: string;
  triggerName: string;
  eventType: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    target: string;
  }>;
  enabled: boolean;
}

interface NotificationPreference {
  id: string;
  category: string;
  channels: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    inApp: boolean;
  };
  enabled: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface DashboardWidgetConfig {
  id: string;
  name: string;
  type: string;
  position: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  refreshInterval: number;
  customSettings?: Record<string, any>;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'workflows' | 'notifications' | 'dashboard'>('alerts');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertThreshold | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // Mock data
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>([
    {
      id: 'threshold-1',
      name: 'Overdue Invoices',
      category: 'financial',
      metric: 'days_overdue',
      operator: 'greater_than',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      notificationChannels: ['email', 'in-app'],
    },
    {
      id: 'threshold-2',
      name: 'Low Inventory',
      category: 'inventory',
      metric: 'stock_level',
      operator: 'less_than',
      threshold: 50,
      severity: 'warning',
      enabled: true,
      notificationChannels: ['email', 'sms'],
    },
    {
      id: 'threshold-3',
      name: 'Budget Overspend',
      category: 'financial',
      metric: 'budget_utilization',
      operator: 'greater_than',
      threshold: 100,
      severity: 'critical',
      enabled: true,
      notificationChannels: ['email', 'in-app', 'webhook'],
    },
  ]);

  const [workflowTriggers, setWorkflowTriggers] = useState<WorkflowTriggerCondition[]>([
    {
      id: 'workflow-1',
      triggerId: 'trigger-1',
      triggerName: 'Invoice Overdue Reminder',
      eventType: 'invoice.overdue',
      conditions: [
        { field: 'days_overdue', operator: 'greater_than', value: '90' },
      ],
      actions: [
        { type: 'email', target: 'customer' },
        { type: 'notification', target: 'finance_team' },
      ],
      enabled: true,
    },
    {
      id: 'workflow-2',
      triggerId: 'trigger-2',
      triggerName: 'High Value Order Approval',
      eventType: 'order.created',
      conditions: [
        { field: 'order_amount', operator: 'greater_than', value: '100000' },
      ],
      actions: [
        { type: 'approval', target: 'sales_manager' },
        { type: 'notification', target: 'sales_team' },
      ],
      enabled: true,
    },
  ]);

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: 'pref-1',
      category: 'financial',
      channels: { email: true, sms: true, webhook: true, inApp: true },
      enabled: true,
      quietHours: { enabled: true, startTime: '18:00', endTime: '09:00' },
    },
    {
      id: 'pref-2',
      category: 'inventory',
      channels: { email: true, sms: true, webhook: false, inApp: true },
      enabled: true,
    },
    {
      id: 'pref-3',
      category: 'operations',
      channels: { email: true, sms: false, webhook: true, inApp: true },
      enabled: true,
    },
  ]);

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig[]>([
    {
      id: 'widget-1',
      name: 'Total Revenue',
      type: 'metric',
      position: 1,
      size: 'small',
      visible: true,
      refreshInterval: 300,
    },
    {
      id: 'widget-2',
      name: 'Net Profit',
      type: 'metric',
      position: 2,
      size: 'small',
      visible: true,
      refreshInterval: 300,
    },
    {
      id: 'widget-3',
      name: 'Revenue Trend',
      type: 'chart',
      position: 3,
      size: 'large',
      visible: true,
      refreshInterval: 600,
    },
    {
      id: 'widget-4',
      name: 'Alerts & Notifications',
      type: 'alerts',
      position: 4,
      size: 'medium',
      visible: true,
      refreshInterval: 60,
    },
  ]);

  const handleSaveChanges = () => {
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    setHasChanges(false);
    setShowSaveDialog(false);
    // In production, save to database
    console.log('Changes saved');
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset logic here
      setHasChanges(false);
    }
  };

  const handleAddAlertThreshold = () => {
    setEditingAlert(null);
    setShowAlertDialog(true);
  };

  const handleEditAlertThreshold = (alert: AlertThreshold) => {
    setEditingAlert(alert);
    setShowAlertDialog(true);
  };

  const handleDeleteAlertThreshold = (id: string) => {
    setAlertThresholds(alertThresholds.filter(a => a.id !== id));
    setHasChanges(true);
  };

  const handleToggleAlertThreshold = (id: string) => {
    setAlertThresholds(
      alertThresholds.map(a =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    );
    setHasChanges(true);
  };

  const handleToggleWorkflowTrigger = (id: string) => {
    setWorkflowTriggers(
      workflowTriggers.map(w =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      )
    );
    setHasChanges(true);
  };

  const handleToggleNotificationChannel = (prefId: string, channel: keyof NotificationPreference['channels']) => {
    setNotificationPreferences(
      notificationPreferences.map(p =>
        p.id === prefId
          ? {
              ...p,
              channels: {
                ...p.channels,
                [channel]: !p.channels[channel],
              },
            }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleToggleDashboardWidget = (id: string) => {
    setDashboardWidgets(
      dashboardWidgets.map(w =>
        w.id === id ? { ...w, visible: !w.visible } : w
      )
    );
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['alerts', 'workflows', 'notifications', 'dashboard'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'alerts' && '⚠️ Alert Thresholds'}
            {tab === 'workflows' && '⚙️ Workflow Triggers'}
            {tab === 'notifications' && '🔔 Notifications'}
            {tab === 'dashboard' && '📊 Dashboard Widgets'}
          </button>
        ))}
      </div>

      {/* Alert Thresholds Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alert Thresholds</h2>
            <Button onClick={handleAddAlertThreshold} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Threshold
            </Button>
          </div>

          <div className="space-y-3">
            {alertThresholds.map(alert => (
              <Card key={alert.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {alert.category}
                        </Badge>
                        <Badge
                          className={
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Trigger when {alert.metric} is {alert.operator.replace('_', ' ')} {alert.threshold}
                        {alert.threshold2 && ` and ${alert.threshold2}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAlertThreshold(alert.id)}
                      >
                        {alert.enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAlertThreshold(alert)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlertThreshold(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <button
                        onClick={() =>
                          setExpandedAlert(expandedAlert === alert.id ? null : alert.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {expandedAlert === alert.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>

                {expandedAlert === alert.id && (
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Notification Channels</p>
                      <div className="flex gap-2 flex-wrap">
                        {['email', 'sms', 'webhook', 'in-app'].map(channel => (
                          <Badge
                            key={channel}
                            variant={
                              alert.notificationChannels.includes(channel)
                                ? 'default'
                                : 'outline'
                            }
                            className="cursor-pointer"
                          >
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Test Alert
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Triggers Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Workflow Trigger Conditions</h2>

          <div className="space-y-3">
            {workflowTriggers.map(workflow => (
              <Card key={workflow.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{workflow.triggerName}</h3>
                      <p className="text-sm text-gray-600">
                        Event: <span className="font-mono">{workflow.eventType}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleWorkflowTrigger(workflow.id)}
                      >
                        {workflow.enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <button
                        onClick={() =>
                          setExpandedAlert(expandedAlert === workflow.id ? null : workflow.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {expandedAlert === workflow.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>

                {expandedAlert === workflow.id && (
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Conditions</p>
                      <div className="space-y-2">
                        {workflow.conditions.map((condition, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-gray-50 rounded border text-sm"
                          >
                            <span className="font-mono">{condition.field}</span>
                            {' '}
                            <span className="text-gray-600">{condition.operator}</span>
                            {' '}
                            <span className="font-mono">{condition.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Actions</p>
                      <div className="space-y-2">
                        {workflow.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-gray-50 rounded border text-sm"
                          >
                            <Badge variant="outline" className="mr-2">
                              {action.type}
                            </Badge>
                            <span className="text-gray-600">→ {action.target}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit Conditions
                      </Button>
                      <Button variant="outline" size="sm">
                        Test Trigger
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notification Preferences</h2>

          <div className="space-y-3">
            {notificationPreferences.map(pref => (
              <Card key={pref.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize">{pref.category} Notifications</h3>
                    <Badge variant={pref.enabled ? 'default' : 'outline'}>
                      {pref.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-3">Notification Channels</p>
                    <div className="space-y-2">
                      {Object.entries(pref.channels).map(([channel, enabled]) => (
                        <div
                          key={channel}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <label className="text-sm font-medium capitalize">
                            {channel.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <button
                            onClick={() =>
                              handleToggleNotificationChannel(
                                pref.id,
                                channel as keyof NotificationPreference['channels']
                              )
                            }
                            className={`w-10 h-6 rounded-full transition-colors ${
                              enabled ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {pref.quietHours && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Quiet Hours</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          defaultValue={pref.quietHours.startTime}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="time"
                          defaultValue={pref.quietHours.endTime}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Widgets Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Dashboard Widget Configuration</h2>

          <div className="space-y-3">
            {dashboardWidgets.map(widget => (
              <Card key={widget.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{widget.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {widget.type}
                        </Badge>
                        <Badge
                          className={
                            widget.size === 'large'
                              ? 'bg-blue-100 text-blue-800'
                              : widget.size === 'medium'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {widget.size}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Refresh interval: {widget.refreshInterval}s
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDashboardWidget(widget.id)}
                      >
                        {widget.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Widget
          </Button>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Changes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to save all changes?</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Changes will be applied immediately to all active users and systems.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Alert Threshold Dialog */}
      {showAlertDialog && (
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Edit Alert Threshold' : 'Add Alert Threshold'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Alert Name</label>
                <input
                  type="text"
                  defaultValue={editingAlert?.name || ''}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  placeholder="e.g., Overdue Invoices"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option>financial</option>
                  <option>inventory</option>
                  <option>operations</option>
                  <option>hr</option>
                  <option>sales</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Metric</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  placeholder="e.g., days_overdue"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Threshold Value</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  placeholder="e.g., 90"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option>info</option>
                  <option>warning</option>
                  <option>critical</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowAlertDialog(false);
                setHasChanges(true);
              }}>
                {editingAlert ? 'Update' : 'Create'} Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
