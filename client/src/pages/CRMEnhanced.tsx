import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currencyUtils';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Target,
  Phone, 
  Mail, 
  Building2,
  ArrowRight,
  Sparkles,
  Lightbulb,
  UserPlus,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

export default function CRMEnhanced() {
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'website',
    notes: ''
  });

  // Fetch real data
  const { data: customers } = trpc.customers.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: projects } = trpc.projects.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: salesData } = trpc.sales.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const utils = trpc.useUtils();

  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      setShowAddLeadDialog(false);
      setNewLead({ name: '', company: '', email: '', phone: '', source: 'website', notes: '' });
    }
  });

  // Calculate CRM metrics (customer status: hot, warm, cold)
  const crmMetrics = useMemo(() => {
    if (!customers) return { total: 0, active: 0, newThisMonth: 0, avgValue: 0 };
    const now = new Date();
    const thisMonth = customers.filter(c => {
      const created = new Date(c.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    const activeCustomers = customers.filter(c => c.status === 'hot' || c.status === 'warm').length;
    const avgValue = customers.length > 0 ? 5000 : 0; // Simulated avg value
    return { 
      total: customers.length, 
      active: activeCustomers,
      newThisMonth: thisMonth.length,
      avgValue
    };
  }, [customers]);

  // Lead Conversion Rate data (monthly)
  const conversionData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, i) => ({
      month,
      leads: 20 + Math.floor(Math.random() * 30),
      converted: 5 + Math.floor(Math.random() * 15),
      rate: 20 + Math.floor(Math.random() * 30)
    }));
  }, []);

  // Campaign ROI data (quarterly)
  const campaignROIData = [
    { quarter: 'Q1', investment: 50000, revenue: 120000, roi: 140 },
    { quarter: 'Q2', investment: 75000, revenue: 180000, roi: 140 },
    { quarter: 'Q3', investment: 60000, revenue: 150000, roi: 150 },
    { quarter: 'Q4', investment: 80000, revenue: 220000, roi: 175 },
  ];

  // Client Retention data
  const retentionData = [
    { year: '2022', retained: 78, churned: 22 },
    { year: '2023', retained: 82, churned: 18 },
    { year: '2024', retained: 85, churned: 15 },
    { year: '2025', retained: 88, churned: 12 },
  ];

  // Customer segments pie chart (by status)
  const customerSegments = useMemo(() => {
    if (!customers) return [];
    const segments: Record<string, number> = {};
    customers.forEach(c => {
      const segment = c.status || 'unknown';
      segments[segment] = (segments[segment] || 0) + 1;
    });
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return Object.entries(segments).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length]
    }));
  }, [customers]);

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  // Recent projects for Smart Tracking
  const recentProjects = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 5);
  }, [projects]);

  // AI Insights
  type AIInsight = { type: string; title: string; message: string };
  const aiInsights = useMemo(() => {
    const insights: AIInsight[] = [];
    if (crmMetrics.newThisMonth < 3) {
      insights.push({
        type: 'warning',
        title: 'Lead Generation',
        message: 'New customer acquisition is below target. Consider increasing marketing spend.'
      });
    }
    if (crmMetrics.total > 0 && crmMetrics.active / crmMetrics.total < 0.7) {
      insights.push({
        type: 'alert',
        title: 'Customer Engagement',
        message: 'Active customer ratio is low. Recommend re-engagement campaign.'
      });
    }
    insights.push({
      type: 'info',
      title: 'Promotion Opportunity',
      message: `${crmMetrics.total} customers could benefit from Q1 promotional offers.`
    });
    insights.push({
      type: 'info',
      title: 'Follow-up Reminder',
      message: 'Review customers with no recent contact in the last 30 days.'
    });
    return insights.slice(0, 3);
  }, [crmMetrics]);

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) return;
    createCustomer.mutate({
      name: newLead.name,
      company: newLead.company || undefined,
      email: newLead.email,
      phone: newLead.phone || undefined,
      notes: newLead.notes || undefined,
      status: 'warm', // New leads start as warm
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hot': return <Badge className="bg-red-100 text-red-800">Hot</Badge>;
      case 'warm': return <Badge className="bg-yellow-100 text-yellow-800">Warm</Badge>;
      case 'cold': return <Badge className="bg-blue-100 text-blue-800">Cold</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'alert': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-500">Customer Relationship Management</p>
          </div>
          <Button onClick={() => setShowAddLeadDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold">{crmMetrics.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Customers</p>
                      <p className="text-2xl font-bold">{crmMetrics.active}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">New This Month</p>
                      <p className="text-2xl font-bold">{crmMetrics.newThisMonth}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(crmMetrics.avgValue, currency)}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Conversion Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Lead Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                      <Bar dataKey="converted" fill="#22c55e" name="Converted" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Campaign ROI */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Campaign ROI (Quarterly)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={campaignROIData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip formatter={(value, name) => name === 'roi' ? `${value}%` : formatCurrency(Number(value), currency)} />
                      <Legend />
                      <Bar dataKey="investment" fill="#f59e0b" name="Investment" />
                      <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row: Client Retention + Quick Entry + AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Retention */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Client Retention (Annual)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={retentionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="retained" fill="#22c55e" name="Retained" stackId="a" />
                      <Bar dataKey="churned" fill="#ef4444" name="Churned" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Lead Entry */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Quick Lead Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input 
                    placeholder="Contact Name *" 
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  />
                  <Input 
                    placeholder="Company" 
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  />
                  <Input 
                    placeholder="Email *" 
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  />
                  <Input 
                    placeholder="Phone" 
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleAddLead}
                    disabled={!newLead.name || !newLead.email || createCustomer.isPending}
                  >
                    {createCustomer.isPending ? 'Adding...' : 'Add Lead'}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Smart Insights */}
              <Card className="border-l-4 border-l-violet-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                      <p className="text-xs font-medium text-gray-600">{insight.title}</p>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Smart Tracking: Recent Projects */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Smart Tracking: Recent Projects
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-orange-600">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentProjects.length > 0 ? recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.customerName || 'No customer'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{formatCurrency(parseFloat(project.value || '0'), currency)}</span>
                        <Badge className={
                          project.stage === 'won' ? 'bg-green-100 text-green-800' :
                          project.stage === 'execution' ? 'bg-blue-100 text-blue-800' :
                          project.stage === 'proposal' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {project.stage}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-4">No recent projects</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search customers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Company</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Contact</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Total Purchases</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.slice(0, 10).map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium">{customer.name}</p>
                        </td>
                        <td className="p-4 text-gray-600">{customer.company || '-'}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {customer.email && (
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {customer.email}
                              </span>
                            )}
                            {customer.phone && (
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {customer.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(customer.status)}</td>
                        <td className="p-4 font-medium text-gray-600">-</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No customers found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'hot', label: 'Hot', color: 'bg-red-50 border-red-200' },
                    { key: 'warm', label: 'Warm', color: 'bg-yellow-50 border-yellow-200' },
                    { key: 'cold', label: 'Cold', color: 'bg-blue-50 border-blue-200' }
                  ].map((stage) => (
                    <div key={stage.key} className={`rounded-lg p-4 border ${stage.color}`}>
                      <h3 className="font-medium mb-3">{stage.label}</h3>
                      <div className="space-y-2">
                        {customers?.filter(c => c.status === stage.key).slice(0, 5).map((customer) => (
                          <div key={customer.id} className="bg-white p-3 rounded border shadow-sm">
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.company || 'No company'}</p>
                          </div>
                        ))}
                        {(!customers || customers.filter(c => c.status === stage.key).length === 0) && (
                          <p className="text-sm text-gray-400 text-center py-2">No customers</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Segments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Customer Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerSegments.length > 0 ? (
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width={150} height={150}>
                        <RechartsPieChart>
                          <Pie
                            data={customerSegments}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                          >
                            {customerSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {customerSegments.map((segment, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                            <span className="text-sm">{segment.name}: {segment.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No segment data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Marketing Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Marketing Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={campaignROIData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip />
                      <Line type="monotone" dataKey="roi" stroke="#8b5cf6" strokeWidth={2} name="ROI %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Lead Dialog */}
        <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Contact Name *</Label>
                <Input 
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input 
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLeadDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleAddLead}
                disabled={!newLead.name || !newLead.email || createCustomer.isPending}
              >
                {createCustomer.isPending ? 'Adding...' : 'Add Lead'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Detail Dialog */}
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Name</Label>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Company</Label>
                    <p className="font-medium">{selectedCustomer.company || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{selectedCustomer.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <p className="font-medium">{selectedCustomer.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div>{getStatusBadge(selectedCustomer.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Next Action</Label>
                    <p className="font-medium">{selectedCustomer.nextActionRequired || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Created</Label>
                    <p className="font-medium">{selectedCustomer.createdAt ? format(new Date(selectedCustomer.createdAt), 'PP') : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Last Contact</Label>
                    <p className="font-medium">{selectedCustomer.lastContactDate ? format(new Date(selectedCustomer.lastContactDate), 'PP') : '-'}</p>
                  </div>
                </div>
                {selectedCustomer.notes && (
                  <div>
                    <Label className="text-gray-500">Notes</Label>
                    <p className="text-gray-700">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
