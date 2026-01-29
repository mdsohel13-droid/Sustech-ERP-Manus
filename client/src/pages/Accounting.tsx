import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Download, FileText, Receipt, Wallet, Clock, Search, Filter, RefreshCw, Eye, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from "recharts";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  const utils = trpc.useUtils();
  const { currency } = useCurrency();
  const { data: allEntries = [] } = trpc.incomeExpenditure.getAll.useQuery();
  const { data: summary } = trpc.incomeExpenditure.getSummary.useQuery();
  const { data: incomeByCategory = [] } = trpc.incomeExpenditure.getIncomeByCategory.useQuery();
  const { data: expenditureByCategory = [] } = trpc.incomeExpenditure.getExpenditureByCategory.useQuery();
  const { data: balanceSheet } = trpc.financial.getBalanceSheet.useQuery();
  const { data: arData = [] } = trpc.financial.getAllAR.useQuery();
  const { data: apData = [] } = trpc.financial.getAllAP.useQuery();

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive financial overview and analytics</p>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Journal Entries & Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Income / Expense" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account / Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEntries.slice(0, 10).map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === 'income' ? 'default' : 'destructive'}>
                      {entry.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.referenceNumber || '-'}</TableCell>
                  <TableCell className={`text-right font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(Number(entry.amount || 0), currency)}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Verified
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingEntry(entry);
                          setEntryType(entry.type);
                          setDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this entry?")) {
                              deleteMutation.mutate({ id: entry.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              <CardTitle>Transactions</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={transactionTab} onValueChange={(v) => setTransactionTab(v as "income" | "expense")}>
                <TabsList className="h-8">
                  <TabsTrigger value="income" className="text-xs px-3">Income</TabsTrigger>
                  <TabsTrigger value="expense" className="text-xs px-3">Expense</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 h-8 w-32"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-muted-foreground">
                {transactionTab === "income" ? "Income" : "Expense"}
              </span>
              <span className="font-semibold text-lg">
                {formatCurrency(transactionTab === "income" ? totalIncome : totalExpenditure, currency)}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredTransactions.slice(0, 8).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : '-'}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {entry.description || entry.category}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">{entry.category}</Badge>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Number(entry.amount || 0), currency)}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => {
                      setEditingEntry(entry);
                      setEntryType(entry.type);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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

      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        size="icon"
        onClick={() => {
          setEditingEntry(null);
          setEntryType("expenditure");
          setDialogOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
