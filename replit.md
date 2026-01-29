# Sustech ERP System

## Overview
A comprehensive Enterprise Resource Planning (ERP) system imported from Manus AI, featuring modules for financial tracking, sales management, project pipeline, customer CRM, HR management, and commission tracking.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + tRPC
- **Database**: PostgreSQL (Drizzle ORM)
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

## Project Structure
```
client/               # React frontend
  src/
    components/       # Reusable UI components
    pages/            # Page components
    lib/              # Utilities and tRPC client
server/               # Express backend
  _core/              # Server entry point
  db.ts               # Database functions
  routers.ts          # tRPC API routes
drizzle/              # Database schema and migrations
  schema.ts           # Drizzle schema definitions
```

## Audit Documents
- `ERP_AUDIT_SUMMARY.md` - Comprehensive audit findings for all modules
- `ERP_MODULE_UPDATE_PROMPT.md` - Reusable prompt for future module updates

## Recent Changes (Jan 29, 2026)
- **Procurement Module Complete Redesign**: Renamed from "Purchases" to "Procurement" with modern dashboard
  - **Route Change**: /purchases → /procurement (all navigation, breadcrumbs, hyperlinks updated)
  - **New Database Tables**: vendors, purchase_orders, purchase_order_items with proper enums (purchase_order_status, vendor_status, purchase_category)
  - **6 Colorful Gradient KPI Cards**: Total Purchase Orders (indigo/purple), Pending Approvals (teal/cyan), In Transit (emerald/green), Overdue Deliveries (orange/amber), Total Spend YTD (rose/pink), Active Vendors (violet/purple)
  - **Spend Trend Line Chart**: Shows 6-month procurement spending trend
  - **Top 5 Vendors by Spend**: Bar chart with color-coded vendor spending
  - **Procurement Analytics Pie Chart**: Shows order distribution by status (Received, In Transit, Pending)
  - **Orders by Category Bar Chart**: Displays procurement by category (Electronics, Raw Materials, Equipment, etc.)
  - **Recent Purchase Orders Table**: Clickable PO numbers, vendor info, status badges, action buttons
  - **Tabs**: Overview (dashboard), All Orders, Vendors, Archive
  - **Vendor Management**: Full CRUD operations for vendors with contact details, payment terms, status tracking
  - **Archive/Restore**: Archive functionality for purchase orders and vendors
  - **Auto-Generated PO Numbers**: Format PO-YYYY-### (e.g., PO-2026-001)
  - **Backend**: Full tRPC routes for vendors, purchase orders, items, dashboard stats, spend analytics
- **CRM Module Complete Redesign**: Renamed from "Customers" to "CRM" with modern dashboard
  - **New Database Tables**: crm_leads, crm_opportunities, crm_activities, crm_tasks with proper enums
  - **5 Colorful Gradient KPI Cards**: Total Leads (teal), Active Opportunities (emerald), Deals Won (violet), Total Revenue YTD (amber), Tasks Due (slate)
  - **Sales Pipeline Funnel Chart**: Colored horizontal bars showing lead progression (Prospecting → Qualification → Proposal → Negotiation)
  - **Sales Performance Trend**: Line chart showing monthly revenue performance
  - **Recent Leads Table**: Shows latest leads with clickable reference IDs, status badges
  - **Open Opportunities Table**: Displays active opportunities with customer, stage, amount, owner
  - **Recent Activities Sidebar**: Timeline of calls, emails, meetings, tasks with icons
  - **Top Sales Reps Widget**: Shows top 3 performers with gold/silver/bronze badges
  - **Tabs**: Overview (dashboard), All Leads, All Opportunities, Archive, legacy Customers
  - **CRUD Dialogs**: Add/Edit/View dialogs for leads, opportunities, activities
  - **Archive/Restore**: Archive functionality for leads and opportunities
  - **Route Change**: /customers → /crm (all navigation, breadcrumbs, hyperlinks updated)
  - **Backend**: Full tRPC routes for leads, opportunities, activities, tasks, dashboard stats
