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
import { Plus, TrendingUp, Target, BarChart3, Paperclip } from "lucide-react";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Sales() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: products } = trpc.sales.getAllProducts.useQuery();
  const { data: tracking } = trpc.sales.getAllTracking.useQuery();
  const { data: performance } = trpc.sales.getPerformanceSummary.useQuery();

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
            <CardTitle className="text-sm label-text">Total Target (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${performance?.reduce((sum, p) => sum + Number(p.totalTarget || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Total Actual (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${performance?.reduce((sum, p) => sum + Number(p.totalActual || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Avg Achievement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {performance && performance.length > 0
                ? Math.round(performance.reduce((sum, p) => sum + Number(p.achievementRate || 0), 0) / performance.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="editorial-card">
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="target" stroke="#8884d8" name="Target" />
                <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader>
            <CardTitle>Target vs Actual Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(-6)}>
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

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Sales Tracking</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Weekly Sales Data</h3>
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Record Sales</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleTrackingSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Weekly Sales</DialogTitle>
                    <DialogDescription>Enter target and actual sales for the week</DialogDescription>
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
                    <div className="grid gap-2">
                      <Label><Paperclip className="h-4 w-4 inline mr-1" />Attachments</Label>
                      <AttachmentUpload entityType="sales" entityId={0} />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracking && tracking.length > 0 ? (
                  tracking.map((item) => {
                    const product = products?.find(p => p.id === item.productId);
                    const achievement = (Number(item.actual) / Number(item.target)) * 100;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.weekStartDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{product?.name || `Product ${item.productId}`}</TableCell>
                        <TableCell className="text-right">${Number(item.target).toLocaleString()}</TableCell>
                        <TableCell className="text-right">${Number(item.actual).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={achievement >= 100 ? "bg-green-100 text-green-800" : achievement >= 80 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                            {achievement.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{item.notes || "-"}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No sales data recorded yet.</TableCell>
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
                    <div className="grid gap-2">
                      <Label><Paperclip className="h-4 w-4 inline mr-1" />Attachments</Label>
                      <AttachmentUpload entityType="sales_product" entityId={0} />
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
                <Card key={product.id} className="editorial-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
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
      </Tabs>
    </div>
  );
}
