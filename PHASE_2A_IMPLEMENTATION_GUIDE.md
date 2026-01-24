# Phase 2A Implementation Guide: Core Module Data Entry Forms

## Overview
This guide provides a comprehensive roadmap for implementing data entry forms, hyperlink navigation, and real database integration for the 5 core ERP modules: Sales, Products, Customers, Purchases, and Financial.

## Architecture & Patterns

### 1. Reusable Form Components (Already Created)
Located in `client/src/components/`:
- **FormField.tsx** - Wrapper for form inputs with labels and error display
- **FormDialog.tsx** - Modal dialog for forms with submit/cancel buttons
- **TextInput, NumberInput, EmailInput, DateInput, SelectInput, TextareaInput** - Typed input components

### 2. Standard Implementation Pattern

Each module should follow this structure:

```
Module/
├── List View (Table with hyperlinks)
├── Detail View (Click on row to see full details)
├── Add Form (Modal dialog)
├── Edit Form (Modal dialog)
├── Delete Confirmation
└── Filters & Exports
```

### 3. Backend Integration Pattern

For each module, ensure:
1. **tRPC Procedures** in `server/routers.ts`:
   - `getAll()` - Fetch all records
   - `getById(id)` - Fetch single record
   - `create(data)` - Create new record
   - `update(id, data)` - Update existing record
   - `delete(id)` - Delete record

2. **Database Functions** in `server/db.ts`:
   - Query helpers for each procedure
   - Type-safe returns

## Module-by-Module Implementation

### Module 1: Sales

**Current State:** Mock data with products and tracking

**Required Changes:**
1. **Add Sales Order Form**
   - Fields: Order Date, Customer, Product, Quantity, Unit Price, Total, Status, Notes
   - Validation: All required fields, numeric validation for prices
   - Database: Create `sales_orders` table if not exists

2. **Hyperlink Navigation**
   - Make customer names clickable → Show customer details
   - Make product names clickable → Show product details
   - Make order IDs clickable → Show full order details with line items

3. **Detail View**
   - Show full order information
   - Display line items in a nested table
   - Show payment status and history
   - Edit/Delete buttons

4. **Replace Mock Data**
   - Replace `trpc.sales.getAllProducts` with real database query
   - Replace `trpc.sales.getAllTracking` with real database query
   - Ensure data persists across sessions

5. **Add Filters**
   - Filter by date range
   - Filter by customer
   - Filter by status (Pending, Confirmed, Delivered, Cancelled)
   - Filter by product

6. **Add Exports**
   - Export to CSV
   - Export to PDF with formatting

### Module 2: Products

**Current State:** Mock product data

**Required Changes:**
1. **Add Product Form**
   - Fields: Name, SKU, Category, Unit, Description, Cost Price, Selling Price, Stock Level, Reorder Point
   - Validation: Unique SKU, numeric prices
   - Database: Use existing `products` table

2. **Hyperlink Navigation**
   - Make product names clickable → Show product details
   - Show inventory status with color coding
   - Link to sales orders using this product

3. **Detail View**
   - Show product specifications
   - Display current inventory level
   - Show sales history
   - Show cost and margin analysis
   - Edit/Delete buttons

4. **Inventory Management**
   - Display stock level with warning if below reorder point
   - Show last restocking date
   - Link to purchase orders for this product

5. **Add Filters**
   - Filter by category
   - Filter by stock status (In Stock, Low Stock, Out of Stock)
   - Filter by price range

6. **Add Exports**
   - Export inventory list
   - Export with pricing information

### Module 3: Customers

**Current State:** Mock customer data

**Required Changes:**
1. **Add Customer Form**
   - Fields: Name, Email, Phone, Address, City, Country, Tax ID, Payment Terms, Credit Limit
   - Validation: Email format, phone format
   - Database: Use existing `customers` table

