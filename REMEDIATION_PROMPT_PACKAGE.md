# Complete Remediation Prompt Package
## Sustech KPI Dashboard - All Fixes in One Place

This document contains all prompts and instructions needed to fix every issue identified in the comprehensive audit.

---

## QUICK START - PRIORITY ORDER

### CRITICAL (Fix First - Blocking Deployment)
1. Fix 394 TypeScript errors
2. Implement data persistence
3. Complete CRUD operations
4. Add form validation

### HIGH (Fix Soon - Core Functionality)
5. Add missing hyperlinks
6. Fix navigation
7. Implement error handling

### MEDIUM (Fix Before Release)
8. Consolidate HR modules
9. Add accessibility
10. Comprehensive testing

---

## PHASE 1: FIX TYPESCRIPT COMPILATION ERRORS

### Step 1.1: Fix Router Import (Fixes 169 errors)

File: `server/routers-db-integration.ts` Line 7

CHANGE:
```typescript
import { publicProcedure, protectedProcedure, router } from './routers';
```

TO:
```typescript
import { publicProcedure, protectedProcedure, router } from './_core/trpc';
```

### Step 1.2: Add Type Annotations to Event Handlers (Fixes 128 errors)

Pattern for all module files:

CHANGE:
```typescript
const handleSubmit = (e) => { }
const handleChange = (value) => { }
```

TO:
```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { }
const handleChange = (value: string) => { }
```

### Step 1.3: Add Types to Destructured Parameters (Fixes 56 errors)

Pattern for all procedures:

CHANGE:
```typescript
.mutation(async ({ input }) => { })
```

TO:
```typescript
.mutation(async ({ input }: { input: CreateOrderInput }) => { })
```

---

## PHASE 2: IMPLEMENT MISSING HYPERLINKS

Apply to all modules - Pattern:

```typescript
import { HyperlinkTableCellWithAnalytics } from '@/components/HyperlinkCellWithAnalytics';

// In table cells:
<HyperlinkTableCellWithAnalytics
  value={item.name}
  onClick={() => handleViewItem(item)}
  module="ModuleName"
  recordId={item.id}
  recordType="itemType"
/>
```

---

## PHASE 3: IMPLEMENT COMPLETE CRUD OPERATIONS

For each module, implement:
1. Create mutation
2. Update mutation
3. Delete mutation
4. Form submission handlers
5. tRPC procedures

---

## PHASE 4: FIX FORM VALIDATION

Add Zod validation to all forms:

```typescript
const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
```

---

## PHASE 5: IMPLEMENT DATA PERSISTENCE

Wire database routers to main appRouter in `server/routers.ts`

---

## PHASE 6: FIX NAVIGATION

Add breadcrumbs to all modules:

```typescript
usePageBreadcrumbs('ModuleName', 'Display Name');
```

---

## PHASE 7: CONSOLIDATE HR MODULES

Merge Users.tsx and Team.tsx into HumanResource.tsx

---

## TESTING CHECKLIST

For each module test:
- Create operation works
- Read operation works
- Update operation works
- Delete operation works
- Hyperlinks work
- Forms validate
- Errors handled
- Loading states shown
- Data persists

---

## DEPLOYMENT STEPS

1. Fix all TypeScript errors
2. Implement all CRUD operations
3. Add all hyperlinks
4. Fix all forms
5. Run full test suite
6. Deploy to production

