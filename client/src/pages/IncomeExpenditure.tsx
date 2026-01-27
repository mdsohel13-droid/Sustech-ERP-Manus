import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Download, Paperclip, Target, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

export default function IncomeExpenditure() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<"income" | "expenditure">("income");

  const utils = trpc.useUtils();
  const { currency } = useCurrency();
  const { data: allEntries } = trpc.incomeExpenditure.getAll.useQuery();
  const { data: summary } = trpc.incomeExpenditure.getSummary.useQuery();
  const { data: incomeByCategory } = trpc.incomeExpenditure.getIncomeByCategory.useQuery();
  const { data: expenditureByCategory } = trpc.incomeExpenditure.getExpenditureByCategory.useQuery();

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
  });

  const deleteMutation = trpc.incomeExpenditure.delete.useMutation({
    onSuccess: () => {
      utils.incomeExpenditure.getAll.invalidate();
      utils.incomeExpenditure.getSummary.invalidate();
      utils.incomeExpenditure.getIncomeByCategory.invalidate();
      utils.incomeExpenditure.getExpenditureByCategory.invalidate();
      toast.success("Entry deleted");
    },
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

  const incomeEntries = allEntries?.filter(e => e.type === "income") || [];
  const expenditureEntries = allEntries?.filter(e => e.type === "expenditure") || [];

  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpenditure = Number(summary?.totalExpenditure || 0);
  const netPosition = Number(summary?.netPosition || 0);

  const incomeCategoryData = incomeByCategory || [];
  const expenditureCategoryData = expenditureByCategory || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Income & Expenditure
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive financial tracking and cash flow management
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
              <DialogDescription>
                Record income or expenditure transaction
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
                        <SelectItem value="expenditure">Expenditure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      name="date" 
                      type="date" 
                      required 
                      defaultValue={editingEntry?.date ? format(new Date(editingEntry.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" defaultValue={editingEntry?.category || ""}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {entryType === "income" ? (
                          <>
                            <SelectItem value="sales_product">Sales - Products</SelectItem>
                            <SelectItem value="sales_service">Sales - Services</SelectItem>
                            <SelectItem value="project_revenue">Project Revenue</SelectItem>
                            <SelectItem value="consulting">Consulting Fees</SelectItem>
                            <SelectItem value="other_income">Other Income</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="salary">Salary & Wages</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="professional_fees">Professional Fees</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="taxes">Taxes</SelectItem>
                            <SelectItem value="other_expense">Other Expenses</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input 
                      id="subcategory" 
                      name="subcategory" 
                      placeholder="Optional" 
                      defaultValue={editingEntry?.subcategory || ""}
                    />
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
                      required 
                      defaultValue={editingEntry?.amount || ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue={editingEntry?.currency || currency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input 
                      id="referenceNumber" 
                      name="referenceNumber" 
                      placeholder="Invoice/Receipt #" 
                      defaultValue={editingEntry?.referenceNumber || ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select name="paymentMethod" defaultValue={editingEntry?.paymentMethod || ""}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={3} 
                    placeholder="Additional details..." 
                    defaultValue={editingEntry?.description || ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label><Paperclip className="h-4 w-4 inline mr-1" />Attachments</Label>
                  <AttachmentUpload entityType="income_expenditure" entityId={editingEntry?.id || 0} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingEntry ? (updateMutation.isPending ? "Updating..." : "Update Entry") : (createMutation.isPending ? "Creating..." : "Create Entry")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Total Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All revenue streams
            </p>
          </CardContent>
        </Card>

        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Total Expenditure</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalExpenditure, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All expenses
            </p>
          </CardContent>
        </Card>

        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Net Cash Flow</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netPosition, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Income minus expenditure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="editorial-card">
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
            <CardDescription>Revenue breakdown by source</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategoryData.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {incomeCategoryData.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{cat.category.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{formatCurrency(cat.total, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeCategoryData.map((cat) => ({
                        name: cat.category.replace(/_/g, " "),
                        amount: cat.total,
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, currency)}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No income entries yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader>
            <CardTitle>Expenditure by Category</CardTitle>
            <CardDescription>Expense breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            {expenditureCategoryData.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {expenditureCategoryData.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{cat.category.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{formatCurrency(cat.total, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenditureCategoryData.map((cat) => ({
                        name: cat.category.replace(/_/g, " "),
                        amount: cat.total,
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, currency)}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No expenditure entries yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Tracking Section */}
      <BudgetTrackingSection 
        incomeCategoryData={incomeCategoryData}
        expenditureCategoryData={expenditureCategoryData}
        currency={currency}
      />

      {/* Transaction Tables */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>Complete financial record</CardDescription>
                </div>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries && allEntries.length > 0 ? (
                    allEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date ? format(new Date(entry.date), "MMM dd, yyyy") : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === "income" ? "default" : "destructive"}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{entry.category.replace(/_/g, " ")}</TableCell>
                        <TableCell className={entry.type === "income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          {formatCurrency(entry.amount, entry.currency || currency)}
                        </TableCell>
                        <TableCell><button onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{entry.referenceNumber || "-"}</button></TableCell>
                        <TableCell className="capitalize">{entry.paymentMethod?.replace(/_/g, " ") || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteMutation.mutate({ id: entry.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No transactions yet. Click "Add Entry" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Income Transactions</CardTitle>
              <CardDescription>All revenue entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeEntries.length > 0 ? (
                    incomeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date ? format(new Date(entry.date), "MMM dd, yyyy") : "-"}</TableCell>
                        <TableCell className="capitalize">{entry.category.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {formatCurrency(entry.amount, entry.currency || currency)}
                        </TableCell>
                        <TableCell><button onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{entry.referenceNumber || "-"}</button></TableCell>
                        <TableCell className="max-w-xs truncate"><button onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{entry.description || "-"}</button></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingEntry(entry); setEntryType("income"); setDialogOpen(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteMutation.mutate({ id: entry.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No income entries yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenditure">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Expenditure Transactions</CardTitle>
              <CardDescription>All expense entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenditureEntries.length > 0 ? (
                    expenditureEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date ? format(new Date(entry.date), "MMM dd, yyyy") : "-"}</TableCell>
                        <TableCell className="capitalize">{entry.category.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {formatCurrency(entry.amount, entry.currency || currency)}
                        </TableCell>
                        <TableCell><button onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{entry.referenceNumber || "-"}</button></TableCell>
                        <TableCell className="max-w-xs truncate"><button onClick={() => { setEditingEntry(entry); setEntryType(entry.type); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{entry.description || "-"}</button></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingEntry(entry); setEntryType("expenditure"); setDialogOpen(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteMutation.mutate({ id: entry.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No expenditure entries yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Budget Tracking Component
function BudgetTrackingSection({ incomeCategoryData, expenditureCategoryData, currency }: {
  incomeCategoryData: Array<{ category: string; total: number }>;
  expenditureCategoryData: Array<{ category: string; total: number }>;
  currency: string;
}) {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const utils = trpc.useUtils();
  const { data: budgets } = trpc.budget.getByMonthYear.useQuery({ monthYear: selectedMonth });

  const createBudgetMutation = trpc.budget.create.useMutation({
    onSuccess: () => {
      utils.budget.getByMonthYear.invalidate();
      toast.success("Budget created successfully");
      setBudgetDialogOpen(false);
      setEditingBudget(null);
    },
  });

  const updateBudgetMutation = trpc.budget.update.useMutation({
    onSuccess: () => {
      utils.budget.getByMonthYear.invalidate();
      toast.success("Budget updated");
      setBudgetDialogOpen(false);
      setEditingBudget(null);
    },
  });

  const deleteBudgetMutation = trpc.budget.delete.useMutation({
    onSuccess: () => {
      utils.budget.getByMonthYear.invalidate();
      toast.success("Budget deleted");
    },
  });

  const handleBudgetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      monthYear: selectedMonth,
      type: formData.get("type") as "income" | "expenditure",
      category: formData.get("category") as string,
      budgetAmount: formData.get("budgetAmount") as string,
      currency: formData.get("currency") as string || currency,
      notes: formData.get("notes") as string || undefined,
    };

    if (editingBudget) {
      updateBudgetMutation.mutate({ id: editingBudget.id, budgetAmount: data.budgetAmount, notes: data.notes });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  // Calculate budget vs actual
  const budgetComparison = budgets?.map((budget) => {
    const actualData = budget.type === "income" ? incomeCategoryData : expenditureCategoryData;
    const actual = actualData.find((item) => item.category === budget.category)?.total || 0;
    const budgetAmount = Number(budget.budgetAmount);
    const percentage = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;

    return {
      ...budget,
      actual,
      budgetAmount,
      percentage,
      status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
    };
  }) || [];

  return (
    <Card className="editorial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Tracking
            </CardTitle>
            <CardDescription>Set and monitor monthly budgets for income and expenditure categories</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-40"
            />
            <Dialog open={budgetDialogOpen} onOpenChange={(open) => {
              setBudgetDialogOpen(open);
              if (!open) setEditingBudget(null);
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? "Edit Budget" : "Set New Budget"}</DialogTitle>
                  <DialogDescription>
                    Define budget limits for {selectedMonth}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBudgetSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget-type">Type *</Label>
                      <Select name="type" defaultValue={editingBudget?.type || "expenditure"} disabled={!!editingBudget}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expenditure">Expenditure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget-category">Category *</Label>
                      <Input
                        id="budget-category"
                        name="category"
                        required
                        disabled={!!editingBudget}
                        defaultValue={editingBudget?.category || ""}
                        placeholder="e.g., salary, equipment, sales_product"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budgetAmount">Budget Amount *</Label>
                      <Input
                        id="budgetAmount"
                        name="budgetAmount"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={editingBudget?.budgetAmount || ""}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget-currency">Currency</Label>
                      <Select name="currency" defaultValue={editingBudget?.currency || currency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BDT">BDT (৳)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="CNY">CNY (¥)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget-notes">Notes</Label>
                      <Textarea
                        id="budget-notes"
                        name="notes"
                        rows={2}
                        defaultValue={editingBudget?.notes || ""}
                        placeholder="Optional notes about this budget"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}>
                      {editingBudget ? (updateBudgetMutation.isPending ? "Updating..." : "Update Budget") : (createBudgetMutation.isPending ? "Creating..." : "Create Budget")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {budgetComparison.length > 0 ? (
          <div className="space-y-4">
            {budgetComparison.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === "income" ? "default" : "destructive"}>
                      {item.type}
                    </Badge>
                    <span className="font-medium capitalize">{item.category.replace(/_/g, " ")}</span>
                    {item.status === "exceeded" && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {item.status === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingBudget(item); setBudgetDialogOpen(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this budget?")) {
                          deleteBudgetMutation.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget: {formatCurrency(item.budgetAmount, item.currency || currency)}</span>
                    <span>Actual: {formatCurrency(item.actual, item.currency || currency)}</span>
                    <span className={item.percentage >= 100 ? "text-red-600 font-semibold" : item.percentage >= 80 ? "text-yellow-600 font-semibold" : "text-green-600"}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.percentage >= 100 ? "bg-red-500" :
                        item.percentage >= 80 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No budgets set for {selectedMonth}</p>
            <p className="text-sm">Click "Set Budget" to create your first budget</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
