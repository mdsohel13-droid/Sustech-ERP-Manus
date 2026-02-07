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
    <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
      <text x="2" y="26" fontSize="30" fontWeight="900" fill={NAVY} fontFamily="serif">$</text>
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
      <rect x="1" y="4" width="22" height="18" rx="3" stroke={NAVY} strokeWidth="2.2" fill="none"/>
      <path d="M5 4V3C5 1.9 5.9 1 7 1H19C20.1 1 21 1.9 21 3V4" stroke={NAVY} strokeWidth="2"/>
      <rect x="17" y="10" width="7" height="6" rx="1.5" stroke={NAVY} strokeWidth="1.8" fill="none"/>
      <circle cx="20.5" cy="13" r="1.2" fill={NAVY}/>
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="2" y="15" width="5" height="8" rx="1" fill={NAVY}/>
      <rect x="9" y="9" width="5" height="14" rx="1" fill={NAVY}/>
      <rect x="16" y="4" width="5" height="19" rx="1" fill={NAVY}/>
      <line x1="1" y1="24" x2="25" y2="24" stroke={NAVY} strokeWidth="2"/>
    </svg>
  );
}

function BanknoteIcon() {
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
      <rect x="1.5" y="1.5" width="27" height="19" rx="3" stroke={NAVY} strokeWidth="2" fill="none"/>
      <circle cx="15" cy="11" r="5" stroke={NAVY} strokeWidth="1.8" fill="none"/>
      <text x="12.5" y="15" fontSize="10" fontWeight="700" fill={NAVY}>$</text>
    </svg>
  );
}

function ReceivableIcon() {
  return (
    <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
      <rect x="1" y="3" width="19" height="15" rx="2" stroke={TEAL} strokeWidth="2" fill="none"/>
      <line x1="1" y1="8" x2="20" y2="8" stroke={TEAL} strokeWidth="1.5"/>
      <circle cx="22" cy="17" r="6.5" stroke={TEAL} strokeWidth="2" fill="none"/>
      <text x="19.5" y="20.5" fontSize="9" fontWeight="700" fill={TEAL}>$</text>
    </svg>
  );
}

function PayableIcon() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
      <rect x="1.5" y="1.5" width="25" height="19" rx="3" stroke={TEAL} strokeWidth="2" fill="none"/>
      <line x1="1.5" y1="7" x2="26.5" y2="7" stroke={TEAL} strokeWidth="2"/>
      <rect x="4" y="12" width="8" height="2.5" rx="1" fill={TEAL}/>
      <rect x="14" y="12" width="5" height="2.5" rx="1" fill={TEAL}/>
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M3 18A10 10 0 0 1 23 18" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <line x1="13" y1="18" x2="19" y2="10" stroke={DARK} strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="13" cy="18" r="2" fill={DARK}/>
      <line x1="3" y1="18" x2="5" y2="18" stroke={DARK} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="21" y1="18" x2="23" y2="18" stroke={DARK} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13" y1="8" x2="13" y2="10" stroke={DARK} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function StopwatchIcon() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
      <circle cx="12" cy="16" r="10" stroke={DARK} strokeWidth="2" fill="none"/>
      <line x1="12" y1="9" x2="12" y2="16" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="17" y2="13" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="2" x2="15" y2="2" stroke={DARK} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="12" y2="6" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="8" x2="22" y2="6" stroke={DARK} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function KpiCard({ icon, label, value, change, subtitle }: {
  icon: React.ReactNode; label: string; value: string; change?: string; subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 h-full flex flex-col justify-center">
      <div className="text-center">
        <p className="text-xs font-bold text-[#0d2137] mb-2">{label}</p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="flex-shrink-0">{icon}</div>
          <p className="text-lg font-extrabold text-[#0d2137]">{value}</p>
        </div>
        {change && (
          <p className="text-xs font-bold text-[#0d3b66]">{change}</p>
        )}
        <p className="text-[10px] text-[#0d2137] opacity-50 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function RatioCard({ icon, label, value, target, targetLabel }: {
  icon: React.ReactNode; label: string; value: string; target: string; targetLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 h-full flex flex-col justify-center">
      <div className="text-center">
        <p className="text-xs font-bold text-[#0d2137] mb-2">{label}</p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="flex-shrink-0">{icon}</div>
          <p className="text-lg font-extrabold text-[#0d2137]">{value}</p>
        </div>
        <p className="text-xs font-bold text-[#0d2137]">{target}</p>
        <p className="text-[10px] font-semibold text-[#0d2137] opacity-70 mt-0.5">{targetLabel}</p>
      </div>
    </div>
  );
}