- **Products Module Dashboard Redesign**: Modern UI with colorful KPI cards and two-column layout
  - **5 Colorful Gradient KPI Cards**: Total Products (blue), Active Listings (green), Revenue Last 30 Days (slate), Top Category (amber), Discontinued (orange)
  - **Two-Column Layout**: 75% product listings with tabs, 25% performance sidebar
  - **Sales Trends Chart**: AreaChart showing 30-day revenue with gradient fill
  - **Top Selling Products**: Medal-style rankings (gold/silver/bronze) for top 5 products
  - **Quick Stats Card**: Categories, brands, warehouses, low stock alerts, out of stock counts
  - **Backend Endpoints**: getSalesTrends, getRevenueStats, getTopSellingProducts, getTopCategory
- **Tender/Quotation Module Redesign**: Complete UI overhaul with database integration
  - **4 Colorful KPI Cards**: Government Tenders, Private Quotations, Won/PO Received, Pending Follow-Up
  - **Tenders & Quotations Tabs**: Separate views for government tenders and private quotations
  - **Archive Tab**: View and restore past, due, or lost tenders and quotations
  - **Clickable Reference ID**: Click on Tender/Quotation ID to view details popup
  - **Filter Bar**: Status, Client, Timeline dropdowns with search functionality
  - **Data Table**: Reference ID, Description, Client, Submission Deadline, Status, Estimated Value, Actions
  - **Status Badges**: Color-coded badges (Not Started, Preparing, Submitted, Won, Loss, PO Received)
  - **CRUD Dialogs**: Add/Edit/View dialogs with proper form fields (Reference ID, Description, Client, Dates, Value, Status, Notes)
  - **Archive/Restore**: Archive tenders/quotations and restore from archive
  - **Auto-Archive on Loss**: Items marked as "Loss" automatically move to archive (no data disappears)
  - **Auto-Project Creation**: When a Tender/Quotation is marked as "Win" or "PO Received", automatically creates a Project with all data
  - **Database Integration**: Uses tRPC queries (tenderQuotation.getAll, customers.getAll) for real-time data
  - **Backend Integration**: Properly uses authenticated user context for createdBy field, restore endpoint for unarchiving
- **Sales Module Redesign v2**: Complete layout restructure with 35% dashboard / 65% data entry split
  - **Compact Dashboard Section (35%)**:
    - 4 colorful gradient KPI cards: Total Sales, Open Opportunities, Sales This Month, Revenue This Quarter
    - Mini charts row: Sales Performance area chart, Sales Pipeline bar chart
    - Compact status indicators: Top Salesperson, Deals Closing, Forecast, Overdue
  - **Data Entry & Tracking Section (65%)**: Tabs for Daily Sales, Weekly/Monthly Targets, Salespeople, Archive, Analytics
  - **Product Detail Modal Fix**: Now shows actual sale information (product name, price, salesperson, customer) instead of "Test Product"
    - Modal data built from sale record, not database lookup
    - Modal properly clears state on close
  - **Enhanced Salesperson Tracking Tab**:
    - Performance summary cards: Active Salespeople, Total Team Sales, Avg Per Person, Top Performer
    - Performance table with: Total Sales, Transactions, Avg Deal Size, Target Progress bar
    - Target progress uses real data from monthlyTargets (falls back to team average if no individual target)
    - Sales by Product analysis with category derivation from product names
    - Performance Leaderboard ranking salespeople by revenue
  - **Products Module Integration**: Record Daily Sale dialog uses catalog products with real-time inventory visibility
  - Added Date field and Notes field to Record Daily Sale dialog
  - Uses currency context for consistent formatting across all amounts
- **Inventory Module Upgrade**: Complete overhaul of Inventory page to use real database
  - Replaced sample/static data with real database queries via tRPC
  - Stock Levels tab shows real inventory data by product and warehouse
  - Stock Movements tab displays real transaction history with product/warehouse names
  - Warehouses tab with full CRUD operations (create, edit, delete)
  - Stock Adjustment dialog supports Add, Remove, and Set Stock Level operations
  - Proper transaction type mapping based on reason (count, damage, return, purchase, sale)
  - **Redesigned Dashboard** matching modern design with:
    - Top KPI row: 5 colorful gradient cards (Total Stock, Out of Stock, Stock Value, Low Stock, Health Score)
    - Charts row: Inventory Turnover line chart + Stock Level bar chart
    - Status cards row: Low Stock, Expiry Soon, Out of Stock, Overstocked with colored borders
    - Bottom widgets: Low Stock Items table, Stock Distribution pie chart, Purchase Orders list
