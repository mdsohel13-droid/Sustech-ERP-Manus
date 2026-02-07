import {
  CircleDollarSign, Target, FileText, Users, ShoppingCart, Package, Briefcase, TrendingUp,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Receipt, BarChart3, PieChart,
} from "lucide-react";
import { useLocation } from "wouter";

interface TopDashboardProps {
  totalRevenue: string;
  totalSales: string;
  totalExpense: string;
  netProfit: string;
  projectsTotal: number;
  projectsRunning: number;
  projectsCompleted: number;
  tendersTotal: number;
  tendersWon: number;
  tendersPipeline: string;
  tendersWonValue: string;
  totalLeads: number;
  crmQualified: number;
  crmClosedWon: number;
  totalEmployees: number;
  totalStock: number;
  lowStockCount: number;
  outOfStock: number;
  stockValue: string;
  transactionCount: number;
  invoiceCount: number;
  pendingActions: number;
  overdueActions: number;
  pendingApprovals: number;
  totalAR: string;
  totalAP: string;
}

export default function TopDashboard(props: TopDashboardProps) {
  const [, navigate] = useLocation();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628] p-4 lg:p-5 shadow-xl border border-blue-900/30">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <MetricTile
          icon={CircleDollarSign} label="Revenue" value={props.totalRevenue}
          sub="Total Income" trend="+18%" trendUp
          gradient="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-400"
          borderColor="border-emerald-500/30" onClick={() => navigate("/financial")}
        />
        <MetricTile
          icon={ShoppingCart} label="Sales" value={props.totalSales}
          sub="This Period" trend="+23%" trendUp
          gradient="from-blue-500/20 to-blue-600/10" iconColor="text-blue-400"
          borderColor="border-blue-500/30" onClick={() => navigate("/sales")}
        />
        <MetricTile
          icon={Target} label="Projects" value={props.projectsTotal.toString()}
          sub={`${props.projectsRunning} running · ${props.projectsCompleted} done`}
          gradient="from-violet-500/20 to-purple-600/10" iconColor="text-violet-400"
          borderColor="border-violet-500/30" onClick={() => navigate("/projects")}
        />
        <MetricTile
          icon={FileText} label="Quotations" value={props.tendersTotal.toString()}
          sub={`${props.tendersWon} won`} trend={props.tendersWonValue} trendUp
          gradient="from-amber-500/20 to-amber-600/10" iconColor="text-amber-400"
          borderColor="border-amber-500/30" onClick={() => navigate("/tender-quotation")}
        />
        <MetricTile
          icon={Users} label="CRM Leads" value={props.totalLeads.toString()}
          sub={`${props.crmQualified} qualified · ${props.crmClosedWon} won`}
          gradient="from-rose-500/20 to-pink-600/10" iconColor="text-rose-400"
          borderColor="border-rose-500/30" onClick={() => navigate("/crm")}
        />
        <MetricTile
          icon={Briefcase} label="Team" value={props.totalEmployees.toString()}
          sub="Employees" trend="Active" trendUp
          gradient="from-cyan-500/20 to-cyan-600/10" iconColor="text-cyan-400"
          borderColor="border-cyan-500/30" onClick={() => navigate("/hr")}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <SmallStat icon={TrendingUp} label="Net Profit" value={props.netProfit} color="text-emerald-400" bg="bg-emerald-500/10" />
        <SmallStat icon={ArrowDownRight} label="Expenses" value={props.totalExpense} color="text-red-400" bg="bg-red-500/10" />
        <SmallStat icon={Receipt} label="AR" value={props.totalAR} color="text-blue-400" bg="bg-blue-500/10" />
        <SmallStat icon={Receipt} label="AP" value={props.totalAP} color="text-amber-400" bg="bg-amber-500/10" />
        <SmallStat icon={Package} label="Stock" value={`${props.totalStock.toLocaleString()}`} color="text-teal-400" bg="bg-teal-500/10"
          alert={props.lowStockCount > 0 ? `${props.lowStockCount} low` : undefined} />
        <SmallStat icon={AlertTriangle} label="Actions" value={props.pendingActions.toString()} color="text-orange-400" bg="bg-orange-500/10"
          alert={props.overdueActions > 0 ? `${props.overdueActions} overdue` : undefined} />
        <SmallStat icon={BarChart3} label="Transactions" value={props.transactionCount.toString()} color="text-indigo-400" bg="bg-indigo-500/10" />
        <SmallStat icon={PieChart} label="Invoices" value={props.invoiceCount.toString()} color="text-purple-400" bg="bg-purple-500/10" />
      </div>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, sub, trend, trendUp, gradient, iconColor, borderColor, onClick }: {
  icon: any; label: string; value: string; sub: string; trend?: string; trendUp?: boolean;
  gradient: string; iconColor: string; borderColor: string; onClick: () => void;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-xl p-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {trend && (
          <span className={`text-[10px] font-medium flex items-center gap-0.5 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-white leading-tight truncate">{value}</p>
      <p className="text-[10px] text-blue-200/60 mt-1 leading-tight">{sub}</p>
      <p className="text-[9px] text-blue-300/40 mt-0.5 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SmallStat({ icon: Icon, label, value, color, bg, alert }: {
  icon: any; label: string; value: string; color: string; bg: string; alert?: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-2.5 border border-white/5`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`h-3 w-3 ${color}`} />
        <span className="text-[10px] text-blue-200/50 font-medium">{label}</span>
      </div>
      <p className="text-sm font-bold text-white">{value}</p>
      {alert && (
        <span className="text-[9px] text-orange-400 font-medium">{alert}</span>
      )}
    </div>
  );
}
