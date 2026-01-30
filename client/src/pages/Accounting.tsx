import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Download, FileText, Receipt, Wallet, Clock, Search, RefreshCw, Eye, MoreHorizontal, Archive, RotateCcw, AlertTriangle, BookOpen, CreditCard, ArrowRightLeft, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart, Line } from "recharts";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function Accounting() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<"income" | "expenditure">("income");
  const [activeTab, setActiveTab] = useState("overview");
  const [transactionTab, setTransactionTab] = useState<"income" | "expense">("income");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showArchived, setShowArchived] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; item: any; type: 'archive' | 'delete' | 'permanent' }>({ show: false, item: null, type: 'archive' });
  const [viewingEntry, setViewingEntry] = useState<any>(null);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const utils = trpc.useUtils();
  const { currency } = useCurrency();
  const { data: allEntries = [] } = trpc.incomeExpenditure.getAll.useQuery();
  const { data: summary } = trpc.incomeExpenditure.getSummary.useQuery();
  const { data: incomeByCategory = [] } = trpc.incomeExpenditure.getIncomeByCategory.useQuery();
  const { data: expenditureByCategory = [] } = trpc.incomeExpenditure.getExpenditureByCategory.useQuery();
  const { data: balanceSheet } = trpc.financial.getBalanceSheet.useQuery();
  const { data: arData = [] } = trpc.financial.getAllAR.useQuery();
  const { data: apData = [] } = trpc.financial.getAllAP.useQuery();
  const { data: archivedEntries = [] } = trpc.incomeExpenditure.getArchived.useQuery();
  const { data: journalEntries = [] } = trpc.financial.getAllJournalEntries.useQuery();
  const { data: financialAccounts = [] } = trpc.financial.getAccounts.useQuery();

  const createMutation = trpc.incomeExpenditure.create.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry created successfully");
      setDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.incomeExpenditure.update.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry updated");
      setDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.incomeExpenditure.delete.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry deleted");
      setDeleteConfirm({ show: false, item: null, type: 'delete' });
    },
    onError: (error) => toast.error(error.message),
  });

  const archiveMutation = trpc.incomeExpenditure.archive.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getArchived.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry archived successfully");
      setDeleteConfirm({ show: false, item: null, type: 'archive' });
    },
    onError: (error) => toast.error(error.message),
  });

  const restoreMutation = trpc.incomeExpenditure.restore.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getArchived.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry restored successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const permanentDeleteMutation = trpc.incomeExpenditure.permanentlyDelete.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getArchived.invalidate();
      toast.success("Entry permanently deleted");
      setDeleteConfirm({ show: false, item: null, type: 'permanent' });
    },
    onError: (error) => toast.error(error.message),
  });

  const createJournalMutation = trpc.financial.createJournalEntry.useMutation({
    onSuccess: () => {
      utils.financial.getAllJournalEntries.invalidate();
      toast.success("Journal entry created successfully");
      setJournalDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const createAccountMutation = trpc.financial.createFinancialAccount.useMutation({
    onSuccess: () => {
      utils.financial.getAccounts.invalidate();
      utils.financial.getBalanceSheet.invalidate();
      toast.success("Account created successfully");
      setAccountDialogOpen(false);
      setEditingAccount(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateAccountBalanceMutation = trpc.financial.updateAccountBalance.useMutation({
    onSuccess: () => {
      utils.financial.getAccounts.invalidate();
      utils.financial.getBalanceSheet.invalidate();
      toast.success("Account balance updated");
      setAccountDialogOpen(false);
      setEditingAccount(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      date: formData.get("date") as string,
      type: formData.get("type") as "income" | "expenditure",
      category: formData.get("category") as string,
      subcategory: formData.get("subcategory") as string || undefined,
      amount: formData.get("amount") as string,
      currency: formData.get("currency") as string || currency,
      description: formData.get("description") as string || undefined,
      referenceNumber: formData.get("referenceNumber") as string || undefined,
      paymentMethod: formData.get("paymentMethod") as string || undefined,
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleJournalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createJournalMutation.mutate({
      entryNumber: formData.get("entryNumber") as string,
      entryDate: formData.get("entryDate") as string,
      description: formData.get("description") as string,
      reference: formData.get("reference") as string || undefined,
      debitAccountId: parseInt(formData.get("debitAccountId") as string),
      creditAccountId: parseInt(formData.get("creditAccountId") as string),
      amount: formData.get("amount") as string,
    });
  };

  const incomeEntries = allEntries?.filter((e: any) => e.type === "income") || [];
  const expenditureEntries = allEntries?.filter((e: any) => e.type === "expenditure") || [];

  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpenditure = Number(summary?.totalExpenditure || 0);
  const netPosition = totalIncome - totalExpenditure;

  const currentMonth = new Date();
  const currentMonthEntries = allEntries.filter((e: any) => {
    const entryDate = new Date(e.date);
    return entryDate >= startOfMonth(currentMonth) && entryDate <= endOfMonth(currentMonth);
  });
  const revenueMTD = currentMonthEntries.filter((e: any) => e.type === "income").reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
  const expenseMTD = currentMonthEntries.filter((e: any) => e.type === "expenditure").reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const pendingInvoices = arData.filter((ar: any) => ar.status === 'pending').length;

  const totalCash = balanceSheet?.assets?.currentAssets?.cash || 0;

  const chartOfAccountsData = useMemo(() => {
    if (!balanceSheet) return [];
    return [
      { name: 'Asset', value: Math.abs(balanceSheet.assets?.totalAssets || 0) },
      { name: 'Expense', value: Math.abs(totalExpenditure) },
      { name: 'Income', value: Math.abs(totalIncome) },
      { name: 'Liability', value: Math.abs(balanceSheet.liabilities?.totalLiabilities || 0) },
      { name: 'Equity', value: Math.abs(balanceSheet.equity?.totalEquity || 0) },
    ].filter(item => item.value > 0);
  }, [balanceSheet, totalIncome, totalExpenditure]);

  const last12MonthsData = useMemo(() => {
    const months: { month: string; income: number; expense: number; netProfit: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthIncome = allEntries
        .filter((e: any) => e.type === "income" && new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
        .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
      
      const monthExpense = allEntries
        .filter((e: any) => e.type === "expenditure" && new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
        .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
      
      months.push({
        month: format(date, 'MMM yy'),
        income: monthIncome,
        expense: monthExpense,
        netProfit: monthIncome - monthExpense,
      });
    }
    return months;
  }, [allEntries]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactionTab === "income" ? incomeEntries : expenditureEntries;
    
    if (searchTerm) {
      filtered = filtered.filter((e: any) => 
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter((e: any) => e.category === categoryFilter);
    }
    
    return filtered;
  }, [transactionTab, incomeEntries, expenditureEntries, searchTerm, categoryFilter]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allEntries.forEach((e: any) => {
      if (e.category) categories.add(e.category);
    });
    return Array.from(categories);
  }, [allEntries]);

  const netProfitMargin = totalIncome > 0 ? ((netPosition / totalIncome) * 100).toFixed(1) : "0";

  const getAccountName = (accountId: number) => {
    const account = financialAccounts.find((a: any) => a.id === accountId);
    return account ? `${account.accountCode} - ${account.accountName}` : `Account #${accountId}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">Comprehensive financial management and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-40"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            className="w-40"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Cash</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCash, currency)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Revenue MTD</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueMTD, currency)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Expense MTD</p>
                <p className="text-2xl font-bold">{formatCurrency(expenseMTD, currency)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Invoices</p>
                <p className="text-2xl font-bold">{pendingInvoices}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(netPosition, currency)}</p>
                <p className="text-xs opacity-80">{netProfitMargin}% margin</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="income-expense" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Income & Expense
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Entries
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-1">
                    {chartOfAccountsData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value, currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartOfAccountsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartOfAccountsData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income & Expense (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={last12MonthsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                    <Line type="monotone" dataKey="netProfit" stroke="#3b82f6" name="Net Profit" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs. Expense</CardTitle>
                <p className="text-sm text-muted-foreground">Entering vs. Outgoing/exiting compensation</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm">Income</span>
                    <span className="font-semibold">{formatCurrency(totalIncome, currency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-sm">Expense</span>
                    <span className="font-semibold">{formatCurrency(totalExpenditure, currency)}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last12MonthsData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Bar dataKey="income" fill="#22c55e" />
                    <Bar dataKey="expense" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("income-expense")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {allEntries.slice(0, 6).map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {entry.date ? format(new Date(entry.date), 'MMM dd') : '-'}
                          </span>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {entry.description || entry.category}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">{entry.category}</Badge>
                      </div>
                      <span className={`font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.type === 'income' ? '+' : '-'}{formatCurrency(Number(entry.amount || 0), currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income-expense" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Income & Expense Entries</h2>
            <Button onClick={() => { setEditingEntry(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={transactionTab} onValueChange={(v) => setTransactionTab(v as "income" | "expense")}>
                  <TabsList className="h-8">
                    <TabsTrigger value="income" className="text-xs px-3">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Income ({incomeEntries.length})
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="text-xs px-3">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Expense ({expenditureEntries.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 h-8 w-40"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">
                  Total {transactionTab === "income" ? "Income" : "Expense"}
                </span>
                <span className={`font-bold text-xl ${transactionTab === "income" ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(transactionTab === "income" ? totalIncome : totalExpenditure, currency)}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={entry.type === 'income' ? 'default' : 'destructive'}>
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.referenceNumber || '-'}</TableCell>
                      <TableCell className="capitalize">{entry.paymentMethod?.replace('_', ' ') || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.type === 'income' ? '+' : '-'}{formatCurrency(Number(entry.amount || 0), currency)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingEntry(entry)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingEntry(entry);
                              setEntryType(entry.type);
                              setDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-amber-600"
                              onClick={() => setDeleteConfirm({ show: true, item: entry, type: 'archive' })}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteConfirm({ show: true, item: entry, type: 'delete' })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No {transactionTab} entries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {archivedEntries.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Archived Entries</CardTitle>
                  <Badge variant="secondary">{archivedEntries.length}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
                  {showArchived ? "Hide" : "Show"} Archived
                </Button>
              </CardHeader>
              {showArchived && (
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Archived On</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedEntries.map((entry: any) => (
                        <TableRow key={entry.id} className="bg-muted/30">
                          <TableCell>{entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : '-'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{entry.description || '-'}</TableCell>
                          <TableCell>{entry.category}</TableCell>
                          <TableCell>
                            <Badge variant={entry.type === 'income' ? 'default' : 'destructive'}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(Number(entry.amount || 0), currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.archivedAt ? format(new Date(entry.archivedAt), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreMutation.mutate({ id: entry.id })}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeleteConfirm({ show: true, item: entry, type: 'permanent' })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Journal Entries</h2>
              <p className="text-sm text-muted-foreground">Double-entry accounting records from the database</p>
            </div>
            <Button onClick={() => setJournalDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Journal Entry
            </Button>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">How Journal Entries Work</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Journal entries record financial transactions using double-entry accounting. Each entry has a debit account and a credit account with equal amounts. These entries can be:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                    <li>Created manually for adjustments, accruals, and corrections</li>
                    <li>Auto-generated from other modules (Sales, Purchases, Payments)</li>
                    <li>Imported from external accounting systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Journal Entry Records
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{journalEntries.length} entries</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.length > 0 ? (
                    journalEntries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">{entry.entryNumber}</TableCell>
                        <TableCell>{entry.entryDate ? format(new Date(entry.entryDate), 'MMM dd, yyyy') : '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                        <TableCell className="text-sm">{getAccountName(entry.debitAccountId)}</TableCell>
                        <TableCell className="text-sm">{getAccountName(entry.creditAccountId)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(Number(entry.amount || 0), currency)}</TableCell>
                        <TableCell>
                          <Badge variant={entry.isPosted ? "default" : "secondary"}>
                            {entry.isPosted ? "Posted" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{entry.reference || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No journal entries yet</p>
                        <p className="text-sm">Create your first journal entry to start tracking double-entry transactions</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab - Chart of Accounts Management */}
        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Accounting Settings</h2>
              <p className="text-muted-foreground">Manage Chart of Accounts and categories</p>
            </div>
            <Button onClick={() => { setEditingAccount(null); setAccountDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chart of Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subtype</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialAccounts.length > 0 ? (
                    financialAccounts.map((account: any) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.accountCode}</TableCell>
                        <TableCell className="font-medium">{account.accountName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            account.accountType === 'asset' ? 'bg-blue-50 text-blue-700' :
                            account.accountType === 'liability' ? 'bg-red-50 text-red-700' :
                            account.accountType === 'equity' ? 'bg-purple-50 text-purple-700' :
                            account.accountType === 'revenue' ? 'bg-green-50 text-green-700' :
                            'bg-orange-50 text-orange-700'
                          }>
                            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground capitalize">
                          {account.accountSubtype?.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(account.balance || '0'), currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingAccount(account);
                              setAccountDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No accounts configured yet</p>
                        <p className="text-sm">Add your first account to get started</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingEntry(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
            <DialogDescription>
              Record income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select 
                    name="type" 
                    defaultValue={editingEntry?.type || "income"}
                    onValueChange={(value) => setEntryType(value as "income" | "expenditure")}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expenditure">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    defaultValue={editingEntry?.date ? format(new Date(editingEntry.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={editingEntry?.category}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {entryType === "income" ? (
                        <>
                          <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                          <SelectItem value="Service Revenue">Service Revenue</SelectItem>
                          <SelectItem value="Investment Income">Investment Income</SelectItem>
                          <SelectItem value="Other Income">Other Income</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                          <SelectItem value="Salaries">Salaries</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Other Expense">Other Expense</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={editingEntry?.amount}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="referenceNumber">Reference / Invoice Number</Label>
                  <Input 
                    id="referenceNumber" 
                    name="referenceNumber" 
                    placeholder="e.g., INV-2026-001"
                    defaultValue={editingEntry?.referenceNumber}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select name="paymentMethod" defaultValue={editingEntry?.paymentMethod || "bank_transfer"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Enter transaction details..."
                  defaultValue={editingEntry?.description}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEntry ? "Update" : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Journal Entry</DialogTitle>
            <DialogDescription>
              Record a double-entry accounting transaction
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJournalSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="entryNumber">Entry Number *</Label>
                  <Input 
                    id="entryNumber" 
                    name="entryNumber" 
                    placeholder="JE-2026-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entryDate">Date *</Label>
                  <Input 
                    id="entryDate" 
                    name="entryDate" 
                    type="date" 
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="debitAccountId">Debit Account *</Label>
                  <Select name="debitAccountId" required>
                    <SelectTrigger><SelectValue placeholder="Select debit account" /></SelectTrigger>
                    <SelectContent>
                      {financialAccounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountCode} - {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditAccountId">Credit Account *</Label>
                  <Select name="creditAccountId" required>
                    <SelectTrigger><SelectValue placeholder="Select credit account" /></SelectTrigger>
                    <SelectContent>
                      {financialAccounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountCode} - {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input 
                    id="reference" 
                    name="reference" 
                    placeholder="e.g., INV-001, PO-001"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the journal entry..."
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJournalDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createJournalMutation.isPending}>
                {createJournalMutation.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm.show} onOpenChange={(open) => !open && setDeleteConfirm({ show: false, item: null, type: 'archive' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${deleteConfirm.type === 'permanent' ? 'text-red-500' : 'text-amber-500'}`} />
              {deleteConfirm.type === 'archive' ? 'Archive Entry' : deleteConfirm.type === 'delete' ? 'Delete Entry' : 'Permanently Delete Entry'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'archive' ? (
                <>This entry will be moved to the archive. You can restore it later if needed.</>
              ) : deleteConfirm.type === 'delete' ? (
                <>Are you sure you want to delete this entry? This action cannot be undone.</>
              ) : (
                <>This will permanently delete the entry from the system. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={deleteConfirm.type === 'permanent' || deleteConfirm.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
              onClick={() => {
                if (deleteConfirm.item) {
                  if (deleteConfirm.type === 'archive') {
                    archiveMutation.mutate({ id: deleteConfirm.item.id });
                  } else if (deleteConfirm.type === 'delete') {
                    deleteMutation.mutate({ id: deleteConfirm.item.id });
                  } else {
                    permanentDeleteMutation.mutate({ id: deleteConfirm.item.id });
                  }
                }
              }}
              disabled={archiveMutation.isPending || deleteMutation.isPending || permanentDeleteMutation.isPending}
            >
              {deleteConfirm.type === 'archive' ? 'Archive' : deleteConfirm.type === 'delete' ? 'Delete' : 'Permanently Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
          </DialogHeader>
          {viewingEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">
                    <Badge variant={viewingEntry.type === 'income' ? 'default' : 'destructive'}>
                      {viewingEntry.type === 'income' ? 'Income' : 'Expense'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{viewingEntry.date ? format(new Date(viewingEntry.date), 'MMMM dd, yyyy') : '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{viewingEntry.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className={`font-bold text-lg ${viewingEntry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {viewingEntry.type === 'income' ? '+' : '-'}{formatCurrency(Number(viewingEntry.amount || 0), currency)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Reference Number</Label>
                  <p className="font-medium">{viewingEntry.referenceNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">{viewingEntry.paymentMethod?.replace('_', ' ') || '-'}</p>
                </div>
              </div>
              {viewingEntry.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{viewingEntry.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">Created</Label>
                  <p className="text-sm">{viewingEntry.createdAt ? format(new Date(viewingEntry.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Last Updated</Label>
                  <p className="text-sm">{viewingEntry.updatedAt ? format(new Date(viewingEntry.updatedAt), 'MMM dd, yyyy HH:mm') : '-'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEntry(null)}>Close</Button>
            <Button onClick={() => {
              setEditingEntry(viewingEntry);
              setEntryType(viewingEntry.type);
              setViewingEntry(null);
              setDialogOpen(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Management Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={(open) => {
        setAccountDialogOpen(open);
        if (!open) setEditingAccount(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update account details' : 'Add a new account to the Chart of Accounts'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            if (editingAccount) {
              updateAccountBalanceMutation.mutate({
                accountId: editingAccount.id,
                balance: formData.get('balance') as string || '0',
              });
            } else {
              createAccountMutation.mutate({
                accountCode: formData.get('accountCode') as string,
                accountName: formData.get('accountName') as string,
                accountType: formData.get('accountType') as any,
                accountSubtype: formData.get('accountSubtype') as any,
                balance: formData.get('balance') as string || '0',
                description: formData.get('description') as string || undefined,
              });
            }
          }}>
            <div className="grid gap-4 py-4">
              {!editingAccount && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="accountCode">Account Code *</Label>
                      <Input 
                        id="accountCode" 
                        name="accountCode" 
                        placeholder="e.g., 1001"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountName">Account Name *</Label>
                      <Input 
                        id="accountName" 
                        name="accountName" 
                        placeholder="e.g., Cash on Hand"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="accountType">Account Type *</Label>
                      <Select name="accountType" defaultValue="asset" required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountSubtype">Subtype *</Label>
                      <Select name="accountSubtype" defaultValue="cash" required>
                        <SelectTrigger><SelectValue placeholder="Select subtype" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="deposits">Deposits</SelectItem>
                          <SelectItem value="accounts_receivable">Accounts Receivable</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="fixed_assets">Fixed Assets</SelectItem>
                          <SelectItem value="accounts_payable">Accounts Payable</SelectItem>
                          <SelectItem value="wages_payable">Wages Payable</SelectItem>
                          <SelectItem value="taxes_payable">Taxes Payable</SelectItem>
                          <SelectItem value="provisions">Provisions</SelectItem>
                          <SelectItem value="other_payable">Other Payable</SelectItem>
                          <SelectItem value="common_stock">Common Stock</SelectItem>
                          <SelectItem value="retained_earnings">Retained Earnings</SelectItem>
                          <SelectItem value="sales_revenue">Sales Revenue</SelectItem>
                          <SelectItem value="service_revenue">Service Revenue</SelectItem>
                          <SelectItem value="cost_of_goods_sold">Cost of Goods Sold</SelectItem>
                          <SelectItem value="operating_expenses">Operating Expenses</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label htmlFor="balance">{editingAccount ? 'Update Balance' : 'Opening Balance'}</Label>
                <Input 
                  id="balance" 
                  name="balance" 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingAccount?.balance || ''}
                />
              </div>
              {!editingAccount && (
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Optional account description"
                    rows={2}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAccountMutation.isPending || updateAccountBalanceMutation.isPending}>
                {editingAccount ? 'Update Balance' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
