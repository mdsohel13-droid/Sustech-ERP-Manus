import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, DollarSign, TrendingUp, TrendingDown, Settings, Edit, Trash2, X, Receipt, CreditCard, FileText, ArrowUpRight, Wallet, Building, BookOpen, Link2, ExternalLink, Archive, ArchiveRestore, Search, ChevronDown, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [typesDialogOpen, setTypesDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingType, setEditingType] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [linkARDialogOpen, setLinkARDialogOpen] = useState(false);
  const [linkAPDialogOpen, setLinkAPDialogOpen] = useState(false);
  const [txnSearchTerm, setTxnSearchTerm] = useState("");

  const [txnType, setTxnType] = useState("");
  const [txnCurrency, setTxnCurrency] = useState("BDT");
  const [typeCategory, setTypeCategory] = useState<"income" | "expense">("expense");
  const [typeColor, setTypeColor] = useState("gray");
  const [arCurrency, setArCurrency] = useState("BDT");
  const [apCurrency, setApCurrency] = useState("BDT");

  const utils = trpc.useUtils();
  const { data: transactions } = trpc.projects.getTransactions.useQuery({ projectId }, { enabled: open });
  const { data: archivedTransactions = [] } = trpc.projects.getArchivedTransactions.useQuery({ projectId }, { enabled: open });
  const { data: summary } = trpc.projects.getFinancialSummary.useQuery({ projectId }, { enabled: open });
  const { data: transactionTypes } = trpc.transactionTypes.getAll.useQuery(undefined, { enabled: open });
  
  const { data: allAR = [] } = trpc.financial.getAllAR.useQuery(undefined, { enabled: open });
  const { data: allAP = [] } = trpc.financial.getAllAP.useQuery(undefined, { enabled: open });
  const { data: archivedARData = [] } = trpc.financial.getArchivedAR.useQuery(undefined, { enabled: open });
  const { data: archivedAPData = [] } = trpc.financial.getArchivedAP.useQuery(undefined, { enabled: open });
  const { data: journalEntries = [] } = trpc.financial.getAllJournalEntries.useQuery(undefined, { enabled: open });

  const linkedAR = allAR.filter((ar: any) => 
    ar.notes?.toLowerCase().includes(projectName.toLowerCase()) ||
    ar.invoiceNumber?.toLowerCase().includes(projectName.toLowerCase().substring(0, 10))
  );

  const linkedAP = allAP.filter((ap: any) => 
    ap.notes?.toLowerCase().includes(projectName.toLowerCase()) ||
    ap.invoiceNumber?.toLowerCase().includes(projectName.toLowerCase().substring(0, 10))
  );

  const linkedJournals = journalEntries.filter((entry: any) =>
    entry.description?.toLowerCase().includes(projectName.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(projectName.toLowerCase().substring(0, 10))
  );

  const createMutation = trpc.projects.createTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction added successfully");
      setTransactionDialogOpen(false);
      setEditingTransaction(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add transaction");
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
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });

  const deleteMutation = trpc.projects.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getArchivedTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction deleted successfully");
    },
  });

  const archiveTransactionMutation = trpc.projects.archiveTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getArchivedTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction archived successfully");
    },
    onError: () => toast.error("Failed to archive transaction"),
  });

  const restoreTransactionMutation = trpc.projects.restoreTransaction.useMutation({
    onSuccess: () => {
      utils.projects.getTransactions.invalidate({ projectId });
      utils.projects.getArchivedTransactions.invalidate({ projectId });
      utils.projects.getFinancialSummary.invalidate({ projectId });
      toast.success("Transaction restored successfully");
    },
    onError: () => toast.error("Failed to restore transaction"),
  });

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

  const updateARStatusMutation = trpc.financial.updateAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      toast.success("Receivable status updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update status"),
  });

  const updateAPStatusMutation = trpc.financial.updateAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      toast.success("Payable status updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update status"),
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

  const createARMutation = trpc.financial.createAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      toast.success("Accounts Receivable entry created and linked");
      setLinkARDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const createAPMutation = trpc.financial.createAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      toast.success("Accounts Payable entry created and linked");
      setLinkAPDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectId,
      transactionDate: formData.get("transactionDate") as string,
      transactionType: txnType,
      amount: formData.get("amount") as string,
      currency: txnCurrency,
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

  const openTransactionDialog = (transaction?: any) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTxnType(transaction.transactionType || "");
      setTxnCurrency(transaction.currency || "BDT");
    } else {
      setEditingTransaction(null);
      setTxnType("");
      setTxnCurrency("BDT");
    }
    setTransactionDialogOpen(true);
  };

  const handleTypeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: typeCategory,
      description: formData.get("description") as string,
      color: typeColor,
    };

    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, ...data });
    } else {
      createTypeMutation.mutate(data);
    }
  };

  const openEditType = (type: any) => {
    setEditingType(type);
    setTypeCategory(type.category || "expense");
    setTypeColor(type.color || "gray");
  };

  const clearEditType = () => {
    setEditingType(null);
    setTypeCategory("expense");
    setTypeColor("gray");
  };

  const handleARSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createARMutation.mutate({
      customerName: formData.get("customerName") as string,
      amount: formData.get("amount") as string,
      dueDate: formData.get("dueDate") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      notes: `Project: ${projectName} | Currency: ${arCurrency}\n${formData.get("notes") || ""}`,
    });
  };

  const handleAPSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAPMutation.mutate({
      vendorName: formData.get("vendorName") as string,
      amount: formData.get("amount") as string,
      dueDate: formData.get("dueDate") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      notes: `Project: ${projectName} | Currency: ${apCurrency}\n${formData.get("notes") || ""}`,
    });
  };

  const openARDialog = () => {
    setArCurrency("BDT");
    setLinkARDialogOpen(true);
  };

  const openAPDialog = () => {
    setApCurrency("BDT");
    setLinkAPDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    const typeObj = transactionTypes?.find(t => t.code === type);
    if (typeObj?.color) {
      return `bg-${typeObj.color}-100 text-${typeObj.color}-800 dark:bg-${typeObj.color}-900 dark:text-${typeObj.color}-300`;
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-background rounded-lg shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b bg-background sticky top-0 z-10">
            <div className="flex-1">
              <h2 className="text-3xl font-bold">Project AC & Financials</h2>
              <p className="text-sm text-muted-foreground mt-1">{projectName} - Integrated Accounts, Finance & Transaction Management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setTypesDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Types
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-8 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="receivables" className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Receivables ({linkedAR.length})
                </TabsTrigger>
                <TabsTrigger value="payables" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payables ({linkedAP.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {formatCurrency(summary.totalRevenue, "BDT")}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          Total Costs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {formatCurrency(summary.totalCosts, "BDT")}
                        </div>
                        <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                          Purchases: {formatCurrency(summary.totalPurchases, "BDT")}<br/>
                          Expenses: {formatCurrency(summary.totalExpenses, "BDT")}<br/>
                          COGS: {formatCurrency(summary.totalCOGS, "BDT")}<br/>
                          WACC: {formatCurrency(summary.totalWACC, "BDT")}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`bg-gradient-to-br ${summary.profitLoss >= 0 ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200' : 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200'}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-sm flex items-center gap-2 ${summary.profitLoss >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'}`}>
                          <DollarSign className="h-4 w-4" />
                          Profit/Loss
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold flex items-center gap-2 ${summary.profitLoss >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'}`}>
                          {summary.profitLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          {formatCurrency(Math.abs(summary.profitLoss), "BDT")}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Profit Margin
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-purple-700 dark:text-purple-300' : 'text-orange-700'}`}>
                          {summary.profitMargin.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Quick Links
                      </CardTitle>
                      <CardDescription>Navigate to related modules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/accounting">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Open Accounting Module
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/finance">
                          <Building className="h-4 w-4 mr-2" />
                          Open Finance Module
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Integration Summary
                      </CardTitle>
                      <CardDescription>Linked records from other modules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span>Accounts Receivable</span>
                          </div>
                          <Badge variant="secondary">{linkedAR.length} linked</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-red-600" />
                            <span>Accounts Payable</span>
                          </div>
                          <Badge variant="secondary">{linkedAP.length} linked</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span>Journal Entries</span>
                          </div>
                          <Badge variant="secondary">{linkedJournals.length} linked</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Project Transactions</h3>
                  <Button onClick={() => { setEditingTransaction(null); setTransactionDialogOpen(true); }} size="sm">
                    <Plus className="h-4 w-4 mr-2" />Add Transaction
                  </Button>
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium whitespace-nowrap">Date</th>
                        <th className="text-left p-4 text-sm font-medium whitespace-nowrap">Type</th>
                        <th className="text-left p-4 text-sm font-medium whitespace-nowrap">Description</th>
                        <th className="text-left p-4 text-sm font-medium whitespace-nowrap">Category</th>
                        <th className="text-right p-4 text-sm font-medium whitespace-nowrap">Amount</th>
                        <th className="text-center p-4 text-sm font-medium whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions?.map((transaction) => (
                        <tr key={transaction.id} className="border-t hover:bg-muted/50">
                          <td className="p-4 text-sm whitespace-nowrap">{format(new Date(transaction.transactionDate), "MMM dd, yyyy")}</td>
                          <td className="p-4 whitespace-nowrap">
                            <Badge className={getTypeColor(transaction.transactionType)}>
                              {transactionTypes?.find(t => t.code === transaction.transactionType)?.name || transaction.transactionType.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm max-w-xs truncate">{transaction.description || "-"}</td>
                          <td className="p-4 text-sm whitespace-nowrap">{transaction.category || "-"}</td>
                          <td className="p-4 text-sm text-right font-medium whitespace-nowrap">
                            {formatCurrency(Number(transaction.amount), transaction.currency)}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex gap-1 justify-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setEditingTransaction(transaction); setTransactionDialogOpen(true); }}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => archiveTransactionMutation.mutate({ id: transaction.id })}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4 text-amber-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (confirm("Delete this transaction permanently?")) {
                                    deleteMutation.mutate({ id: transaction.id });
                                  }
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!transactions || transactions.length === 0) && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No transactions found. Click "Add Transaction" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Archived Transactions Section */}
                {archivedTransactions.length > 0 && (
                  <Collapsible className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                            <Archive className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Archived Transactions ({archivedTransactions.length})</CardTitle>
                          </CollapsibleTrigger>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search archived..."
                              value={txnSearchTerm}
                              onChange={(e) => setTxnSearchTerm(e.target.value)}
                              className="pl-8 h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent>
                          <Table className="w-full table-fixed">
                            <TableHeader>
                              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <TableHead className="w-[100px] text-xs">Date</TableHead>
                                <TableHead className="w-[80px] text-xs">Type</TableHead>
                                <TableHead className="w-[150px] text-xs">Description</TableHead>
                                <TableHead className="w-[100px] text-xs text-right">Amount</TableHead>
                                <TableHead className="w-[90px] text-xs">Archived</TableHead>
                                <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {archivedTransactions
                                .filter((t: any) =>
                                  (t.description && t.description.toLowerCase().includes(txnSearchTerm.toLowerCase())) ||
                                  (t.category && t.category.toLowerCase().includes(txnSearchTerm.toLowerCase()))
                                )
                                .map((transaction: any, idx: number) => (
                                <TableRow key={transaction.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <TableCell className="text-xs">
                                    <div className="truncate">{format(new Date(transaction.transactionDate), "MMM dd, yy")}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-[10px] ${getTypeColor(transaction.transactionType)}`}>
                                      {transaction.transactionType.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-[150px]">
                                    <div className="text-xs line-clamp-2 truncate">{transaction.description || "-"}</div>
                                  </TableCell>
                                  <TableCell className="text-xs text-right font-medium">
                                    <div className="truncate">{formatCurrency(Number(transaction.amount), transaction.currency)}</div>
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-500">
                                    <div className="truncate">{transaction.archivedAt ? format(new Date(transaction.archivedAt), "MMM dd, yy") : "-"}</div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex gap-1 justify-center">
                                      {isAdmin && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => restoreTransactionMutation.mutate({ id: transaction.id })}
                                          title="Restore"
                                        >
                                          <ArchiveRestore className="w-4 h-4 text-green-600" />
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                          if (confirm("Delete this transaction permanently?")) {
                                            deleteMutation.mutate({ id: transaction.id });
                                          }
                                        }}
                                        title="Delete Permanently"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}
              </TabsContent>

              <TabsContent value="receivables" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Linked Accounts Receivable</h3>
                    <p className="text-sm text-muted-foreground">AR entries linked to this project (via notes or invoice reference)</p>
                  </div>
                  <Button onClick={() => setLinkARDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />Create Linked AR
                  </Button>
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Customer</th>
                        <th className="text-left p-4 text-sm font-medium">Invoice #</th>
                        <th className="text-left p-4 text-sm font-medium">Due Date</th>
                        <th className="text-right p-4 text-sm font-medium">Amount</th>
                        <th className="text-center p-4 text-sm font-medium">Status</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedAR.map((ar: any) => (
                        <tr key={ar.id} className="border-t hover:bg-muted/50">
                          <td className="p-4 text-sm">{ar.customerName}</td>
                          <td className="p-4 text-sm">{ar.invoiceNumber || "-"}</td>
                          <td className="p-4 text-sm">{format(new Date(ar.dueDate), "MMM dd, yyyy")}</td>
                          <td className="p-4 text-sm text-right font-medium">{formatCurrency(Number(ar.amount), ar.currency)}</td>
                          <td className="p-4 text-center">
                            <Badge className={getStatusColor(ar.status)}>{ar.status}</Badge>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {ar.status !== "paid" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateARStatusMutation.mutate({ id: ar.id, status: "paid" })}
                                  title="Mark as Paid"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {ar.status === "pending" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateARStatusMutation.mutate({ id: ar.id, status: "overdue" })}
                                  title="Mark as Overdue"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                              {ar.status === "overdue" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateARStatusMutation.mutate({ id: ar.id, status: "pending" })}
                                  title="Mark as Pending"
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => archiveARMutation.mutate({ id: ar.id })}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4 text-amber-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {linkedAR.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No linked receivables found. Create one to link it to this project.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Archived Receivables Section */}
                {(() => {
                  const linkedArchivedAR = archivedARData.filter((ar: any) => 
                    ar.notes?.toLowerCase().includes(projectName.toLowerCase()) ||
                    ar.invoiceNumber?.toLowerCase().includes(projectName.toLowerCase().substring(0, 10))
                  );
                  return linkedArchivedAR.length > 0 ? (
                    <Collapsible className="mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                            <Archive className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Archived Receivables ({linkedArchivedAR.length})</CardTitle>
                          </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent>
                            <Table className="w-full table-fixed">
                              <TableHeader>
                                <TableRow className="bg-gradient-to-r from-green-50 to-green-100">
                                  <TableHead className="w-[140px] text-xs">Customer</TableHead>
                                  <TableHead className="w-[100px] text-xs">Invoice</TableHead>
                                  <TableHead className="w-[100px] text-xs text-right">Amount</TableHead>
                                  <TableHead className="w-[90px] text-xs">Archived</TableHead>
                                  <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {linkedArchivedAR.map((ar: any, idx: number) => (
                                  <TableRow key={ar.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <TableCell className="text-xs max-w-[140px]">
                                      <div className="truncate">{ar.customerName}</div>
                                    </TableCell>
                                    <TableCell className="text-xs max-w-[100px]">
                                      <div className="truncate">{ar.invoiceNumber || "-"}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-medium text-green-600">
                                      <div className="truncate">{formatCurrency(Number(ar.amount), ar.currency)}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                      <div className="truncate">{ar.archivedAt ? format(new Date(ar.archivedAt), "MMM dd, yy") : "-"}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isAdmin && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => restoreARMutation.mutate({ id: ar.id })}
                                          title="Restore"
                                        >
                                          <ArchiveRestore className="w-4 h-4 text-green-600" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ) : null;
                })()}

                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> AR entries are automatically linked when they contain the project name in their notes or invoice number. You can also manage all AR entries in the <a href="/finance" className="underline">Finance Module</a>.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payables" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Linked Accounts Payable</h3>
                    <p className="text-sm text-muted-foreground">AP entries linked to this project (via notes or invoice reference)</p>
                  </div>
                  <Button onClick={() => setLinkAPDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />Create Linked AP
                  </Button>
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Vendor</th>
                        <th className="text-left p-4 text-sm font-medium">Invoice #</th>
                        <th className="text-left p-4 text-sm font-medium">Due Date</th>
                        <th className="text-right p-4 text-sm font-medium">Amount</th>
                        <th className="text-center p-4 text-sm font-medium">Status</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedAP.map((ap: any) => (
                        <tr key={ap.id} className="border-t hover:bg-muted/50">
                          <td className="p-4 text-sm">{ap.vendorName}</td>
                          <td className="p-4 text-sm">{ap.invoiceNumber || "-"}</td>
                          <td className="p-4 text-sm">{format(new Date(ap.dueDate), "MMM dd, yyyy")}</td>
                          <td className="p-4 text-sm text-right font-medium">{formatCurrency(Number(ap.amount), ap.currency)}</td>
                          <td className="p-4 text-center">
                            <Badge className={getStatusColor(ap.status)}>{ap.status}</Badge>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {ap.status !== "paid" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateAPStatusMutation.mutate({ id: ap.id, status: "paid" })}
                                  title="Mark as Paid"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {ap.status === "pending" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateAPStatusMutation.mutate({ id: ap.id, status: "overdue" })}
                                  title="Mark as Overdue"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                              {ap.status === "overdue" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateAPStatusMutation.mutate({ id: ap.id, status: "pending" })}
                                  title="Mark as Pending"
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => archiveAPMutation.mutate({ id: ap.id })}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4 text-amber-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {linkedAP.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No linked payables found. Create one to link it to this project.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Archived Payables Section */}
                {(() => {
                  const linkedArchivedAP = archivedAPData.filter((ap: any) => 
                    ap.notes?.toLowerCase().includes(projectName.toLowerCase()) ||
                    ap.invoiceNumber?.toLowerCase().includes(projectName.toLowerCase().substring(0, 10))
                  );
                  return linkedArchivedAP.length > 0 ? (
                    <Collapsible className="mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                            <Archive className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Archived Payables ({linkedArchivedAP.length})</CardTitle>
                          </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent>
                            <Table className="w-full table-fixed">
                              <TableHeader>
                                <TableRow className="bg-gradient-to-r from-red-50 to-red-100">
                                  <TableHead className="w-[140px] text-xs">Vendor</TableHead>
                                  <TableHead className="w-[100px] text-xs">Invoice</TableHead>
                                  <TableHead className="w-[100px] text-xs text-right">Amount</TableHead>
                                  <TableHead className="w-[90px] text-xs">Archived</TableHead>
                                  <TableHead className="w-[80px] text-xs text-center">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {linkedArchivedAP.map((ap: any, idx: number) => (
                                  <TableRow key={ap.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <TableCell className="text-xs max-w-[140px]">
                                      <div className="truncate">{ap.vendorName}</div>
                                    </TableCell>
                                    <TableCell className="text-xs max-w-[100px]">
                                      <div className="truncate">{ap.invoiceNumber || "-"}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-medium text-red-600">
                                      <div className="truncate">{formatCurrency(Number(ap.amount), ap.currency)}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                      <div className="truncate">{ap.archivedAt ? format(new Date(ap.archivedAt), "MMM dd, yy") : "-"}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isAdmin && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => restoreAPMutation.mutate({ id: ap.id })}
                                          title="Restore"
                                        >
                                          <ArchiveRestore className="w-4 h-4 text-green-600" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ) : null;
                })()}

                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> AP entries are automatically linked when they contain the project name in their notes or invoice number. You can also manage all AP entries in the <a href="/finance" className="underline">Finance Module</a>.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {transactionDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
              <h3 className="text-lg font-semibold">{editingTransaction ? "Edit" : "Add"} Transaction</h3>
              <Button variant="ghost" size="sm" onClick={() => setTransactionDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <Select value={txnType} onValueChange={setTxnType} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="cogs">Cost of Goods Sold (COGS)</SelectItem>
                      <SelectItem value="wacc">Weighted Avg Cost of Capital (WACC)</SelectItem>
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
                  <Select value={txnCurrency} onValueChange={setTxnCurrency} required>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="z-[100]">
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

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTransaction ? "Update" : "Add"} Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {typesDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
              <h3 className="text-lg font-semibold">Manage Transaction Types</h3>
              <Button variant="ghost" size="sm" onClick={() => setTypesDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
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
                          <SelectContent className="z-[100]">
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="color">Color</Label>
                        <Select name="color" defaultValue={editingType?.color || "gray"}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent className="z-[100]">
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
                            disabled={type.isSystem}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this transaction type?")) {
                                deleteTypeMutation.mutate({ id: type.id });
                              }
                            }}
                            disabled={type.isSystem}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {linkARDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Linked AR Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setLinkARDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleARSubmit} className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" name="customerName" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="BDT">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" name="invoiceNumber" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} placeholder="Additional notes" />
              </div>
              <p className="text-xs text-muted-foreground">This AR entry will be automatically linked to project "{projectName}"</p>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setLinkARDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create AR Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {linkAPDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Linked AP Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setLinkAPDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAPSubmit} className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input id="vendorName" name="vendorName" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="BDT">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" name="invoiceNumber" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} placeholder="Additional notes" />
              </div>
              <p className="text-xs text-muted-foreground">This AP entry will be automatically linked to project "{projectName}"</p>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setLinkAPDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create AP Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
