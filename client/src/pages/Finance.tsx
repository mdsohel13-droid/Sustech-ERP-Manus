import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Calendar
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ComposedChart, Cell
} from "recharts";

const COLORS = {
  revenue: '#3B82F6',
  cogs: '#EF4444',
  grossProfit: '#10B981',
  opex: '#F59E0B',
  netProfit: '#8B5CF6'
};

export default function Finance() {
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<'mtd' | 'ytd'>('ytd');
  const [benchmark, setBenchmark] = useState<'budget' | 'lastYear'>('lastYear');

  const { data: stats } = trpc.financial.getDashboardStats.useQuery({ period });
  const { data: monthlyTrend = [] } = trpc.financial.getMonthlyTrend.useQuery({ months: 12 });
  const { data: cashFlow = [] } = trpc.financial.getCashFlowData.useQuery({ months: 6 });
  const { data: incomeStatement } = trpc.financial.getIncomeStatement.useQuery({ period });
  const { data: arAging } = trpc.financial.getAgingReport.useQuery({ type: 'receivable' });
  const { data: apAging } = trpc.financial.getAgingReport.useQuery({ type: 'payable' });
  const { data: arData = [] } = trpc.financial.getAllAR.useQuery();
  const { data: apData = [] } = trpc.financial.getAllAP.useQuery();

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
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
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
            <span className="text-lg font-bold">{value.toFixed(2)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Sidebar Tabs */}
        <div className="w-48 border-r bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">FINANCE</p>
              <p className="text-[10px] text-muted-foreground">DASHBOARD</p>
            </div>
          </div>
          
          <Button 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('overview')}
          >
            <FileText className="w-4 h-4 mr-2" />
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
            Aging Report
          </Button>
          <Button 
            variant={activeTab === 'forecasting' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-sm"
            onClick={() => setActiveTab('forecasting')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Forecasting
          </Button>

          <div className="pt-6">
            <p className="text-xs text-muted-foreground mb-2">Scenario</p>
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
            <p className="text-xs text-muted-foreground mb-2">Benchmark</p>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={benchmark === 'budget' ? 'default' : 'outline'}
                onClick={() => setBenchmark('budget')}
                className="flex-1 text-xs"
              >
                vs Budget
              </Button>
              <Button 
                size="sm" 
                variant={benchmark === 'lastYear' ? 'default' : 'outline'}
                onClick={() => setBenchmark('lastYear')}
                className="flex-1 text-xs"
              >
                vs Last Year
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Revenue */}
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
                  Benchmark: {formatCompact(stats?.benchmarks?.revenueBenchmark || 0)} 
                  ({revenueChange.isPositive ? '+' : '-'}{revenueChange.value.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>

            {/* COGS */}
            <Card className="border-t-4 border-t-red-500">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">COGS</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">{formatCompact(stats?.cogs || 0)}</span>
                  {!cogsChange.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Benchmark: {formatCompact(stats?.benchmarks?.cogsBenchmark || 0)} 
                  ({cogsChange.isPositive ? '-' : '+'}{cogsChange.value.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>

            {/* Gross Profit */}
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
                  Benchmark: {formatCompact(stats?.benchmarks?.grossProfitBenchmark || 0)} 
                  ({grossProfitChange.isPositive ? '+' : '-'}{grossProfitChange.value.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>

            {/* Net Profit */}
            <Card className="border-t-4 border-t-violet-500">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-violet-600">{formatCompact(stats?.netProfit || 0)}</span>
                  {netProfitChange.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Benchmark: {formatCompact(stats?.benchmarks?.netProfitBenchmark || 0)} 
                  ({netProfitChange.isPositive ? '+' : '-'}{netProfitChange.value.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Margin Indicators */}
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

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue vs COGS vs Gross Profit Margin */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Revenue</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> COGS</span>
                  <span className="flex items-center gap-1 text-muted-foreground">— Gross Profit Margin</span>
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
                        name === 'grossProfitMargin' ? `${value.toFixed(2)}%` : formatCurrency(value, currency),
                        name === 'grossProfitMargin' ? 'Gross Profit Margin' : name
                      ]} />
                      <Bar yAxisId="left" dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="cogs" fill={COLORS.cogs} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="grossProfitMargin" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gross Profit vs OPEX vs Net Profit Margin */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Gross Profit</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> OPEX</span>
                  <span className="flex items-center gap-1 text-muted-foreground">— Net Profit Margin</span>
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
                        name === 'netProfitMargin' ? `${value.toFixed(2)}%` : formatCurrency(value, currency),
                        name === 'netProfitMargin' ? 'Net Profit Margin' : name
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

          {/* Total Assets & Liabilities */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Total Assets */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <span className="text-xl font-bold">{formatCurrency(stats?.totalAssets || 0, currency)}</span>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-3">Current Assets</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cash & Bank Bal</p>
                      <p className="font-medium">{formatCurrency(stats?.currentAssets?.cashBalance || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Receivables</p>
                      <p className="font-medium">{formatCurrency(stats?.currentAssets?.accountReceivables || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deposits, Adv. & Prepay...</p>
                      <p className="font-medium">{formatCurrency(stats?.currentAssets?.deposits || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Inventory</p>
                      <p className="font-medium">{formatCurrency(stats?.currentAssets?.inventory || 0, currency)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Liabilities */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                <span className="text-xl font-bold">{formatCurrency(stats?.totalLiabilities || 0, currency)}</span>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-3">Current Liabilities</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wages Payable</p>
                      <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.wagesPayable || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Payables</p>
                      <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.accountPayables || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-pink-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prov. & Accruals</p>
                      <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.provisions || 0, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Other Payable</p>
                      <p className="font-medium">{formatCurrency(stats?.currentLiabilities?.otherPayable || 0, currency)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 border-l bg-muted/10 p-4 space-y-4 overflow-auto">
          {/* Date Range */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Showing data for:</p>
            <div className="flex items-center gap-2">
              <select className="text-sm border rounded px-2 py-1 bg-background">
                <option>Last</option>
                <option>This</option>
              </select>
              <input type="number" defaultValue={2} className="w-12 text-sm border rounded px-2 py-1 bg-background" />
              <select className="text-sm border rounded px-2 py-1 bg-background">
                <option>Years</option>
                <option>Months</option>
                <option>Quarters</option>
              </select>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>1/1/2025 - 1/29/2026</span>
            </div>
          </div>

          {/* Income Statement */}
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
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Smart Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <p>
                Between January 2025 and January 2026, 
                <span className="text-emerald-600 font-medium"> Gross Profit Margin had the largest increase</span> 
                {stats?.grossProfitMargin ? ` (${stats.grossProfitMargin.toFixed(2)}%)` : ''} while COGS had the largest decrease.
              </p>
              <p>
                Gross Profit Margin started trending up on November 2025, 
                <span className="text-emerald-600 font-medium"> rising by 12.08% (0.04) in 3 months.</span>
              </p>
              <p>
                OPEX jumped from 983,328.71 to 1,340,955.37 during its steepest incline between August 2025 and January 2026.
              </p>
              <p>
                We found <span className="text-amber-600 font-medium">two anomalies</span>, a high for OPEX on December 2025 (2,395,911.48) and a low for Net Profit Margin on April 2025 (-0.95).
              </p>
              <p>
                Revenue experienced the <span className="text-blue-600 font-medium">longest period of growth (+626.54%)</span> between Friday, July 1, 2025 and Thursday, December 1, 2025.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
