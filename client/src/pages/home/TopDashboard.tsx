import { useLocation } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

interface TopDashboardProps {
  totalRevenue: string;
  totalRevenueNum: number;
  totalSales: string;
  totalSalesNum: number;
  totalExpense: string;
  totalExpenseNum: number;
  netProfit: string;
  netProfitNum: number;
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
  stockValueNum: number;
  transactionCount: number;
  invoiceCount: number;
  pendingActions: number;
  overdueActions: number;
  pendingApprovals: number;
  totalAR: string;
  totalARNum: number;
  totalAP: string;
  totalAPNum: number;
  formatCurrency: (v: number) => string;
}

const formatCompact = (v: number) => {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
};

function GaugeMini({ value, maxValue, label, centerText, color, size = 90, isDark }: {
  value: number; maxValue: number; label: string; centerText: string; color: string; size?: number; isDark: boolean;
}) {
  const pct = maxValue > 0 ? Math.min(100, Math.abs(value / maxValue) * 100) : 0;
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb/2} cy={vb/2} r={r} stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} strokeWidth={size * 0.08} fill="none" />
          <circle cx={vb/2} cy={vb/2} r={r} stroke={color} strokeWidth={size * 0.08} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-foreground" style={{ fontSize: size * 0.17 }}>{centerText}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-center font-medium">{label}</p>
    </div>
  );
}

