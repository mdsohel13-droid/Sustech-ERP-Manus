# Universal Hyperlink Implementation Guide

## Overview
This guide documents the implementation of clickable hyperlinks across all 22 modules of the Sustech ERP system. All hyperlinks use the `HyperlinkCell` component for consistency.

## HyperlinkCell Component Usage

### Import
```tsx
import { HyperlinkCell, HyperlinkTableCell, HyperlinkCardCell, HyperlinkListItem } from "@/components/HyperlinkCell";
```

### Basic Usage
```tsx
<HyperlinkCell
  label="Click me"
  onClick={() => handleEdit(item.id)}
  stopPropagation={true}
/>
```

### Table Cell Usage
```tsx
<td className="p-4">
  <HyperlinkTableCell
    label={order.name}
    onClick={() => setEditingOrder(order)}
    size="sm"
  />
</td>
```

### Kanban Card Usage
```tsx
<HyperlinkCardCell
  label={project.name}
  onClick={() => handleEdit(project)}
  stopPropagation={true}
/>
```

## Module Implementation Checklist

### Operations Modules (5)
- [ ] Sales - Order names, customer names, product names
- [ ] Products - Product names, category names, supplier names
- [ ] Customers - Customer names, contact names, company names
- [ ] Purchases - PO names, vendor names, product names
- [ ] Inventory - Item names, warehouse names, location names

### Finance Modules (4)
- [ ] Financial - Invoice numbers, account names, vendor names
- [ ] Income & Expenditure - Transaction descriptions, account names, category names
- [ ] Budget - Budget names, department names, category names
- [ ] Tender/Quotation - Tender names, vendor names, item names

### Business Modules (5)
- [ ] Projects - Project names, customer names, team member names
- [ ] CRM - Lead names, company names, contact names, activity descriptions
- [ ] Action Tracker - Action titles, assignee names, project names
- [ ] HR - Employee names, department names, position names
- [ ] Reporting & Analytics - Report names, metric names, dashboard names

### Supporting Modules (8)
- [ ] Dashboard - Widget titles, metric names
- [ ] Alerts Dashboard - Alert names, module names
- [ ] Workflow Execution - Workflow names, trigger names
- [ ] Admin Settings - Configuration names
- [ ] Reports Export - Report names, template names
- [ ] DashboardCustomizable - Widget names
- [ ] Customizable Dashboard - Widget names

## Implementation Pattern

### For Table Views
```tsx
<table>
  <tbody>
    {items.map((item) => (
      <tr key={item.id}>
        <td className="p-4">
          <HyperlinkTableCell
            label={item.name}
            onClick={() => { setEditingItem(item); setDialogOpen(true); }}
            size="sm"
          />
        </td>
        {/* Other columns */}
      </tr>
    ))}
  </tbody>
</table>
```

### For Kanban Views
```tsx
{items.map((item) => (
  <div key={item.id} className="kanban-card">
    <HyperlinkCardCell
      label={item.name}
      onClick={() => { setEditingItem(item); setDialogOpen(true); }}
      stopPropagation={true}
    />
    {/* Other content */}
  </div>
))}
```

### For List Views
```tsx
<ul>
  {items.map((item) => (
    <li key={item.id}>
      <HyperlinkListItem
        label={item.name}
        onClick={() => { setEditingItem(item); setDialogOpen(true); }}
      />
    </li>
  ))}
</ul>
```

## Styling Consistency

All hyperlinks follow this pattern:
- **Color**: Blue (#2563eb)
- **Hover Color**: Darker blue (#1e40af)
- **Decoration**: Underline on hover
- **Alignment**: Left-aligned with full width
- **Cursor**: Pointer on hover
- **Disabled State**: Gray with no underline

## Benefits

1. **Consistency**: All modules use the same hyperlink styling
2. **Accessibility**: Proper button semantics and keyboard support
3. **User Experience**: Clear visual feedback with hover effects
4. **Maintainability**: Single component to update for style changes
5. **Performance**: Lightweight implementation with no external dependencies
