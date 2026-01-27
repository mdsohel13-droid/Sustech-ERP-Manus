# Comprehensive System Audit Report - CRITICAL ISSUES FOUND

## 🚨 CRITICAL BUG #1: getSalespeople() Returns PRODUCTS Instead of EMPLOYEES

**Location:** `server/db.ts` line 760-765

**Current Implementation (WRONG):**
```typescript
export async function getSalespeople() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(salesProducts);  // ← RETURNS PRODUCTS, NOT EMPLOYEES!
}
```

**Impact:**
- Salesperson dropdown shows product names ("Test Product", "Atomberg Gorilla Fan") instead of employee names
- Users cannot select actual salespeople
- Daily sales records cannot be created with correct salesperson assignment

**Root Cause:**
- Function is querying `salesProducts` table instead of `employees` table
- This is a copy-paste error or incomplete implementation

**Solution:**
- Change to query `employees` table instead
- Filter for active employees only
- Return employee id and name

---

## 🚨 CRITICAL BUG #2: Duplicate Personnel Management Tables

**Tables Found:**
1. **teamMembers** (line 454 in schema.ts) - Has: employeeId, name, email, phone, department, designation, etc.
2. **employees** (line 700 in schema.ts) - Has: userId, employeeCode, departmentId, jobTitle, etc.

**Impact:**
- System has two separate employee management systems
- Data inconsistency - employees added in one table aren't visible in the other
- HR module uses `employees` table
- Sales module tries to use `employees` table but gets wrong data

**Solution:**
- Consolidate into single `employees` table (use the more complete one)
- Remove `teamMembers` table
- Update all references to use single table

---

## Phase 1: Database Schema Audit - FINDINGS

### Critical Issues:
- [x] getSalespeople() returns products instead of employees
- [x] Duplicate personnel tables (teamMembers + employees)
- [ ] Check if other functions have similar copy-paste errors
- [ ] Verify all foreign key relationships are correct
- [ ] Check for orphaned data

### Tables Verified:
- [x] users
- [x] employees
- [x] teamMembers (DUPLICATE - should be removed)
- [x] dailySales
- [x] salesProducts (being misused by getSalespeople)
- [ ] products
- [ ] customers
- [ ] financial_ar
- [ ] financial_ap
- [ ] inventory

---

## Phase 2: HR Module Audit - PENDING

---

## Phase 3: Sales Module Audit - PENDING

---

## Phase 4: Financial Module Audit - PENDING

---

## Phase 5: Inventory Module Audit - PENDING

---

## Phase 6: CRUD Operations Audit - PENDING

---

## Summary of Critical Issues Found

1. **getSalespeople() bug** - Returns products instead of employees
2. **Duplicate personnel tables** - teamMembers and employees both exist
3. **Data flow broken** - Salesperson selection doesn't work due to wrong table query

---

## Recommended Fixes (Priority Order)

### IMMEDIATE (Blocking all salesperson functionality):
1. Fix getSalespeople() to query employees table
2. Consolidate personnel tables
3. Test salesperson dropdown

### HIGH (Data integrity):
4. Audit all db.ts functions for similar copy-paste errors
5. Verify all foreign key relationships
6. Check for orphaned data

### MEDIUM (System stability):
7. Add data validation
8. Add error handling
9. Add logging for debugging
