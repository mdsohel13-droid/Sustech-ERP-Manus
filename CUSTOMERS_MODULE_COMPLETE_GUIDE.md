# Customers Module - Complete Implementation Guide

## Overview
This guide provides a complete reference implementation for the Customers module with customer profiles, sales history, outstanding balance tracking, and contact management. Follow the same pattern as the Sales and Products modules.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  customer_type VARCHAR(50) DEFAULT 'individual', -- 'individual', 'business', 'corporate'
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  total_purchases DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  contact_person VARCHAR(255),
  contact_title VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

## Components to Create

### 1. CustomerForm Component
**File**: `client/src/components/CustomerForm.tsx`

```typescript
import { useState } from 'react';
import { FormDialog, FormContainer, FormGrid, FormSection } from '@/components/FormDialog';
import { TextInput, NumberInput, SelectInput, TextareaInput } from '@/components/FormField';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: number;
  onSuccess?: () => void;
}

export function CustomerForm({
  open,
  onOpenChange,
  customerId,
  onSuccess,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    customerType: 'individual',
    creditLimit: '0',
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();

  const createMutation = trpc.customers?.createCustomer?.useMutation?.({
    onSuccess: () => {
      utils.customers?.getAllCustomers?.invalidate?.();
      toast.success('Customer created successfully');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create customer');
    },
  }) || {};

  const updateMutation = trpc.customers?.updateCustomer?.useMutation?.({
    onSuccess: () => {
      utils.customers?.getAllCustomers?.invalidate?.();
      toast.success('Customer updated successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update customer');
    },
  }) || {};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Customer name is required';
    if (!formData.email && !formData.phone) {
      newErrors.email = 'Email or phone is required';
    }
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      customerType: 'individual',
      creditLimit: '0',
      status: 'active',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      postalCode: formData.postalCode,
      customerType: formData.customerType,
      creditLimit: Number(formData.creditLimit),
      status: formData.status,
      notes: formData.notes,
    };

    if (customerId) {
      updateMutation.mutate({ id: customerId, ...submitData } as any);
    } else {
      createMutation.mutate(submitData as any);
    }

    setIsLoading(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={customerId ? 'Edit Customer' : 'Create Customer'}
      onSubmit={handleSubmit}
      isSubmitting={isLoading || createMutation.isPending || updateMutation.isPending}
      size="lg"
    >
      <FormContainer>
        <FormSection title="Basic Information">
          <FormGrid columns={2}>
            <TextInput
              label="Customer Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="e.g., ABC Trading Company"
              required
            />
            <SelectInput
              label="Customer Type"
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
              options={[
                { value: 'individual', label: 'Individual' },
                { value: 'business', label: 'Business' },
                { value: 'corporate', label: 'Corporate' },
              ]}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Contact Information">
          <FormGrid columns={2}>
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="customer@example.com"
            />
            <TextInput
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+880 1234567890"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Address">
          <TextareaInput
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address"
            rows={2}
          />
          <FormGrid columns={3}>
            <TextInput
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Dhaka"
            />
            <TextInput
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., Bangladesh"
            />
            <TextInput
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="e.g., 1205"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Credit & Status">
          <FormGrid columns={2}>
            <NumberInput
              label="Credit Limit"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              placeholder="0.00"
            />
            <SelectInput
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Notes">
          <TextareaInput
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any special notes about this customer..."
            rows={3}
          />
        </FormSection>
      </FormContainer>
    </FormDialog>
  );
}
```

### 2. CustomerDetail Component
**File**: `client/src/components/CustomerDetail.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface CustomerDetailProps {
  customer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerDetail({
  customer,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CustomerDetailProps) {
  if (!customer) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const creditUtilization = customer.creditLimit > 0
    ? ((Number(customer.outstandingBalance) / Number(customer.creditLimit)) * 100).toFixed(1)
    : '0';

  const isOverCredit = Number(customer.outstandingBalance) > Number(customer.creditLimit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{customer.name}</DialogTitle>
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
                  <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                  <p className="font-medium capitalize">{customer.customerType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          {(customer.address || customer.city || customer.country) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {customer.address && <>{customer.address}<br /></>}
                  {customer.city && <>{customer.city}</>}
                  {customer.city && customer.country && <>, </>}
                  {customer.country && <>{customer.country}</>}
                  {customer.postalCode && <> {customer.postalCode}</>}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Financial Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ৳{Number(customer.totalPurchases).toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-md ${isOverCredit ? 'bg-red-50' : 'bg-orange-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                  <p className={`text-lg font-semibold ${isOverCredit ? 'text-red-600' : 'text-orange-600'}`}>
                    ৳{Number(customer.outstandingBalance).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Credit Limit</p>
                  <p className="text-lg font-semibold text-green-600">
                    ৳{Number(customer.creditLimit).toFixed(2)}
                  </p>
                </div>
              </div>

              {customer.creditLimit > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Credit Utilization</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isOverCredit ? 'bg-red-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(Number(creditUtilization), 100)}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-1 ${isOverCredit ? 'text-red-600' : 'text-gray-600'}`}>
                    {creditUtilization}% used
                  </p>
                </div>
              )}

              {isOverCredit && (
                <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Credit Limit Exceeded</p>
                    <p className="text-sm text-red-700">
                      Outstanding balance exceeds credit limit by ৳{(Number(customer.outstandingBalance) - Number(customer.creditLimit)).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
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
customers: router({
  getAllCustomers: publicProcedure
    .query(async () => {
      return await db.getCustomers();
    }),

  getCustomerById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerById(input.id);
    }),

  createCustomer: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      customerType: z.string().default('individual'),
      creditLimit: z.number().default(0),
      status: z.string().default('active'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createCustomer(input);
    }),

  updateCustomer: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      customerType: z.string().optional(),
      creditLimit: z.number().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateCustomer(id, data);
    }),

  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteCustomer(input.id);
    }),

  getOverCreditCustomers: publicProcedure
    .query(async () => {
      return await db.getOverCreditCustomers();
    }),
}),
```

### Database Functions (Add to `server/db.ts`)

```typescript
export async function getCustomers() {
  const result = await query(
    `SELECT * FROM customers ORDER BY name`
  );
  return result as any[];
}