export default function TopDashboard(props: TopDashboardProps) {
  const [, navigate] = useLocation();
  const fc = props.formatCurrency;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tickFill = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const tickFillStrong = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const labelFill = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  const labelLineStroke = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
  const tooltipBg = isDark ? '#2a2333' : '#ffffff';
  const tooltipBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
  const tooltipColor = isDark ? '#fff' : '#1e293b';

  const finBarData = [
    { name: 'Revenue', value: props.totalRevenueNum },
    { name: 'Sales', value: props.totalSalesNum },
    { name: 'Expenses', value: props.totalExpenseNum },
    { name: 'Net Profit', value: Math.max(props.netProfitNum, 0) },
  ];
  const finBarColors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'];

  const projectPieData = [
    { name: 'Running', value: props.projectsRunning },
    { name: 'Completed', value: props.projectsCompleted },
    { name: 'Other', value: Math.max(0, props.projectsTotal - props.projectsRunning - props.projectsCompleted) },
  ].filter(d => d.value > 0);
  const projectColors = ['#3b82f6', '#10b981', '#64748b'];

  const arApBarData = [
    { name: 'AR', value: props.totalARNum, fill: '#0ea5e9' },
    { name: 'AP', value: props.totalAPNum, fill: '#f97316' },
  ];

  const inventoryPieData = [
    { name: 'In Stock', value: Math.max(0, props.totalStock - props.lowStockCount - props.outOfStock) },
    { name: 'Low Stock', value: props.lowStockCount },
    { name: 'Out of Stock', value: props.outOfStock },
  ].filter(d => d.value > 0);
  const inventoryColors = ['#10b981', '#f59e0b', '#ef4444'];

  const profitMargin = props.totalRevenueNum > 0 ? (props.netProfitNum / props.totalRevenueNum * 100) : 0;
  const tenderWinRate = props.tendersTotal > 0 ? Math.round((props.tendersWon / props.tendersTotal) * 100) : 0;
  const crmConversion = props.totalLeads > 0 ? Math.round((props.crmClosedWon / props.totalLeads) * 100) : 0;

  return (
    <div className="rounded-2xl bg-card p-4 lg:p-5 shadow-xl border border-border">

      {/* ROW 1: Financial Horizontal Bar + Key Ratio Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">

        {/* Financial Breakdown - Horizontal Bar */}
        <div className="lg:col-span-5 bg-muted/50 rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Financial Overview</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finBarData} layout="vertical" barSize={18} margin={{ right: 45 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={{ fontSize: 9, fill: tickFill }} tickFormatter={formatCompact} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: tickFillStrong, fontWeight: 600 }} width={68} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, background: tooltipBg, border: tooltipBorder, color: tooltipColor }}
                  formatter={(value: number) => [fc(value), 'Amount']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {finBarData.map((_, i) => <Cell key={i} fill={finBarColors[i]} />)}
                  <LabelList dataKey="value" position="right" formatter={formatCompact} style={{ fontSize: 10, fill: labelFill, fontWeight: 600 }} offset={5} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Ratio Gauges */}
        <div className="lg:col-span-7 bg-muted/50 rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Key Indicators</p>
          <div className="flex items-center justify-around flex-wrap gap-1">
            <GaugeMini isDark={isDark} value={profitMargin} maxValue={100} label="Profit Margin" centerText={`${profitMargin.toFixed(1)}%`} color="#10b981" size={88} />
            <GaugeMini isDark={isDark} value={tenderWinRate} maxValue={100} label="Tender Win Rate" centerText={`${tenderWinRate}%`} color="#f59e0b" size={88} />
            <GaugeMini isDark={isDark} value={crmConversion} maxValue={100} label="CRM Conversion" centerText={`${crmConversion}%`} color="#0ea5e9" size={88} />
            <GaugeMini isDark={isDark} value={props.pendingApprovals} maxValue={Math.max(props.pendingApprovals + 5, 10)} label="Approvals" centerText={`${props.pendingApprovals}`} color="#8b5cf6" size={88} />
            <GaugeMini isDark={isDark} value={props.overdueActions} maxValue={Math.max(props.pendingActions, props.overdueActions + 3, 5)} label="Overdue Tasks" centerText={`${props.overdueActions}`} color={props.overdueActions > 0 ? '#ef4444' : '#10b981'} size={88} />
          </div>
        </div>
      </div>

      {/* ROW 2: Projects Pie + AR/AP Bar + Inventory Donut + Tenders/CRM mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Projects Donut */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => navigate("/projects")}>
          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Projects ({props.projectsTotal})</p>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectPieData.length > 0 ? projectPieData : [{ name: 'None', value: 1 }]}
                  cx="50%" cy="50%" innerRadius={30} outerRadius={48}
                  paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ strokeWidth: 1, stroke: labelLineStroke }}
                  style={{ fontSize: 9 }}
                >
                  {(projectPieData.length > 0 ? projectPieData : [{ name: 'None', value: 1 }]).map((_: any, i: number) => (
                    <Cell key={i} fill={projectPieData.length > 0 ? projectColors[i % projectColors.length] : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, background: tooltipBg, border: tooltipBorder, color: tooltipColor, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AR vs AP Bar Chart */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => navigate("/financial")}>
          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">AR vs AP</p>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arApBarData} barSize={32} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tickFillStrong, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 9, fill: tickFill }} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ fontSize: 11, background: tooltipBg, border: tooltipBorder, color: tooltipColor, borderRadius: 6 }} formatter={(value: number) => [fc(value), 'Amount']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {arApBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  <LabelList dataKey="value" position="top" formatter={formatCompact} style={{ fontSize: 10, fill: labelFill, fontWeight: 600 }} offset={5} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Donut */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => navigate("/inventory")}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Inventory</p>
            <span className="text-[10px] text-teal-500 dark:text-teal-400 font-medium">{props.stockValue}</span>
          </div>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryPieData.length > 0 ? inventoryPieData : [{ name: 'Empty', value: 1 }]}
                  cx="50%" cy="50%" innerRadius={30} outerRadius={48}
                  paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ strokeWidth: 1, stroke: labelLineStroke }}
                  style={{ fontSize: 9 }}
                >
                  {(inventoryPieData.length > 0 ? inventoryPieData : [{ name: 'Empty', value: 1 }]).map((_: any, i: number) => (
                    <Cell key={i} fill={inventoryPieData.length > 0 ? inventoryColors[i % inventoryColors.length] : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, background: tooltipBg, border: tooltipBorder, color: tooltipColor, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenders + CRM + Team Gauges */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Operations</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-around">
              <GaugeMini isDark={isDark} value={props.tendersWon} maxValue={Math.max(props.tendersTotal, 1)} label={`Tenders Won`} centerText={`${props.tendersWon}/${props.tendersTotal}`} color="#f59e0b" size={72} />
              <GaugeMini isDark={isDark} value={props.crmClosedWon} maxValue={Math.max(props.totalLeads, 1)} label={`CRM Won`} centerText={`${props.crmClosedWon}/${props.totalLeads}`} color="#0ea5e9" size={72} />
            </div>
            <div className="flex items-center justify-around">
              <GaugeMini isDark={isDark} value={props.totalEmployees} maxValue={Math.max(props.totalEmployees * 1.2, 10)} label="Team" centerText={`${props.totalEmployees}`} color="#06b6d4" size={66} />
              <GaugeMini isDark={isDark} value={props.transactionCount + props.invoiceCount} maxValue={Math.max(props.transactionCount + props.invoiceCount, 10)} label="Txns/Inv" centerText={`${props.transactionCount + props.invoiceCount}`} color="#8b5cf6" size={66} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
