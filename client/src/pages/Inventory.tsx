import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Search, 
  Warehouse,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface StockItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  inStock: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  location: string;
  lastUpdated: string;
}

interface StockMovement {
  id: number;
  date: string;
  productName: string;
  sku: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reference: string;
  location: string;
  notes?: string;
}

// Sample data
const SAMPLE_STOCK: StockItem[] = [
  { id: 1, productName: "Solar Panel 400W", sku: "SP-400W", category: "Solar", inStock: 45, reserved: 5, available: 40, minStock: 10, maxStock: 100, reorderPoint: 15, unitCost: 18000, totalValue: 810000, location: "Warehouse A", lastUpdated: "2026-01-16" },
  { id: 2, productName: "Inverter 5KW", sku: "INV-5KW", category: "Inverter", inStock: 12, reserved: 2, available: 10, minStock: 5, maxStock: 30, reorderPoint: 8, unitCost: 65000, totalValue: 780000, location: "Warehouse A", lastUpdated: "2026-01-15" },
  { id: 3, productName: "Battery 200Ah", sku: "BAT-200", category: "Battery", inStock: 8, reserved: 0, available: 8, minStock: 10, maxStock: 50, reorderPoint: 12, unitCost: 35000, totalValue: 280000, location: "Warehouse B", lastUpdated: "2026-01-14" },
  { id: 4, productName: "Charge Controller 60A", sku: "CC-60A", category: "Controller", inStock: 25, reserved: 3, available: 22, minStock: 15, maxStock: 60, reorderPoint: 20, unitCost: 8000, totalValue: 200000, location: "Warehouse A", lastUpdated: "2026-01-16" },
  { id: 5, productName: "Solar Cable 4mm", sku: "SC-4MM", category: "Accessories", inStock: 500, reserved: 50, available: 450, minStock: 100, maxStock: 1000, reorderPoint: 200, unitCost: 80, totalValue: 40000, location: "Warehouse B", lastUpdated: "2026-01-16" },
];

const SAMPLE_MOVEMENTS: StockMovement[] = [
  { id: 1, date: "2026-01-16", productName: "Solar Panel 400W", sku: "SP-400W", type: "in", quantity: 20, reference: "PO-001", location: "Warehouse A", notes: "New shipment from supplier" },
  { id: 2, date: "2026-01-16", productName: "Inverter 5KW", sku: "INV-5KW", type: "out", quantity: 2, reference: "SO-042", location: "Warehouse A", notes: "Sold to Solar BD Ltd" },
  { id: 3, date: "2026-01-15", productName: "Battery 200Ah", sku: "BAT-200", type: "adjustment", quantity: -2, reference: "ADJ-001", location: "Warehouse B", notes: "Damaged units written off" },
  { id: 4, date: "2026-01-15", productName: "Solar Cable 4mm", sku: "SC-4MM", type: "transfer", quantity: 100, reference: "TRF-001", location: "Warehouse A → B", notes: "Inter-warehouse transfer" },
  { id: 5, date: "2026-01-14", productName: "Charge Controller 60A", sku: "CC-60A", type: "in", quantity: 15, reference: "PO-002", location: "Warehouse A" },
];

