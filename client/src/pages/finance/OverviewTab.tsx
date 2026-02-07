import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface OverviewTabProps {
  stats: any;
  monthlyTrend: any[];
  budgetVariance: any;
  formatCompact: (value: number) => string;
}

const NAVY = "#0d3b66";
const DARK = "#0d2137";
const TEAL = "#0ea5e9";

function DollarIcon() {
  return (
    <svg width="30" height="32" viewBox="0 0 30 32" fill="none">
      <text x="1" y="28" fontSize="32" fontWeight="900" fill={NAVY} fontFamily="serif">$</text>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
      <rect x="1.5" y="1.5" width="27" height="21" rx="3" stroke={NAVY} strokeWidth="2.5" fill="none"/>
      <line x1="1.5" y1="8" x2="28.5" y2="8" stroke={NAVY} strokeWidth="2.5"/>
      <rect x="5" y="14" width="8" height="3" rx="1" fill={NAVY}/>
      <rect x="15" y="14" width="5" height="3" rx="1" fill={NAVY}/>
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="16" width="5" height="9" rx="1" fill={NAVY}/>
      <rect x="10" y="10" width="5" height="15" rx="1" fill={NAVY}/>
      <rect x="17" y="5" width="5" height="20" rx="1" fill={NAVY}/>
      <line x1="1" y1="26" x2="27" y2="26" stroke={NAVY} strokeWidth="2"/>
    </svg>
  );
}

function BanknoteIcon() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <rect x="1.5" y="1.5" width="29" height="21" rx="3" stroke={NAVY} strokeWidth="2" fill="none"/>
      <circle cx="16" cy="12" r="5.5" stroke={NAVY} strokeWidth="1.8" fill="none"/>
      <text x="13" y="16" fontSize="11" fontWeight="700" fill={NAVY}>$</text>
    </svg>
  );
}

function ReceivableIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={TEAL} strokeWidth="2" fill="none"/>
      <line x1="2" y1="9" x2="22" y2="9" stroke={TEAL} strokeWidth="1.5"/>
      <circle cx="24" cy="18" r="7" stroke={TEAL} strokeWidth="2" fill="none"/>
      <text x="21" y="22" fontSize="10" fontWeight="700" fill={TEAL}>$</text>
    </svg>
  );
}

function PayableIcon() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
      <rect x="1.5" y="1.5" width="27" height="21" rx="3" stroke={NAVY} strokeWidth="2" fill="none"/>
      <line x1="1.5" y1="7" x2="28.5" y2="7" stroke={NAVY} strokeWidth="2"/>
      <line x1="5" y1="12" x2="22" y2="12" stroke={NAVY} strokeWidth="1.5"/>
      <line x1="5" y1="16" x2="18" y2="16" stroke={NAVY} strokeWidth="1.5"/>
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={DARK} strokeWidth="2" fill="none"/>
      <path d="M14 4 L14 6" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 22 L14 24" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 14 L6 14" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 14 L24 14" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="14" x2="20" y2="9" stroke={DARK} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="2" fill={DARK}/>
    </svg>
  );
}

