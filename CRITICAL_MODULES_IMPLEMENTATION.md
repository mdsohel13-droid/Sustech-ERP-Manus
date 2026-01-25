# Critical Modules Implementation Guide

## Overview
Complete implementation guide for the 5 most critical ERP modules: Sales, Purchases, Financial, Projects, and Settings.

## Module 1: Purchases Module

### Database Schema
```sql
-- Vendors table
CREATE TABLE vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  paymentTerms VARCHAR(100),
  creditLimit DECIMAL(15,2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Purchase Orders table
CREATE TABLE purchaseOrders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  poNumber VARCHAR(50) NOT NULL UNIQUE,
  vendorId INT NOT NULL,
  orderDate DATE NOT NULL,
  expectedDeliveryDate DATE,
  totalAmount DECIMAL(15,2),
  status ENUM('draft', 'pending', 'approved', 'received', 'cancelled') DEFAULT 'draft',
  notes TEXT,
  createdBy INT,
  approvedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);

-- Purchase Order Items
CREATE TABLE purchaseOrderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  poId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalPrice DECIMAL(15,2),
  receivedQuantity INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poId) REFERENCES purchaseOrders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- GRN (Goods Receipt Note) table
CREATE TABLE goodsReceiptNotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  grnNumber VARCHAR(50) NOT NULL UNIQUE,
  poId INT NOT NULL,
  receivedDate DATE NOT NULL,
  totalReceivedAmount DECIMAL(15,2),
  notes TEXT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poId) REFERENCES purchaseOrders(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### Backend Procedures (tRPC)
```typescript
// In server/routers.ts - Purchases router
purchases: router({
  // Get all purchase orders
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.purchaseOrders.findMany({
      with: { vendor: true, items: { with: { product: true } } }
    });
  }),

  // Create purchase order
  create: protectedProcedure
    .input(z.object({
      poNumber: z.string(),
      vendorId: z.number(),
      orderDate: z.date(),
      expectedDeliveryDate: z.date().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitPrice: z.string()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      // Create PO and items
      const po = await ctx.db.insert(purchaseOrders).values({
        poNumber: input.poNumber,
        vendorId: input.vendorId,
        orderDate: input.orderDate,
        expectedDeliveryDate: input.expectedDeliveryDate,
        createdBy: ctx.user.id
      });
      
      // Create items
      for (const item of input.items) {
        await ctx.db.insert(purchaseOrderItems).values({
          poId: po.insertId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (Number(item.unitPrice) * item.quantity).toString()
        });
      }
      
      return po;
    }),

  // Update purchase order status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['draft', 'pending', 'approved', 'received', 'cancelled'])
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(purchaseOrders)
        .set({ status: input.status })
        .where(eq(purchaseOrders.id, input.id));
    }),

  // Create GRN
  createGRN: protectedProcedure
    .input(z.object({
      grnNumber: z.string(),
      poId: z.number(),
      receivedDate: z.date(),
      receivedItems: z.array(z.object({
        itemId: z.number(),
        quantity: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      // Create GRN
      const grn = await ctx.db.insert(goodsReceiptNotes).values({
        grnNumber: input.grnNumber,
        poId: input.poId,
        receivedDate: input.receivedDate,
        createdBy: ctx.user.id
      });
      
      // Update received quantities
      for (const item of input.receivedItems) {
        await ctx.db.update(purchaseOrderItems)
          .set({ receivedQuantity: item.quantity })
          .where(eq(purchaseOrderItems.id, item.itemId));
      }
      
      return grn;
    })
})
```

### Frontend Component
```typescript
// client/src/components/PurchasesForm.tsx
export function PurchasesForm({ onSuccess }: { onSuccess: () => void }) {
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([{ productId: '', quantity: 0, unitPrice: 0 }]);
  
  const createMutation = trpc.purchases.create.useMutation({
    onSuccess: () => {
      toast.success('Purchase Order created successfully');
      onSuccess();
    }
  });

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 0, unitPrice: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      poNumber: `PO-${Date.now()}`,
      vendorId: Number(vendorId),
      orderDate: new Date(orderDate),
      expectedDeliveryDate: new Date(deliveryDate),
      items: items.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: item.unitPrice.toString()
      }))
    });
  };

  return (
    <FormDialog title="Create Purchase Order" onSubmit={handleSubmit}>
      <FormField label="Vendor" required>
        <select onChange={(e) => setVendorId(e.target.value)}>
          <option>Select Vendor</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </FormField>
      
      <FormField label="Order Date" required>
        <input type="date" onChange={(e) => setOrderDate(e.target.value)} />
      </FormField>

      <FormField label="Expected Delivery Date">
        <input type="date" onChange={(e) => setDeliveryDate(e.target.value)} />
      </FormField>

      <div className="space-y-3">
        <h3 className="font-semibold">Items</h3>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input placeholder="Product" onChange={(e) => updateItem(idx, 'productId', e.target.value)} />
            <input type="number" placeholder="Qty" onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
            <input type="number" placeholder="Price" onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={handleAddItem} className="text-blue-600">+ Add Item</button>
      </div>

      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create PO'}
      </button>
    </FormDialog>
  );
}
```

## Module 2: Financial Module (Enhanced)

### Key Features
- AR/AP tracking with aging analysis
- Payment reconciliation
- Invoice hyperlinks to Sales/Purchases
- Automated payment reminders
- Financial dashboard with KPIs

### Implementation Steps
1. Enhance existing Financial module with AR/AP detail views
2. Add payment reconciliation features
3. Create aging analysis reports
4. Implement invoice hyperlinks
5. Add financial KPI dashboard

## Module 3: Projects Module

### Key Features
- Project creation with timeline
- Resource allocation and team assignment
- Task/milestone tracking
- Budget tracking and variance analysis
- Project status workflow

### Implementation Steps
1. Create project form with timeline picker
2. Implement team member assignment
3. Add task/milestone tracking
4. Create project detail views
5. Add budget allocation and tracking

## Module 4: Settings Module

### Comprehensive Settings Page
```typescript
// client/src/pages/Settings.tsx
export function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="modules">Module Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Management</TabsTrigger>
          <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="modules">
          <ModuleConfiguration />
        </TabsContent>

        <TabsContent value="parameters">
          <ParameterManagement />
        </TabsContent>

        <TabsContent value="preferences">
          <UserPreferences />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Settings Components
