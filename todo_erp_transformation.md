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
- [ ] Create Income & Expenditure module
- [ ] Track sales income (products & services)
- [ ] Track all expense types
- [ ] Create income vs expenditure reports
- [ ] Add monthly/yearly financial summaries

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
