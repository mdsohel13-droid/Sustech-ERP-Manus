import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, BarChart3, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

const PRODUCTS = [
  { id: "fan", name: "Atomberg Gorilla Fan", category: "fan" },
  { id: "ess_small", name: "Growatt ESS (Small)", category: "ess" },
  { id: "ess_commercial", name: "Growatt ESS (Commercial)", category: "ess" },
  { id: "solar_jinko", name: "Jinko Solar PV Panel", category: "solar_pv" },
  { id: "solar_ja", name: "JA Solar PV Panel", category: "solar_pv" },
  { id: "epc_project", name: "EPC Solar Project", category: "epc_project" },
  { id: "testing", name: "Electrical Testing & Inspection", category: "testing" },
  { id: "installation", name: "Installation Work", category: "installation" },
];

const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function SalesEnhanced() {
  const utils = trpc.useUtils();
  const [dailyDialogOpen, setDailyDialogOpen] = useState(false);
  const [weeklyDialogOpen, setWeeklyDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");

  // Fetch data
  const { data: dailySales, isLoading: loadingDaily } = trpc.salesEnhanced.getDailySales.useQuery({
    startDate: getStartDate(selectedPeriod),
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: weeklyTargets, isLoading: loadingWeekly } = trpc.salesEnhanced.getWeeklyTargets.useQuery();
  const { data: monthlyTargets, isLoading: loadingMonthly } = trpc.salesEnhanced.getMonthlyTargets.useQuery();
  const { data: salespeople } = trpc.salesEnhanced.getSalespeople.useQuery();

  // Mutations
  const createDailySale = trpc.salesEnhanced.createDailySale.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getDailySales.invalidate();
      setDailyDialogOpen(false);
      toast.success("Daily sale recorded successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createWeeklyTarget = trpc.salesEnhanced.createWeeklyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getWeeklyTargets.invalidate();
      setWeeklyDialogOpen(false);
      toast.success("Weekly target set successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createMonthlyTarget = trpc.salesEnhanced.createMonthlyTarget.useMutation({
    onSuccess: () => {
      utils.salesEnhanced.getMonthlyTargets.invalidate();
      setMonthlyDialogOpen(false);
      toast.success("Monthly target set successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Calculate analytics
  const analytics = calculateAnalytics(dailySales || [], weeklyTargets || [], monthlyTargets || []);

  // Export handlers
  const handleExportDaily = () => {
    if (!dailySales || dailySales.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(
      dailySales.map((sale: any) => ({
        Date: format(new Date(sale.date), "dd/MM/yyyy"),
        Product: sale.productName,
        Salesperson: sale.salespersonName,
        Quantity: sale.quantity,
        "Unit Price": sale.unitPrice,
        "Total Amount": sale.totalAmount,
        Customer: sale.customerName || "-",
      })),
      `daily-sales-${format(new Date(), "yyyy-MM-dd")}`
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Sales Performance</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Track daily sales, manage targets, and analyze performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportDaily}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="editorial-card border-l-4 border-l-violet-500">
          <CardHeader className="pb-3" style={{display: 'flex'}}>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{analytics.totalSales.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.salesGrowth >= 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{analytics.salesGrowth}% from last period
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {analytics.salesGrowth}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="editorial-card border-l-4 border-l-cyan-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.achievementRate}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${
                  analytics.achievementRate >= 100
                    ? "bg-green-500"
                    : analytics.achievementRate >= 80
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(analytics.achievementRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-card border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalTransactions}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Avg: ৳{analytics.avgTransactionValue.toLocaleString()} per sale
            </p>
          </CardContent>
        </Card>

        <Card className="editorial-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Salespeople
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.activeSalespeople}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Top: {analytics.topSalesperson || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            Daily Sales
          </TabsTrigger>
          <TabsTrigger value="weekly">Weekly Targets</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Targets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Daily Sales Tab */}
        <TabsContent value="daily" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Sales Records</CardTitle>
                  <CardDescription>Track individual sales transactions with salesperson details</CardDescription>
                </div>
                <Dialog open={dailyDialogOpen} onOpenChange={setDailyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Sale
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Daily Sale</DialogTitle>
                      <DialogDescription>Enter sales transaction details</DialogDescription>
                    </DialogHeader>
                    <DailySaleForm
                      products={PRODUCTS}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createDailySale.mutate(data)}
                      isLoading={createDailySale.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DailySalesTable sales={dailySales || []} isLoading={loadingDaily} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Targets Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Sales Targets</CardTitle>
                  <CardDescription>Set and track weekly performance goals</CardDescription>
                </div>
                <Dialog open={weeklyDialogOpen} onOpenChange={setWeeklyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Weekly Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Weekly Target</DialogTitle>
                      <DialogDescription>Define sales goals for the week</DialogDescription>
                    </DialogHeader>
                    <WeeklyTargetForm
                      products={PRODUCTS}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createWeeklyTarget.mutate(data)}
                      isLoading={createWeeklyTarget.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <WeeklyTargetsTable targets={weeklyTargets || []} isLoading={loadingWeekly} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Targets Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card className="editorial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Sales Targets</CardTitle>
                  <CardDescription>Set and track monthly performance goals</CardDescription>
                </div>
                <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Monthly Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Monthly Target</DialogTitle>
                      <DialogDescription>Define sales goals for the month</DialogDescription>
                    </DialogHeader>
                    <MonthlyTargetForm
                      products={PRODUCTS}
                      salespeople={salespeople || []}
                      onSubmit={(data) => createMonthlyTarget.mutate(data)}
                      isLoading={createMonthlyTarget.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyTargetsTable targets={monthlyTargets || []} isLoading={loadingMonthly} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="editorial-card">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="editorial-card">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.productData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="editorial-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Salesperson Performance</CardTitle>
                <CardDescription>Individual sales achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.salespersonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#10b981" />
                    <Bar dataKey="target" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function DailySaleForm({ products, salespeople, onSubmit, isLoading }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    productId: "",
    quantity: "",
    unitPrice: "",
    salespersonId: "",
    customerName: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    const salesperson = salespeople.find((s: any) => s.id.toString() === formData.salespersonId);
    
    onSubmit({
      date: formData.date,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount: (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toString(),
      salespersonId: parseInt(formData.salespersonId),
      salespersonName: salesperson?.name || "",
      customerName: formData.customerName,
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product: any) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price (৳)</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesperson">Salesperson</Label>
        <Select value={formData.salespersonId} onValueChange={(value) => setFormData({ ...formData, salespersonId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson" />
          </SelectTrigger>
          <SelectContent>
            {salespeople.map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name (Optional)</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {formData.quantity && formData.unitPrice && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Total Amount: ৳{(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString()}
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Recording..." : "Record Sale"}
      </Button>
    </form>
  );
}

function WeeklyTargetForm({ products, salespeople, onSubmit, isLoading }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    weekStartDate: "",
    weekEndDate: "",
    productId: "",
    targetAmount: "",
    salespersonId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    
    onSubmit({
      weekStartDate: formData.weekStartDate,
      weekEndDate: formData.weekEndDate,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      targetAmount: formData.targetAmount,
      salespersonId: formData.salespersonId ? parseInt(formData.salespersonId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weekStartDate">Week Start Date</Label>
          <Input
            id="weekStartDate"
            type="date"
            value={formData.weekStartDate}
            onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekEndDate">Week End Date</Label>
          <Input
            id="weekEndDate"
            type="date"
            value={formData.weekEndDate}
            onChange={(e) => setFormData({ ...formData, weekEndDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product: any) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (৳)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesperson">Salesperson (Optional - Leave empty for team target)</Label>
        <Select value={formData.salespersonId} onValueChange={(value) => setFormData({ ...formData, salespersonId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson or leave for team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Team Target</SelectItem>
            {salespeople.map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Setting..." : "Set Weekly Target"}
      </Button>
    </form>
  );
}

function MonthlyTargetForm({ products, salespeople, onSubmit, isLoading }: { products: any[]; salespeople: any[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    productId: "",
    targetAmount: "",
    salespersonId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === formData.productId);
    
    onSubmit({
      month: formData.month,
      year: formData.year,
      productId: parseInt(formData.productId) || 1,
      productName: product?.name || "",
      targetAmount: formData.targetAmount,
      salespersonId: formData.salespersonId ? parseInt(formData.salespersonId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select value={formData.month.toString()} onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {format(new Date(2024, i, 1), "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product: any) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (৳)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesperson">Salesperson (Optional - Leave empty for team target)</Label>
        <Select value={formData.salespersonId} onValueChange={(value) => setFormData({ ...formData, salespersonId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesperson or leave for team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Team Target</SelectItem>
            {salespeople.map((person: any) => (
              <SelectItem key={person.id} value={person.id.toString()}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Setting..." : "Set Monthly Target"}
      </Button>
    </form>
  );
}

function DailySalesTable({ sales, isLoading }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sales data...</div>;
  }

  if (!sales || sales.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No sales recorded yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Total Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale: any) => (
          <TableRow key={sale.id}>
            <TableCell>{format(new Date(sale.date), "dd MMM yyyy")}</TableCell>
            <TableCell className="font-medium">{sale.productName}</TableCell>
            <TableCell>{sale.salespersonName}</TableCell>
            <TableCell>{sale.customerName || "-"}</TableCell>
            <TableCell className="text-right">{sale.quantity}</TableCell>
            <TableCell className="text-right">৳{parseFloat(sale.unitPrice).toLocaleString()}</TableCell>
            <TableCell className="text-right font-semibold">৳{parseFloat(sale.totalAmount).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WeeklyTargetsTable({ targets, isLoading }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading targets...</div>;
  }

  if (!targets || targets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No weekly targets set yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Week Period</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Achieved</TableHead>
          <TableHead className="text-right">Achievement</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target: any) => {
          const achievementRate = (parseFloat(target.achievedAmount) / parseFloat(target.targetAmount)) * 100;
          return (
            <TableRow key={target.id}>
              <TableCell>
                {format(new Date(target.weekStartDate), "dd MMM")} - {format(new Date(target.weekEndDate), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{target.productName}</TableCell>
              <TableCell>{target.salespersonId ? "Individual" : "Team"}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold">{achievementRate.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge
                  variant={achievementRate >= 100 ? "default" : achievementRate >= 80 ? "secondary" : "destructive"}
                >
                  {achievementRate >= 100 ? "Achieved" : achievementRate >= 80 ? "On Track" : "Behind"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function MonthlyTargetsTable({ targets, isLoading }: any) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading targets...</div>;
  }

  if (!targets || targets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No monthly targets set yet</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Salesperson</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Achieved</TableHead>
          <TableHead className="text-right">Achievement</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target: any) => {
          const achievementRate = (parseFloat(target.achievedAmount) / parseFloat(target.targetAmount)) * 100;
          return (
            <TableRow key={target.id}>
              <TableCell>
                {format(new Date(target.year, target.month - 1, 1), "MMMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{target.productName}</TableCell>
              <TableCell>{target.salespersonId ? "Individual" : "Team"}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.targetAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right">৳{parseFloat(target.achievedAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold">{achievementRate.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge
                  variant={achievementRate >= 100 ? "default" : achievementRate >= 80 ? "secondary" : "destructive"}
                >
                  {achievementRate >= 100 ? "Achieved" : achievementRate >= 80 ? "On Track" : "Behind"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Helper functions
function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case "today":
      return format(now, "yyyy-MM-dd");
    case "this_week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return format(weekStart, "yyyy-MM-dd");
    case "this_month":
      return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
    case "this_quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      return format(new Date(now.getFullYear(), quarter * 3, 1), "yyyy-MM-dd");
    case "this_year":
      return format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd");
    default:
      return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
  }
}

function calculateAnalytics(dailySales: any[], weeklyTargets: any[], monthlyTargets: any[]) {
  const totalSales = dailySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || "0"), 0);
  const totalTransactions = dailySales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Calculate achievement rate from monthly targets
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthTargets = monthlyTargets.filter(
    (t: any) => t.month === currentMonth && t.year === currentYear
  );
  const totalTarget = currentMonthTargets.reduce((sum, t) => sum + parseFloat(t.targetAmount || "0"), 0);
  const totalAchieved = currentMonthTargets.reduce((sum, t) => sum + parseFloat(t.achievedAmount || "0"), 0);
  const achievementRate = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  // Active salespeople
  const uniqueSalespeople = new Set(dailySales.map(s => s.salespersonName));
  const activeSalespeople = uniqueSalespeople.size;

  // Top salesperson
  const salespersonSales: Record<string, number> = {};
  dailySales.forEach(sale => {
    salespersonSales[sale.salespersonName] = (salespersonSales[sale.salespersonName] || 0) + parseFloat(sale.totalAmount);
  });
  const topSalesperson = Object.entries(salespersonSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Trend data
  const salesByDate: Record<string, number> = {};
  dailySales.forEach(sale => {
    const date = format(new Date(sale.date), "MMM dd");
    salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.totalAmount);
  });
  const trendData = Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));

  // Product data
  const salesByProduct: Record<string, number> = {};
  dailySales.forEach(sale => {
    salesByProduct[sale.productName] = (salesByProduct[sale.productName] || 0) + parseFloat(sale.totalAmount);
  });
  const productData = Object.entries(salesByProduct).map(([name, value]) => ({ name, value }));

  // Salesperson data
  const salespersonData = Object.entries(salespersonSales).map(([name, sales]) => ({
    name,
    sales,
    target: 0, // Can be enhanced with actual targets
  }));

  return {
    totalSales,
    salesGrowth: 12, // Placeholder - can be calculated from historical data
    achievementRate,
    totalTransactions,
    avgTransactionValue,
    activeSalespeople,
    topSalesperson,
    trendData,
    productData,
    salespersonData,
  };
}
