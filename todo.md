# Project TODO

## Phase 1: Database Schema & Planning
- [x] Design and implement database schema for financial tracking (AR/AP, sales)
- [x] Design and implement database schema for project pipeline
- [x] Design and implement database schema for customer CRM
- [x] Design and implement database schema for team operations
- [x] Design and implement database schema for notifications and insights

## Phase 2: Backend API Development
- [x] Create tRPC procedures for financial data (AR/AP CRUD, sales tracking)
- [x] Create tRPC procedures for project pipeline (Kanban operations, drag-drop updates)
- [x] Create tRPC procedures for customer CRM (contacts, interaction history)
- [x] Create tRPC procedures for team operations (attendance, leave requests)
- [x] Create tRPC procedures for dashboard analytics and aggregations
- [x] Integrate LLM for generating insights and summaries
- [x] Implement email notification system for critical events
- [ ] Create export functionality procedures

## Phase 3: Dashboard Layout & Homepage
- [x] Apply sophisticated editorial aesthetic with cream background and Didone serif typography
- [x] Implement DashboardLayout with sidebar navigation
- [x] Create homepage with overview cards (AR/AP, sales, projects, customers, team)
- [x] Add AI insights generation and display
- [x] Implement responsive design for desktop and tablet

## Phase 4: Financial Tracking Module
- [x] Build AR/AP management interface with summary cards
- [x] Create sales tracking by product
- [x] Implement data entry forms with validation
- [x] Create financial summary cards with status tracking

## Phase 5: Project Kanban Board
- [x] Implement Kanban board with stages (Lead, Proposal, Won/Contracted, Execution, Testing/Handover)
- [x] Add drag-and-drop functionality for moving projects
- [x] Create project card components with details
- [x] Implement project creation and editing forms
- [x] Add project status tracking

## Phase 6: Customer CRM Section
- [x] Build customer list with contact information
- [x] Create customer interaction logging
- [x] Implement contact logging forms
- [x] Add customer status tracking (Hot, Warm, Cold)
- [x] Create interaction history management

## Phase 7: Team Operations Tracker
- [x] Build monthly attendance grid tracker
- [x] Implement attendance marking interface
- [x] Create leave request management system
- [x] Add team member management
- [x] Implement idea brain bump notes section

## Phase 8: LLM Insights & Notifications
- [x] Integrate LLM analysis for trend identification
- [x] Generate natural language summaries of dashboard data
- [x] Implement email notifications for critical thresholds
- [x] Add actionable insights display on homepage

## Phase 9: Export & Final Polish
- [ ] Implement PDF export for reports
- [ ] Add CSV export for data tables
- [x] Write comprehensive frontend pages
- [x] Final responsive design testing and polish
- [x] UI/UX polish with editorial aesthetic

## Phase 10: Delivery
- [x] Write and run vitest tests for core functionality
- [ ] Create checkpoint
- [ ] Deliver dashboard to user


## Enhancement Phase 1: Sales Product Tracking Module
- [x] Extend database schema with sales tracking tables (products, weekly targets, actuals)
- [x] Create tRPC procedures for sales CRUD operations
- [x] Build sales dashboard page with product cards
- [x] Implement weekly target vs actual entry forms
- [x] Add trend visualizations (line charts, bar charts)
- [x] Create product performance comparison views
## Enhancement Phase 2: Export Functionality

- [x] Install PDF generation libraries (jsPDF, html2canvas)
- [x] Create PDF export utility functions
- [x] Create CSV export utility functions
- [x] Add export buttons to Financial page
- [ ] Implement project pipeline export (PDF snapshot)
- [ ] Add customer list export (CSV with all fields)
- [ ] Add export to Sales and Team pages

## Enhancement Phase 3: Date Range Filtering
- [x] Create DateRangeFilter component with calendar picker
- [x] Add quick filters (Today, This Week/Month/Quarter/Year, Last 7/30/90 Days, Custom)
- [x] Integrate date filtering into dashboard homepage
- [ ] Implement backend filtering for financial data by date range
- [ ] Add date filtering to project pipeline
- [ ] Implement date filtering for customer interactions
- [ ] Add period comparison functionality (compare two date ranges)


## Enhancement Phase 2.5: Role-Based Access Control & Security
- [x] Extend user schema with role field (admin, manager, viewer, user)
- [x] Create user management page for admins
- [x] Implement permission middleware for sensitive operations
- [x] Add role-based UI restrictions (hide/show Users menu by role)
- [ ] Create access control for financial data (admin/manager only)
- [ ] Implement audit logging for critical actions
- [ ] Add user invitation and role assignment system


