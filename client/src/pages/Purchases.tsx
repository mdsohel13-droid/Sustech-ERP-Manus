import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Send
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendor: string;
  vendorId: number;
  date: string;
  expectedDate: string;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
}

// Sample data
const SAMPLE_POS: PurchaseOrder[] = [
  { id: 1, poNumber: "PO-2026-001", vendor: "Solar Panels Inc", vendorId: 1, date: "2026-01-15", expectedDate: "2026-01-25", status: "confirmed", items: 3, subtotal: 540000, tax: 27000, total: 567000 },
  { id: 2, poNumber: "PO-2026-002", vendor: "Battery World", vendorId: 2, date: "2026-01-14", expectedDate: "2026-01-24", status: "sent", items: 2, subtotal: 280000, tax: 14000, total: 294000 },
  { id: 3, poNumber: "PO-2026-003", vendor: "Inverter Solutions", vendorId: 3, date: "2026-01-10", expectedDate: "2026-01-20", status: "received", items: 5, subtotal: 650000, tax: 32500, total: 682500 },
  { id: 4, poNumber: "PO-2026-004", vendor: "Cable & Wire Co", vendorId: 4, date: "2026-01-16", expectedDate: "2026-01-26", status: "draft", items: 4, subtotal: 45000, tax: 2250, total: 47250 },
  { id: 5, poNumber: "PO-2025-098", vendor: "Solar Panels Inc", vendorId: 1, date: "2025-12-20", expectedDate: "2025-12-30", status: "cancelled", items: 2, subtotal: 180000, tax: 9000, total: 189000 },
];

const SAMPLE_VENDORS: Vendor[] = [
  { id: 1, name: "Solar Panels Inc", email: "sales@solarpanels.com", phone: "+880 1712-111111", address: "Dhaka", totalOrders: 15, totalSpent: 2500000, rating: 4.8 },
  { id: 2, name: "Battery World", email: "orders@batteryworld.com", phone: "+880 1812-222222", address: "Chittagong", totalOrders: 8, totalSpent: 1200000, rating: 4.5 },
  { id: 3, name: "Inverter Solutions", email: "info@invertersol.com", phone: "+880 1912-333333", address: "Dhaka", totalOrders: 12, totalSpent: 3200000, rating: 4.9 },
  { id: 4, name: "Cable & Wire Co", email: "sales@cablewire.com", phone: "+880 1612-444444", address: "Gazipur", totalOrders: 20, totalSpent: 450000, rating: 4.2 },
];

export default function Purchases() {
  const { currency } = useCurrency();
  const [purchaseOrders] = useState<PurchaseOrder[]>(SAMPLE_POS);
  const [vendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowViewDialog(true);
  };

  const handleEditPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowEditDialog(true);
  };

  const handleDownloadPO = (po: PurchaseOrder) => {
    const content = `Purchase Order: ${po.poNumber}\nVendor: ${po.vendor}\nDate: ${po.date}\nTotal: ${formatCurrency(po.total, currency)}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `${po.poNumber}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeletePO = (po: PurchaseOrder) => {
    if (confirm(`Are you sure you want to delete ${po.poNumber}?`)) {
      // TODO: Implement delete functionality
      console.log("Delete PO:", po.id);
    }
  };

  // Filter POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           po.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalPOs = purchaseOrders.length;
    const pendingPOs = purchaseOrders.filter(po => ["draft", "sent", "confirmed"].includes(po.status)).length;
    const totalSpent = purchaseOrders.filter(po => po.status === "received").reduce((sum, po) => sum + po.total, 0);
    const avgOrderValue = totalSpent / purchaseOrders.filter(po => po.status === "received").length || 0;
    return { totalPOs, pendingPOs, totalSpent, avgOrderValue };
  }, [purchaseOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1"><FileText className="w-3 h-3" />Draft</span>;
      case "sent": return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><Send className="w-3 h-3" />Sent</span>;
      case "confirmed": return <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmed</span>;
      case "received": return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" />Received</span>;
      case "cancelled": return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" />Cancelled</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Purchases</h1>
            <p className="text-muted-foreground">Manage purchase orders and vendors</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Vendor *</label>
                    <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="">Select vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expected Delivery</label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Items</label>
                  <div className="mt-2 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-4 mb-3">
                      <select className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="">Select product</option>
                        <option value="1">Solar Panel 400W</option>
                        <option value="2">Inverter 5KW</option>
                        <option value="3">Battery 200Ah</option>
                      </select>
                      <Input type="number" placeholder="Qty" className="w-24" />
                      <Input type="number" placeholder="Unit Price" className="w-32" />
                      <Button variant="outline" size="sm">Add</Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    placeholder="Additional notes for the vendor..."
                    className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button variant="outline">Save as Draft</Button>
                  <Button onClick={() => setShowCreateDialog(false)}>Create & Send</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalPOs}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPOs}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent, currency)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue, currency)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {["all", "draft", "sent", "confirmed", "received", "cancelled"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                      statusFilter === status
                        ? "bg-background shadow-sm"
                        : "hover:bg-background/50"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>

            {/* PO Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">PO Number</th>
                        <th className="text-left p-4 text-sm font-medium">Vendor</th>
                        <th className="text-left p-4 text-sm font-medium">Date</th>
                        <th className="text-left p-4 text-sm font-medium">Expected</th>
                        <th className="text-center p-4 text-sm font-medium">Items</th>
                        <th className="text-right p-4 text-sm font-medium">Total</th>
                        <th className="text-center p-4 text-sm font-medium">Status</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPOs.map(po => (
                        <tr key={po.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <button onClick={() => handleViewPO(po)} className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{po.poNumber}</button>
                          </td>
                          <td className="p-4">
                            <button onClick={() => handleViewPO(po)} className="flex items-center gap-2 text-left w-full hover:opacity-70">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-blue-600 hover:text-blue-800 hover:underline">{po.vendor}</span>
                            </button>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{po.date}</td>
                          <td className="p-4 text-sm text-muted-foreground">{po.expectedDate}</td>
                          <td className="p-4 text-center">{po.items}</td>
                          <td className="p-4 text-right font-medium">{formatCurrency(po.total, currency)}</td>
                          <td className="p-4 text-center">{getStatusBadge(po.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleViewPO(po)} className="p-1.5 hover:bg-muted rounded-md" title="View">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button onClick={() => handleEditPO(po)} className="p-1.5 hover:bg-muted rounded-md" title="Edit">
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button onClick={() => handleDownloadPO(po)} className="p-1.5 hover:bg-muted rounded-md" title="Download">
                                <Download className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(vendor => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <button onClick={() => {}} className="flex items-center gap-3 text-left flex-1 hover:opacity-70">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-600 hover:text-blue-800 hover:underline">{vendor.name}</h3>
                          <p className="text-xs text-muted-foreground">{vendor.address}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="text-sm font-medium">{vendor.rating}</span>
                        <span>★</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-medium">{vendor.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Spent</span>
                        <span className="font-medium">{formatCurrency(vendor.totalSpent, currency)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">View</Button>
                      <Button size="sm" className="flex-1">New PO</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Note: View and Edit dialogs for PO will be added in next update
