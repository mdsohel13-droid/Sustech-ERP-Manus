# Sustech ERP System

## Overview
The Sustech ERP System, imported from Manus AI, is a comprehensive Enterprise Resource Planning solution designed to manage various business operations. Its primary purpose is to provide an integrated platform for financial tracking, sales management, project pipeline oversight, customer relationship management (CRM), human resources (HR) administration, and commission tracking. The project aims to offer a modern, efficient, and scalable ERP solution, enhancing operational efficiency and providing actionable insights for business growth.

## User Preferences
I prefer simple language. I like functional programming. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture
The system is built with a modern web stack. The frontend utilizes **React, TypeScript, and Vite** for a responsive user interface, styled with **Tailwind CSS and shadcn/ui components**. Data visualization is handled by **Recharts**. The backend is powered by **Express.js with tRPC** for type-safe API interactions. **PostgreSQL** serves as the primary database, managed through **Drizzle ORM**.

Key architectural decisions and features include:
- **Modular Design**: The system is organized into distinct modules (Finance, Procurement, CRM, Sales, Inventory, Products, Tenders/Quotations) each with its own dashboard and functionalities.
- **Modern UI/UX**: Dashboards feature colorful gradient KPI cards, dual-axis charts, funnel charts, and responsive layouts for intuitive data representation.
- **Real-time Data Integration**: All modules are designed to pull and display real-time data from the PostgreSQL database via tRPC queries.
- **Comprehensive CRUD Operations**: Full Create, Read, Update, and Delete functionalities are available for critical entities across modules (e.g., vendors, leads, products, warehouses, tenders).
- **Automated Workflows**: Features like auto-generated purchase order numbers, automatic project creation from won tenders, and archive/restore functionalities streamline operations.
- **Integrated Inventory Management**: The Products module is tightly integrated with inventory, providing real-time stock levels, transaction history, and warehouse management.
- **Role-Based Access Control (RBAC)**: Authentication and authorization are implemented using OAuth and email/password, with `adminProcedure`, `managerProcedure`, and `protectedProcedure` for granular access control.
- **Robust Data Integrity**: Database-level `CHECK` constraints prevent invalid data, particularly negative financial values, complemented by **Zod API validation** for all mutations.
- **Audit Logging**: All financial mutations are automatically logged, recording user, action, entity changes, timestamp, and origin.
- **Transaction Safety**: Financial operations utilize PostgreSQL transactions to ensure atomicity (all-or-nothing changes).

## Finance Module Architecture
The Finance module is a comprehensive financial management system with full database integration:

**Database Tables:**
- `financial_accounts` - Chart of accounts for balance sheet tracking (assets, liabilities, equity)
- `journal_entries` - Double-entry accounting journal for transactions
- `accounts_receivable` - Customer receivables with aging tracking
- `accounts_payable` - Vendor payables with aging tracking
- `income_expenditure` - Revenue and expense tracking
- `daily_sales` - Sales transactions integration

**Features:**
- **Overview Tab**: KPI dashboard with revenue, COGS, gross profit, net profit metrics
- **Balance Sheet Tab**: Real-time assets, liabilities, equity display from financial_accounts
- **Cash Flow Tab**: 6-month trend analysis with inflow/outflow tracking
- **Aging Report Tab**: AR/AP aging buckets (Current, 1-30, 31-60, 61-90, 90+ days) with data entry
- **Forecasting Tab**: Revenue projections using weighted moving average methodology

**Integration Points:**
- Pulls sales data from `daily_sales` and `income_expenditure` tables
- Syncs with AR/AP modules for aging calculations
- Integrates with Inventory module for stock value calculations
- Connects to Products module for COGS calculations

## External Dependencies
- **OAuth Provider**: `oauth.emergentagent.com` for authentication.
- **PostgreSQL**: Primary database for all application data.
- **SMTP**: For email notifications (optional).
- **AWS S3**: For file storage (optional).
- **OpenAI API**: For AI features and smart insights (optional).
- **VITE_ANALYTICS_ENDPOINT**: External analytics service integration (optional).