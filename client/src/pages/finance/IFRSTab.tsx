import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, FileText, Download, BookOpen, Scale } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

interface IFRSTabProps {
  stats: any;
  balanceSheet: any;
  monthlyTrend: any[];
}

const IFRS_STANDARDS = [
  { id: "IFRS 1", title: "First-time Adoption", status: "compliant", impact: "low", notes: "N/A - Already using IFRS" },
  { id: "IFRS 7", title: "Financial Instruments: Disclosures", status: "compliant", impact: "medium", notes: "All financial instruments disclosed" },
  { id: "IFRS 9", title: "Financial Instruments", status: "compliant", impact: "high", notes: "Expected credit loss model applied to AR" },
  { id: "IFRS 13", title: "Fair Value Measurement", status: "partial", impact: "medium", notes: "Fair value hierarchy documentation pending" },
  { id: "IFRS 15", title: "Revenue from Contracts", status: "compliant", impact: "high", notes: "5-step revenue recognition model applied" },
  { id: "IFRS 16", title: "Leases", status: "partial", impact: "high", notes: "Right-of-use assets recognized; review needed" },
  { id: "IAS 1", title: "Presentation of Financial Statements", status: "compliant", impact: "high", notes: "All required statements prepared" },
  { id: "IAS 2", title: "Inventories", status: "compliant", impact: "medium", notes: "Lower of cost or NRV applied" },
  { id: "IAS 7", title: "Statement of Cash Flows", status: "compliant", impact: "high", notes: "Direct and indirect methods available" },
  { id: "IAS 12", title: "Income Taxes", status: "partial", impact: "high", notes: "Deferred tax calculation needs update" },
  { id: "IAS 16", title: "Property, Plant & Equipment", status: "compliant", impact: "medium", notes: "Cost model with straight-line depreciation" },
  { id: "IAS 36", title: "Impairment of Assets", status: "compliant", impact: "medium", notes: "Annual impairment testing performed" },
  { id: "IAS 37", title: "Provisions & Contingencies", status: "compliant", impact: "low", notes: "Provisions recognized at best estimate" },
  { id: "IAS 38", title: "Intangible Assets", status: "compliant", impact: "low", notes: "Software development costs capitalized" },
];

const COLORS = ['#0d3b66', '#10b981', '#f59e0b', '#0ea5e9'];

export default function IFRSTab({ stats, balanceSheet, monthlyTrend }: IFRSTabProps) {
  const { currency } = useCurrency();

  const complianceStats = {
    compliant: IFRS_STANDARDS.filter(s => s.status === 'compliant').length,
    partial: IFRS_STANDARDS.filter(s => s.status === 'partial').length,
    nonCompliant: IFRS_STANDARDS.filter(s => s.status === 'non-compliant').length,
  };

  const compliancePct = Math.round((complianceStats.compliant / IFRS_STANDARDS.length) * 100);

  const totalAssets = balanceSheet?.assets?.totalAssets || stats?.totalAssets || 0;
  const totalLiabilities = balanceSheet?.liabilities?.totalLiabilities || stats?.totalLiabilities || 0;
  const equity = totalAssets - totalLiabilities;

  const financialPositionData = [
    { name: 'Current Assets', value: (stats?.currentAssets?.cashBalance || 0) + (stats?.currentAssets?.accountReceivables || 0) + (stats?.currentAssets?.inventory || 0) },
    { name: 'Non-Current Assets', value: balanceSheet?.assets?.fixedAssets?.total || 0 },
    { name: 'Current Liabilities', value: (stats?.currentLiabilities?.wagesPayable || 0) + (stats?.currentLiabilities?.accountPayables || 0) },
    { name: 'Equity', value: Math.max(0, equity) },
  ].filter(d => d.value > 0);

  const revenueRecognitionData = monthlyTrend.slice(-6).map(m => ({
    month: m.month,
    recognized: m.revenue || 0,
    deferred: (m.revenue || 0) * 0.08,
    contractLiability: (m.revenue || 0) * 0.03,
  }));

  const gaugeSize = 160;
  const r = gaugeSize * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (compliancePct / 100) * circ;
  const vb = gaugeSize;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">IFRS Compliance Reporting</h2>
          <p className="text-muted-foreground">International Financial Reporting Standards compliance dashboard</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export IFRS Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-[#0d2137] mb-2">Overall Compliance</p>
            <div className="relative" style={{ width: gaugeSize, height: gaugeSize }}>
              <svg style={{ width: gaugeSize, height: gaugeSize }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
                <circle cx={vb / 2} cy={vb / 2} r={r} stroke="#e2e8f0" strokeWidth={gaugeSize * 0.09} fill="none" />
                <circle cx={vb / 2} cy={vb / 2} r={r} stroke={compliancePct >= 80 ? '#10b981' : compliancePct >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth={gaugeSize * 0.09} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-[#0d2137]">{compliancePct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-medium text-slate-500">Fully Compliant</p>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{complianceStats.compliant}</p>
            <p className="text-[10px] text-slate-400 mt-1">Standards fully met</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-medium text-slate-500">Partially Compliant</p>
            </div>
            <p className="text-3xl font-bold text-amber-700">{complianceStats.partial}</p>
            <p className="text-[10px] text-slate-400 mt-1">Standards needing attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-[#0d3b66]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#0d3b66]" />
              <p className="text-xs font-medium text-slate-500">Total Standards</p>
            </div>
            <p className="text-3xl font-bold text-[#0d2137]">{IFRS_STANDARDS.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Applicable IFRS/IAS standards</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Financial Position (IAS 1)</CardTitle>
            <CardDescription>Statement of financial position breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={financialPositionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} style={{ fontSize: 9 }}>
                    {financialPositionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value, currency)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Recognition (IFRS 15)</CardTitle>
            <CardDescription>Recognized vs deferred revenue analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueRecognitionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(value: number) => [formatCurrency(value, currency)]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="recognized" name="Recognized" fill="#0d3b66" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="deferred" name="Deferred" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0d3b66]" />
            IFRS/IAS Standards Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal break-words">Standard</TableHead>
                <TableHead className="whitespace-normal break-words">Title</TableHead>
                <TableHead className="whitespace-normal break-words">Impact</TableHead>
                <TableHead className="whitespace-normal break-words">Status</TableHead>
                <TableHead className="whitespace-normal break-words">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {IFRS_STANDARDS.map((standard) => (
                <TableRow key={standard.id}>
                  <TableCell className="break-words font-bold text-[#0d3b66]" style={{ overflowWrap: "break-word" }}>{standard.id}</TableCell>
                  <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{standard.title}</TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Badge variant="outline" className={
                      standard.impact === 'high' ? 'border-red-300 text-red-700' :
                      standard.impact === 'medium' ? 'border-amber-300 text-amber-700' :
                      'border-green-300 text-green-700'
                    }>{standard.impact}</Badge>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Badge className={
                      standard.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      standard.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {standard.status === 'compliant' ? 'Compliant' : standard.status === 'partial' ? 'Partial' : 'Non-Compliant'}
                    </Badge>
                  </TableCell>
                  <TableCell className="break-words text-sm text-slate-500 max-w-xs" style={{ overflowWrap: "break-word" }}>{standard.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
