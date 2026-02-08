import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, FileText, Shield, Scale, Download } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface TaxComplianceTabProps {
  stats: any;
  monthlyTrend: any[];
}

const VAT_RATE = 0.15;
const TDS_RATES: Record<string, { rate: number; section: string; description: string }> = {
  "Salary": { rate: 0.10, section: "52", description: "TDS on Salary" },
  "Contractor": { rate: 0.07, section: "52AA", description: "TDS on Contractors" },
  "Supplier": { rate: 0.05, section: "52", description: "TDS on Supplier Payments" },
  "Rent": { rate: 0.05, section: "53A", description: "TDS on Rent" },
  "Professional": { rate: 0.10, section: "52", description: "TDS on Professional Fees" },
  "Interest": { rate: 0.10, section: "53B", description: "TDS on Interest Income" },
  "Commission": { rate: 0.10, section: "53E", description: "TDS on Commission" },
  "Royalty": { rate: 0.10, section: "53F", description: "TDS on Royalty" },
};

const NBR_COMPLIANCE_CHECKLIST = [
  { id: 1, requirement: "Monthly VAT Return (Mushak-9.1)", deadline: "15th of following month", status: "compliant", dueDate: "2026-02-15" },
  { id: 2, requirement: "TDS Certificate Issuance", deadline: "Within 20 days of deduction", status: "compliant", dueDate: "2026-02-20" },
  { id: 3, requirement: "Annual Income Tax Return", deadline: "30th September", status: "upcoming", dueDate: "2026-09-30" },
  { id: 4, requirement: "Advance Income Tax Payment", deadline: "Quarterly", status: "compliant", dueDate: "2026-03-15" },
  { id: 5, requirement: "VAT Registration Renewal", deadline: "Annual", status: "compliant", dueDate: "2026-12-31" },
  { id: 6, requirement: "Transfer Pricing Documentation", deadline: "With return", status: "upcoming", dueDate: "2026-09-30" },
  { id: 7, requirement: "Withholding Tax Statement (108)", deadline: "30th September", status: "compliant", dueDate: "2026-09-30" },
  { id: 8, requirement: "Monthly Mushak-6.3 Filing", deadline: "15th of following month", status: "attention", dueDate: "2026-02-15" },
];

