import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { useState } from "react";
import {
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Warehouse,
  RefreshCw,
  Calculator,
  ClipboardList,
  Plus,
  Shield,
  ScrollText,
} from "lucide-react";
import RFQTab from "./scm/RFQTab";
import ShipmentsTab from "./scm/ShipmentsTab";
import SupplierRiskTab from "./scm/SupplierRiskTab";
import AuditTrailTab from "./scm/AuditTrailTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

const poStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-amber-100 text-amber-800",
  received: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const soStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  reserved: "bg-indigo-100 text-indigo-800",
  partially_shipped: "bg-amber-100 text-amber-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function SCM() {
  const { currency } = useCurrency();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [atpDialogOpen, setAtpDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: products } = trpc.products.getActiveProducts.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: warehouses } = trpc.products.getWarehouses.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: vendors } = trpc.procurement.getVendors.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: purchaseOrders } = trpc.procurement.getPurchaseOrders.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: inventoryData } = trpc.products.getAllInventoryWithProducts.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: replenishmentAlerts } = trpc.scm.checkAllReplenishments.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const { data: atpData, refetch: refetchAtp } = trpc.scm.calculateATP.useQuery(
    { productId: selectedProduct || 0, warehouseId: selectedWarehouse || undefined },
    { enabled: !!selectedProduct }
  );

  const createReplenishmentMutation = trpc.scm.createReplenishmentRequest.useMutation({
    onSuccess: () => {
      toast.success("Replenishment request created");
      utils.scm.checkAllReplenishments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const approveReplenishmentMutation = trpc.scm.approveReplenishmentRequest.useMutation({
    onSuccess: () => {
      toast.success("Replenishment request approved");
      utils.scm.checkAllReplenishments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const convertToPOMutation = trpc.scm.convertToPurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Purchase Order ${data.poNumber} created`);
      utils.scm.checkAllReplenishments.invalidate();
      utils.procurement.getPurchaseOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalInventoryValue = inventoryData?.reduce((sum, inv: any) => {
    const qty = parseFloat(inv.quantity || "0");
    const price = parseFloat(inv.product?.purchasePrice || inv.purchasePrice || "0");
    return sum + qty * price;
  }, 0) || 0;

  const pendingPOs = purchaseOrders?.filter(
    (po) => po.status === "sent" || po.status === "confirmed"
  ).length || 0;

  const lowStockCount = replenishmentAlerts?.length || 0;

  const inTransitPOs = purchaseOrders?.filter((po) => po.status === "in_transit").length || 0;

  const handleCheckATP = (productId: number) => {
    setSelectedProduct(productId);
    setAtpDialogOpen(true);
  };

  const handleCreateReplenishment = (productId: number, warehouseId: number) => {
    createReplenishmentMutation.mutate({ productId, warehouseId });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SCM Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Supply Chain Management - ATP, Replenishment & Inventory Control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => utils.scm.checkAllReplenishments.invalidate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Inventory Value</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalInventoryValue, currency)}
                </p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Warehouse className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Real-time valuation</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold mt-1">{pendingPOs}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-amber-100 text-sm">
              <FileText className="h-4 w-4 mr-1" />
              <span>POs awaiting action</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Low Stock Alerts</p>
                <p className="text-2xl font-bold mt-1">{lowStockCount}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-red-100 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>Items below reorder point</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">In Transit</p>
                <p className="text-2xl font-bold mt-1">{inTransitPOs}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-100 text-sm">
              <Package className="h-4 w-4 mr-1" />
              <span>Shipments on the way</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="replenishment" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="replenishment" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Replenishment Alerts
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="atp" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            ATP Calculator
          </TabsTrigger>
          <TabsTrigger value="sales-orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Sales Orders
          </TabsTrigger>
          <TabsTrigger value="rfq" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            RFQ
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="supplier-risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Supplier Risk
          </TabsTrigger>
          <TabsTrigger value="audit-trail" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="replenishment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Auto-Replenishment Alerts (EOQ)
              </CardTitle>
              <CardDescription>
                Products below reorder point with EOQ-calculated suggested quantities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {replenishmentAlerts && replenishmentAlerts.length > 0 ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words">Product</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Current Stock</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Reorder Point</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Suggested Qty (EOQ)</TableHead>
                      <TableHead className="whitespace-normal break-words">Status</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {replenishmentAlerts.map((alert) => (
                      <TableRow key={alert.productId}>
                        <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{alert.productName}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                          <span className={alert.currentStock <= 0 ? "text-red-600 font-bold" : ""}>
                            {alert.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{alert.reorderPoint}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                          <Badge variant="outline" className="bg-blue-50">
                            {alert.suggestedQty}
                          </Badge>
                          {alert.eoqDetails && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (EOQ: {alert.eoqDetails.eoq})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                          <Badge className="bg-red-100 text-red-800">
                            Below Reorder
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                          <Button
                            size="sm"
                            onClick={() => handleCreateReplenishment(alert.productId, 1)}
                            disabled={createReplenishmentMutation.isPending}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">All Stock Levels Healthy</p>
                  <p className="text-sm">No products currently below reorder point</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Purchase Order Lifecycle
              </CardTitle>
              <CardDescription>
                Track PO status with color-coded lifecycle stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseOrders && purchaseOrders.length > 0 ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words">PO Number</TableHead>
                      <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                      <TableHead className="whitespace-normal break-words">Order Date</TableHead>
                      <TableHead className="whitespace-normal break-words">Expected Delivery</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Amount</TableHead>
                      <TableHead className="whitespace-normal break-words">Status</TableHead>
                      <TableHead className="whitespace-normal break-words">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.slice(0, 10).map((po) => {
                      const statusSteps = ["draft", "sent", "confirmed", "in_transit", "received"];
                      const currentStep = statusSteps.indexOf(po.status || "draft");
                      const progress = ((currentStep + 1) / statusSteps.length) * 100;

                      return (
                        <TableRow key={po.id}>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{po.poNumber}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendors?.find(v => v.id === po.vendorId)?.name || "N/A"}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            {po.orderDate ? format(new Date(po.orderDate), "MMM dd, yyyy") : "-"}
                          </TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            {po.expectedDeliveryDate
                              ? format(new Date(po.expectedDeliveryDate), "MMM dd, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                            {formatCurrency(parseFloat(po.totalAmount || "0"), currency)}
                          </TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <Badge className={poStatusColors[po.status || "draft"]}>
                              {(po.status || "draft").replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="break-words w-32" style={{ overflowWrap: "break-word" }}>
                            <Progress value={progress} className="h-2" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No Purchase Orders</p>
                  <p className="text-sm">Create a purchase order to track here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-500" />
                Available-to-Promise (ATP) Calculator
              </CardTitle>
              <CardDescription>
                Check real-time stock availability considering reservations and incoming POs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label>Select Product</Label>
                  <Select
                    value={selectedProduct?.toString() || ""}
                    onValueChange={(v) => setSelectedProduct(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Warehouse (Optional)</Label>
                  <Select
                    value={selectedWarehouse?.toString() || "all"}
                    onValueChange={(v) => setSelectedWarehouse(v === "all" ? null : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {warehouses?.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => refetchAtp()} disabled={!selectedProduct}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate ATP
                  </Button>
                </div>
              </div>

              {atpData && selectedProduct && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">ATP Result</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-muted-foreground">On-Hand Stock</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {atpData.breakdown.onHand}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-muted-foreground">Reserved</p>
                      <p className="text-2xl font-bold text-amber-600">
                        -{atpData.breakdown.reserved}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-muted-foreground">Incoming POs</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{atpData.incomingPOQty}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-indigo-500">
                      <p className="text-sm text-muted-foreground">ATP Quantity</p>
                      <p className={`text-2xl font-bold ${atpData.atpQty > 0 ? "text-green-600" : "text-red-600"}`}>
                        {atpData.atpQty}
                      </p>
                    </div>
                  </div>

                  {atpData.breakdown.incoming.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Incoming Purchase Orders</h4>
                      <div className="space-y-2">
                        {atpData.breakdown.incoming.map((po, idx) => (
                          <div key={idx} className="bg-white rounded p-3 flex justify-between items-center">
                            <span className="font-medium">{po.poNumber}</span>
                            <span className="text-green-600">+{po.qty} units</span>
                            <span className="text-muted-foreground text-sm">
                              {po.expectedDate
                                ? format(new Date(po.expectedDate), "MMM dd, yyyy")
                                : "No ETA"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!selectedProduct && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a Product</p>
                  <p className="text-sm">Choose a product to calculate its available-to-promise quantity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Sales Order Lifecycle
              </CardTitle>
              <CardDescription>
                Track sales orders with color-coded lifecycle stages and ATP status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Sales Orders Coming Soon</p>
                <p className="text-sm">This feature integrates with the ATP system for real-time availability tracking</p>
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  {Object.entries(soStatusColors).map(([status, colorClass]) => (
                    <Badge key={status} className={colorClass}>
                      {status.replace("_", " ").toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Available statuses for sales order lifecycle tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className="space-y-4">
          <RFQTab />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <ShipmentsTab />
        </TabsContent>

        <TabsContent value="supplier-risk" className="space-y-4">
          <SupplierRiskTab />
        </TabsContent>

        <TabsContent value="audit-trail" className="space-y-4">
          <AuditTrailTab />
        </TabsContent>
      </Tabs>

      <Dialog open={atpDialogOpen} onOpenChange={setAtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ATP Details</DialogTitle>
          </DialogHeader>
          {atpData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Stock</Label>
                  <p className="text-2xl font-bold">{atpData.currentStock}</p>
                </div>
                <div>
                  <Label>ATP Quantity</Label>
                  <p className="text-2xl font-bold text-green-600">{atpData.atpQty}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAtpDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
