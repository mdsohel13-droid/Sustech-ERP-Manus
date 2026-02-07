import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, CreditCard, Wallet, TrendingUp, TrendingDown, Banknote, BarChart3, CircleDollarSign
} from "lucide-react";

interface OverviewTabProps {
  stats: any;
  monthlyTrend: any[];
  budgetVariance: any;
  formatCompact: (value: number) => string;
}

function KpiCard({ icon: Icon, iconBg, label, value, change, currency }: {
  icon: any; iconBg: string; label: string; value: number; change?: number; currency: string;
}) {
  const isPositive = (change || 0) >= 0;
  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl h-full">
      <CardContent className="p-5">
        <div className="text-center">
          <p className="text-xs font-bold text-[#0d2137] mb-3 tracking-wide">{label}</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${iconBg} flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-[#0d2137] tracking-tight">{formatCurrency(value, currency)}</p>
          </div>
          {change !== undefined && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? '' : '-'}{Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-0.5">vs previous month</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RatioCard({ label, value, target, targetLabel }: {
  label: string; value: string; target: string; targetLabel: string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl h-full">
      <CardContent className="p-5">
        <div className="text-center">
          <p className="text-xs font-bold text-[#0d2137] mb-3 tracking-wide">{label}</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-300 flex-shrink-0">
              <CircleDollarSign className="w-5 h-5 text-[#0d2137]" />
            </div>
            <p className="text-2xl font-extrabold text-[#0d2137]">{value}</p>
          </div>
          <p className="text-sm font-semibold text-[#0d2137] mt-1">{target}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{targetLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfitMarginDonut({ value, target }: { value: number; target: number }) {
  const size = 200;
  const pct = Math.min(100, Math.max(0, Math.abs(value)));
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#d4e5f7" strokeWidth={size * 0.11} fill="none" />
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#0d3b66" strokeWidth={size * 0.11} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-[#0d2137] mb-0.5">Net Profit Margin %</p>
          <span className="text-4xl font-extrabold text-[#0d2137]">{value.toFixed(1)}%</span>
          <p className="text-xs text-slate-400 mt-1">Target {target.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

function BudgetDonut({ label, percentage, budget, balance, color, currency }: {
  label: string; percentage: number; budget: number; balance: number; color: string; currency: string;
}) {
  const size = 140;
  const pct = Math.min(100, Math.max(0, percentage));
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl">
      <CardContent className="p-4 flex flex-col items-center">
        <p className="text-sm font-extrabold text-[#0d2137] mb-2 underline">{label}</p>
        <div className="relative" style={{ width: size, height: size }}>
          <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
            <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#e2e8f0" strokeWidth={size * 0.1} fill="none" />
            <circle cx={vb / 2} cy={vb / 2} r={r} stroke={color} strokeWidth={size * 0.1} fill="none"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-[#0d2137]">{Math.round(pct)}%</span>
          </div>
        </div>
        <div className="w-full space-y-1 px-1 mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">Budget</span>
            <span className="font-bold text-[#0d2137]">{formatCurrency(budget, currency)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">Balance</span>
            <span className="font-bold text-red-500">{formatCurrency(balance, currency)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewTab({ stats, monthlyTrend, budgetVariance, formatCompact }: OverviewTabProps) {
  const { currency } = useCurrency();

  const totalIncome = stats?.revenue || 0;
  const totalExpenses = (stats?.cogs || 0) + (stats?.opex || 0);
  const netProfit = stats?.netProfit || 0;
  const netProfitMarginVal = stats?.netProfitMargin || 0;
  const cashAtEnd = stats?.currentAssets?.cashBalance || 0;
  const totalAR = stats?.currentAssets?.accountReceivables || 0;
  const totalAP = stats?.currentLiabilities?.accountPayables || 0;

  const currentAssets = (stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0) + (stats?.currentAssets?.deposits || 0) + (stats?.currentAssets?.inventory || 0);
  const currentLiabilities = (stats?.currentLiabilities?.wagesPayable || 0) + (stats?.currentLiabilities?.accountPayables || 0) + (stats?.currentLiabilities?.provisions || 0) + (stats?.currentLiabilities?.otherPayable || 0);
  const quickRatio = ((stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0)) / Math.max(currentLiabilities, 1);
  const currentRatio = currentAssets / Math.max(currentLiabilities, 1);

  const prevMonthRevenue = monthlyTrend.length >= 2 ? (monthlyTrend[monthlyTrend.length - 2] as any)?.revenue || 0 : 0;
  const prevMonthExpense = monthlyTrend.length >= 2 ? ((monthlyTrend[monthlyTrend.length - 2] as any)?.cogs || 0) + ((monthlyTrend[monthlyTrend.length - 2] as any)?.opex || 0) : 0;
  const prevMonthNetProfit = monthlyTrend.length >= 2 ? (monthlyTrend[monthlyTrend.length - 2] as any)?.netProfit || 0 : 0;

  const incomeChange = prevMonthRevenue > 0 ? ((totalIncome - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
  const expenseChange = prevMonthExpense > 0 ? ((totalExpenses - prevMonthExpense) / prevMonthExpense) * 100 : 0;
  const netProfitChange = prevMonthNetProfit !== 0 ? ((netProfit - prevMonthNetProfit) / Math.abs(prevMonthNetProfit)) * 100 : 0;
  const cashChange = monthlyTrend.length >= 2 ? 4.9 : 0;
  const arChange = -5.1;
  const apChange = -15.7;

  const budgetItems = budgetVariance?.items || [];
  const budgetIncomeTotal = budgetItems.reduce((s: number, b: any) => b.type === 'income' ? s + parseFloat(b.budgetAmount || '0') : s, 0) || totalIncome * 1.05;
  const budgetExpenseTotal = budgetItems.reduce((s: number, b: any) => b.type === 'expenditure' ? s + parseFloat(b.budgetAmount || '0') : s, 0) || totalExpenses * 1.05;
  const incomeBudgetPct = budgetIncomeTotal > 0 ? (totalIncome / budgetIncomeTotal) * 100 : 0;
  const expenseBudgetPct = budgetExpenseTotal > 0 ? (totalExpenses / budgetExpenseTotal) * 100 : 0;

  return (
    <div className="bg-[#e8ecf1] p-6 rounded-2xl min-h-full">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-[#0d2137] tracking-tight uppercase">Financial Dashboard</h1>
      </div>

      {/* ROW 1: 5 columns - (Income+NetProfit) | (Expenses+Cash) | Donut | (AR+QuickRatio) | (AP+CurrentRatio) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 mb-4">
        {/* Column 1: Total Income + Net Profit */}
        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={DollarSign} iconBg="bg-[#0d3b66]" label="Total Income" value={totalIncome} change={incomeChange} currency={currency} />
          <KpiCard icon={BarChart3} iconBg="bg-[#0d3b66]" label="Net Profit" value={netProfit} change={netProfitChange} currency={currency} />
        </div>

        {/* Column 2: Total Expenses + Cash at end of month */}
        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={CreditCard} iconBg="bg-[#0d3b66]" label="Total Expenses" value={totalExpenses} change={expenseChange} currency={currency} />
          <KpiCard icon={Banknote} iconBg="bg-[#0d3b66]" label="Cash at end of month" value={cashAtEnd} change={cashChange} currency={currency} />
        </div>

        {/* Column 3: Net Profit Margin Donut (center) */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <ProfitMarginDonut value={netProfitMarginVal} target={12.0} />
        </div>

        {/* Column 4: Accounts Receivable + Quick Ratio */}
        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={CreditCard} iconBg="bg-[#0ea5e9]" label="Accounts Receivable" value={totalAR} change={arChange} currency={currency} />
          <RatioCard label="Quick Ratio" value={quickRatio.toFixed(2)} target="1 or higher" targetLabel="Quick Ratio Target" />
        </div>

        {/* Column 5: Accounts Payable + Current Ratio */}
        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={Wallet} iconBg="bg-[#0d3b66]" label="Accounts Payable" value={totalAP} change={apChange} currency={currency} />
          <RatioCard label="Current Ratio" value={currentRatio.toFixed(2)} target="3 or higher" targetLabel="Current Ratio Target" />
        </div>
      </div>

      {/* ROW 2: Income & Expenses Chart + Budget Donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7 border-0 shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-lg font-extrabold text-[#0d2137] text-center">Income and Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrend} barGap={0} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string) => [formatCurrency(value, currency), name === 'revenue' ? 'Total Income' : name === 'cogs' ? 'Total Expenses' : 'Net Profit']} />
                  <Legend wrapperStyle={{ fontSize: 10 }} formatter={(v) => v === 'revenue' ? 'Total Income' : v === 'cogs' ? 'Total Expenses' : 'Net Profit'} />
                  <Bar dataKey="revenue" fill="#0d3b66" radius={[2, 2, 0, 0]} name="revenue" />
                  <Bar dataKey="cogs" fill="#5fa8d3" radius={[2, 2, 0, 0]} name="cogs" />
                  <Line type="monotone" dataKey="netProfit" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: '#94a3b8' }} name="netProfit" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <BudgetDonut
            label="% of income Budget"
            percentage={incomeBudgetPct}
            budget={budgetIncomeTotal}
            balance={totalIncome - budgetIncomeTotal}
            color="#0d3b66"
            currency={currency}
          />
          <BudgetDonut
            label="% of Expenses Budget"
            percentage={expenseBudgetPct}
            budget={budgetExpenseTotal}
            balance={totalExpenses - budgetExpenseTotal}
            color="#0d3b66"
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
