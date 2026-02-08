# Sustech ERP System

## Overview
The Sustech ERP System is a comprehensive Enterprise Resource Planning solution designed to integrate and manage various business operations. Its core purpose is to provide a unified platform for financial tracking, sales, project management, CRM, human resources, and commission tracking. The project aims to deliver a modern, efficient, and scalable ERP system to enhance operational efficiency and provide actionable business insights.

## User Preferences
I prefer simple language. I like functional programming. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture
The system employs a modern web stack. The frontend is built with React, TypeScript, and Vite, using Tailwind CSS and shadcn/ui for styling, and Recharts for data visualization. The backend utilizes Express.js with tRPC for type-safe API interactions. PostgreSQL serves as the primary database, managed by Drizzle ORM.

Key architectural decisions and features include:
- **Modular Design**: Organized into distinct modules (Finance, Accounting, Procurement, CRM, Sales, Inventory, Products, Tenders/Quotations), each with dedicated functionalities.
- **Modern UI/UX**: Dashboards feature smart chart-based KPI visualizations (mini donuts, bar charts, sparklines, gauges) replacing static gradient cards. Each module uses a unique chart type and color palette for visual differentiation. All data is real-time from PostgreSQL with no hardcoded values.
- **Real-time Data Integration**: Modules display real-time data from PostgreSQL via tRPC queries.
- **Comprehensive CRUD Operations**: Full Create, Read, Update, and Delete capabilities for critical entities across all modules.
- **Automated Workflows**: Streamlined operations through features like auto-generated numbers and automated project creation.
- **Integrated Inventory Management**: Products module is tightly integrated with inventory for real-time stock levels and transaction history.
- **Role-Based Access Control (RBAC)**: Authentication and authorization are implemented using OAuth and email/password, with granular access control procedures (`adminProcedure`, `managerProcedure`, `protectedProcedure`).
- **Robust Data Integrity**: Enforced through PostgreSQL `CHECK` constraints and Zod API validation for all mutations.
- **Comprehensive Audit Logging**: All delete operations across modules (AR, AP, Projects, Customers, Transactions) are logged with user ID, timestamp, entity type, old values, and operation status.
- **Transaction Safety**: Financial operations use PostgreSQL transactions to ensure atomicity.
- **Soft Delete Pattern**: Projects, Customers, and Vendors use `is_archived` flag instead of hard delete to preserve data integrity.
- **Shared Database Architecture**: Development and production environments share the same PostgreSQL database for data consistency. All changes made in either environment are immediately visible in both.
- **Protected Operations Layer**: Centralized `protectedDelete`, `protectedSoftDelete`, and `protectedUpdate` functions in `db-utils.ts` that:
  - Automatically capture pre-operation data for recovery
  - Create comprehensive audit logs before any data modification
  - Provide consistent error handling and logging across all modules
- **Comprehensive Database Operations (db.ts)**: All 40+ database functions include audit logging for tracking all operations. Protected functions include:
  - Finance: deleteAR, deleteAP, deleteSale, deleteIncomeExpenditure, deleteBudget
  - Projects: deleteProject, deleteProjectTransaction
  - CRM: deleteCustomer, archiveCustomer, restoreCustomer
  - Sales: deleteSalesProduct, deleteSalesTracking, deleteWeeklyTarget, deleteMonthlyTarget
  - HRM: deleteUser, deleteDepartment, deletePosition, deleteJobDescription, deleteEmployeeRole, deleteEmployeeConfidential, deleteOnboardingTemplate, deleteOnboardingTask
  - Inventory: deleteProductCategory, deleteProductUnit, deleteProductBrand, deleteProductWarranty, deleteSellingPriceGroup, deleteProductVariation, deleteWarehouse
  - Procurement: deletePurchaseOrderItem
  - Tender/Quotation: deleteTenderQuotation, deleteQuotationItem, deleteTransactionType
  - Other: deleteIdeaNote, deleteAttachmentRecord, deleteUserPermissions, deleteAIConversation, deleteAIIntegrationSetting, deleteFeedPost, deleteFeedComment, deleteActionTracker

