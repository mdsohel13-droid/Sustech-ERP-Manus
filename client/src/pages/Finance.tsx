import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ChevronDown,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Users,
  Package,
  Target,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ComposedChart, Cell, AreaChart, Area, PieChart, Pie, Legend
} from "recharts";
import { useToast } from "@/components/Toast";

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
  const [addJournalOpen, setAddJournalOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.financial.getDashboardStats.useQuery({ period });
  const { data: monthlyTrend = [] } = trpc.financial.getMonthlyTrend.useQuery({ months: 12 });
  const { data: cashFlow = [] } = trpc.financial.getCashFlowData.useQuery({ months: 6 });
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

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const getBenchmarkChange = (value: number, benchmarkValue: number) => {
    if (benchmarkValue === 0) return { value: 0, isPositive: true };
    const change = ((value - benchmarkValue) / Math.abs(benchmarkValue)) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const revenueChange = stats?.benchmarks ? getBenchmarkChange(stats.revenue, stats.benchmarks.revenueBenchmark) : { value: 0, isPositive: true };
  const cogsChange = stats?.benchmarks ? getBenchmarkChange(stats.cogs, stats.benchmarks.cogsBenchmark) : { value: 0, isPositive: false };
  const grossProfitChange = stats?.benchmarks ? getBenchmarkChange(stats.grossProfit, stats.benchmarks.grossProfitBenchmark) : { value: 0, isPositive: true };
  const netProfitChange = stats?.benchmarks ? getBenchmarkChange(stats.netProfit, stats.benchmarks.netProfitBenchmark) : { value: 0, isPositive: true };

  const CircularProgress = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(Math.abs(value), 100) / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle 
              cx="48" cy="48" r={radius} 
              stroke={color} strokeWidth="8" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${value < 0 ? 'text-red-500' : ''}`}>{value.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
      </div>
    );
  };

  const agingData = useMemo(() => {
    if (!arAging?.aging) return [];
    return [
      { name: 'Current', ar: arAging.aging.current || 0, ap: apAging?.aging?.current || 0, fill: AGING_COLORS[0] },
      { name: '1-30 Days', ar: arAging.aging.days30 || 0, ap: apAging?.aging?.days30 || 0, fill: AGING_COLORS[1] },
      { name: '31-60 Days', ar: arAging.aging.days60 || 0, ap: apAging?.aging?.days60 || 0, fill: AGING_COLORS[2] },
      { name: '61-90 Days', ar: arAging.aging.days90 || 0, ap: apAging?.aging?.days90 || 0, fill: AGING_COLORS[3] },
      { name: '90+ Days', ar: arAging.aging.over90 || 0, ap: apAging?.aging?.over90 || 0, fill: AGING_COLORS[4] },
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

  const renderOverviewTab = () => (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{formatCompact(stats?.revenue || 0)}</span>
              {revenueChange.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              vs {benchmark === 'lastYear' ? 'Last Year' : 'Budget'}: {revenueChange.isPositive ? '+' : '-'}{revenueChange.value.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Cost of Goods Sold</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">{formatCompact(stats?.cogs || 0)}</span>
              {cogsChange.isPositive ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {((stats?.cogs || 0) / (stats?.revenue || 1) * 100).toFixed(1)}% of Revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Gross Profit</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">{formatCompact(stats?.grossProfit || 0)}</span>
              {grossProfitChange.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Margin: {stats?.grossProfitMargin?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-violet-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                {formatCompact(stats?.netProfit || 0)}
              </span>
              {netProfitChange.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Margin: {stats?.netProfitMargin?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex justify-around">
            <CircularProgress 
              value={stats?.grossProfitMargin || 0} 
              label="Gross Profit Margin" 
              color={COLORS.grossProfit}
            />
            <CircularProgress 
              value={stats?.operatingExpenseRatio || 0} 
              label="Operating Expense Ratio" 
              color={COLORS.opex}
            />
            <CircularProgress 
              value={stats?.netProfitMargin || 0} 
              label="Net Profit Margin" 
              color={COLORS.netProfit}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> COGS</span>
              <span className="flex items-center gap-1 text-muted-foreground">— Gross Margin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number, name: string) => [
                    name === 'grossProfitMargin' ? `${value.toFixed(1)}%` : formatCurrency(value, currency),
                    name === 'grossProfitMargin' ? 'Gross Margin' : name === 'revenue' ? 'Revenue' : 'COGS'
                  ]} />
                  <Bar yAxisId="left" dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="cogs" fill={COLORS.cogs} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="grossProfitMargin" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Gross Profit</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> OPEX</span>
              <span className="flex items-center gap-1 text-muted-foreground">— Net Margin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number, name: string) => [
                    name === 'netProfitMargin' ? `${value.toFixed(1)}%` : formatCurrency(value, currency),
                    name === 'netProfitMargin' ? 'Net Margin' : name === 'grossProfit' ? 'Gross Profit' : 'OPEX'
                  ]} />
                  <Bar yAxisId="left" dataKey="grossProfit" fill={COLORS.grossProfit} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="opex" fill={COLORS.opex} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="netProfitMargin" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(stats?.totalAssets || 0, currency)}</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">Current Assets</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Cash & Bank</p>
                  <p className="font-medium">{formatCurrency(stats?.currentAssets?.cashBalance || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Accounts Receivable</p>
                  <p className="font-medium">{formatCurrency(stats?.currentAssets?.accountReceivables || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Deposits & Prepayments</p>
                  <p className="font-medium">{formatCurrency(stats?.currentAssets?.deposits || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Inventory</p>
                  <p className="font-medium">{formatCurrency(stats?.currentAssets?.inventory || 0, currency)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <span className="text-xl font-bold text-red-600">{formatCurrency(stats?.totalLiabilities || 0, currency)}</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">Current Liabilities</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Wages Payable</p>
                  <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.wagesPayable || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Accounts Payable</p>
                  <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.accountPayables || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-pink-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Provisions & Accruals</p>
                  <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.provisions || 0, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Other Payables</p>
                  <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.otherPayable || 0, currency)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderBalanceSheetTab = () => {
    const totalAssets = balanceSheet?.assets?.totalAssets || stats?.totalAssets || 0;
    const totalLiabilities = balanceSheet?.liabilities?.totalLiabilities || stats?.totalLiabilities || 0;
    const equity = balanceSheet?.equity?.totalEquity || (totalAssets - totalLiabilities);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Balance Sheet</h2>
            <p className="text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalAssets, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500 rounded-lg">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalLiabilities, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner's Equity</p>
                  <p className={`text-2xl font-bold ${equity >= 0 ? 'text-violet-700 dark:text-violet-400' : 'text-red-600'}`}>
                    {formatCurrency(equity, currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Assets</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cash</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.cash || stats?.currentAssets?.cashBalance || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Bank Balances</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.bank || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Accounts Receivable</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.accountsReceivable || stats?.currentAssets?.accountReceivables || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Deposits & Prepayments</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.deposits || stats?.currentAssets?.deposits || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Inventory</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.currentAssets?.inventory || stats?.currentAssets?.inventory || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-semibold">Total Current Assets</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(balanceSheet?.assets?.currentAssets?.total || totalAssets, currency)}</TableCell>
                      </TableRow>
                      {(balanceSheet?.assets?.fixedAssets?.total || 0) > 0 && (
                        <>
                          <TableRow>
                            <TableCell>Fixed Assets</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.assets?.fixedAssets?.total || 0, currency)}</TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow className="bg-emerald-50 dark:bg-emerald-950/30">
                        <TableCell className="font-bold">Total Assets</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(totalAssets, currency)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Liabilities & Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Liabilities</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Wages Payable</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.wagesPayable || stats?.currentLiabilities?.wagesPayable || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Accounts Payable</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.accountsPayable || stats?.currentLiabilities?.accountPayables || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Taxes Payable</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.taxesPayable || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Provisions & Accruals</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.provisions || stats?.currentLiabilities?.provisions || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other Payables</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(balanceSheet?.liabilities?.currentLiabilities?.otherPayable || stats?.currentLiabilities?.otherPayable || 0, currency)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-red-50 dark:bg-red-950/30">
                        <TableCell className="font-semibold">Total Liabilities</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(totalLiabilities, currency)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-violet-50 dark:bg-violet-950/30">
                        <TableCell className="font-semibold">Owner's Equity</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(equity, currency)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted">
                        <TableCell className="font-bold">Total Liabilities + Equity</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(totalAssets, currency)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balance Sheet Visualization</CardTitle>
          </CardHeader>
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
                    {[
                      { name: 'Assets', fill: COLORS.grossProfit },
                      { name: 'Liabilities', fill: COLORS.cogs },
                      { name: 'Equity', fill: COLORS.netProfit }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
          <h2 className="text-2xl font-bold">Cash Flow Statement</h2>
          <p className="text-muted-foreground">Last 6 months cash flow analysis</p>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inflows</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(cashFlow.reduce((sum, m) => sum + (m.inflow || 0), 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 rounded-lg">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outflows</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {formatCurrency(cashFlow.reduce((sum, m) => sum + (m.outflow || 0), 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${cashFlow.reduce((sum, m) => sum + (m.net || 0), 0) >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.reduce((sum, m) => sum + (m.net || 0), 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cash Flow Trend</CardTitle>
        </CardHeader>
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
                <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Cash Flow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Cash Inflow</TableHead>
                <TableHead className="text-right">Cash Outflow</TableHead>
                <TableHead className="text-right">Net Cash Flow</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlow.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(row.inflow || 0, currency)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(row.outflow || 0, currency)}</TableCell>
                  <TableCell className={`text-right font-medium ${(row.net || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(row.net || 0, currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(row.net || 0) >= 0 ? (
                      <Badge className="bg-green-100 text-green-800">Positive</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Negative</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
          <h2 className="text-2xl font-bold">AR-AP</h2>
          <p className="text-muted-foreground">Accounts Receivable & Payable aging analysis</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addAROpen} onOpenChange={setAddAROpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Receivable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Accounts Receivable</DialogTitle>
                <DialogDescription>Record a new receivable entry</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAR} className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" name="customerName" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" name="invoiceNumber" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddAROpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAR.isPending}>
                    {createAR.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addAPOpen} onOpenChange={setAddAPOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Plus className="w-4 h-4 mr-2" />
                Add Payable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Accounts Payable</DialogTitle>
                <DialogDescription>Record a new payable entry</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAP} className="space-y-4">
                <div>
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input id="vendorName" name="vendorName" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" name="invoiceNumber" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddAPOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAP.isPending}>
                    {createAP.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Receivables</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(arTotal, currency)}
                </p>
                <p className="text-xs text-muted-foreground">{arData.length} invoices pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payables</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {formatCurrency(apTotal, currency)}
                </p>
                <p className="text-xs text-muted-foreground">{apData.length} bills pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aging Analysis Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatCompact(v)} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="ar" name="Accounts Receivable" fill={COLORS.grossProfit} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ap" name="Accounts Payable" fill={COLORS.cogs} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Accounts Receivable Aging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aging Bucket</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }}></span>
                      {row.name}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ar, currency)}</TableCell>
                    <TableCell className="text-right">
                      {arTotal ? ((row.ar / arTotal) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(arTotal, currency)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-red-500" />
              Accounts Payable Aging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aging Bucket</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }}></span>
                      {row.name}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ap, currency)}</TableCell>
                    <TableCell className="text-right">
                      {apTotal ? ((row.ap / apTotal) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(apTotal, currency)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Receivables</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arData.slice(0, 5).map((ar: any) => (
                <TableRow key={ar.id}>
                  <TableCell className="font-medium">{ar.invoiceNumber || `INV-${ar.id}`}</TableCell>
                  <TableCell>{ar.customerName}</TableCell>
                  <TableCell>{new Date(ar.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(ar.amount), currency)}</TableCell>
                  <TableCell>
                    <Badge variant={ar.status === 'paid' ? 'default' : ar.status === 'pending' ? 'secondary' : 'destructive'}>
                      {ar.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {arData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No receivables found. Click "Add Receivable" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderForecastingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Forecasting</h2>
          <p className="text-muted-foreground">6-month revenue and profit projections based on historical trends</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalculate
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Forecast Methodology</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Projections are calculated using weighted moving average based on the last 3 months of actual data. 
                COGS is estimated at 59% of revenue, consistent with historical patterns. 
                These forecasts are for planning purposes only and should be validated with market conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Revenue (6mo)</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(forecastData.filter(d => d.projected).reduce((sum, d) => sum + d.revenue, 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Gross Profit (6mo)</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(forecastData.filter(d => d.projected).reduce((sum, d) => sum + d.grossProfit, 0), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly Growth Rate</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                  {monthlyTrend.length >= 2 ? 
                    `${(((monthlyTrend[monthlyTrend.length - 1]?.revenue || 0) / (monthlyTrend[monthlyTrend.length - 2]?.revenue || 1) - 1) * 100).toFixed(1)}%` 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  fill="#3B82F620" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray={(d: any) => d.projected ? "5 5" : "0"}
                />
                <Line 
                  type="monotone" 
                  dataKey="grossProfit" 
                  name="Gross Profit"
                  stroke="#10B981" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forecast Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastData.map((row, idx) => (
                <TableRow key={idx} className={row.projected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.revenue, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.cogs, currency)}</TableCell>
                  <TableCell className="text-right text-emerald-600">{formatCurrency(row.grossProfit, currency)}</TableCell>
                  <TableCell>
                    {row.projected ? (
                      <Badge className="bg-blue-100 text-blue-800">Projected</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Actual</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-52 border-r bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Finance</p>
              <p className="text-[10px] text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          <Button 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button 
            variant={activeTab === 'balanceSheet' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('balanceSheet')}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Balance Sheet
          </Button>
          <Button 
            variant={activeTab === 'cashFlow' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('cashFlow')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Cash Flow
          </Button>
          <Button 
            variant={activeTab === 'aging' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('aging')}
          >
            <Clock className="w-4 h-4 mr-2" />
            AR-AP
          </Button>
          <Button 
            variant={activeTab === 'forecasting' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('forecasting')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Forecasting
          </Button>

          <div className="pt-6 border-t mt-4">
            <p className="text-xs text-muted-foreground mb-2">Period</p>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={period === 'mtd' ? 'default' : 'outline'}
                onClick={() => setPeriod('mtd')}
                className="flex-1 text-xs"
              >
                MTD
              </Button>
              <Button 
                size="sm" 
                variant={period === 'ytd' ? 'default' : 'outline'}
                onClick={() => setPeriod('ytd')}
                className="flex-1 text-xs"
              >
                YTD
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Compare</p>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={benchmark === 'budget' ? 'default' : 'outline'}
                onClick={() => setBenchmark('budget')}
                className="flex-1 text-xs"
              >
                Budget
              </Button>
              <Button 
                size="sm" 
                variant={benchmark === 'lastYear' ? 'default' : 'outline'}
                onClick={() => setBenchmark('lastYear')}
                className="flex-1 text-xs"
              >
                Last Year
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'balanceSheet' && renderBalanceSheetTab()}
          {activeTab === 'cashFlow' && renderCashFlowTab()}
          {activeTab === 'aging' && renderAgingTab()}
          {activeTab === 'forecasting' && renderForecastingTab()}
        </div>

        {activeTab === 'overview' && (
          <div className="w-72 border-l bg-muted/10 p-4 space-y-4 overflow-auto">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Showing data for:</p>
              <div className="flex items-center gap-2">
                <select className="text-sm border rounded px-2 py-1 bg-background flex-1">
                  <option>Last</option>
                  <option>This</option>
                </select>
                <input type="number" defaultValue={period === 'ytd' ? 12 : 1} className="w-12 text-sm border rounded px-2 py-1 bg-background" />
                <select className="text-sm border rounded px-2 py-1 bg-background flex-1">
                  <option>{period === 'ytd' ? 'Months' : 'Month'}</option>
                  <option>Quarters</option>
                  <option>Years</option>
                </select>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{period === 'ytd' ? '1/1/2026 - 1/29/2026' : '1/1/2026 - 1/29/2026'}</span>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Income Statement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {incomeStatement?.items?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{item.name}</span>
                      <span>{formatCompact(item.value)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.name === 'Revenue' ? 'bg-blue-500' :
                          item.name === 'COGS' ? 'bg-red-400' :
                          item.name === 'Gross Profit' ? 'bg-emerald-400' :
                          item.name === 'OPEX' ? 'bg-amber-400' :
                          'bg-violet-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.abs(item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Key Ratios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Ratio</span>
                  <span className="font-medium">
                    {((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quick Ratio</span>
                  <span className="font-medium">
                    {(((stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0)) / (stats?.totalLiabilities || 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Debt to Equity</span>
                  <span className="font-medium">
                    {((stats?.totalLiabilities || 0) / Math.max(1, (stats?.totalAssets || 0) - (stats?.totalLiabilities || 0))).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Smart Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <p>
                  <span className="text-emerald-600 font-medium">Gross Profit Margin</span> is at {stats?.grossProfitMargin?.toFixed(1) || 0}%, 
                  {(stats?.grossProfitMargin || 0) > 30 ? ' above' : ' below'} the industry average of 30%.
                </p>
                <p>
                  Your <span className="text-blue-600 font-medium">Current Ratio</span> of {((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)).toFixed(2)} 
                  indicates {((stats?.totalAssets || 0) / (stats?.totalLiabilities || 1)) > 1.5 ? 'healthy liquidity' : 'potential liquidity concerns'}.
                </p>
                <p>
                  Accounts Receivable aging shows <span className={`font-medium ${(arAging?.aging?.over90 || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formatCurrency(arAging?.aging?.over90 || 0, currency)}
                  </span> over 90 days.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