- **Products & Inventory Integration**: Integrated inventory management into Products module
  - Added `warehouses` table for storage locations
  - Added `product_inventory` table for stock levels per product per warehouse
  - Added `inventory_transactions` table for stock movement history
  - Enhanced Products table with Stock and Location columns
  - Added Inventory tab showing stock levels by product and warehouse
  - Added Warehouses tab for managing storage locations
  - Added Stock Adjustment dialog for recording stock changes (purchases, sales, adjustments, transfers, etc.)
- **Product Detail Popup**: Click on any product name to view comprehensive product details
  - Shows stock levels, pricing, profit margin in quick stats cards
  - Displays stock locations by warehouse
  - Shows all product attributes (category, brand, unit, warranty, tax rate, etc.)
  - Quick actions to adjust stock or edit product
- **Enhanced Dashboard**: Products module now shows 10 KPI cards
  - Row 1: Total Products, Total Stock, Stock Value, Low Stock Alerts, Out of Stock, Warehouses
  - Row 2: Categories, Brands, Units, Archived
  - Visual alerts for low stock (yellow) and out of stock (red) conditions
- Products module now uses only dynamic categories (static category enum deprecated)
- Fixed product creation with proper handling of optional fields

## Recent Changes (Jan 28, 2026)
- Converted database from MySQL to PostgreSQL
- Updated Drizzle ORM driver from mysql2 to pg
- Ran migrations creating 58 database tables
- Refactored AnalyticsDashboard to use real database queries via tRPC
- Added KPI endpoints: dashboard.getKPIs, dashboard.getRevenueTrends, dashboard.getTopProducts, dashboard.getDepartmentDistribution
- **Added database CHECK constraints** to prevent negative values on financial tables
- **Added Zod API validation** for all financial mutations (amounts, quantities, discounts)

## Database
- 67 tables including: accounts_payable, accounts_receivable, customers, daily_sales, employees, projects, quotation_items, warehouses, product_inventory, inventory_transactions, etc.
- Schema defined in `drizzle/schema.ts`
- Use `npm run db:push` to sync schema changes

## Data Integrity Constraints
The following CHECK constraints prevent invalid data at the database level:
- `accounts_receivable.amount >= 0`
- `accounts_payable.amount >= 0`
- `income_expenditure.amount >= 0`
- `daily_sales.totalAmount >= 0`, `quantity >= 0`
- `quotation_items.quantity >= 0`, `unitPrice >= 0`, `amount >= 0`, `finalAmount >= 0`
- `sales.target >= 0`, `actual >= 0`
- `projects.value >= 0`

API-level Zod validation also rejects negative amounts before database operations.

## Key Commands
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database

## Authentication & Security

### Authentication
- OAuth via oauth.emergentagent.com
- Email/password login also supported
- Sessions stored in database with secure cookies

### Role-Based Access Control
- `adminProcedure` - Admin-only routes (settings, security, user management)
- `managerProcedure` - Manager or admin access
- `protectedProcedure` - Any authenticated user

### Session Security
- All `/admin` and `/settings` routes require admin role
- Unauthorized access attempts are blocked with FORBIDDEN error
- Sessions are validated on every request via tRPC middleware

### Audit Logging
All financial mutations are automatically logged to `audit_logs` table:
- **Who**: User ID performing the action
- **What**: Action type (create/update/delete), entity type, old/new values
- **When**: Timestamp of the action
- **Where**: IP address and user agent

### Transaction Safety
- PostgreSQL transactions ensure financial operations fully succeed or fully rollback
- Double-entry verification available for KPI updates
- All amounts validated before database operations

## Environment Variables
Required:
- DATABASE_URL - PostgreSQL connection string (auto-provided by Replit)

Optional:
- VITE_ANALYTICS_ENDPOINT - Analytics endpoint URL
- VITE_ANALYTICS_WEBSITE_ID - Analytics website ID
- SMTP credentials for email notifications
- AWS S3 credentials for file storage
- OPENAI_API_KEY for AI features