2. **Hyperlink Navigation**
   - Make customer names clickable → Show customer details
   - Show contact information
   - Link to all sales orders from this customer
   - Link to outstanding invoices

3. **Detail View**
   - Show full customer information
   - Display sales history and total revenue
   - Show outstanding balance
   - Display payment history
   - Show contact persons
   - Edit/Delete buttons

4. **Contact Management**
   - Add multiple contact persons per customer
   - Store phone, email, designation for each contact
   - Mark primary contact

5. **Add Filters**
   - Filter by country/city
   - Filter by credit status
   - Filter by sales volume
   - Filter by payment status

6. **Add Exports**
   - Export customer list with contact details
   - Export with sales summary

### Module 4: Purchases

**Current State:** Mock purchase data

**Required Changes:**
1. **Add Purchase Order Form**
   - Fields: PO Date, Vendor, Product, Quantity, Unit Price, Total, Delivery Date, Status, Notes
   - Validation: All required fields, numeric validation
   - Database: Create `purchase_orders` table if not exists

2. **Hyperlink Navigation**
   - Make vendor names clickable → Show vendor details
   - Make product names clickable → Show product details
   - Make PO numbers clickable → Show full PO details

3. **Detail View**
   - Show full purchase order information
   - Display line items
   - Show delivery status
   - Show payment status
   - Show GRN (Goods Receipt Note) status
   - Edit/Delete buttons

4. **Vendor Management**
   - Link to vendor information
   - Show vendor performance metrics
   - Display payment history with vendor

5. **Add Filters**
   - Filter by date range
   - Filter by vendor
   - Filter by status (Draft, Confirmed, Delivered, Invoiced, Paid)
   - Filter by product

6. **Add Exports**
   - Export purchase orders
   - Export with vendor details

### Module 5: Financial (AR/AP)

**Current State:** Mock financial data

**Required Changes:**
1. **Add Invoice Form**
   - Fields: Invoice Date, Customer/Vendor, Amount, Due Date, Status, Notes
   - Validation: Numeric validation, date validation
   - Database: Create `invoices` table if not exists

2. **Add Payment Form**
   - Fields: Payment Date, Invoice, Amount, Payment Method, Reference, Notes
   - Validation: Amount cannot exceed invoice amount
   - Database: Create `payments` table if not exists

3. **Hyperlink Navigation**
   - Make invoice numbers clickable → Show invoice details
   - Make customer/vendor names clickable → Show their details
   - Show payment status with color coding

4. **Detail View**
   - Show full invoice information
   - Display associated sales order or purchase order
   - Show payment history
   - Show aging information
   - Edit/Delete buttons

5. **AR/AP Dashboard**
   - Show total AR and AP amounts
   - Show aging analysis (Current, 30 days, 60 days, 90+ days)
   - Show payment status distribution
   - Show overdue invoices with alerts

6. **Add Filters**
   - Filter by date range
   - Filter by status (Draft, Issued, Paid, Overdue, Cancelled)
   - Filter by customer/vendor
   - Filter by amount range

7. **Add Exports**
   - Export AR/AP aging report
   - Export invoice list
   - Export payment history

## Implementation Checklist

### For Each Module:
- [ ] Create tRPC procedures (getAll, getById, create, update, delete)
- [ ] Create database functions with proper type safety
- [ ] Create Add Form component with validation
- [ ] Create Edit Form component
- [ ] Create Detail View component
- [ ] Add hyperlink navigation in list view
- [ ] Replace mock data with real queries
- [ ] Add filters to list view
- [ ] Add export functionality
- [ ] Create unit tests for procedures
- [ ] Test CRUD operations end-to-end
- [ ] Test hyperlink navigation
- [ ] Test filters and exports

## Code Examples

### Example: Sales Order Form Component

