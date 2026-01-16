import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
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
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: transactions } = trpc.projects.getTransactions.useQuery({ projectId }, { enabled: open });
  const { data: summary } = trpc.projects.getFinancialSummary.useQuery({ projectId }, { enabled: open });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectId,
      transactionDate: formData.get("transactionDate") as string,
      transactionType: formData.get("transactionType") as "revenue" | "purchase" | "expense" | "cogs" | "wacc",
      amount: formData.get("amount") as string,
      currency: formData.get("currency") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "revenue": return "bg-green-100 text-green-800";
      case "purchase": return "bg-blue-100 text-blue-800";
      case "expense": return "bg-orange-100 text-orange-800";
      case "cogs": return "bg-purple-100 text-purple-800";
      case "wacc": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Financials - {projectName}</DialogTitle>
          <DialogDescription>Track all financial transactions, costs, and profitability</DialogDescription>
        </DialogHeader>

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

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-sm font-medium">Description</th>
                  <th className="text-left p-3 text-sm font-medium">Category</th>
                  <th className="text-right p-3 text-sm font-medium">Amount</th>
                  <th className="text-center p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((transaction) => (
                  <tr key={transaction.id} className="border-t hover:bg-muted/50">
                    <td className="p-3 text-sm">{format(new Date(transaction.transactionDate), "MMM dd, yyyy")}</td>
                    <td className="p-3">
                      <Badge className={getTypeColor(transaction.transactionType)}>
                        {transaction.transactionType.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{transaction.description || "-"}</td>
                    <td className="p-3 text-sm">{transaction.category || "-"}</td>
                    <td className="p-3 text-sm text-right font-medium">
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </td>
                    <td className="p-3 text-center">
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
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No transactions yet. Add your first transaction to start tracking project financials.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Dialog */}
        <Dialog open={transactionDialogOpen} onOpenChange={(open) => { setTransactionDialogOpen(open); if (!open) setEditingTransaction(null); }}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Edit" : "Add"} Transaction</DialogTitle>
                <DialogDescription>Record a financial transaction for this project</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="transactionDate">Date</Label>
                  <Input 
                    id="transactionDate" 
                    name="transactionDate" 
                    type="date" 
                    defaultValue={editingTransaction?.transactionDate ? format(new Date(editingTransaction.transactionDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select name="transactionType" defaultValue={editingTransaction?.transactionType || "expense"} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="cogs">COGS (Cost of Goods Sold)</SelectItem>
                      <SelectItem value="wacc">WACC (Weighted Avg Cost of Capital)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      defaultValue={editingTransaction?.amount}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue={editingTransaction?.currency || "BDT"}>
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
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    placeholder="e.g., Solar Panels, Labor, Equipment"
                    defaultValue={editingTransaction?.category}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input 
                    id="invoiceNumber" 
                    name="invoiceNumber" 
                    placeholder="Optional"
                    defaultValue={editingTransaction?.invoiceNumber}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={3}
                    placeholder="Transaction details"
                    defaultValue={editingTransaction?.description}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTransaction ? (updateMutation.isPending ? "Updating..." : "Update Transaction") : (createMutation.isPending ? "Adding..." : "Add Transaction")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
