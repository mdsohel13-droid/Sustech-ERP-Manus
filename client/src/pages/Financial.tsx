import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { Download } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

export default function Financial() {
  const [arDialogOpen, setArDialogOpen] = useState(false);
  const [apDialogOpen, setApDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [editingAR, setEditingAR] = useState<any>(null);
  const [editingAP, setEditingAP] = useState<any>(null);

  const utils = trpc.useUtils();
  const { currency } = useCurrency();
  const { data: arList } = trpc.financial.getAllAR.useQuery();
  const { data: apList } = trpc.financial.getAllAP.useQuery();
  const { data: arSummary } = trpc.financial.getARSummary.useQuery();
  const { data: apSummary } = trpc.financial.getAPSummary.useQuery();

  const createARMutation = trpc.financial.createAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("AR entry created successfully");
      setArDialogOpen(false);
    },
  });

  const createAPMutation = trpc.financial.createAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("AP entry created successfully");
      setApDialogOpen(false);
    },
  });

  const updateARMutation = trpc.financial.updateAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      toast.success("AR entry updated");
    },
  });

  const updateAPMutation = trpc.financial.updateAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      toast.success("AP entry updated");
    },
  });

  const deleteARMutation = trpc.financial.deleteAR.useMutation({
    onSuccess: () => {
      utils.financial.getAllAR.invalidate();
      utils.financial.getARSummary.invalidate();
      toast.success("AR entry deleted");
    },
  });

  const deleteAPMutation = trpc.financial.deleteAP.useMutation({
    onSuccess: () => {
      utils.financial.getAllAP.invalidate();
      utils.financial.getAPSummary.invalidate();
      toast.success("AP entry deleted");
    },
  });

  const handleARSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingAR) {
      updateARMutation.mutate({
        id: editingAR.id,
        customerName: formData.get("customerName") as string,
        amount: formData.get("amount") as string,
        dueDate: formData.get("dueDate") as string,
        invoiceNumber: formData.get("invoiceNumber") as string,
        notes: formData.get("notes") as string,
        status: formData.get("status") as "pending" | "overdue" | "paid",
      });
      setEditingAR(null);
    } else {
      createARMutation.mutate({
        customerName: formData.get("customerName") as string,
        amount: formData.get("amount") as string,
        dueDate: formData.get("dueDate") as string,
        invoiceNumber: formData.get("invoiceNumber") as string,
        notes: formData.get("notes") as string,
      });
    }
  };

  const handleAPSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingAP) {
      updateAPMutation.mutate({
        id: editingAP.id,
        vendorName: formData.get("vendorName") as string,
        amount: formData.get("amount") as string,
        dueDate: formData.get("dueDate") as string,
        invoiceNumber: formData.get("invoiceNumber") as string,
        notes: formData.get("notes") as string,
        status: formData.get("status") as "pending" | "overdue" | "paid",
      });
      setEditingAP(null);
    } else {
      createAPMutation.mutate({
        vendorName: formData.get("vendorName") as string,
        amount: formData.get("amount") as string,
        dueDate: formData.get("dueDate") as string,
        invoiceNumber: formData.get("invoiceNumber") as string,
        notes: formData.get("notes") as string,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: "status-paid",
      pending: "status-pending",
      overdue: "status-overdue",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-8" id="financial-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Tracking</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Manage accounts receivable, payable, and sales performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const arData = arList?.map(ar => ({
                Customer: ar.customerName,
                Amount: ar.amount,
                "Due Date": format(new Date(ar.dueDate), "MMM dd, yyyy"),
                Status: ar.status,
                Invoice: ar.invoiceNumber || "",
              })) || [];
              const apData = apList?.map(ap => ({
                Vendor: ap.vendorName,
                Amount: ap.amount,
                "Due Date": format(new Date(ap.dueDate), "MMM dd, yyyy"),
                Status: ap.status,
                Invoice: ap.invoiceNumber || "",
              })) || [];
              
              exportToCSV([...arData, ...apData], `financial-report-${format(new Date(), "yyyy-MM-dd")}`);
              toast.success("Financial data exported to CSV");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await exportToPDF("financial-dashboard", `financial-report-${format(new Date(), "yyyy-MM-dd")}`, {
                  orientation: "landscape",
                });
                toast.success("Financial report exported to PDF");
              } catch (error) {
                toast.error("Failed to export PDF");
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="editorial-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Accounts Receivable</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(arSummary?.total || 0, currency)}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{formatCurrency(arSummary?.pending || 0, currency)}</span>
              </div>
              {Number(arSummary?.overdue || 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overdue</span>
                  <span className="font-medium">{formatCurrency(arSummary?.overdue || 0, currency)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Accounts Payable</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(apSummary?.total || 0, currency)}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{formatCurrency(apSummary?.pending || 0, currency)}</span>
              </div>
              {Number(apSummary?.overdue || 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overdue</span>
                  <span className="font-medium">{formatCurrency(apSummary?.overdue || 0, currency)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Net Position</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency((Number(arSummary?.total || 0) - Number(apSummary?.total || 0)), currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AR minus AP balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AR/AP Tables */}
      <Tabs defaultValue="ar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
        </TabsList>

        <TabsContent value="ar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Receivables</h3>
            <Dialog open={arDialogOpen} onOpenChange={(open) => { setArDialogOpen(open); if (!open) setEditingAR(null); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add AR Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleARSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingAR ? "Edit" : "New"} Accounts Receivable</DialogTitle>
                    <DialogDescription>{editingAR ? "Update" : "Add a new"} receivable entry</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input id="customerName" name="customerName" defaultValue={editingAR?.customerName} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" defaultValue={editingAR?.amount} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" defaultValue={editingAR?.dueDate ? format(new Date(editingAR.dueDate), "yyyy-MM-dd") : ""} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" defaultValue={editingAR?.invoiceNumber || ""} />
                    </div>
                    {editingAR && (
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={editingAR?.status || "pending"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" defaultValue={editingAR?.notes || ""} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createARMutation.isPending || updateARMutation.isPending}>
                      {editingAR ? (updateARMutation.isPending ? "Updating..." : "Update Entry") : (createARMutation.isPending ? "Creating..." : "Create Entry")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arList && arList.length > 0 ? (
                  arList.map((ar) => (
                    <TableRow key={ar.id}>
                      <TableCell className="font-medium">{ar.customerName}</TableCell>
                      <TableCell>{formatCurrency(ar.amount, ar.currency || currency)}</TableCell>
                      <TableCell>{ar.dueDate ? format(new Date(ar.dueDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{ar.invoiceNumber || "-"}</TableCell>
                      <TableCell>{getStatusBadge(ar.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAR(ar);
                              setArDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this AR entry?")) {
                                deleteARMutation.mutate({ id: ar.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No receivables found. Add your first entry above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="ap" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Payables</h3>
            <Dialog open={apDialogOpen} onOpenChange={(open) => { setApDialogOpen(open); if (!open) setEditingAP(null); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add AP Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAPSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingAP ? "Edit" : "New"} Accounts Payable</DialogTitle>
                    <DialogDescription>{editingAP ? "Update" : "Add a new"} payable entry</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendorName">Vendor Name</Label>
                      <Input id="vendorName" name="vendorName" defaultValue={editingAP?.vendorName} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" defaultValue={editingAP?.amount} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" defaultValue={editingAP?.dueDate ? format(new Date(editingAP.dueDate), "yyyy-MM-dd") : ""} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" defaultValue={editingAP?.invoiceNumber || ""} />
                    </div>
                    {editingAP && (
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={editingAP?.status || "pending"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" defaultValue={editingAP?.notes || ""} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createAPMutation.isPending || updateAPMutation.isPending}>
                      {editingAP ? (updateAPMutation.isPending ? "Updating..." : "Update Entry") : (createAPMutation.isPending ? "Creating..." : "Create Entry")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apList && apList.length > 0 ? (
                  apList.map((ap) => (
                    <TableRow key={ap.id}>
                      <TableCell className="font-medium">{ap.vendorName}</TableCell>
                      <TableCell>{formatCurrency(ap.amount, ap.currency || currency)}</TableCell>
                      <TableCell>{ap.dueDate ? format(new Date(ap.dueDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{ap.invoiceNumber || "-"}</TableCell>
                      <TableCell>{getStatusBadge(ap.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAP(ap);
                              setApDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this AP entry?")) {
                                deleteAPMutation.mutate({ id: ap.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No payables found. Add your first entry above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
