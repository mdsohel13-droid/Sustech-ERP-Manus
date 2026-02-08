import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currencyUtils';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Target,
  Phone, 
  Mail, 
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trophy,
  Activity,
  BarChart3,
  Archive,
  RotateCcw,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function CRM() {
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showLeadDetailDialog, setShowLeadDetailDialog] = useState(false);
  const [showOpportunityDetailDialog, setShowOpportunityDetailDialog] = useState(false);
  
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'website' as const,
    status: 'new' as const,
    estimatedValue: '',
    notes: ''
  });

  const [opportunityForm, setOpportunityForm] = useState({
    name: '',
    customerId: undefined as number | undefined,
    stage: 'prospecting' as const,
    amount: '',
    probability: 10,
    expectedCloseDate: '',
    description: ''
  });

  const [activityForm, setActivityForm] = useState({
    type: 'call' as const,
    subject: '',
    description: '',
    leadId: undefined as number | undefined,
    opportunityId: undefined as number | undefined,
  });

  const [quickAddClientOpen, setQuickAddClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const utils = trpc.useUtils();
  
  const { data: leads = [] } = trpc.crm.getLeads.useQuery();
  const { data: archivedLeads = [] } = trpc.crm.getArchivedLeads.useQuery();
  const { data: opportunities = [] } = trpc.crm.getOpportunities.useQuery();
  const { data: activities = [] } = trpc.crm.getActivities.useQuery({ limit: 10 });
  const { data: tasks = [] } = trpc.crm.getPendingTasks.useQuery();
  const { data: dashboardStats } = trpc.crm.getDashboardStats.useQuery();
  const { data: salesPerformance = [] } = trpc.crm.getSalesPerformance.useQuery();
  const { data: customers = [] } = trpc.customers.getAll.useQuery();
  const { data: teamMembers = [] } = trpc.team.getMembers.useQuery();

  const createLead = trpc.crm.createLead.useMutation({
    onSuccess: () => {
      utils.crm.getLeads.invalidate();
      utils.crm.getDashboardStats.invalidate();
      setShowLeadDialog(false);
      resetLeadForm();
      toast.success('Lead created successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const updateLead = trpc.crm.updateLead.useMutation({
    onSuccess: () => {
      utils.crm.getLeads.invalidate();
      utils.crm.getDashboardStats.invalidate();
      setShowLeadDialog(false);
      setEditingLead(null);
      resetLeadForm();
      toast.success('Lead updated successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const archiveLead = trpc.crm.archiveLead.useMutation({
    onSuccess: () => {
      utils.crm.getLeads.invalidate();
      utils.crm.getArchivedLeads.invalidate();
      utils.crm.getDashboardStats.invalidate();
      toast.success('Lead archived');
    },
    onError: (error) => toast.error(error.message)
  });

  const restoreLead = trpc.crm.restoreLead.useMutation({
    onSuccess: () => {
      utils.crm.getLeads.invalidate();
      utils.crm.getArchivedLeads.invalidate();
      utils.crm.getDashboardStats.invalidate();
      toast.success('Lead restored');
    },
    onError: (error) => toast.error(error.message)
  });

  const createOpportunity = trpc.crm.createOpportunity.useMutation({
    onSuccess: () => {
      utils.crm.getOpportunities.invalidate();
      utils.crm.getDashboardStats.invalidate();
      utils.crm.getSalesPerformance.invalidate();
      setShowOpportunityDialog(false);
      resetOpportunityForm();
      toast.success('Opportunity created successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const updateOpportunity = trpc.crm.updateOpportunity.useMutation({
    onSuccess: () => {
      utils.crm.getOpportunities.invalidate();
      utils.crm.getDashboardStats.invalidate();
      utils.crm.getSalesPerformance.invalidate();
      setShowOpportunityDialog(false);
      setEditingOpportunity(null);
      resetOpportunityForm();
      toast.success('Opportunity updated successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const archiveOpportunity = trpc.crm.archiveOpportunity.useMutation({
    onSuccess: () => {
      utils.crm.getOpportunities.invalidate();
      utils.crm.getDashboardStats.invalidate();
      toast.success('Opportunity archived');
    },
    onError: (error) => toast.error(error.message)
  });

  const createActivity = trpc.crm.createActivity.useMutation({
    onSuccess: () => {
      utils.crm.getActivities.invalidate();
      setShowActivityDialog(false);
      resetActivityForm();
      toast.success('Activity logged');
    },
    onError: (error) => toast.error(error.message)
  });

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      setQuickAddClientOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      toast.success('Client added successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const resetLeadForm = () => {
    setLeadForm({ name: '', company: '', email: '', phone: '', source: 'website', status: 'new', estimatedValue: '', notes: '' });
  };

  const resetOpportunityForm = () => {
    setOpportunityForm({ name: '', customerId: undefined, stage: 'prospecting', amount: '', probability: 10, expectedCloseDate: '', description: '' });
  };

  const resetActivityForm = () => {
    setActivityForm({ type: 'call', subject: '', description: '', leadId: undefined, opportunityId: undefined });
  };

  const openEditLead = (lead: any) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name,
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'website',
      status: lead.status || 'new',
      estimatedValue: lead.estimatedValue || '',
      notes: lead.notes || ''
    });
    setShowLeadDialog(true);
  };

  const openEditOpportunity = (opp: any) => {
    setEditingOpportunity(opp);
    setOpportunityForm({
      name: opp.name,
      customerId: opp.customerId,
      stage: opp.stage || 'prospecting',
      amount: opp.amount || '',
      probability: opp.probability || 10,
      expectedCloseDate: opp.expectedCloseDate || '',
      description: opp.description || ''
    });
    setShowOpportunityDialog(true);
  };

  const handleLeadSubmit = () => {
    if (!leadForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (editingLead) {
      updateLead.mutate({ id: editingLead.id, ...leadForm });
    } else {
      createLead.mutate(leadForm);
    }
  };

  const handleOpportunitySubmit = () => {
    if (!opportunityForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (editingOpportunity) {
      updateOpportunity.mutate({ id: editingOpportunity.id, ...opportunityForm });
    } else {
      createOpportunity.mutate(opportunityForm);
    }
  };

  const handleActivitySubmit = () => {
    if (!activityForm.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    createActivity.mutate(activityForm);
  };

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter((l: any) => 
      l.name.toLowerCase().includes(term) ||
      (l.company && l.company.toLowerCase().includes(term)) ||
      (l.email && l.email.toLowerCase().includes(term))
    );
  }, [leads, searchTerm]);

  const openOpportunities = opportunities.filter((o: any) => o.stage !== 'closed_won' && o.stage !== 'closed_lost');

  const pipelineData = useMemo(() => {
    const stats = dashboardStats?.pipeline || { newLeads: 0, qualified: 0, proposalSent: 0, negotiation: 0, closedWon: 0 };
    return [
      { name: 'New Leads', value: stats.newLeads, color: '#3b82f6' },
      { name: 'Qualified', value: stats.qualified, color: '#22c55e' },
      { name: 'Proposal Sent', value: stats.proposalSent, color: '#f59e0b' },
      { name: 'Negotiation', value: stats.negotiation, color: '#8b5cf6' },
      { name: 'Closed Won', value: stats.closedWon, color: '#10b981' },
    ];
  }, [dashboardStats]);

  const getLeadStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-purple-100 text-purple-700',
      qualified: 'bg-green-100 text-green-700',
      proposal_sent: 'bg-amber-100 text-amber-700',
      negotiation: 'bg-orange-100 text-orange-700',
      won: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal_sent: 'Proposal Sent',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost',
    };
    return <Badge className={styles[status] || 'bg-gray-100 text-gray-700'}>{labels[status] || status}</Badge>;
  };

  const getOpportunityStage = (stage: string) => {
    const styles: Record<string, string> = {
      prospecting: 'bg-blue-100 text-blue-700',
      qualification: 'bg-purple-100 text-purple-700',
      proposal: 'bg-amber-100 text-amber-700',
      negotiation: 'bg-orange-100 text-orange-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      prospecting: 'Prospecting',
      qualification: 'Qualification',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      closed_won: 'Closed Won',
      closed_lost: 'Closed Lost',
    };
    return <Badge className={styles[stage] || 'bg-gray-100 text-gray-700'}>{labels[stage] || stage}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-green-500" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">CRM (Customer Relationship Management)</h1>
          <p className="text-muted-foreground">Manage leads, opportunities, and customer relationships</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads, contacts, deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Leads - Blue/Teal Gradient */}
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-teal-100">Total Leads</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-3xl font-bold">{(dashboardStats?.totalLeads || 0).toLocaleString()}</p>
                <p className="text-xs text-teal-100">units</p>
              </div>
              <Users className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        {/* Active Opportunities - Green Gradient */}
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-emerald-100">Active Opportunities</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-3xl font-bold">{dashboardStats?.activeOpportunities || 0}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-emerald-100">units</span>
                  <TrendingUp className="w-3 h-3 text-emerald-200" />
                  <span className="text-xs text-emerald-200">+5%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        {/* Deals Won (This Month) - Purple Gradient */}
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-violet-100">Deals Won (This Month)</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-3xl font-bold">{dashboardStats?.dealsWonThisMonth || 0}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-violet-100">units</span>
                  <TrendingUp className="w-3 h-3 text-violet-200" />
                  <span className="text-xs text-violet-200">+12%</span>
                </div>
              </div>
              <Trophy className="w-8 h-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue (YTD) - Amber/Orange Gradient */}
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-amber-100">Total Revenue (YTD)</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold">{formatCurrency(dashboardStats?.totalRevenueYTD || 0, currency)}</p>
              <DollarSign className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Due - Light Background */}
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border shadow-lg">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-medium text-slate-600">Tasks Due</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-3xl font-bold text-slate-800">{dashboardStats?.tasksDue || 0}</p>
                <p className="text-xs text-slate-500">items</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section - 3/4 */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sales Pipeline & Performance Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales Pipeline (Funnel) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales Pipeline</CardTitle>
                <CardDescription className="text-xs">Sales Trends (Last 30 Days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pipelineData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div 
                        className="h-8 rounded-md flex items-center justify-center text-white text-xs font-medium px-3"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${Math.max(30, 100 - index * 15)}%`
                        }}
                      >
                        {item.name} ({item.value})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales Performance Trend</CardTitle>
                <CardDescription className="text-xs">Sales Trend (Last 6 Months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value, currency), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
              </div>
              <Button size="sm" onClick={() => { resetLeadForm(); setEditingLead(null); setShowLeadDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Lead
              </Button>
            </CardHeader>
            <CardContent>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-normal break-words">Name</TableHead>
                    <TableHead className="whitespace-normal break-words">Company</TableHead>
                    <TableHead className="whitespace-normal break-words">Source</TableHead>
                    <TableHead className="whitespace-normal break-words">Status</TableHead>
                    <TableHead className="whitespace-normal break-words">Last Contact</TableHead>
                    <TableHead className="whitespace-normal break-words">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.slice(0, 5).map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                        <button 
                          className="text-blue-600 hover:underline font-medium"
                          onClick={() => { setSelectedLead(lead); setShowLeadDetailDialog(true); }}
                        >
                          {lead.name}
                        </button>
                      </TableCell>
                      <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.company || '-'}</TableCell>
                      <TableCell className="break-words capitalize" style={{ overflowWrap: "break-word" }}>{lead.source?.replace('_', ' ') || '-'}</TableCell>
                      <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getLeadStatusBadge(lead.status)}</TableCell>
                      <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                        {lead.lastContactDate 
                          ? format(new Date(lead.lastContactDate), 'MM/dd/yyyy h:mm a')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Phone className="w-3 h-3" /> Call
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Mail className="w-3 h-3" /> Email
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No leads found. Click "Add Lead" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Open Opportunities Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
              </div>
              <Button size="sm" onClick={() => { resetOpportunityForm(); setEditingOpportunity(null); setShowOpportunityDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Opportunity
              </Button>
            </CardHeader>
            <CardContent>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-normal break-words">Opportunity Name</TableHead>
                    <TableHead className="whitespace-normal break-words">Account</TableHead>
                    <TableHead className="whitespace-normal break-words">Stage</TableHead>
                    <TableHead className="whitespace-normal break-words">Amount</TableHead>
                    <TableHead className="whitespace-normal break-words">Close Date</TableHead>
                    <TableHead className="whitespace-normal break-words">Owner</TableHead>
                    <TableHead className="whitespace-normal break-words">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openOpportunities.slice(0, 5).map((opp: any) => {
                    const customer = customers.find((c: any) => c.id === opp.customerId);
                    const owner = teamMembers.find((e: any) => e.id === opp.ownerId);
                    return (
                      <TableRow key={opp.id}>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <button 
                            className="text-blue-600 hover:underline font-medium"
                            onClick={() => { setSelectedOpportunity(opp); setShowOpportunityDetailDialog(true); }}
                          >
                            {opp.name}
                          </button>
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{customer?.name || customer?.company || '-'}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getOpportunityStage(opp.stage)}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(opp.amount) || 0, currency)}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          {opp.expectedCloseDate 
                            ? format(new Date(opp.expectedCloseDate), 'MM/dd/yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                              {owner?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm">{owner?.name?.split(' ')[0] || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Phone className="w-3 h-3" /> Call
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {openOpportunities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No open opportunities. Click "Add Opportunity" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tabs for More Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">All Leads</TabsTrigger>
              <TabsTrigger value="opportunities">All Opportunities</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    Overview dashboard displays the key metrics above. Use the tabs to manage leads, opportunities, and archived items.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Leads</CardTitle>
                  <Button onClick={() => { resetLeadForm(); setEditingLead(null); setShowLeadDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Lead
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-normal break-words">Name</TableHead>
                        <TableHead className="whitespace-normal break-words">Company</TableHead>
                        <TableHead className="whitespace-normal break-words">Email</TableHead>
                        <TableHead className="whitespace-normal break-words">Phone</TableHead>
                        <TableHead className="whitespace-normal break-words">Source</TableHead>
                        <TableHead className="whitespace-normal break-words">Status</TableHead>
                        <TableHead className="whitespace-normal break-words">Est. Value</TableHead>
                        <TableHead className="whitespace-normal break-words">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{lead.name}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.company || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.email || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.phone || '-'}</TableCell>
                          <TableCell className="break-words capitalize" style={{ overflowWrap: "break-word" }}>{lead.source?.replace('_', ' ') || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getLeadStatusBadge(lead.status)}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.estimatedValue ? formatCurrency(Number(lead.estimatedValue), currency) : '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditLead(lead)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => archiveLead.mutate({ id: lead.id })}>
                                <Archive className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Opportunities</CardTitle>
                  <Button onClick={() => { resetOpportunityForm(); setEditingOpportunity(null); setShowOpportunityDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Opportunity
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-normal break-words">Name</TableHead>
                        <TableHead className="whitespace-normal break-words">Account</TableHead>
                        <TableHead className="whitespace-normal break-words">Stage</TableHead>
                        <TableHead className="whitespace-normal break-words">Amount</TableHead>
                        <TableHead className="whitespace-normal break-words">Probability</TableHead>
                        <TableHead className="whitespace-normal break-words">Close Date</TableHead>
                        <TableHead className="whitespace-normal break-words">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunities.map((opp: any) => {
                        const customer = customers.find((c: any) => c.id === opp.customerId);
                        return (
                          <TableRow key={opp.id}>
                            <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{opp.name}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{customer?.name || '-'}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getOpportunityStage(opp.stage)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(opp.amount) || 0, currency)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{opp.probability}%</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              {opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), 'MM/dd/yyyy') : '-'}
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditOpportunity(opp)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => archiveOpportunity.mutate({ id: opp.id })}>
                                  <Archive className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive">
              <Card>
                <CardHeader>
                  <CardTitle>Archived Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-normal break-words">Name</TableHead>
                        <TableHead className="whitespace-normal break-words">Company</TableHead>
                        <TableHead className="whitespace-normal break-words">Status</TableHead>
                        <TableHead className="whitespace-normal break-words">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedLeads.map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{lead.name}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{lead.company || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getLeadStatusBadge(lead.status)}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <Button variant="ghost" size="sm" onClick={() => restoreLead.mutate({ id: lead.id })}>
                              <RotateCcw className="w-4 h-4 mr-1" /> Restore
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {archivedLeads.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No archived leads
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Customers (Legacy)</CardTitle>
                  <CardDescription>Existing customers from the previous system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-normal break-words">Name</TableHead>
                        <TableHead className="whitespace-normal break-words">Company</TableHead>
                        <TableHead className="whitespace-normal break-words">Email</TableHead>
                        <TableHead className="whitespace-normal break-words">Phone</TableHead>
                        <TableHead className="whitespace-normal break-words">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.slice(0, 10).map((customer: any) => (
                        <TableRow key={customer.id}>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{customer.name}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{customer.company || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{customer.email || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{customer.phone || '-'}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <Badge variant={customer.status === 'hot' ? 'destructive' : customer.status === 'warm' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - 1/4 */}
        <div className="space-y-4">
          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowActivityDialog(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
              ) : (
                activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {activities.length > 5 && (
                <Button variant="link" className="w-full text-sm">
                  Show more
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Top Sales Reps */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Sales Reps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.slice(0, 3).map((emp: any, index: number) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                  }`}>
                    {emp.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.position || emp.department || 'Sales'}</p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales reps found</p>
              )}
            </CardContent>
          </Card>

          {/* Tasks Due */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(task.dueDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={leadForm.company} onChange={(e) => setLeadForm({...leadForm, company: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={leadForm.phone} onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={leadForm.source} onValueChange={(v) => setLeadForm({...leadForm, source: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="email_campaign">Email Campaign</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={leadForm.status} onValueChange={(v) => setLeadForm({...leadForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estimated Value</Label>
              <Input type="number" value={leadForm.estimatedValue} onChange={(e) => setLeadForm({...leadForm, estimatedValue: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={leadForm.notes} onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>Cancel</Button>
            <Button onClick={handleLeadSubmit}>{editingLead ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Opportunity Dialog */}
      <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opportunity Name *</Label>
              <Input value={opportunityForm.name} onChange={(e) => setOpportunityForm({...opportunityForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Account</Label>
              <div className="flex gap-2">
                <Select 
                  value={opportunityForm.customerId?.toString() || ''} 
                  onValueChange={(v) => setOpportunityForm({...opportunityForm, customerId: parseInt(v)})}
                >
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuickAddClientOpen(true)}
                  title="Add New Client"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={opportunityForm.stage} onValueChange={(v) => setOpportunityForm({...opportunityForm, stage: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">Prospecting</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={opportunityForm.amount} onChange={(e) => setOpportunityForm({...opportunityForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input type="number" min="0" max="100" value={opportunityForm.probability} onChange={(e) => setOpportunityForm({...opportunityForm, probability: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input type="date" value={opportunityForm.expectedCloseDate} onChange={(e) => setOpportunityForm({...opportunityForm, expectedCloseDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={opportunityForm.description} onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpportunityDialog(false)}>Cancel</Button>
            <Button onClick={handleOpportunitySubmit}>{editingOpportunity ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityForm.type} onValueChange={(v: any) => setActivityForm({...activityForm, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input value={activityForm.subject} onChange={(e) => setActivityForm({...activityForm, subject: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={activityForm.description} onChange={(e) => setActivityForm({...activityForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>Cancel</Button>
            <Button onClick={handleActivitySubmit}>Log Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      <Dialog open={showLeadDetailDialog} onOpenChange={setShowLeadDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedLead.company || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedLead.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedLead.phone || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <p className="font-medium capitalize">{selectedLead.source?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getLeadStatusBadge(selectedLead.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estimated Value</Label>
                  <p className="font-medium">{selectedLead.estimatedValue ? formatCurrency(Number(selectedLead.estimatedValue), currency) : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{format(new Date(selectedLead.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDetailDialog(false)}>Close</Button>
            <Button onClick={() => { openEditLead(selectedLead); setShowLeadDetailDialog(false); }}>
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Detail Dialog */}
      <Dialog open={showOpportunityDetailDialog} onOpenChange={setShowOpportunityDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Opportunity Details</DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedOpportunity.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stage</Label>
                  <div className="mt-1">{getOpportunityStage(selectedOpportunity.stage)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedOpportunity.amount) || 0, currency)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Probability</Label>
                  <p className="font-medium">{selectedOpportunity.probability}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Expected Close Date</Label>
                  <p className="font-medium">
                    {selectedOpportunity.expectedCloseDate 
                      ? format(new Date(selectedOpportunity.expectedCloseDate), 'MMM d, yyyy')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{format(new Date(selectedOpportunity.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              {selectedOpportunity.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedOpportunity.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpportunityDetailDialog(false)}>Close</Button>
            <Button onClick={() => { openEditOpportunity(selectedOpportunity); setShowOpportunityDetailDialog(false); }}>
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Client Dialog */}
      <Dialog open={quickAddClientOpen} onOpenChange={setQuickAddClientOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickAddClientOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newClientName.trim()) {
                  toast.error('Client name is required');
                  return;
                }
                createCustomerMutation.mutate({
                  name: newClientName.trim(),
                  email: newClientEmail.trim() || undefined,
                  phone: newClientPhone.trim() || undefined,
                  status: 'warm',
                });
              }}
              disabled={!newClientName.trim() || createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
