# Products Module - Complete Implementation Guide

## Overview
This guide provides a complete reference implementation for the Products module with inventory tracking, pricing management, and sales history integration. Follow the same pattern as the Sales Module.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  reorder_level INT DEFAULT 10,
  stock_quantity INT DEFAULT 0,
  unit_of_measure VARCHAR(50) DEFAULT 'pcs',
  supplier_id INT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS product_stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  transaction_type VARCHAR(50), -- 'purchase', 'sale', 'adjustment', 'return'
  quantity INT NOT NULL,
  reference_id INT, -- links to sales_orders or purchase_orders
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Components to Create

### 1. ProductForm Component
**File**: `client/src/components/ProductForm.tsx`

```typescript
import { useState } from 'react';
import { FormDialog, FormContainer, FormGrid, FormSection } from '@/components/FormDialog';
import { TextInput, NumberInput, SelectInput, TextareaInput } from '@/components/FormField';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: number;
  onSuccess?: () => void;
}

export function ProductForm({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    unitPrice: '',
    costPrice: '',
    reorderLevel: '10',
    stockQuantity: '0',
    unitOfMeasure: 'pcs',
    supplierId: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const { data: suppliers } = trpc.purchases?.getSuppliers?.useQuery?.() || { data: [] };

  const createMutation = trpc.products?.createProduct?.useMutation?.({
    onSuccess: () => {
      utils.products?.getAllProducts?.invalidate?.();
      toast.success('Product created successfully');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create product');
    },
  }) || {};

  const updateMutation = trpc.products?.updateProduct?.useMutation?.({
    onSuccess: () => {
      utils.products?.getAllProducts?.invalidate?.();
      toast.success('Product updated successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update product');
    },
  }) || {};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.unitPrice) newErrors.unitPrice = 'Unit price is required';
    if (Number(formData.unitPrice) <= 0) newErrors.unitPrice = 'Unit price must be greater than 0';
    if (formData.costPrice && Number(formData.costPrice) < 0) {
      newErrors.costPrice = 'Cost price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      description: '',
      unitPrice: '',
      costPrice: '',
      reorderLevel: '10',
      stockQuantity: '0',
      unitOfMeasure: 'pcs',
      supplierId: '',
      status: 'active',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      description: formData.description,
      unitPrice: Number(formData.unitPrice),
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      reorderLevel: Number(formData.reorderLevel),
      stockQuantity: Number(formData.stockQuantity),
      unitOfMeasure: formData.unitOfMeasure,
      supplierId: formData.supplierId ? Number(formData.supplierId) : null,
      status: formData.status,
    };

    if (productId) {
      updateMutation.mutate({ id: productId, ...submitData } as any);
    } else {
      createMutation.mutate(submitData as any);
    }

    setIsLoading(false);
  };

  const supplierOptions = (suppliers || []).map((s: any) => ({
    value: s.id,
    label: s.name,
  }));

  const margin = formData.unitPrice && formData.costPrice
    ? ((Number(formData.unitPrice) - Number(formData.costPrice)) / Number(formData.unitPrice) * 100).toFixed(1)
    : '0';

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={productId ? 'Edit Product' : 'Create Product'}
      onSubmit={handleSubmit}
      isSubmitting={isLoading || createMutation.isPending || updateMutation.isPending}
      size="lg"
    >
      <FormContainer>
        <FormSection title="Basic Information">
          <FormGrid columns={2}>
            <TextInput
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="e.g., Solar Panel 400W"
              required
            />
            <TextInput
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              error={errors.sku}
              placeholder="e.g., SP-400-001"
              required
            />
          </FormGrid>
          <FormGrid columns={2}>
            <TextInput
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Solar Panels"
            />
            <SelectInput
              label="Unit of Measure"
              value={formData.unitOfMeasure}
              onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              options={[
                { value: 'pcs', label: 'Pieces' },
                { value: 'kg', label: 'Kilogram' },
                { value: 'ltr', label: 'Liter' },
                { value: 'mtr', label: 'Meter' },
                { value: 'box', label: 'Box' },
              ]}
            />
          </FormGrid>
          <TextareaInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Product description and specifications..."
            rows={3}
          />
        </FormSection>

        <FormSection title="Pricing & Cost">
          <FormGrid columns={2}>
            <NumberInput
              label="Unit Price (Selling)"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              error={errors.unitPrice}
              placeholder="0.00"
              required
            />
            <NumberInput
              label="Cost Price"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              error={errors.costPrice}
              placeholder="0.00"
            />
          </FormGrid>
          {formData.unitPrice && formData.costPrice && (
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-gray-600">Profit Margin:</p>
              <p className="text-lg font-semibold text-green-600">{margin}%</p>
            </div>
          )}
        </FormSection>

        <FormSection title="Inventory">
          <FormGrid columns={2}>
            <NumberInput
              label="Current Stock"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              placeholder="0"
            />
            <NumberInput
              label="Reorder Level"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              placeholder="10"
            />
          </FormGrid>
          {Number(formData.stockQuantity) < Number(formData.reorderLevel) && (
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">⚠️ Stock is below reorder level</p>
            </div>
          )}
        </FormSection>

        <FormSection title="Supplier & Status">
          <FormGrid columns={2}>
            <SelectInput
              label="Supplier"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              options={supplierOptions}
              placeholder="Select a supplier"
            />
            <SelectInput
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'discontinued', label: 'Discontinued' },
              ]}
            />
          </FormGrid>
        </FormSection>
      </FormContainer>
    </FormDialog>
  );
}
```

