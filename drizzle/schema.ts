import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, date, serial, index } from "drizzle-orm/pg-core";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "viewer", "user"]);
export const statusEnum = pgEnum("status", ["pending", "overdue", "paid"]);
export const projectStageEnum = pgEnum("project_stage", ["lead", "proposal", "won", "execution", "testing"]);
export const projectHealthEnum = pgEnum("project_health", ["green", "yellow", "red"]);
export const projectTypeEnum2 = pgEnum("project_type_v2", ["strategic", "improvement", "operational"]);
export const projectStatusEnum = pgEnum("project_status", ["not_started", "in_progress", "on_hold", "completed", "cancelled"]);
export const activeStageEnum = pgEnum("active_stage", ["initiate", "plan", "execute", "monitor", "close"]);
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
export const approvalStatusEnum = pgEnum("approval_status", ["pending_approval", "approved", "rejected"]);
export const paymentRecordTypeEnum = pgEnum("payment_record_type", ["ar_payment", "ap_payment"]);

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
  paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }).default("0"),
  paymentDate: date("paymentDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentNotes: text("paymentNotes"),
  approvalStatus: approvalStatusEnum("approval_status").default("approved"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by"),
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
  paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }).default("0"),
  paymentDate: date("paymentDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentNotes: text("paymentNotes"),
  approvalStatus: approvalStatusEnum("ap_approval_status").default("approved"),
  approvedBy: integer("ap_approved_by"),
  approvedAt: timestamp("ap_approved_at"),
  rejectionReason: text("ap_rejection_reason"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by"),
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
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by"),
  portfolio: varchar("portfolio", { length: 255 }),
  program: varchar("program", { length: 255 }),
  projectTemplate: varchar("project_template", { length: 255 }),
  projectStatus: projectStatusEnum("project_status").default("not_started"),
  activeStage: activeStageEnum("active_stage").default("initiate"),
  health: projectHealthEnum("health").default("green"),
  projectType: projectTypeEnum2("project_type_v2").default("operational"),
  durationDays: integer("duration_days"),
  progressPercentage: integer("progress_percentage").default(0),
  totalTasks: integer("total_tasks").default(0),
  lateTasks: integer("late_tasks").default(0),
  issuesCount: integer("issues_count").default(0),
  projectManager: varchar("project_manager", { length: 255 }),
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
  isArchived: boolean("is_archived").default(false).notNull(),
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
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
  archivedBy: integer("archivedBy"),
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
  archivedBy: integer("archivedBy"),
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
 * Payment History - Track individual payments against AR/AP entries
 */
export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  recordType: paymentRecordTypeEnum("record_type").notNull(),
  referenceId: integer("reference_id").notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;

/**
 * Journal Entry Lines - Multi-line journal entries for double-entry accounting
 */
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").notNull(),
  accountId: integer("account_id").notNull(),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = typeof journalEntryLines.$inferInsert;

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
}, (table) => ({
  feedIdIdx: index("feed_comments_feed_id_idx").on(table.feedId),
  userIdIdx: index("feed_comments_user_id_idx").on(table.userId),
}));

export type FeedComment = typeof feedComments.$inferSelect;
export type InsertFeedComment = typeof feedComments.$inferInsert;

export const feedReactions = pgTable("feed_reactions", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id").notNull(),
  userId: integer("user_id").notNull(),
  reaction: varchar("reaction", { length: 20 }).default("like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  feedIdIdx: index("feed_reactions_feed_id_idx").on(table.feedId),
  userFeedIdx: index("feed_reactions_user_feed_idx").on(table.userId, table.feedId),
}));

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

// ============ SCM MODULE - Supply Chain Management ============

/**
 * SCM Enums
 */
