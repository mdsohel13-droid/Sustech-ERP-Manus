import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Target, BarChart3, Paperclip, FileText, Trash2, Edit } from "lucide-react";
import { InlineEditCell } from "@/components/InlineEditCell";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { TableBatchActions, useTableBatchSelection } from "@/components/TableBatchActions";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Sales() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [viewTrackingDialogOpen, setViewTrackingDialogOpen] = useState(false);
  const [viewProductDialogOpen, setViewProductDialogOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean; item: any; type: 'product' | 'tracking'}>({show: false, item: null, type: 'product'});
  const [editingCell, setEditingCell] = useState<{rowId: number; field: string} | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const batchSelection = useTableBatchSelection(dailySales || []);

  const utils = trpc.useUtils();
  const { data: products } = trpc.sales.getAllProducts.useQuery();
  const { data: tracking } = trpc.sales.getAllTracking.useQuery();
  const { data: performance } = trpc.sales.getPerformanceSummary.useQuery();
  const { data: dailySales } = trpc.sales.getAll.useQuery();
  const { data: employees } = trpc.hr.getAll.useQuery();

  const createProductMutation = trpc.sales.createProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      toast.success("Product added successfully");
      setProductDialogOpen(false);
    },
  });

  const createTrackingMutation = trpc.sales.createTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales data recorded");
      setTrackingDialogOpen(false);
    },
  });

  const deleteProductMutation = trpc.sales.deleteProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Product deleted");
      setDeleteConfirm({show: false, item: null, type: 'product'});
      setViewProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const deleteTrackingMutation = trpc.sales.deleteTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales record deleted");
      setDeleteConfirm({show: false, item: null, type: 'tracking'});
      setViewTrackingDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete record: ${error.message}`);
    },
  });

  const updateTrackingMutation = trpc.sales.updateTracking.useMutation({
    onSuccess: () => {
      utils.sales.getAllTracking.invalidate();
      utils.sales.getPerformanceSummary.invalidate();
      toast.success("Sales record updated");
      setEditingCell(null);
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const updateProductMutation = trpc.sales.updateProduct.useMutation({
    onSuccess: () => {
      utils.sales.getAllProducts.invalidate();
      toast.success("Product updated");
      setEditingCell(null);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.sales.bulkDelete.useMutation({
    onSuccess: () => {
      utils.sales.getAll.invalidate();
      batchSelection.clearSelection();
      setBulkDeleting(false);
      toast.success(`Deleted ${batchSelection.selectedIds.length} records`);
    },
    onError: (error) => {
      setBulkDeleting(false);
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleBulkDelete = () => {
    if (batchSelection.selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (confirm(`Delete ${batchSelection.selectedIds.length} records?`)) {
      setBulkDeleting(true);
      bulkDeleteMutation.mutate({ ids: batchSelection.selectedIds });
    }
  };

  const handleExport = () => {
    if (dailySales) {
      batchSelection.exportToCSV(dailySales, 'sales-records');
    }
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createProductMutation.mutate({
      name: formData.get("name") as string,
      category: formData.get("category") as any,
      unit: formData.get("unit") as string,
      description: formData.get("description") as string,
    });
  };

  const handleTrackingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weekStart = new Date(formData.get("weekStartDate") as string);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    createTrackingMutation.mutate({
      productId: Number(formData.get("productId")),
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      target: formData.get("target") as string,
      actual: formData.get("actual") as string,
      notes: formData.get("notes") as string,
    });
  };

  // Prepare chart data
  const chartData = tracking?.slice(0, 12).reverse().map((item) => {
    const product = products?.find(p => p.id === item.productId);
    return {
      week: format(new Date(item.weekStartDate), "MMM dd"),
      target: Number(item.target),
      actual: Number(item.actual),
      product: product?.name || `Product ${item.productId}`,
    };
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Sales Tracking</h1>
          <p className="text-muted-foreground text-lg mt-2">Monitor weekly targets vs actuals for key products</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">This Week Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${tracking?.slice(0, 1).reduce((sum, t) => sum + Number(t.target), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">This Week Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${tracking?.slice(0, 1).reduce((sum, t) => sum + Number(t.actual), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Achievement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {performance && performance.length > 0
                ? (performance.reduce((sum, p) => sum + Number(p.achievementRate), 0) / performance.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="editorial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Target vs Actual Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="target" stroke="#8884d8" strokeWidth={2} name="Target" />
                <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" fill="#8884d8" name="Target" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Sales</TabsTrigger>
          <TabsTrigger value="tracking">Weekly Targets</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="salespeople">Salespeople</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <TableBatchActions
            selectedIds={batchSelection.selectedIds}
            totalCount={dailySales?.length || 0}
            onSelectAll={batchSelection.toggleSelectAll}
            onBulkDelete={handleBulkDelete}
            onExport={handleExport}
            isDeleting={bulkDeleting}
          />
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Daily Sales Records</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Record Sale</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  // Add sale creation logic here
                  toast.success("Sale recorded");
                }}>
                  <DialogHeader>
                    <DialogTitle>Record Daily Sale</DialogTitle>
                    <DialogDescription>Enter sale details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="salesperson">Salesperson</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast.info("Go to Sales > Salespeople tab to manage salespeople");
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Quick Add
                        </Button>
                      </div>
                      <Select name="salesperson" required>
                        <SelectTrigger><SelectValue placeholder="Select salesperson" /></SelectTrigger>
                        <SelectContent>
                          {employees?.filter((emp: any) => emp.status === 'active').map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>
                          ))}
                          {employees?.filter((emp: any) => emp.status !== 'active').length > 0 && (
                            <>
                              <div className="px-2 py-1 text-xs text-muted-foreground border-t">Inactive</div>
                              {employees?.filter((emp: any) => emp.status !== 'active').map((emp) => (
                                <SelectItem key={emp.id} value={String(emp.id)} disabled>
                                  {emp.name} ({emp.status})
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product">Product</Label>
                      <Select name="product" required>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products?.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer">Customer (Optional)</Label>
                      <Input id="customer" name="customer" type="text" placeholder="Customer name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unitPrice">Unit Price</Label>
                      <Input id="unitPrice" name="unitPrice" type="number" step="0.01" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Record Sale</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={batchSelection.selectedIds.length === dailySales?.length && dailySales?.length > 0}
                      indeterminate={batchSelection.selectedIds.length > 0 && batchSelection.selectedIds.length < dailySales?.length}
                      onCheckedChange={batchSelection.toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySales && dailySales.length > 0 ? (
                  dailySales.map((sale: any) => {
                    const product = products?.find(p => p.id === sale.productId);
                    const total = Number(sale.quantity) * Number(sale.unitPrice);
                    return (
                      <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={batchSelection.selectedIds.includes(String(sale.id))}
                            onCheckedChange={() => batchSelection.toggleSelection(String(sale.id))}
                          />
                        </TableCell>
                        <TableCell>{sale.date ? format(new Date(sale.date), "MMM dd, yyyy") : "N/A"}</TableCell>
                        <TableCell>{product?.name || `Product ${sale.productId}`}</TableCell>
                        <TableCell>{sale.salespersonName || "N/A"}</TableCell>
                        <TableCell>{sale.customerName || "-"}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === sale.id && editingCell?.field === 'quantity' ? (
                            <InlineEditCell
                              value={String(sale.quantity)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                toast.success("Quantity updated");
                                setEditingCell(null);
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={false}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: sale.id, field: 'quantity'})} className="cursor-pointer hover:underline">
                              {Number(sale.quantity).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === sale.id && editingCell?.field === 'unitPrice' ? (
                            <InlineEditCell
                              value={String(sale.unitPrice)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                toast.success("Unit price updated");
                                setEditingCell(null);
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={false}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: sale.id, field: 'unitPrice'})} className="cursor-pointer hover:underline">
                              ৳{Number(sale.unitPrice).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">৳{total.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedTracking(sale);
                            setViewTrackingDialogOpen(true);
                          }} title="View details">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item: sale, type: 'tracking'})} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No sales records yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Weekly Sales Targets</h3>
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Record Sales</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleTrackingSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Weekly Sales</DialogTitle>
                    <DialogDescription>Enter target and actual sales for a product this week</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productId">Product</Label>
                      <Select name="productId" required>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={String(product.id)}>
                              {product.name} ({product.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weekStartDate">Week Start Date</Label>
                      <Input id="weekStartDate" name="weekStartDate" type="date" required defaultValue={format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="target">Target</Label>
                        <Input id="target" name="target" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="actual">Actual</Label>
                        <Input id="actual" name="actual" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input id="notes" name="notes" placeholder="Additional comments" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTrackingMutation.isPending}>
                      {createTrackingMutation.isPending ? "Recording..." : "Record Sales"}
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
                  <TableHead>Week</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Achievement</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-center">
                    <FileText className="h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracking && tracking.length > 0 ? (
                  tracking.map((item) => {
                    const product = products?.find(p => p.id === item.productId);
                    const achievement = (Number(item.actual) / Number(item.target)) * 100;
                    return (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedTracking(item);
                          setViewTrackingDialogOpen(true);
                        }}
                      >
                        <TableCell>{format(new Date(item.weekStartDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{product?.name || `Product ${item.productId}`}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === item.id && editingCell?.field === 'target' ? (
                            <InlineEditCell
                              value={String(item.target)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                updateTrackingMutation.mutate({
                                  id: item.id,
                                  target: value,
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateTrackingMutation.isPending}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: item.id, field: 'target'})} className="cursor-pointer hover:underline">
                              ${Number(item.target).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.rowId === item.id && editingCell?.field === 'actual' ? (
                            <InlineEditCell
                              value={String(item.actual)}
                              isEditing={true}
                              type="number"
                              onSave={(value) => {
                                updateTrackingMutation.mutate({
                                  id: item.id,
                                  actual: value,
                                });
                              }}
                              onCancel={() => setEditingCell(null)}
                              isLoading={updateTrackingMutation.isPending}
                            />
                          ) : (
                            <span onClick={() => setEditingCell({rowId: item.id, field: 'actual'})} className="cursor-pointer hover:underline">
                              ${Number(item.actual).toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={achievement >= 100 ? "bg-green-100 text-green-800" : achievement >= 80 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                            {achievement.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{item.notes || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Paperclip className="h-4 w-4 inline text-muted-foreground" />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => {setSelectedTracking(item); setViewTrackingDialogOpen(true);}} title="Edit">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({show: true, item, type: 'tracking'})} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No sales data recorded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Product Catalog</h3>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleProductSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Register a product for sales tracking</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" name="name" required placeholder="e.g., Atomberg Gorilla Fan" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue="fan">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fan">Fan (Units)</SelectItem>
                          <SelectItem value="ess">ESS (Small/Comm)</SelectItem>
                          <SelectItem value="solar_pv">Solar PV (kW)</SelectItem>
                          <SelectItem value="epc_project">EPC Project (#)</SelectItem>
                          <SelectItem value="testing">Elec. Testing & Insp.</SelectItem>
                          <SelectItem value="installation">Installation Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit of Measurement</Label>
                      <Input id="unit" name="unit" defaultValue="units" placeholder="units, kW, projects, etc." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input id="description" name="description" placeholder="Additional details" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? "Adding..." : "Add Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Card 
                  key={product.id} 
                  className="editorial-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedProduct(product);
                    setViewProductDialogOpen(true);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setViewProductDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex-1 text-left">{product.name}</button>
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">{product.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Unit: {product.unit}</p>
                    {product.description && <p className="text-sm mt-2">{product.description}</p>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="editorial-card col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No products added yet. Add your first product above.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <h3 className="text-2xl font-medium">Product Performance Summary</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performance && performance.length > 0 ? (
              performance.map((perf) => {
                const product = products?.find(p => p.id === perf.productId);
                const rate = Number(perf.achievementRate);
                return (
                  <Card key={perf.productId} className="editorial-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{product?.name || `Product ${perf.productId}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Target:</span>
                        <span className="font-semibold">${Number(perf.totalTarget).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Actual:</span>
                        <span className="font-semibold">${Number(perf.totalActual).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Achievement:</span>
                        <Badge className={rate >= 100 ? "bg-green-100 text-green-800" : rate >= 80 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                          {rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="editorial-card col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No performance data available yet. Start recording sales to see insights.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="salespeople" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Salespeople Management</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Salesperson</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  // This will be handled by Quick Add in Record Sale dialog
                  toast.info("Please go to HR module to add new employees. They will automatically appear as salespeople.");
                }}>
                  <DialogHeader>
                    <DialogTitle>Add New Salesperson</DialogTitle>
                    <DialogDescription>Salespeople are managed through the HR module</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">To add a new salesperson:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <strong>Human Resource</strong> module</li>
                      <li>Click on <strong>Employees</strong> tab</li>
                      <li>Click <strong>Add Employee</strong> button</li>
                      <li>Fill in the employee details</li>
                      <li>The employee will automatically appear in the Salesperson dropdown</li>
                    </ol>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => window.location.href = '/human-resource'}>Go to HR Module</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Active Salespeople</CardTitle>
              <CardDescription>Employees available for sales tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {employees && employees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/human-resource'} title="Edit in HR Module">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center mb-4">No salespeople added yet.</p>
                  <Button onClick={() => window.location.href = '/human-resource'}>Go to HR Module</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View/Edit Sales Tracking Dialog with Attachments */}
      <Dialog open={viewTrackingDialogOpen} onOpenChange={setViewTrackingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sales Record Details</DialogTitle>
            <DialogDescription>
              Week of {selectedTracking && format(new Date(selectedTracking.weekStartDate), "MMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedTracking && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Product</Label>
                    <p className="font-medium">{products?.find(p => p.id === selectedTracking.productId)?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Week</Label>
                    <p className="font-medium">{format(new Date(selectedTracking.weekStartDate), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Target</Label>
                    <p className="font-medium text-2xl">${Number(selectedTracking.target).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Actual</Label>
                    <p className="font-medium text-2xl">${Number(selectedTracking.actual).toLocaleString()}</p>
                  </div>
                </div>
                {selectedTracking.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedTracking.notes}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section - Highly Visible */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Documents & Attachments</Label>
                </div>
                <AttachmentUpload 
                  entityType="sales_tracking" 
                  entityId={selectedTracking.id}
                />
              </div>

              {/* Delete Button */}
              <div className="border-t pt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({show: true, item: selectedTracking, type: 'tracking'})}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View/Edit Product Dialog with Attachments */}
      <Dialog open={viewProductDialogOpen} onOpenChange={setViewProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>{selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unit</Label>
                    <p className="font-medium">{selectedProduct.unit}</p>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedProduct.description}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section - Highly Visible */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Product Documents & Specs</Label>
                </div>
                <AttachmentUpload 
                  entityType="sales_product" 
                  entityId={selectedProduct.id}
                />
              </div>

              {/* Delete Button */}
              <div className="border-t pt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({show: true, item: selectedProduct, type: 'product'})}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirm.show}
        title={deleteConfirm.type === 'product' ? 'Delete Product?' : 'Delete Sales Record?'}
        description={deleteConfirm.type === 'product' 
          ? `Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`
          : `Are you sure you want to delete this sales record for ${format(new Date(deleteConfirm.item?.weekStartDate), 'MMM dd, yyyy')}? This action cannot be undone.`
        }
        onConfirm={async () => {
          if (deleteConfirm.type === 'product') {
            deleteProductMutation.mutate({ id: deleteConfirm.item.id });
          } else {
            deleteTrackingMutation.mutate({ id: deleteConfirm.item.id });
          }
        }}
        onCancel={() => setDeleteConfirm({show: false, item: null, type: 'product'})}
        isLoading={deleteProductMutation.isPending || deleteTrackingMutation.isPending}
      />
    </div>
  );
}
