# Data Entry Forms Implementation Guide

## Overview
This document outlines the implementation of comprehensive data entry forms for all 22 ERP modules. Each form will follow a consistent pattern with validation, error handling, and database integration.

## Form Implementation Pattern

### 1. Core Form Components
Each module will have:
- **Add/Create Form** - Dialog or page for creating new records
- **Edit Form** - Dialog or page for editing existing records
- **View Details** - Read-only view with edit button
- **Delete Confirmation** - Confirmation dialog for deletions
- **Form Validation** - Client-side and server-side validation
- **Error Handling** - User-friendly error messages
- **Success Feedback** - Toast notifications on success

### 2. Form Structure
```
Form Container
├── Header (Title, Close Button)
├── Form Fields
│   ├── Text Inputs
│   ├── Number Inputs
│   ├── Date Pickers
│   ├── Select Dropdowns
│   ├── Textarea
│   ├── Checkboxes
│   └── File Uploads
├── Validation Messages
├── Action Buttons (Save, Cancel)
└── Loading State
```

### 3. Modules Requiring Data Entry Forms

#### OPERATIONS
1. **Sales** - Product, quantity, price, customer, date
2. **Products** - Name, SKU, category, price, stock
3. **Customers** - Name, email, phone, address, type
4. **Purchases** - Vendor, items, quantity, price, date
5. **Inventory** - Item, quantity, location, status

#### FINANCE
6. **Financial** - AR/AP entries, invoices, payments
7. **Income & Expenditure** - Category, amount, date, description
8. **Budget** - Department, amount, period, category

#### BUSINESS
9. **Projects** - Name, customer, status, dates, budget
10. **CRM/Customers** - Contact info, interaction history
11. **Action Tracker** - Task, owner, due date, priority
12. **Tender/Quotation** - Items, terms, validity, customer

#### ADMIN
13. **Team** - Member info, role, department (consolidated with HR)
14. **Settings** - Configuration, preferences
15. **Notifications** - Message, recipient, type
16. **Attachments** - File upload, description

#### ANALYTICS
17. **Dashboard** - Widget configuration
18. **Insights** - Generated insights (read-only)
19. **Reports** - Report parameters, filters

#### ADDITIONAL
20. **Ideas** - Brain dump notes, tags
21. **Transaction Types** - Type name, description
22. **Permissions** - Role, permissions matrix

## Implementation Priority

### Phase 2A: Core Modules (High Priority)
1. Sales
2. Products
3. Customers
4. Purchases
5. Financial (AR/AP)

### Phase 2B: Business Modules (Medium Priority)
6. Projects
7. Tender/Quotation
8. Income & Expenditure
9. Budget
10. Inventory

### Phase 2C: Admin & Support Modules (Lower Priority)
11. Action Tracker
12. Settings
13. Notifications
14. Attachments
15. Team/HR

### Phase 2D: Analytics & Utilities (Lowest Priority)
16. Insights (read-only)
17. Reports
18. Ideas
19. Transaction Types
20. Permissions
21. Dashboard
22. CRM (if separate from Customers)

## Form Validation Rules

### Common Validations
- Required fields must not be empty
- Email fields must be valid email format
- Phone fields must be valid phone format
- Number fields must be numeric
- Date fields must be valid dates
- Currency fields must be positive numbers
- File uploads must be under size limit
- Unique constraints (email, SKU, etc.)

### Module-Specific Validations
- Sales: Quantity > 0, Price > 0
- Products: SKU unique, Price > 0, Stock >= 0
- Customers: Email or Phone required
- Purchases: Vendor required, Items > 0
- Financial: Amount > 0, Due date in future
- Projects: Start date before end date
- Budget: Amount > 0, Period valid

## Database Integration

### Create Operations
1. Validate form data
2. Call tRPC mutation with form data
3. On success: Invalidate query cache, show toast, close dialog
4. On error: Show error message, keep dialog open

### Update Operations
1. Load existing data into form
2. Validate changes
3. Call tRPC mutation with updated data
4. On success: Invalidate query cache, show toast, close dialog
5. On error: Show error message, keep dialog open

### Delete Operations
1. Show confirmation dialog
2. Call tRPC mutation to delete
3. On success: Invalidate query cache, show toast
4. On error: Show error message

## UI/UX Considerations

### Form Layout
- Use consistent spacing and alignment
- Group related fields together
- Use clear labels and placeholder text
- Show required field indicators (*)
- Display validation errors inline

### User Feedback
- Show loading spinner during submission
- Display success toast on completion
- Show error toast with specific error message
- Disable submit button during submission
- Auto-close dialogs on success (optional)

### Accessibility
- Use proper form labels (not just placeholders)
- Support keyboard navigation
- Show focus indicators
- Use semantic HTML
- Include ARIA labels where needed

## Implementation Steps

1. **Create Reusable Form Components**
   - FormField component with label, input, error
   - FormDialog component with header, footer
   - FormButton component with loading state

2. **Implement Module Forms**
   - Create form component for each module
   - Add form to module page
   - Wire up mutations and queries

3. **Add Form Validation**
   - Client-side validation with Zod
   - Server-side validation in procedures
   - Display validation errors

4. **Test Forms**
   - Test create operation
   - Test update operation
   - Test delete operation
   - Test validation errors
   - Test network errors

## Next Steps

1. Create reusable form components
2. Implement forms for Phase 2A modules
3. Test forms with database integration
4. Extend to Phase 2B modules
5. Continue with remaining modules
6. Add advanced features (multi-step forms, conditional fields, etc.)