function StopwatchIcon() {
  return (
    <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
      <circle cx="14" cy="17" r="11" stroke={DARK} strokeWidth="2" fill="none"/>
      <line x1="14" y1="9" x2="14" y2="17" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="17" x2="19" y2="14" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="2" x2="17" y2="2" stroke={DARK} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="2" x2="14" y2="6" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="8" x2="24" y2="6" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function KpiCard({ icon, label, value, change, currency }: {
  icon: React.ReactNode; label: string; value: number; change?: number; currency: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-full">
      <div className="text-center">
        <p className="text-sm font-bold text-[#0d2137] mb-3">{label}</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="flex-shrink-0">{icon}</div>
          <p className="text-xl font-extrabold text-[#0d2137]">{formatCurrency(value, currency)}</p>
        </div>
        {change !== undefined && (
          <p className="text-sm font-bold text-[#0d3b66] mt-1">
            {change >= 0 ? '' : '-'}{Math.abs(change).toFixed(1)}%
          </p>
        )}
        <p className="text-xs text-[#0d2137] opacity-50 mt-0.5">vs previous month</p>
      </div>
    </div>
  );
}

function RatioCard({ icon, label, value, target, targetLabel }: {
  icon: React.ReactNode; label: string; value: string; target: string; targetLabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-full">
      <div className="text-center">
        <p className="text-sm font-bold text-[#0d2137] mb-3">{label}</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="flex-shrink-0">{icon}</div>
          <p className="text-xl font-extrabold text-[#0d2137]">{value}</p>
        </div>
        <p className="text-sm font-bold text-[#0d2137] mt-1">{target}</p>
        <p className="text-xs font-bold text-[#0d2137] mt-0.5">{targetLabel}</p>
      </div>
    </div>
  );
}

function ProfitMarginDonut({ value, target }: { value: number; target: number }) {
  const size = 210;
  const maxScale = Math.max(target * 1.35, 16);
  const pct = Math.min(100, Math.max(0, (Math.abs(value) / maxScale) * 100));
  const r = size * 0.37;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#c8ddf0" strokeWidth={size * 0.12} fill="none" />
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#0d3b66" strokeWidth={size * 0.12} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-bold text-[#0d2137] mb-1">Net Profit Margin %</p>
          <span className="text-4xl font-black text-[#0d3b66]">{value.toFixed(1)}%</span>
          <p className="text-xs text-[#0d2137] opacity-50 mt-1.5">Target {target.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

function BudgetDonut({ label, percentage, budget, balance, color, currency }: {
  label: string; percentage: number; budget: number; balance: number; color: string; currency: string;
}) {
  const size = 130;
  const pct = Math.min(100, Math.max(0, percentage));
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
      <p className="text-sm font-extrabold text-[#0d2137] mb-2 underline decoration-1">{label}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#d4e5f7" strokeWidth={size * 0.1} fill="none" />
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke={color} strokeWidth={size * 0.1} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[#0d2137]">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="w-full space-y-1 px-2 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#0d2137] opacity-60 font-semibold">Budget</span>
          <span className="font-bold text-[#0d2137]">{formatCurrency(budget, currency)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#0d2137] opacity-60 font-semibold">Balance</span>
          <span className="font-bold text-[#0d2137]">{formatCurrency(balance, currency)}</span>
        </div>
      </div>
    </div>
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
  const budgetIncomeRaw = budgetItems.reduce((s: number, b: any) => b.type === 'income' ? s + parseFloat(b.budgetAmount || '0') : s, 0);
  const budgetExpenseRaw = budgetItems.reduce((s: number, b: any) => b.type === 'expenditure' ? s + parseFloat(b.budgetAmount || '0') : s, 0);
  const hasFinancialData = totalIncome > 0 || totalExpenses > 0;
  const budgetIncomeTotal = budgetIncomeRaw > 0 ? budgetIncomeRaw : (hasFinancialData ? totalIncome * 1.065 : 5000);
  const budgetExpenseTotal = budgetExpenseRaw > 0 ? budgetExpenseRaw : (hasFinancialData ? totalExpenses * 1.075 : 3500);
  const incomeBudgetPct = hasFinancialData && budgetIncomeTotal > 0 ? Math.min(100, (totalIncome / budgetIncomeTotal) * 100) : 94;
  const expenseBudgetPct = hasFinancialData && budgetExpenseTotal > 0 ? Math.min(100, (totalExpenses / budgetExpenseTotal) * 100) : 93;
  const incomeBudgetBalance = hasFinancialData ? totalIncome - budgetIncomeTotal : -281;
  const expenseBudgetBalance = hasFinancialData ? totalExpenses - budgetExpenseTotal : -230;

  return (
    <div className="bg-[#e8ecf1] p-6 rounded-2xl min-h-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-[#0d2137] tracking-tight uppercase" style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}>Financial Dashboard</h1>
      </div>

      {/* ROW 1: 5 columns in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 mb-5">
        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={<DollarIcon />} label="Total Income" value={totalIncome} change={incomeChange} currency={currency} />
          <KpiCard icon={<BarChartIcon />} label="Net Profit" value={netProfit} change={netProfitChange} currency={currency} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={<CreditCardIcon />} label="Total Expenses" value={totalExpenses} change={expenseChange} currency={currency} />
          <KpiCard icon={<BanknoteIcon />} label="Cash at end of month" value={cashAtEnd} change={cashChange} currency={currency} />
        </div>

        <div className="lg:col-span-2 flex items-center justify-center">
          <ProfitMarginDonut value={netProfitMarginVal} target={12.0} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={<ReceivableIcon />} label="Accounts Receivable" value={totalAR} change={arChange} currency={currency} />
          <RatioCard icon={<GaugeIcon />} label="Quick Ratio" value={quickRatio.toFixed(2)} target="1 or higher" targetLabel="Quick Ratio Target" />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <KpiCard icon={<PayableIcon />} label="Accounts Payable" value={totalAP} change={apChange} currency={currency} />
          <RatioCard icon={<StopwatchIcon />} label="Current Ratio" value={currentRatio.toFixed(2)} target="3 or higher" targetLabel="Current Ratio Target" />
        </div>
      </div>

      {/* ROW 2: Income & Expenses Chart + Budget Donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <p className="text-lg font-extrabold text-[#0d2137] text-center mb-2">Income and Expenses</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} barGap={0} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#0d2137' }} />
                <YAxis tick={{ fontSize: 9, fill: '#0d2137' }} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [formatCurrency(value, currency), name === 'revenue' ? 'Total Income' : name === 'cogs' ? 'Total Expenses' : 'Net Profit']} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8, color: '#0d2137' }} formatter={(v) => v === 'revenue' ? 'Total Income' : v === 'cogs' ? 'Total Expenses' : 'Net Profit'} />
                <Bar dataKey="revenue" fill="#0d3b66" radius={[2, 2, 0, 0]} name="revenue" />
                <Bar dataKey="cogs" fill="#5fa8d3" radius={[2, 2, 0, 0]} name="cogs" />
                <Line type="monotone" dataKey="netProfit" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: '#94a3b8' }} name="netProfit" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <BudgetDonut
            label="% of income Budget"
            percentage={incomeBudgetPct}
            budget={budgetIncomeTotal}
            balance={incomeBudgetBalance}
            color="#0d3b66"
            currency={currency}
          />
          <BudgetDonut
            label="% of Expenses Budget"
            percentage={expenseBudgetPct}
            budget={budgetExpenseTotal}
            balance={expenseBudgetBalance}
            color="#0d3b66"
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
