import { useState, useMemo } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  TrendingDown,
  BarChart3,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Box,
  DollarSign
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";

export default function Inventory() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  
  // Queries - Real database data
  const { data: products = [], isLoading: loadingProducts } = trpc.products.getActiveProducts.useQuery();
  const { data: productsWithInventory = [] } = trpc.products.getProductsWithInventory.useQuery();
  const { data: allInventory = [], isLoading: loadingInventory } = trpc.products.getAllInventoryWithProducts.useQuery();
  const { data: warehouses = [], isLoading: loadingWarehouses } = trpc.products.getWarehouses.useQuery();
  const { data: transactions = [], isLoading: loadingTransactions } = trpc.products.getInventoryTransactions.useQuery({ limit: 100 });
  
  // Form states
  const [adjustForm, setAdjustForm] = useState({
    productId: undefined as number | undefined,
    warehouseId: undefined as number | undefined,
    adjustmentType: "add" as "add" | "remove" | "set",
    quantity: 0,
    reason: "count" as string,
    notes: "",
  });
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    contactPerson: "",
    contactPhone: "",
  });
  
  // Mutations
  const adjustStock = trpc.products.adjustStock.useMutation({
    onSuccess: () => {
      utils.products.getAllInventoryWithProducts.invalidate();
      utils.products.getProductsWithInventory.invalidate();
      utils.products.getInventoryTransactions.invalidate();
      toast.success("Stock adjusted successfully");
      setShowAdjustDialog(false);
      setAdjustForm({ productId: undefined, warehouseId: undefined, adjustmentType: "add", quantity: 0, reason: "count", notes: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const createWarehouse = trpc.products.createWarehouse.useMutation({
    onSuccess: () => {
      utils.products.getWarehouses.invalidate();
      toast.success("Warehouse created successfully");
      setShowWarehouseDialog(false);
      resetWarehouseForm();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateWarehouse = trpc.products.updateWarehouse.useMutation({
    onSuccess: () => {
      utils.products.getWarehouses.invalidate();
      toast.success("Warehouse updated successfully");
      setShowWarehouseDialog(false);
      setEditingWarehouse(null);
      resetWarehouseForm();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteWarehouse = trpc.products.deleteWarehouse.useMutation({
    onSuccess: () => {
      utils.products.getWarehouses.invalidate();
      toast.success("Warehouse deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  const resetWarehouseForm = () => {
    setWarehouseForm({ name: "", code: "", address: "", city: "", country: "", contactPerson: "", contactPhone: "" });
  };
  
  // Computed stats from real data
  const stats = useMemo(() => {
    let totalStockUnits = 0;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    products.forEach((product: any) => {
      const invData = productsWithInventory.find((p: any) => p.id === product.id) as any;
      const stock = invData?.totalStock ? parseFloat(String(invData.totalStock)) : 0;
      const purchasePrice = parseFloat(product.purchasePrice || "0");
      
      totalStockUnits += stock;
      totalStockValue += stock * purchasePrice;
      
      if (product.alertQuantity && stock > 0 && stock <= product.alertQuantity) {
        lowStockCount++;
      }
      if (stock === 0) {
        outOfStockCount++;
      }
    });
    
    return { 
      totalSKUs: products.length, 
      totalStockUnits,
      totalStockValue, 
      lowStockCount,
      outOfStockCount,
      warehouseCount: warehouses.length
    };
  }, [products, productsWithInventory, warehouses]);
  
  // Filter inventory by search
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return allInventory;
    return allInventory.filter((inv: any) =>
      inv.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allInventory, searchQuery]);
  
  // Get transaction type display
  const getTransactionTypeDisplay = (type: string) => {
    const types: Record<string, { label: string; color: string; icon: any }> = {
      purchase: { label: "Purchase", color: "bg-green-100 text-green-700", icon: ArrowDown },
      sale: { label: "Sale", color: "bg-red-100 text-red-700", icon: ArrowUp },
      adjustment: { label: "Adjustment", color: "bg-orange-100 text-orange-700", icon: RefreshCw },
      transfer_in: { label: "Transfer In", color: "bg-blue-100 text-blue-700", icon: ArrowDown },
      transfer_out: { label: "Transfer Out", color: "bg-purple-100 text-purple-700", icon: ArrowUp },
      return: { label: "Return", color: "bg-teal-100 text-teal-700", icon: RefreshCw },
      damage: { label: "Damage", color: "bg-red-100 text-red-700", icon: AlertTriangle },
      opening_stock: { label: "Opening Stock", color: "bg-gray-100 text-gray-700", icon: Box },
    };
    return types[type] || { label: type, color: "bg-gray-100 text-gray-700", icon: Box };
  };
  
  // Handle stock adjustment
  const handleAdjustStock = () => {
    if (!adjustForm.productId || !adjustForm.warehouseId) {
      toast.error("Please select a product and warehouse");
      return;
    }
    
    let quantityChange = adjustForm.quantity;
    let transactionType = "adjustment";
    
    // Map reason to transaction type
    const reasonToType: Record<string, string> = {
      count: "adjustment",
      damage: "damage",
      return: "return",
      purchase: "purchase",
      sale: "sale",
      other: "adjustment",
    };
    
    if (adjustForm.adjustmentType === "add") {
      quantityChange = Math.abs(adjustForm.quantity);
      transactionType = reasonToType[adjustForm.reason] || "purchase";
    } else if (adjustForm.adjustmentType === "remove") {
      quantityChange = -Math.abs(adjustForm.quantity);
      transactionType = reasonToType[adjustForm.reason] || "adjustment";
    } else if (adjustForm.adjustmentType === "set") {
      // For "set", we need to calculate the delta from current stock
      // Find current inventory for this product+warehouse
      const currentInv = allInventory.find((inv: any) => 
        inv.productId === adjustForm.productId && inv.warehouseId === adjustForm.warehouseId
      );
      const currentQty = currentInv ? parseFloat(String(currentInv.quantity || "0")) : 0;
      quantityChange = adjustForm.quantity - currentQty;
      transactionType = "adjustment";
    }
    
    adjustStock.mutate({
      productId: adjustForm.productId,
      warehouseId: adjustForm.warehouseId,
      quantityChange,
      transactionType: transactionType as any,
      notes: adjustForm.notes || `${adjustForm.reason}: ${adjustForm.adjustmentType === "set" ? "Set to" : adjustForm.adjustmentType} ${adjustForm.quantity} units`,
    });
  };
  
  const openEditWarehouse = (wh: any) => {
    setEditingWarehouse(wh);
    setWarehouseForm({
      name: wh.name || "",
      code: wh.code || "",
      address: wh.address || "",
      city: wh.city || "",
      country: wh.country || "",
      contactPerson: wh.contactPerson || "",
      contactPhone: wh.contactPhone || "",
    });
    setShowWarehouseDialog(true);
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
            <Button onClick={() => {
              setAdjustForm({ productId: undefined, warehouseId: undefined, adjustmentType: "add", quantity: 0, reason: "count", notes: "" });
              setShowAdjustDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Stock Adjustment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SKUs</p>
                  <p className="text-2xl font-bold">{stats.totalSKUs}</p>
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
                  <p className="text-sm text-muted-foreground">Total Stock</p>
                  <p className="text-2xl font-bold">{stats.totalStockUnits.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Box className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalStockValue, currency)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.lowStockCount > 0 ? "border-yellow-300 bg-yellow-50/30" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? "text-yellow-600" : ""}`}>{stats.lowStockCount}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.lowStockCount > 0 ? "bg-yellow-100" : "bg-muted"}`}>
                  <AlertTriangle className={`w-5 h-5 ${stats.lowStockCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.outOfStockCount > 0 ? "border-red-300 bg-red-50/30" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className={`text-2xl font-bold ${stats.outOfStockCount > 0 ? "text-red-600" : ""}`}>{stats.outOfStockCount}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.outOfStockCount > 0 ? "bg-red-100" : "bg-muted"}`}>
                  <TrendingDown className={`w-5 h-5 ${stats.outOfStockCount > 0 ? "text-red-600" : "text-muted-foreground"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warehouses</p>
                  <p className="text-2xl font-bold">{stats.warehouseCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-indigo-600" />
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

          {/* Stock Levels Tab */}
          <TabsContent value="stock" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingInventory ? (
                  <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">SKU</th>
                        <th className="text-left p-4 text-sm font-medium">Warehouse</th>
                        <th className="text-right p-4 text-sm font-medium">Quantity</th>
                        <th className="text-right p-4 text-sm font-medium">Reserved</th>
                        <th className="text-right p-4 text-sm font-medium">Available</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-muted-foreground">
                            No inventory records found. Add stock to products to see inventory here.
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((inv: any) => {
                          const quantity = parseFloat(inv.quantity || "0");
                          const reserved = parseFloat(inv.reservedQuantity || "0");
                          const available = quantity - reserved;
                          
                          return (
                            <tr key={inv.id} className="hover:bg-muted/30">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium text-sm">{inv.productName}</span>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{inv.sku || "-"}</td>
                              <td className="p-4">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{inv.warehouseName}</span>
                              </td>
                              <td className="p-4 text-right font-medium">{quantity}</td>
                              <td className="p-4 text-right text-muted-foreground">{reserved}</td>
                              <td className="p-4 text-right font-medium text-green-600">{available}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setAdjustForm({
                                        productId: inv.productId,
                                        warehouseId: inv.warehouseId,
                                        adjustmentType: "add",
                                        quantity: 0,
                                        reason: "count",
                                        notes: "",
                                      });
                                      setShowAdjustDialog(true);
                                    }}
                                  >
                                    <ArrowUpDown className="w-4 h-4 mr-1" />
                                    Adjust
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {loadingTransactions ? (
                  <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Date</th>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">Warehouse</th>
                        <th className="text-left p-4 text-sm font-medium">Type</th>
                        <th className="text-right p-4 text-sm font-medium">Quantity</th>
                        <th className="text-right p-4 text-sm font-medium">Prev Qty</th>
                        <th className="text-right p-4 text-sm font-medium">New Qty</th>
                        <th className="text-left p-4 text-sm font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-muted-foreground">
                            No stock movements recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx: any) => {
                          const typeInfo = getTransactionTypeDisplay(tx.transactionType);
                          const IconComponent = typeInfo.icon;
                          
                          return (
                            <tr key={tx.id} className="hover:bg-muted/30">
                              <td className="p-4 text-sm text-muted-foreground">
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="p-4">
                                <span className="font-medium text-sm">{tx.productName || `Product #${tx.productId}`}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  {tx.warehouseName || `Warehouse #${tx.warehouseId}`}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${typeInfo.color}`}>
                                  <IconComponent className="w-3 h-3" />
                                  {typeInfo.label}
                                </span>
                              </td>
                              <td className={`p-4 text-right font-medium ${parseFloat(tx.quantity) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {parseFloat(tx.quantity) >= 0 ? "+" : ""}{parseFloat(tx.quantity)}
                              </td>
                              <td className="p-4 text-right text-muted-foreground">
                                {tx.previousQuantity ? parseFloat(tx.previousQuantity) : "-"}
                              </td>
                              <td className="p-4 text-right font-medium">
                                {tx.newQuantity ? parseFloat(tx.newQuantity) : "-"}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                                {tx.notes || "-"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                setEditingWarehouse(null);
                resetWarehouseForm();
                setShowWarehouseDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Warehouse
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingWarehouses ? (
                  <div className="text-center py-8 text-muted-foreground">Loading warehouses...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Name</th>
                        <th className="text-left p-4 text-sm font-medium">Code</th>
                        <th className="text-left p-4 text-sm font-medium">Location</th>
                        <th className="text-left p-4 text-sm font-medium">Contact</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {warehouses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No warehouses found. Add a warehouse to start tracking inventory.
                          </td>
                        </tr>
                      ) : (
                        warehouses.map((wh: any) => (
                          <tr key={wh.id} className="hover:bg-muted/30">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Warehouse className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="font-medium text-sm">{wh.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{wh.code || "-"}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {[wh.city, wh.country].filter(Boolean).join(", ") || "-"}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {wh.contactPerson || "-"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditWarehouse(wh)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this warehouse?")) {
                                      deleteWarehouse.mutate({ id: wh.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stock Adjustment Dialog */}
        <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product *</label>
                <select 
                  value={adjustForm.productId || ""} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: parseInt(e.target.value) || undefined })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select product</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku || "No SKU"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Warehouse *</label>
                <select 
                  value={adjustForm.warehouseId || ""} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: parseInt(e.target.value) || undefined })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Adjustment Type *</label>
                <select 
                  value={adjustForm.adjustmentType} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value as any })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                  <option value="set">Set Stock Level</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input 
                  type="number" 
                  value={adjustForm.quantity} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })}
                  className="mt-1" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <select 
                  value={adjustForm.reason} 
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="count">Physical Count</option>
                  <option value="damage">Damaged Goods</option>
                  <option value="return">Customer Return</option>
                  <option value="purchase">New Purchase</option>
                  <option value="sale">Sale</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>Cancel</Button>
                <Button onClick={handleAdjustStock} disabled={adjustStock.isPending}>
                  {adjustStock.isPending ? "Saving..." : "Save Adjustment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warehouse Dialog */}
        <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input 
                  value={warehouseForm.name} 
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} 
                  className="mt-1" 
                  placeholder="e.g., Main Warehouse" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input 
                  value={warehouseForm.code} 
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })} 
                  className="mt-1" 
                  placeholder="e.g., WH-001" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={warehouseForm.address} 
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })} 
                  className="mt-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={warehouseForm.city} 
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={warehouseForm.country} 
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, country: e.target.value })} 
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input 
                    value={warehouseForm.contactPerson} 
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, contactPerson: e.target.value })} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input 
                    value={warehouseForm.contactPhone} 
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, contactPhone: e.target.value })} 
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowWarehouseDialog(false)}>Cancel</Button>
                <Button 
                  onClick={() => editingWarehouse ? updateWarehouse.mutate({ id: editingWarehouse.id, ...warehouseForm }) : createWarehouse.mutate(warehouseForm)}
                  disabled={createWarehouse.isPending || updateWarehouse.isPending}
                >
                  {(createWarehouse.isPending || updateWarehouse.isPending) ? "Saving..." : (editingWarehouse ? "Update" : "Create")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
