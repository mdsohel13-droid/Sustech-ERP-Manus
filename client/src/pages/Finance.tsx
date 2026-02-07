import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  FileText,
  BarChart3,
  Wallet,
  Clock,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Target,
  Trash2,
  RefreshCw,
  Shield,
  Banknote,
  Globe,
  Scale,
  Brain,
  BookOpen
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ComposedChart, Cell, AreaChart, Area, PieChart, Pie, Legend, LabelList
} from "recharts";
import { useToast } from "@/components/Toast";

import OverviewTab from "./finance/OverviewTab";
import MultiCurrencyTab from "./finance/MultiCurrencyTab";
import TaxComplianceTab from "./finance/TaxComplianceTab";
import IFRSTab from "./finance/IFRSTab";
import AnomalyDetectionTab from "./finance/AnomalyDetectionTab";

const COLORS = {
  revenue: '#3B82F6',
  cogs: '#EF4444',
  grossProfit: '#10B981',
  opex: '#F59E0B',
  netProfit: '#8B5CF6',
  inflow: '#22C55E',
  outflow: '#EF4444'
};

const AGING_COLORS = ['#22C55E', '#84CC16', '#EAB308', '#F97316', '#EF4444'];

export default function Finance() {
  const { currency } = useCurrency();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<'mtd' | 'ytd'>('ytd');
  const [benchmark, setBenchmark] = useState<'budget' | 'lastYear'>('lastYear');
  const [addAROpen, setAddAROpen] = useState(false);
  const [addAPOpen, setAddAPOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{ id: number; type: 'ar' | 'ap'; name: string; amount: number; paidAmount: number } | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; type: 'ar' | 'ap' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [addJournalOpen, setAddJournalOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: currentUser } = trpc.auth.me.useQuery();

  const { data: stats, isLoading: statsLoading } = trpc.financial.getDashboardStats.useQuery({ period }, { refetchInterval: 15000, refetchOnWindowFocus: true });
  const { data: monthlyTrend = [] as any[] } = trpc.financial.getMonthlyTrend.useQuery({ months: 12 }, { refetchInterval: 15000, refetchOnWindowFocus: true });
  const { data: cashFlow = [] as any[] } = trpc.financial.getCashFlowData.useQuery({ months: 6 }, { refetchInterval: 15000 });
  const { data: incomeStatement } = trpc.financial.getIncomeStatement.useQuery({ period });
  const { data: arAging } = trpc.financial.getAgingReport.useQuery({ type: 'receivable' });
  const { data: apAging } = trpc.financial.getAgingReport.useQuery({ type: 'payable' });
  const { data: arData = [] } = trpc.financial.getAllAR.useQuery();
  const { data: apData = [] } = trpc.financial.getAllAP.useQuery();
  const { data: balanceSheet } = trpc.financial.getBalanceSheet.useQuery();
  const { data: financialAccounts = [] } = trpc.financial.getAllFinancialAccounts.useQuery();

  const createAR = trpc.financial.createAR.useMutation({
    onSuccess: () => {
      toast.success("Success", "Accounts Receivable entry created");
      utils.financial.getAllAR.invalidate();
      utils.financial.getDashboardStats.invalidate();
      utils.financial.getAgingReport.invalidate();
      setAddAROpen(false);
    }
  });

  const createAP = trpc.financial.createAP.useMutation({
    onSuccess: () => {
      toast.success("Success", "Accounts Payable entry created");
      utils.financial.getAllAP.invalidate();
      utils.financial.getDashboardStats.invalidate();
      utils.financial.getAgingReport.invalidate();
      setAddAPOpen(false);
    }
  });

  const { data: pendingApprovals } = trpc.fin.getPendingApprovals.useQuery();

  const approveARMutation = trpc.fin.approveAR.useMutation({
    onSuccess: () => { toast.success("Success", "AR entry approved"); utils.financial.getAllAR.invalidate(); utils.fin.getPendingApprovals.invalidate(); },
    onError: (err) => toast.error("Error", err.message),
  });

  const rejectARMutation = trpc.fin.rejectAR.useMutation({
    onSuccess: () => { toast.success("Success", "AR entry rejected"); utils.financial.getAllAR.invalidate(); utils.fin.getPendingApprovals.invalidate(); setRejectDialogOpen(false); setRejectReason(''); },
    onError: (err) => toast.error("Error", err.message),
  });

  const approveAPMutation = trpc.fin.approveAP.useMutation({
    onSuccess: () => { toast.success("Success", "AP entry approved"); utils.financial.getAllAP.invalidate(); utils.fin.getPendingApprovals.invalidate(); },
    onError: (err) => toast.error("Error", err.message),
  });

  const rejectAPMutation = trpc.fin.rejectAP.useMutation({
    onSuccess: () => { toast.success("Success", "AP entry rejected"); utils.financial.getAllAP.invalidate(); utils.fin.getPendingApprovals.invalidate(); setRejectDialogOpen(false); setRejectReason(''); },
    onError: (err) => toast.error("Error", err.message),
  });

  const recordARPaymentMutation = trpc.fin.recordARPayment.useMutation({
    onSuccess: () => { toast.success("Success", "AR payment recorded"); utils.financial.getAllAR.invalidate(); setPaymentDialogOpen(false); setPaymentTarget(null); },
    onError: (err) => toast.error("Error", err.message),
  });

  const recordAPPaymentMutation = trpc.fin.recordAPPayment.useMutation({
    onSuccess: () => { toast.success("Success", "AP payment recorded"); utils.financial.getAllAP.invalidate(); setPaymentDialogOpen(false); setPaymentTarget(null); },
    onError: (err) => toast.error("Error", err.message),
  });

  const { data: paymentHistory } = trpc.fin.getPaymentHistory.useQuery(
    { recordType: paymentTarget?.type === 'ar' ? 'ar_payment' : 'ap_payment', referenceId: paymentTarget?.id || 0 },
    { enabled: !!paymentTarget }
  );

  const { data: budgetVariance } = trpc.fin.getBudgetVarianceAnalysis.useQuery({ monthYear: budgetMonth }, { refetchInterval: 15000, refetchOnWindowFocus: true });

  const createBudget = trpc.budget.create.useMutation({
    onSuccess: () => { toast.success("Success", "Budget entry created"); utils.fin.getBudgetVarianceAnalysis.invalidate(); setAddBudgetOpen(false); },
    onError: (err) => toast.error("Error", err.message),
  });

  const deleteBudget = trpc.budget.delete.useMutation({
    onSuccess: () => { toast.success("Success", "Budget entry deleted"); utils.fin.getBudgetVarianceAnalysis.invalidate(); },
    onError: (err) => toast.error("Error", err.message),
  });

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const agingData = useMemo(() => {
    if (!arAging?.aging) return [];
    return [
      { name: 'Current', ar: arAging.aging.current || 0, ap: apAging?.aging?.current || 0 },
      { name: '1-30 Days', ar: arAging.aging.days30 || 0, ap: apAging?.aging?.days30 || 0 },
      { name: '31-60 Days', ar: arAging.aging.days60 || 0, ap: apAging?.aging?.days60 || 0 },
      { name: '61-90 Days', ar: arAging.aging.days90 || 0, ap: apAging?.aging?.days90 || 0 },
      { name: '90+ Days', ar: arAging.aging.over90 || 0, ap: apAging?.aging?.over90 || 0 },
    ];
  }, [arAging, apAging]);
  
  const arTotal = arAging?.aging ? (arAging.aging.current + arAging.aging.days30 + arAging.aging.days60 + arAging.aging.days90 + arAging.aging.over90) : 0;
  const apTotal = apAging?.aging ? (apAging.aging.current + apAging.aging.days30 + apAging.aging.days60 + apAging.aging.days90 + apAging.aging.over90) : 0;

  const forecastData = useMemo(() => {
    if (monthlyTrend.length < 3) return [];
    const lastThreeMonths = monthlyTrend.slice(-3);
    const avgGrowth = lastThreeMonths.reduce((sum, m, i, arr) => {
      if (i === 0) return 0;
      const prev = arr[i - 1].revenue || 1;
      return sum + ((m.revenue - prev) / prev);
    }, 0) / 2;

    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const projections = [];
    let projectedRevenue = lastMonth.revenue;
    
    const futureMonths = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    for (let i = 0; i < 6; i++) {
      projectedRevenue = projectedRevenue * (1 + avgGrowth * 0.5);
      const projectedCogs = projectedRevenue * 0.59;
      const projectedGrossProfit = projectedRevenue - projectedCogs;
      projections.push({
        month: futureMonths[i],
        revenue: Math.round(projectedRevenue),
        cogs: Math.round(projectedCogs),
        grossProfit: Math.round(projectedGrossProfit),
        projected: true
      });
    }
    return [...monthlyTrend.slice(-6).map(m => ({ ...m, projected: false })), ...projections];
  }, [monthlyTrend]);

  const handleAddAR = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAR.mutate({
      customerName: formData.get('customerName') as string,
      amount: formData.get('amount') as string,
      dueDate: formData.get('dueDate') as string,
      invoiceNumber: formData.get('invoiceNumber') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    });
  };

  const handleAddAP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAP.mutate({
      vendorName: formData.get('vendorName') as string,
      amount: formData.get('amount') as string,
      dueDate: formData.get('dueDate') as string,
      invoiceNumber: formData.get('invoiceNumber') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    });
  };

  const renderBalanceSheetTab = () => {
    const totalAssets = balanceSheet?.assets?.totalAssets || stats?.totalAssets || 0;
    const totalLiabilities = balanceSheet?.liabilities?.totalLiabilities || stats?.totalLiabilities || 0;
    const equity = balanceSheet?.equity?.totalEquity || (totalAssets - totalLiabilities);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0d2137]">Balance Sheet</h2>
            <p className="text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
          </div>
          <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" />Export PDF</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-lg"><ArrowUpRight className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAssets, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500 rounded-lg"><ArrowDownRight className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(totalLiabilities, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500 rounded-lg"><Building className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner's Equity</p>
                  <p className={`text-2xl font-bold ${equity >= 0 ? 'text-violet-700' : 'text-red-600'}`}>{formatCurrency(equity, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Assets</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium text-slate-500" colSpan={2}>Current Assets</TableCell></TableRow>
                  <TableRow><TableCell>Cash</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.cash || stats?.currentAssets?.cashBalance || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Bank Balances</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.bank || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Accounts Receivable</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.accountsReceivable || stats?.currentAssets?.accountReceivables || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Deposits & Prepayments</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.deposits || stats?.currentAssets?.deposits || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Inventory</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.inventory || stats?.currentAssets?.inventory || 0, currency)}</TableCell></TableRow>
                  <TableRow className="bg-emerald-50"><TableCell className="font-bold">Total Assets</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalAssets, currency)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Liabilities & Equity</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium text-slate-500" colSpan={2}>Current Liabilities</TableCell></TableRow>
                  <TableRow><TableCell>Wages Payable</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.wagesPayable || stats?.currentLiabilities?.wagesPayable || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Accounts Payable</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.accountsPayable || stats?.currentLiabilities?.accountPayables || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Taxes Payable</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.taxesPayable || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Provisions & Accruals</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.provisions || stats?.currentLiabilities?.provisions || 0, currency)}</TableCell></TableRow>
                  <TableRow><TableCell>Other Payables</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.otherPayable || stats?.currentLiabilities?.otherPayable || 0, currency)}</TableCell></TableRow>
                  <TableRow className="bg-red-50"><TableCell className="font-semibold">Total Liabilities</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalLiabilities, currency)}</TableCell></TableRow>
                  <TableRow className="bg-violet-50"><TableCell className="font-semibold">Owner's Equity</TableCell><TableCell className="text-right font-bold">{formatCurrency(equity, currency)}</TableCell></TableRow>
                  <TableRow className="bg-muted"><TableCell className="font-bold">Total Liabilities + Equity</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalAssets, currency)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Balance Sheet Visualization</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Assets', value: totalAssets, fill: COLORS.grossProfit },
                  { name: 'Liabilities', value: totalLiabilities, fill: COLORS.cogs },
                  { name: 'Equity', value: Math.max(0, equity), fill: COLORS.netProfit }
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatCompact(v)} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[COLORS.grossProfit, COLORS.cogs, COLORS.netProfit].map((fill, index) => (
                      <Cell key={`cell-${index}`} fill={fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCashFlowTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Cash Flow Statement</h2>
          <p className="text-muted-foreground">Last 6 months cash flow analysis</p>
        </div>
        <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" />Export PDF</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg"><ArrowUpRight className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inflows</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(cashFlow.reduce((sum, m) => sum + (m.inflow || 0), 0), currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 rounded-lg"><ArrowDownRight className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outflows</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(cashFlow.reduce((sum, m) => sum + (m.outflow || 0), 0), currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${cashFlow.reduce((sum, m) => sum + (m.net || 0), 0) >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.reduce((sum, m) => sum + (m.net || 0), 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Cash Flow Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="inflow" name="Cash Inflow" fill={COLORS.inflow} radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Cash Outflow" fill={COLORS.outflow} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke={COLORS.revenue} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.revenue }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Cash Flow Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Inflow</TableHead>
                <TableHead className="text-right">Outflow</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">Cumulative</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlow.map((row, idx) => {
                const cumulative = cashFlow.slice(0, idx + 1).reduce((sum, m) => sum + (m.net || 0), 0);
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(row.inflow || 0, currency)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(row.outflow || 0, currency)}</TableCell>
                    <TableCell className={`text-right font-medium ${(row.net || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(row.net || 0, currency)}</TableCell>
                    <TableCell className={`text-right font-medium ${cumulative >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(cumulative, currency)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Accounts Receivable & Payable</h2>
          <p className="text-muted-foreground">AR/AP management with aging analysis</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addAROpen} onOpenChange={setAddAROpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Add Receivable</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Accounts Receivable</DialogTitle><DialogDescription>Record a new receivable entry</DialogDescription></DialogHeader>
              <form onSubmit={handleAddAR} className="space-y-4">
                <div><Label htmlFor="customerName">Customer Name</Label><Input id="customerName" name="customerName" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" step="0.01" required /></div>
                  <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" name="dueDate" type="date" required /></div>
                </div>
                <div><Label htmlFor="invoiceNumber">Invoice Number</Label><Input id="invoiceNumber" name="invoiceNumber" /></div>
                <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddAROpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAR.isPending}>{createAR.isPending ? 'Creating...' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addAPOpen} onOpenChange={setAddAPOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50"><Plus className="w-4 h-4 mr-2" />Add Payable</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Accounts Payable</DialogTitle><DialogDescription>Record a new payable entry</DialogDescription></DialogHeader>
              <form onSubmit={handleAddAP} className="space-y-4">
                <div><Label htmlFor="vendorName">Vendor Name</Label><Input id="vendorName" name="vendorName" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" step="0.01" required /></div>
                  <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" name="dueDate" type="date" required /></div>
                </div>
                <div><Label htmlFor="invoiceNumber">Invoice Number</Label><Input id="invoiceNumber" name="invoiceNumber" /></div>
                <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddAPOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAP.isPending}>{createAP.isPending ? 'Creating...' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-lg"><CreditCard className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Receivables</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(arTotal, currency)}</p>
                <p className="text-xs text-muted-foreground">{arData.length} invoices pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payables</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(apTotal, currency)}</p>
                <p className="text-xs text-muted-foreground">{apData.length} bills pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Aging Analysis Chart</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="ar" name="Accounts Receivable" fill="#10B981" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="ar" position="top" formatter={(v: number) => v > 0 ? formatCompact(v) : ''} style={{ fontSize: 12, fontWeight: 600, fill: '#10B981' }} />
                </Bar>
                <Bar dataKey="ap" name="Accounts Payable" fill="#EF4444" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="ap" position="top" formatter={(v: number) => v > 0 ? formatCompact(v) : ''} style={{ fontSize: 12, fontWeight: 600, fill: '#EF4444' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500" />AR Aging</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Aging Bucket</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
              <TableBody>
                {agingData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }}></span>{row.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ar, currency)}</TableCell>
                    <TableCell className="text-right">{arTotal ? ((row.ar / arTotal) * 100).toFixed(1) : 0}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(arTotal, currency)}</TableCell><TableCell className="text-right">100%</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wallet className="w-5 h-5 text-red-500" />AP Aging</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Aging Bucket</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
              <TableBody>
                {agingData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }}></span>{row.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ap, currency)}</TableCell>
                    <TableCell className="text-right">{apTotal ? ((row.ap / apTotal) * 100).toFixed(1) : 0}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(apTotal, currency)}</TableCell><TableCell className="text-right">100%</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Recent Receivables</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Approval</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arData.slice(0, 10).map((ar: any) => (
                <TableRow key={ar.id}>
                  <TableCell className="font-medium">{ar.invoiceNumber || `INV-${ar.id}`}</TableCell>
                  <TableCell>{ar.customerName}</TableCell>
                  <TableCell>{new Date(ar.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(ar.amount), currency)}</TableCell>
                  <TableCell><Badge variant={ar.status === 'paid' ? 'default' : ar.status === 'pending' ? 'secondary' : 'destructive'}>{ar.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge className={ar.approval_status === 'approved' ? 'bg-green-100 text-green-800' : ar.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {ar.approval_status === 'pending_approval' ? 'Pending' : ar.approval_status || 'approved'}
                      </Badge>
                      {ar.approval_status === 'pending_approval' && (currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                        <div className="flex gap-1 ml-1">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-green-600" onClick={() => approveARMutation.mutate({ id: ar.id })}><CheckCircle className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-red-600" onClick={() => { setRejectTarget({ id: ar.id, type: 'ar' }); setRejectDialogOpen(true); }}><AlertTriangle className="w-3 h-3" /></Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(ar.approval_status === 'approved' || !ar.approval_status) && ar.status !== 'paid' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                        setPaymentTarget({ id: ar.id, type: 'ar', name: ar.customerName, amount: Number(ar.amount), paidAmount: Number(ar.paidAmount || 0) });
                        setPaymentDialogOpen(true);
                      }}><Banknote className="w-3 h-3 mr-1" />Record Payment</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {arData.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No receivables found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={(open) => { setPaymentDialogOpen(open); if (!open) setPaymentTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{paymentTarget && `Recording payment for ${paymentTarget.name} - Remaining: ${formatCurrency(paymentTarget.amount - paymentTarget.paidAmount, currency)}`}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!paymentTarget) return;
            const formData = new FormData(e.currentTarget);
            const mutation = paymentTarget.type === 'ar' ? recordARPaymentMutation : recordAPPaymentMutation;
            mutation.mutate({
              ...(paymentTarget.type === 'ar' ? { arId: paymentTarget.id } : { apId: paymentTarget.id }),
              paymentDate: formData.get('paymentDate') as string,
              amount: formData.get('amount') as string,
              paymentMethod: formData.get('paymentMethod') as string,
              referenceNumber: formData.get('referenceNumber') as string || undefined,
              bankAccount: formData.get('bankAccount') as string || undefined,
              notes: formData.get('notes') as string || undefined,
            } as any);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="paymentDate">Payment Date</Label><Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required /></div>
              <div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" step="0.01" max={paymentTarget ? paymentTarget.amount - paymentTarget.paidAmount : undefined} required /></div>
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select id="paymentMethod" name="paymentMethod" className="w-full border rounded px-3 py-2 bg-background" required>
                <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="check">Check</option><option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="referenceNumber">Reference Number</Label><Input id="referenceNumber" name="referenceNumber" /></div>
              <div><Label htmlFor="bankAccount">Bank Account</Label><Input id="bankAccount" name="bankAccount" /></div>
            </div>
            <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setPaymentDialogOpen(false); setPaymentTarget(null); }}>Cancel</Button>
              <Button type="submit" disabled={recordARPaymentMutation.isPending || recordAPPaymentMutation.isPending}>
                {(recordARPaymentMutation.isPending || recordAPPaymentMutation.isPending) ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={(open) => { setRejectDialogOpen(open); if (!open) { setRejectTarget(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Entry</DialogTitle><DialogDescription>Provide a reason for rejection</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="rejectReason">Rejection Reason</Label><Textarea id="rejectReason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRejectDialogOpen(false); setRejectTarget(null); setRejectReason(''); }}>Cancel</Button>
              <Button variant="destructive" disabled={!rejectReason || rejectARMutation.isPending || rejectAPMutation.isPending} onClick={() => {
                if (!rejectTarget) return;
                if (rejectTarget.type === 'ar') rejectARMutation.mutate({ id: rejectTarget.id, reason: rejectReason });
                else rejectAPMutation.mutate({ id: rejectTarget.id, reason: rejectReason });
              }}>
                {(rejectARMutation.isPending || rejectAPMutation.isPending) ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderForecastingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Financial Forecasting</h2>
          <p className="text-muted-foreground">6-month revenue and profit projections based on historical trends</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Recalculate</Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Forecast Methodology</p>
              <p className="text-sm text-amber-700">
                Projections are calculated using weighted moving average based on the last 3 months of actual data. 
                COGS is estimated at 59% of revenue. These forecasts are for planning purposes only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg"><Target className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Revenue (6mo)</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(forecastData.filter(d => d.projected).reduce((sum, d) => sum + d.revenue, 0), currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-lg"><TrendingUp className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Gross Profit (6mo)</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(forecastData.filter(d => d.projected).reduce((sum, d) => sum + d.grossProfit, 0), currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-500 rounded-lg"><BarChart3 className="w-6 h-6 text-white" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly Growth Rate</p>
                <p className="text-2xl font-bold text-violet-700">
                  {monthlyTrend.length >= 2 ? `${(((monthlyTrend[monthlyTrend.length - 1]?.revenue || 0) / (monthlyTrend[monthlyTrend.length - 2]?.revenue || 1) - 1) * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Forecast Chart</CardTitle>
          <CardDescription>Historical data vs projected values (dashed line indicates forecast)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" fill="#3B82F620" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Forecast Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">COGS</TableHead><TableHead className="text-right">Gross Profit</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
            <TableBody>
              {forecastData.map((row, idx) => (
                <TableRow key={idx} className={row.projected ? 'bg-blue-50/50' : ''}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.revenue, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.cogs, currency)}</TableCell>
                  <TableCell className="text-right text-emerald-600">{formatCurrency(row.grossProfit, currency)}</TableCell>
                  <TableCell>{row.projected ? <Badge className="bg-blue-100 text-blue-800">Projected</Badge> : <Badge className="bg-green-100 text-green-800">Actual</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderBudgetTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Budget vs Actual</h2>
          <p className="text-muted-foreground">Budget variance analysis for {budgetMonth}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input type="month" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} className="w-44" />
          <Dialog open={addBudgetOpen} onOpenChange={setAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Add Budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Budget Entry</DialogTitle><DialogDescription>Create a new budget line item</DialogDescription></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createBudget.mutate({
                  monthYear: formData.get('monthYear') as string,
                  type: formData.get('type') as 'income' | 'expenditure',
                  category: formData.get('category') as string,
                  budgetAmount: formData.get('budgetAmount') as string,
                  notes: formData.get('notes') as string || undefined,
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="monthYear">Month</Label><Input id="monthYear" name="monthYear" type="month" defaultValue={budgetMonth} required /></div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select id="type" name="type" className="w-full border rounded px-3 py-2 bg-background" required>
                      <option value="income">Income</option><option value="expenditure">Expenditure</option>
                    </select>
                  </div>
                </div>
                <div><Label htmlFor="category">Category</Label><Input id="category" name="category" required /></div>
                <div><Label htmlFor="budgetAmount">Budget Amount</Label><Input id="budgetAmount" name="budgetAmount" type="number" step="0.01" required /></div>
                <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddBudgetOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createBudget.isPending}>{createBudget.isPending ? 'Creating...' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm border-t-4 border-t-blue-500"><CardContent className="pt-4"><p className="text-xs text-muted-foreground mb-1">Total Budget</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(budgetVariance?.summary?.totalBudget || 0), currency)}</p></CardContent></Card>
        <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500"><CardContent className="pt-4"><p className="text-xs text-muted-foreground mb-1">Total Actual</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(Number(budgetVariance?.summary?.totalActual || 0), currency)}</p></CardContent></Card>
        <Card className="border-0 shadow-sm border-t-4 border-t-amber-500"><CardContent className="pt-4"><p className="text-xs text-muted-foreground mb-1">Total Variance</p><p className={`text-2xl font-bold ${Number(budgetVariance?.summary?.totalVariance || 0) >= 0 ? 'text-amber-600' : 'text-red-600'}`}>{formatCurrency(Number(budgetVariance?.summary?.totalVariance || 0), currency)}</p></CardContent></Card>
        <Card className="border-0 shadow-sm border-t-4 border-t-red-500"><CardContent className="pt-4"><p className="text-xs text-muted-foreground mb-1">Over Budget</p><p className="text-2xl font-bold text-red-600">{budgetVariance?.summary?.overBudgetCount || 0} items</p></CardContent></Card>
      </div>

      {budgetVariance?.items && budgetVariance.items.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Budget vs Actual by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVariance.items.map((item: any) => ({ category: item.category, budget: Number(item.budgetAmount), actual: Number(item.actual) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg">Variance Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Budget</TableHead><TableHead className="text-right">Actual</TableHead><TableHead className="text-right">Variance</TableHead><TableHead className="text-right">% Used</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {budgetVariance?.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell><Badge variant={item.type === 'income' ? 'default' : 'secondary'}>{item.type}</Badge></TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.budgetAmount), currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.actual), currency)}</TableCell>
                  <TableCell className={`text-right font-medium ${Number(item.variance) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(Number(item.variance), currency)}</TableCell>
                  <TableCell className="text-right">{item.percentUsed}%</TableCell>
                  <TableCell>
                    <Badge className={item.status === 'on_track' ? 'bg-green-100 text-green-800' : item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {item.status === 'on_track' ? 'On Track' : item.status === 'warning' ? 'Warning' : 'Over Budget'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => deleteBudget.mutate({ id: item.id })}><Trash2 className="w-3 h-3" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!budgetVariance?.items || budgetVariance.items.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No budget entries for {budgetMonth}.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const SIDEBAR_TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3, section: 'main' },
    { key: 'balanceSheet', label: 'Balance Sheet', icon: Wallet, section: 'main' },
    { key: 'cashFlow', label: 'Cash Flow', icon: DollarSign, section: 'main' },
    { key: 'aging', label: 'AR-AP', icon: Clock, section: 'main', badge: pendingApprovals?.totalPending },
    { key: 'forecasting', label: 'Forecasting', icon: TrendingUp, section: 'main' },
    { key: 'budget', label: 'Budget', icon: Target, section: 'main' },
    { key: 'multiCurrency', label: 'Multi-Currency', icon: Globe, section: 'advanced' },
    { key: 'taxCompliance', label: 'Tax Compliance', icon: Scale, section: 'advanced' },
    { key: 'ifrs', label: 'IFRS Reporting', icon: BookOpen, section: 'advanced' },
    { key: 'anomaly', label: 'AI Anomaly', icon: Brain, section: 'advanced' },
  ];

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-52 border-r bg-muted/30 p-4 space-y-1 overflow-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Finance</p>
              <p className="text-[10px] text-muted-foreground">Dashboard</p>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">Core</p>
          {SIDEBAR_TABS.filter(t => t.section === 'main').map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <Badge className="ml-auto bg-amber-500 text-white text-[10px] px-1.5 py-0">{tab.badge}</Badge>
              )}
            </Button>
          ))}

          <div className="h-px bg-border my-3" />
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">Advanced</p>
          {SIDEBAR_TABS.filter(t => t.section === 'advanced').map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}

          <div className="pt-6 border-t mt-4">
            <p className="text-xs text-muted-foreground mb-2">Period</p>
            <div className="flex gap-1">
              <Button size="sm" variant={period === 'mtd' ? 'default' : 'outline'} onClick={() => setPeriod('mtd')} className="flex-1 text-xs">MTD</Button>
              <Button size="sm" variant={period === 'ytd' ? 'default' : 'outline'} onClick={() => setPeriod('ytd')} className="flex-1 text-xs">YTD</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {activeTab === 'overview' && <OverviewTab stats={stats} monthlyTrend={monthlyTrend} budgetVariance={budgetVariance} formatCompact={formatCompact} />}
          {activeTab === 'balanceSheet' && renderBalanceSheetTab()}
          {activeTab === 'cashFlow' && renderCashFlowTab()}
          {activeTab === 'aging' && renderAgingTab()}
          {activeTab === 'forecasting' && renderForecastingTab()}
          {activeTab === 'budget' && renderBudgetTab()}
          {activeTab === 'multiCurrency' && <MultiCurrencyTab />}
          {activeTab === 'taxCompliance' && <TaxComplianceTab stats={stats} monthlyTrend={monthlyTrend} />}
          {activeTab === 'ifrs' && <IFRSTab stats={stats} balanceSheet={balanceSheet} monthlyTrend={monthlyTrend} />}
          {activeTab === 'anomaly' && <AnomalyDetectionTab stats={stats} monthlyTrend={monthlyTrend} arData={arData} apData={apData} />}
        </div>

        {activeTab === 'overview' && (
          <div className="w-72 border-l bg-muted/10 p-4 space-y-4 overflow-auto">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Showing data for:</p>
              <div className="flex items-center gap-2">
                <select className="text-sm border rounded px-2 py-1 bg-background flex-1"><option>Last</option><option>This</option></select>
                <input type="number" defaultValue={period === 'ytd' ? 12 : 1} className="w-12 text-sm border rounded px-2 py-1 bg-background" />
                <select className="text-sm border rounded px-2 py-1 bg-background flex-1"><option>{period === 'ytd' ? 'Months' : 'Month'}</option><option>Quarters</option><option>Years</option></select>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{period === 'ytd' ? '1/1/2026 - 12/31/2026' : '1/1/2026 - 1/31/2026'}</span>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Income Statement</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {incomeStatement?.items?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs"><span>{item.name}</span><span>{formatCompact(item.value)}</span></div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.name === 'Revenue' ? 'bg-blue-500' : item.name === 'COGS' ? 'bg-red-400' : item.name === 'Gross Profit' ? 'bg-emerald-400' : item.name === 'OPEX' ? 'bg-amber-400' : 'bg-violet-400'}`}
                        style={{ width: `${Math.min(100, Math.abs(item.percentage))}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Key Ratios</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current Ratio</span><span className="font-medium">{((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quick Ratio</span><span className="font-medium">{(((stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0)) / (stats?.totalLiabilities || 1)).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Debt to Equity</span><span className="font-medium">{((stats?.totalLiabilities || 0) / Math.max(1, (stats?.totalAssets || 0) - (stats?.totalLiabilities || 0))).toFixed(2)}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Smart Insights</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <p><span className="text-emerald-600 font-medium">Gross Profit Margin</span> is at {stats?.grossProfitMargin?.toFixed(1) || 0}%, {(stats?.grossProfitMargin || 0) > 30 ? ' above' : ' below'} the industry average of 30%.</p>
                <p>Your <span className="text-blue-600 font-medium">Current Ratio</span> of {((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)).toFixed(2)} indicates {((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)) > 1.5 ? 'healthy liquidity' : 'potential liquidity concerns'}.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
