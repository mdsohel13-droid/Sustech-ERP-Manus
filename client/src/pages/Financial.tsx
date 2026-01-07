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

export default function Financial() {
  const [arDialogOpen, setArDialogOpen] = useState(false);
  const [apDialogOpen, setApDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);

  const utils = trpc.useUtils();
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
    createARMutation.mutate({
      customerName: formData.get("customerName") as string,
      amount: formData.get("amount") as string,
      dueDate: formData.get("dueDate") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      notes: formData.get("notes") as string,
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
      notes: formData.get("notes") as string,
    });
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Tracking</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Manage accounts receivable, payable, and sales performance
          </p>
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
            <div className="text-3xl font-bold">${Number(arSummary?.total || 0).toLocaleString()}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">${Number(arSummary?.pending || 0).toLocaleString()}</span>
              </div>
              {Number(arSummary?.overdue || 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overdue</span>
                  <span className="font-medium">${Number(arSummary?.overdue || 0).toLocaleString()}</span>
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
            <div className="text-3xl font-bold">${Number(apSummary?.total || 0).toLocaleString()}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">${Number(apSummary?.pending || 0).toLocaleString()}</span>
              </div>
              {Number(apSummary?.overdue || 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Overdue</span>
                  <span className="font-medium">${Number(apSummary?.overdue || 0).toLocaleString()}</span>
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
              ${(Number(arSummary?.total || 0) - Number(apSummary?.total || 0)).toLocaleString()}
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
            <Dialog open={arDialogOpen} onOpenChange={setArDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add AR Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleARSubmit}>
                  <DialogHeader>
                    <DialogTitle>New Accounts Receivable</DialogTitle>
                    <DialogDescription>Add a new receivable entry</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input id="customerName" name="customerName" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createARMutation.isPending}>
                      {createARMutation.isPending ? "Creating..." : "Create Entry"}
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
                      <TableCell>${Number(ar.amount).toLocaleString()}</TableCell>
                      <TableCell>{ar.dueDate ? format(new Date(ar.dueDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{ar.invoiceNumber || "-"}</TableCell>
                      <TableCell>{getStatusBadge(ar.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newStatus = ar.status === "paid" ? "pending" : "paid";
                              updateARMutation.mutate({ id: ar.id, status: newStatus });
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
            <Dialog open={apDialogOpen} onOpenChange={setApDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add AP Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAPSubmit}>
                  <DialogHeader>
                    <DialogTitle>New Accounts Payable</DialogTitle>
                    <DialogDescription>Add a new payable entry</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendorName">Vendor Name</Label>
                      <Input id="vendorName" name="vendorName" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" name="invoiceNumber" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createAPMutation.isPending}>
                      {createAPMutation.isPending ? "Creating..." : "Create Entry"}
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
                      <TableCell>${Number(ap.amount).toLocaleString()}</TableCell>
                      <TableCell>{ap.dueDate ? format(new Date(ap.dueDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{ap.invoiceNumber || "-"}</TableCell>
                      <TableCell>{getStatusBadge(ap.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newStatus = ap.status === "paid" ? "pending" : "paid";
                              updateAPMutation.mutate({ id: ap.id, status: newStatus });
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
