import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrossModuleHyperlink } from '@/components/CrossModuleHyperlink';
import { Plus, Edit, Trash2, Eye, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock AR data
const mockARData = [
  { id: 1, invoiceNumber: 'INV-2026-001', customerName: 'ABC Corporation', customerId: 101, amount: 50000, daysOverdue: 5, status: 'Paid', dueDate: '2026-01-27' },
  { id: 2, invoiceNumber: 'INV-2026-002', customerName: 'XYZ Industries', customerId: 102, amount: 15000, daysOverdue: 15, status: 'Overdue', dueDate: '2026-01-10' },
  { id: 3, invoiceNumber: 'INV-2026-003', customerName: 'Global Solutions', customerId: 103, amount: 160000, daysOverdue: 0, status: 'Pending', dueDate: '2026-02-06' },
  { id: 4, invoiceNumber: 'INV-2026-004', customerName: 'Tech Ventures', customerId: 104, amount: 75000, daysOverdue: 45, status: 'Overdue', dueDate: '2025-12-11' },
];

// Mock AP data
const mockAPData = [
  { id: 1, billNumber: 'BILL-2026-001', vendorName: 'Supplier A', vendorId: 201, amount: 30000, daysOverdue: 0, status: 'Pending', dueDate: '2026-02-05' },
  { id: 2, billNumber: 'BILL-2026-002', vendorName: 'Supplier B', vendorId: 202, amount: 45000, daysOverdue: 10, status: 'Overdue', dueDate: '2026-01-15' },
  { id: 3, billNumber: 'BILL-2026-003', vendorName: 'Supplier C', vendorId: 203, amount: 20000, daysOverdue: 0, status: 'Paid', dueDate: '2026-01-20' },
];

// Aging analysis data
const agingData = [
  { name: 'Current', value: 225000 },
  { name: '1-30 Days', value: 50000 },
  { name: '31-60 Days', value: 30000 },
  { name: '60+ Days', value: 75000 },
];

// Trend data
const trendData = [
  { month: 'Jan', AR: 200000, AP: 150000 },
  { month: 'Feb', AR: 240000, AP: 180000 },
  { month: 'Mar', AR: 280000, AP: 200000 },
  { month: 'Apr', AR: 320000, AP: 220000 },
];

export function FinancialEnhanced() {
  const [arData, setArData] = useState(mockARData);
  const [apData, setApData] = useState(mockAPData);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockARData[0] | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAR = arData.reduce((sum, item) => sum + item.amount, 0);
  const totalAP = apData.reduce((sum, item) => sum + item.amount, 0);
  const overdueAR = arData.filter(item => item.status === 'Overdue').reduce((sum, item) => sum + item.amount, 0);
  const overdueAP = apData.filter(item => item.status === 'Overdue').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-gray-600 mt-2">Accounts Receivable & Payable with aging analysis and reconciliation</p>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total AR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{totalAR.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Outstanding receivables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Overdue AR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">৳{overdueAR.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{arData.filter(item => item.status === 'Overdue').length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total AP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{totalAP.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Outstanding payables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Overdue AP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">৳{overdueAP.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{apData.filter(item => item.status === 'Overdue').length} bills</p>
          </CardContent>
        </Card>
      </div>

      {/* ALERTS */}
      {(arData.some(item => item.daysOverdue > 30) || apData.some(item => item.daysOverdue > 30)) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Alerts & Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {arData.filter(item => item.daysOverdue > 30).map(item => (
              <p key={item.id} className="text-sm text-red-700">
                Invoice {item.invoiceNumber} from {item.customerName} is {item.daysOverdue} days overdue (৳{item.amount.toLocaleString()})
              </p>
            ))}
            {apData.filter(item => item.daysOverdue > 30).map(item => (
              <p key={item.id} className="text-sm text-orange-700">
                Bill {item.billNumber} to {item.vendorName} is {item.daysOverdue} days overdue (৳{item.amount.toLocaleString()})
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* ACCOUNTS RECEIVABLE */}
        <TabsContent value="ar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accounts Receivable</h2>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arData.map((item) => (
                      <TableRow key={item.id} className={item.daysOverdue > 0 ? 'bg-red-50' : ''}>
                        <TableCell className="font-semibold">{item.invoiceNumber}</TableCell>
                        <TableCell>
                          <CrossModuleHyperlink
                            module="customers"
                            id={item.customerId}
                            label={item.customerName}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">৳{item.amount.toLocaleString()}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell className={item.daysOverdue > 0 ? 'text-red-600 font-semibold' : ''}>
                          {item.daysOverdue > 0 ? `${item.daysOverdue} days` : 'Current'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-3 h-3" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTS PAYABLE */}
        <TabsContent value="ap" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accounts Payable</h2>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Bill
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apData.map((item) => (
                      <TableRow key={item.id} className={item.daysOverdue > 0 ? 'bg-orange-50' : ''}>
                        <TableCell className="font-semibold">{item.billNumber}</TableCell>
                        <TableCell>
                          <CrossModuleHyperlink
                            module="purchases"
                            id={item.vendorId}
                            label={item.vendorName}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">৳{item.amount.toLocaleString()}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell className={item.daysOverdue > 0 ? 'text-orange-600 font-semibold' : ''}>
                          {item.daysOverdue > 0 ? `${item.daysOverdue} days` : 'Current'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-3 h-3" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGING ANALYSIS */}
        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AR Aging Analysis</CardTitle>
              <CardDescription>Outstanding receivables by age</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRENDS */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AR & AP Trends</CardTitle>
              <CardDescription>4-month comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="AR" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="AP" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
