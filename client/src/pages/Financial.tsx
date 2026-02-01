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
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, ArrowRight, FileText, Bell, Edit, Trash2, Download, Archive, ArchiveRestore, Eye, Search } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { InlineEditCell } from "@/components/InlineEditCell";
import { TableBatchActions, useTableBatchSelection } from "@/components/TableBatchActions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Financial() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean; item: any; type: 'ar' | 'ap'}>({show: false, item: null, type: 'ar'});
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCell, setEditingCell] = useState<{id: string; field: string} | null>(null);
  const [bulkDeletingAR, setBulkDeletingAR] = useState(false);
  const [bulkDeletingAP, setBulkDeletingAP] = useState(false);
  const [arSearchTerm, setArSearchTerm] = useState("");
  const [apSearchTerm, setApSearchTerm] = useState("");

  const notifyOverdueMutation = trpc.financial.notifyOverdueAR.useMutation({
    onSuccess: (data) => {
      if (data.count === 0) {
        toast.info("No overdue receivables found");
      } else {
        toast.success(`Notification sent for ${data.count} overdue receivables (Total: ${formatCurrency(data.totalOverdue, currency)})`);
      }
    },
    onError: () => {
      toast.error("Failed to send notification");
    },
  });

  const sendSMSMutation = trpc.system.sendSMS.useMutation({
    onSuccess: () => {
      toast.success("SMS reminders sent successfully");
    },
    onError: () => {
      toast.error("Failed to send SMS reminders");
    },
  });

  const deleteARMutation = trpc.financial.deleteAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      toast.success("AR record deleted");
      setDeleteConfirm({show: false, item: null, type: 'ar'});
    },
    onError: () => {
      toast.error("Failed to delete AR record");
    },
  });

  const deleteAPMutation = trpc.financial.deleteAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      toast.success("AP record deleted");
      setDeleteConfirm({show: false, item: null, type: 'ap'});
    },
    onError: () => {
      toast.error("Failed to delete AP record");
    },
  });

  const bulkDeleteARMutation = trpc.financial.bulkDeleteAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      toast.success("AR records deleted");
      arBatchSelection.clearSelection();
      setBulkDeletingAR(false);
    },
    onError: () => {
      toast.error("Failed to delete AR records");
      setBulkDeletingAR(false);
    },
  });

  const bulkDeleteAPMutation = trpc.financial.bulkDeleteAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      toast.success("AP records deleted");
      apBatchSelection.clearSelection();
      setBulkDeletingAP(false);
    },
    onError: () => {
      toast.error("Failed to delete AP records");
      setBulkDeletingAP(false);
    },
  });

  const updateARMutation = trpc.financial.updateAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      toast.success("AR record updated");
      setEditingCell(null);
    },
    onError: () => {
      toast.error("Failed to update AR record");
    },
  });

  const updateAPMutation = trpc.financial.updateAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      toast.success("AP record updated");
      setEditingCell(null);
    },
    onError: () => {
      toast.error("Failed to update AP record");
    },
  });

  // Queries
  const { data: arData } = trpc.financial.getAllAR.useQuery();
  const { data: apData } = trpc.financial.getAllAP.useQuery();
  const { data: archivedARData = [] } = trpc.financial.getArchivedAR.useQuery();
  const { data: archivedAPData = [] } = trpc.financial.getArchivedAP.useQuery();
  const { data: incomeData } = trpc.incomeExpenditure.getAll.useQuery();
  
  const arBatchSelection = useTableBatchSelection(arData || []);
  const apBatchSelection = useTableBatchSelection(apData || []);

  // Archive mutations
  const archiveARMutation = trpc.financial.archiveAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getArchivedAR.invalidate();
      toast.success("Receivable archived");
    },
    onError: () => toast.error("Failed to archive receivable"),
  });

  const restoreARMutation = trpc.financial.restoreAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getArchivedAR.invalidate();
      toast.success("Receivable restored");
    },
    onError: () => toast.error("Failed to restore receivable"),
  });

  const archiveAPMutation = trpc.financial.archiveAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getArchivedAP.invalidate();
      toast.success("Payable archived");
    },
    onError: () => toast.error("Failed to archive payable"),
  });

  const restoreAPMutation = trpc.financial.restoreAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getArchivedAP.invalidate();
      toast.success("Payable restored");
    },
    onError: () => toast.error("Failed to restore payable"),
  });

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => notifyOverdueMutation.mutate()}
            disabled={notifyOverdueMutation.isPending}
          >
            <Bell className="h-4 w-4 mr-2" />
            {notifyOverdueMutation.isPending ? "Sending..." : "Notify Overdue AR"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const phoneNumbers = arData?.filter((ar: any) => ar.status === 'overdue').map((ar: any) => ar.customerPhone || '').filter(Boolean) || [];
              if (phoneNumbers.length === 0) {
                toast.info("No customer phone numbers found");
                return;
              }
              if (sendSMSMutation) {
                sendSMSMutation.mutate({ phoneNumbers, message: "Payment reminder: Please settle your outstanding invoice at your earliest convenience." });
              } else {
                toast.error("SMS service not available");
              }
            }}
            disabled={sendSMSMutation.isPending}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {sendSMSMutation.isPending ? "Sending SMS..." : "Send SMS Reminders"}
          </Button>
          <Link href="/accounting">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Accounting
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
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
          {arBatchSelection.selectedIds.length > 0 && (
            <TableBatchActions
              selectedIds={arBatchSelection.selectedIds}
              totalCount={arData?.length || 0}
              onSelectAll={arBatchSelection.toggleSelectAll}
              isLoading={bulkDeletingAR}
              onBulkDelete={() => {
                setBulkDeletingAR(true);
                bulkDeleteARMutation.mutate({ ids: arBatchSelection.selectedIds.map(id => Number(id)) });
              }}
              onExport={() => {
                const selectedItems = arData?.filter((ar: any) => arBatchSelection.selectedIds.includes(String(ar.id))) || [];
                arBatchSelection.exportToCSV(selectedItems, 'ar-export');
              }}
            />
          )}
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
                      <TableHead className="w-8">
                        <input
                          type="checkbox"
                          checked={arBatchSelection.selectedIds.length === arData.filter((ar: any) => ar.status !== 'paid').length && arData.filter((ar: any) => ar.status !== 'paid').length > 0}
                          onChange={(e) => {
                            arBatchSelection.toggleSelectAll(e.target.checked);
                          }}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arData.filter((ar: any) => ar.status !== 'paid').slice(0, 10).map((ar: any) => (
                      <TableRow key={ar.id}>
                        <TableCell className="w-8">
                          <input
                            type="checkbox"
                            checked={arBatchSelection.selectedIds.includes(String(ar.id))}
                            onChange={(e) => {
                              arBatchSelection.toggleSelection(String(ar.id));
                            }}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell><button onClick={() => setEditingItem(ar)} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{ar.customerName}</button></TableCell>
                        <TableCell><button onClick={() => setEditingItem(ar)} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{ar.invoiceNumber}</button></TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === ar.id && editingCell?.field === 'dueDate' ? (
                            <InlineEditCell
                              value={new Date(ar.dueDate).toISOString().split('T')[0]}
                              isEditing={true}
                              type="date"
                              onSave={(value) => {
                                updateARMutation.mutate({
                                  id: ar.id,
                                  dueDate: String(value),
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateARMutation.isPending}
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell({id: ar.id, field: 'dueDate'})} 
                              className={`cursor-pointer hover:underline ${new Date(ar.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}`}
                            >
                              {new Date(ar.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === ar.id && editingCell?.field === 'status' ? (
                            <InlineEditCell
                              value={ar.status}
                              isEditing={true}
                              type="select"
                              options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'overdue', label: 'Overdue' },
                                { value: 'paid', label: 'Paid' },
                              ]}
                              onSave={(value) => {
                                updateARMutation.mutate({
                                  id: ar.id,
                                  status: String(value),
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateARMutation.isPending}
                            />
                          ) : (
                            <Badge 
                              variant={ar.status === 'overdue' ? 'destructive' : 'outline'}
                              onClick={() => setEditingCell({id: ar.id, field: 'status'})}
                              className="cursor-pointer"
                            >
                              {ar.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === ar.id && editingCell?.field === 'amount' ? (
                            <InlineEditCell
                              value={ar.amount}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                updateARMutation.mutate({
                                  id: ar.id,
                                  amount: String(value),
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateARMutation.isPending}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({id: ar.id, field: 'amount'})} className="cursor-pointer hover:underline">
                              {formatCurrency(parseFloat(ar.amount || '0'), currency)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(ar)} title="Edit">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => archiveARMutation.mutate({ id: ar.id })} title="Archive">
                              <Archive className="w-4 h-4 text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: ar, type: 'ar'})} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
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

          {/* Archived Receivables */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Archived Receivables ({archivedARData.length})</CardTitle>
                  <CardDescription>Previously archived accounts receivable</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search archived..."
                    value={arSearchTerm}
                    onChange={(e) => setArSearchTerm(e.target.value)}
                    className="pl-8 h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {archivedARData.length > 0 ? (
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="w-[140px] text-xs">Customer</TableHead>
                      <TableHead className="w-[100px] text-xs">Invoice</TableHead>
                      <TableHead className="w-[90px] text-xs">Due Date</TableHead>
                      <TableHead className="w-[80px] text-xs">Status</TableHead>
                      <TableHead className="w-[100px] text-xs text-right">Amount</TableHead>
                      <TableHead className="w-[90px] text-xs">Archived</TableHead>
                      <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedARData
                      .filter((ar: any) =>
                        ar.customerName.toLowerCase().includes(arSearchTerm.toLowerCase()) ||
                        (ar.invoiceNumber && ar.invoiceNumber.toLowerCase().includes(arSearchTerm.toLowerCase()))
                      )
                      .map((ar: any, idx: number) => (
                      <TableRow key={ar.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <TableCell className="w-[140px] max-w-[140px] overflow-hidden">
                          <div className="text-xs line-clamp-2">{ar.customerName}</div>
                        </TableCell>
                        <TableCell className="w-[100px] text-xs">{ar.invoiceNumber || "-"}</TableCell>
                        <TableCell className="w-[90px] text-xs">{ar.dueDate ? format(new Date(ar.dueDate), "MMM dd, yy") : "-"}</TableCell>
                        <TableCell className="w-[80px]">
                          <Badge variant="outline" className="text-[10px]">{ar.status}</Badge>
                        </TableCell>
                        <TableCell className="w-[100px] text-xs text-right font-medium">{formatCurrency(parseFloat(ar.amount || '0'), currency)}</TableCell>
                        <TableCell className="w-[90px] text-xs text-slate-500">{ar.archivedAt ? format(new Date(ar.archivedAt), "MMM dd, yy") : "-"}</TableCell>
                        <TableCell className="w-[80px] text-center">
                          <div className="flex gap-1 justify-center">
                            {isAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => restoreARMutation.mutate({ id: ar.id })} title="Restore">
                                <ArchiveRestore className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: ar, type: 'ar'})} title="Delete Permanently">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">No archived receivables</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          {apBatchSelection.selectedIds.length > 0 && (
            <TableBatchActions
              selectedIds={apBatchSelection.selectedIds}
              totalCount={apData?.length || 0}
              onSelectAll={apBatchSelection.toggleSelectAll}
              isLoading={bulkDeletingAP}
              onBulkDelete={() => {
                setBulkDeletingAP(true);
                bulkDeleteAPMutation.mutate({ ids: apBatchSelection.selectedIds.map(id => Number(id)) });
              }}
              onExport={() => {
                const selectedItems = apData?.filter((ap: any) => apBatchSelection.selectedIds.includes(String(ap.id))) || [];
                apBatchSelection.exportToCSV(selectedItems, 'ap-export');
              }}
            />
          )}
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
                      <TableHead className="w-8">
                        <input
                          type="checkbox"
                          checked={apBatchSelection.selectedIds.length === apData.filter((ap: any) => ap.status !== 'paid').length && apData.filter((ap: any) => ap.status !== 'paid').length > 0}
                          onChange={(e) => {
                            apBatchSelection.toggleSelectAll(e.target.checked);
                          }}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apData.filter((ap: any) => ap.status !== 'paid').slice(0, 10).map((ap: any) => (
                      <TableRow key={ap.id}>
                        <TableCell className="w-8">
                          <input
                            type="checkbox"
                            checked={apBatchSelection.selectedIds.includes(String(ap.id))}
                            onChange={(e) => {
                              apBatchSelection.toggleSelection(String(ap.id));
                            }}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell><button onClick={() => setEditingItem(ap)} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{ap.vendorName}</button></TableCell>
                        <TableCell><button onClick={() => setEditingItem(ap)} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{ap.invoiceNumber}</button></TableCell>
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
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(ap)} title="Edit">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => archiveAPMutation.mutate({ id: ap.id })} title="Archive">
                              <Archive className="w-4 h-4 text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: ap, type: 'ap'})} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
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

          {/* Archived Payables */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Archived Payables ({archivedAPData.length})</CardTitle>
                  <CardDescription>Previously archived accounts payable</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search archived..."
                    value={apSearchTerm}
                    onChange={(e) => setApSearchTerm(e.target.value)}
                    className="pl-8 h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {archivedAPData.length > 0 ? (
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="w-[140px] text-xs">Vendor</TableHead>
                      <TableHead className="w-[100px] text-xs">Invoice</TableHead>
                      <TableHead className="w-[90px] text-xs">Due Date</TableHead>
                      <TableHead className="w-[80px] text-xs">Status</TableHead>
                      <TableHead className="w-[100px] text-xs text-right">Amount</TableHead>
                      <TableHead className="w-[90px] text-xs">Archived</TableHead>
                      <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedAPData
                      .filter((ap: any) =>
                        ap.vendorName.toLowerCase().includes(apSearchTerm.toLowerCase()) ||
                        (ap.invoiceNumber && ap.invoiceNumber.toLowerCase().includes(apSearchTerm.toLowerCase()))
                      )
                      .map((ap: any, idx: number) => (
                      <TableRow key={ap.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <TableCell className="w-[140px] max-w-[140px] overflow-hidden">
                          <div className="text-xs line-clamp-2">{ap.vendorName}</div>
                        </TableCell>
                        <TableCell className="w-[100px] text-xs">{ap.invoiceNumber || "-"}</TableCell>
                        <TableCell className="w-[90px] text-xs">{ap.dueDate ? format(new Date(ap.dueDate), "MMM dd, yy") : "-"}</TableCell>
                        <TableCell className="w-[80px]">
                          <Badge variant="outline" className="text-[10px]">{ap.status}</Badge>
                        </TableCell>
                        <TableCell className="w-[100px] text-xs text-right font-medium">{formatCurrency(parseFloat(ap.amount || '0'), currency)}</TableCell>
                        <TableCell className="w-[90px] text-xs text-slate-500">{ap.archivedAt ? format(new Date(ap.archivedAt), "MMM dd, yy") : "-"}</TableCell>
                        <TableCell className="w-[80px] text-center">
                          <div className="flex gap-1 justify-center">
                            {isAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => restoreAPMutation.mutate({ id: ap.id })} title="Restore">
                                <ArchiveRestore className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: ap, type: 'ap'})} title="Delete Permanently">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">No archived payables</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        isOpen={deleteConfirm.show}
        title={`Delete ${deleteConfirm.type === 'ar' ? 'AR' : 'AP'} Record?`}
        description={`Are you sure you want to delete this ${deleteConfirm.type === 'ar' ? 'receivable' : 'payable'} record? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteConfirm.type === 'ar') {
            deleteARMutation.mutate({ id: deleteConfirm.item.id });
          } else {
            deleteAPMutation.mutate({ id: deleteConfirm.item.id });
          }
        }}
        onCancel={() => setDeleteConfirm({show: false, item: null, type: 'ar'})}
        isLoading={deleteARMutation.isPending || deleteAPMutation.isPending}
      />
    </div>
  );
}
