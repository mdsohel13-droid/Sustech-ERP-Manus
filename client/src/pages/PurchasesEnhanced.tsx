import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';

export function PurchasesEnhanced() {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([
    { id: 1, name: 'ABC Supplies Ltd', email: 'contact@abcsupplies.com', phone: '+880-1234-567890', city: 'Dhaka', status: 'active', creditLimit: 500000 },
    { id: 2, name: 'Global Trading Co', email: 'sales@globaltrading.com', phone: '+880-9876-543210', city: 'Chittagong', status: 'active', creditLimit: 750000 },
    { id: 3, name: 'Tech Solutions Inc', email: 'support@techsolutions.com', phone: '+880-5555-555555', city: 'Dhaka', status: 'active', creditLimit: 300000 },
    { id: 4, name: 'Premium Materials', email: 'orders@premiummat.com', phone: '+880-7777-777777', city: 'Gazipur', status: 'active', creditLimit: 1000000 }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 1, poNumber: 'PO-2026-001', vendor: 'ABC Supplies Ltd', orderDate: '2026-01-20', totalAmount: 125000, status: 'approved', items: 5 },
    { id: 2, poNumber: 'PO-2026-002', vendor: 'Global Trading Co', orderDate: '2026-01-22', totalAmount: 250000, status: 'pending', items: 8 },
    { id: 3, poNumber: 'PO-2026-003', vendor: 'Tech Solutions Inc', orderDate: '2026-01-23', totalAmount: 85000, status: 'draft', items: 3 }
  ]);

  const [grns, setGrns] = useState([
    { id: 1, grnNumber: 'GRN-2026-001', poNumber: 'PO-2026-001', receivedDate: '2026-01-21', status: 'completed', items: 5 },
    { id: 2, grnNumber: 'GRN-2026-002', poNumber: 'PO-2026-002', receivedDate: '2026-01-23', status: 'partial', items: 3 }
  ]);

  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', city: '', creditLimit: 0 });
  const [newPO, setNewPO] = useState({ poNumber: '', vendorId: '', orderDate: '', items: [] });
  const [newGRN, setNewGRN] = useState({ grnNumber: '', poId: '', receivedDate: '' });

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [showPODialog, setShowPODialog] = useState(false);
  const [showGRNDialog, setShowGRNDialog] = useState(false);
  const [showVendorDetail, setShowVendorDetail] = useState(false);
  const [showPODetail, setShowPODetail] = useState(false);

  const handleAddVendor = () => {
    if (newVendor.name && newVendor.email) {
      const vendor = {
        id: Math.max(...vendors.map(v => v.id), 0) + 1,
        ...newVendor,
        status: 'active'
      };
      setVendors([...vendors, vendor]);
      setNewVendor({ name: '', email: '', phone: '', city: '', creditLimit: 0 });
      setShowVendorDialog(false);
      toast.success('Vendor added successfully');
    }
  };

  const handleAddPO = () => {
    if (newPO.poNumber && newPO.vendorId && newPO.orderDate) {
      const po = {
        id: Math.max(...purchaseOrders.map(p => p.id), 0) + 1,
        ...newPO,
        vendor: vendors.find(v => v.id === Number(newPO.vendorId))?.name,
        status: 'draft',
        items: 0,
        totalAmount: 0
      };
      setPurchaseOrders([...purchaseOrders, po]);
      setNewPO({ poNumber: '', vendorId: '', orderDate: '', items: [] });
      setShowPODialog(false);
      toast.success('Purchase Order created successfully');
    }
  };

  const handleAddGRN = () => {
    if (newGRN.grnNumber && newGRN.poId && newGRN.receivedDate) {
      const grn = {
        id: Math.max(...grns.map(g => g.id), 0) + 1,
        ...newGRN,
        poNumber: purchaseOrders.find(p => p.id === Number(newGRN.poId))?.poNumber,
        status: 'completed',
        items: 0
      };
      setGrns([...grns, grn]);
      setNewGRN({ grnNumber: '', poId: '', receivedDate: '' });
      setShowGRNDialog(false);
      toast.success('Goods Receipt Note created successfully');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      received: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchases Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="grn">Goods Receipt Notes</TabsTrigger>
        </TabsList>

        {/* VENDORS TAB */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Vendor Management</h2>
            <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                  <DialogDescription>Create a new vendor profile</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vendor-name">Vendor Name *</Label>
                    <Input
                      id="vendor-name"
                      placeholder="Enter vendor name"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-email">Email *</Label>
                    <Input
                      id="vendor-email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-phone">Phone</Label>
                    <Input
                      id="vendor-phone"
                      placeholder="+880-1234-567890"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-city">City</Label>
                    <Input
                      id="vendor-city"
                      placeholder="Dhaka"
                      value={newVendor.city}
                      onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-credit">Credit Limit</Label>
                    <Input
                      id="vendor-credit"
                      type="number"
                      placeholder="500000"
                      value={newVendor.creditLimit}
                      onChange={(e) => setNewVendor({ ...newVendor, creditLimit: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddVendor} className="w-full">Add Vendor</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-semibold text-blue-600 hover:underline" onClick={() => { setSelectedVendor(vendor); setShowVendorDetail(true); }}>
                      {vendor.name}
                    </TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>{vendor.city}</TableCell>
                    <TableCell>৳{vendor.creditLimit.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedVendor(vendor); setShowVendorDetail(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PURCHASE ORDERS TAB */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Purchase Orders</h2>
            <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Create PO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>Create a new purchase order</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="po-number">PO Number *</Label>
                    <Input
                      id="po-number"
                      placeholder="PO-2026-001"
                      value={newPO.poNumber}
                      onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-select">Select Vendor *</Label>
                    <Select value={newPO.vendorId} onValueChange={(value) => setNewPO({ ...newPO, vendorId: value })}>
                      <SelectTrigger id="vendor-select">
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="po-date">Order Date *</Label>
                    <Input
                      id="po-date"
                      type="date"
                      value={newPO.orderDate}
                      onChange={(e) => setNewPO({ ...newPO, orderDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddPO} className="w-full">Create PO</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-semibold text-blue-600 hover:underline" onClick={() => { setSelectedPO(po); setShowPODetail(true); }}>
                      {po.poNumber}
                    </TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.orderDate}</TableCell>
                    <TableCell>৳{po.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{po.items}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPO(po); setShowPODetail(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* GOODS RECEIPT NOTES TAB */}
        <TabsContent value="grn" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Goods Receipt Notes</h2>
            <Dialog open={showGRNDialog} onOpenChange={setShowGRNDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Create GRN
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Goods Receipt Note</DialogTitle>
                  <DialogDescription>Record received goods</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="grn-number">GRN Number *</Label>
                    <Input
                      id="grn-number"
                      placeholder="GRN-2026-001"
                      value={newGRN.grnNumber}
                      onChange={(e) => setNewGRN({ ...newGRN, grnNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="po-select">Select PO *</Label>
                    <Select value={newGRN.poId} onValueChange={(value) => setNewGRN({ ...newGRN, poId: value })}>
                      <SelectTrigger id="po-select">
                        <SelectValue placeholder="Select a PO" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id.toString()}>
                            {po.poNumber} - {po.vendor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grn-date">Received Date *</Label>
                    <Input
                      id="grn-date"
                      type="date"
                      value={newGRN.receivedDate}
                      onChange={(e) => setNewGRN({ ...newGRN, receivedDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddGRN} className="w-full">Create GRN</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grns.map((grn) => (
                  <TableRow key={grn.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-blue-600 hover:underline cursor-pointer">
                      {grn.grnNumber}
                    </TableCell>
                    <TableCell>{grn.poNumber}</TableCell>
                    <TableCell>{grn.receivedDate}</TableCell>
                    <TableCell>{grn.items}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(grn.status)}>
                        {grn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* VENDOR DETAIL DIALOG */}
      {selectedVendor && (
        <Dialog open={showVendorDetail} onOpenChange={setShowVendorDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedVendor.name}</DialogTitle>
              <DialogDescription>Vendor Details & Payment History</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedVendor.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">City</Label>
                  <p className="font-semibold">{selectedVendor.city}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Credit Limit</Label>
                  <p className="font-semibold">৳{selectedVendor.creditLimit.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recent Purchase Orders</h3>
                <div className="space-y-2">
                  {purchaseOrders.filter(po => po.vendor === selectedVendor.name).map(po => (
                    <div key={po.id} className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-semibold text-blue-600">{po.poNumber}</span>
                        <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {po.orderDate} - ৳{po.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PO DETAIL DIALOG */}
      {selectedPO && (
        <Dialog open={showPODetail} onOpenChange={setShowPODetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPO.poNumber}</DialogTitle>
              <DialogDescription>Purchase Order Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedPO.vendor}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Order Date</Label>
                  <p className="font-semibold">{selectedPO.orderDate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Amount</Label>
                  <p className="font-semibold">৳{selectedPO.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedPO.status)}>{selectedPO.status}</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items ({selectedPO.items})</h3>
                <div className="space-y-2">
                  {[...Array(selectedPO.items)].map((_, i) => (
                    <div key={i} className="p-2 border rounded hover:bg-gray-50">
                      <div className="flex justify-between">
                        <span>Item {i + 1}</span>
                        <span className="text-blue-600 hover:underline cursor-pointer">View Details</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
