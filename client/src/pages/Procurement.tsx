import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  AlertTriangle,
  Users,
  TrendingUp,
  Package,
  Archive,
  RotateCcw
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  in_transit: "bg-amber-100 text-amber-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export default function Procurement() {
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreatePODialog, setShowCreatePODialog] = useState(false);
  const [showCreateVendorDialog, setShowCreateVendorDialog] = useState(false);
  const [showViewPODialog, setShowViewPODialog] = useState(false);
  const [showEditPODialog, setShowEditPODialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);

  const utils = trpc.useUtils();

  const { data: purchaseOrders = [] } = trpc.procurement.getPurchaseOrders.useQuery();
  const { data: archivedPOs = [] } = trpc.procurement.getArchivedPurchaseOrders.useQuery();
  const { data: vendors = [] } = trpc.procurement.getVendors.useQuery();
  const { data: archivedVendors = [] } = trpc.procurement.getArchivedVendors.useQuery();
  const { data: dashboardStats } = trpc.procurement.getDashboardStats.useQuery();
  const { data: spendTrend = [] } = trpc.procurement.getSpendTrend.useQuery();
  const { data: topVendors = [] } = trpc.procurement.getTopVendorsBySpend.useQuery();
  const { data: categoryData = [] } = trpc.procurement.getByCategory.useQuery();
  const { data: nextPoNumber } = trpc.procurement.generatePoNumber.useQuery();

  const [poForm, setPoForm] = useState({
    poNumber: '',
    vendorId: 0,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    category: 'other' as const,
    subtotal: '',
    taxAmount: '',
    totalAmount: '',
    notes: '',
    status: 'draft' as const
  });

  const [vendorForm, setVendorForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    paymentTerms: '',
    notes: ''
  });

  const createPO = trpc.procurement.createPurchaseOrder.useMutation({
    onSuccess: () => {
      utils.procurement.getPurchaseOrders.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      setShowCreatePODialog(false);
      resetPoForm();
      toast.success('Purchase order created successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const updatePO = trpc.procurement.updatePurchaseOrder.useMutation({
    onSuccess: () => {
      utils.procurement.getPurchaseOrders.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      setShowEditPODialog(false);
      setEditingPO(null);
      toast.success('Purchase order updated successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const archivePO = trpc.procurement.archivePurchaseOrder.useMutation({
    onSuccess: () => {
      utils.procurement.getPurchaseOrders.invalidate();
      utils.procurement.getArchivedPurchaseOrders.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      toast.success('Purchase order archived');
    },
    onError: (error) => toast.error(error.message)
  });

  const restorePO = trpc.procurement.restorePurchaseOrder.useMutation({
    onSuccess: () => {
      utils.procurement.getPurchaseOrders.invalidate();
      utils.procurement.getArchivedPurchaseOrders.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      toast.success('Purchase order restored');
    },
    onError: (error) => toast.error(error.message)
  });

  const createVendor = trpc.procurement.createVendor.useMutation({
    onSuccess: () => {
      utils.procurement.getVendors.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      setShowCreateVendorDialog(false);
      resetVendorForm();
      toast.success('Vendor created successfully');
    },
    onError: (error) => toast.error(error.message)
  });

  const archiveVendor = trpc.procurement.archiveVendor.useMutation({
    onSuccess: () => {
      utils.procurement.getVendors.invalidate();
      utils.procurement.getArchivedVendors.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      toast.success('Vendor archived');
    },
    onError: (error) => toast.error(error.message)
  });

  const restoreVendor = trpc.procurement.restoreVendor.useMutation({
    onSuccess: () => {
      utils.procurement.getVendors.invalidate();
      utils.procurement.getArchivedVendors.invalidate();
      utils.procurement.getDashboardStats.invalidate();
      toast.success('Vendor restored');
    },
    onError: (error) => toast.error(error.message)
  });

  const resetPoForm = () => {
    setPoForm({
      poNumber: nextPoNumber || '',
      vendorId: 0,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      category: 'other',
      subtotal: '',
      taxAmount: '',
      totalAmount: '',
      notes: '',
      status: 'draft'
    });
  };

  const resetVendorForm = () => {
    setVendorForm({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      contactPerson: '',
      paymentTerms: '',
      notes: ''
    });
  };

  const handleCreatePO = () => {
    if (!poForm.vendorId || poForm.vendorId === 0) {
      toast.error('Please select a vendor');
      return;
    }
    createPO.mutate({
      ...poForm,
      poNumber: nextPoNumber || poForm.poNumber
    });
  };

  const handleUpdatePO = () => {
    if (!editingPO) return;
    updatePO.mutate({
      id: editingPO.id,
      vendorId: editingPO.vendorId,
      orderDate: editingPO.orderDate,
      expectedDeliveryDate: editingPO.expectedDeliveryDate,
      category: editingPO.category,
      subtotal: editingPO.subtotal,
      taxAmount: editingPO.taxAmount,
      totalAmount: editingPO.totalAmount,
      notes: editingPO.notes,
      status: editingPO.status
    });
  };

  const handleCreateVendor = () => {
    if (!vendorForm.name.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    createVendor.mutate(vendorForm);
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po: any) => {
      const vendor = vendors.find((v: any) => v.id === po.vendorId);
      const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, vendors, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      draft: <FileText className="w-3 h-3" />,
      sent: <Send className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      in_transit: <Truck className="w-3 h-3" />,
      received: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      confirmed: 'Confirmed',
      in_transit: 'In Transit',
      received: 'Received',
      cancelled: 'Cancelled'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${STATUS_COLORS[status] || 'bg-gray-100'}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    );
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Procurement Dashboard</h1>
            <p className="text-muted-foreground">Manage purchasing operations & vendor performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateVendorDialog(true)}>
              <Building2 className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
            <Button onClick={() => { resetPoForm(); setShowCreatePODialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Purchase Order
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Order Overview</p>
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Total POs', value: dashboardStats?.totalPurchaseOrders || 0, fill: '#6366F1' },
                    { name: 'Pending', value: dashboardStats?.pendingApprovals || 0, fill: '#06B6D4' },
                    { name: 'In Transit', value: dashboardStats?.inTransitPOs || 0, fill: '#10B981' },
                    { name: 'Overdue', value: dashboardStats?.overdueDeliveries || 0, fill: '#F59E0B' },
                  ]} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11, fontWeight: 600 }}>
                      {[
                        { name: 'Total POs', fill: '#6366F1' },
                        { name: 'Pending', fill: '#06B6D4' },
                        { name: 'In Transit', fill: '#10B981' },
                        { name: 'Overdue', fill: '#F59E0B' },
                      ].map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Status Distribution</p>
              <div className="flex items-center gap-4" style={{ height: 130 }}>
                <div className="w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: dashboardStats?.pendingApprovals || 0 },
                          { name: 'In Transit', value: dashboardStats?.inTransitPOs || 0 },
                          { name: 'Overdue', value: dashboardStats?.overdueDeliveries || 0 },
                          { name: 'Completed', value: Math.max(0, (dashboardStats?.totalPurchaseOrders || 0) - (dashboardStats?.pendingApprovals || 0) - (dashboardStats?.inTransitPOs || 0) - (dashboardStats?.overdueDeliveries || 0)) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={48}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        <Cell fill="#06B6D4" />
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#6366F1" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                    <span>Pending</span>
                    <span className="font-semibold ml-auto">{dashboardStats?.pendingApprovals || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span>In Transit</span>
                    <span className="font-semibold ml-auto">{dashboardStats?.inTransitPOs || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span>Overdue</span>
                    <span className="font-semibold ml-auto">{dashboardStats?.overdueDeliveries || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6366F1' }} />
                    <span>Completed</span>
                    <span className="font-semibold ml-auto">{Math.max(0, (dashboardStats?.totalPurchaseOrders || 0) - (dashboardStats?.pendingApprovals || 0) - (dashboardStats?.inTransitPOs || 0) - (dashboardStats?.overdueDeliveries || 0))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col gap-3 justify-center" style={{ height: '100%' }}>
              <div className="rounded-lg border p-3" style={{ borderLeft: '4px solid #E11D48' }}>
                <p className="text-xs text-muted-foreground">Total Spend (YTD)</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(dashboardStats?.totalSpendYTD || 0, currency)}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderLeft: '4px solid #7C3AED' }}>
                <p className="text-xs text-muted-foreground">Active Vendors</p>
                <p className="text-xl font-bold mt-1">{dashboardStats?.activeVendors || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Side - Recent POs Table (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs and Filter Bar */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">All Orders</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  <TabsTrigger value="archive">Archive</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search POs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_transit">In Transit</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Recent Purchase Orders Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-normal break-words">#</TableHead>
                          <TableHead className="whitespace-normal break-words">PO Number</TableHead>
                          <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                          <TableHead className="whitespace-normal break-words">Date</TableHead>
                          <TableHead className="whitespace-normal break-words">Expected</TableHead>
                          <TableHead className="whitespace-normal break-words">Total</TableHead>
                          <TableHead className="whitespace-normal break-words">Status</TableHead>
                          <TableHead className="whitespace-normal break-words">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPOs.slice(0, 10).map((po: any, index: number) => (
                          <TableRow key={po.id}>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{index + 1}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <button
                                onClick={() => { setSelectedPO(po); setShowViewPODialog(true); }}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {po.poNumber}
                              </button>
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                {getVendorName(po.vendorId)}
                              </div>
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{po.orderDate}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{po.expectedDeliveryDate || '-'}</TableCell>
                            <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(po.totalAmount) || 0, currency)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getStatusBadge(po.status)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPO(po); setShowViewPODialog(true); }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingPO({...po}); setShowEditPODialog(true); }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => archivePO.mutate({ id: po.id })}>
                                  <Archive className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredPOs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No purchase orders found. Create your first purchase order to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Analytics Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Procurement Analytics - Pie Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Procurement Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Received', value: dashboardStats?.statusCounts?.received || 0 },
                                  { name: 'In Transit', value: dashboardStats?.statusCounts?.in_transit || 0 },
                                  { name: 'Pending', value: (dashboardStats?.statusCounts?.draft || 0) + (dashboardStats?.statusCounts?.sent || 0) + (dashboardStats?.statusCounts?.confirmed || 0) },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                dataKey="value"
                              >
                                <Cell fill="#10B981" />
                                <Cell fill="#F59E0B" />
                                <Cell fill="#3B82F6" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm">Received</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm">In Transit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm">Pending</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders by Category */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Orders by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData.length > 0 ? categoryData : [
                            { category: 'Electronics', orderCount: 0 },
                            { category: 'Raw Materials', orderCount: 0 },
                            { category: 'Equipment', orderCount: 0 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="orderCount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* All Orders Tab */}
              <TabsContent value="orders" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-normal break-words">PO Number</TableHead>
                          <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                          <TableHead className="whitespace-normal break-words">Order Date</TableHead>
                          <TableHead className="whitespace-normal break-words">Expected Delivery</TableHead>
                          <TableHead className="whitespace-normal break-words">Category</TableHead>
                          <TableHead className="whitespace-normal break-words">Total</TableHead>
                          <TableHead className="whitespace-normal break-words">Status</TableHead>
                          <TableHead className="whitespace-normal break-words">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPOs.map((po: any) => (
                          <TableRow key={po.id}>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <button
                                onClick={() => { setSelectedPO(po); setShowViewPODialog(true); }}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {po.poNumber}
                              </button>
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getVendorName(po.vendorId)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{po.orderDate}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{po.expectedDeliveryDate || '-'}</TableCell>
                            <TableCell className="break-words capitalize" style={{ overflowWrap: "break-word" }}>{po.category?.replace('_', ' ') || '-'}</TableCell>
                            <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(po.totalAmount) || 0, currency)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getStatusBadge(po.status)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPO(po); setShowViewPODialog(true); }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingPO({...po}); setShowEditPODialog(true); }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => archivePO.mutate({ id: po.id })}>
                                  <Archive className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vendors Tab */}
              <TabsContent value="vendors" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vendor Management</CardTitle>
                    <Button onClick={() => setShowCreateVendorDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vendor
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-normal break-words">Name</TableHead>
                          <TableHead className="whitespace-normal break-words">Code</TableHead>
                          <TableHead className="whitespace-normal break-words">Contact</TableHead>
                          <TableHead className="whitespace-normal break-words">City</TableHead>
                          <TableHead className="whitespace-normal break-words">Total Orders</TableHead>
                          <TableHead className="whitespace-normal break-words">Total Spent</TableHead>
                          <TableHead className="whitespace-normal break-words">Status</TableHead>
                          <TableHead className="whitespace-normal break-words">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor: any) => (
                          <TableRow key={vendor.id}>
                            <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{vendor.name}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendor.code || '-'}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <div className="text-sm">
                                {vendor.email && <div>{vendor.email}</div>}
                                {vendor.phone && <div className="text-muted-foreground">{vendor.phone}</div>}
                              </div>
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendor.city || '-'}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendor.totalOrders || 0}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(vendor.totalSpent) || 0, currency)}</TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                                vendor.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {vendor.status}
                              </span>
                            </TableCell>
                            <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                              <Button variant="ghost" size="sm" onClick={() => archiveVendor.mutate({ id: vendor.id })}>
                                <Archive className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {vendors.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No vendors found. Add your first vendor to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Archive Tab */}
              <TabsContent value="archive" className="mt-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Archived Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table className="table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-normal break-words">PO Number</TableHead>
                            <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                            <TableHead className="whitespace-normal break-words">Date</TableHead>
                            <TableHead className="whitespace-normal break-words">Total</TableHead>
                            <TableHead className="whitespace-normal break-words">Status</TableHead>
                            <TableHead className="whitespace-normal break-words">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {archivedPOs.map((po: any) => (
                            <TableRow key={po.id}>
                              <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{po.poNumber}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getVendorName(po.vendorId)}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{po.orderDate}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{formatCurrency(Number(po.totalAmount) || 0, currency)}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{getStatusBadge(po.status)}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                                <Button variant="ghost" size="sm" onClick={() => restorePO.mutate({ id: po.id })}>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Restore
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {archivedPOs.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No archived purchase orders
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Archived Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table className="table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-normal break-words">Name</TableHead>
                            <TableHead className="whitespace-normal break-words">Email</TableHead>
                            <TableHead className="whitespace-normal break-words">City</TableHead>
                            <TableHead className="whitespace-normal break-words">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {archivedVendors.map((vendor: any) => (
                            <TableRow key={vendor.id}>
                              <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{vendor.name}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendor.email || '-'}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{vendor.city || '-'}</TableCell>
                              <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                                <Button variant="ghost" size="sm" onClick={() => restoreVendor.mutate({ id: vendor.id })}>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Restore
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {archivedVendors.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No archived vendors
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Charts (1 col) */}
          <div className="space-y-6">
            {/* Spend Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Spend Trend</CardTitle>
                <p className="text-xs text-muted-foreground">(Last 6 Months)</p>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      <Line type="monotone" dataKey="spend" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Vendors by Spend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top 5 Vendors by Spend</CardTitle>
                <p className="text-xs text-muted-foreground">(Last 6 Months)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topVendors.length > 0 ? topVendors.map((vendor: any, index: number) => (
                  <div key={vendor.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{vendor.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(vendor.totalSpend, currency)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${Math.min(100, (vendor.totalSpend / (topVendors[0]?.totalSpend || 1)) * 100)}%`,
                          backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No vendor data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create PO Dialog */}
        <Dialog open={showCreatePODialog} onOpenChange={setShowCreatePODialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>Fill in the details to create a new purchase order.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">PO Number</label>
                  <Input value={nextPoNumber || ''} disabled className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium">Order Date</label>
                  <Input 
                    type="date" 
                    value={poForm.orderDate}
                    onChange={(e) => setPoForm({...poForm, orderDate: e.target.value})}
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vendor *</label>
                  <select 
                    value={poForm.vendorId}
                    onChange={(e) => setPoForm({...poForm, vendorId: Number(e.target.value)})}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value={0}>Select vendor</option>
                    {vendors.map((vendor: any) => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Delivery</label>
                  <Input 
                    type="date" 
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({...poForm, expectedDeliveryDate: e.target.value})}
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    value={poForm.category}
                    onChange={(e) => setPoForm({...poForm, category: e.target.value as any})}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="services">Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={poForm.status}
                    onChange={(e) => setPoForm({...poForm, status: e.target.value as any})}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Subtotal</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={poForm.subtotal}
                    onChange={(e) => {
                      const subtotal = e.target.value;
                      const tax = Number(subtotal) * 0.05;
                      const total = Number(subtotal) + tax;
                      setPoForm({...poForm, subtotal, taxAmount: tax.toString(), totalAmount: total.toString()});
                    }}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax (5%)</label>
                  <Input type="number" value={poForm.taxAmount} disabled className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium">Total</label>
                  <Input type="number" value={poForm.totalAmount} disabled className="mt-1 bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  placeholder="Additional notes..."
                  value={poForm.notes}
                  onChange={(e) => setPoForm({...poForm, notes: e.target.value})}
                  className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreatePODialog(false)}>Cancel</Button>
                <Button onClick={handleCreatePO} disabled={createPO.isPending}>
                  {createPO.isPending ? 'Creating...' : 'Create PO'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View PO Dialog */}
        <Dialog open={showViewPODialog} onOpenChange={setShowViewPODialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Purchase Order Details</DialogTitle>
              <DialogDescription>View purchase order information.</DialogDescription>
            </DialogHeader>
            {selectedPO && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">PO Number</p>
                    <p className="font-medium">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPO.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor</p>
                    <p className="font-medium">{getVendorName(selectedPO.vendorId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedPO.category?.replace('_', ' ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{selectedPO.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="font-medium">{selectedPO.expectedDeliveryDate || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-lg">{formatCurrency(Number(selectedPO.totalAmount) || 0, currency)}</p>
                  </div>
                </div>
                {selectedPO.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedPO.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit PO Dialog */}
        <Dialog open={showEditPODialog} onOpenChange={setShowEditPODialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Purchase Order</DialogTitle>
              <DialogDescription>Update purchase order details.</DialogDescription>
            </DialogHeader>
            {editingPO && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">PO Number</label>
                    <Input value={editingPO.poNumber} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={editingPO.status}
                      onChange={(e) => setEditingPO({...editingPO, status: e.target.value})}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_transit">In Transit</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order Date</label>
                    <Input 
                      type="date" 
                      value={editingPO.orderDate}
                      onChange={(e) => setEditingPO({...editingPO, orderDate: e.target.value})}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expected Delivery</label>
                    <Input 
                      type="date" 
                      value={editingPO.expectedDeliveryDate || ''}
                      onChange={(e) => setEditingPO({...editingPO, expectedDeliveryDate: e.target.value})}
                      className="mt-1" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Subtotal</label>
                    <Input 
                      type="number" 
                      value={editingPO.subtotal || ''}
                      onChange={(e) => {
                        const subtotal = e.target.value;
                        const tax = Number(subtotal) * 0.05;
                        const total = Number(subtotal) + tax;
                        setEditingPO({...editingPO, subtotal, taxAmount: tax.toString(), totalAmount: total.toString()});
                      }}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tax</label>
                    <Input type="number" value={editingPO.taxAmount || ''} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total</label>
                    <Input type="number" value={editingPO.totalAmount || ''} disabled className="mt-1 bg-muted" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={editingPO.notes || ''}
                    onChange={(e) => setEditingPO({...editingPO, notes: e.target.value})}
                    className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditPODialog(false)}>Cancel</Button>
                  <Button onClick={handleUpdatePO} disabled={updatePO.isPending}>
                    {updatePO.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Vendor Dialog */}
        <Dialog open={showCreateVendorDialog} onOpenChange={setShowCreateVendorDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>Enter vendor details to add to your supplier list.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vendor Name *</label>
                  <Input 
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                    placeholder="Enter vendor name"
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vendor Code</label>
                  <Input 
                    value={vendorForm.code}
                    onChange={(e) => setVendorForm({...vendorForm, code: e.target.value})}
                    placeholder="e.g., VND-001"
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                    placeholder="vendor@example.com"
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})}
                    placeholder="+1 234 567 890"
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={vendorForm.city}
                    onChange={(e) => setVendorForm({...vendorForm, city: e.target.value})}
                    placeholder="City"
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={vendorForm.country}
                    onChange={(e) => setVendorForm({...vendorForm, country: e.target.value})}
                    placeholder="Country"
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input 
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({...vendorForm, contactPerson: e.target.value})}
                    placeholder="Contact name"
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input 
                    value={vendorForm.paymentTerms}
                    onChange={(e) => setVendorForm({...vendorForm, paymentTerms: e.target.value})}
                    placeholder="e.g., Net 30"
                    className="mt-1" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
                  placeholder="Full address"
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})}
                  placeholder="Additional notes..."
                  className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateVendorDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateVendor} disabled={createVendor.isPending}>
                  {createVendor.isPending ? 'Adding...' : 'Add Vendor'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
