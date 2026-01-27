import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Edit2, Trash2, Eye, TrendingDown, Package, AlertCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  warehouse: string;
  lastRestocked: string;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  turnoverRate: number;
  expiryDate?: string;
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  reference: string;
  date: string;
  reason: string;
  user: string;
}

export default function InventoryEnhanced() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'transactions' | 'alerts'>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      productName: 'Laptop - Dell XPS 13',
      sku: 'DELL-XPS-13-2024',
      currentStock: 5,
      reorderPoint: 10,
      reorderQuantity: 20,
      unitCost: 1200,
      warehouse: 'Main Warehouse',
      lastRestocked: '2026-01-20',
      supplier: 'Dell Direct',
      status: 'low-stock',
      turnoverRate: 8.5,
    },
    {
      id: '2',
      productName: 'Office Chair - Ergonomic',
      sku: 'CHAIR-ERG-001',
      currentStock: 0,
      reorderPoint: 5,
      reorderQuantity: 15,
      unitCost: 350,
      warehouse: 'Main Warehouse',
      lastRestocked: '2026-01-15',
      supplier: 'Furniture Plus',
      status: 'out-of-stock',
      turnoverRate: 12.3,
    },
    {
      id: '3',
      productName: 'Monitor - 27" 4K',
      sku: 'MON-27-4K-001',
      currentStock: 25,
      reorderPoint: 8,
      reorderQuantity: 20,
      unitCost: 450,
      warehouse: 'Main Warehouse',
      lastRestocked: '2026-01-22',
      supplier: 'Tech Supplies Inc',
      status: 'in-stock',
      turnoverRate: 6.2,
    },
    {
      id: '4',
      productName: 'Keyboard - Mechanical',
      sku: 'KEY-MECH-001',
      currentStock: 3,
      reorderPoint: 15,
      reorderQuantity: 30,
      unitCost: 120,
      warehouse: 'Secondary Warehouse',
      lastRestocked: '2026-01-18',
      supplier: 'Peripherals World',
      status: 'low-stock',
      turnoverRate: 15.8,
    },
    {
      id: '5',
      productName: 'Mouse - Wireless',
      sku: 'MOUSE-WL-001',
      currentStock: 45,
      reorderPoint: 20,
      reorderQuantity: 50,
      unitCost: 35,
      warehouse: 'Main Warehouse',
      lastRestocked: '2026-01-23',
      supplier: 'Peripherals World',
      status: 'in-stock',
      turnoverRate: 22.1,
    },
  ];

  const transactions: InventoryTransaction[] = [
    {
      id: '1',
      itemId: '1',
      type: 'outbound',
      quantity: 2,
      reference: 'SO-2026-001',
      date: '2026-01-24',
      reason: 'Sales Order',
      user: 'John Doe',
    },
    {
      id: '2',
      itemId: '3',
      type: 'inbound',
      quantity: 10,
      reference: 'PO-2026-045',
      date: '2026-01-23',
      reason: 'Purchase Order',
      user: 'Jane Smith',
    },
    {
      id: '3',
      itemId: '4',
      type: 'adjustment',
      quantity: -1,
      reference: 'ADJ-2026-012',
      date: '2026-01-22',
      reason: 'Damage/Loss',
      user: 'Admin',
    },
  ];

  const lowStockItems = inventoryItems.filter(item => item.status !== 'in-stock');
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const averageTurnover = (inventoryItems.reduce((sum, item) => sum + item.turnoverRate, 0) / inventoryItems.length).toFixed(2);

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return '✓';
      case 'low-stock':
        return '!';
      case 'out-of-stock':
        return '✕';
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'items', 'transactions', 'alerts'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inventoryItems.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active SKUs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">৳{(totalInventoryValue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-gray-500 mt-1">Total value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</div>
              <p className="text-xs text-gray-500 mt-1">Need reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageTurnover}x</div>
              <p className="text-xs text-gray-500 mt-1">Per year</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {lowStockItems.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {lowStockItems.length} items have low or no stock. Immediate action required.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">{item.productName}</h3>
                    <p className="text-sm text-red-700">
                      Current: {item.currentStock} | Reorder Point: {item.reorderPoint}
                    </p>
                    <p className="text-xs text-red-600 mt-1">SKU: {item.sku}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <Input
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Current Stock</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Reorder Point</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Unit Cost</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Value</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(item)}>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">{item.currentStock}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">{item.reorderPoint}</td>
                    <td className="px-6 py-4 text-sm text-right">৳{item.unitCost}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">৳{(item.currentStock * item.unitCost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)} {item.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(item); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => {
                const item = inventoryItems.find(i => i.id === txn.itemId);
                return (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={txn.type === 'inbound' ? 'default' : txn.type === 'outbound' ? 'secondary' : 'outline'}>
                        {txn.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">{item?.productName}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">{txn.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.reference}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.productName}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-semibold">{selectedItem.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold">{selectedItem.currentStock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reorder Point</p>
                <p className="text-lg font-semibold">{selectedItem.reorderPoint}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unit Cost</p>
                <p className="font-semibold">৳{selectedItem.unitCost}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="font-semibold">৳{(selectedItem.currentStock * selectedItem.unitCost).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Warehouse</p>
                <p className="font-semibold">{selectedItem.warehouse}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Supplier</p>
                <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedItem.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Restocked</p>
                <p className="font-semibold">{selectedItem.lastRestocked}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Turnover Rate</p>
                <p className="font-semibold">{selectedItem.turnoverRate}x/year</p>
              </div>
            </div>

            {selectedItem.currentStock <= selectedItem.reorderPoint && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Stock is below reorder point. Recommend ordering {selectedItem.reorderQuantity} units.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              <Button className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input placeholder="Enter product name" />
            </div>
            <div>
              <label className="text-sm font-medium">SKU</label>
              <Input placeholder="Enter SKU" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Point</label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Cost</label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Warehouse</label>
                <Input placeholder="Select warehouse" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
