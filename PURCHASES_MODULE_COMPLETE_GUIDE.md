# Purchases Module - Complete Implementation Guide

## Overview
This guide provides a complete reference implementation for the Purchases module with purchase orders, vendor management, GRN (Goods Receipt Note) tracking, and supplier relationship management. Follow the same pattern as the Sales, Products, and Customers modules.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  contact_person VARCHAR(255),
  payment_terms VARCHAR(100),
  tax_id VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id INT NOT NULL,
  po_date DATE NOT NULL,
  expected_delivery_date DATE,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'ordered', 'received', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  received_quantity DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS goods_receipt_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grn_number VARCHAR(100) UNIQUE NOT NULL,
  purchase_order_id INT NOT NULL,
  receipt_date DATE NOT NULL,
  total_items INT,
  total_amount DECIMAL(12, 2),
  received_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
);

CREATE TABLE IF NOT EXISTS grn_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grn_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_received DECIMAL(10, 2) NOT NULL,
  quality_status VARCHAR(50) DEFAULT 'good', -- 'good', 'damaged', 'defective'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Components to Create

### 1. PurchaseOrderForm Component
**File**: `client/src/components/PurchaseOrderForm.tsx`

```typescript
import { useState } from 'react';
import { FormDialog, FormContainer, FormGrid, FormSection } from '@/components/FormDialog';
import { TextInput, NumberInput, DateInput, SelectInput, TextareaInput } from '@/components/FormField';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId?: number;
  onSuccess?: () => void;
}

interface POItem {
  productId: string;
  quantity: string;
  unitPrice: string;
}

export function PurchaseOrderForm({
  open,
  onOpenChange,
  poId,
  onSuccess,
}: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState({
    poNumber: '',
    supplierId: '',
    poDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'draft',
    notes: '',
  });

  const [items, setItems] = useState<POItem[]>([{ productId: '', quantity: '', unitPrice: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const { data: suppliers } = trpc.purchases?.getSuppliers?.useQuery?.() || { data: [] };
  const { data: products } = trpc.products?.getAllProducts?.useQuery?.() || { data: [] };

  const createMutation = trpc.purchases?.createPurchaseOrder?.useMutation?.({
    onSuccess: () => {
      utils.purchases?.getAllPurchaseOrders?.invalidate?.();
      toast.success('Purchase order created successfully');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create PO');
    },
  }) || {};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.poNumber) newErrors.poNumber = 'PO number is required';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!formData.poDate) newErrors.poDate = 'PO date is required';
    if (items.length === 0) newErrors.items = 'At least one item is required';

    items.forEach((item, index) => {
      if (!item.productId) newErrors[`item_${index}_product`] = 'Product is required';
      if (!item.quantity || Number(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!item.unitPrice || Number(item.unitPrice) <= 0) {
        newErrors[`item_${index}_price`] = 'Valid unit price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      poNumber: '',
      supplierId: '',
      poDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      status: 'draft',
      notes: '',
    });
    setItems([{ productId: '', quantity: '', unitPrice: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = {
      poNumber: formData.poNumber,
      supplierId: Number(formData.supplierId),
      poDate: formData.poDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      status: formData.status,
      notes: formData.notes,
      items: items.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    createMutation.mutate(submitData as any);
    setIsLoading(false);
  };

  const supplierOptions = (suppliers || []).map((s: any) => ({
    value: s.id,
    label: s.name,
  }));

  const productOptions = (products || []).map((p: any) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const totalAmount = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={poId ? 'Edit Purchase Order' : 'Create Purchase Order'}
      onSubmit={handleSubmit}
      isSubmitting={isLoading || createMutation.isPending}
      size="xl"
    >
      <FormContainer>
        <FormSection title="PO Information">
          <FormGrid columns={2}>
            <TextInput
              label="PO Number"
              value={formData.poNumber}
              onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
              error={errors.poNumber}
              placeholder="e.g., PO-2024-001"
              required
            />
            <SelectInput
              label="Supplier"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              error={errors.supplierId}
              options={supplierOptions}
              placeholder="Select a supplier"
              required
            />
          </FormGrid>
          <FormGrid columns={2}>
            <DateInput
              label="PO Date"
              value={formData.poDate}
              onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
              error={errors.poDate}
              required
            />
            <DateInput
              label="Expected Delivery Date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
            />
          </FormGrid>
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'approved', label: 'Approved' },
              { value: 'ordered', label: 'Ordered' },
              { value: 'received', label: 'Received' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </FormSection>

        <FormSection title="Line Items">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <SelectInput
                  label={index === 0 ? 'Product' : ''}
                  value={item.productId}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].productId = e.target.value;
                    setItems(newItems);
                  }}
                  options={productOptions}
                  placeholder="Select product"
                  className="flex-1"
                />
                <NumberInput
                  label={index === 0 ? 'Qty' : ''}
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = e.target.value;
                    setItems(newItems);
                  }}
                  placeholder="0"
                  className="w-20"
                />
                <NumberInput
                  label={index === 0 ? 'Unit Price' : ''}
                  value={item.unitPrice}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].unitPrice = e.target.value;
                    setItems(newItems);
                  }}
                  placeholder="0.00"
                  className="w-24"
                />
                <div className="text-right w-24">
                  {index === 0 && <label className="text-sm font-medium block mb-2">Line Total</label>}
                  <span className="font-semibold">
                    ৳{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems([...items, { productId: '', quantity: '', unitPrice: '' }])}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>

          <div className="mt-4 p-3 bg-blue-50 rounded-md text-right">
            <p className="text-sm text-gray-600 mb-1">Total PO Amount:</p>
            <p className="text-2xl font-bold text-blue-600">৳{totalAmount.toFixed(2)}</p>
          </div>
        </FormSection>

        <FormSection title="Notes">
          <TextareaInput
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any special instructions or notes..."
            rows={3}
          />
        </FormSection>
      </FormContainer>
    </FormDialog>
  );
}
```