const COLORS = ['#0d3b66', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function TaxComplianceTab({ stats, monthlyTrend }: TaxComplianceTabProps) {
  const { currency } = useCurrency();

  const totalRevenue = stats?.revenue || 0;
  const totalExpenses = (stats?.cogs || 0) + (stats?.opex || 0);

  const vatCollected = totalRevenue * VAT_RATE;
  const vatPaid = totalExpenses * VAT_RATE * 0.6;
  const vatPayable = vatCollected - vatPaid;

  const tdsData = useMemo(() => {
    const categories = Object.entries(TDS_RATES).map(([cat, info]) => {
      const baseAmount = totalExpenses * (0.05 + Math.random() * 0.15);
      const tdsAmount = baseAmount * info.rate;
      return {
        category: cat,
        section: info.section,
        baseAmount,
        rate: info.rate * 100,
        tdsAmount,
        description: info.description
      };
    });
    return categories;
  }, [totalExpenses]);

  const totalTDS = tdsData.reduce((sum, d) => sum + d.tdsAmount, 0);

  const taxSummaryData = [
    { name: 'VAT Collected', value: vatCollected },
    { name: 'VAT Input Credit', value: vatPaid },
    { name: 'VAT Net Payable', value: vatPayable },
    { name: 'TDS Deducted', value: totalTDS },
  ];

  const complianceStats = {
    compliant: NBR_COMPLIANCE_CHECKLIST.filter(c => c.status === 'compliant').length,
    attention: NBR_COMPLIANCE_CHECKLIST.filter(c => c.status === 'attention').length,
    upcoming: NBR_COMPLIANCE_CHECKLIST.filter(c => c.status === 'upcoming').length,
  };

  const monthlyVatData = monthlyTrend.map(m => ({
    month: m.month,
    vatCollected: (m.revenue || 0) * VAT_RATE,
    vatPaid: (m.cogs || 0) * VAT_RATE * 0.6,
    netVat: (m.revenue || 0) * VAT_RATE - (m.cogs || 0) * VAT_RATE * 0.6,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Bangladesh Tax Compliance</h2>
          <p className="text-muted-foreground">VAT/GST, TDS, and NBR regulatory compliance dashboard</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Tax Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-[#0d3b66]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#0d3b66]" />
              <p className="text-xs font-medium text-slate-500">VAT Collected (15%)</p>
            </div>
            <p className="text-xl font-bold text-[#0d2137]">{formatCurrency(vatCollected, currency)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Output VAT on sales revenue</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-medium text-slate-500">VAT Input Credit</p>
            </div>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(vatPaid, currency)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Input VAT on purchases</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-medium text-slate-500">Net VAT Payable</p>
            </div>
            <p className={`text-xl font-bold ${vatPayable > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{formatCurrency(vatPayable, currency)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Due to NBR by 15th of next month</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-red-500" />
              <p className="text-xs font-medium text-slate-500">Total TDS Deducted</p>
            </div>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalTDS, currency)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Tax Deducted at Source</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly VAT Trend</CardTitle>
            <CardDescription>Output VAT vs Input Credit vs Net Payable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVatData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(value: number) => [formatCurrency(value, currency)]} />
                  <Bar dataKey="vatCollected" name="VAT Collected" fill="#0d3b66" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="vatPaid" name="Input Credit" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="netVat" name="Net Payable" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tax Breakdown</CardTitle>
            <CardDescription>Distribution of tax obligations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taxSummaryData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} style={{ fontSize: 9 }}>
                    {taxSummaryData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value, currency)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0d3b66]" />
            TDS Rates & Deductions (Income Tax Ordinance, 1984)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal break-words">Category</TableHead>
                <TableHead className="whitespace-normal break-words">Section</TableHead>
                <TableHead className="whitespace-normal break-words text-right">TDS Rate</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Base Amount</TableHead>
                <TableHead className="whitespace-normal break-words text-right">TDS Deducted</TableHead>
                <TableHead className="whitespace-normal break-words">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tdsData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{item.category}</TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}><Badge variant="outline">Sec {item.section}</Badge></TableCell>
                  <TableCell className="break-words text-right font-mono" style={{ overflowWrap: "break-word" }}>{item.rate.toFixed(1)}%</TableCell>
                  <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{formatCurrency(item.baseAmount, currency)}</TableCell>
                  <TableCell className="break-words text-right font-semibold text-red-600" style={{ overflowWrap: "break-word" }}>{formatCurrency(item.tdsAmount, currency)}</TableCell>
                  <TableCell className="break-words text-xs text-slate-500" style={{ overflowWrap: "break-word" }}>{item.description}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={4}>Total TDS</TableCell>
                <TableCell className="break-words text-right text-red-700" style={{ overflowWrap: "break-word" }}>{formatCurrency(totalTDS, currency)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0d3b66]" />
            NBR Compliance Checklist
          </CardTitle>
          <CardDescription>
            <div className="flex gap-3 mt-1">
              <Badge className="bg-green-100 text-green-800">{complianceStats.compliant} Compliant</Badge>
              <Badge className="bg-amber-100 text-amber-800">{complianceStats.attention} Needs Attention</Badge>
              <Badge className="bg-blue-100 text-blue-800">{complianceStats.upcoming} Upcoming</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal break-words">Requirement</TableHead>
                <TableHead className="whitespace-normal break-words">Deadline</TableHead>
                <TableHead className="whitespace-normal break-words">Due Date</TableHead>
                <TableHead className="whitespace-normal break-words">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NBR_COMPLIANCE_CHECKLIST.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{item.requirement}</TableCell>
                  <TableCell className="break-words text-sm text-slate-500" style={{ overflowWrap: "break-word" }}>{item.deadline}</TableCell>
                  <TableCell className="break-words text-sm" style={{ overflowWrap: "break-word" }}>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Badge className={
                      item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      item.status === 'attention' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {item.status === 'compliant' ? 'Compliant' : item.status === 'attention' ? 'Needs Attention' : 'Upcoming'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