export default function Inventory() {
  const { currency } = useCurrency();
  const [stock] = useState<StockItem[]>(SAMPLE_STOCK);
  const [movements] = useState<StockMovement[]>(SAMPLE_MOVEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Filter stock
  const filteredStock = useMemo(() => {
    return stock.filter(item =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stock, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = stock.length;
    const totalValue = stock.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStock = stock.filter(item => item.available <= item.minStock).length;
    const needsReorder = stock.filter(item => item.available <= item.reorderPoint).length;
    return { totalItems, totalValue, lowStock, needsReorder };
  }, [stock]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in": return <ArrowDown className="w-4 h-4 text-green-600" />;
      case "out": return <ArrowUp className="w-4 h-4 text-red-600" />;
      case "adjustment": return <RefreshCw className="w-4 h-4 text-orange-600" />;
      case "transfer": return <ArrowUpDown className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in": return "bg-green-100 text-green-700";
      case "out": return "bg-red-100 text-red-700";
      case "adjustment": return "bg-orange-100 text-orange-700";
      case "transfer": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">Track stock levels and movements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Stock Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Stock Adjustment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Product *</label>
                    <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="">Select product</option>
                      {stock.map(item => (
                        <option key={item.id} value={item.id}>{item.productName} ({item.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Adjustment Type *</label>
                    <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="add">Add Stock</option>
                      <option value="remove">Remove Stock</option>
                      <option value="set">Set Stock Level</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity *</label>
                    <Input type="number" placeholder="0" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason</label>
                    <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="count">Physical Count</option>
                      <option value="damage">Damaged Goods</option>
                      <option value="return">Customer Return</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      placeholder="Additional notes..."
                      className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>Cancel</Button>
                    <Button onClick={() => setShowAdjustDialog(false)}>Save Adjustment</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SKUs</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue, currency)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Reorder</p>
                  <p className="text-2xl font-bold text-red-600">{stats.needsReorder}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
            <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Stock Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">SKU</th>
                        <th className="text-right p-4 text-sm font-medium">In Stock</th>
                        <th className="text-right p-4 text-sm font-medium">Reserved</th>
                        <th className="text-right p-4 text-sm font-medium">Available</th>
                        <th className="text-right p-4 text-sm font-medium">Min/Max</th>
                        <th className="text-right p-4 text-sm font-medium">Value</th>
                        <th className="text-left p-4 text-sm font-medium">Location</th>
                        <th className="text-center p-4 text-sm font-medium">Status</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredStock.map(item => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <HoverCard openDelay={200} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <button onClick={() => { setSelectedItem(item); setShowAdjustDialog(true); }} className="flex items-center gap-3 text-left w-full hover:opacity-70">
                                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline">{item.productName}</span>
                                </button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80" side="right">
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                      <Package className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg">{item.productName}</h4>
                                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Category</p>
                                      <p className="font-medium">{item.category}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Location</p>
                                      <p className="font-medium">{item.location}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">In Stock</p>
                                      <p className="font-medium">{item.inStock} ({item.available} available)</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Reserved</p>
                                      <p className="font-medium">{item.reserved}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Unit Cost</p>
                                      <p className="font-medium">{formatCurrency(item.unitCost, currency)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Total Value</p>
                                      <p className="font-semibold text-primary">{formatCurrency(item.totalValue, currency)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Reorder Point</p>
                                      <p className="font-medium">{item.reorderPoint}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Status</p>
                                      {item.available <= item.minStock ? (
                                        <Badge variant="destructive">Low Stock</Badge>
                                      ) : item.available <= item.reorderPoint ? (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">Reorder</Badge>
                                      ) : (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">OK</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{item.sku}</td>
                          <td className="p-4 text-right font-medium">{item.inStock}</td>
                          <td className="p-4 text-right text-muted-foreground">{item.reserved}</td>
                          <td className="p-4 text-right font-medium">{item.available}</td>
                          <td className="p-4 text-right text-sm text-muted-foreground">{item.minStock}/{item.maxStock}</td>
                          <td className="p-4 text-right font-medium">{formatCurrency(item.totalValue, currency)}</td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">{item.location}</span>
                          </td>
                          <td className="p-4 text-center">
                            {item.available <= item.minStock ? (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Low Stock</span>
                            ) : item.available <= item.reorderPoint ? (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Reorder</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">OK</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => { setSelectedItem(item); setShowAdjustDialog(true); }} className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setSelectedItem(item); }} className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50" title="Delete">
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Date</th>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-center p-4 text-sm font-medium">Type</th>
                        <th className="text-right p-4 text-sm font-medium">Quantity</th>
                        <th className="text-left p-4 text-sm font-medium">Reference</th>
                        <th className="text-left p-4 text-sm font-medium">Location</th>
                        <th className="text-left p-4 text-sm font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {movements.map(movement => (
                        <tr key={movement.id} className="hover:bg-muted/30">
                          <td className="p-4 text-sm">{movement.date}</td>
                          <td className="p-4">
                            <button onClick={() => {}} className="text-left w-full hover:opacity-70">
                              <p className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline">{movement.productName}</p>
                              <p className="text-xs text-muted-foreground">{movement.sku}</p>
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getMovementColor(movement.type)}`}>
                              {getMovementIcon(movement.type)}
                              {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-medium ${
                              movement.type === "in" ? "text-green-600" :
                              movement.type === "out" ? "text-red-600" :
                              movement.quantity > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {movement.type === "in" || movement.quantity > 0 ? "+" : ""}{movement.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{movement.reference}</td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">{movement.location}</span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{movement.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Warehouse A</CardTitle>
                      <p className="text-sm text-muted-foreground">Main Distribution Center</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total SKUs</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Units</span>
                      <span className="font-medium">82</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-medium">{formatCurrency(1990000, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capacity Used</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Warehouse B</CardTitle>
                      <p className="text-sm text-muted-foreground">Secondary Storage</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total SKUs</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Units</span>
                      <span className="font-medium">508</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-medium">{formatCurrency(320000, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capacity Used</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
