# Sustech ERP System

## Overview
The Sustech ERP System is a comprehensive Enterprise Resource Planning solution designed to integrate and manage various business operations. Its core purpose is to provide a unified platform for financial tracking, sales, project management, CRM, human resources, and commission tracking. The project aims to deliver a modern, efficient, and scalable ERP system to enhance operational efficiency and provide actionable business insights.

## User Preferences
I prefer simple language. I like functional programming. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture
The system employs a modern web stack. The frontend is built with React, TypeScript, and Vite, using Tailwind CSS and shadcn/ui for styling, and Recharts for data visualization. The backend utilizes Express.js with tRPC for type-safe API interactions. PostgreSQL serves as the primary database, managed by Drizzle ORM.

Key architectural decisions and features include:
- **Modular Design**: Organized into distinct modules (Finance, Accounting, Procurement, CRM, Sales, Inventory, Products, Tenders/Quotations), each with dedicated functionalities.
- **Modern UI/UX**: Dashboards feature colorful gradient KPI cards, various chart types, and responsive layouts for intuitive data representation.
- **Real-time Data Integration**: Modules display real-time data from PostgreSQL via tRPC queries.
- **Comprehensive CRUD Operations**: Full Create, Read, Update, and Delete capabilities for critical entities across all modules.
- **Automated Workflows**: Streamlined operations through features like auto-generated numbers and automated project creation.
- **Integrated Inventory Management**: Products module is tightly integrated with inventory for real-time stock levels and transaction history.
- **Role-Based Access Control (RBAC)**: Authentication and authorization are implemented using OAuth and email/password, with granular access control procedures (`adminProcedure`, `managerProcedure`, `protectedProcedure`).
- **Robust Data Integrity**: Enforced through PostgreSQL `CHECK` constraints and Zod API validation for all mutations.
- **Audit Logging**: All financial mutations are automatically logged with user, action, entity changes, timestamp, and origin.
- **Transaction Safety**: Financial operations use PostgreSQL transactions to ensure atomicity.

**Module-Specific Features:**
- **Finance Module**: Comprehensive financial management with dedicated tables for accounts, journal entries, receivables, payables, income/expenditure, and daily sales. Features include KPI dashboards, balance sheets, cash flow analysis, aging reports, and forecasting.
- **Accounting Module**: Offers detailed financial tracking with KPI cards, chart of accounts overview, income/expense trends, journal entries, transaction lists, and archive functionality. Supports full CRUD for Chart of Accounts.
- **Projects Module**: Provides pipeline management with stage-based KPI cards, pipeline value display, profit margin indicators, and both list and Kanban views. Integrates with the Tender/Quotation module for automatic project creation.
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

**SCM Database Tables:**
- `scm_product_extensions`: Valuation method, item type, EOQ parameters
- `scm_inventory_ledger`: Perpetual inventory moves with valuation
- `sales_orders` / `sales_order_items`: ATP-ready sales orders
- `purchase_receipts` / `purchase_receipt_items`: GRN for receiving
- `vendor_bills` / `vendor_bill_items`: Invoice 3-way matching
- `stock_reservations`: ATP stock reservations
- `replenishment_requests`: Auto-generated EOQ replenishment
- `project_wbs`: Work Breakdown Structure hierarchy
- `project_material_consumption`: Project cost tracking

**SCM API Endpoints (server/routers.ts → scm namespace):**
- `scm.calculateATP`, `scm.getCurrentStock`, `scm.reserveStock`
- `scm.checkReplenishment`, `scm.checkAllReplenishments`, `scm.createReplenishmentRequest`
- `scm.approveReplenishmentRequest`, `scm.convertToPurchaseOrder`
- `scm.createWbs`, `scm.getWbsTree`, `scm.getProjectCostSummary`
- `scm.consumeMaterialForProject`, `scm.getProjectMaterialHistory`

## External Dependencies
- **OAuth Provider**: `oauth.emergentagent.com` for authentication.
- **PostgreSQL**: Primary database.
- **SMTP**: For email notifications.
- **AWS S3**: For file storage.
- **OpenAI API**: For AI features.
- **VITE_ANALYTICS_ENDPOINT**: External analytics service.