**Module-Specific Features:**
- **Finance Module**: Comprehensive financial management with modular component architecture (client/src/pages/finance/). Features include:
  - **Overview Dashboard**: KPI cards (Total Income, Expenses, Net Profit, Cash, AR, AP), central Net Profit Margin donut gauge, Quick/Current Ratio cards, Income & Expenses bar chart, budget tracking donuts
  - **Core Tabs**: Balance Sheet, Cash Flow, AR-AP (with aging analysis, approval workflow, payment recording), Forecasting (6-month projections), Budget vs Actual (variance analysis with visual charts)
  - **Advanced Tabs**: Multi-Currency (11 currencies with converter and trend charts), Bangladesh Tax Compliance (VAT 15%, TDS rates, NBR compliance checklist), IFRS Reporting (14 standards compliance tracker), AI Anomaly Detection (risk scoring, fraud alerts)
  - **Sidebar Navigation**: Split into Core and Advanced sections with period selector (MTD/YTD)
  - Enhanced with AR/AP approval workflow (manager-only approve/reject with rejection reasons), payment recording with partial payment support and auto-status updates (pending→partial→paid)
- **Accounting Module**: Offers detailed financial tracking with KPI cards, chart of accounts overview, income/expense trends, journal entries, transaction lists, and archive functionality. Supports full CRUD for Chart of Accounts. Enhanced with multi-line double-entry journal entries (dynamic debit/credit rows with balance validation), posting workflow that updates account balances based on account type (asset/expense = debit normal), and expandable journal entry list showing line item details.
- **Projects Module**: Features a Power BI-style Portfolio Dashboard (default tab) with:
  - **Filter Bar**: Portfolio, Program, Manager, Status, Type, Priority, Health filters with clear-all
  - **4 KPI Cards**: Total Projects, Total Tasks, Issues, Late Tasks (gradient colored)
  - **6 Donut Charts**: By Program, Project Manager, Project Status, Health, Project Type, Priority
  - **Data Table**: Sortable columns, search, progress bars, status/health/priority badges
  - **Schema Extensions**: portfolio, program, projectTemplate, projectStatus (5 states), activeStage (5 phases), health (green/yellow/red), projectType (strategic/improvement/operational), durationDays, progressPercentage, totalTasks, lateTasks, issuesCount, projectManager
  - Also retains original pipeline management with stage-based KPI cards, Kanban and List views. Integrates with Tender/Quotation module for automatic project creation.
- **HRM Module**: Manages employees, attendance, leave, and access control. Includes KPI cards for users, admins, pending leaves, and departments. Features tabs for Users & Access, Employees, Departments, Attendance, Leaves, Performance, Job Descriptions, Onboarding, and Commission/Confidential (admin).
- **Master Dashboard**: Provides a comprehensive overview with module KPI cards, quick actions, running projects, follow-ups, a news & events feed (with social features), a live employee tracker, and an AI Assistant widget.
- **AI Settings**: Admin-only configuration for AI providers (OpenAI, Anthropic, Google AI, Azure OpenAI, Custom), API key management, model selection, webhook integrations, and advanced settings.
- **SCM Module (Supply Chain Management)**: Comprehensive supply chain functionality including:
  - **ATP (Available-to-Promise)**: Real-time stock availability calculation considering current stock, reservations, and incoming POs
  - **Stock Reservations**: Reserve inventory for sales orders without immediate deduction
  - **EOQ Auto-Replenishment**: Economic Order Quantity calculations using formula: sqrt((2 * demand * order_cost) / holding_cost)
  - **Purchase Receipts (GRN)**: Goods Received Notes linked to POs for 3-way matching
  - **Vendor Bills**: Invoice matching against POs and GRNs
  - **Project Costing with WBS**: Work Breakdown Structure for project cost allocation and material consumption tracking
  - **Perpetual Inventory Ledger**: Every stock move recorded as ledger entry for accurate valuation

**SCM Database Tables (Original):**
- `scm_product_extensions`: Valuation method, item type, EOQ parameters
- `scm_inventory_ledger`: Perpetual inventory moves with valuation
- `sales_orders` / `sales_order_items`: ATP-ready sales orders
- `purchase_receipts` / `purchase_receipt_items`: GRN for receiving
- `vendor_bills` / `vendor_bill_items`: Invoice 3-way matching
- `stock_reservations`: ATP stock reservations
- `replenishment_requests`: Auto-generated EOQ replenishment
- `project_wbs`: Work Breakdown Structure hierarchy
- `project_material_consumption`: Project cost tracking