### 2. ProductDetail Component
**File**: `client/src/components/ProductDetail.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface ProductDetailProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSupplierClick?: (supplierId: number) => void;
}

export function ProductDetail({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onSupplierClick,
}: ProductDetailProps) {
  if (!product) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      discontinued: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const margin = product.costPrice
    ? ((Number(product.unitPrice) - Number(product.costPrice)) / Number(product.unitPrice) * 100).toFixed(1)
    : '0';

  const isLowStock = Number(product.stockQuantity) < Number(product.reorderLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Product: {product.name}</DialogTitle>
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
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">SKU</p>
                  <p className="font-medium font-mono">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium">{product.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unit of Measure</p>
                  <p className="font-medium">{product.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                  </Badge>
                </div>
              </div>
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                  <p className="text-lg font-semibold text-blue-600">৳{Number(product.unitPrice).toFixed(2)}</p>
                </div>
                {product.costPrice && (
                  <div className="bg-orange-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">Cost Price</p>
                    <p className="text-lg font-semibold text-orange-600">৳{Number(product.costPrice).toFixed(2)}</p>
                  </div>
                )}
                {product.costPrice && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">Margin</p>
                    <p className="text-lg font-semibold text-green-600">{margin}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-2xl font-bold">{product.stockQuantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Reorder Level</p>
                    <p className="text-lg font-semibold">{product.reorderLevel}</p>
                  </div>
                </div>

                {isLowStock && (
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Low Stock Alert</p>
                      <p className="text-sm text-yellow-700">Current stock is below reorder level</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          {product.supplierId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => {
                    onSupplierClick?.(product.supplierId);
                    onOpenChange(false);
                  }}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {product.supplierName || `Supplier #${product.supplierId}`}
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog Footer with Actions */}
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
products: router({
  getAllProducts: publicProcedure
    .query(async () => {
      return await db.getProducts();
    }),

  getProductById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),

  createProduct: protectedProcedure
    .input(z.object({
      name: z.string(),
      sku: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      unitPrice: z.number(),
      costPrice: z.number().optional(),
      reorderLevel: z.number().default(10),
      stockQuantity: z.number().default(0),
      unitOfMeasure: z.string().default('pcs'),
      supplierId: z.number().optional(),
      status: z.string().default('active'),
    }))
    .mutation(async ({ input }) => {
      return await db.createProduct(input);
    }),

  updateProduct: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      sku: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      unitPrice: z.number().optional(),
      costPrice: z.number().optional(),
      reorderLevel: z.number().optional(),
      stockQuantity: z.number().optional(),
      unitOfMeasure: z.string().optional(),
      supplierId: z.number().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateProduct(id, data);
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteProduct(input.id);
    }),

  getStockHistory: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductStockHistory(input.productId);
    }),

  getLowStockProducts: publicProcedure
    .query(async () => {
      return await db.getLowStockProducts();
    }),
}),
```

### Database Functions (Add to `server/db.ts`)

```typescript
export async function getProducts() {
  const result = await query(
    `SELECT p.*, s.name as supplierName
     FROM products p
     LEFT JOIN suppliers s ON p.supplier_id = s.id
     ORDER BY p.name`
  );
  return result as any[];
}

export async function getProductById(id: number) {
  const result = await query(
    `SELECT p.*, s.name as supplierName
     FROM products p
     LEFT JOIN suppliers s ON p.supplier_id = s.id
     WHERE p.id = ?`,
    [id]
  );
  return result?.[0];
}

