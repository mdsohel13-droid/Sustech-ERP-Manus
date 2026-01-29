# OPTIMIZED ERP MODULE UPDATE PROMPT

**Use this prompt when updating any ERP module to ensure consistency, reliability, and prevent regressions.**

---

## THE PROMPT

```
ROLE: ERP Module Update Specialist

TASK: Update [MODULE_NAME] module ensuring database integrity, API consistency, and UI accuracy.

BEFORE ANY CODE CHANGES, VERIFY:

═══════════════════════════════════════════════════════════════════
STEP 1: DATABASE LAYER CHECK
═══════════════════════════════════════════════════════════════════

□ Run: SELECT * FROM [table_name] LIMIT 5;
  → Verify table structure and current data

□ Check if table has archivedAt/deletedAt column
  → If not and module needs archive: add via schema, run db:push

□ Verify getAll[Entity]() function in server/db.ts
  → Does it filter out archived items? Frontend should do this, not backend
  → If backend filters, REMOVE the WHERE archivedAt IS NULL clause

□ Verify create[Entity]() function uses .returning({ id: table.id })
  → PostgreSQL requires this pattern, NOT insertId

═══════════════════════════════════════════════════════════════════
STEP 2: API LAYER CHECK
═══════════════════════════════════════════════════════════════════

□ Check all mutations in server/routers.ts for this module:

  - Does it need createdBy? → Must have { input, ctx } and use ctx.user.id
  - Does it update status? → Check if status change should trigger automation:
    • Tender status → "win" or "po_received" → Create Project
    • Tender status → "loss" → Auto-archive (set archivedAt in SAME update)
    • Sale completed → Adjust inventory
    • Payment received → Update AR/AP

□ Verify Zod validation exists for all inputs

□ Verify date fields convert strings → Date before DB insert:
  → submissionDate: submissionDate ? (new Date(submissionDate) as any) : undefined

□ Verify query invalidation after mutations:
  → utils.[module].getAll.invalidate()

═══════════════════════════════════════════════════════════════════
STEP 3: FRONTEND STATE CHECK
═══════════════════════════════════════════════════════════════════

□ Check status badges in tables:
  → WRONG: getFollowUpBadge(item.status, item.followUpDate)
  → RIGHT: getStatusBadge(item.status)
  → Badges must show ACTUAL database status, not derived values

□ Check useMemo dependencies:
  → WRONG: useMemo(() => calc, [filteredArray])
  → RIGHT: useMemo(() => calc, [rawDataArray])
  → Dependencies must include raw query data for proper reactivity

□ Check dashboard KPI calculations:
  → Calculate from allItems.filter(...), not pre-filtered arrays
  → Exclude archived items: filter((t) => !t.archivedAt)

□ Check archive filtering:
  → Active items: allItems.filter((t) => !t.archivedAt)
  → Archived items: allItems.filter((t) => t.archivedAt)

═══════════════════════════════════════════════════════════════════
STEP 4: CROSS-MODULE INTEGRATION CHECK
═══════════════════════════════════════════════════════════════════

□ Customers: Single source, referenced everywhere
□ Tender → Project: Win creates project with transferredToProjectId
□ Sales → Inventory: Completed sales adjust stock
□ AR/AP → Finance: Payments update ledger
□ All financial changes → audit_logs table

═══════════════════════════════════════════════════════════════════
STEP 5: UI/UX CONSISTENCY CHECK (Per Dashboard Image)
═══════════════════════════════════════════════════════════════════

□ Match dashboard layout to reference image
□ KPI cards: Correct calculations, proper icons, consistent colors
□ Charts: Correct data source, responsive, proper legends
□ Tables: Searchable, filterable, proper column alignment
□ Popups: Show correlated data, proper field mapping
□ Status badges: Consistent colors across all modules:
  • Not Started: Gray (bg-gray-100 text-gray-800)
  • In Progress: Blue (bg-blue-100 text-blue-800)
  • Pending: Yellow (bg-yellow-100 text-yellow-800)
  • Completed/Won: Green (bg-green-100 text-green-800)
  • Failed/Loss: Red (bg-red-100 text-red-800)
  • PO Received: Purple (bg-purple-100 text-purple-800)

═══════════════════════════════════════════════════════════════════
STEP 6: VALIDATION BEFORE COMPLETION
═══════════════════════════════════════════════════════════════════

□ Test status transitions: Change status → verify dashboard updates
□ Test archive/restore: Archive item → appears in archive tab → restore works
□ Test clickable elements: All links/buttons trigger correct actions
□ Test data integrity: No orphan records, no data disappears
□ Run integrity SQL:
  SELECT id, status, "archivedAt" FROM [table_name] 
  WHERE "archivedAt" IS NOT NULL;

═══════════════════════════════════════════════════════════════════
AFTER CHANGES COMPLETE
═══════════════════════════════════════════════════════════════════

□ Restart workflow to apply changes
□ Verify no console errors
□ Update replit.md with changes made
□ Document any new automation rules

OUTPUT FORMAT:
1. List issues found
2. List fixes applied
3. Confirm validation passed
4. Note any remaining items for future work
```

