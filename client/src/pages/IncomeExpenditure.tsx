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
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Download } from "lucide-react";
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
              <div className="space-y-3">
                {incomeCategoryData.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{cat.category.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{formatCurrency(cat.total, currency)}</span>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {expenditureCategoryData.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{cat.category.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{formatCurrency(cat.total, currency)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No expenditure entries yet</p>
            )}
          </CardContent>
        </Card>
      </div>

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
                        <TableCell>{entry.referenceNumber || "-"}</TableCell>
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
                        <TableCell>{entry.referenceNumber || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description || "-"}</TableCell>
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
                        <TableCell>{entry.referenceNumber || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description || "-"}</TableCell>
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
