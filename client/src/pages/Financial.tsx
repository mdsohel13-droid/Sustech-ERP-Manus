import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, ArrowRight, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { Link } from "wouter";

export default function Financial() {
  const { currency } = useCurrency();

  // Queries
  const { data: arData } = trpc.financial.getAllAR.useQuery();
  const { data: apData } = trpc.financial.getAllAP.useQuery();
  const { data: incomeData } = trpc.incomeExpenditure.getAll.useQuery();

  // Filter income and expenditure
  const incomeRecords = incomeData?.filter(item => item.type === 'income') || [];
  const expenditureRecords = incomeData?.filter(item => item.type === 'expenditure') || [];

  // Calculate totals
  const totalIncome = incomeRecords.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenditure = expenditureRecords.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netProfit = totalIncome - totalExpenditure;

  // Calculate AR/AP totals
  const totalAR = arData?.filter((ar: any) => ar.status !== 'paid').reduce((sum: number, ar: any) => sum + parseFloat(ar.amount || '0'), 0) || 0;
  const totalAP = apData?.filter((ap: any) => ap.status !== 'paid').reduce((sum: number, ap: any) => sum + parseFloat(ap.amount || '0'), 0) || 0;

  // Calculate aging for AR
  const getAgingCategory = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "current";
    if (diffDays <= 30) return "1-30";
    if (diffDays <= 60) return "31-60";
    if (diffDays <= 90) return "61-90";
    return "90+";
  };

  const agingAnalysis = arData?.reduce((acc: any, ar: any) => {
    if (ar.status !== 'paid') {
      const category = getAgingCategory(ar.dueDate);
      acc[category] = (acc[category] || 0) + parseFloat(ar.amount || '0');
    }
    return acc;
  }, {}) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Comprehensive financial tracking with P&L, receivables, and payables
          </p>
        </div>
        <Link href="/income-expenditure">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Income & Expenditure
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {incomeRecords.length} income sources
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenditure, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenditureRecords.length} expense items
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAR, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {arData?.filter((ar: any) => ar.status !== 'paid').length || 0} outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Payable</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalAP, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {apData?.filter((ap: any) => ap.status !== 'paid').length || 0} outstanding bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Profit Card */}
      <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader>
          <CardTitle>Net Profit/Loss</CardTitle>
          <CardDescription>Revenue minus expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit, currency)}
          </div>
        </CardContent>
      </Card>

      {/* Aging Analysis Card */}
      {Object.keys(agingAnalysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receivables Aging Analysis</CardTitle>
            <CardDescription>Outstanding receivables by aging period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-1 p-3 rounded-lg bg-green-50">
                <p className="text-sm font-medium text-green-800">Current</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(agingAnalysis.current || 0, currency)}
                </p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-yellow-50">
                <p className="text-sm font-medium text-yellow-800">1-30 Days</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(agingAnalysis["1-30"] || 0, currency)}
                </p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-orange-50">
                <p className="text-sm font-medium text-orange-800">31-60 Days</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(agingAnalysis["31-60"] || 0, currency)}
                </p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-800">61-90 Days</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(agingAnalysis["61-90"] || 0, currency)}
                </p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-red-100">
                <p className="text-sm font-medium text-red-900">90+ Days</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(agingAnalysis["90+"] || 0, currency)}
                </p>
              </div>
            </div>
            
            {/* Bar Chart Visualization */}
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Current', amount: agingAnalysis.current || 0, fill: '#10b981' },
                    { name: '1-30 Days', amount: agingAnalysis["1-30"] || 0, fill: '#eab308' },
                    { name: '31-60 Days', amount: agingAnalysis["31-60"] || 0, fill: '#f97316' },
                    { name: '61-90 Days', amount: agingAnalysis["61-90"] || 0, fill: '#ef4444' },
                    { name: '90+ Days', amount: agingAnalysis["90+"] || 0, fill: '#dc2626' },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* P&L Statement */}
      <Tabs defaultValue="pl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pl">P&L Statement</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>Summary of revenues and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Revenue</h3>
                  <Table>
                    <TableBody>
                      {Object.entries(
                        incomeRecords.reduce((acc: Record<string, number>, income: any) => {
                          acc[income.category] = (acc[income.category] || 0) + parseFloat(income.amount);
                          return acc;
                        }, {})
                      ).map(([category, amount]) => (
                        <TableRow key={category}>
                          <TableCell className="capitalize">{category.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(amount, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-green-50 font-bold">
                        <TableCell>Total Revenue</TableCell>
                        <TableCell className="text-right text-green-700">
                          {formatCurrency(totalIncome, currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-700">Expenses</h3>
                  <Table>
                    <TableBody>
                      {Object.entries(
                        expenditureRecords.reduce((acc: Record<string, number>, expense: any) => {
                          acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
                          return acc;
                        }, {})
                      ).map(([category, amount]) => (
                        <TableRow key={category}>
                          <TableCell className="capitalize">{category.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(amount, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-red-50 font-bold">
                        <TableCell>Total Expenses</TableCell>
                        <TableCell className="text-right text-red-700">
                          {formatCurrency(totalExpenditure, currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="pt-4 border-t-2 border-gray-300">
                  <Table>
                    <TableBody>
                      <TableRow className={`text-xl font-bold ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TableCell>Net Profit/Loss</TableCell>
                        <TableCell className={`text-right ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatCurrency(netProfit, currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accounts Receivable</CardTitle>
                  <CardDescription>Money owed to you by customers</CardDescription>
                </div>
                <Link href="/sales">
                  <Button variant="outline">
                    Go to Sales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {arData && arData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arData.filter((ar: any) => ar.status !== 'paid').slice(0, 10).map((ar: any) => (
                      <TableRow key={ar.id}>
                        <TableCell>{ar.customerName}</TableCell>
                        <TableCell>{ar.invoiceNumber}</TableCell>
                        <TableCell>
                          <span className={new Date(ar.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(ar.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ar.status === 'overdue' ? 'destructive' : 'outline'}>
                            {ar.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(ar.amount || '0'), currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No outstanding receivables</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Payable</CardTitle>
              <CardDescription>Money you owe to vendors and suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              {apData && apData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apData.filter((ap: any) => ap.status !== 'paid').slice(0, 10).map((ap: any) => (
                      <TableRow key={ap.id}>
                        <TableCell>{ap.vendorName}</TableCell>
                        <TableCell>{ap.invoiceNumber}</TableCell>
                        <TableCell>
                          <span className={new Date(ap.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(ap.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ap.status === 'overdue' ? 'destructive' : 'outline'}>
                            {ap.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(ap.amount || '0'), currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No outstanding payables</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
