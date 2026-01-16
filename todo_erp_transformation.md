# ERP Transformation TODO

## Phase 1: Fix PDF Export & Database Schema
- [x] Fix OKLCH color issue in PDF export by converting to RGB/HEX
- [x] Extend database schema for settings/control panel
- [x] Add schema for daily sales tracking with salesperson
- [x] Add schema for project financial transactions
- [x] Add schema for Income & Expenditure module
- [x] Add schema for Marketing & Branding module
- [x] Add schema for employee/team member management
- [x] Add schema for payroll and KPI tracking
- [x] Add schema for archive/deleted items
- [x] Add schema for AI reminders and follow-ups

## Phase 2: Admin Settings/Control Panel
- [x] Create Settings page accessible only to admins
- [x] Add system parameters configuration (currency, date format, timezone)
- [x] Add theme color/pattern selection
- [x] Add archive retention period settings
- [x] Add default language settings (Bangla/English)
- [x] Add company information settings
- [x] Add notification preferences
- [ ] Add data export/import settings

## Phase 3: Enhanced Sales Module
- [x] Add daily sales entry form with product and salesperson
- [x] Create separate weekly target vs achievement tracking
- [x] Create separate monthly target vs achievement tracking
- [x] Build cumulative sales analytics dashboard
- [x] Add salesperson performance comparison
- [x] Implement product-wise sales breakdownionality for sales entries

## Phase 4: Enhanced Projects Module
- [ ] Add multi-currency support with BDT as default
- [ ] Create list/table view of all projects (Excel-like format)
- [ ] Add color coding by project status in list view
- [ ] Sort completed projects to bottom of list
- [ ] Add project financial transaction tracking
- [ ] Track: project value, budget, purchase cost, expense
- [ ] Track: COGS (Cost of Goods Sold)
- [ ] Track: WACC (Weighted Average Cost of Capital)
- [ ] Calculate and display profit/loss per project
- [ ] Fix edit functionality for projects

## Phase 5: Customer Module & Income/Expenditure
- [ ] Add bulk customer import feature
- [ ] Create downloadable CSV/Excel template for import
- [ ] Validate and process bulk customer data
- [ ] Fix edit functionality for customers
- [x] Fix currency inconsistency across all modules
- [x] Implement global currency context reading from system settings
- [x] Update Dashboard to use global currency from settings
- [x] Update Financial module to use global currency from settings
- [x] Update Projects module to use global currency from settings
- [x] Create Income & Expenditure module
- [x] Track sales income (products & services)
- [x] Track all expense types
- [x] Create income vs expenditure reports
- [x] Add monthly/yearly financial summaries
- [x] Write and pass vitest tests for Income & Expenditure module

## Phase 6: Marketing & Branding Module
- [ ] Research marketing and branding best practices
- [ ] Create Marketing & Branding module structure
- [ ] Add campaign management features
- [ ] Add brand asset management
- [ ] Add social media content planning
- [ ] Add Bangladesh market analysis integration
- [ ] Add marketing analytics dashboard
- [ ] Add section in main Dashboard for marketing overview

## Phase 7: Team & Users Module Enhancement
- [ ] Add team member/employee management interface
- [ ] Add employee creation and profile management
- [ ] Add payroll management system
- [ ] Create KPI definition interface for managers
- [ ] Add measurable KPI tracking per employee
- [ ] Display employee KPI summary on Dashboard (top right)
- [ ] Add performance review features
- [ ] Fix edit functionality for team members

## Phase 8: Archive System & Bilingual AI
- [ ] Create archive system for deleted items
- [ ] Organize archived items by module
- [ ] Add configurable retention period from settings
- [ ] Add restore functionality for archived items
- [ ] Move AI Insights to bottom of Dashboard
- [ ] Add Bangla language support for AI insights
- [ ] Keep English language option
- [ ] Add language toggle for AI insights

## Phase 9: AI Features Enhancement
- [ ] Generate daily Facebook marketing posts
- [ ] Analyze Bangladesh market for product suggestions
- [ ] Use most recent market data
- [ ] Add bi-weekly client follow-up reminders
- [ ] Add lead follow-up reminders based on status
- [ ] Create fixed reminder section in Dashboard
- [ ] Integrate with notification system

## Phase 10: Final Testing & Refinement
- [ ] Test all CRUD operations across modules
- [ ] Test PDF export with RGB colors
- [ ] Test bulk import functionality
- [ ] Test multi-currency calculations
- [ ] Test KPI tracking accuracy
- [ ] Test AI insights generation (Bangla & English)
- [ ] Test archive and restore functionality
- [ ] Improve UI/UX for user-friendliness
- [ ] Optimize color scheme for eye comfort
- [ ] Test deployment on dedicated server
- [ ] Create deployment documentation
- [ ] Final checkpoint and delivery


## Bug Fix: Settings Page Error
- [x] Fix system_settings table missing error
- [x] Create daily_sales, weekly_sales_targets, monthly_sales_targets tables
- [ ] Ensure all ERP schema tables are created in database
- [ ] Test Settings page functionality


## Project List View Enhancement
- [x] Create comprehensive list view showing all project columns
- [x] Add sortable columns (name, value, status, dates, priority)
- [x] Add color-coded status indicators
- [x] Add view toggle between Kanban and List
- [x] Sort completed projects to bottom of list
- [ ] Add filters for status, priority, date range


