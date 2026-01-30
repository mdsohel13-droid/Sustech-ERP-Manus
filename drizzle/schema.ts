import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, date, serial } from "drizzle-orm/pg-core";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "viewer", "user"]);
export const statusEnum = pgEnum("status", ["pending", "overdue", "paid"]);
export const projectStageEnum = pgEnum("project_stage", ["lead", "proposal", "won", "execution", "testing"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const customerStatusEnum = pgEnum("customer_status", ["hot", "warm", "cold"]);
export const interactionTypeEnum = pgEnum("interaction_type", ["call", "email", "meeting", "note"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "leave", "holiday"]);
export const leaveTypeEnum = pgEnum("leave_type", ["sick", "vacation", "personal", "other"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);
export const productCategoryEnum = pgEnum("product_category", ["fan", "ess", "solar_pv", "epc_project", "testing", "installation", "other"]);
export const productTypeEnum = pgEnum("product_type", ["fan", "ess", "solar_pv", "projects", "testing", "installation"]);
export const insightTypeEnum = pgEnum("insight_type", ["financial", "project", "customer", "team", "general", "pattern", "trend", "alert"]);
export const notificationTypeEnum = pgEnum("notification_type", ["ar_overdue", "project_status", "attendance_anomaly", "threshold_breach"]);
export const notificationStatusEnum = pgEnum("notification_status", ["sent", "failed"]);
export const settingTypeEnum = pgEnum("setting_type", ["string", "number", "boolean", "json"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["revenue", "purchase", "expense", "cogs", "wacc"]);
export const incomeExpenditureTypeEnum = pgEnum("income_expenditure_type", ["income", "expenditure"]);
export const marketingTypeEnum = pgEnum("marketing_type", ["social_media", "email", "sms", "event", "content", "branding", "other"]);
export const marketingStatusEnum = pgEnum("marketing_status", ["planning", "active", "paused", "completed", "cancelled"]);
export const contentTypeEnum = pgEnum("content_type", ["post", "ad", "story", "video", "image", "article"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "scheduled", "published", "archived"]);
export const yesNoEnum = pgEnum("yes_no", ["yes", "no"]);
export const teamMemberStatusEnum = pgEnum("team_member_status", ["active", "on_leave", "resigned", "terminated"]);
export const payrollStatusEnum = pgEnum("payroll_status", ["pending", "paid", "cancelled"]);
export const kpiPeriodEnum = pgEnum("kpi_period", ["daily", "weekly", "monthly", "quarterly", "yearly"]);
export const kpiStatusEnum = pgEnum("kpi_status", ["active", "completed", "cancelled"]);
export const reminderTypeEnum = pgEnum("reminder_type", ["client_followup", "lead_followup", "task", "meeting", "other"]);
export const reminderPriorityEnum = pgEnum("reminder_priority", ["low", "medium", "high", "urgent"]);
export const reminderStatusEnum = pgEnum("reminder_status", ["pending", "completed", "snoozed", "cancelled"]);
export const actionTypeEnum = pgEnum("action_type", ["action", "decision", "issue", "opportunity"]);
export const actionStatusEnum = pgEnum("action_status", ["open", "in_progress", "resolved", "closed"]);
export const criticalPriorityEnum = pgEnum("critical_priority", ["low", "medium", "high", "critical"]);
export const tenderTypeEnum = pgEnum("tender_type", ["government_tender", "private_quotation"]);
export const tenderStatusEnum = pgEnum("tender_status", ["not_started", "preparing", "submitted", "win", "loss", "po_received"]);
export const transactionCategoryEnum = pgEnum("transaction_category", ["income", "expense"]);
export const employmentTypeEnum = pgEnum("employment_type", ["full_time", "part_time", "contract", "intern"]);
export const employeeStatusEnum = pgEnum("employee_status", ["active", "on_leave", "terminated"]);
export const enhancedAttendanceStatusEnum = pgEnum("enhanced_attendance_status", ["present", "absent", "late", "half_day", "wfh", "on_leave"]);
export const leaveApplicationStatusEnum = pgEnum("leave_application_status", ["pending", "approved", "rejected", "cancelled"]);
export const reviewStatusEnum = pgEnum("review_status", ["draft", "submitted", "acknowledged"]);
export const entityTypeEnum = pgEnum("entity_type", ["project", "tender_quotation", "sale", "customer", "financial_transaction", "income_expenditure", "employee", "action_tracker"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "view", "export"]);
export const auditStatusEnum = pgEnum("audit_status", ["success", "failed"]);
export const loginAttemptTypeEnum = pgEnum("login_attempt_type", ["success", "failed", "blocked"]);
export const commissionTypeEnum = pgEnum("commission_type", ["percentage", "fixed", "tiered"]);
export const commissionHistoryStatusEnum = pgEnum("commission_history_status", ["pending", "approved", "paid", "cancelled"]);
export const commissionTransactionStatusEnum = pgEnum("commission_transaction_status", ["earned", "pending", "paid"]);
export const payoutStatusEnum = pgEnum("payout_status", ["draft", "approved", "processed", "completed", "cancelled"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  mustChangePassword: boolean("mustChangePassword").default(false),
  role: userRoleEnum("role").default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Financial tracking: Accounts Receivable
 */
export const accountsReceivable = pgTable("accounts_receivable", {
  id: serial("id").primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  dueDate: date("dueDate").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AccountsReceivable = typeof accountsReceivable.$inferSelect;
export type InsertAccountsReceivable = typeof accountsReceivable.$inferInsert;

/**
 * Financial tracking: Accounts Payable
 */
export const accountsPayable = pgTable("accounts_payable", {
  id: serial("id").primaryKey(),
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  dueDate: date("dueDate").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AccountsPayable = typeof accountsPayable.$inferSelect;
export type InsertAccountsPayable = typeof accountsPayable.$inferInsert;

/**
 * Sales tracking by product/service
 */
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productType: productTypeEnum("productType").notNull(),
  weekNumber: integer("weekNumber").notNull(),
  monthYear: varchar("monthYear", { length: 7 }).notNull(),
  target: decimal("target", { precision: 15, scale: 2 }),
  actual: decimal("actual", { precision: 15, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Sales = typeof sales.$inferSelect;
export type InsertSales = typeof sales.$inferInsert;

/**
 * Project pipeline tracking
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  stage: projectStageEnum("stage").default("lead").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  description: text("description"),
  startDate: date("startDate"),
  expectedCloseDate: date("expectedCloseDate"),
  actualCloseDate: date("actualCloseDate"),
  priority: priorityEnum("priority").default("medium").notNull(),
  assignedTo: integer("assignedTo"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Customer CRM
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  status: customerStatusEnum("status").default("warm").notNull(),
  lastContactDate: date("lastContactDate"),
  nextActionRequired: text("nextActionRequired"),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Customer interaction history
 */
export const customerInteractions = pgTable("customer_interactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  interactionType: interactionTypeEnum("interactionType").notNull(),
  subject: varchar("subject", { length: 255 }),
  notes: text("notes"),
  interactionDate: date("interactionDate").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type InsertCustomerInteraction = typeof customerInteractions.$inferInsert;

/**
 * Team attendance tracking
 */
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("teamMemberId").notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").default("present").notNull(),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Leave requests
 */
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("teamMemberId").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  leaveType: leaveTypeEnum("leaveType").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("pending").notNull(),
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

/**
 * Idea brain bump notes
 */
export const ideaNotes = pgTable("idea_notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IdeaNote = typeof ideaNotes.$inferSelect;
export type InsertIdeaNote = typeof ideaNotes.$inferInsert;

/**
 * Product Categories - Dynamic categories for products/services
 */
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

/**
 * Product Units - Units of measurement
 */
export const productUnits = pgTable("product_units", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 20 }).notNull(),
  allowDecimal: boolean("allow_decimal").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductUnit = typeof productUnits.$inferSelect;
export type InsertProductUnit = typeof productUnits.$inferInsert;

/**
 * Product Brands
 */
export const productBrands = pgTable("product_brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductBrand = typeof productBrands.$inferSelect;
export type InsertProductBrand = typeof productBrands.$inferInsert;

/**
 * Product Warranties
 */
export const productWarranties = pgTable("product_warranties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: integer("duration").notNull(),
  durationUnit: varchar("duration_unit", { length: 20 }).notNull().default("months"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductWarranty = typeof productWarranties.$inferSelect;
export type InsertProductWarranty = typeof productWarranties.$inferInsert;

/**
 * Selling Price Groups
 */
export const sellingPriceGroups = pgTable("selling_price_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SellingPriceGroup = typeof sellingPriceGroups.$inferSelect;
export type InsertSellingPriceGroup = typeof sellingPriceGroups.$inferInsert;

/**
 * Product Variations - For products with variations
 */
export const productVariations = pgTable("product_variations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  values: text("values"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;

/**
 * Sales products table - Enhanced with dynamic references
 */
export const salesProducts = pgTable("sales_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  category: productCategoryEnum("category").default("other"),
  categoryId: integer("category_id"),
  unitId: integer("unit_id"),
  brandId: integer("brand_id"),
  warrantyId: integer("warranty_id"),
  unit: varchar("unit", { length: 50 }).notNull().default("units"),
  description: text("description"),
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 15, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  alertQuantity: integer("alert_quantity"),
  isActive: integer("is_active").notNull().default(1),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SalesProduct = typeof salesProducts.$inferSelect;
export type InsertSalesProduct = typeof salesProducts.$inferInsert;

/**
 * Warehouses / Locations table
 */
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  isDefault: integer("is_default").default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;

/**
 * Product Inventory - Stock levels per product per warehouse
 */
export const productInventory = pgTable("product_inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull().default("0"),
  reservedQuantity: decimal("reserved_quantity", { precision: 15, scale: 2 }).default("0"),
  minStockLevel: decimal("min_stock_level", { precision: 15, scale: 2 }),
  maxStockLevel: decimal("max_stock_level", { precision: 15, scale: 2 }),
  reorderPoint: decimal("reorder_point", { precision: 15, scale: 2 }),
  lastStockCheck: timestamp("last_stock_check"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductInventory = typeof productInventory.$inferSelect;
export type InsertProductInventory = typeof productInventory.$inferInsert;

/**
 * Inventory transaction type enum
 */
export const inventoryTransactionTypeEnum = pgEnum("inventory_transaction_type", [
  "purchase",
  "sale",
  "adjustment",
  "transfer_in",
  "transfer_out",
  "return",
  "damage",
  "opening_stock",
]);

/**
 * Inventory Transactions - Stock movement history
 */
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  transactionType: inventoryTransactionTypeEnum("transaction_type").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  previousQuantity: decimal("previous_quantity", { precision: 15, scale: 2 }),
  newQuantity: decimal("new_quantity", { precision: 15, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  notes: text("notes"),
  performedBy: integer("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert;

/**
 * Sales tracking table
 */
export const salesTracking = pgTable("sales_tracking", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  weekEndDate: timestamp("week_end_date").notNull(),
  target: decimal("target", { precision: 15, scale: 2 }).notNull(),
  actual: decimal("actual", { precision: 15, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SalesTracking = typeof salesTracking.$inferSelect;
export type InsertSalesTracking = typeof salesTracking.$inferInsert;

/**
 * Dashboard insights
 */
export const dashboardInsights = pgTable("dashboard_insights", {
  id: serial("id").primaryKey(),
  insightType: insightTypeEnum("insightType").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  recommendations: text("recommendations"),
  dataSnapshot: text("dataSnapshot"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type DashboardInsight = typeof dashboardInsights.$inferSelect;
export type InsertDashboardInsight = typeof dashboardInsights.$inferInsert;

/**
 * Notification log
 */
export const notificationLog = pgTable("notification_log", {
  id: serial("id").primaryKey(),
  notificationType: notificationTypeEnum("notificationType").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sentTo: varchar("sentTo", { length: 320 }).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: notificationStatusEnum("status").default("sent").notNull(),
});

export type NotificationLog = typeof notificationLog.$inferSelect;
export type InsertNotificationLog = typeof notificationLog.$inferInsert;

/**
 * System Settings
 */
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: settingTypeEnum("settingType").default("string").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  updatedBy: integer("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Daily Sales Tracking
 */
export const dailySales = pgTable("daily_sales", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  salespersonId: integer("salespersonId").notNull(),
  salespersonName: varchar("salespersonName", { length: 255 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  notes: text("notes"),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
  archivedBy: integer("archivedBy"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DailySales = typeof dailySales.$inferSelect;
export type InsertDailySales = typeof dailySales.$inferInsert;

/**
 * Weekly Sales Targets
 */
export const weeklySalesTargets = pgTable("weekly_sales_targets", {
  id: serial("id").primaryKey(),
  weekStartDate: date("weekStartDate").notNull(),
  weekEndDate: date("weekEndDate").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  achievedAmount: decimal("achievedAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  salespersonId: integer("salespersonId"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  archivedAt: timestamp("archivedAt"),
  archivedBy: integer("archivedBy"),
});

export type WeeklySalesTarget = typeof weeklySalesTargets.$inferSelect;
export type InsertWeeklySalesTarget = typeof weeklySalesTargets.$inferInsert;

/**
 * Monthly Sales Targets
 */
export const monthlySalesTargets = pgTable("monthly_sales_targets", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  achievedAmount: decimal("achievedAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  salespersonId: integer("salespersonId"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  archivedAt: timestamp("archivedAt"),
  archivedBy: integer("archivedBy"),
});

export type MonthlySalesTarget = typeof monthlySalesTargets.$inferSelect;
export type InsertMonthlySalesTarget = typeof monthlySalesTargets.$inferInsert;

/**
 * Project Financial Transactions
 */
export const projectTransactions = pgTable("project_transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  transactionDate: date("transactionDate").notNull(),
  transactionType: transactionTypeEnum("transactionType").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectTransaction = typeof projectTransactions.$inferSelect;
export type InsertProjectTransaction = typeof projectTransactions.$inferInsert;

/**
 * Income & Expenditure Module
 */
export const incomeExpenditure = pgTable("income_expenditure", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: incomeExpenditureTypeEnum("type").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  description: text("description"),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export type IncomeExpenditure = typeof incomeExpenditure.$inferSelect;
export type InsertIncomeExpenditure = typeof incomeExpenditure.$inferInsert;

/**
 * Marketing Campaigns
 */
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: marketingTypeEnum("type").notNull(),
  platform: varchar("platform", { length: 100 }),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  spent: decimal("spent", { precision: 15, scale: 2 }).default("0"),
  targetAudience: text("targetAudience"),
  description: text("description"),
  status: marketingStatusEnum("status").default("planning").notNull(),
  metrics: text("metrics"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

/**
 * Marketing Content
 */
export const marketingContent = pgTable("marketing_content", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaignId"),
  contentType: contentTypeEnum("contentType").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  contentBangla: text("contentBangla"),
  scheduledDate: timestamp("scheduledDate"),
  publishedDate: timestamp("publishedDate"),
  status: contentStatusEnum("status").default("draft").notNull(),
  productIds: text("productIds"),
  aiGenerated: yesNoEnum("aiGenerated").default("no").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketingContent = typeof marketingContent.$inferSelect;
export type InsertMarketingContent = typeof marketingContent.$inferInsert;

/**
 * Team Members
 */
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employeeId", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  designation: varchar("designation", { length: 100 }),
  joiningDate: date("joiningDate").notNull(),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  status: teamMemberStatusEnum("status").default("active").notNull(),
  userId: integer("userId"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Payroll Records
 */
export const payrollRecords = pgTable("payroll_records", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("teamMemberId").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  basicSalary: decimal("basicSalary", { precision: 15, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 15, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 15, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 15, scale: 2 }).default("0"),
  netSalary: decimal("netSalary", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("paymentDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: payrollStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = typeof payrollRecords.$inferInsert;

/**
 * Employee KPIs
 */
export const employeeKPIs = pgTable("employee_kpis", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("teamMemberId").notNull(),
  kpiName: varchar("kpiName", { length: 255 }).notNull(),
  kpiDescription: text("kpiDescription"),
  measurementUnit: varchar("measurementUnit", { length: 50 }).notNull(),
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }).default("0").notNull(),
  period: kpiPeriodEnum("period").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  status: kpiStatusEnum("status").default("active").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmployeeKPI = typeof employeeKPIs.$inferSelect;
export type InsertEmployeeKPI = typeof employeeKPIs.$inferInsert;

/**
 * Archived Items
 */
export const archivedItems = pgTable("archived_items", {
  id: serial("id").primaryKey(),
  moduleName: varchar("moduleName", { length: 100 }).notNull(),
  itemId: integer("itemId").notNull(),
  itemData: text("itemData").notNull(),
  deletedBy: integer("deletedBy").notNull(),
  deletedAt: timestamp("deletedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type ArchivedItem = typeof archivedItems.$inferSelect;
export type InsertArchivedItem = typeof archivedItems.$inferInsert;

/**
 * AI Reminders
 */
export const aiReminders = pgTable("ai_reminders", {
  id: serial("id").primaryKey(),
  reminderType: reminderTypeEnum("reminderType").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: integer("entityId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  descriptionBangla: text("descriptionBangla"),
  dueDate: date("dueDate").notNull(),
  priority: reminderPriorityEnum("priority").default("medium").notNull(),
  status: reminderStatusEnum("status").default("pending").notNull(),
  assignedTo: integer("assignedTo").notNull(),
  aiGenerated: yesNoEnum("aiGenerated").default("yes").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AIReminder = typeof aiReminders.$inferSelect;
export type InsertAIReminder = typeof aiReminders.$inferInsert;

/**
 * Currency rates
 */
export const currencyRates = pgTable("currency_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: varchar("fromCurrency", { length: 3 }).notNull(),
  toCurrency: varchar("toCurrency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  effectiveDate: date("effectiveDate").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertCurrencyRate = typeof currencyRates.$inferInsert;

/**
 * Action Tracker
 */
export const actionTracker = pgTable("action_tracker", {
  id: serial("id").primaryKey(),
  type: actionTypeEnum("type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: actionStatusEnum("status").default("open").notNull(),
  priority: criticalPriorityEnum("priority").default("medium").notNull(),
  assignedTo: integer("assignedTo"),
  dueDate: date("dueDate"),
  resolvedDate: date("resolvedDate"),
  tags: text("tags"),
  relatedModule: varchar("relatedModule", { length: 100 }),
  relatedId: integer("relatedId"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ActionTracker = typeof actionTracker.$inferSelect;
export type InsertActionTracker = typeof actionTracker.$inferInsert;

/**
 * Tender/Quotation Tracking
 */
export const tenderQuotation = pgTable("tender_quotation", {
  id: serial("id").primaryKey(),
  type: tenderTypeEnum("type").notNull(),
  referenceId: varchar("referenceId", { length: 100 }).notNull(),
  description: text("description").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  submissionDate: date("submissionDate").notNull(),
  followUpDate: date("followUpDate"),
  status: tenderStatusEnum("status").default("not_started").notNull(),
  estimatedValue: decimal("estimatedValue", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  notes: text("notes"),
  attachments: text("attachments"),
  transferredToProjectId: integer("transferredToProjectId"),
  archivedAt: timestamp("archivedAt"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TenderQuotation = typeof tenderQuotation.$inferSelect;
export type InsertTenderQuotation = typeof tenderQuotation.$inferInsert;

/**
 * Quotation Items
 */
export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotationId").notNull(),
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
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;

/**
 * Transaction Types
 */
export const transactionTypes = pgTable("transaction_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  category: transactionCategoryEnum("category").notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }).default("gray"),
  isSystem: boolean("isSystem").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TransactionType = typeof transactionTypes.$inferSelect;
export type InsertTransactionType = typeof transactionTypes.$inferInsert;

/**
 * Departments
 */
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  headId: integer("headId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Positions
 */
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  departmentId: integer("departmentId").notNull(),
  level: varchar("level", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

/**
 * Employees
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  employeeCode: varchar("employeeCode", { length: 50 }).notNull().unique(),
  departmentId: integer("departmentId"),
  positionId: integer("positionId"),
  jobTitle: varchar("jobTitle", { length: 100 }),
  employmentType: employmentTypeEnum("employmentType").default("full_time").notNull(),
  joinDate: date("joinDate").notNull(),
  contractEndDate: date("contractEndDate"),
  managerId: integer("managerId"),
  salaryGrade: varchar("salaryGrade", { length: 50 }),
  workLocation: varchar("workLocation", { length: 100 }),
  workSchedule: varchar("workSchedule", { length: 100 }),
  emergencyContactName: varchar("emergencyContactName", { length: 100 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 50 }),
  status: employeeStatusEnum("status").default("active").notNull(),
  terminationDate: date("terminationDate"),
  terminationReason: text("terminationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Attendance Records
 */
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  date: date("date").notNull(),
  clockIn: timestamp("clockIn"),
  clockOut: timestamp("clockOut"),
  workHours: decimal("workHours", { precision: 5, scale: 2 }),
  status: enhancedAttendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;

/**
 * Leave Balances
 */
export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  leaveType: varchar("leaveType", { length: 50 }).notNull(),
  totalDays: decimal("totalDays", { precision: 5, scale: 1 }).notNull(),
  usedDays: decimal("usedDays", { precision: 5, scale: 1 }).default("0").notNull(),
  availableDays: decimal("availableDays", { precision: 5, scale: 1 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;

/**
 * Leave Applications
 */
export const leaveApplications = pgTable("leave_applications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  leaveType: varchar("leaveType", { length: 50 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  daysCount: decimal("daysCount", { precision: 5, scale: 1 }).notNull(),
  reason: text("reason").notNull(),
  status: leaveApplicationStatusEnum("status").default("pending").notNull(),
  approvedBy: integer("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LeaveApplication = typeof leaveApplications.$inferSelect;
export type InsertLeaveApplication = typeof leaveApplications.$inferInsert;

/**
 * Performance Reviews
 */
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  reviewerId: integer("reviewerId").notNull(),
  reviewPeriod: varchar("reviewPeriod", { length: 50 }).notNull(),
  reviewDate: date("reviewDate").notNull(),
  overallRating: decimal("overallRating", { precision: 3, scale: 1 }),
  strengths: text("strengths"),
  areasForImprovement: text("areasForImprovement"),
  goals: text("goals"),
  comments: text("comments"),
  status: reviewStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = typeof performanceReviews.$inferInsert;

/**
 * Attachments
 */
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer("file_size"),
  uploadedBy: integer("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

/**
 * Budgets
 */
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  monthYear: varchar("month_year", { length: 7 }).notNull(),
  type: incomeExpenditureTypeEnum("type").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  budgetAmount: decimal("budget_amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Module Permissions
 */
export const modulePermissions = pgTable("module_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleName: varchar("module_name", { length: 50 }).notNull(),
  canView: boolean("can_view").default(true).notNull(),
  canCreate: boolean("can_create").default(false).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ModulePermission = typeof modulePermissions.$inferSelect;
export type InsertModulePermission = typeof modulePermissions.$inferInsert;

/**
 * Job Descriptions
 */
export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  summary: text("summary"),
  responsibilities: text("responsibilities"),
  qualifications: text("qualifications"),
  requirements: text("requirements"),
  salaryRange: varchar("salary_range", { length: 100 }),
  reportingTo: varchar("reporting_to", { length: 100 }),
  department: varchar("department", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;

/**
 * Employee Roles
 */
export const employeeRoles = pgTable("employee_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: text("permissions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmployeeRole = typeof employeeRoles.$inferSelect;
export type InsertEmployeeRole = typeof employeeRoles.$inferInsert;

/**
 * Employee Confidential
 */
export const employeeConfidential = pgTable("employee_confidential", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().unique(),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  benefits: text("benefits"),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  bankName: varchar("bank_name", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  ssn: varchar("ssn", { length: 50 }),
  medicalRecords: text("medical_records"),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmployeeConfidential = typeof employeeConfidential.$inferSelect;
export type InsertEmployeeConfidential = typeof employeeConfidential.$inferInsert;

/**
 * Audit Logs
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  action: auditActionEnum("action").notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: varchar("entityId", { length: 100 }).notNull(),
  entityName: varchar("entityName", { length: 255 }),
  oldValues: text("oldValues"),
  newValues: text("newValues"),
  changes: text("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: auditStatusEnum("status").default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Security Settings
 */
export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  description: text("description"),
  updatedBy: integer("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SecuritySetting = typeof securitySettings.$inferSelect;
export type InsertSecuritySetting = typeof securitySettings.$inferInsert;

/**
 * Login Attempts
 */
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  email: varchar("email", { length: 320 }),
  userId: integer("userId"),
  attemptType: loginAttemptTypeEnum("attemptType").notNull(),
  userAgent: text("userAgent"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

/**
 * Blocked IPs
 */
export const blockedIPs = pgTable("blocked_ips", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull().unique(),
  reason: text("reason"),
  blockedBy: integer("blockedBy"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedIP = typeof blockedIPs.$inferSelect;
export type InsertBlockedIP = typeof blockedIPs.$inferInsert;

/**
 * User Sessions
 */
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  deviceInfo: text("deviceInfo"),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

/**
 * Password History
 */
export const passwordHistory = pgTable("password_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordHistory = typeof passwordHistory.$inferSelect;
export type InsertPasswordHistory = typeof passwordHistory.$inferInsert;

/**
 * Two Factor Auth
 */
export const twoFactorAuth = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  secret: varchar("secret", { length: 255 }).notNull(),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  backupCodes: text("backupCodes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = typeof twoFactorAuth.$inferInsert;

/**
 * Display Preferences
 */
export const displayPreferences = pgTable("display_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  settingKey: varchar("settingKey", { length: 100 }).notNull(),
  settingValue: text("settingValue"),
  isGlobal: boolean("isGlobal").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DisplayPreference = typeof displayPreferences.$inferSelect;
export type InsertDisplayPreference = typeof displayPreferences.$inferInsert;

/**
 * Commission Rates
 */
export const commissionRates = pgTable("commission_rates", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  commissionType: commissionTypeEnum("commissionType").default("percentage").notNull(),
  baseRate: decimal("baseRate", { precision: 5, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  effectiveFrom: date("effectiveFrom").notNull(),
  effectiveTo: date("effectiveTo"),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommissionRate = typeof commissionRates.$inferSelect;
export type InsertCommissionRate = typeof commissionRates.$inferInsert;

/**
 * Commission Tiers
 */
export const commissionTiers = pgTable("commission_tiers", {
  id: serial("id").primaryKey(),
  commissionRateId: integer("commissionRateId").notNull(),
  tierName: varchar("tierName", { length: 100 }).notNull(),
  minAmount: decimal("minAmount", { precision: 15, scale: 2 }).notNull(),
  maxAmount: decimal("maxAmount", { precision: 15, scale: 2 }),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommissionTier = typeof commissionTiers.$inferSelect;
export type InsertCommissionTier = typeof commissionTiers.$inferInsert;

/**
 * Commission History
 */
export const commissionHistory = pgTable("commission_history", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  salespersonName: varchar("salespersonName", { length: 255 }).notNull(),
  period: varchar("period", { length: 10 }).notNull(),
  totalSalesAmount: decimal("totalSalesAmount", { precision: 15, scale: 2 }).notNull(),
  totalSalesCount: integer("totalSalesCount").notNull().default(0),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  status: commissionHistoryStatusEnum("status").default("pending").notNull(),
  payoutDate: date("payoutDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 100 }),
  notes: text("notes"),
  approvedBy: integer("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommissionHistory = typeof commissionHistory.$inferSelect;
export type InsertCommissionHistory = typeof commissionHistory.$inferInsert;

/**
 * Commission Transactions
 */
export const commissionTransactions = pgTable("commission_transactions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  dailySalesId: integer("dailySalesId").notNull(),
  saleAmount: decimal("saleAmount", { precision: 15, scale: 2 }).notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  period: varchar("period", { length: 10 }).notNull(),
  status: commissionTransactionStatusEnum("status").default("earned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommissionTransaction = typeof commissionTransactions.$inferSelect;
export type InsertCommissionTransaction = typeof commissionTransactions.$inferInsert;

/**
 * Commission Payouts
 */
export const commissionPayouts = pgTable("commission_payouts", {
  id: serial("id").primaryKey(),
  payoutPeriod: varchar("payoutPeriod", { length: 10 }).notNull(),
  totalPayoutAmount: decimal("totalPayoutAmount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  status: payoutStatusEnum("status").default("draft").notNull(),
  payoutDate: date("payoutDate"),
  approvedBy: integer("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  processedBy: integer("processedBy"),
  processedAt: timestamp("processedAt"),
  notes: text("notes"),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type InsertCommissionPayout = typeof commissionPayouts.$inferInsert;

/**
 * CRM Lead Status Enum
 */
export const crmLeadStatusEnum = pgEnum("crm_lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost"
]);

/**
 * CRM Lead Source Enum
 */
export const crmLeadSourceEnum = pgEnum("crm_lead_source", [
  "website",
  "referral",
  "social_media",
  "cold_call",
  "email_campaign",
  "trade_show",
  "partner",
  "other"
]);

/**
 * CRM Opportunity Stage Enum
 */
export const crmOpportunityStageEnum = pgEnum("crm_opportunity_stage", [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost"
]);

/**
 * CRM Activity Type Enum
 */
export const crmActivityTypeEnum = pgEnum("crm_activity_type", [
  "call",
  "email",
  "meeting",
  "task",
  "note"
]);

/**
 * CRM Leads Table
 */
export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: crmLeadSourceEnum("source").default("website"),
  status: crmLeadStatusEnum("status").default("new").notNull(),
  estimatedValue: decimal("estimatedValue", { precision: 15, scale: 2 }),
  lastContactDate: timestamp("lastContactDate"),
  nextFollowUp: timestamp("nextFollowUp"),
  assignedTo: integer("assignedTo"),
  notes: text("notes"),
  isArchived: boolean("isArchived").default(false),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = typeof crmLeads.$inferInsert;

/**
 * CRM Opportunities Table
 */
export const crmOpportunities = pgTable("crm_opportunities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  customerId: integer("customerId"),
  leadId: integer("leadId"),
  stage: crmOpportunityStageEnum("stage").default("prospecting").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  probability: integer("probability").default(10),
  expectedCloseDate: date("expectedCloseDate"),
  actualCloseDate: date("actualCloseDate"),
  ownerId: integer("ownerId"),
  description: text("description"),
  isArchived: boolean("isArchived").default(false),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmOpportunity = typeof crmOpportunities.$inferSelect;
export type InsertCrmOpportunity = typeof crmOpportunities.$inferInsert;

/**
 * CRM Activities Table
 */
export const crmActivities = pgTable("crm_activities", {
  id: serial("id").primaryKey(),
  type: crmActivityTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  leadId: integer("leadId"),
  customerId: integer("customerId"),
  opportunityId: integer("opportunityId"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  isCompleted: boolean("isCompleted").default(false),
  assignedTo: integer("assignedTo"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrmActivity = typeof crmActivities.$inferSelect;
export type InsertCrmActivity = typeof crmActivities.$inferInsert;

/**
 * CRM Tasks Table
 */
export const crmTasks = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 50 }).default("pending"),
  leadId: integer("leadId"),
  customerId: integer("customerId"),
  opportunityId: integer("opportunityId"),
  assignedTo: integer("assignedTo"),
  completedAt: timestamp("completedAt"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmTask = typeof crmTasks.$inferSelect;
export type InsertCrmTask = typeof crmTasks.$inferInsert;

/**
 * Procurement Module - Enums
 */
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", ["draft", "sent", "confirmed", "in_transit", "received", "cancelled"]);
export const vendorStatusEnum = pgEnum("vendor_status", ["active", "inactive", "blacklisted"]);
export const purchaseCategoryEnum = pgEnum("purchase_category", ["electronics", "raw_materials", "office_supplies", "equipment", "services", "other"]);

/**
 * Vendors Table
 */
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  taxId: varchar("tax_id", { length: 100 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  status: vendorStatusEnum("status").default("active"),
  notes: text("notes"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 15, scale: 2 }).default("0"),
  isArchived: boolean("is_archived").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Purchase Orders Table
 */
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  vendorId: integer("vendor_id").notNull(),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  receivedDate: date("received_date"),
  status: purchaseOrderStatusEnum("status").default("draft"),
  category: purchaseCategoryEnum("category").default("other"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  shippingCost: decimal("shipping_cost", { precision: 15, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("unpaid"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  attachments: text("attachments"),
  isArchived: boolean("is_archived").default(false),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Purchase Order Items Table
 */
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  productId: integer("product_id"),
  productName: varchar("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

/**
 * Financial Account Types Enum
 */
export const financialAccountTypeEnum = pgEnum("financial_account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense"
]);

export const financialAccountSubtypeEnum = pgEnum("financial_account_subtype", [
  "cash",
  "bank",
  "deposits",
  "accounts_receivable",
  "inventory",
  "fixed_assets",
  "accounts_payable",
  "wages_payable",
  "taxes_payable",
  "provisions",
  "other_payable",
  "common_stock",
  "retained_earnings",
  "sales_revenue",
  "service_revenue",
  "cost_of_goods_sold",
  "operating_expenses",
  "other"
]);

/**
 * Financial Accounts - Chart of Accounts for Balance Sheet
 */
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  accountCode: varchar("account_code", { length: 20 }).notNull().unique(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: financialAccountTypeEnum("account_type").notNull(),
  accountSubtype: financialAccountSubtypeEnum("account_subtype").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type InsertFinancialAccount = typeof financialAccounts.$inferInsert;

/**
 * Journal Entries - Double-entry accounting
 */
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: date("entry_date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  debitAccountId: integer("debit_account_id").notNull(),
  creditAccountId: integer("credit_account_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT").notNull(),
  isPosted: boolean("is_posted").default(false).notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// ============ AI Chat Tables ============
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;
export type AIMessage = typeof aiMessages.$inferSelect;
export type InsertAIMessage = typeof aiMessages.$inferInsert;

// ============ AI Integration Settings ============
export const aiIntegrationSettings = pgTable("ai_integration_settings", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  model: varchar("model", { length: 100 }),
  apiEndpoint: text("api_endpoint"),
  webhookUrl: text("webhook_url"),
  settings: text("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AIIntegrationSetting = typeof aiIntegrationSettings.$inferSelect;
export type InsertAIIntegrationSetting = typeof aiIntegrationSettings.$inferInsert;

// ============ News/Event Feed Tables ============
export const feedStatusEnum = pgEnum("feed_status", ["live", "due", "completed"]);

export const newsFeed = pgTable("news_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  status: feedStatusEnum("status").default("live").notNull(),
  relatedType: varchar("related_type", { length: 50 }), // project, task, event, announcement
  relatedId: integer("related_id"),
  dueDate: timestamp("due_date"),
  attachments: text("attachments"), // JSON array of attachment URLs
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NewsFeed = typeof newsFeed.$inferSelect;
export type InsertNewsFeed = typeof newsFeed.$inferInsert;

export const feedComments = pgTable("feed_comments", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FeedComment = typeof feedComments.$inferSelect;
export type InsertFeedComment = typeof feedComments.$inferInsert;

export const feedReactions = pgTable("feed_reactions", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id").notNull(),
  userId: integer("user_id").notNull(),
  reaction: varchar("reaction", { length: 20 }).default("like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FeedReaction = typeof feedReactions.$inferSelect;
export type InsertFeedReaction = typeof feedReactions.$inferInsert;

// ============ Employee Live Tracker ============
export const employeeTracker = pgTable("employee_tracker", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  currentLocation: varchar("current_location", { length: 255 }),
  currentStatus: varchar("current_status", { length: 100 }), // e.g., "In Meeting", "Available", "On Call"
  currentTask: varchar("current_task", { length: 255 }),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export type EmployeeTracker = typeof employeeTracker.$inferSelect;
export type InsertEmployeeTracker = typeof employeeTracker.$inferInsert;