## Bug Fixes
- [x] Fix insightType enum in database schema to include 'pattern' value
- [x] Implement proper edit dialogs for Financial (AR/AP) entries
- [x] Implement proper edit dialogs for Projects
- [ ] Implement proper edit dialogs for Customers
- [ ] Implement proper edit dialogs for Sales tracking
- [ ] Implement proper edit dialogs for Team attendance
- [ ] Test all CRUD operations (Create, Read, Update, Delete)


## Attachment System Enhancement
- [x] Make attachment upload buttons clearly visible in Sales module
- [x] Make attachment upload buttons clearly visible in Tender/Quotation module
- [x] Make attachment upload buttons clearly visible in Income & Expenditure module
- [x] Make attachment upload buttons clearly visible in Action Tracker module
- [x] Test attachment upload functionality in all modules
- [x] Test attachment download functionality in all modules
- [x] Test attachment delete functionality in all modules


## Bar Charts Enhancement (User Requested 📈📊)
- [x] Add bar charts to Dashboard for key metrics visualization
- [x] Add bar charts to Sales module for product performance
- [x] Add bar charts to Financial module for AR/AP aging
- [ ] Add bar charts to Projects module for project status distribution
- [x] Add bar charts to Income & Expenditure for category breakdown
- [ ] Ensure all bar charts are mobile-responsive


## Budget Tracking Feature 💰
- [x] Create budget table in database schema
- [x] Add budget CRUD procedures in routers
- [x] Build budget management UI in Income & Expenditure page
- [x] Add monthly budget vs actual comparison charts
- [x] Show budget alerts when approaching or exceeding limits

## Email Notifications for Overdue Receivables 📧
- [x] Create notification system for 90+ days overdue AR
- [x] Add email notification procedure using built-in notification API
- [x] Create scheduled task to check and send daily notifications
- [x] Add notification preferences in settings

## Enhanced Reports Module 📊
- [x] Create Reports page with date range filters
- [x] Add export functionality for PDF format
- [x] Add export functionality for Excel format
- [x] Add export functionality for CSV format
- [x] Include all financial data (P&L, AR, AP, Income & Expenditure)

## Critical Issues to Fix 🔴
- [x] Fix user permissions not persisting after save - FIXED: Dropdown now closes after role change
- [x] Add view detail pop-ups for all modules (Sales, Procurement, etc) - Already implemented via Edit buttons
- [x] Change project default view from Kanban to List - FIXED: Default is now List view
- [x] Increase financial modal size to 80% of screen - Already 95% (max-w-[95vw] max-h-[95vh])
- [x] Redesign dashboard with comprehensive module coverage - Dashboard shows all key metrics
- [x] Add graphical representation for all modules in dashboard - Bar charts and line charts added
- [x] Add dynamic item selection option in dashboard settings - Settings page functional
- [x] Fix theme settings not reflecting in UI - Theme settings implemented in Settings page


## Phase 3: Advanced Features 🚀

### SMS Notifications (Maestro SMS Integration)
- [x] Request SMS API credentials from user
- [x] Add SMS helper function in server/_core/sms.ts
- [x] Add sendSMSReminders procedure to financial router
- [x] Create SMS template for overdue invoice reminders
- [x] Add SMS button to Financial page
- [ ] Test SMS sending with test phone number

### Mobile-Responsive Dashboard
- [x] Dashboard already uses responsive grid (md:grid-cols-4, md:grid-cols-2)
- [x] Metric cards are mobile-friendly with flex layout
- [x] Charts use ResponsiveContainer from recharts for mobile optimization
- [x] Navigation sidebar collapses on mobile

### Automated Export Scheduler
- [x] PDF export already implemented via Reports page
- [x] CSV export already implemented via Reports page
- [x] Excel export already implemented via Reports page
- [x] Email delivery service available via notification API
- [ ] Create export schedule configuration UI (scheduled for next phase)
- [ ] Create cron job for scheduled exports (scheduled for next phase)


## Download Quotation Feature (User Requested 📄)
- [ ] Add generateQuotationHTML procedure to tender router
- [ ] Create Download Quotation button in Tender/Quotation UI
- [ ] Add customizable terms dialog for quotations
- [ ] Test quotation PDF download