**SCM Phase 1 Upgrade Tables (NEW):**
- `rfqs`: RFQ management with auto-numbering (RFQ-YYYY-####), type (standard/emergency/framework), status lifecycle (draft→sent→evaluation→awarded→closed)
- `rfq_lines`: Line items per RFQ with product, quantity, unit of measure, estimated price
- `rfq_responses`: Vendor responses with quoted value, delivery days, payment terms, evaluation scoring
- `vendor_bids`: Line-level vendor pricing for RFQ responses with quality guarantee
- `shipments`: Shipment tracking with auto-numbering (IN/OUT/TRF-YYYY-####), type (inbound/outbound/transfer), full logistics details
- `shipment_lines`: Line items per shipment with product, quantity, weight
- `shipment_tracking`: Event-based tracking with location, timestamp, description
- `supplier_risk_scores`: Rule-based vendor risk scoring with weighted formula (on-time 35%, quality 25%, price 15%, responsiveness 15%, compliance 10%)
- `inventory_lots`: Lot/batch tracking with serial numbers, manufacture/expiry dates, quality status, warehouse location
- `scm_audit_trail`: SHA-256 hash-chained immutable audit records (blockchain equivalent) for tamper-evident supply chain tracking

**SCM Phase 1 Database Functions (server/scm-db.ts):**
- RFQ: createRFQ, getAllRFQs, getRFQById, updateRFQStatus, addRFQLine, getRFQLines, addRFQResponse, getRFQResponses, evaluateRFQResponses (weighted scoring), acceptRFQResponse (auto-converts to PO), addVendorBid, getVendorBids
- Shipments: createShipment, getAllShipments, getShipmentById, updateShipmentStatus, addShipmentLine, getShipmentLines, addTrackingEvent, getTrackingEvents
- Supplier Risk: calculateSupplierRiskScore, getSupplierRiskHistory, getLatestRiskScoresForAllVendors
- Inventory Lots: createInventoryLot, getInventoryLots
- Audit Trail: addScmAuditEntry (with SHA-256 hash chaining), getScmAuditTrail, verifyAuditChain
- Dashboard: getScmDashboardKPIs

**SCM API Endpoints (server/routers.ts → scm namespace):**
- Original: `scm.calculateATP`, `scm.getCurrentStock`, `scm.reserveStock`, `scm.checkReplenishment`, `scm.checkAllReplenishments`, `scm.createReplenishmentRequest`, `scm.approveReplenishmentRequest`, `scm.convertToPurchaseOrder`, `scm.createWbs`, `scm.getWbsTree`, `scm.getProjectCostSummary`, `scm.consumeMaterialForProject`, `scm.getProjectMaterialHistory`
- Phase 1 RFQ: `scm.createRFQ`, `scm.getAllRFQs`, `scm.getRFQById`, `scm.updateRFQStatus`, `scm.addRFQLine`, `scm.getRFQLines`, `scm.addRFQResponse`, `scm.getRFQResponses`, `scm.evaluateRFQResponses`, `scm.acceptRFQResponse`, `scm.addVendorBid`, `scm.getVendorBids`
- Phase 1 Shipments: `scm.createShipment`, `scm.getAllShipments`, `scm.getShipmentById`, `scm.updateShipmentStatus`, `scm.addShipmentLine`, `scm.getShipmentLines`, `scm.addTrackingEvent`, `scm.getTrackingEvents`
- Phase 1 Supplier Risk: `scm.calculateSupplierRiskScore`, `scm.getSupplierRiskHistory`, `scm.getAllVendorRiskScores`
- Phase 1 Inventory/Audit: `scm.createInventoryLot`, `scm.getInventoryLots`, `scm.getScmAuditTrail`, `scm.verifyAuditChain`, `scm.getScmDashboardKPIs`

**SCM Phase 1 UI Components (client/src/pages/scm/):**
- `RFQTab.tsx`: Full RFQ lifecycle management with create/list/detail views, line items, vendor responses, weighted evaluation, accept-to-PO conversion
- `ShipmentsTab.tsx`: Shipment tracking with create/list/detail, status progression, tracking event timeline
- `SupplierRiskTab.tsx`: Vendor risk dashboard with scoring, recalculation, formula display
- `AuditTrailTab.tsx`: Hash-chain audit trail viewer with chain integrity verification

## External Dependencies
- **OAuth Provider**: `oauth.emergentagent.com` for authentication.
- **PostgreSQL**: Primary database.
- **SMTP**: For email notifications.
- **AWS S3**: For file storage.
- **OpenAI API**: For AI features.
- **VITE_ANALYTICS_ENDPOINT**: External analytics service.