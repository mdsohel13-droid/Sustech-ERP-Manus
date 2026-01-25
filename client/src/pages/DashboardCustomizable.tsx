import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Eye, EyeOff, Trash2, Settings, RotateCcw, Save, Plus } from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'kpi';
  module: string;
  visible: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  refreshInterval: number;
  config: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  colorScheme: 'light' | 'dark' | 'custom';
  createdAt: string;
  updatedAt: string;
}

export default function DashboardCustomizable() {
  const [activeTab, setActiveTab] = useState<'preview' | 'customize' | 'templates'>('preview');
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data - Available widgets
  const availableWidgets: DashboardWidget[] = [
    {
      id: 'revenue-metric',
      title: 'Total Revenue',
      type: 'metric',
      module: 'Financial',
      visible: true,
      position: 0,
      size: 'small',
      refreshInterval: 300,
      config: { color: 'green', icon: 'TrendingUp' },
    },
    {
      id: 'profit-metric',
      title: 'Net Profit',
      type: 'metric',
      module: 'Financial',
      visible: true,
      position: 1,
      size: 'small',
      refreshInterval: 300,
      config: { color: 'blue', icon: 'BarChart3' },
    },
    {
      id: 'sales-chart',
      title: 'Sales Trend',
      type: 'chart',
      module: 'Sales',
      visible: true,
      position: 2,
      size: 'large',
      refreshInterval: 600,
      config: { chartType: 'line', period: 'monthly' },
    },
    {
      id: 'inventory-alert',
      title: 'Low Stock Alert',
      type: 'alert',
      module: 'Inventory',
      visible: true,
      position: 3,
      size: 'medium',
      refreshInterval: 300,
      config: { threshold: 10, alertLevel: 'warning' },
    },
    {
      id: 'project-status',
      title: 'Project Status',
      type: 'chart',
      module: 'Projects',
      visible: true,
      position: 4,
      size: 'medium',
      refreshInterval: 600,
      config: { chartType: 'pie' },
    },
    {
      id: 'ar-aging',
      title: 'AR Aging Analysis',
      type: 'table',
      module: 'Financial',
      visible: true,
      position: 5,
      size: 'large',
      refreshInterval: 900,
      config: { columns: ['days', 'amount', 'percentage'] },
    },
    {
      id: 'kpi-dashboard',
      title: 'Key Performance Indicators',
      type: 'kpi',
      module: 'Dashboard',
      visible: true,
      position: 6,
      size: 'large',
      refreshInterval: 600,
      config: { kpis: ['revenue', 'profit', 'growth', 'efficiency'] },
    },
    {
      id: 'action-items',
      title: 'Action Items',
      type: 'table',
      module: 'ActionTracker',
      visible: true,
      position: 7,
      size: 'medium',
      refreshInterval: 300,
      config: { status: 'pending', limit: 5 },
    },
    {
      id: 'budget-status',
      title: 'Budget Status',
      type: 'chart',
      module: 'Budget',
      visible: true,
      position: 8,
      size: 'medium',
      refreshInterval: 900,
      config: { chartType: 'bar', period: 'quarterly' },
    },
    {
      id: 'customer-metrics',
      title: 'Customer Metrics',
      type: 'metric',
      module: 'CRM',
      visible: false,
      position: 9,
      size: 'small',
      refreshInterval: 600,
      config: { color: 'purple', icon: 'Users' },
    },
  ];

  const templates: DashboardLayout[] = [
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'High-level business metrics and KPIs',
      isDefault: false,
      widgets: availableWidgets.slice(0, 3),
      colorScheme: 'light',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'operational',
      name: 'Operational Dashboard',
      description: 'Detailed operational metrics and alerts',
      isDefault: false,
      widgets: availableWidgets.slice(0, 6),
      colorScheme: 'light',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'standard',
      name: 'Standard Dashboard',
      description: 'Comprehensive view of all modules',
      isDefault: true,
      widgets: availableWidgets,
      colorScheme: 'light',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  // Initialize with standard template
  useEffect(() => {
    setCurrentLayout(templates[2]);
  }, []);

  const handleToggleWidgetVisibility = (widgetId: string) => {
    if (!currentLayout) return;
    const updatedWidgets = currentLayout.widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    setCurrentLayout({ ...currentLayout, widgets: updatedWidgets });
    setHasUnsavedChanges(true);
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!currentLayout) return;
    const updatedWidgets = currentLayout.widgets.filter(w => w.id !== widgetId);
    setCurrentLayout({ ...currentLayout, widgets: updatedWidgets });
    setHasUnsavedChanges(true);
  };

  const handleAddWidget = (widget: DashboardWidget) => {
    if (!currentLayout) return;
    const newWidget = {
      ...widget,
      position: currentLayout.widgets.length,
    };
    setCurrentLayout({
      ...currentLayout,
      widgets: [...currentLayout.widgets, newWidget],
    });
    setHasUnsavedChanges(true);
    setShowWidgetDialog(false);
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetWidgetId: string) => {
    if (!draggedWidget || !currentLayout) return;

    const draggedIndex = currentLayout.widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = currentLayout.widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const updatedWidgets = [...currentLayout.widgets];
    [updatedWidgets[draggedIndex], updatedWidgets[targetIndex]] = [
      updatedWidgets[targetIndex],
      updatedWidgets[draggedIndex],
    ];

    setCurrentLayout({ ...currentLayout, widgets: updatedWidgets });
    setDraggedWidget(null);
    setHasUnsavedChanges(true);
  };

  const handleSaveDashboard = () => {
    // In a real app, this would save to the database
    console.log('Saving dashboard layout:', currentLayout);
    setHasUnsavedChanges(false);
    // Show success message
  };

  const handleResetToDefault = () => {
    setCurrentLayout(templates[2]);
    setHasUnsavedChanges(false);
  };

  const handleLoadTemplate = (template: DashboardLayout) => {
    setCurrentLayout(template);
    setHasUnsavedChanges(false);
  };

  const getWidgetGridClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-2';
      case 'large':
        return 'col-span-3';
      default:
        return 'col-span-1';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'metric':
        return 'bg-blue-100 text-blue-800';
      case 'chart':
        return 'bg-purple-100 text-purple-800';
      case 'table':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'kpi':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customizable Dashboard</h1>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button onClick={handleSaveDashboard} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          )}
          <Button onClick={handleResetToDefault} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['preview', 'customize', 'templates'].map(tab => (
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

      {/* Preview Tab */}
      {activeTab === 'preview' && currentLayout && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h2 className="font-semibold text-blue-900">{currentLayout.name}</h2>
              <p className="text-sm text-blue-700">{currentLayout.description}</p>
            </div>
            <Badge variant="outline">{currentLayout.widgets.filter(w => w.visible).length} widgets</Badge>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {currentLayout.widgets
              .filter(w => w.visible)
              .map(widget => (
                <div key={widget.id} className={`${getWidgetGridClass(widget.size)}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-sm">{widget.title}</CardTitle>
                          <Badge className={`${getTypeColor(widget.type)} text-xs mt-1`}>
                            {widget.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                        {widget.type === 'metric' && <div className="text-3xl font-bold">৳2.5M</div>}
                        {widget.type === 'chart' && <div>📊 Chart Preview</div>}
                        {widget.type === 'table' && <div>📋 Table Data</div>}
                        {widget.type === 'alert' && <div>⚠️ Alert Items</div>}
                        {widget.type === 'kpi' && <div>📈 KPI Indicators</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Customize Tab */}
      {activeTab === 'customize' && currentLayout && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <h2 className="font-semibold text-amber-900">Widget Manager</h2>
              <p className="text-sm text-amber-700">Drag to reorder, toggle visibility, or remove widgets</p>
            </div>
            <Button onClick={() => setShowWidgetDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Widget
            </Button>
          </div>

          <div className="space-y-2">
            {currentLayout.widgets.map(widget => (
              <div
                key={widget.id}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(widget.id)}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-move transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{widget.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getTypeColor(widget.type)} variant="outline">
                          {widget.type}
                        </Badge>
                        <Badge variant="outline">{widget.module}</Badge>
                        <Badge variant="outline">{widget.size}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleWidgetVisibility(widget.id)}
                      className="gap-2"
                    >
                      {widget.visible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWidget(widget)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleLoadTemplate(template)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  {template.isDefault && (
                    <Badge variant="default">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Widgets</span>
                    <span className="font-semibold">{template.widgets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Visible</span>
                    <span className="font-semibold">{template.widgets.filter(w => w.visible).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Color Scheme</span>
                    <span className="font-semibold capitalize">{template.colorScheme}</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => handleLoadTemplate(template)}>
                    Load Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={showWidgetDialog} onOpenChange={setShowWidgetDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {availableWidgets
              .filter(w => !currentLayout?.widgets.find(cw => cw.id === w.id))
              .map(widget => (
                <div
                  key={widget.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAddWidget(widget)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{widget.title}</h3>
                      <p className="text-sm text-gray-600">{widget.module}</p>
                    </div>
                    <Badge className={getTypeColor(widget.type)}>{widget.type}</Badge>
                  </div>
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWidgetDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Widget Settings Dialog */}
      {editingWidget && (
        <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Widget Settings: {editingWidget.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Size</label>
                <select
                  value={editingWidget.size}
                  onChange={(e) =>
                    setEditingWidget({ ...editingWidget, size: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md mt-1"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={editingWidget.refreshInterval}
                  onChange={(e) =>
                    setEditingWidget({
                      ...editingWidget,
                      refreshInterval: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={editingWidget.visible ? 'default' : 'outline'}
                    onClick={() => setEditingWidget({ ...editingWidget, visible: true })}
                  >
                    Visible
                  </Button>
                  <Button
                    variant={!editingWidget.visible ? 'default' : 'outline'}
                    onClick={() => setEditingWidget({ ...editingWidget, visible: false })}
                  >
                    Hidden
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingWidget(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (currentLayout) {
                    const updatedWidgets = currentLayout.widgets.map(w =>
                      w.id === editingWidget.id ? editingWidget : w
                    );
                    setCurrentLayout({ ...currentLayout, widgets: updatedWidgets });
                    setHasUnsavedChanges(true);
                  }
                  setEditingWidget(null);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