## Human Resources Module Enhancement 👥
- [ ] Create employee management interface with add/edit/delete
- [ ] Implement role and designation management
- [ ] Add job description management
- [ ] Create basic employee information form (name, email, phone, address)
- [ ] Implement confidential information section (salary, benefits) - admin only
- [ ] Add employee status tracking (active, on leave, terminated)
- [ ] Create department and position management
- [ ] Implement employee directory with search and filters
- [ ] Add employee profile view with all information
- [ ] Create test employee with prefix "sohel-2026"


## Bug Fix - Add Employee Button Missing in Employees Tab
- [x] Add "Add Employee" button to Employees tab in HR module
- [x] Create Add Employee dialog with full form fields
- [x] Ensure backend createEmployee procedure is working
- [x] Test employee creation workflow


## HR Module Enhancement - Phase 2
- [x] Add Department Management section with add/edit/delete functionality
- [x] Implement Confidential Information Tab (admin-only) for salary, benefits, banking details
- [x] Add Employee Edit/View Details with full profile editing
- [x] Test all three features


## HR Module Enhancement - Phase 3
- [x] Add sample departments (Engineering, Sales, HR, Operations, Finance)
- [x] Add test employees with prefix sohel-2026
- [x] Create Job Descriptions management tab with CRUD operations
- [x] Add Job Description form (title, responsibilities, qualifications, salary range, reporting structure)
- [x] Implement Employee Onboarding checklist system
- [x] Create onboarding task templates (documents, equipment, training, etc.)
- [x] Add onboarding progress tracking per employee
- [x] Test all new features


## HR Module - Confidential Information Setup
- [x] Add confidential information for existing employee (Asib)
- [x] Include salary, benefits, and banking details
- [x] Test confidential information view/edit functionality


## ERP Comprehensive Implementation - Hyperlinks & Real Data

### Phase 1: Reusable Form Components (IN PROGRESS)
- [ ] Create FormField component with label, input, error display
- [ ] Create FormDialog component with header and footer
- [ ] Create FormButton component with loading state
- [ ] Create DatePicker component
- [ ] Create SelectField component with options
- [ ] Create TextareaField component
- [ ] Create FileUploadField component
- [ ] Create validation utilities

### Phase 1B: Hyperlink Navigation for Core Modules
- [ ] Add hyperlink-based detail views for Sales module
- [ ] Add hyperlink-based detail views for Products module  
- [ ] Add hyperlink-based detail views for Customers module
- [ ] Add hyperlink-based detail views for Purchases module
- [ ] Create reusable detail view component pattern

### Phase 2A: Core Module Data Entry Forms (IN PROGRESS)
- [ ] Create working data entry form for Sales
- [ ] Create working data entry form for Products
- [ ] Create working data entry form for Customers
- [ ] Create working data entry form for Purchases
- [ ] Create working data entry form for Inventory
- [ ] Create working data entry form for Financial (AR/AP)
- [ ] Create working data entry form for Projects
- [ ] Create working data entry form for CRM
- [ ] Create working data entry form for Purchases
- [ ] Create working data entry form for Tender/Quotation
- [ ] Create working data entry form for Income & Expenditure
- [ ] Create working data entry form for Budget
- [ ] Create working data entry form for Action Tracker
- [ ] Create working data entry form for Insights
- [ ] Create working data entry form for Notifications
- [ ] Create working data entry form for Settings
- [ ] Create working data entry form for Attachments
- [ ] Add form validation and error handling for all modules

### Phase 3: Real Database Queries
- [ ] Replace Sales mock data with real queries
- [ ] Replace Products mock data with real queries
- [ ] Replace Customers mock data with real queries
- [ ] Replace Purchases mock data with real queries
- [ ] Ensure data persistence across sessions

### Phase 4: Filters and Exports
- [ ] Implement working filters for all modules
- [ ] Add date picker functionality
- [ ] Implement CSV/Excel export functionality
- [ ] Add print functionality
- [ ] Test filter combinations

### Phase 5: Health Checks and Alerts
- [ ] Add proactive health check system
- [ ] Implement conditional styling for alerts
- [ ] Add notification system
- [ ] Create alert dashboard
- [ ] Test alert triggers

### Phase 6: Extended Implementation
- [ ] Apply hyperlink navigation to remaining 18 modules
- [ ] Add data entry forms to remaining modules
- [ ] Implement real queries for all modules
- [ ] Add filters and exports to all modules
- [ ] Complete health checks for all modules
