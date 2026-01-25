import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, TrendingDown, Settings, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currencyUtils";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProjectFinancialsProps {
  projectId: number;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectFinancials({ projectId, projectName, open, onOpenChange }: ProjectFinancialsProps) {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [typesDialogOpen, setTypesDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingType, setEditingType] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: transactions } = trpc.projects.getTransactions.useQuery({ projectId }, { enabled: open });
  const { data: summary } = trpc.projects.getFinancialSummary.useQuery({ projectId }, { enabled: open });
  const { data: transactionTypes } = trpc.transactionTypes.getAll.useQuery(undefined, { enabled: open });

  const createMutation = trpc.projects.createTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction added successfully");
      setTransactionDialogOpen(false);
      setEditingTransaction(null);
    },
  });

  const updateMutation = trpc.projects.updateTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction updated successfully");
      setTransactionDialogOpen(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = trpc.projects.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction deleted successfully");
    },
  });

  const createTypeMutation = trpc.transactionTypes.create.useMutation({
    onSuccess: () => {
      utils.transactionTypes.getAll.invalidate();
      toast.success("Transaction type created successfully");
      setEditingType(null);
    },
  });

  const updateTypeMutation = trpc.transactionTypes.update.useMutation({
    onSuccess: () => {
      utils.transactionTypes.getAll.invalidate();
      toast.success("Transaction type updated successfully");
      setEditingType(null);
    },
  });

  const deleteTypeMutation = trpc.transactionTypes.delete.useMutation({
    onSuccess: () => {
      utils.transactionTypes.getAll.invalidate();
      toast.success("Transaction type deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction type");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectId,
      transactionDate: formData.get("transactionDate") as string,
      transactionType: formData.get("transactionType") as string,
      amount: formData.get("amount") as string,
      currency: formData.get("currency") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, ...data } as any);
    } else {
      createMutation.mutate(data as any);
    }
  };

  const handleTypeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as "income" | "expense",
      description: formData.get("description") as string,
      color: formData.get("color") as string,
    };

    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, ...data });
    } else {
      createTypeMutation.mutate(data);
    }
  };

  const getTypeColor = (type: string) => {
    const typeObj = transactionTypes?.find(t => t.code === type);
    if (typeObj?.color) {
      return `bg-${typeObj.color}-100 text-${typeObj.color}-800 dark:bg-${typeObj.color}-900 dark:text-${typeObj.color}-300`;
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed inset-4 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-none max-h-none p-0 flex flex-col rounded-lg shadow-2xl">
          <DialogHeader className="px-8 py-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Project Financials - {projectName}</DialogTitle>
                <DialogDescription>Track all financial transactions, costs, and profitability</DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTypesDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Types
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-8 py-6 bg-background">
            {/* Financial Summary */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.totalRevenue, "BDT")}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary.totalCosts, "BDT")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Purchases: {formatCurrency(summary.totalPurchases, "BDT")}<br/>
                      Expenses: {formatCurrency(summary.totalExpenses, "BDT")}<br/>
                      COGS: {formatCurrency(summary.totalCOGS, "BDT")}<br/>
                      WACC: {formatCurrency(summary.totalWACC, "BDT")}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Profit/Loss</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold flex items-center gap-2 ${summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.profitLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      {formatCurrency(Math.abs(summary.profitLoss), "BDT")}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Profit Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.profitMargin.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transactions</h3>
                <Button onClick={() => { setEditingTransaction(null); setTransactionDialogOpen(true); }} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Add Transaction
                </Button>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium whitespace-nowrap">Date</th>
                      <th className="text-left p-3 text-sm font-medium whitespace-nowrap">Type</th>
                      <th className="text-left p-3 text-sm font-medium whitespace-nowrap">Description</th>
                      <th className="text-left p-3 text-sm font-medium whitespace-nowrap">Category</th>
                      <th className="text-right p-3 text-sm font-medium whitespace-nowrap">Amount</th>
                      <th className="text-center p-3 text-sm font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((transaction) => (
                      <tr key={transaction.id} className="border-t hover:bg-muted/50">
                        <td className="p-3 text-sm whitespace-nowrap">{format(new Date(transaction.transactionDate), "MMM dd, yyyy")}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge className={getTypeColor(transaction.transactionType)}>
                            {transactionTypes?.find(t => t.code === transaction.transactionType)?.name || transaction.transactionType.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm max-w-xs truncate">{transaction.description || "-"}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{transaction.category || "-"}</td>
                        <td className="p-3 text-sm text-right font-medium whitespace-nowrap">
                          {formatCurrency(Number(transaction.amount), transaction.currency)}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setEditingTransaction(transaction); setTransactionDialogOpen(true); }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                if (confirm("Delete this transaction?")) {
                                  deleteMutation.mutate({ id: transaction.id });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit" : "Add"} Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="transactionDate">Date</Label>
                <Input 
                  id="transactionDate" 
                  name="transactionDate" 
                  type="date"
                  defaultValue={editingTransaction?.transactionDate || new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transactionType">Type</Label>
                <Select name="transactionType" defaultValue={editingTransaction?.transactionType || ""} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {transactionTypes?.map(type => (
                      <SelectItem key={type.id} value={type.code}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingTransaction?.amount || ""}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select name="currency" defaultValue={editingTransaction?.currency || "BDT"} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Transaction description"
                defaultValue={editingTransaction?.description || ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  name="category" 
                  placeholder="e.g., Materials, Labor"
                  defaultValue={editingTransaction?.category || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input 
                  id="invoiceNumber" 
                  name="invoiceNumber" 
                  placeholder="e.g., INV-001"
                  defaultValue={editingTransaction?.invoiceNumber || ""}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTransaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Transaction Types Dialog */}
      <Dialog open={typesDialogOpen} onOpenChange={setTypesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Transaction Types</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add/Edit Type Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{editingType ? "Edit" : "Add New"} Transaction Type</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTypeSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="e.g., Consulting Fee"
                        defaultValue={editingType?.name}
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Code</Label>
                      <Input 
                        id="code" 
                        name="code" 
                        placeholder="e.g., consulting_fee"
                        defaultValue={editingType?.code}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={editingType?.category || "expense"} required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color</Label>
                      <Select name="color" defaultValue={editingType?.color || "gray"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      rows={2}
                      placeholder="Optional description"
                      defaultValue={editingType?.description}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingType ? "Update" : "Add"} Type
                    </Button>
                    {editingType && (
                      <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Existing Types List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Existing Transaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactionTypes?.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(type.code)}>{type.name}</Badge>
                          <span className="text-xs text-muted-foreground">({type.code})</span>
                          <Badge variant="outline" className="text-xs">
                            {type.category === "income" ? "Income" : "Expense"}
                          </Badge>
                          {type.isSystem && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingType(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!type.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete transaction type "${type.name}"?`)) {
                                deleteTypeMutation.mutate({ id: type.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
