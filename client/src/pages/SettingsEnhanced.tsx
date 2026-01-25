import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsEnhanced() {
  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Sustech Operations & Growth',
    companyEmail: 'info@sustech.com',
    companyPhone: '+880-1234-567890',
    currency: 'BDT',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Dhaka',
    language: 'English',
    fiscalYearStart: '01/01'
  });

  // Module Configuration State
  const [modules, setModules] = useState([
    { id: 1, name: 'Sales', enabled: true, description: 'Sales order management' },
    { id: 2, name: 'Purchases', enabled: true, description: 'Purchase order management' },
    { id: 3, name: 'Products', enabled: true, description: 'Product inventory management' },
    { id: 4, name: 'Customers', enabled: true, description: 'Customer relationship management' },
    { id: 5, name: 'Financial', enabled: true, description: 'Financial accounting' },
    { id: 6, name: 'Projects', enabled: true, description: 'Project management' },
    { id: 7, name: 'HR', enabled: true, description: 'Human resource management' },
    { id: 8, name: 'Inventory', enabled: true, description: 'Inventory tracking' },
    { id: 9, name: 'CRM', enabled: false, description: 'Customer relationship management' },
    { id: 10, name: 'Budget', enabled: true, description: 'Budget planning' }
  ]);

  // Parameter Management State
  const [parameters, setParameters] = useState([
    { id: 1, module: 'Sales', paramName: 'Min Order Value', value: '1000', type: 'number', description: 'Minimum order value in BDT' },
    { id: 2, module: 'Sales', paramName: 'Discount Limit', value: '20', type: 'number', description: 'Maximum discount percentage' },
    { id: 3, module: 'Purchases', paramName: 'PO Approval Limit', value: '100000', type: 'number', description: 'PO amount requiring approval' },
    { id: 4, module: 'Purchases', paramName: 'Lead Time Days', value: '7', type: 'number', description: 'Default lead time in days' },
    { id: 5, module: 'Financial', paramName: 'Payment Terms', value: 'Net 30', type: 'text', description: 'Default payment terms' },
    { id: 6, module: 'Financial', paramName: 'Invoice Prefix', value: 'INV-', type: 'text', description: 'Invoice number prefix' },
    { id: 7, module: 'HR', paramName: 'Leave Approval Limit', value: '5', type: 'number', description: 'Days requiring manager approval' },
    { id: 8, module: 'HR', paramName: 'Salary Review Month', value: 'January', type: 'text', description: 'Month for salary review' }
  ]);

  // User Preferences State
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    dashboardLayout: 'grid',
    itemsPerPage: '20',
    autoSave: true,
    autoSaveInterval: '5'
  });

  // Audit Trail State
  const [auditTrail, setAuditTrail] = useState([
    { id: 1, user: 'Md. Sohel Sikder', action: 'Modified Sales Min Order Value', timestamp: '2026-01-24 18:30:00', details: 'Changed from 500 to 1000' },
    { id: 2, user: 'Admin User', action: 'Enabled CRM Module', timestamp: '2026-01-24 17:15:00', details: 'Module configuration updated' },
    { id: 3, user: 'Md. Sohel Sikder', action: 'Updated Company Email', timestamp: '2026-01-24 16:45:00', details: 'Changed email address' },
    { id: 4, user: 'Admin User', action: 'Modified HR Parameters', timestamp: '2026-01-24 15:20:00', details: 'Leave approval limit updated' }
  ]);

  const [editingParam, setEditingParam] = useState(null);
  const [newParam, setNewParam] = useState({ module: '', paramName: '', value: '', type: 'text', description: '' });
  const [showParamDialog, setShowParamDialog] = useState(false);

  const handleSaveGeneral = () => {
    toast.success('General settings saved successfully');
  };

  const handleToggleModule = (id) => {
    setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    toast.success('Module configuration updated');
  };

  const handleAddParameter = () => {
    if (newParam.module && newParam.paramName && newParam.value) {
      setParameters([...parameters, { id: Math.max(...parameters.map(p => p.id), 0) + 1, ...newParam }]);
      setNewParam({ module: '', paramName: '', value: '', type: 'text', description: '' });
      setShowParamDialog(false);
      toast.success('Parameter added successfully');
    }
  };

  const handleUpdateParameter = (id, field, value) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteParameter = (id) => {
    setParameters(parameters.filter(p => p.id !== id));
    toast.success('Parameter deleted');
  };

  const handleSavePreferences = () => {
    toast.success('User preferences saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings and module parameters</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS TAB */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={generalSettings.companyEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Company Phone</Label>
                  <Input
                    id="company-phone"
                    value={generalSettings.companyPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (Bangladeshi Taka)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={generalSettings.dateFormat} onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}>
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                  <Input
                    id="fiscal-year"
                    type="date"
                    value={generalSettings.fiscalYearStart}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, fiscalYearStart: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveGeneral} className="gap-2">
                <Save className="w-4 h-4" /> Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODULE CONFIGURATION TAB */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Configuration</CardTitle>
              <CardDescription>Enable or disable modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-semibold">{module.name}</p>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={() => handleToggleModule(module.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARAMETER MANAGEMENT TAB */}
        <TabsContent value="parameters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Module Parameters</h2>
            <Dialog open={showParamDialog} onOpenChange={setShowParamDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Parameter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Parameter</DialogTitle>
                  <DialogDescription>Create a new module parameter</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="param-module">Module</Label>
                    <Select value={newParam.module} onValueChange={(value) => setNewParam({ ...newParam, module: value })}>
                      <SelectTrigger id="param-module">
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.filter(m => m.enabled).map(m => (
                          <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="param-name">Parameter Name</Label>
                    <Input
                      id="param-name"
                      placeholder="e.g., Min Order Value"
                      value={newParam.paramName}
                      onChange={(e) => setNewParam({ ...newParam, paramName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="param-value">Value</Label>
                    <Input
                      id="param-value"
                      placeholder="Enter value"
                      value={newParam.value}
                      onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="param-type">Type</Label>
                    <Select value={newParam.type} onValueChange={(value) => setNewParam({ ...newParam, type: value })}>
                      <SelectTrigger id="param-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="param-desc">Description</Label>
                    <Textarea
                      id="param-desc"
                      placeholder="Parameter description"
                      value={newParam.description}
                      onChange={(e) => setNewParam({ ...newParam, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddParameter} className="w-full">Add Parameter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Parameter Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map((param) => (
                  <TableRow key={param.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold">{param.module}</TableCell>
                    <TableCell>{param.paramName}</TableCell>
                    <TableCell>
                      <Input
                        value={param.value}
                        onChange={(e) => handleUpdateParameter(param.id, 'value', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{param.type}</TableCell>
                    <TableCell className="text-sm text-gray-600">{param.description}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteParameter(param.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* USER PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={userPreferences.theme} onValueChange={(value) => setUserPreferences({ ...userPreferences, theme: value })}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="items-per-page">Items Per Page</Label>
                  <Select value={userPreferences.itemsPerPage} onValueChange={(value) => setUserPreferences({ ...userPreferences, itemsPerPage: value })}>
                    <SelectTrigger id="items-per-page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={userPreferences.emailNotifications}
                    onCheckedChange={(checked) => setUserPreferences({ ...userPreferences, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>SMS Notifications</Label>
                  <Switch
                    checked={userPreferences.smsNotifications}
                    onCheckedChange={(checked) => setUserPreferences({ ...userPreferences, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-Save</Label>
                  <Switch
                    checked={userPreferences.autoSave}
                    onCheckedChange={(checked) => setUserPreferences({ ...userPreferences, autoSave: checked })}
                  />
                </div>
              </div>
              <Button onClick={handleSavePreferences} className="gap-2">
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TRAIL TAB */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>View all configuration changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditTrail.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell className="font-semibold">{entry.user}</TableCell>
                        <TableCell>{entry.action}</TableCell>
                        <TableCell className="text-sm text-gray-600">{entry.timestamp}</TableCell>
                        <TableCell className="text-sm text-gray-600">{entry.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
