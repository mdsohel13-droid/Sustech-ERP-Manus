import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "manager", "viewer", "user"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Financial tracking: Accounts Receivable
 */
export const accountsReceivable = mysqlTable("accounts_receivable", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  dueDate: date("dueDate").notNull(),
  status: mysqlEnum("status", ["pending", "overdue", "paid"]).default("pending").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountsReceivable = typeof accountsReceivable.$inferSelect;
export type InsertAccountsReceivable = typeof accountsReceivable.$inferInsert;

/**
 * Financial tracking: Accounts Payable
 */
export const accountsPayable = mysqlTable("accounts_payable", {
  id: int("id").autoincrement().primaryKey(),
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  dueDate: date("dueDate").notNull(),
  status: mysqlEnum("status", ["pending", "overdue", "paid"]).default("pending").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountsPayable = typeof accountsPayable.$inferSelect;
export type InsertAccountsPayable = typeof accountsPayable.$inferInsert;

/**
 * Sales tracking by product/service
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  productType: mysqlEnum("productType", ["fan", "ess", "solar_pv", "projects", "testing", "installation"]).notNull(),
  weekNumber: int("weekNumber").notNull(), // 1-4 for weeks in month
  monthYear: varchar("monthYear", { length: 7 }).notNull(), // Format: YYYY-MM
  target: decimal("target", { precision: 15, scale: 2 }),
  actual: decimal("actual", { precision: 15, scale: 2 }),
  unit: varchar("unit", { length: 50 }), // Units, kW, #, etc.
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sales = typeof sales.$inferSelect;
export type InsertSales = typeof sales.$inferInsert;

/**
 * Project pipeline tracking
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", ["lead", "proposal", "won", "execution", "testing"]).default("lead").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  description: text("description"),
  startDate: date("startDate"),
  expectedCloseDate: date("expectedCloseDate"),
  actualCloseDate: date("actualCloseDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Customer CRM
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["hot", "warm", "cold"]).default("warm").notNull(),
  lastContactDate: date("lastContactDate"),
  nextActionRequired: text("nextActionRequired"),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Customer interaction history
 */
export const customerInteractions = mysqlTable("customer_interactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  interactionType: mysqlEnum("interactionType", ["call", "email", "meeting", "note"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  notes: text("notes"),
  interactionDate: date("interactionDate").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type InsertCustomerInteraction = typeof customerInteractions.$inferInsert;

// Team members table moved to comprehensive ERP schema below

/**
 * Team attendance tracking
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  teamMemberId: int("teamMemberId").notNull(),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "leave", "holiday"]).default("present").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Leave requests
 */
export const leaveRequests = mysqlTable("leave_requests", {
  id: int("id").autoincrement().primaryKey(),
  teamMemberId: int("teamMemberId").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  leaveType: mysqlEnum("leaveType", ["sick", "vacation", "personal", "other"]).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

/**
 * Idea brain bump notes
 */
export const ideaNotes = mysqlTable("idea_notes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IdeaNote = typeof ideaNotes.$inferSelect;
export type InsertIdeaNote = typeof ideaNotes.$inferInsert;

/**
 * Sales products table - tracks key products/services offered
 */
export const salesProducts = mysqlTable("sales_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["fan", "ess", "solar_pv", "epc_project", "testing", "installation", "other"]).notNull(),
  unit: varchar("unit", { length: 50 }).notNull().default("units"),
  description: text("description"),
  isActive: int("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SalesProduct = typeof salesProducts.$inferSelect;
export type InsertSalesProduct = typeof salesProducts.$inferInsert;

/**
 * Sales tracking table - weekly targets and actuals for each product
 */
export const salesTracking = mysqlTable("sales_tracking", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  weekEndDate: timestamp("week_end_date").notNull(),
  target: decimal("target", { precision: 15, scale: 2 }).notNull(),
  actual: decimal("actual", { precision: 15, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SalesTracking = typeof salesTracking.$inferSelect;
export type InsertSalesTracking = typeof salesTracking.$inferInsert;

/**
 * Dashboard insights generated by LLM
 */
export const dashboardInsights = mysqlTable("dashboard_insights", {
  id: int("id").autoincrement().primaryKey(),
  insightType: mysqlEnum("insightType", ["financial", "project", "customer", "team", "general", "pattern", "trend", "alert"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  recommendations: text("recommendations"),
  dataSnapshot: text("dataSnapshot"), // JSON snapshot of data used
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type DashboardInsight = typeof dashboardInsights.$inferSelect;
export type InsertDashboardInsight = typeof dashboardInsights.$inferInsert;

/**
 * Notification log
 */
export const notificationLog = mysqlTable("notification_log", {
  id: int("id").autoincrement().primaryKey(),
  notificationType: mysqlEnum("notificationType", ["ar_overdue", "project_status", "attendance_anomaly", "threshold_breach"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sentTo: varchar("sentTo", { length: 320 }).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed"]).default("sent").notNull(),
});

export type NotificationLog = typeof notificationLog.$inferSelect;
export type InsertNotificationLog = typeof notificationLog.$inferInsert;

/**
 * System Settings - Admin control panel
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).default("string").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // general, currency, theme, archive, etc.
  description: text("description"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Daily Sales Tracking with Salesperson
 */
export const dailySales = mysqlTable("daily_sales", {
  id: int("id").autoincrement().primaryKey(),
  date: date("date").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  salespersonId: int("salespersonId").notNull(),
  salespersonName: varchar("salespersonName", { length: 255 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailySales = typeof dailySales.$inferSelect;
export type InsertDailySales = typeof dailySales.$inferInsert;

/**
 * Weekly Sales Targets and Achievements
 */
export const weeklySalesTargets = mysqlTable("weekly_sales_targets", {
  id: int("id").autoincrement().primaryKey(),
  weekStartDate: date("weekStartDate").notNull(),
  weekEndDate: date("weekEndDate").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  achievedAmount: decimal("achievedAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  salespersonId: int("salespersonId"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklySalesTarget = typeof weeklySalesTargets.$inferSelect;
export type InsertWeeklySalesTarget = typeof weeklySalesTargets.$inferInsert;

/**
 * Monthly Sales Targets and Achievements
 */
export const monthlySalesTargets = mysqlTable("monthly_sales_targets", {
  id: int("id").autoincrement().primaryKey(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  achievedAmount: decimal("achievedAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  salespersonId: int("salespersonId"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlySalesTarget = typeof monthlySalesTargets.$inferSelect;
export type InsertMonthlySalesTarget = typeof monthlySalesTargets.$inferInsert;

/**
 * Project Financial Transactions
 */
export const projectTransactions = mysqlTable("project_transactions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  transactionDate: date("transactionDate").notNull(),
  transactionType: mysqlEnum("transactionType", [
    "revenue",
    "purchase",
    "expense",
    "cogs",
    "wacc",
  ]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTransaction = typeof projectTransactions.$inferSelect;
export type InsertProjectTransaction = typeof projectTransactions.$inferInsert;

/**
 * Income & Expenditure Module
 */
export const incomeExpenditure = mysqlTable("income_expenditure", {
  id: int("id").autoincrement().primaryKey(),
  date: date("date").notNull(),
  type: mysqlEnum("type", ["income", "expenditure"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // sales_product, sales_service, salary, rent, utilities, etc.
  subcategory: varchar("subcategory", { length: 100 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  description: text("description"),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IncomeExpenditure = typeof incomeExpenditure.$inferSelect;
export type InsertIncomeExpenditure = typeof incomeExpenditure.$inferInsert;

/**
 * Marketing & Branding Campaigns
 */
export const marketingCampaigns = mysqlTable("marketing_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "social_media",
    "email",
    "sms",
    "event",
    "content",
    "branding",
    "other",
  ]).notNull(),
  platform: varchar("platform", { length: 100 }), // Facebook, Instagram, LinkedIn, etc.
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  spent: decimal("spent", { precision: 15, scale: 2 }).default("0"),
  targetAudience: text("targetAudience"),
  description: text("description"),
  status: mysqlEnum("status", ["planning", "active", "paused", "completed", "cancelled"]).default("planning").notNull(),
  metrics: text("metrics"), // JSON: impressions, clicks, conversions, etc.
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

/**
 * Marketing Content (Facebook posts, etc.)
 */
export const marketingContent = mysqlTable("marketing_content", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId"),
  contentType: mysqlEnum("contentType", ["post", "ad", "story", "video", "image", "article"]).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  contentBangla: text("contentBangla"), // Bangla version
  scheduledDate: timestamp("scheduledDate"),
  publishedDate: timestamp("publishedDate"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  productIds: text("productIds"), // JSON array of product IDs
  aiGenerated: mysqlEnum("aiGenerated", ["yes", "no"]).default("no").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingContent = typeof marketingContent.$inferSelect;
export type InsertMarketingContent = typeof marketingContent.$inferInsert;

/**
 * Team Members / Employees
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: varchar("employeeId", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  designation: varchar("designation", { length: 100 }),
  joiningDate: date("joiningDate").notNull(),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["active", "on_leave", "resigned", "terminated"]).default("active").notNull(),
  userId: int("userId"), // Link to users table if they have system access
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Payroll Records
 */
export const payrollRecords = mysqlTable("payroll_records", {
  id: int("id").autoincrement().primaryKey(),
  teamMemberId: int("teamMemberId").notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  basicSalary: decimal("basicSalary", { precision: 15, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 15, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 15, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 15, scale: 2 }).default("0"),
  netSalary: decimal("netSalary", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("paymentDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = typeof payrollRecords.$inferInsert;

/**
 * Employee KPI Definitions
 */
export const employeeKPIs = mysqlTable("employee_kpis", {
  id: int("id").autoincrement().primaryKey(),
  teamMemberId: int("teamMemberId").notNull(),
  kpiName: varchar("kpiName", { length: 255 }).notNull(),
  kpiDescription: text("kpiDescription"),
  measurementUnit: varchar("measurementUnit", { length: 50 }).notNull(), // sales_amount, number_of_calls, projects_completed, etc.
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }).default("0").notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly", "quarterly", "yearly"]).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeKPI = typeof employeeKPIs.$inferSelect;
export type InsertEmployeeKPI = typeof employeeKPIs.$inferInsert;

/**
 * Archive / Deleted Items
 */
export const archivedItems = mysqlTable("archived_items", {
  id: int("id").autoincrement().primaryKey(),
  moduleName: varchar("moduleName", { length: 100 }).notNull(), // financial, projects, customers, etc.
  itemId: int("itemId").notNull(),
  itemData: text("itemData").notNull(), // JSON of original item
  deletedBy: int("deletedBy").notNull(),
  deletedAt: timestamp("deletedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Auto-delete after retention period
});

export type ArchivedItem = typeof archivedItems.$inferSelect;
export type InsertArchivedItem = typeof archivedItems.$inferInsert;

/**
 * AI Reminders and Follow-ups
 */
export const aiReminders = mysqlTable("ai_reminders", {
  id: int("id").autoincrement().primaryKey(),
  reminderType: mysqlEnum("reminderType", ["client_followup", "lead_followup", "task", "meeting", "other"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // customer, project, lead, etc.
  entityId: int("entityId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  descriptionBangla: text("descriptionBangla"),
  dueDate: date("dueDate").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "snoozed", "cancelled"]).default("pending").notNull(),
  assignedTo: int("assignedTo").notNull(),
  aiGenerated: mysqlEnum("aiGenerated", ["yes", "no"]).default("yes").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIReminder = typeof aiReminders.$inferSelect;
export type InsertAIReminder = typeof aiReminders.$inferInsert;

/**
 * Currency exchange rates
 */
export const currencyRates = mysqlTable("currency_rates", {
  id: int("id").autoincrement().primaryKey(),
  fromCurrency: varchar("fromCurrency", { length: 3 }).notNull(),
  toCurrency: varchar("toCurrency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  effectiveDate: date("effectiveDate").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertCurrencyRate = typeof currencyRates.$inferInsert;

/**
 * Action Tracker - for tracking Actions, Decisions, Issues, and Opportunities
 */
export const actionTracker = mysqlTable("action_tracker", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["action", "decision", "issue", "opportunity"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  dueDate: date("dueDate"),
  resolvedDate: date("resolvedDate"),
  tags: text("tags"), // JSON array of tags
  relatedModule: varchar("relatedModule", { length: 100 }), // projects, customers, sales, etc.
  relatedId: int("relatedId"), // ID of related item
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActionTracker = typeof actionTracker.$inferSelect;
export type InsertActionTracker = typeof actionTracker.$inferInsert;

/**
 * Tender/Quotation Tracking - for Government Tenders and Private Quotations
 */
export const tenderQuotation = mysqlTable("tender_quotation", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["government_tender", "private_quotation"]).notNull(),
  referenceId: varchar("referenceId", { length: 100 }).notNull(), // Tender/Quotation ID
  description: text("description").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  submissionDate: date("submissionDate").notNull(),
  followUpDate: date("followUpDate"),
  status: mysqlEnum("status", ["not_started", "preparing", "submitted", "win", "loss", "po_received"]).default("not_started").notNull(),
  estimatedValue: decimal("estimatedValue", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file URLs
  transferredToProjectId: int("transferredToProjectId"), // ID of project if auto-transferred
  archivedAt: timestamp("archivedAt"), // When moved to archive
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TenderQuotation = typeof tenderQuotation.$inferSelect;
export type InsertTenderQuotation = typeof tenderQuotation.$inferInsert;

// Quotation Items - Line items for quotations
export const quotationItems = mysqlTable("quotation_items", {
  id: int("id").autoincrement().primaryKey(),
  quotationId: int("quotationId").notNull().references(() => tenderQuotation.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  specifications: text("specifications"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("pcs").notNull(),
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0.00"),
  discountAmount: decimal("discountAmount", { precision: 15, scale: 2 }).default("0.00"),
  finalAmount: decimal("finalAmount", { precision: 15, scale: 2 }).notNull(),
  notes: text("notes"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;

/**
 * Transaction Types - for customizable project financial transaction categories
 */
export const transactionTypes = mysqlTable("transaction_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "revenue", "expense"
  category: mysqlEnum("category", ["income", "expense"]).notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }).default("gray"), // For UI color coding
  isSystem: boolean("isSystem").default(false).notNull(), // System types can't be deleted
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransactionType = typeof transactionTypes.$inferSelect;
export type InsertTransactionType = typeof transactionTypes.$inferInsert;

/**
 * HR Module - Comprehensive Human Resource Management
 */

// Departments
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  headId: int("headId"), // FK to employees
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

// Positions
export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  departmentId: int("departmentId").notNull(),
  level: varchar("level", { length: 50 }), // Junior, Mid, Senior, Lead, Manager
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

// Employees (extends users)
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // FK to users table
  employeeCode: varchar("employeeCode", { length: 50 }).notNull().unique(),
  departmentId: int("departmentId"),
  positionId: int("positionId"),
  jobTitle: varchar("jobTitle", { length: 100 }),
  employmentType: mysqlEnum("employmentType", ["full_time", "part_time", "contract", "intern"]).default("full_time").notNull(),
  joinDate: date("joinDate").notNull(),
  contractEndDate: date("contractEndDate"),
  managerId: int("managerId"), // FK to employees (self-reference)
  salaryGrade: varchar("salaryGrade", { length: 50 }),
  workLocation: varchar("workLocation", { length: 100 }),
  workSchedule: varchar("workSchedule", { length: 100 }), // e.g., "9 AM - 6 PM"
  emergencyContactName: varchar("emergencyContactName", { length: 100 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 50 }),
  status: mysqlEnum("status", ["active", "on_leave", "terminated"]).default("active").notNull(),
  terminationDate: date("terminationDate"),
  terminationReason: text("terminationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// Attendance Records (enhanced)
export const attendanceRecords = mysqlTable("attendance_records", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  date: date("date").notNull(),
  clockIn: timestamp("clockIn"),
  clockOut: timestamp("clockOut"),
  workHours: decimal("workHours", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["present", "absent", "late", "half_day", "wfh", "on_leave"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;

// Leave Balances
export const leaveBalances = mysqlTable("leave_balances", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  leaveType: varchar("leaveType", { length: 50 }).notNull(), // annual, sick, casual, maternity, paternity
  totalDays: decimal("totalDays", { precision: 5, scale: 1 }).notNull(),
  usedDays: decimal("usedDays", { precision: 5, scale: 1 }).default("0").notNull(),
  availableDays: decimal("availableDays", { precision: 5, scale: 1 }).notNull(),
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;

// Leave Applications (enhanced)
export const leaveApplications = mysqlTable("leave_applications", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  leaveType: varchar("leaveType", { length: 50 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  daysCount: decimal("daysCount", { precision: 5, scale: 1 }).notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveApplication = typeof leaveApplications.$inferSelect;
export type InsertLeaveApplication = typeof leaveApplications.$inferInsert;

// Performance Reviews
export const performanceReviews = mysqlTable("performance_reviews", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  reviewPeriod: varchar("reviewPeriod", { length: 50 }).notNull(), // e.g., "Q1 2026", "Annual 2025"
  reviewDate: date("reviewDate").notNull(),
  overallRating: decimal("overallRating", { precision: 3, scale: 1 }), // e.g., 4.5 out of 5
  strengths: text("strengths"),
  areasForImprovement: text("areasForImprovement"),
  goals: text("goals"),
  comments: text("comments"),
  status: mysqlEnum("status", ["draft", "submitted", "acknowledged"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = typeof performanceReviews.$inferInsert;


// ============ Universal Attachments ============
export const attachments = mysqlTable("attachments", {
  id: int("id").primaryKey().autoincrement(),
  entityType: mysqlEnum("entity_type", [
    "project",
    "tender_quotation",
    "sale",
    "customer",
    "financial_transaction",
    "income_expenditure",
    "employee",
    "action_tracker",
  ]).notNull(),
  entityId: int("entity_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: int("file_size"), // in bytes
  uploadedBy: int("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

/**
 * Budget tracking for income and expenditure categories
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  monthYear: varchar("month_year", { length: 7 }).notNull(), // Format: YYYY-MM
  type: mysqlEnum("type", ["income", "expenditure"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  budgetAmount: decimal("budget_amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  notes: text("notes"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;


// ============ Module Permissions (Role-Based Access Control) ============
export const modulePermissions = mysqlTable("module_permissions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  moduleName: varchar("module_name", { length: 50 }).notNull(), // dashboard, financial, sales, projects, customers, hr, action_tracker, tender_quotation, settings
  canView: boolean("can_view").default(true).notNull(),
  canCreate: boolean("can_create").default(false).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type ModulePermission = typeof modulePermissions.$inferSelect;
export type InsertModulePermission = typeof modulePermissions.$inferInsert;


// ============ Job Descriptions ============
export const jobDescriptions = mysqlTable("job_descriptions", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("position_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  summary: text("summary"),
  responsibilities: text("responsibilities"), // JSON array of responsibilities
  qualifications: text("qualifications"), // JSON array of qualifications
  requirements: text("requirements"), // JSON array of requirements
  salaryRange: varchar("salary_range", { length: 100 }),
  reportingTo: varchar("reporting_to", { length: 100 }),
  department: varchar("department", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;

// ============ Employee Roles (For role management separate from user roles) ============
export const employeeRoles = mysqlTable("employee_roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: text("permissions"), // JSON array of permissions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeRole = typeof employeeRoles.$inferSelect;
export type InsertEmployeeRole = typeof employeeRoles.$inferInsert;

// ============ Employee Confidential Information (Admin Only) ============
export const employeeConfidential = mysqlTable("employee_confidential", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull().unique(),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  benefits: text("benefits"), // JSON array of benefits
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  bankName: varchar("bank_name", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  ssn: varchar("ssn", { length: 50 }), // Social Security Number or equivalent
  medicalRecords: text("medical_records"), // JSON or notes
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeConfidential = typeof employeeConfidential.$inferSelect;
export type InsertEmployeeConfidential = typeof employeeConfidential.$inferInsert;


/**
 * Audit Log - Track all edit and delete operations for compliance
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "view", "export"]).notNull(),
  module: varchar("module", { length: 100 }).notNull(), // e.g., "financial", "sales", "customers"
  entityType: varchar("entityType", { length: 100 }).notNull(), // e.g., "AR", "AP", "Order"
  entityId: varchar("entityId", { length: 100 }).notNull(),
  entityName: varchar("entityName", { length: 255 }), // e.g., customer name, invoice number
  oldValues: text("oldValues"), // JSON: previous values for updates
  newValues: text("newValues"), // JSON: new values for updates/creates
  changes: text("changes"), // JSON: specific fields that changed
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failed"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
