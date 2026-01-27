import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrossModuleHyperlink, HyperlinkCell, RelatedRecords } from '@/components/CrossModuleHyperlink';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Mock sales data with hyperlinks
const mockSalesOrders = [
  {
    id: 1,
    orderNumber: 'SO-2026-001',
    customerName: 'ABC Corporation',
    customerId: 101,
    productName: 'Premium Package',
    productId: 501,
    quantity: 10,
    unitPrice: 5000,
    totalAmount: 50000,
    status: 'Completed',
    orderDate: '2026-01-20',
    dueDate: '2026-01-27',
    invoiceId: 'INV-2026-001'
  },
  {
    id: 2,
    orderNumber: 'SO-2026-002',
    customerName: 'XYZ Industries',
    customerId: 102,
    productName: 'Standard Package',
    productId: 502,
    quantity: 5,
    unitPrice: 3000,
    totalAmount: 15000,
    status: 'Pending',
    orderDate: '2026-01-22',
    dueDate: '2026-01-29',
    invoiceId: null
  },
  {
    id: 3,
    orderNumber: 'SO-2026-003',
    customerName: 'Global Solutions Ltd',
    customerId: 103,
    productName: 'Enterprise Package',
    productId: 503,
    quantity: 20,
    unitPrice: 8000,
    totalAmount: 160000,
    status: 'In Progress',
    orderDate: '2026-01-23',
    dueDate: '2026-02-06',
    invoiceId: null
  }
];

export function SalesWithHyperlinks() {
  const [salesOrders, setSalesOrders] = useState(mockSalesOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockSalesOrders[0] | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  const handleViewDetails = (order: typeof mockSalesOrders[0]) => {
    setSelectedOrder(order);
    setShowDetailView(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Orders</h1>
        <p className="text-gray-600 mt-2">Manage sales orders with hyperlink navigation to customers and products</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* SALES ORDERS TAB */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Sales Orders</h2>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Sales Order
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                        <TableCell>
                          {/* HYPERLINK: Customer Name */}
                          <CrossModuleHyperlink
                            module="customers"
                            id={order.customerId}
                            label={order.customerName}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell>
                          {/* HYPERLINK: Product Name */}
                          <CrossModuleHyperlink
                            module="products"
                            id={order.productId}
                            label={order.productName}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>৳{order.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">৳{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>
                          {order.invoiceId ? (
                            /* HYPERLINK: Invoice */
                            <CrossModuleHyperlink
                              module="financial"
                              id={order.invoiceId}
                              label={order.invoiceId}
                              variant="badge"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(order)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1">
                            <Trash2 className="w-3 h-3" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{salesOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">৳{salesOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{salesOrders.filter(o => o.status === 'Completed').length}</p>
                <p className="text-xs text-gray-500 mt-1">Orders delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{salesOrders.filter(o => o.status === 'Pending').length}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Average Order Value</p>
                  <p className="text-2xl font-bold">৳{Math.round(salesOrders.reduce((sum, o) => sum + o.totalAmount, 0) / salesOrders.length).toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Items Sold</p>
                  <p className="text-2xl font-bold">{salesOrders.reduce((sum, o) => sum + o.quantity, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAIL VIEW MODAL */}
      {showDetailView && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Sales Order Details</CardTitle>
                <CardDescription>{selectedOrder.orderNumber}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowDetailView(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">
                    <CrossModuleHyperlink
                      module="customers"
                      id={selectedOrder.customerId}
                      label={selectedOrder.customerName}
                      variant="link"
                    />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-semibold">
                    <CrossModuleHyperlink
                      module="products"
                      id={selectedOrder.productId}
                      label={selectedOrder.productName}
                      variant="link"
                    />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{selectedOrder.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-semibold">৳{selectedOrder.unitPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg">৳{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              {selectedOrder.invoiceId && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Related Invoice</p>
                  <CrossModuleHyperlink
                    module="financial"
                    id={selectedOrder.invoiceId}
                    label={`View Invoice ${selectedOrder.invoiceId}`}
                    variant="button"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button>Edit Order</Button>
                <Button variant="outline">Print</Button>
                <Button variant="outline">Export</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