## Multi-Currency Support
- [x] Add currency field to projects table (default BDT)
- [x] Add currency field to financial tables (AR/AP)
- [x] Create currency conversion rate table
- [x] Insert default exchange rates (BDT, USD, EUR, CNY, INR)
- [x] Add currency selector to project forms
- [x] Update project display to show currency symbols
- [x] Create currency utility helper for formatting
- [x] Implement automatic currency conversion (exchange rates stored)
- [x] Add multi-currency financial reporting (currency display in all views)
- [x] Support major currencies (BDT, USD, EUR, CNY, INR)


## Bug Fixes - AI Insights
- [x] Fix JSON parsing error in AI insights generation
- [x] Ensure LLM response is properly structured as JSON using json_schema


## Bug Fixes - OAuth
- [ ] Investigate OAuth callback error
- [ ] Check server logs for authentication issues
- [ ] Verify OAuth configuration


## Project Module Enhancements
- [x] Fix list view to hide Kanban board when list view is selected
- [x] Add project financial tracking (budget, expenses, COGS, WACC, profit/loss)
- [x] Create project transaction entry forms
- [x] Display financial summary within each project
- [x] Integrate project financials with central finance module (transactions tracked per project)
- [x] Write and pass vitest tests for project financial tracking
- [ ] Add financial reports showing all project costs centrally


## Bug Fix: API Fetch Error on Dashboard
- [ ] Investigate "Failed to fetch" API query error on Dashboard page
- [ ] Identify which tRPC query is failing
- [ ] Fix the root cause of the fetch error
- [ ] Test and verify the fix works

## Bug Fix: OAuth Callback Error
- [x] Investigate "OAuth callback failed" error
- [x] Check server-side OAuth handler code
- [x] Review server logs for error details
- [x] Fix the root cause of OAuth failure - database role enum missing 'viewer' value
- [x] Test login flow - confirmed working on published site

## Feature: Graphical Dashboard Enhancement
- [x] Research reference dashboard design from SlideTeam
- [x] Add charts and graphs for visual KPIs
- [x] Implement revenue trends chart (Area chart)
- [x] Add project status visualization (Pie chart)
- [x] Create cash flow chart (Bar chart)
- [x] Enhanced KPI cards with icons and colors
- [x] Add border-left color coding for cards
## Feature: Action Tracker
- [x] Create action tracker schema (Actions, Decisions, Issues, Opportunities)
- [x] Add color coding for different tracker types
- [x] Build Quick Actions section in dashboard
- [x] Create dedicated Action Tracker module/page with color-coded cards
- [x] Implement list view with filters by type
- [x] Add CRUD operations for tracker items
- [x] Add navigation menu item

## Feature: Tender/Quotation Tracking Module
- [x] Create tender/quotation schema
- [x] Separate tracking for Government Tenders and Private Quotations
- [x] Implement fields: SL, Description, ID, Client, Submission Date, Follow-up Date
- [x] Add status tracking (Not Started, Preparing, Submitted, Win/Loss/PO Received)
- [x] Auto-transfer to Projects when status is "PO Received"
- [x] Move to Archive when status is "Loss"
- [x] Add overdue highlighting (orange) for follow-up dates
- [x] Create summary section with overdue/upcoming alerts
- [x] Add overdue/upcoming items query (3-4 days ahead)
- [x] Add navigation menu item
- [x] Create tabbed interface for Government/Private separation

## Feature: Projects Financials UI Improvement
- [ ] Redesign financials popup to landscape layout
- [ ] Remove horizontal scrolling
- [ ] Make transaction types editable
- [ ] Enable adding new transaction types dynamically


## Feature: Editable Transaction Types
- [x] Create transaction_types table in database
- [x] Add default transaction types (Revenue, Purchase, Expense, COGS, WACC)
- [x] Add CRUD operations for transaction types
- [x] Update ProjectFinancials to load types dynamically
- [x] Add "Manage Types" button in financials dialog
- [x] Allow adding new transaction types on-the-fly
- [x] Improved financials popup to landscape layout (95% viewport width)
- [x] Removed horizontal scrolling with responsive table design

## Feature: Dashboard Widgets & Notifications
- [x] Add overdue tenders/quotations widget to dashboard
- [x] Add upcoming tenders/quotations widget (next 4 days)
- [x] Add open action items widget
- [x] Clickable cards linking to respective modules
- [x] Real-time count badges
- [x] Scrollable list with "View all" links

## Feature: Dynamic User Creation
- [x] Add user creation form in Users module
- [x] Backend API for user creation with validation
- [x] Add role assignment during user creation
- [x] Add email validation and duplicate checking
- [x] Prevent duplicate email addresses
- [x] Generate unique openId for manually created users
## Feature: HR Module Consolidation
- [x] Research HR best practices and KPI frameworks
- [x] Design comprehensive HR module structure
- [x] Database schema for HR module (departments, positions, employees, attendance_records, leave_balances, leave_applications, performance_reviews)
- [x] HR module backend functions (departments, positions, employees, attendance, leaves, performance)
- [x] HR module tRPC router procedures
- [x] HR Dashboard with key metrics and analytics
- [x] Employee directory with details
- [x] Pending leave requests display
- [x] Replace Team and Users with unified Human Resource menu
- [x] Tab-based interface (Overview, Employees, Attendance, Leaves, Performance)
- [ ] Complete attendance management UI
- [ ] Complete leave management UI with approval workflow
- [ ] Performance review and KPI tracking UI
- [ ] Employee profile detail pages
- [ ] Department and position management UIacking per employee
- [ ] Add payroll management integration
- [ ] Create HR analytics dashboard
- [ ] Add employee onboarding/offboarding workflows
- [ ] Update navigation to replace Users/Team with HR