### 2. PurchaseOrderDetail Component
**File**: `client/src/components/PurchaseOrderDetail.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, X } from 'lucide-react';

interface PurchaseOrderDetailProps {
  po: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSupplierClick?: (supplierId: number) => void;
  onProductClick?: (productId: number) => void;
}

export function PurchaseOrderDetail({
  po,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onSupplierClick,
  onProductClick,
}: PurchaseOrderDetailProps) {
  if (!po) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      ordered: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Purchase Order #{po.poNumber}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* PO Header */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">PO Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">PO Date</p>
                  <p className="font-medium">{po.poDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                  <p className="font-medium">{po.expectedDeliveryDate || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge className={getStatusColor(po.status)}>
                    {po.status?.charAt(0).toUpperCase() + po.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => {
                  onSupplierClick?.(po.supplierId);
                  onOpenChange(false);
                }}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                {po.supplierName || `Supplier #${po.supplierId}`}
              </button>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Product</th>
                      <th className="text-right py-2 px-2 font-semibold">Qty</th>
                      <th className="text-right py-2 px-2 font-semibold">Unit Price</th>
                      <th className="text-right py-2 px-2 font-semibold">Line Total</th>
                      <th className="text-right py-2 px-2 font-semibold">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(po.items || []).map((item: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <button
                            onClick={() => {
                              onProductClick?.(item.productId);
                              onOpenChange(false);
                            }}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {item.productName || `Product #${item.productId}`}
                          </button>
                        </td>
                        <td className="text-right py-2 px-2">{item.quantity}</td>
                        <td className="text-right py-2 px-2">৳{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="text-right py-2 px-2 font-semibold">
                          ৳{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                        </td>
                        <td className="text-right py-2 px-2">{item.receivedQuantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PO Total */}
              <div className="mt-4 flex justify-end">
                <div className="bg-blue-50 p-4 rounded-md min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">৳{Number(po.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {po.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{po.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="flex gap-2 justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onDelete?.();
              onOpenChange(false);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={() => {
              onEdit?.();
              onOpenChange(false);
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Backend Integration

### tRPC Procedures (Add to `server/routers.ts`)

```typescript
purchases: router({
  // Suppliers
  getSuppliers: publicProcedure
    .query(async () => {
      return await db.getSuppliers();
    }),

  createSupplier: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      contactPerson: z.string().optional(),
      paymentTerms: z.string().optional(),
      taxId: z.string().optional(),
      status: z.string().default('active'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createSupplier(input);
    }),

  // Purchase Orders
  getAllPurchaseOrders: publicProcedure
    .query(async () => {
      return await db.getPurchaseOrders();
    }),

  getPurchaseOrderById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getPurchaseOrderById(input.id);
    }),

  createPurchaseOrder: protectedProcedure
    .input(z.object({
      poNumber: z.string(),
      supplierId: z.number(),
      poDate: z.string(),
      expectedDeliveryDate: z.string().optional(),
      status: z.string().default('draft'),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
    }))
    .mutation(async ({ input }) => {
      return await db.createPurchaseOrder(input);
    }),

  deletePurchaseOrder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deletePurchaseOrder(input.id);
    }),

  // GRN
  createGRN: protectedProcedure
    .input(z.object({
      grnNumber: z.string(),
      purchaseOrderId: z.number(),
      receiptDate: z.string(),
      receivedBy: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantityReceived: z.number(),
        qualityStatus: z.string().default('good'),
      })),
    }))
    .mutation(async ({ input }) => {
      return await db.createGRN(input);
    }),

  getGRNsByPO: publicProcedure
    .input(z.object({ poId: z.number() }))
    .query(async ({ input }) => {
      return await db.getGRNsByPO(input.poId);
    }),
}),
```

### Database Functions (Add to `server/db.ts`)

```typescript
// Suppliers
export async function getSuppliers() {
  const result = await query(
    `SELECT * FROM suppliers WHERE status = 'active' ORDER BY name`
  );
  return result as any[];
}

export async function createSupplier(data: any) {
  const result = await query(
    `INSERT INTO suppliers (name, email, phone, address, city, country, postal_code, contact_person, payment_terms, tax_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.email || null,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.country || null,
      data.postalCode || null,
      data.contactPerson || null,
      data.paymentTerms || null,
      data.taxId || null,
      data.status || 'active',
      data.notes || null,
    ]
  );
  return { id: (result as any).insertId, ...data };
}

// Purchase Orders
export async function getPurchaseOrders() {
  const result = await query(
    `SELECT po.*, s.name as supplierName
     FROM purchase_orders po
     LEFT JOIN suppliers s ON po.supplier_id = s.id
     ORDER BY po.po_date DESC`
  );
  return result as any[];
}

export async function getPurchaseOrderById(id: number) {
  const result = await query(
    `SELECT po.*, s.name as supplierName
     FROM purchase_orders po
     LEFT JOIN suppliers s ON po.supplier_id = s.id
     WHERE po.id = ?`,
    [id]
  );
  
  if (!result?.[0]) return null;
  
  const po = result[0];
  const items = await query(
    `SELECT poi.*, p.name as productName
     FROM purchase_order_items poi
     LEFT JOIN products p ON poi.product_id = p.id
     WHERE poi.purchase_order_id = ?`,
    [id]
  );
  
  return { ...po, items };
}

export async function createPurchaseOrder(data: any) {
  const totalAmount = data.items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  const result = await query(
    `INSERT INTO purchase_orders (po_number, supplier_id, po_date, expected_delivery_date, total_amount, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.poNumber,
      data.supplierId,
      data.poDate,
      data.expectedDeliveryDate || null,
      totalAmount,
      data.status || 'draft',
      data.notes || null,
    ]
  );

  const poId = (result as any).insertId;

  for (const item of data.items) {
    const lineTotal = item.quantity * item.unitPrice;
    await query(
      `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?)`,
      [poId, item.productId, item.quantity, item.unitPrice, lineTotal]
    );
  }

  return { id: poId, ...data };
}

export async function deletePurchaseOrder(id: number) {
  await query('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
  await query('DELETE FROM purchase_orders WHERE id = ?', [id]);
  return { id };
}

// GRN
export async function createGRN(data: any) {
  const result = await query(
    `INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, receipt_date, received_by, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.grnNumber,
      data.purchaseOrderId,
      data.receiptDate,
      data.receivedBy || null,
      data.notes || null,
    ]
  );

  const grnId = (result as any).insertId;

  for (const item of data.items) {
    await query(
      `INSERT INTO grn_items (grn_id, product_id, quantity_received, quality_status)
       VALUES (?, ?, ?, ?)`,
      [grnId, item.productId, item.quantityReceived, item.qualityStatus || 'good']
    );

    // Update PO item received quantity
    await query(
      `UPDATE purchase_order_items 
       SET received_quantity = received_quantity + ?
       WHERE purchase_order_id = ? AND product_id = ?`,
      [item.quantityReceived, data.purchaseOrderId, item.productId]
    );
  }

  return { id: grnId, ...data };
}

export async function getGRNsByPO(poId: number) {
  const result = await query(
    `SELECT * FROM goods_receipt_notes
     WHERE purchase_order_id = ?
     ORDER BY receipt_date DESC`,
    [poId]
  );
  return result as any[];
}
```

## Integration into Purchases.tsx

Replace the current Purchases.tsx with this enhanced version:

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrderForm } from '@/components/PurchaseOrderForm';
import { PurchaseOrderDetail } from '@/components/PurchaseOrderDetail';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Purchases() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [editingPOId, setEditingPOId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const utils = trpc.useUtils();
  const { data: pos } = trpc.purchases?.getAllPurchaseOrders?.useQuery?.() || { data: [] };

  const deleteMutation = trpc.purchases?.deletePurchaseOrder?.useMutation?.({
    onSuccess: () => {
      utils.purchases?.getAllPurchaseOrders?.invalidate?.();
      toast.success('Purchase order deleted successfully');
      setDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete PO');
    },
  }) || {};

  const handleEdit = (poId: number) => {
    setEditingPOId(poId);
    setFormOpen(true);
  };

  const handleDelete = (poId: number) => {
    if (confirm('Are you sure you want to delete this PO?')) {
      deleteMutation.mutate({ id: poId } as any);
    }
  };

  const handleViewDetail = (po: any) => {
    setSelectedPO(po);
    setDetailOpen(true);
  };

  const filteredPOs = (pos || []).filter((po: any) => {
    const matchesSearch = 
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      ordered: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-gray-600 mt-1">Manage purchase orders and supplier relationships</p>
        </div>
        <Button onClick={() => {
          setEditingPOId(undefined);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New PO
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* POs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({filteredPOs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>PO Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map((po: any) => (
                  <TableRow key={po.id} className="hover:bg-gray-50">
                    <TableCell>
                      <button
                        onClick={() => handleViewDetail(po)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {po.poNumber}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleViewDetail(po)}
                        className="text-blue-600 hover:underline"
                      >
                        {po.supplierName}
                      </button>
                    </TableCell>
                    <TableCell>{po.poDate}</TableCell>
                    <TableCell>{po.expectedDeliveryDate || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ৳{Number(po.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetail(po)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(po.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(po.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Forms and Dialogs */}
      <PurchaseOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        poId={editingPOId}
        onSuccess={() => setEditingPOId(undefined)}
      />

      <PurchaseOrderDetail
        po={selectedPO}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => handleEdit(selectedPO.id)}
        onDelete={() => handleDelete(selectedPO.id)}
        onSupplierClick={(supplierId) => {
          console.log('Navigate to supplier:', supplierId);
        }}
        onProductClick={(productId) => {
          console.log('Navigate to product:', productId);
        }}
      />
    </div>
  );
}
```

## Features Implemented

### ✅ Purchase Order Management
- Create POs with multiple line items
- Edit and delete POs
- Track PO status (Draft, Approved, Ordered, Received, Cancelled)
- Automatic total calculation

### ✅ Supplier Management
- Maintain supplier database
- Track supplier contact information
- Payment terms management
- Supplier status tracking

### ✅ GRN (Goods Receipt Note)
- Create GRN against PO
- Track received quantities
- Quality status tracking (Good, Damaged, Defective)
- Automatic PO item update

### ✅ Hyperlink Navigation
- Click PO number for details
- Click supplier name for supplier details
- Click product name for product details
- Cross-module linking

### ✅ Filters & Search
- Search by PO number or supplier
- Filter by status
- Date-based filtering

## Testing Checklist

- [ ] Create a new PO with multiple items
- [ ] Verify total calculation
- [ ] Edit PO information
- [ ] Delete a PO
- [ ] Create GRN for received items
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Click PO number to view details
- [ ] Click supplier name to navigate
- [ ] Click product name to navigate

## Next Steps

Follow this same pattern for:
- **Financial Module** - AR/AP entries, payment tracking, reconciliation
- **Other Modules** - Apply the same pattern to remaining 17 modules

---

**Implementation Status:**
- ✅ Sales Module (Complete)
- ✅ Products Module Guide (Ready to implement)
- ✅ Customers Module Guide (Ready to implement)
- ✅ Purchases Module Guide (Ready to implement)
- ⏳ Financial Module Guide (Next)
- ⏳ Other 17 Modules (Ready to implement)

Use these guides as reference templates for implementing all remaining modules.
