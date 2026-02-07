import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, ShieldCheck, ShieldAlert, Brain, Eye, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie } from "recharts";

interface AnomalyDetectionTabProps {
  stats: any;
  monthlyTrend: any[];
  arData: any[];
  apData: any[];
}

const RISK_LEVELS = {
  critical: { color: '#ef4444', bg: 'bg-red-100 text-red-800', icon: ShieldAlert },
  high: { color: '#f97316', bg: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  medium: { color: '#f59e0b', bg: 'bg-amber-100 text-amber-800', icon: Eye },
  low: { color: '#10b981', bg: 'bg-green-100 text-green-800', icon: ShieldCheck },
};

export default function AnomalyDetectionTab({ stats, monthlyTrend, arData, apData }: AnomalyDetectionTabProps) {
  const { currency } = useCurrency();
  const [scanning, setScanning] = useState(false);

  const anomalies = useMemo(() => {
    const results: any[] = [];
    const totalRevenue = stats?.revenue || 0;
    const totalExpenses = (stats?.cogs || 0) + (stats?.opex || 0);
    const netProfit = stats?.netProfit || 0;

    if (totalRevenue > 0 && totalExpenses / totalRevenue > 0.85) {
      results.push({
        id: 1, type: 'Expense Ratio Alert', severity: 'high',
        description: `Expense-to-revenue ratio is ${((totalExpenses / totalRevenue) * 100).toFixed(1)}%, above the 85% threshold.`,
        amount: totalExpenses, recommendation: 'Review expense categories for potential cost reduction opportunities.',
        category: 'Expense', detectedAt: new Date().toISOString(),
      });
    }

    const overdueAR = arData.filter((ar: any) => ar.status === 'overdue');
    if (overdueAR.length > 3) {
      const overdueAmount = overdueAR.reduce((sum: number, ar: any) => sum + Number(ar.amount || 0), 0);
      results.push({
        id: 2, type: 'Collection Risk', severity: 'critical',
        description: `${overdueAR.length} overdue receivables totaling ${formatCurrency(overdueAmount, currency)}. Possible collection fraud or process failure.`,
        amount: overdueAmount, recommendation: 'Immediately review overdue accounts and initiate collection procedures.',
        category: 'AR', detectedAt: new Date().toISOString(),
      });
    }

    if (monthlyTrend.length >= 3) {
      const lastThree = monthlyTrend.slice(-3);
      const revenueDropping = lastThree.every((m, i) => i === 0 || (m.revenue || 0) < (lastThree[i - 1]?.revenue || 0));
      if (revenueDropping) {
        results.push({
          id: 3, type: 'Revenue Decline Pattern', severity: 'high',
          description: 'Revenue has been declining for 3 consecutive months. This may indicate market issues or internal problems.',
          amount: lastThree[lastThree.length - 1]?.revenue || 0,
          recommendation: 'Analyze sales pipeline and market conditions. Review pricing strategy.',
          category: 'Revenue', detectedAt: new Date().toISOString(),
        });
      }
    }

    const duplicateVendors = apData.reduce((acc: Record<string, any[]>, ap: any) => {
      const key = ap.vendorName?.toLowerCase();
      if (key) { if (!acc[key]) acc[key] = []; acc[key].push(ap); }
      return acc;
    }, {});
    Object.entries(duplicateVendors).forEach(([vendor, entries]) => {
      if ((entries as any[]).length > 5) {
        results.push({
          id: 4 + results.length, type: 'Duplicate Payment Risk', severity: 'medium',
          description: `Vendor "${vendor}" has ${(entries as any[]).length} payable entries. Review for potential duplicate payments.`,
          amount: (entries as any[]).reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
          recommendation: 'Cross-reference invoices to identify and prevent duplicate payments.',
          category: 'AP', detectedAt: new Date().toISOString(),
        });
      }
    });

    if (netProfit < 0) {
      results.push({
        id: 10, type: 'Negative Profit Alert', severity: 'critical',
        description: `Net profit is negative at ${formatCurrency(netProfit, currency)}. Immediate attention required.`,
        amount: Math.abs(netProfit), recommendation: 'Conduct emergency cost review and revenue enhancement analysis.',
        category: 'Profitability', detectedAt: new Date().toISOString(),
      });
    }

    if (results.length === 0) {
      results.push({
        id: 0, type: 'All Clear', severity: 'low',
        description: 'No significant anomalies detected. All financial metrics are within expected ranges.',
        amount: 0, recommendation: 'Continue regular monitoring.',
        category: 'System', detectedAt: new Date().toISOString(),
      });
    }

    return results;
  }, [stats, monthlyTrend, arData, apData, currency]);

  const riskDistribution = [
    { name: 'Critical', value: anomalies.filter(a => a.severity === 'critical').length, fill: '#ef4444' },
    { name: 'High', value: anomalies.filter(a => a.severity === 'high').length, fill: '#f97316' },
    { name: 'Medium', value: anomalies.filter(a => a.severity === 'medium').length, fill: '#f59e0b' },
    { name: 'Low', value: anomalies.filter(a => a.severity === 'low').length, fill: '#10b981' },
  ].filter(d => d.value > 0);

  const trendWithAnomaly = monthlyTrend.map((m, i) => {
    const prevRevenue = i > 0 ? monthlyTrend[i - 1]?.revenue || 0 : m.revenue || 0;
    const change = prevRevenue > 0 ? ((m.revenue - prevRevenue) / prevRevenue) * 100 : 0;
    return {
      ...m,
      anomalyScore: Math.abs(change) > 20 ? 80 : Math.abs(change) > 10 ? 50 : 20,
      changePercent: change,
    };
  });

  const riskScore = anomalies.reduce((score, a) => {
    if (a.severity === 'critical') return score + 30;
    if (a.severity === 'high') return score + 20;
    if (a.severity === 'medium') return score + 10;
    return score + 2;
  }, 0);
  const normalizedRisk = Math.min(100, riskScore);

  const gaugeSize = 160;
  const r_gauge = gaugeSize * 0.38;
  const circ = 2 * Math.PI * r_gauge;
  const offset = circ - (normalizedRisk / 100) * circ;
  const vb = gaugeSize;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">AI Anomaly Detection</h2>
          <p className="text-muted-foreground">Automated fraud prevention and financial anomaly monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 2000); }}>
          <Brain className="w-4 h-4 mr-2" />
          {scanning ? 'Scanning...' : 'Run AI Scan'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-[#0d2137] mb-2">Risk Score</p>
            <div className="relative" style={{ width: gaugeSize, height: gaugeSize }}>
              <svg style={{ width: gaugeSize, height: gaugeSize }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
                <circle cx={vb / 2} cy={vb / 2} r={r_gauge} stroke="#e2e8f0" strokeWidth={gaugeSize * 0.09} fill="none" />
                <circle cx={vb / 2} cy={vb / 2} r={r_gauge}
                  stroke={normalizedRisk > 60 ? '#ef4444' : normalizedRisk > 30 ? '#f59e0b' : '#10b981'}
                  strokeWidth={gaugeSize * 0.09} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-[#0d2137]">{normalizedRisk}</span>
                <span className="text-[10px] text-slate-400">/100</span>
              </div>
            </div>
            <Badge className={normalizedRisk > 60 ? 'bg-red-100 text-red-800' : normalizedRisk > 30 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
              {normalizedRisk > 60 ? 'High Risk' : normalizedRisk > 30 ? 'Moderate Risk' : 'Low Risk'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <p className="text-xs font-medium text-slate-500">Critical Alerts</p>
            </div>
            <p className="text-3xl font-bold text-red-700">{anomalies.filter(a => a.severity === 'critical').length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Require immediate action</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-medium text-slate-500">Warnings</p>
            </div>
            <p className="text-3xl font-bold text-amber-700">{anomalies.filter(a => a.severity === 'high' || a.severity === 'medium').length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Need review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-medium text-slate-500">Total Anomalies</p>
            </div>
            <p className="text-3xl font-bold text-[#0d2137]">{anomalies.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Detected in current period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Anomaly Score Trend</CardTitle>
            <CardDescription>Monthly anomaly detection scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendWithAnomaly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="anomalyScore" name="Anomaly Score" radius={[3, 3, 0, 0]}>
                    {trendWithAnomaly.map((entry, i) => (
                      <Cell key={i} fill={entry.anomalyScore > 60 ? '#ef4444' : entry.anomalyScore > 40 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Anomalies by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={{ strokeWidth: 1 }} style={{ fontSize: 10 }}>
                    {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#0d3b66]" />
            Detected Anomalies & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies.map((anomaly) => {
              const riskConfig = RISK_LEVELS[anomaly.severity as keyof typeof RISK_LEVELS] || RISK_LEVELS.low;
              const Icon = riskConfig.icon;
              return (
                <div key={anomaly.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${anomaly.severity === 'critical' ? 'bg-red-50' : anomaly.severity === 'high' ? 'bg-orange-50' : anomaly.severity === 'medium' ? 'bg-amber-50' : 'bg-green-50'}`}>
                      <Icon className="w-5 h-5" style={{ color: riskConfig.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[#0d2137]">{anomaly.type}</span>
                        <Badge className={riskConfig.bg}>{anomaly.severity}</Badge>
                        <Badge variant="outline" className="text-[10px]">{anomaly.category}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{anomaly.description}</p>
                      {anomaly.amount > 0 && (
                        <p className="text-sm font-semibold text-[#0d2137] mt-1">Impact: {formatCurrency(anomaly.amount, currency)}</p>
                      )}
                      <div className="mt-2 bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-blue-800"><span className="font-semibold">Recommendation:</span> {anomaly.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
