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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  Archive
} from "lucide-react";
import { useState } from "react";
import { format, isPast, differenceInDays } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

const statusConfig = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock },
  preparing: { label: "Preparing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: FileText },
  submitted: { label: "Submitted", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", icon: FileCheck },
  win: { label: "Win", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: CheckCircle2 },
  loss: { label: "Loss", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: XCircle },
  po_received: { label: "PO Received", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", icon: CheckCircle2 }
};

export default function TenderQuotation() {
  const [activeTab, setActiveTab] = useState("government");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { currency } = useCurrency();
  
  const { data: items, isLoading } = trpc.tenderQuotation.getAll.useQuery();
  const { data: overdueItems } = trpc.tenderQuotation.getOverdue.useQuery();
  const { data: upcomingItems } = trpc.tenderQuotation.getUpcoming.useQuery({ daysAhead: 4 });
  const createMutation = trpc.tenderQuotation.create.useMutation();
  const updateMutation = trpc.tenderQuotation.update.useMutation();
  const deleteMutation = trpc.tenderQuotation.delete.useMutation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    type: "government_tender" as "government_tender" | "private_quotation",
    referenceId: "",
    description: "",
    clientName: "",
    submissionDate: "",
    followUpDate: "",
    status: "not_started" as "not_started" | "preparing" | "submitted" | "win" | "loss" | "po_received",
    estimatedValue: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
        toast.success("Item updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Item created successfully");
      }
      utils.tenderQuotation.getAll.invalidate();
      utils.tenderQuotation.getOverdue.invalidate();
      utils.tenderQuotation.getUpcoming.invalidate();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Item deleted successfully");
      utils.tenderQuotation.getAll.invalidate();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      referenceId: item.referenceId,
      description: item.description,
      clientName: item.clientName,
      submissionDate: format(new Date(item.submissionDate), "yyyy-MM-dd"),
      followUpDate: item.followUpDate ? format(new Date(item.followUpDate), "yyyy-MM-dd") : "",
      status: item.status,
      estimatedValue: item.estimatedValue || "",
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      type: "government_tender",
      referenceId: "",
      description: "",
      clientName: "",
      submissionDate: "",
      followUpDate: "",
      status: "not_started",
      estimatedValue: "",
      notes: "",
    });
  };

  const governmentTenders = items?.filter(i => i.type === "government_tender") || [];
  const privateQuotations = items?.filter(i => i.type === "private_quotation") || [];

  const isOverdue = (followUpDate: string | null) => {
    if (!followUpDate) return false;
    return isPast(new Date(followUpDate));
  };

  const renderTable = (data: any[], type: "government_tender" | "private_quotation") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">SL</TableHead>
          <TableHead>{type === "government_tender" ? "Tender" : "Quotation"} ID</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Client Name</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Follow-up Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Estimated Value</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
              No items found. Click "Add New" to get started.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => {
            const StatusIcon = statusConfig[item.status as keyof typeof statusConfig].icon;
            const overdueFlag = isOverdue(item.followUpDate);
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">{item.referenceId}</TableCell>
                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                <TableCell>{item.clientName}</TableCell>
                <TableCell>{format(new Date(item.submissionDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {item.followUpDate ? (
                    <div className={`flex items-center gap-1 ${overdueFlag ? "text-orange-600 font-semibold" : ""}`}>
                      {overdueFlag && <AlertTriangle className="h-4 w-4" />}
                      {format(new Date(item.followUpDate), "MMM dd, yyyy")}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[item.status as keyof typeof statusConfig].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[item.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.estimatedValue ? formatCurrency(Number(item.estimatedValue), item.currency || currency) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Tender & Quotation Tracking
          </h1>
          <p className="text-muted-foreground text-lg">
            Track government tenders and private quotations with follow-up management
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Tender/Quotation"}</DialogTitle>
                <DialogDescription>
                  Track government tenders and private quotations
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government_tender">Government Tender</SelectItem>
                      <SelectItem value="private_quotation">Private Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="referenceId">{formData.type === "government_tender" ? "Tender" : "Quotation"} ID</Label>
                    <Input
                      id="referenceId"
                      value={formData.referenceId}
                      onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="submissionDate">Submission Date</Label>
                    <Input
                      id="submissionDate"
                      type="date"
                      value={formData.submissionDate}
                      onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                        <SelectItem value="po_received">PO Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedValue">Estimated Value ({currency})</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      step="0.01"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Section for Overdue and Upcoming */}
      {(overdueItems && overdueItems.length > 0) || (upcomingItems && upcomingItems.length > 0) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {overdueItems && overdueItems.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Follow-ups ({overdueItems.length})
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.clientName}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {upcomingItems && upcomingItems.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  Upcoming Follow-ups ({upcomingItems.length})
                </CardTitle>
                <CardDescription>Items due in the next 4 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.clientName} • Due: {item.followUpDate && format(new Date(item.followUpDate), "MMM dd")}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">GOVERNMENT TENDERS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{governmentTenders.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active tenders</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">PRIVATE QUOTATIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{privateQuotations.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active quotations</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">WON/PO RECEIVED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {items?.filter(i => i.status === "win" || i.status === "po_received").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successful bids</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">PENDING FOLLOW-UP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {items?.filter(i => i.status === "submitted").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Government Tenders and Private Quotations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="government">Government Tenders ({governmentTenders.length})</TabsTrigger>
          <TabsTrigger value="private">Private Quotations ({privateQuotations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="government" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Government Tenders</CardTitle>
              <CardDescription>Track government tender submissions and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(governmentTenders, "government_tender")}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="private" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Private Quotations</CardTitle>
              <CardDescription>Track private quotation submissions and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(privateQuotations, "private_quotation")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
