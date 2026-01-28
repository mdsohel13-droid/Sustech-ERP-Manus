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

## Recent Changes (Jan 28, 2026)
- Converted database from MySQL to PostgreSQL
- Updated Drizzle ORM driver from mysql2 to pg
- Ran migrations creating 58 database tables
- Refactored AnalyticsDashboard to use real database queries via tRPC
- Added KPI endpoints: dashboard.getKPIs, dashboard.getRevenueTrends, dashboard.getTopProducts, dashboard.getDepartmentDistribution

## Database
- 58 tables including: accounts_payable, accounts_receivable, customers, daily_sales, employees, projects, quotation_items, etc.
- Schema defined in `drizzle/schema.ts`
- Use `npm run db:push` to sync schema changes

## Key Commands
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database

## Authentication
- OAuth via oauth.emergentagent.com
- Email/password login also supported
- Sessions stored in database

## Environment Variables
Required:
- DATABASE_URL - PostgreSQL connection string (auto-provided by Replit)

Optional:
- VITE_ANALYTICS_ENDPOINT - Analytics endpoint URL
- VITE_ANALYTICS_WEBSITE_ID - Analytics website ID
- SMTP credentials for email notifications
- AWS S3 credentials for file storage
- OPENAI_API_KEY for AI features