---

## QUICK REFERENCE: COMMON FIXES

### Fix 1: Backend Query Filtering Out Archived Items
```typescript
// WRONG - backend filters, frontend never sees archived items
export async function getAllItems() {
  return await db.select().from(items)
    .where(isNull(items.archivedAt));  // ❌ REMOVE THIS
}

// RIGHT - return all items, let frontend filter
export async function getAllItems() {
  return await db.select().from(items)
    .orderBy(desc(items.createdAt));  // ✅ No filter
}
```

### Fix 2: Status Badge Using Derived Value
```typescript
// WRONG - shows "In Progress" based on date, not actual status
<TableCell>{getFollowUpBadge(item.status, item.followUpDate)}</TableCell>

// RIGHT - shows actual database status
<TableCell>{getStatusBadge(item.status)}</TableCell>
```

### Fix 3: Archive + Update Race Condition
```typescript
// WRONG - two separate calls can conflict
if (status === "loss") {
  await db.archiveItem(id);  // Sets archivedAt
}
await db.updateItem(id, data);  // May overwrite archivedAt

// RIGHT - single atomic update
const updateData = { ...data };
if (status === "loss") {
  updateData.archivedAt = new Date();
}
await db.updateItem(id, updateData);  // ✅ Atomic
```

### Fix 4: MySQL insertId Pattern
```typescript
// WRONG - MySQL syntax doesn't work in PostgreSQL
const [result] = await db.insert(table).values(data);
return result.insertId;

// RIGHT - PostgreSQL requires .returning()
const result = await db.insert(table).values(data)
  .returning({ id: table.id });
return result[0]?.id;
```

### Fix 5: Missing ctx in Mutation
```typescript
// WRONG - no access to ctx.user
.mutation(async ({ input }) => {
  await db.createItem({ ...data, createdBy: ctx.user.id });  // ❌ ctx undefined

// RIGHT - include ctx in destructuring
.mutation(async ({ input, ctx }) => {
  await db.createItem({ ...data, createdBy: ctx.user.id });  // ✅ Works
```

### Fix 6: useMemo Wrong Dependencies
```typescript
// WRONG - depends on filtered array, won't update
const stats = useMemo(() => {
  return activeItems.length;
}, [activeItems]);  // ❌ activeItems is derived

// RIGHT - depends on raw data
const stats = useMemo(() => {
  const active = allItems.filter(i => !i.archivedAt);
  return active.length;
}, [allItems]);  // ✅ allItems is from query
```

---

## MODULE STATUS REFERENCE

| Module | Table | Has Archive | Status Automation | Notes |
|--------|-------|-------------|-------------------|-------|
| Tender/Quotation | tender_quotation | ✅ | Win→Project, Loss→Archive | Fixed |
| Sales | daily_sales | ✅ | - | Needs review |
| Projects | projects | ❌ | - | Needs archivedAt |
| Customers | customers | ❌ | - | Needs archivedAt |
| Employees | employees | ❌ | - | Needs archivedAt |
| AR/AP | accounts_* | ❌ | Paid→Ledger | Needs archivedAt |
| Action Tracker | action_tracker | ❌ | - | Needs archivedAt |
| Inventory | product_inventory | ❌ | - | Needs archivedAt |

---

*Use this prompt at the start of any module update session to prevent common issues and maintain system consistency.*