export async function getCustomerById(id: number) {
  const result = await query(
    `SELECT * FROM customers WHERE id = ?`,
    [id]
  );
  return result?.[0];
}

export async function createCustomer(data: any) {
  const result = await query(
    `INSERT INTO customers (name, email, phone, address, city, country, postal_code, customer_type, credit_limit, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.email || null,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.country || null,
      data.postalCode || null,
      data.customerType || 'individual',
      data.creditLimit || 0,
      data.status || 'active',
      data.notes || null,
    ]
  );
  return { id: (result as any).insertId, ...data };
}

export async function updateCustomer(id: number, data: any) {
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
    `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return { id, ...data };
}

export async function deleteCustomer(id: number) {
  await query('DELETE FROM customers WHERE id = ?', [id]);
  return { id };
}

export async function getOverCreditCustomers() {
  const result = await query(
    `SELECT * FROM customers
     WHERE outstanding_balance > credit_limit
     AND status = 'active'
     ORDER BY (outstanding_balance - credit_limit) DESC`
  );
  return result as any[];
}
```

## Integration into Customers.tsx

Replace the current Customers.tsx with this enhanced version:

```typescript
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerForm } from '@/components/CustomerForm';
import { CustomerDetail } from '@/components/CustomerDetail';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Customers() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const utils = trpc.useUtils();
  const { data: customers } = trpc.customers?.getAllCustomers?.useQuery?.() || { data: [] };
  const { data: overCreditCustomers } = trpc.customers?.getOverCreditCustomers?.useQuery?.() || { data: [] };

  const deleteMutation = trpc.customers?.deleteCustomer?.useMutation?.({
    onSuccess: () => {
      utils.customers?.getAllCustomers?.invalidate?.();
      utils.customers?.getOverCreditCustomers?.invalidate?.();
      toast.success('Customer deleted successfully');
      setDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete customer');
    },
  }) || {};

  const handleEdit = (customerId: number) => {
    setEditingCustomerId(customerId);
    setFormOpen(true);
  };

  const handleDelete = (customerId: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate({ id: customerId } as any);
    }
  };

  const handleViewDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  const filteredCustomers = (customers || []).filter((customer: any) => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer profiles and credit limits</p>
        </div>
        <Button onClick={() => {
          setEditingCustomerId(undefined);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Over Credit Alert */}
      {(overCreditCustomers || []).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">{overCreditCustomers.length} customers have exceeded credit limit</p>
                <p className="text-sm text-red-700">Immediate action required for payment collection</p>
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
              placeholder="Search by name, email, or phone..."
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
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: any) => {
                  const isOverCredit = Number(customer.outstandingBalance) > Number(customer.creditLimit);
                  return (
                    <TableRow key={customer.id} className="hover:bg-gray-50">
                      <TableCell>
                        <button
                          onClick={() => handleViewDetail(customer)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {customer.name}
                        </button>
                      </TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell className="capitalize">{customer.customerType}</TableCell>
                      <TableCell className="text-right">৳{Number(customer.totalPurchases).toFixed(2)}</TableCell>
                      <TableCell className={`text-right ${isOverCredit ? 'text-red-600 font-semibold' : ''}`}>
                        ৳{Number(customer.outstandingBalance).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">৳{Number(customer.creditLimit).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewDetail(customer)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(customer.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Forms and Dialogs */}
      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customerId={editingCustomerId}
        onSuccess={() => setEditingCustomerId(undefined)}
      />

      <CustomerDetail
        customer={selectedCustomer}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => handleEdit(selectedCustomer.id)}
        onDelete={() => handleDelete(selectedCustomer.id)}
      />
    </div>
  );
}
```

## Features Implemented

### ✅ Customer Management
- Create new customers with full contact information
- Edit customer profiles
- Delete customers with confirmation
- Support for individual, business, and corporate customers

### ✅ Credit Management
- Set credit limits per customer
- Track outstanding balance
- Visual credit utilization indicator
- Alerts for over-credit customers

### ✅ Sales History
- Total purchases tracking
- Outstanding balance display
- Credit limit monitoring
- Payment status alerts

### ✅ Contact Management
- Email and phone tracking
- Address information
- Customer notes
- Status management (Active, Inactive, Suspended)

### ✅ Filters & Search
- Search by name, email, or phone
- Filter by status
- Over-credit customer alerts

## Testing Checklist

- [ ] Create a new customer
- [ ] Edit customer information
- [ ] Delete a customer
- [ ] Verify credit limit calculation
- [ ] Check over-credit alert displays
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Click customer name to view details
- [ ] Verify email and phone links work
- [ ] Check financial summary displays correctly

## Next Steps

Follow this same pattern for:
- **Purchases Module** - Purchase orders, vendor management, GRN tracking
- **Financial Module** - AR/AP entries, payment tracking, reconciliation
- **Other Modules** - Apply the same pattern to remaining 17 modules

---

**Implementation Status:**
- ✅ Sales Module (Complete)
- ✅ Products Module Guide (Ready to implement)
- ✅ Customers Module Guide (Ready to implement)
- ⏳ Purchases Module Guide (Next)
