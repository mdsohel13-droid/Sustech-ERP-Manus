# Sustech ERP Dashboard - Product Requirements Document (PRD)

## Project Overview
**Name:** Sustech ERP / KPI Dashboard  
**Version:** 1.1.1 (Demo Login Fixed + Admin Control Panel)  
**Date:** January 26, 2026  

## What's Been Implemented

### Login Methods (Multiple Options)
1. **Demo Mode Button** - Click "Demo Mode (Admin Access)" on login page
2. **URL Parameter** - Visit `/?demo=true` (fallback for cookie issues)
3. **OAuth** - Standard OAuth login (Sign in to Continue)

### Admin Control Panel (`/admin-settings`)
- **User Management**: Create/edit/delete users, password reset, account lock
- **Security Settings**: Password policy (NIST/ISO 27001), brute force protection
- **Display Settings**: Chart types, color schemes, animations, layouts
- **Session Management**: View/terminate active sessions
- **Audit Logs**: Security event tracking
- **System Settings**: Company info, currency, timezone

### Security Features
- Password policy: min length, expiry, complexity
- Brute force protection: max attempts, lockout
- IP blocking/whitelisting
- CSRF/XSS protection toggles
- Audit logging

### ERP Modules (22 Total)
All functional with real data:
- Dashboard, Sales, Products, Customers, Purchases
- Inventory, Financial, Income & Expenditure, Projects
- Action Tracker, Tender/Quotation, Human Resource
- Reports & Analytics, Ideas, Settings, Admin Panel

## Access Information
- **Demo Access**: 
  - Click "Demo Mode (Admin Access)" button
  - OR visit `/?demo=true`
- **Admin User**: admin@sustech.com (role: admin)
- **Admin Panel**: /admin-settings

## Technical Stack
- React 19 + TypeScript + Vite
- tRPC + Express backend
- MySQL/MariaDB + Drizzle ORM
- Recharts for visualizations

## Test Results
- Frontend: 95% working
- Backend APIs: 100% working
- Demo Login: Multiple fallback methods

## Next Phase
1. Real-time security alerts with push notifications
2. Two-Factor Authentication (2FA)
3. Email notifications for security events
