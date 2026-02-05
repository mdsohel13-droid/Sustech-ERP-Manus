import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format, differenceInDays, parseISO, subMonths } from 'date-fns';
import { Plus, Edit, Trash2, Eye, TrendingUp, TrendingDown, AlertCircle, DollarSign, CreditCard, Receipt, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, FileText, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function FinancialEnhanced() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();

  const formatCurrency = (value: number, curr: string) => {
    const symbols: { [key: string]: string } = {
      BDT: '৳',
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
    };
    const symbol = symbols[curr] || curr + ' ';
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const { data: arData, isLoading: arLoading } = trpc.financial.getAllAR.useQuery();
  const { data: apData, isLoading: apLoading } = trpc.financial.getAllAP.useQuery();
  const { data: incomeData } = trpc.incomeExpenditure.getAll.useQuery();
  const { data: arSummary } = trpc.financial.getARSummary.useQuery();
  const { data: apSummary } = trpc.financial.getAPSummary.useQuery();

  const createARMutation = trpc.financial.createAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      setShowARDialog(false);
      resetARForm();
    },
  });

  const updateARMutation = trpc.financial.updateAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      setShowARDialog(false);
      resetARForm();
    },
  });

  const archiveARMutation = trpc.financial.archiveAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      utils.financial.getArchivedAR.invalidate();
      toast.success("Receivable archived successfully");
    },
    onError: () => toast.error("Failed to archive receivable"),
  });

  const createAPMutation = trpc.financial.createAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      setShowAPDialog(false);
      resetAPForm();
    },
  });

  const updateAPMutation = trpc.financial.updateAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      setShowAPDialog(false);
      resetAPForm();
    },
  });

  const archiveAPMutation = trpc.financial.archiveAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      utils.financial.getArchivedAP.invalidate();
      toast.success("Payable archived successfully");
    },
    onError: () => toast.error("Failed to archive payable"),
  });

  const [showARDialog, setShowARDialog] = useState(false);
  const [showAPDialog, setShowAPDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingAR, setEditingAR] = useState<any>(null);
  const [editingAP, setEditingAP] = useState<any>(null);

  const [arForm, setArForm] = useState({
    customerName: '',
    amount: '',
    dueDate: '',
    status: 'pending' as 'pending' | 'overdue' | 'paid',
    invoiceNumber: '',
    notes: '',
  });

  const [apForm, setApForm] = useState({
    vendorName: '',
    amount: '',
    dueDate: '',
    status: 'pending' as 'pending' | 'overdue' | 'paid',
    invoiceNumber: '',
    notes: '',
  });

  const resetARForm = () => {
    setArForm({
      customerName: '',
      amount: '',
      dueDate: '',
      status: 'pending',
      invoiceNumber: '',
      notes: '',
    });
    setEditingAR(null);
  };

  const resetAPForm = () => {
    setApForm({
      vendorName: '',
      amount: '',
      dueDate: '',
      status: 'pending',
      invoiceNumber: '',
      notes: '',
    });
    setEditingAP(null);
  };

  const metrics = useMemo(() => {
    const ar = arData || [];
    const ap = apData || [];
    const income = incomeData || [];

    const today = new Date();

    const totalAR = ar.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
    const totalAP = ap.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

    const overdueAR = ar.filter(item => {
      if (item.status === 'paid') return false;
      const dueDate = new Date(item.dueDate);
      return dueDate < today;
    }).reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

    const overdueAP = ap.filter(item => {
      if (item.status === 'paid') return false;
      const dueDate = new Date(item.dueDate);
      return dueDate < today;
    }).reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

    const paidAR = ar.filter(item => item.status === 'paid').reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
    const paidAP = ap.filter(item => item.status === 'paid').reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

    const totalIncome = income.filter(i => i.type === 'income').reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
    const totalExpenses = income.filter(i => i.type === 'expenditure').reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);

    const netCashFlow = totalIncome - totalExpenses;
    const netPosition = totalAR - totalAP;

    return {
      totalAR,
      totalAP,
      overdueAR,
      overdueAP,
      paidAR,
      paidAP,
      pendingARCount: ar.filter(i => i.status === 'pending').length,
      overdueARCount: ar.filter(i => i.status === 'overdue' || (i.status !== 'paid' && new Date(i.dueDate) < today)).length,
      pendingAPCount: ap.filter(i => i.status === 'pending').length,
      overdueAPCount: ap.filter(i => i.status === 'overdue' || (i.status !== 'paid' && new Date(i.dueDate) < today)).length,
      totalIncome,
      totalExpenses,
      netCashFlow,
      netPosition,
      collectionRate: totalAR > 0 ? ((paidAR / (totalAR + paidAR)) * 100) : 0,
    };
  }, [arData, apData, incomeData]);

  const agingData = useMemo(() => {
    const ar = arData || [];
    const today = new Date();

    const buckets = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    ar.forEach(item => {
      if (item.status === 'paid') return;
      const amount = parseFloat(item.amount || '0');
      const dueDate = new Date(item.dueDate);
      const daysOverdue = differenceInDays(today, dueDate);

      if (daysOverdue <= 0) buckets.current += amount;
      else if (daysOverdue <= 30) buckets['1-30'] += amount;
      else if (daysOverdue <= 60) buckets['31-60'] += amount;
      else if (daysOverdue <= 90) buckets['61-90'] += amount;
      else buckets['90+'] += amount;
    });

    return [
      { name: 'Current', value: buckets.current, color: '#10b981' },
      { name: '1-30 Days', value: buckets['1-30'], color: '#3b82f6' },
      { name: '31-60 Days', value: buckets['31-60'], color: '#f59e0b' },
      { name: '61-90 Days', value: buckets['61-90'], color: '#ef4444' },
      { name: '90+ Days', value: buckets['90+'], color: '#dc2626' },
    ];
  }, [arData]);

  const cashFlowData = useMemo(() => {
    const income = incomeData || [];
    const months: { [key: string]: { inflow: number; outflow: number } } = {};

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const key = format(date, 'MMM');
      months[key] = { inflow: 0, outflow: 0 };
    }

    income.forEach(item => {
      const date = new Date(item.date);
      const key = format(date, 'MMM');
      if (months[key]) {
        const amount = parseFloat(item.amount || '0');
        if (item.type === 'income') {
          months[key].inflow += amount;
        } else {
          months[key].outflow += amount;
        }
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow,
    }));
  }, [incomeData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
      case 'overdue':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const getDaysOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return null;
    const days = differenceInDays(new Date(), new Date(dueDate));
    if (days <= 0) return <span className="text-green-600">Current</span>;
    return <span className="text-red-600 font-medium">{days} days overdue</span>;
  };

  const handleARSubmit = () => {
    if (editingAR) {
      updateARMutation.mutate({
        id: editingAR.id,
        ...arForm,
      });
    } else {
      createARMutation.mutate(arForm);
    }
  };

  const handleAPSubmit = () => {
    if (editingAP) {
      updateAPMutation.mutate({
        id: editingAP.id,
        ...apForm,
      });
    } else {
      createAPMutation.mutate(apForm);
    }
  };

  const openEditAR = (item: any) => {
    setEditingAR(item);
    setArForm({
      customerName: item.customerName || '',
      amount: item.amount || '',
      dueDate: item.dueDate ? format(new Date(item.dueDate), 'yyyy-MM-dd') : '',
      status: item.status || 'pending',
      invoiceNumber: item.invoiceNumber || '',
      notes: item.notes || '',
    });
    setShowARDialog(true);
  };

  const openEditAP = (item: any) => {
    setEditingAP(item);
    setApForm({
      vendorName: item.vendorName || '',
      amount: item.amount || '',
      dueDate: item.dueDate ? format(new Date(item.dueDate), 'yyyy-MM-dd') : '',
      status: item.status || 'pending',
      invoiceNumber: item.invoiceNumber || '',
      notes: item.notes || '',
    });
    setShowAPDialog(true);
  };

  if (arLoading || apLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading financial data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance & Accounting</h1>
        <p className="text-gray-600 mt-2">Accounts Receivable, Payable, Cash Flow & Financial Analysis</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.totalAR, currency)}</p>
            <p className="text-xs opacity-80">Total AR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CreditCard className="w-8 h-8 opacity-80" />
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.totalAP, currency)}</p>
            <p className="text-xs opacity-80">Total AP</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{metrics.overdueARCount}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.overdueAR, currency)}</p>
            <p className="text-xs opacity-80">Overdue AR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Receipt className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{metrics.overdueAPCount}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.overdueAP, currency)}</p>
            <p className="text-xs opacity-80">Overdue AP</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Wallet className="w-8 h-8 opacity-80" />
              {metrics.netPosition >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.netPosition, currency)}</p>
            <p className="text-xs opacity-80">Net Position</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{metrics.collectionRate.toFixed(0)}%</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.paidAR, currency)}</p>
            <p className="text-xs opacity-80">Collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cash Flow (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Inflow" />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AR Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="value" name="Amount">
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(metrics.overdueARCount > 0 || metrics.overdueAPCount > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Overdue Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.overdueARCount > 0 && (
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <p className="text-red-700 font-medium">{metrics.overdueARCount} Overdue Receivables</p>
                  <p className="text-sm text-red-600">{formatCurrency(metrics.overdueAR, currency)} pending collection</p>
                </div>
              )}
              {metrics.overdueAPCount > 0 && (
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-orange-700 font-medium">{metrics.overdueAPCount} Overdue Payables</p>
                  <p className="text-sm text-orange-600">{formatCurrency(metrics.overdueAP, currency)} pending payment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="ar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Accounts Receivable Tab */}
        <TabsContent value="ar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accounts Receivable</h2>
            <Button onClick={() => { resetARForm(); setShowARDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(arData || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No receivables found. Click "New Invoice" to add one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (arData || []).map((item) => (
                        <TableRow key={item.id} className={item.status !== 'paid' && new Date(item.dueDate) < new Date() ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{item.invoiceNumber || `INV-${item.id}`}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(parseFloat(item.amount || '0'), currency)}</TableCell>
                          <TableCell>{format(new Date(item.dueDate), 'PP')}</TableCell>
                          <TableCell>{getStatusBadge(item.status || 'pending')}</TableCell>
                          <TableCell>{getDaysOverdue(item.dueDate, item.status || 'pending')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedItem({ ...item, type: 'ar' }); setShowDetailDialog(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditAR(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => archiveARMutation.mutate({ id: item.id })} title="Archive">
                                <Archive className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Payable Tab */}
        <TabsContent value="ap" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accounts Payable</h2>
            <Button onClick={() => { resetAPForm(); setShowAPDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> New Bill
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(apData || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No payables found. Click "New Bill" to add one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (apData || []).map((item) => (
                        <TableRow key={item.id} className={item.status !== 'paid' && new Date(item.dueDate) < new Date() ? 'bg-orange-50' : ''}>
                          <TableCell className="font-medium">{item.invoiceNumber || `BILL-${item.id}`}</TableCell>
                          <TableCell>{item.vendorName}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(parseFloat(item.amount || '0'), currency)}</TableCell>
                          <TableCell>{format(new Date(item.dueDate), 'PP')}</TableCell>
                          <TableCell>{getStatusBadge(item.status || 'pending')}</TableCell>
                          <TableCell>{getDaysOverdue(item.dueDate, item.status || 'pending')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedItem({ ...item, type: 'ap' }); setShowDetailDialog(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditAP(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => archiveAPMutation.mutate({ id: item.id })} title="Archive">
                                <Archive className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalIncome, currency)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses, currency)}</p>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${metrics.netCashFlow >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${metrics.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(metrics.netCashFlow, currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Trend</CardTitle>
              <CardDescription>Monthly inflow vs outflow comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                  <Line type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} name="Inflow" />
                  <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Outflow" />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Net" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receivables Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span>Total Outstanding</span>
                  <span className="font-bold text-blue-600">{formatCurrency(metrics.totalAR, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Collected (Paid)</span>
                  <span className="font-bold text-green-600">{formatCurrency(metrics.paidAR, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span>Overdue</span>
                  <span className="font-bold text-red-600">{formatCurrency(metrics.overdueAR, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Collection Rate</span>
                  <span className="font-bold">{metrics.collectionRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payables Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Total Outstanding</span>
                  <span className="font-bold text-orange-600">{formatCurrency(metrics.totalAP, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Paid</span>
                  <span className="font-bold text-green-600">{formatCurrency(metrics.paidAP, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span>Overdue</span>
                  <span className="font-bold text-amber-600">{formatCurrency(metrics.overdueAP, currency)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span>Net Position (AR - AP)</span>
                  <span className={`font-bold ${metrics.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.netPosition, currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AR Dialog */}
      <Dialog open={showARDialog} onOpenChange={setShowARDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAR ? 'Edit Receivable' : 'New Receivable'}</DialogTitle>
            <DialogDescription>
              {editingAR ? 'Update the receivable details' : 'Add a new accounts receivable entry'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={arForm.customerName}
                onChange={(e) => setArForm({ ...arForm, customerName: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={arForm.amount}
                onChange={(e) => setArForm({ ...arForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={arForm.dueDate}
                onChange={(e) => setArForm({ ...arForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={arForm.status} onValueChange={(value: any) => setArForm({ ...arForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={arForm.invoiceNumber}
                onChange={(e) => setArForm({ ...arForm, invoiceNumber: e.target.value })}
                placeholder="INV-2026-001"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={arForm.notes}
                onChange={(e) => setArForm({ ...arForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowARDialog(false)}>Cancel</Button>
            <Button onClick={handleARSubmit} disabled={!arForm.customerName || !arForm.amount || !arForm.dueDate}>
              {editingAR ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AP Dialog */}
      <Dialog open={showAPDialog} onOpenChange={setShowAPDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAP ? 'Edit Payable' : 'New Payable'}</DialogTitle>
            <DialogDescription>
              {editingAP ? 'Update the payable details' : 'Add a new accounts payable entry'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendor Name *</Label>
              <Input
                value={apForm.vendorName}
                onChange={(e) => setApForm({ ...apForm, vendorName: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={apForm.amount}
                onChange={(e) => setApForm({ ...apForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={apForm.dueDate}
                onChange={(e) => setApForm({ ...apForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={apForm.status} onValueChange={(value: any) => setApForm({ ...apForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invoice/Bill Number</Label>
              <Input
                value={apForm.invoiceNumber}
                onChange={(e) => setApForm({ ...apForm, invoiceNumber: e.target.value })}
                placeholder="BILL-2026-001"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={apForm.notes}
                onChange={(e) => setApForm({ ...apForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAPDialog(false)}>Cancel</Button>
            <Button onClick={handleAPSubmit} disabled={!apForm.vendorName || !apForm.amount || !apForm.dueDate}>
              {editingAP ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'ar' ? 'Receivable Details' : 'Payable Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">
                    {selectedItem.type === 'ar' ? 'Customer' : 'Vendor'}
                  </Label>
                  <p className="font-medium">{selectedItem.customerName || selectedItem.vendorName}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Amount</Label>
                  <p className="font-medium">{formatCurrency(parseFloat(selectedItem.amount || '0'), currency)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Due Date</Label>
                  <p className="font-medium">{format(new Date(selectedItem.dueDate), 'PP')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div>{getStatusBadge(selectedItem.status || 'pending')}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Invoice #</Label>
                  <p className="font-medium">{selectedItem.invoiceNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created</Label>
                  <p className="font-medium">{selectedItem.createdAt ? format(new Date(selectedItem.createdAt), 'PP') : '-'}</p>
                </div>
              </div>
              {selectedItem.notes && (
                <div>
                  <Label className="text-gray-500">Notes</Label>
                  <p className="text-gray-700">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