```tsx
import { FormDialog, FormContainer, FormGrid, FormSection } from '@/components/FormDialog';
import { TextInput, NumberInput, DateInput, SelectInput } from '@/components/FormField';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface SalesOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: number;
  onSuccess?: () => void;
}

export function SalesOrderForm({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: SalesOrderFormProps) {
  const [formData, setFormData] = useState({
    orderDate: '',
    customerId: '',
    productId: '',
    quantity: '',
    unitPrice: '',
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = trpc.useUtils();
  
  const createMutation = trpc.sales.createOrder.useMutation({
    onSuccess: () => {
      utils.sales.getAllOrders.invalidate();
      toast.success('Sales order created successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.sales.updateOrder.useMutation({
    onSuccess: () => {
      utils.sales.getAllOrders.invalidate();
      toast.success('Sales order updated successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.orderDate) newErrors.orderDate = 'Order date is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.unitPrice) newErrors.unitPrice = 'Unit price is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (orderId) {
      updateMutation.mutate({
        id: orderId,
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      });
    } else {
      createMutation.mutate({
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      });
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={orderId ? 'Edit Sales Order' : 'Create Sales Order'}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
    >
      <FormContainer>
        <FormSection title="Order Information">
          <FormGrid columns={2}>
            <DateInput
              label="Order Date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              error={errors.orderDate}
              required
            />
            <SelectInput
              label="Customer"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              error={errors.customerId}
              options={[
                { value: '1', label: 'Customer 1' },
                { value: '2', label: 'Customer 2' },
              ]}
              required
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Order Items">
          <FormGrid columns={2}>
            <SelectInput
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              error={errors.productId}
              options={[
                { value: '1', label: 'Product 1' },
                { value: '2', label: 'Product 2' },
              ]}
              required
            />
            <NumberInput
              label="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              error={errors.quantity}
              required
            />
            <NumberInput
              label="Unit Price"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              error={errors.unitPrice}
              required
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Additional Details">
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <TextareaInput
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </FormSection>
      </FormContainer>
    </FormDialog>
  );
}
```

### Example: Hyperlink Detail View

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface SalesOrderDetailProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SalesOrderDetail({
  order,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SalesOrderDetailProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sales Order #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge>{order.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium cursor-pointer text-blue-600 hover:underline">
                {order.customerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">৳{order.total}</p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 cursor-pointer text-blue-600 hover:underline">
                      {item.productName}
                    </td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">৳{item.unitPrice}</td>
                    <td className="text-right py-2">৳{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Strategy

1. **Unit Tests** - Test each procedure with valid/invalid inputs
2. **Integration Tests** - Test CRUD operations end-to-end
3. **UI Tests** - Test form validation and hyperlink navigation
4. **Data Persistence** - Verify data survives page refresh
5. **Performance** - Ensure queries are optimized for large datasets

## Next Steps

1. **Start with Sales Module** - Most critical for business operations
2. **Then Products Module** - Foundation for inventory management
3. **Then Customers Module** - Essential for sales tracking
4. **Then Purchases Module** - Mirror of sales for procurement
5. **Finally Financial Module** - Completes the core ERP loop

## Resources

- Form Components: `client/src/components/FormField.tsx`, `FormDialog.tsx`
- tRPC Documentation: `server/routers.ts` (existing patterns)
- Database Functions: `server/db.ts` (existing patterns)
- UI Components: shadcn/ui (Button, Dialog, Table, etc.)

## Support

If you need help implementing any module:
1. Review the code examples above
2. Check existing module implementations for patterns
3. Refer to the database schema in `drizzle/schema.ts`
4. Test with sample data before deploying

---

**Estimated Timeline:**
- Sales Module: 2-3 hours
- Products Module: 1.5-2 hours
- Customers Module: 1.5-2 hours
- Purchases Module: 2-3 hours
- Financial Module: 2-3 hours

**Total Phase 2A: 9-13 hours**

After Phase 2A, Phase 2B (Business Modules) and Phase 2C (Remaining Modules) will follow the same patterns and should be faster to implement.