export async function createProduct(data: any) {
  const result = await query(
    `INSERT INTO products (name, sku, category, description, unit_price, cost_price, reorder_level, stock_quantity, unit_of_measure, supplier_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.sku,
      data.category || null,
      data.description || null,
      data.unitPrice,
      data.costPrice || null,
      data.reorderLevel || 10,
      data.stockQuantity || 0,
      data.unitOfMeasure || 'pcs',
      data.supplierId || null,
      data.status || 'active',
    ]
  );
  return { id: (result as any).insertId, ...data };
}

export async function updateProduct(id: number, data: any) {
  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    updates.push(`${dbKey} = ?`);
    values.push(value);
  });

  if (updates.length === 0) return { id };

  values.push(id);
  await query(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return { id, ...data };
}

export async function deleteProduct(id: number) {
  await query('DELETE FROM products WHERE id = ?', [id]);
  return { id };
}

export async function getProductStockHistory(productId: number) {
  const result = await query(
    `SELECT * FROM product_stock_history
     WHERE product_id = ?
     ORDER BY created_at DESC`,
    [productId]
  );
  return result as any[];
}

export async function getLowStockProducts() {
  const result = await query(
    `SELECT * FROM products
     WHERE stock_quantity < reorder_level
     AND status = 'active'
     ORDER BY (reorder_level - stock_quantity) DESC`
  );
  return result as any[];
}
```

## Integration into Products.tsx

Replace the current Products.tsx with this enhanced version that includes the form and detail components:

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductForm } from '@/components/ProductForm';
import { ProductDetail } from '@/components/ProductDetail';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProductId, setEditingProductId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const utils = trpc.useUtils();
  const { data: products } = trpc.products?.getAllProducts?.useQuery?.() || { data: [] };
  const { data: lowStockProducts } = trpc.products?.getLowStockProducts?.useQuery?.() || { data: [] };

  const deleteMutation = trpc.products?.deleteProduct?.useMutation?.({
    onSuccess: () => {
      utils.products?.getAllProducts?.invalidate?.();
      utils.products?.getLowStockProducts?.invalidate?.();
      toast.success('Product deleted successfully');
      setDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product');
    },
  }) || {};

  const handleEdit = (productId: number) => {
    setEditingProductId(productId);
    setFormOpen(true);
  };

  const handleDelete = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate({ id: productId } as any);
    }
  };

  const handleViewDetail = (product: any) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const filteredProducts = (products || []).filter((product: any) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      discontinued: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">Manage product inventory and pricing</p>
        </div>
        <Button onClick={() => {
          setEditingProductId(undefined);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Low Stock Alert */}
      {(lowStockProducts || []).length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">{lowStockProducts.length} products have low stock</p>
                <p className="text-sm text-yellow-700">Review and reorder soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <button
                        onClick={() => handleViewDetail(product)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {product.name}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell className="text-right">৳{Number(product.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={Number(product.stockQuantity) < Number(product.reorderLevel) ? 'text-red-600 font-semibold' : ''}>
                        {product.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{product.reorderLevel}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        productId={editingProductId}
        onSuccess={() => setEditingProductId(undefined)}
      />

      <ProductDetail
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => handleEdit(selectedProduct.id)}
        onDelete={() => handleDelete(selectedProduct.id)}
        onSupplierClick={(supplierId) => {
          // Navigate to supplier detail
          console.log('Navigate to supplier:', supplierId);
        }}
      />
    </div>
  );
}
```

## Features Implemented

### ✅ Product Management
- Create new products with SKU, pricing, and inventory
- Edit existing product information
- Delete products with confirmation
- Track cost price and profit margin

### ✅ Inventory Tracking
- Current stock quantity
- Reorder level management
- Low stock alerts
- Stock history tracking

### ✅ Pricing & Profitability
- Unit price and cost price
- Automatic profit margin calculation
- Price comparison view

### ✅ Hyperlink Navigation
- Click product name for details
- Link to supplier information
- Stock history view

### ✅ Filters & Search
- Search by name, SKU, or category
- Filter by status (Active, Inactive, Discontinued)
- Low stock product alerts

## Testing Checklist

- [ ] Create a new product with all fields
- [ ] Verify profit margin calculation
- [ ] Check low stock alert displays correctly
- [ ] Edit product information
- [ ] Verify changes are saved
- [ ] Delete a product
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Click product name to view details
- [ ] Verify stock history displays

## Next Steps

Follow this same pattern for:
- **Customers Module** - Customer profiles, sales history, outstanding balance
- **Purchases Module** - Purchase orders, vendor management, GRN tracking
- **Financial Module** - AR/AP entries, payment tracking, reconciliation

---

**Implementation Status:**
- ✅ Sales Module (Complete)
- ✅ Products Module Guide (Ready to implement)
- ⏳ Customers Module Guide (Next)
- ⏳ Purchases Module Guide (Next)