export const valuationMethodEnum = pgEnum("valuation_method", ["fifo", "average", "lifo"]);
export const itemTypeEnum = pgEnum("item_type", ["stockable", "service", "consumable"]);
export const salesOrderStatusEnum = pgEnum("sales_order_status", ["draft", "confirmed", "reserved", "partially_shipped", "shipped", "delivered", "cancelled"]);
export const purchaseReceiptStatusEnum = pgEnum("purchase_receipt_status", ["draft", "posted", "cancelled"]);
export const vendorBillStatusEnum = pgEnum("vendor_bill_status", ["draft", "pending_approval", "approved", "paid", "cancelled"]);
export const matchStatusEnum = pgEnum("match_status", ["unmatched", "partial", "matched"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["active", "released", "consumed", "expired"]);
export const scmLedgerDocTypeEnum = pgEnum("scm_ledger_doc_type", ["sales_order", "purchase_receipt", "adjustment", "transfer", "project_consumption", "opening_balance"]);

/**
 * SCM Product Extensions - Additional fields for salesProducts
 * These will be added to the existing salesProducts table
 */
export const scmProductExtensions = pgTable("scm_product_extensions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().unique(),
  valuationMethod: valuationMethodEnum("valuation_method").default("average"),
  itemType: itemTypeEnum("item_type").default("stockable"),
  dynamicAttributes: text("dynamic_attributes"), // JSON for Size/Color variants
  linkedExpenseAccountId: integer("linked_expense_account_id"),
  linkedIncomeAccountId: integer("linked_income_account_id"),
  leadTimeDays: integer("lead_time_days").default(0),
  orderCost: decimal("order_cost", { precision: 15, scale: 2 }).default("0"), // For EOQ calculation
  holdingCostPercent: decimal("holding_cost_percent", { precision: 5, scale: 2 }).default("0"), // Annual % of item value
  annualDemand: decimal("annual_demand", { precision: 15, scale: 2 }).default("0"), // For EOQ calculation
  safetyStock: decimal("safety_stock", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ScmProductExtension = typeof scmProductExtensions.$inferSelect;
export type InsertScmProductExtension = typeof scmProductExtensions.$inferInsert;

/**
 * SCM Inventory Ledger - Perpetual Inventory Tracking
 * Every stock move is recorded as a ledger entry
 * Current stock = SUM(qty_change) per item/warehouse
 */
export const scmInventoryLedger = pgTable("scm_inventory_ledger", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  qtyChange: decimal("qty_change", { precision: 15, scale: 4 }).notNull(), // +/- quantity
  valuationRate: decimal("valuation_rate", { precision: 15, scale: 4 }).notNull(),
  valuationAmount: decimal("valuation_amount", { precision: 15, scale: 2 }).notNull(),
  batchNo: varchar("batch_no", { length: 100 }),
  serialNo: varchar("serial_no", { length: 100 }),
  projectId: integer("project_id"), // For project costing - WBS allocation
  referenceDocType: scmLedgerDocTypeEnum("reference_doc_type").notNull(),
  referenceDocId: integer("reference_doc_id"),
  notes: text("notes"),
  performedBy: integer("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScmInventoryLedger = typeof scmInventoryLedger.$inferSelect;
export type InsertScmInventoryLedger = typeof scmInventoryLedger.$inferInsert;

/**
 * Sales Orders - ATP (Available to Promise) Ready
 */
export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  soNumber: varchar("so_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id"),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  projectId: integer("project_id"), // Link to project for project sales
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: salesOrderStatusEnum("status").default("draft"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
  shippingCost: decimal("shipping_cost", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BDT"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  warehouseId: integer("warehouse_id"), // Default fulfillment warehouse
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

/**
 * Sales Order Items - Line items with ATP tracking
 */
export const salesOrderItems = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  salesOrderId: integer("sales_order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  reservedQty: decimal("reserved_qty", { precision: 15, scale: 4 }).default("0"),
  shippedQty: decimal("shipped_qty", { precision: 15, scale: 4 }).default("0"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }).notNull(),
  warehouseId: integer("warehouse_id"), // Override warehouse per line
  atpDate: date("atp_date"), // Calculated available-to-promise date
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;

/**
 * Purchase Receipts (GRN - Goods Received Note)
 * Links to Purchase Order for 3-Way Matching
 */
export const purchaseReceipts = pgTable("purchase_receipts", {
  id: serial("id").primaryKey(),
  grnNumber: varchar("grn_number", { length: 50 }).notNull().unique(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  receivedDate: date("received_date").notNull(),
  status: purchaseReceiptStatusEnum("status").default("draft"),
  notes: text("notes"),
  receivedBy: integer("received_by"),
  postedAt: timestamp("posted_at"),
  postedBy: integer("posted_by"),
  isArchived: boolean("is_archived").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PurchaseReceipt = typeof purchaseReceipts.$inferSelect;
export type InsertPurchaseReceipt = typeof purchaseReceipts.$inferInsert;

/**
 * Purchase Receipt Items - Line items received
 */
export const purchaseReceiptItems = pgTable("purchase_receipt_items", {
  id: serial("id").primaryKey(),
  purchaseReceiptId: integer("purchase_receipt_id").notNull(),
  purchaseOrderItemId: integer("purchase_order_item_id"),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  qtyOrdered: decimal("qty_ordered", { precision: 15, scale: 4 }).notNull(),
  qtyReceived: decimal("qty_received", { precision: 15, scale: 4 }).notNull(),
  qtyRejected: decimal("qty_rejected", { precision: 15, scale: 4 }).default("0"),
  valuationRate: decimal("valuation_rate", { precision: 15, scale: 4 }).notNull(),
  valuationAmount: decimal("valuation_amount", { precision: 15, scale: 2 }).notNull(),
  batchNo: varchar("batch_no", { length: 100 }),
  serialNo: varchar("serial_no", { length: 100 }),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PurchaseReceiptItem = typeof purchaseReceiptItems.$inferSelect;
export type InsertPurchaseReceiptItem = typeof purchaseReceiptItems.$inferInsert;

/**
 * Vendor Bills - For 3-Way Matching (PO -> GRN -> Bill)
 */
export const vendorBills = pgTable("vendor_bills", {
  id: serial("id").primaryKey(),
  billNumber: varchar("bill_number", { length: 100 }).notNull(),
  vendorId: integer("vendor_id").notNull(),
  purchaseOrderId: integer("purchase_order_id"),
  purchaseReceiptId: integer("purchase_receipt_id"),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: vendorBillStatusEnum("status").default("draft"),
  matchStatus: matchStatusEnum("match_status").default("unmatched"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BDT"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  paymentDate: date("payment_date"),
  paymentReference: varchar("payment_reference", { length: 100 }),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file URLs
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  isArchived: boolean("is_archived").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VendorBill = typeof vendorBills.$inferSelect;
export type InsertVendorBill = typeof vendorBills.$inferInsert;

/**
 * Vendor Bill Items - Line items on the bill
 */
export const vendorBillItems = pgTable("vendor_bill_items", {
  id: serial("id").primaryKey(),
  vendorBillId: integer("vendor_bill_id").notNull(),
  purchaseReceiptItemId: integer("purchase_receipt_item_id"),
  productId: integer("product_id"),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VendorBillItem = typeof vendorBillItems.$inferSelect;
export type InsertVendorBillItem = typeof vendorBillItems.$inferInsert;

/**
 * Stock Reservations - For ATP (Available to Promise)
 * Reserves stock for Sales Orders without deducting until shipment
 */
export const stockReservations = pgTable("stock_reservations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  salesOrderId: integer("sales_order_id").notNull(),
  salesOrderItemId: integer("sales_order_item_id").notNull(),
  reservedQty: decimal("reserved_qty", { precision: 15, scale: 4 }).notNull(),
  status: reservationStatusEnum("status").default("active"),
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  releasedAt: timestamp("released_at"),
  releasedBy: integer("released_by"),
  consumedAt: timestamp("consumed_at"),
  notes: text("notes"),
  createdBy: integer("created_by"),
});

export type StockReservation = typeof stockReservations.$inferSelect;
export type InsertStockReservation = typeof stockReservations.$inferInsert;

/**
 * SCM Replenishment Requests - Auto-generated when stock falls below reorder point
 */
export const replenishmentRequests = pgTable("replenishment_requests", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  currentStock: decimal("current_stock", { precision: 15, scale: 4 }).notNull(),
  reorderPoint: decimal("reorder_point", { precision: 15, scale: 4 }).notNull(),
  suggestedQty: decimal("suggested_qty", { precision: 15, scale: 4 }).notNull(), // EOQ calculated
  eoqCalculation: text("eoq_calculation"), // JSON with calculation details
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, converted_to_po
  purchaseOrderId: integer("purchase_order_id"), // If converted to PO
  notes: text("notes"),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReplenishmentRequest = typeof replenishmentRequests.$inferSelect;
export type InsertReplenishmentRequest = typeof replenishmentRequests.$inferInsert;

/**
 * Project WBS (Work Breakdown Structure) - For Project Costing
 */
export const projectWbs = pgTable("project_wbs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  wbsCode: varchar("wbs_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentWbsId: integer("parent_wbs_id"), // For hierarchical WBS
  budgetAmount: decimal("budget_amount", { precision: 15, scale: 2 }).default("0"),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProjectWbs = typeof projectWbs.$inferSelect;
export type InsertProjectWbs = typeof projectWbs.$inferInsert;

/**
 * Project Material Consumption - Track inventory consumed for projects
 */
export const projectMaterialConsumption = pgTable("project_material_consumption", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  wbsId: integer("wbs_id"),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  valuationRate: decimal("valuation_rate", { precision: 15, scale: 4 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  ledgerEntryId: integer("ledger_entry_id"), // Link to scmInventoryLedger
  consumptionDate: date("consumption_date").notNull(),
  notes: text("notes"),
  performedBy: integer("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectMaterialConsumption = typeof projectMaterialConsumption.$inferSelect;
export type InsertProjectMaterialConsumption = typeof projectMaterialConsumption.$inferInsert;

/**
 * ============================================
 * Phase 1 SCM Upgrade - New Tables
 * ============================================
 */

export const rfqTypeEnum = pgEnum("rfq_type", ["standard", "emergency", "framework"]);
export const rfqStatusEnum = pgEnum("rfq_status", ["draft", "sent", "responses_received", "evaluated", "closed"]);
export const rfqResponseStatusEnum = pgEnum("rfq_response_status", ["received", "evaluated", "accepted", "rejected"]);
export const shipmentTypeEnum = pgEnum("shipment_type", ["inbound", "outbound", "transfer"]);
export const shipmentStatusEnum = pgEnum("shipment_status", ["pending", "picked", "packed", "shipped", "in_transit", "delivered", "exception"]);
export const warehouseTypeEnum = pgEnum("warehouse_type", ["hq", "project_site", "distribution", "returns"]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);
export const abcClassEnum = pgEnum("abc_class", ["A", "B", "C"]);
export const xyzClassEnum = pgEnum("xyz_class", ["X", "Y", "Z"]);
export const lotQualityEnum = pgEnum("lot_quality", ["accepted", "quarantine", "rejected"]);

/**
 * RFQ (Request for Quotation) - Send RFQs to multiple vendors and compare bids
 */
export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  rfqNumber: varchar("rfq_number", { length: 50 }).notNull().unique(),
  rfqType: rfqTypeEnum("rfq_type").default("standard"),
  status: rfqStatusEnum("status").default("draft"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  requiredDeliveryDate: date("required_delivery_date"),
  totalEstimatedValue: decimal("total_estimated_value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("BDT"),
  notes: text("notes"),
  closingDate: date("closing_date"),
  isArchived: boolean("is_archived").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = typeof rfqs.$inferInsert;

/**
 * RFQ Lines - Individual items requested in an RFQ
 */
export const rfqLines = pgTable("rfq_lines", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  productId: integer("product_id"),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unitOfMeasure: varchar("unit_of_measure", { length: 50 }),
  estimatedUnitPrice: decimal("estimated_unit_price", { precision: 15, scale: 2 }),
  specifications: text("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RFQLine = typeof rfqLines.$inferSelect;
export type InsertRFQLine = typeof rfqLines.$inferInsert;

/**
 * RFQ Responses - Vendor responses to RFQs
 */
export const rfqResponses = pgTable("rfq_responses", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  responseDate: date("response_date").notNull(),
  validityDays: integer("validity_days"),
  totalQuotedValue: decimal("total_quoted_value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("BDT"),
  paymentTerms: varchar("payment_terms", { length: 200 }),
  deliveryDays: integer("delivery_days"),
  notes: text("notes"),
  status: rfqResponseStatusEnum("status").default("received"),
  evaluationScore: decimal("evaluation_score", { precision: 5, scale: 2 }),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RFQResponse = typeof rfqResponses.$inferSelect;
export type InsertRFQResponse = typeof rfqResponses.$inferInsert;

/**
 * Vendor Bids - Line-level pricing from vendor responses
 */
export const vendorBidsTable = pgTable("vendor_bids", {
  id: serial("id").primaryKey(),
  rfqResponseId: integer("rfq_response_id").notNull(),
  rfqLineId: integer("rfq_line_id").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }),
  deliveryDays: integer("delivery_days"),
  qualityGuarantee: text("quality_guarantee"),
  paymentTerms: varchar("payment_terms", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VendorBid = typeof vendorBidsTable.$inferSelect;
export type InsertVendorBid = typeof vendorBidsTable.$inferInsert;

/**
 * Shipments - Track inbound/outbound shipments
 */
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  shipmentNumber: varchar("shipment_number", { length: 50 }).notNull().unique(),
  shipmentType: shipmentTypeEnum("shipment_type").notNull(),
  sourceWarehouseId: integer("source_warehouse_id"),
  destinationWarehouseId: integer("destination_warehouse_id"),
  customerId: integer("customer_id"),
  vendorId: integer("vendor_id"),
  purchaseOrderId: integer("purchase_order_id"),
  salesOrderId: integer("sales_order_id"),
  shipmentDate: date("shipment_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: shipmentStatusEnum("status").default("pending"),
  logisticsProvider: varchar("logistics_provider", { length: 200 }),
  trackingNumber: varchar("tracking_number", { length: 200 }),
  freightCost: decimal("freight_cost", { precision: 15, scale: 2 }).default("0"),
  insuranceCost: decimal("insurance_cost", { precision: 15, scale: 2 }).default("0"),
  totalWeightKg: decimal("total_weight_kg", { precision: 10, scale: 2 }),
  notes: text("notes"),
  isArchived: boolean("is_archived").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * Shipment Lines - Items in a shipment
 */
export const shipmentLines = pgTable("shipment_lines", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  weightKg: decimal("weight_kg", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ShipmentLine = typeof shipmentLines.$inferSelect;
export type InsertShipmentLine = typeof shipmentLines.$inferInsert;

/**
 * Shipment Tracking Events - Status updates for shipments
 */
export const shipmentTracking = pgTable("shipment_tracking", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  trackingEvent: varchar("tracking_event", { length: 200 }).notNull(),
  eventLocation: varchar("event_location", { length: 500 }),
  eventTimestamp: timestamp("event_timestamp").notNull(),
  eventDescription: text("event_description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ShipmentTrackingEvent = typeof shipmentTracking.$inferSelect;
export type InsertShipmentTrackingEvent = typeof shipmentTracking.$inferInsert;

/**
 * Supplier Risk Scores - Rule-based risk assessment for vendors
 */
export const supplierRiskScores = pgTable("supplier_risk_scores", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  priceCompetitiveness: decimal("price_competitiveness", { precision: 5, scale: 2 }),
  responsiveness: decimal("responsiveness", { precision: 5, scale: 2 }),
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }),
  assessmentDate: date("assessment_date").notNull(),
  notes: text("notes"),
  assessedBy: integer("assessed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupplierRiskScore = typeof supplierRiskScores.$inferSelect;
export type InsertSupplierRiskScore = typeof supplierRiskScores.$inferInsert;

/**
 * Inventory Lots - Batch/lot tracking for products
 */
export const inventoryLots = pgTable("inventory_lots", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  lotNumber: varchar("lot_number", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  manufactureDate: date("manufacture_date"),
  expiryDate: date("expiry_date"),
  supplierBatchNumber: varchar("supplier_batch_number", { length: 100 }),
  qualityStatus: lotQualityEnum("quality_status").default("accepted"),
  locationInWarehouse: varchar("location_in_warehouse", { length: 200 }),
  purchaseReceiptId: integer("purchase_receipt_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryLot = typeof inventoryLots.$inferSelect;
export type InsertInventoryLot = typeof inventoryLots.$inferInsert;

/**
 * Supply Chain Audit Trail - Hash-based immutable records (blockchain equivalent)
 */
export const scmAuditTrail = pgTable("scm_audit_trail", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  dataSnapshot: text("data_snapshot").notNull(),
  dataHash: varchar("data_hash", { length: 64 }).notNull(),
  previousHash: varchar("previous_hash", { length: 64 }),
  performedBy: integer("performed_by"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScmAuditTrail = typeof scmAuditTrail.$inferSelect;
export type InsertScmAuditTrail = typeof scmAuditTrail.$inferInsert;