1. **General Settings** - Company info, currency, date format, timezone
2. **Module Configuration** - Enable/disable modules, set defaults
3. **Parameter Management** - Edit field names, validation rules, required fields
4. **User Preferences** - Theme, language, notification settings
5. **Audit Trail** - View all configuration changes with timestamps

## Implementation Priority

1. **Purchases Module** (2 hours) - Critical for procurement workflow
2. **Financial Module** (1.5 hours) - Enhance existing with AR/AP detail views
3. **Projects Module** (2 hours) - Critical for project management
4. **Settings Module** (2 hours) - Comprehensive configuration management
5. **Cross-Module Integration** (1 hour) - Hyperlink navigation

**Total Estimated Time**: 8.5 hours

## Testing Checklist

- [ ] Purchases: Create, Read, Update, Delete PO
- [ ] Purchases: Create GRN and update received quantities
- [ ] Purchases: Filter by vendor, status, date range
- [ ] Financial: View AR/AP aging analysis
- [ ] Financial: Reconcile payments
- [ ] Projects: Create project with timeline
- [ ] Projects: Assign team members
- [ ] Projects: Track budget vs actual
- [ ] Settings: Edit module parameters
- [ ] Settings: View audit trail
- [ ] Cross-module: Click hyperlinks between modules

## Success Criteria

✅ All 5 modules fully functional
✅ CRUD operations working for all modules
✅ Hyperlink navigation between modules
✅ Settings module allows editing all parameters
✅ Data persisted to database
✅ No TypeScript errors
✅ All tests passing