function ProfitMarginDonut({ value, target }: { value: number; target: number }) {
  const size = 200;
  const maxScale = Math.max(target * 1.35, 16);
  const pct = Math.min(100, Math.max(0, (Math.abs(value) / maxScale) * 100));
  const r = size * 0.37;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#d0dff0" strokeWidth={size * 0.11} fill="none" />
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#0d3b66" strokeWidth={size * 0.11} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-[#0d2137] mb-0.5">Net Profit Margin %</p>
          <span className="text-3xl font-black text-[#0d3b66]">{value.toFixed(1)}%</span>
          <p className="text-[10px] text-[#0d2137] opacity-50 mt-1">Target {target.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

function BudgetDonut({ label, percentage, budget, balance, color }: {
  label: string; percentage: number; budget: number; balance: number; color: string;
}) {
  const size = 120;
  const pct = Math.min(100, Math.max(0, percentage));
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;

  const fmtNum = (n: number) => {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ');
    return n < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center h-full">
      <p className="text-sm font-extrabold text-[#0d2137] mb-2 underline decoration-1 underline-offset-2">{label}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#d0dff0" strokeWidth={size * 0.1} fill="none" />
          <circle cx={vb / 2} cy={vb / 2} r={r} stroke={color} strokeWidth={size * 0.1} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-[#0d2137]">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="w-full space-y-1 px-1 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#0d2137] opacity-60 font-semibold">Budget</span>
          <span className="font-bold text-[#0d2137]">{fmtNum(budget)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#0d2137] opacity-60 font-semibold">Balance</span>
          <span className="font-bold text-[#0d2137]">{fmtNum(balance)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({ stats, monthlyTrend, budgetVariance, formatCompact }: OverviewTabProps) {
  const totalIncome = stats?.revenue || 0;
  const totalExpenses = (stats?.cogs || 0) + (stats?.opex || 0);
  const netProfit = stats?.netProfit || 0;
  const netProfitMarginVal = stats?.netProfitMargin || 0;
  const cashAtEnd = stats?.currentAssets?.cashBalance || 0;
  const totalAR = stats?.currentAssets?.accountReceivables || 0;
  const totalAP = stats?.currentLiabilities?.accountPayables || 0;

  const currentAssets = (stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0) + (stats?.currentAssets?.deposits || 0) + (stats?.currentAssets?.inventory || 0);
  const currentLiabilities = (stats?.currentLiabilities?.wagesPayable || 0) + (stats?.currentLiabilities?.accountPayables || 0) + (stats?.currentLiabilities?.provisions || 0) + (stats?.currentLiabilities?.otherPayable || 0);
  const quickAssets = (stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0);
  const quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : 0;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;

  const prevMonth = monthlyTrend.length >= 2 ? monthlyTrend[monthlyTrend.length - 2] as any : null;
  const prevMonthRevenue = prevMonth?.revenue || 0;
  const prevMonthExpense = (prevMonth?.cogs || 0) + (prevMonth?.opex || 0);
  const prevMonthNetProfit = prevMonth?.netProfit || 0;
  const prevMonthCash = prevMonth?.cashBalance || 0;
  const prevMonthAR = prevMonth?.accountReceivables || 0;
  const prevMonthAP = prevMonth?.accountPayables || 0;

  const calcChange = (current: number, previous: number) =>
    previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;

  const incomeChange = calcChange(totalIncome, prevMonthRevenue);
  const expenseChange = calcChange(totalExpenses, prevMonthExpense);
  const netProfitChange = calcChange(netProfit, prevMonthNetProfit);
  const cashChange = calcChange(cashAtEnd, prevMonthCash);
  const arChange = calcChange(totalAR, prevMonthAR);
  const apChange = calcChange(totalAP, prevMonthAP);

  const budgetItems = budgetVariance?.items || [];
  const budgetIncomeTotal = budgetItems.reduce((s: number, b: any) => b.type === 'income' ? s + parseFloat(b.budgetAmount || '0') : s, 0);
  const budgetExpenseTotal = budgetItems.reduce((s: number, b: any) => b.type === 'expenditure' ? s + parseFloat(b.budgetAmount || '0') : s, 0);

  const incomeBudgetPct = budgetIncomeTotal > 0 ? Math.min(100, (totalIncome / budgetIncomeTotal) * 100) : 0;
  const expenseBudgetPct = budgetExpenseTotal > 0 ? Math.min(100, (totalExpenses / budgetExpenseTotal) * 100) : 0;

  const incomeBudgetBalance = totalIncome - budgetIncomeTotal;
  const expenseBudgetBalance = totalExpenses - budgetExpenseTotal;

  const fmtNum = (n: number) => {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ');
    return n < 0 ? `-${formatted}` : formatted;
  };

  const fmtPct = (v: number) => `${v.toFixed(1)}%`;

  return (
    <div className="bg-[#e8ecf1] p-5 rounded-2xl min-h-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-[#0d2137] tracking-tight uppercase" style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}>Financial Dashboard</h1>
      </div>

      <div className="grid grid-cols-10 gap-3 mb-4">
        <div className="col-span-2 grid grid-rows-2 gap-3">
          <KpiCard icon={<DollarIcon />} label="Total Income" value={fmtNum(totalIncome)} change={fmtPct(incomeChange)} subtitle="vs previous month" />
          <KpiCard icon={<BarChartIcon />} label="Net Profit" value={fmtNum(netProfit)} change={fmtPct(netProfitChange)} subtitle="vs previous month" />
        </div>

        <div className="col-span-2 grid grid-rows-2 gap-3">
          <KpiCard icon={<WalletIcon />} label="Total Expenses" value={fmtNum(totalExpenses)} change={fmtPct(expenseChange)} subtitle="vs previous month" />
          <KpiCard icon={<BanknoteIcon />} label="Cash at end of month" value={fmtNum(cashAtEnd)} change={fmtPct(cashChange)} subtitle="vs previous month" />
        </div>

        <div className="col-span-2 flex items-center justify-center">
          <ProfitMarginDonut value={netProfitMarginVal} target={12.0} />
        </div>

        <div className="col-span-2 grid grid-rows-2 gap-3">
          <KpiCard icon={<ReceivableIcon />} label="Accounts Receivable" value={fmtNum(totalAR)} change={fmtPct(arChange)} subtitle="vs previous month" />
          <RatioCard icon={<GaugeIcon />} label="Quick Ratio" value={quickRatio.toFixed(2)} target="1 or higher" targetLabel="Quick Ratio Target" />
        </div>

        <div className="col-span-2 grid grid-rows-2 gap-3">
          <KpiCard icon={<PayableIcon />} label="Accounts Payable" value={fmtNum(totalAP)} change={fmtPct(apChange)} subtitle="vs previous month" />
          <RatioCard icon={<StopwatchIcon />} label="Current Ratio" value={currentRatio.toFixed(2)} target="3 or higher" targetLabel="Current Ratio Target" />
        </div>
      </div>

      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-6 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-base font-extrabold text-[#0d2137] text-center mb-2">Income and Expenses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} barGap={0} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#0d2137' }} />
                <YAxis tick={{ fontSize: 8, fill: '#0d2137' }} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [fmtNum(value), name === 'revenue' ? 'Total Income' : name === 'cogs' ? 'Total Expenses' : 'Net Profit']} />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4, color: '#0d2137' }} formatter={(v) => v === 'revenue' ? 'Total Income' : v === 'cogs' ? 'Total Expenses' : 'Net Profit'} />
                <Bar dataKey="revenue" fill="#0d3b66" radius={[2, 2, 0, 0]} name="revenue" />
                <Bar dataKey="cogs" fill="#5fa8d3" radius={[2, 2, 0, 0]} name="cogs" />
                <Line type="monotone" dataKey="netProfit" stroke="#94a3b8" strokeWidth={2} dot={{ r: 2, fill: '#94a3b8' }} name="netProfit" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2">
          <BudgetDonut
            label="% of income Budget"
            percentage={incomeBudgetPct}
            budget={budgetIncomeTotal}
            balance={incomeBudgetBalance}
            color="#0d3b66"
          />
        </div>
        <div className="col-span-2">
          <BudgetDonut
            label="% of Expenses Budget"
            percentage={expenseBudgetPct}
            budget={budgetExpenseTotal}
            balance={expenseBudgetBalance}
            color="#0d3b66"
          />
        </div>
      </div>
    </div>
  );
}
