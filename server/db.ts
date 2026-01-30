import { eq, and, gte, lte, desc, asc, sql, isNull, lt, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
let _pool: pg.Pool | null = null;
import {
  attachments, Attachment, InsertAttachment,
  modulePermissions, ModulePermission, InsertModulePermission,
  users, InsertUser,
  accountsReceivable, InsertAccountsReceivable,
  accountsPayable, InsertAccountsPayable,
  sales, InsertSales,
  dailySales,
  weeklySalesTargets,
  monthlySalesTargets,
  projects, InsertProject,
  customers, InsertCustomer,
  customerInteractions, InsertCustomerInteraction,
  crmLeads, InsertCrmLead,
  crmOpportunities, InsertCrmOpportunity,
  crmActivities, InsertCrmActivity,
  crmTasks, InsertCrmTask,
  teamMembers, InsertTeamMember,
  attendance, InsertAttendance,
  leaveRequests, InsertLeaveRequest,
  ideaNotes, InsertIdeaNote,
  dashboardInsights, InsertDashboardInsight,
  notificationLog, InsertNotificationLog,
  salesProducts, InsertSalesProduct,
  salesTracking, InsertSalesTracking,
  projectTransactions, InsertProjectTransaction,
  incomeExpenditure, InsertIncomeExpenditure,
  actionTracker, InsertActionTracker,
  tenderQuotation, InsertTenderQuotation,
  quotationItems, InsertQuotationItem,
  transactionTypes, InsertTransactionType,
  departments, InsertDepartment,
  positions, InsertPosition,
  employees, InsertEmployee,
  attendanceRecords, InsertAttendanceRecord,
  leaveBalances, InsertLeaveBalance,
  leaveApplications, InsertLeaveApplication,
  performanceReviews, InsertPerformanceReview,
  budgets, InsertBudget,
  jobDescriptions,
  employeeRoles,
  employeeConfidential,
  auditLogs, InsertAuditLog,
  securitySettings, InsertSecuritySetting,
  loginAttempts, InsertLoginAttempt,
  blockedIPs, InsertBlockedIP,
  userSessions, InsertUserSession,
  displayPreferences, InsertDisplayPreference,
  commissionRates, InsertCommissionRate,
  commissionTiers, InsertCommissionTier,
  commissionHistory, InsertCommissionHistory,
  commissionTransactions, InsertCommissionTransaction,
  commissionPayouts, InsertCommissionPayout,
  productCategories, InsertProductCategory,
  productUnits, InsertProductUnit,
  productBrands, InsertProductBrand,
  productWarranties, InsertProductWarranty,
  sellingPriceGroups, InsertSellingPriceGroup,
  productVariations, InsertProductVariation,
  warehouses, InsertWarehouse,
  productInventory, InsertProductInventory,
  inventoryTransactions, InsertInventoryTransaction,
  vendors, InsertVendor,
  purchaseOrders, InsertPurchaseOrder,
  purchaseOrderItems, InsertPurchaseOrderItem,
  financialAccounts, InsertFinancialAccount,
  journalEntries, InsertJournalEntry,
  aiConversations, InsertAIConversation,
  aiMessages, InsertAIMessage,
  aiIntegrationSettings, InsertAIIntegrationSetting,
} from "../drizzle/schema";
const ENV = { ownerOpenId: process.env.OWNER_OPEN_ID || '' };

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    // Set owner as admin, preserve existing roles for others
    if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    } else if (user.role === undefined) {
      // New users default to viewer
      values.role = 'viewer';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Accounts Receivable ============
export async function createAR(data: InsertAccountsReceivable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accountsReceivable).values(data).returning({ id: accountsReceivable.id });
  return result[0];
}

export async function getAllAR() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(accountsReceivable).orderBy(desc(accountsReceivable.dueDate));
}

export async function updateAR(id: number, data: Partial<InsertAccountsReceivable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(accountsReceivable).set(data).where(eq(accountsReceivable.id, id));
}

export async function deleteAR(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(accountsReceivable).where(eq(accountsReceivable.id, id));
}

export async function getARById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(accountsReceivable).where(eq(accountsReceivable.id, id));
  return result[0] || null;
}

export async function getARSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    total: sql<number>`COALESCE(SUM(${accountsReceivable.amount}), 0)`,
    overdue: sql<number>`COALESCE(SUM(CASE WHEN ${accountsReceivable.status} = 'overdue' THEN ${accountsReceivable.amount} ELSE 0 END), 0)`,
    pending: sql<number>`COALESCE(SUM(CASE WHEN ${accountsReceivable.status} = 'pending' THEN ${accountsReceivable.amount} ELSE 0 END), 0)`,
  }).from(accountsReceivable);
  
  return result[0] || { total: 0, overdue: 0, pending: 0 };
}

export async function getOverdueAR(daysOverdue: number = 90) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
  
  return await db
    .select()
    .from(accountsReceivable)
    .where(
      and(
        lte(accountsReceivable.dueDate, cutoffDate),
        ne(accountsReceivable.status, "paid")
      )
    )
    .orderBy(accountsReceivable.dueDate);
}

// ============ Accounts Payable ============
export async function createAP(data: InsertAccountsPayable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(accountsPayable).values(data);
}

export async function getAllAP() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(accountsPayable).orderBy(desc(accountsPayable.dueDate));
}

export async function updateAP(id: number, data: Partial<InsertAccountsPayable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(accountsPayable).set(data).where(eq(accountsPayable.id, id));
}

export async function deleteAP(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(accountsPayable).where(eq(accountsPayable.id, id));
}

export async function getAPSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    total: sql<number>`COALESCE(SUM(${accountsPayable.amount}), 0)`,
    overdue: sql<number>`COALESCE(SUM(CASE WHEN ${accountsPayable.status} = 'overdue' THEN ${accountsPayable.amount} ELSE 0 END), 0)`,
    pending: sql<number>`COALESCE(SUM(CASE WHEN ${accountsPayable.status} = 'pending' THEN ${accountsPayable.amount} ELSE 0 END), 0)`,
  }).from(accountsPayable);
  
  return result[0] || { total: 0, overdue: 0, pending: 0 };
}

// ============ Sales ============
export async function createSale(data: InsertSales) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(sales).values(data);
}

export async function getSalesByMonth(monthYear: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(sales).where(eq(sales.monthYear, monthYear)).orderBy(asc(sales.weekNumber));
}

export async function updateSale(id: number, data: Partial<InsertSales>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(sales).set(data).where(eq(sales.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(sales).where(eq(sales.id, id));
}

export async function getSalesSummary(monthYear: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    productType: sales.productType,
    totalTarget: sql<number>`COALESCE(SUM(${sales.target}), 0)`,
    totalActual: sql<number>`COALESCE(SUM(${sales.actual}), 0)`,
  }).from(sales).where(eq(sales.monthYear, monthYear)).groupBy(sales.productType);
  
  return result;
}

// ============ Projects ============
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(projects).values(data).returning({ id: projects.id });
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectsByStage(stage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(projects).where(eq(projects.stage, stage as any)).orderBy(desc(projects.createdAt));
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    stage: projects.stage,
    count: sql<number>`COUNT(*)`,
    totalValue: sql<number>`COALESCE(SUM(${projects.value}), 0)`,
  }).from(projects).groupBy(projects.stage);
  
  return result;
}

// ============ Customers ============
export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(customers).values(data);
}

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(customers).orderBy(desc(customers.lastContactDate));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(customers).where(eq(customers.id, id));
}

export async function getCustomerStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    status: customers.status,
    count: sql<number>`COUNT(*)`,
  }).from(customers).groupBy(customers.status);
  
  return result;
}

// ============ Customer Interactions ============
export async function createInteraction(data: InsertCustomerInteraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(customerInteractions).values(data);
}

export async function getInteractionsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(customerInteractions).where(eq(customerInteractions.customerId, customerId)).orderBy(desc(customerInteractions.interactionDate));
}

// ============ Team Members ============
export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(teamMembers).values(data);
}

export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Return all team members without status filter (status column may not exist in unmigrated schema)
  return await db.select().from(teamMembers);
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
}

// ============ Attendance ============
export async function createAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(attendance).values(data);
}

export async function getAttendanceByMonth(year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  return await db.select().from(attendance)
    .where(sql`${attendance.date} >= ${startDate} AND ${attendance.date} <= ${endDate}`)
    .orderBy(asc(attendance.date));
}

export async function updateAttendance(id: number, data: Partial<InsertAttendance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(attendance).set(data).where(eq(attendance.id, id));
}

// ============ Leave Requests ============
export async function createLeaveRequest(data: InsertLeaveRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(leaveRequests).values(data);
}

export async function getAllLeaveRequests() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
}

export async function updateLeaveRequest(id: number, data: Partial<InsertLeaveRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id));
}

// ============ Idea Notes ============
export async function createIdeaNote(data: InsertIdeaNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(ideaNotes).values(data);
}

export async function getAllIdeaNotes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(ideaNotes).orderBy(desc(ideaNotes.createdAt));
}

export async function updateIdeaNote(id: number, data: Partial<InsertIdeaNote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(ideaNotes).set(data).where(eq(ideaNotes.id, id));
}

export async function deleteIdeaNote(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ideaNotes).where(eq(ideaNotes.id, id));
}

// ============ Sales Tracking Functions ============

export async function getAllSalesProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesProducts).where(eq(salesProducts.isActive, 1));
}

export async function createSalesProduct(data: InsertSalesProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(salesProducts).values(data);
}

export async function updateSalesProduct(id: number, data: Partial<InsertSalesProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesProducts).set(data).where(eq(salesProducts.id, id));
}

export async function deleteSalesProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesProducts).set({ isActive: 0 }).where(eq(salesProducts.id, id));
}

export async function getAllSalesTracking() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesTracking).orderBy(desc(salesTracking.weekStartDate));
}

export async function getSalesTrackingByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(salesTracking)
    .where(and(gte(salesTracking.weekStartDate, startDate), lte(salesTracking.weekEndDate, endDate)))
    .orderBy(desc(salesTracking.weekStartDate));
}

export async function createSalesTracking(data: InsertSalesTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(salesTracking).values(data);
}

export async function updateSalesTracking(id: number, data: Partial<InsertSalesTracking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesTracking).set(data).where(eq(salesTracking.id, id));
}

export async function deleteSalesTracking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(salesTracking).where(eq(salesTracking.id, id));
}

export async function getSalesPerformanceSummary() {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      productId: salesTracking.productId,
      totalTarget: sql<string>`SUM(${salesTracking.target})`,
      totalActual: sql<string>`SUM(${salesTracking.actual})`,
      achievementRate: sql<string>`(SUM(${salesTracking.actual}) / SUM(${salesTracking.target})) * 100`,
    })
    .from(salesTracking)
    .groupBy(salesTracking.productId);
  
  return results;
}
// ============ Dashboard Insights ============
export async function createInsight(data: InsertDashboardInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(dashboardInsights).values(data);
}

export async function getRecentInsights(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(dashboardInsights).orderBy(desc(dashboardInsights.generatedAt)).limit(limit);
}

// ============ Notification Log ============
export async function logNotification(data: InsertNotificationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notificationLog).values(data);
}

export async function getRecentNotifications(limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(notificationLog).orderBy(desc(notificationLog.sentAt)).limit(limit);
}


// ============ User Management Functions ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "manager" | "viewer" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, userId));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserWithPassword(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function createUserWithPassword(data: { name: string; email: string; password: string; role: "admin" | "manager" | "viewer" | "user" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(data.password, 10);
  const result = await db.insert(users).values({
    openId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: data.name,
    email: data.email,
    loginMethod: "email",
    passwordHash,
    role: data.role,
  }).returning();
  return result[0];
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values(user);
}


// ============ Settings Module ============
import { systemSettings, InsertSystemSetting } from "../drizzle/schema";

export async function getAllSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(systemSettings);
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result[0];
}

export async function upsertSetting(data: InsertSystemSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettingByKey(data.settingKey);
  
  if (existing) {
    return await db.update(systemSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(systemSettings.settingKey, data.settingKey));
  } else {
    return await db.insert(systemSettings).values(data);
  }
}


// ============ Enhanced Sales Module ============
export async function createDailySale(sale: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dailySales).values({
    date: new Date(sale.date),
    productId: sale.productId,
    productName: sale.productName,
    quantity: parseFloat(sale.quantity),
    unitPrice: parseFloat(sale.unitPrice),
    totalAmount: parseFloat(sale.totalAmount),
    salespersonId: sale.salespersonId,
    salespersonName: sale.salespersonName,
    customerName: sale.customerName || null,
    notes: sale.notes || null,
    createdBy: sale.createdBy,
  } as any);
  return result;
}

export async function getAllSales() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dailySales).orderBy(desc(dailySales.date));
}

export async function getDailySales(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailySales)
    .where(
      and(
        sql`${dailySales.date} >= ${startDate} AND ${dailySales.date} <= ${endDate}`,
        eq(dailySales.isArchived, false)
      )
    )
    .orderBy(desc(dailySales.date));
}

export async function updateDailySale(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailySales).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(dailySales.id, id));
}

export async function archiveDailySale(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailySales).set({
    isArchived: true,
    archivedAt: new Date(),
    archivedBy: userId,
    updatedAt: new Date(),
  }).where(eq(dailySales.id, id));
}

export async function getArchivedDailySales(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailySales)
    .where(
      and(
        sql`${dailySales.date} >= ${startDate} AND ${dailySales.date} <= ${endDate}`,
        eq(dailySales.isArchived, true)
      )
    )
    .orderBy(desc(dailySales.date));
}

export async function getAllArchivedDailySales() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailySales)
    .where(eq(dailySales.isArchived, true))
    .orderBy(desc(dailySales.date));
}

export async function restoreDailySale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailySales).set({
    isArchived: false,
    archivedAt: null,
    archivedBy: null,
    updatedAt: new Date(),
  }).where(eq(dailySales.id, id));
}

export async function permanentlyDeleteDailySale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dailySales).where(eq(dailySales.id, id));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(salesProducts).where(eq(salesProducts.id, productId)).limit(1);
  return result[0] || null;
}

export async function createWeeklyTarget(target: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(weeklySalesTargets).values(target).returning();
  return result[0];
}

export async function getWeeklyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(weeklySalesTargets)
    .where(isNull(weeklySalesTargets.archivedAt))
    .orderBy(desc(weeklySalesTargets.weekStartDate));
}

export async function createMonthlyTarget(target: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(monthlySalesTargets).values(target).returning();
  return result[0];
}

export async function getMonthlyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(monthlySalesTargets)
    .where(isNull(monthlySalesTargets.archivedAt))
    .orderBy(desc(monthlySalesTargets.year), desc(monthlySalesTargets.month));
}

export async function updateWeeklyTarget(id: number, data: { targetAmount?: string; salespersonId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(weeklySalesTargets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(weeklySalesTargets.id, id));
}

export async function deleteWeeklyTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(weeklySalesTargets).where(eq(weeklySalesTargets.id, id));
}

export async function archiveWeeklyTarget(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(weeklySalesTargets).set({
    archivedAt: new Date(),
    archivedBy: userId,
    updatedAt: new Date(),
  }).where(eq(weeklySalesTargets.id, id));
}

export async function getArchivedWeeklyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(weeklySalesTargets)
    .where(sql`"archivedAt" IS NOT NULL`)
    .orderBy(desc(weeklySalesTargets.archivedAt));
}

export async function restoreWeeklyTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(weeklySalesTargets).set({
    archivedAt: null,
    archivedBy: null,
    updatedAt: new Date(),
  }).where(eq(weeklySalesTargets.id, id));
}

export async function updateMonthlyTarget(id: number, data: { targetAmount?: string; salespersonId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(monthlySalesTargets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(monthlySalesTargets.id, id));
}

export async function deleteMonthlyTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(monthlySalesTargets).where(eq(monthlySalesTargets.id, id));
}

export async function archiveMonthlyTarget(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(monthlySalesTargets).set({
    archivedAt: new Date(),
    archivedBy: userId,
    updatedAt: new Date(),
  }).where(eq(monthlySalesTargets.id, id));
}

export async function getArchivedMonthlyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(monthlySalesTargets)
    .where(sql`"archivedAt" IS NOT NULL`)
    .orderBy(desc(monthlySalesTargets.archivedAt));
}

export async function restoreMonthlyTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(monthlySalesTargets).set({
    archivedAt: null,
    archivedBy: null,
    updatedAt: new Date(),
  }).where(eq(monthlySalesTargets.id, id));
}

export async function getSalespeople() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all active employees to display as salespeople
  return await db.select({
    id: employees.id,
    name: users.name,
    email: users.email,
    status: employees.status,
  })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.status, "active"))
    .orderBy(asc(users.name));
}

export async function createSalesperson(person: any) {
  // Salespeople are created as employees in the HR module
  // This function is deprecated - use createEmployee instead
  throw new Error("Use createEmployee in HR module to add salespeople");
}


// ===== Project Financial Transactions =====
export async function createProjectTransaction(transaction: InsertProjectTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projectTransactions).values(transaction).returning({ id: projectTransactions.id });
  return result[0]?.id;
}

export async function getProjectTransactions(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projectTransactions)
    .where(eq(projectTransactions.projectId, projectId))
    .orderBy(desc(projectTransactions.transactionDate));
}

export async function getProjectFinancialSummary(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const transactions = await db
    .select()
    .from(projectTransactions)
    .where(eq(projectTransactions.projectId, projectId));
  
  let totalRevenue = 0;
  let totalPurchases = 0;
  let totalExpenses = 0;
  let totalCOGS = 0;
  let totalWACC = 0;
  
  transactions.forEach((t) => {
    const amount = Number(t.amount);
    switch (t.transactionType) {
      case "revenue":
        totalRevenue += amount;
        break;
      case "purchase":
        totalPurchases += amount;
        break;
      case "expense":
        totalExpenses += amount;
        break;
      case "cogs":
        totalCOGS += amount;
        break;
      case "wacc":
        totalWACC += amount;
        break;
    }
  });
  
  const totalCosts = totalPurchases + totalExpenses + totalCOGS + totalWACC;
  const profitLoss = totalRevenue - totalCosts;
  
  return {
    totalRevenue,
    totalPurchases,
    totalExpenses,
    totalCOGS,
    totalWACC,
    totalCosts,
    profitLoss,
    profitMargin: totalRevenue > 0 ? (profitLoss / totalRevenue) * 100 : 0,
  };
}

export async function updateProjectTransaction(id: number, data: Partial<InsertProjectTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projectTransactions).set(data).where(eq(projectTransactions.id, id));
}

export async function deleteProjectTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projectTransactions).where(eq(projectTransactions.id, id));
}

// ============ Income & Expenditure Module ============
export async function createIncomeExpenditure(data: InsertIncomeExpenditure) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(incomeExpenditure).values(data);
  return result;
}

export async function getAllIncomeExpenditure() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(incomeExpenditure).where(eq(incomeExpenditure.isArchived, false)).orderBy(desc(incomeExpenditure.date));
}

export async function getArchivedIncomeExpenditure() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(incomeExpenditure).where(eq(incomeExpenditure.isArchived, true)).orderBy(desc(incomeExpenditure.archivedAt));
}

export async function getIncomeExpenditureByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(incomeExpenditure)
    .where(
      and(
        sql`${incomeExpenditure.date} >= ${startDate}`,
        sql`${incomeExpenditure.date} <= ${endDate}`
      )
    )
    .orderBy(desc(incomeExpenditure.date));
}

export async function getIncomeExpenditureSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db.select().from(incomeExpenditure);
  
  let totalIncome = 0;
  let totalExpenditure = 0;
  
  records.forEach((record) => {
    const amount = Number(record.amount);
    if (record.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenditure += amount;
    }
  });
  
  return {
    totalIncome,
    totalExpenditure,
    netPosition: totalIncome - totalExpenditure,
  };
}

export async function getIncomeByCategory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const incomeRecords = await db
    .select()
    .from(incomeExpenditure)
    .where(eq(incomeExpenditure.type, "income"));
  
  const categoryTotals: Record<string, number> = {};
  
  incomeRecords.forEach((record) => {
    const category = record.category;
    const amount = Number(record.amount);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });
  
  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
  }));
}

export async function getExpenditureByCategory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const expenditureRecords = await db
    .select()
    .from(incomeExpenditure)
    .where(eq(incomeExpenditure.type, "expenditure"));
  
  const categoryTotals: Record<string, number> = {};
  
  expenditureRecords.forEach((record) => {
    const category = record.category;
    const amount = Number(record.amount);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });
  
  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
  }));
}

export async function updateIncomeExpenditure(id: number, data: Partial<InsertIncomeExpenditure>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(incomeExpenditure).set(data).where(eq(incomeExpenditure.id, id));
}

export async function deleteIncomeExpenditure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(incomeExpenditure).where(eq(incomeExpenditure.id, id));
}

export async function archiveIncomeExpenditure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(incomeExpenditure).set({ 
    isArchived: true, 
    archivedAt: new Date() 
  }).where(eq(incomeExpenditure.id, id));
}

export async function restoreIncomeExpenditure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(incomeExpenditure).set({ 
    isArchived: false, 
    archivedAt: null 
  }).where(eq(incomeExpenditure.id, id));
}

export async function permanentlyDeleteIncomeExpenditure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(incomeExpenditure).where(eq(incomeExpenditure.id, id));
}

// ============ Dashboard KPI Analytics ============
export async function getDashboardKPIs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  
  const [allIncomeData, allCustomers, allSales, allQuotations] = await Promise.all([
    db.select().from(incomeExpenditure),
    db.select().from(customers),
    db.select().from(dailySales).where(eq(dailySales.isArchived, false)),
    db.select().from(quotationItems),
  ]);
  
  const totalRevenue = allIncomeData
    .filter(r => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  
  const currentMonthIncome = allIncomeData
    .filter(r => r.type === "income" && new Date(r.date) >= currentMonthStart)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  
  const lastMonthIncome = allIncomeData
    .filter(r => {
      const d = new Date(r.date);
      return r.type === "income" && d >= lastMonthStart && d < currentMonthStart;
    })
    .reduce((sum, r) => sum + Number(r.amount), 0);
  
  const revenueChange = lastMonthIncome > 0
    ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100)
    : (currentMonthIncome > 0 ? 100 : 0);
  
  const activeCustomers = allCustomers.length;
  
  const currentMonthCustomers = allCustomers.filter(c => 
    new Date(c.createdAt) >= currentMonthStart
  ).length;
  const lastMonthCustomers = allCustomers.filter(c => {
    const d = new Date(c.createdAt);
    return d >= lastMonthStart && d < currentMonthStart;
  }).length;
  const customersChange = lastMonthCustomers > 0
    ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers * 100)
    : (currentMonthCustomers > 0 ? 100 : 0);
  
  const totalOrders = allSales.length;
  
  const currentMonthOrders = allSales.filter(s =>
    new Date(s.date) >= currentMonthStart
  ).length;
  const lastMonthOrders = allSales.filter(s => {
    const d = new Date(s.date);
    return d >= lastMonthStart && d < currentMonthStart;
  }).length;
  const ordersChange = lastMonthOrders > 0
    ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100)
    : (currentMonthOrders > 0 ? 100 : 0);
  
  const inventoryValue = allQuotations.reduce((sum, q) => sum + Number(q.finalAmount), 0);
  
  const currentMonthInventory = allQuotations
    .filter(q => new Date(q.createdAt) >= currentMonthStart)
    .reduce((sum, q) => sum + Number(q.finalAmount), 0);
  const lastMonthInventory = allQuotations
    .filter(q => {
      const d = new Date(q.createdAt);
      return d >= lastMonthStart && d < currentMonthStart;
    })
    .reduce((sum, q) => sum + Number(q.finalAmount), 0);
  const inventoryChange = lastMonthInventory > 0
    ? ((currentMonthInventory - lastMonthInventory) / lastMonthInventory * 100)
    : (currentMonthInventory > 0 ? 100 : 0);
  
  return {
    totalRevenue,
    activeCustomers,
    totalOrders,
    inventoryValue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    customersChange: Math.round(customersChange * 10) / 10,
    ordersChange: Math.round(ordersChange * 10) / 10,
    inventoryChange: Math.round(inventoryChange * 10) / 10,
  };
}

export async function getRevenueTrends() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }
  
  const incomeData = await db.select().from(incomeExpenditure);
  
  return months.map(monthStr => {
    const monthLabel = new Date(monthStr + '-01').toLocaleDateString('en-US', { month: 'short' });
    
    const monthRecords = incomeData.filter(r => {
      const recordDate = new Date(r.date).toISOString().slice(0, 7);
      return recordDate === monthStr;
    });
    
    const revenue = monthRecords
      .filter(r => r.type === "income")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const expenses = monthRecords
      .filter(r => r.type === "expenditure")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    return {
      month: monthLabel,
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });
}

export async function getTopProductsSales() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const items = await db.select().from(quotationItems);
  
  const productSales = items.reduce((acc, p) => {
    const desc = p.description || "Unknown Product";
    if (!acc[desc]) {
      acc[desc] = { sales: 0, revenue: 0, cost: 0 };
    }
    acc[desc].sales += Number(p.quantity);
    acc[desc].revenue += Number(p.finalAmount);
    acc[desc].cost += Number(p.amount) - Number(p.discountAmount || 0);
    return acc;
  }, {} as Record<string, { sales: number; revenue: number; cost: number }>);
  
  return Object.entries(productSales)
    .map(([name, data]) => {
      const margin = data.revenue > 0 
        ? Math.round(((data.revenue - data.cost) / data.revenue) * 100)
        : 0;
      return {
        name: name.length > 30 ? name.substring(0, 30) + "..." : name,
        sales: data.sales,
        revenue: data.revenue,
        margin: Math.max(0, Math.min(margin, 100)),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export async function getDepartmentDistribution() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const depts = await db.select().from(departments);
  const emps = await db.select().from(employees).where(eq(employees.status, "active"));
  
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899"];
  
  const deptCounts = depts.map((dept, i) => {
    const count = emps.filter(e => e.departmentId === dept.id).length;
    return {
      name: dept.name,
      value: count,
      color: colors[i % colors.length],
    };
  });
  
  const total = deptCounts.reduce((sum, d) => sum + d.value, 0);
  
  return deptCounts.map(d => ({
    ...d,
    value: total > 0 ? Math.round((d.value / total) * 100) : 0,
  }));
}

// ============ Budget Module ============
export async function createBudget(data: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(budgets).values(data);
  return result;
}

export async function getAllBudgets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(budgets).orderBy(desc(budgets.monthYear));
}

export async function getBudgetsByMonthYear(monthYear: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(budgets).where(eq(budgets.monthYear, monthYear));
}

export async function updateBudget(id: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(budgets).set(data).where(eq(budgets.id, id));
}

export async function deleteBudget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(budgets).where(eq(budgets.id, id));
}


// ============ Action Tracker ============
export async function createActionTracker(data: InsertActionTracker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(actionTracker).values(data);
  return result;
}

export async function getAllActionTrackers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(actionTracker).orderBy(desc(actionTracker.createdAt));
}

export async function getActionTrackersByType(type: "action" | "decision" | "issue" | "opportunity") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(actionTracker).where(eq(actionTracker.type, type)).orderBy(desc(actionTracker.createdAt));
}

export async function getActionTrackerById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(actionTracker).where(eq(actionTracker.id, id)).limit(1);
  return result[0];
}

export async function updateActionTracker(id: number, data: Partial<InsertActionTracker>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(actionTracker).set(data).where(eq(actionTracker.id, id));
}

export async function deleteActionTracker(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(actionTracker).where(eq(actionTracker.id, id));
}

export async function getOpenActionTrackers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(actionTracker)
    .where(eq(actionTracker.status, "open"))
    .orderBy(desc(actionTracker.priority), desc(actionTracker.createdAt));
}


// ============ Tender/Quotation Tracking ============
export async function createTenderQuotation(data: InsertTenderQuotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tenderQuotation).values(data);
  return result;
}

export async function getAllTenderQuotations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Return ALL items (both active and archived) - frontend handles filtering
  return await db.select().from(tenderQuotation)
    .orderBy(desc(tenderQuotation.createdAt));
}

export async function getTenderQuotationsByType(type: "government_tender" | "private_quotation") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(tenderQuotation)
    .where(and(
      eq(tenderQuotation.type, type),
      isNull(tenderQuotation.archivedAt)
    ))
    .orderBy(desc(tenderQuotation.createdAt));
}

export async function getTenderQuotationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(tenderQuotation).where(eq(tenderQuotation.id, id)).limit(1);
  return result[0];
}

export async function updateTenderQuotation(id: number, data: Partial<InsertTenderQuotation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tenderQuotation).set(data).where(eq(tenderQuotation.id, id));
}

export async function deleteTenderQuotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(tenderQuotation).where(eq(tenderQuotation.id, id));
}

export async function archiveTenderQuotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tenderQuotation)
    .set({ archivedAt: new Date() as any })
    .where(eq(tenderQuotation.id, id));
}

export async function getOverdueTenderQuotations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const today = new Date();
  return await db.select().from(tenderQuotation)
    .where(and(
      isNull(tenderQuotation.archivedAt),
      lt(tenderQuotation.followUpDate, today as any)
    ))
    .orderBy(asc(tenderQuotation.followUpDate));
}

export async function getUpcomingTenderQuotations(daysAhead: number = 3) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  return await db.select().from(tenderQuotation)
    .where(and(
      isNull(tenderQuotation.archivedAt),
      gte(tenderQuotation.followUpDate, today as any),
      lte(tenderQuotation.followUpDate, futureDate as any)
    ))
    .orderBy(asc(tenderQuotation.followUpDate));
}


// ============ Transaction Types ============
export async function getAllTransactionTypes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(transactionTypes)
    .where(eq(transactionTypes.isActive, true))
    .orderBy(asc(transactionTypes.name));
}

export async function createTransactionType(data: InsertTransactionType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactionTypes).values(data);
  return result;
}

export async function updateTransactionType(id: number, data: Partial<InsertTransactionType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(transactionTypes).set(data).where(eq(transactionTypes.id, id));
}

export async function deleteTransactionType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if it's a system type
  const type = await db.select().from(transactionTypes).where(eq(transactionTypes.id, id)).limit(1);
  if (type[0]?.isSystem) {
    throw new Error("Cannot delete system transaction type");
  }
  
  // Soft delete by setting isActive to false
  await db.update(transactionTypes).set({ isActive: false }).where(eq(transactionTypes.id, id));
}


// ============ HR Module - Departments ============
export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).orderBy(asc(departments.name));
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(departments).values(data);
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(departments).where(eq(departments.id, id));
}

// ============ HR Module - Positions ============
export async function getAllPositions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(positions).orderBy(asc(positions.title));
}

export async function getPositionsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(positions).where(eq(positions.departmentId, departmentId));
}

export async function createPosition(data: InsertPosition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(positions).values(data);
}

export async function updatePosition(id: number, data: Partial<InsertPosition>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(positions).set(data).where(eq(positions.id, id));
}

export async function deletePosition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(positions).where(eq(positions.id, id));
}

// ============ HR Module - Employees ============
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    employee: employees,
    user: users,
    department: departments,
    position: positions,
  })
  .from(employees)
  .leftJoin(users, eq(employees.userId, users.id))
  .leftJoin(departments, eq(employees.departmentId, departments.id))
  .leftJoin(positions, eq(employees.positionId, positions.id))
  .where(eq(employees.status, 'active'))
  .orderBy(asc(users.name));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    employee: employees,
    user: users,
    department: departments,
    position: positions,
  })
  .from(employees)
  .leftJoin(users, eq(employees.userId, users.id))
  .leftJoin(departments, eq(employees.departmentId, departments.id))
  .leftJoin(positions, eq(employees.positionId, positions.id))
  .where(eq(employees.id, id))
  .limit(1);
  return result[0] || null;
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(employees).values(data);
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(employees).set(data).where(eq(employees.id, id));
}

export async function getEmployeeByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.userId, userId)).limit(1);
  return result[0] || null;
}

// ============ HR Module - Attendance Records ============
export async function getEmployeeAttendanceRecords(employeeId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.employeeId, employeeId),
        sql`${attendanceRecords.date} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${attendanceRecords.date} <= ${endDate.toISOString().split('T')[0]}`
      )
    )
    .orderBy(desc(attendanceRecords.date));
}

export async function createAttendanceRecord(data: InsertAttendanceRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(attendanceRecords).values(data);
}

export async function updateAttendanceRecord(id: number, data: Partial<InsertAttendanceRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(attendanceRecords).set(data).where(eq(attendanceRecords.id, id));
}

// ============ HR Module - Leave Management ============
export async function getLeaveBalancesByEmployee(employeeId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveBalances)
    .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)));
}

export async function createLeaveBalance(data: InsertLeaveBalance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveBalances).values(data);
}

export async function updateLeaveBalance(id: number, data: Partial<InsertLeaveBalance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leaveBalances).set(data).where(eq(leaveBalances.id, id));
}

export async function getLeaveApplicationsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveApplications)
    .where(eq(leaveApplications.employeeId, employeeId))
    .orderBy(desc(leaveApplications.createdAt));
}

export async function getPendingLeaveApplications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    application: leaveApplications,
    employee: employees,
    user: users,
  })
  .from(leaveApplications)
  .leftJoin(employees, eq(leaveApplications.employeeId, employees.id))
  .leftJoin(users, eq(employees.userId, users.id))
  .where(eq(leaveApplications.status, 'pending'))
  .orderBy(asc(leaveApplications.createdAt));
}

export async function createLeaveApplication(data: InsertLeaveApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveApplications).values(data);
}

export async function updateLeaveApplication(id: number, data: Partial<InsertLeaveApplication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leaveApplications).set(data).where(eq(leaveApplications.id, id));
}

// ============ HR Module - Performance Reviews ============
export async function getPerformanceReviewsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(performanceReviews)
    .where(eq(performanceReviews.employeeId, employeeId))
    .orderBy(desc(performanceReviews.reviewDate));
}

export async function createPerformanceReview(data: InsertPerformanceReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(performanceReviews).values(data);
}

export async function updatePerformanceReview(id: number, data: Partial<InsertPerformanceReview>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(performanceReviews).set(data).where(eq(performanceReviews.id, id));
}

// ============ HR Module - Dashboard Stats ============
export async function getHRDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  // Total active employees
  const totalEmployees = await db.select({ count: sql<number>`count(*)` })
    .from(employees)
    .where(eq(employees.status, 'active'));

  // Today's attendance
  const todayAttendance = await db.select({
    status: attendanceRecords.status,
    count: sql<number>`count(*)`
  })
  .from(attendanceRecords)
  .where(sql`${attendanceRecords.date} = ${today}`)
  .groupBy(attendanceRecords.status);

  // Pending leave requests
  const pendingLeaves = await db.select({ count: sql<number>`count(*)` })
    .from(leaveApplications)
    .where(eq(leaveApplications.status, 'pending'));

  // Employees by department
  const employeesByDept = await db.select({
    departmentName: departments.name,
    count: sql<number>`count(*)`
  })
  .from(employees)
  .leftJoin(departments, eq(employees.departmentId, departments.id))
  .where(eq(employees.status, 'active'))
  .groupBy(departments.name);

  return {
    totalEmployees: totalEmployees[0]?.count || 0,
    todayAttendance,
    pendingLeaves: pendingLeaves[0]?.count || 0,
    employeesByDept,
  };
}


// ============ Attachments ============
export async function createAttachmentRecord(data: InsertAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(attachments).values(data);
}

export async function getAttachmentsByEntity(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attachments)
    .where(and(
      eq(attachments.entityType, entityType as any),
      eq(attachments.entityId, entityId)
    ))
    .orderBy(desc(attachments.uploadedAt));
}

export async function deleteAttachmentRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(attachments).where(eq(attachments.id, id));
}


// ============ Module Permissions ============
export async function getUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(modulePermissions).where(eq(modulePermissions.userId, userId));
}

export async function setUserPermission(data: InsertModulePermission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if permission exists
  const existing = await db.select().from(modulePermissions)
    .where(and(
      eq(modulePermissions.userId, data.userId),
      eq(modulePermissions.moduleName, data.moduleName)
    ));
  
  if (existing.length > 0) {
    // Update existing
    await db.update(modulePermissions)
      .set({
        canView: data.canView,
        canCreate: data.canCreate,
        canEdit: data.canEdit,
        canDelete: data.canDelete,
      })
      .where(eq(modulePermissions.id, existing[0].id));
  } else {
    // Insert new
    await db.insert(modulePermissions).values(data);
  }
}

export async function setUserPermissionsBulk(userId: number, permissions: Array<{
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete existing permissions for user
  await db.delete(modulePermissions).where(eq(modulePermissions.userId, userId));
  
  // Insert new permissions
  for (const perm of permissions) {
    await db.insert(modulePermissions).values({
      userId,
      moduleName: perm.moduleName,
      canView: perm.canView,
      canCreate: perm.canCreate,
      canEdit: perm.canEdit,
      canDelete: perm.canDelete,
    });
  }
}

export async function deleteUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(modulePermissions).where(eq(modulePermissions.userId, userId));
}

// Default permissions by role
export function getDefaultPermissionsByRole(role: string) {
  const modules = ['dashboard', 'financial', 'income_expenditure', 'sales', 'projects', 'customers', 'hr', 'action_tracker', 'tender_quotation', 'ideas', 'settings'];
  
  if (role === 'admin') {
    return modules.map(m => ({
      moduleName: m,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    }));
  }
  
  if (role === 'manager') {
    return modules.map(m => ({
      moduleName: m,
      canView: true,
      canCreate: m !== 'settings',
      canEdit: m !== 'settings',
      canDelete: m !== 'settings' && m !== 'hr',
    }));
  }
  
  // viewer role - read only
  return modules.map(m => ({
    moduleName: m,
    canView: m !== 'settings' && m !== 'hr',
    canCreate: false,
    canEdit: false,
    canDelete: false,
  }));
}


// ============ Quotation Items ============
export async function createQuotationItem(data: InsertQuotationItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Convert decimal fields to strings for Drizzle ORM compatibility
  const processedData: any = { ...data };
  if (data.quantity !== undefined) processedData.quantity = String(data.quantity);
  if (data.unitPrice !== undefined) processedData.unitPrice = String(data.unitPrice);
  if (data.amount !== undefined) processedData.amount = String(data.amount);
  if (data.discount !== undefined) processedData.discount = String(data.discount);
  if (data.discountAmount !== undefined) processedData.discountAmount = String(data.discountAmount);
  if (data.finalAmount !== undefined) processedData.finalAmount = String(data.finalAmount);
  return await db.insert(quotationItems).values(processedData);
}

export async function getQuotationItems(quotationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId)).orderBy(asc(quotationItems.sortOrder));
}

export async function updateQuotationItem(id: number, data: Partial<InsertQuotationItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Convert decimal fields to strings for Drizzle ORM compatibility
  const processedData: any = { ...data };
  if (data.quantity !== undefined) processedData.quantity = String(data.quantity);
  if (data.unitPrice !== undefined) processedData.unitPrice = String(data.unitPrice);
  if (data.amount !== undefined) processedData.amount = String(data.amount);
  if (data.discount !== undefined) processedData.discount = String(data.discount);
  if (data.discountAmount !== undefined) processedData.discountAmount = String(data.discountAmount);
  if (data.finalAmount !== undefined) processedData.finalAmount = String(data.finalAmount);
  return await db.update(quotationItems).set(processedData).where(eq(quotationItems.id, id));
}

export async function deleteQuotationItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(quotationItems).where(eq(quotationItems.id, id));
}

export async function getQuotationTotal(quotationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    subtotal: sql<number>`COALESCE(SUM(${quotationItems.amount}), 0)`,
    totalDiscount: sql<number>`COALESCE(SUM(${quotationItems.discountAmount}), 0)`,
    total: sql<number>`COALESCE(SUM(${quotationItems.finalAmount}), 0)`,
  }).from(quotationItems).where(eq(quotationItems.quotationId, quotationId));
  
  return result[0] || { subtotal: 0, totalDiscount: 0, total: 0 };
}


// ============ Job Descriptions ============
export async function createJobDescription(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobDescriptions).values(data);
  return result;
}

export async function getJobDescriptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobDescriptions).orderBy(asc(jobDescriptions.title));
}

export async function getJobDescriptionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id)).limit(1);
  return result[0] || null;
}

export async function updateJobDescription(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(jobDescriptions).set(data).where(eq(jobDescriptions.id, id));
}

export async function deleteJobDescription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(jobDescriptions).where(eq(jobDescriptions.id, id));
}

// ============ Employee Roles ============
export async function createEmployeeRole(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(employeeRoles).values(data);
}

export async function getEmployeeRoles() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employeeRoles).orderBy(asc(employeeRoles.name));
}

export async function getEmployeeRoleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employeeRoles).where(eq(employeeRoles.id, id)).limit(1);
  return result[0] || null;
}

export async function updateEmployeeRole(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(employeeRoles).set(data).where(eq(employeeRoles.id, id));
}

export async function deleteEmployeeRole(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(employeeRoles).where(eq(employeeRoles.id, id));
}

// ============ Employee Confidential Information ============
export async function createEmployeeConfidential(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(employeeConfidential).values(data);
}

export async function getEmployeeConfidential(employeeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employeeConfidential).where(eq(employeeConfidential.employeeId, employeeId)).limit(1);
  return result[0] || null;
}

export async function updateEmployeeConfidential(employeeId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if record exists
  const existing = await getEmployeeConfidential(employeeId);
  if (existing) {
    return await db.update(employeeConfidential).set(data).where(eq(employeeConfidential.employeeId, employeeId));
  } else {
    return await db.insert(employeeConfidential).values({ ...data, employeeId });
  }
}

export async function deleteEmployeeConfidential(employeeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(employeeConfidential).where(eq(employeeConfidential.employeeId, employeeId));
}


// ============ Onboarding Tasks ============
export async function getOnboardingTemplates() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT * FROM onboarding_templates WHERE is_active = true ORDER BY days_from_start ASC, task_category ASC`);
  return (result[0] as unknown) as any[];
}

export async function createOnboardingTemplate(data: { taskName: string; taskCategory: string; description?: string; daysFromStart?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(sql`INSERT INTO onboarding_templates (task_name, task_category, description, days_from_start) VALUES (${data.taskName}, ${data.taskCategory}, ${data.description || null}, ${data.daysFromStart || 0})`);
  return result;
}

export async function deleteOnboardingTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.execute(sql`UPDATE onboarding_templates SET is_active = 0 WHERE id = ${id}`);
}

export async function getOnboardingTasksForEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT * FROM onboarding_tasks WHERE employee_id = ${employeeId} ORDER BY task_category ASC, due_date ASC`);
  return (result[0] as unknown) as any[];
}

export async function createOnboardingTasksFromTemplates(employeeId: number, joinDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const templates = await getOnboardingTemplates();
  
  for (const template of templates) {
    const dueDate = new Date(joinDate);
    dueDate.setDate(dueDate.getDate() + (template.days_from_start || 0));
    
    await db.execute(sql`INSERT INTO onboarding_tasks (employee_id, task_name, task_category, description, due_date) VALUES (${employeeId}, ${template.task_name}, ${template.task_category}, ${template.description}, ${dueDate.toISOString().split('T')[0]})`);
  }
  
  return await getOnboardingTasksForEmployee(employeeId);
}

export async function updateOnboardingTask(taskId: number, data: { completed?: boolean; notes?: string; completedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (data.completed) {
    return await db.execute(sql`UPDATE onboarding_tasks SET completed = ${data.completed}, completed_at = NOW(), completed_by = ${data.completedBy || null}, notes = ${data.notes || null} WHERE id = ${taskId}`);
  } else {
    return await db.execute(sql`UPDATE onboarding_tasks SET completed = ${data.completed || false}, completed_at = NULL, completed_by = NULL, notes = ${data.notes || null} WHERE id = ${taskId}`);
  }
}

export async function addOnboardingTask(employeeId: number, data: { taskName: string; taskCategory: string; description?: string; dueDate?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.execute(sql`INSERT INTO onboarding_tasks (employee_id, task_name, task_category, description, due_date) VALUES (${employeeId}, ${data.taskName}, ${data.taskCategory}, ${data.description || null}, ${data.dueDate || null})`);
}

export async function deleteOnboardingTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.execute(sql`DELETE FROM onboarding_tasks WHERE id = ${taskId}`);
}

export async function getOnboardingProgress(employeeId: number) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, percentage: 0 };
  
  const result = await db.execute(sql`SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed FROM onboarding_tasks WHERE employee_id = ${employeeId}`);
  const row = ((result[0] as unknown) as any[])[0];
  const total = Number(row?.total || 0);
  const completed = Number(row?.completed || 0);
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}


// ============ Audit Logging ============

export async function createAuditLog(data: Omit<InsertAuditLog, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(auditLogs).values(data as InsertAuditLog);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs);
  const conditions = [];
  
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.action) conditions.push(eq(auditLogs.action, filters.action as any));
  if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));
  if (filters?.startDate) conditions.push(gte(auditLogs.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(auditLogs.createdAt, filters.endDate));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
}

export async function getRecentActivity(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    entityType: auditLogs.entityType,
    entityId: auditLogs.entityId,
    entityName: auditLogs.entityName,
    module: auditLogs.module,
    createdAt: auditLogs.createdAt,
    userId: auditLogs.userId,
  })
  .from(auditLogs)
  .orderBy(desc(auditLogs.createdAt))
  .limit(limit);
}



// ============ Security Settings ============
export async function getAllSecuritySettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(securitySettings);
}

export async function getSecuritySetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(securitySettings).where(eq(securitySettings.settingKey, key)).limit(1);
  return result[0] || null;
}

export async function upsertSecuritySetting(data: { settingKey: string; settingValue: string; description?: string; updatedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(securitySettings).where(eq(securitySettings.settingKey, data.settingKey)).limit(1);
  
  if (existing.length > 0) {
    await db.update(securitySettings)
      .set({ settingValue: data.settingValue, description: data.description, updatedBy: data.updatedBy })
      .where(eq(securitySettings.settingKey, data.settingKey));
  } else {
    await db.insert(securitySettings).values(data as InsertSecuritySetting);
  }
}

// ============ Login Attempts ============
export async function getLoginAttempts(limit: number = 100, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(loginAttempts);
  const conditions = [];
  
  if (startDate) conditions.push(gte(loginAttempts.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(loginAttempts.createdAt, new Date(endDate)));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(loginAttempts.createdAt)).limit(limit);
}

export async function recordLoginAttempt(data: InsertLoginAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(loginAttempts).values(data);
}

// ============ Blocked IPs ============
export async function getBlockedIPs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blockedIPs).orderBy(desc(blockedIPs.createdAt));
}

export async function isIPBlocked(ipAddress: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(blockedIPs)
    .where(and(
      eq(blockedIPs.ipAddress, ipAddress),
      sql`(${blockedIPs.expiresAt} IS NULL OR ${blockedIPs.expiresAt} > NOW())`
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function blockIP(data: { ipAddress: string; reason?: string; blockedBy: number; expiresAt?: Date | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(blockedIPs).values({
    ipAddress: data.ipAddress,
    reason: data.reason,
    blockedBy: data.blockedBy,
    expiresAt: data.expiresAt,
  } as InsertBlockedIP);
}

export async function unblockIP(ipAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blockedIPs).where(eq(blockedIPs.ipAddress, ipAddress));
}

// ============ User Sessions ============
export async function getActiveSessions(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    id: userSessions.id,
    odule: userSessions.userId,
    ipAddress: userSessions.ipAddress,
    userAgent: userSessions.userAgent,
    deviceInfo: userSessions.deviceInfo,
    lastActivity: userSessions.lastActivity,
    createdAt: userSessions.createdAt,
    userName: users.name,
    userEmail: users.email,
  })
  .from(userSessions)
  .leftJoin(users, eq(userSessions.userId, users.id))
  .where(and(
    eq(userSessions.isActive, true),
    gte(userSessions.expiresAt, new Date())
  ));
  
  if (userId) {
    query = query.where(and(
      eq(userSessions.isActive, true),
      gte(userSessions.expiresAt, new Date()),
      eq(userSessions.userId, userId)
    )) as any;
  }
  
  return await query.orderBy(desc(userSessions.lastActivity));
}

export async function terminateSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.id, sessionId));
}

export async function terminateAllUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.userId, userId));
}

// ============ Display Preferences ============
export async function getDisplayPreferences(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(displayPreferences)
    .where(sql`${displayPreferences.userId} = ${userId} OR ${displayPreferences.isGlobal} = TRUE`)
    .orderBy(asc(displayPreferences.settingKey));
}

export async function getGlobalDisplayPreferences() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(displayPreferences).where(eq(displayPreferences.isGlobal, true));
}

export async function upsertDisplayPreference(data: { userId: number | null; settingKey: string; settingValue: string; isGlobal: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = data.isGlobal 
    ? and(eq(displayPreferences.settingKey, data.settingKey), eq(displayPreferences.isGlobal, true))
    : and(eq(displayPreferences.settingKey, data.settingKey), eq(displayPreferences.userId, data.userId!));
  
  const existing = await db.select().from(displayPreferences).where(conditions).limit(1);
  
  if (existing.length > 0) {
    await db.update(displayPreferences)
      .set({ settingValue: data.settingValue })
      .where(conditions);
  } else {
    await db.insert(displayPreferences).values(data as InsertDisplayPreference);
  }
}

// ============ User Management (Enhanced) ============
export async function getAllUsersWithDetails() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    loginMethod: users.loginMethod,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(asc(users.name));
}

export async function lockUserAccount(userId: number, lockedUntil: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.execute(sql`UPDATE users SET lockedUntil = ${lockedUntil.toISOString()} WHERE id = ${userId}`);
}

export async function unlockUserAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.execute(sql`UPDATE users SET lockedUntil = NULL, failedLoginAttempts = 0 WHERE id = ${userId}`);
}

export async function forcePasswordChange(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.execute(sql`UPDATE users SET mustChangePassword = TRUE WHERE id = ${userId}`);
}



// ============ Commission Tracking Functions ============

/**
 * Get commission rates for a salesperson
 */
export async function getCommissionRates(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(commissionRates)
    .where(and(
      eq(commissionRates.employeeId, employeeId),
      eq(commissionRates.isActive, true)
    ))
    .orderBy(desc(commissionRates.effectiveFrom));
}

/**
 * Get active commission rate for a salesperson
 */
export async function getActiveCommissionRate(employeeId: number, date?: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const checkDate = date || new Date();
  
  return await db.select().from(commissionRates)
    .where(and(
      eq(commissionRates.employeeId, employeeId),
      eq(commissionRates.isActive, true),
      lte(commissionRates.effectiveFrom, checkDate),
      sql`(${commissionRates.effectiveTo} IS NULL OR ${commissionRates.effectiveTo} >= ${checkDate})`
    ))
    .orderBy(desc(commissionRates.effectiveFrom))
    .limit(1)
    .then(rows => rows[0] || null);
}

/**
 * Get commission tiers for a commission rate
 */
export async function getCommissionTiers(commissionRateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(commissionTiers)
    .where(eq(commissionTiers.commissionRateId, commissionRateId))
    .orderBy(asc(commissionTiers.minAmount));
}

/**
 * Calculate commission for a sale amount based on commission rate
 */
export async function calculateCommission(
  employeeId: number,
  saleAmount: number,
  date?: Date
): Promise<{ rate: number; amount: number } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const commissionRate = await getActiveCommissionRate(employeeId, date);
  if (!commissionRate) return null;
  
  let rate = commissionRate.baseRate;
  
  // If tiered commission, find the appropriate tier
  if (commissionRate.commissionType === "tiered") {
    const tiers = await getCommissionTiers(commissionRate.id);
    for (const tier of tiers) {
      const maxAmount = tier.maxAmount ? Number(tier.maxAmount) : Infinity;
      if (saleAmount >= Number(tier.minAmount) && saleAmount <= maxAmount) {
        rate = tier.commissionPercentage;
        break;
      }
    }
  }
  
  // Calculate commission amount
  let commissionAmount = 0;
  if (commissionRate.commissionType === "percentage" || commissionRate.commissionType === "tiered") {
    commissionAmount = (saleAmount * Number(rate)) / 100;
  } else if (commissionRate.commissionType === "fixed") {
    commissionAmount = Number(rate);
  }
  
  return {
    rate: Number(rate),
    amount: commissionAmount,
  };
}

/**
 * Get commission transactions for a salesperson
 */
export async function getCommissionTransactions(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(commissionTransactions)
    .where(eq(commissionTransactions.employeeId, employeeId))
    .orderBy(desc(commissionTransactions.createdAt))
    .limit(100);
}

/**
 * Get commission history for a salesperson
 */
export async function getCommissionHistory(employeeId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(commissionHistory)
    .where(eq(commissionHistory.employeeId, employeeId))
    .orderBy(desc(commissionHistory.period))
    .limit(limit);
}

/**
 * Calculate monthly commission for a salesperson
 */
export async function calculateMonthlyCommission(employeeId: number, period: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Get all sales for the employee in this period
  const sales = await db.select({
    id: dailySales.id,
    totalAmount: dailySales.totalAmount,
  }).from(dailySales)
    .where(and(
      eq(dailySales.salespersonId, employeeId),
      sql`TO_CHAR(${dailySales.date}::date, 'YYYY-MM') = ${period}`,
      eq(dailySales.isArchived, false)
    ));
  
  let totalSalesAmount = 0;
  let totalCommission = 0;
  
  for (const sale of sales) {
    totalSalesAmount += Number(sale.totalAmount);
    const commission = await calculateCommission(employeeId, Number(sale.totalAmount));
    if (commission) {
      totalCommission += commission.amount;
    }
  }
  
  return {
    totalSalesAmount,
    totalSalesCount: sales.length,
    totalCommission: totalCommission,
  };
}

/**
 * Get commission history for period
 */
export async function getCommissionHistoryForPeriod(period: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(commissionHistory)
    .where(eq(commissionHistory.period, period))
    .orderBy(desc(commissionHistory.commissionAmount));
}

// ============= PRODUCT CATEGORIES =============

export async function getProductCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productCategories)
    .where(eq(productCategories.isActive, true))
    .orderBy(asc(productCategories.name));
}

export async function getAllProductCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productCategories)
    .orderBy(asc(productCategories.name));
}

export async function createProductCategory(data: InsertProductCategory) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(productCategories).values(data).returning();
  return result[0];
}

export async function updateProductCategory(id: number, data: Partial<InsertProductCategory>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(productCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productCategories.id, id))
    .returning();
  return result[0];
}

export async function deleteProductCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productCategories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productCategories.id, id));
}

// ============= PRODUCT UNITS =============

export async function getProductUnits() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productUnits)
    .where(eq(productUnits.isActive, true))
    .orderBy(asc(productUnits.name));
}

export async function getAllProductUnits() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productUnits)
    .orderBy(asc(productUnits.name));
}

export async function createProductUnit(data: InsertProductUnit) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(productUnits).values(data).returning();
  return result[0];
}

export async function updateProductUnit(id: number, data: Partial<InsertProductUnit>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(productUnits)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productUnits.id, id))
    .returning();
  return result[0];
}

export async function deleteProductUnit(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productUnits)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productUnits.id, id));
}

// ============= PRODUCT BRANDS =============

export async function getProductBrands() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productBrands)
    .where(eq(productBrands.isActive, true))
    .orderBy(asc(productBrands.name));
}

export async function getAllProductBrands() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productBrands)
    .orderBy(asc(productBrands.name));
}

export async function createProductBrand(data: InsertProductBrand) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(productBrands).values(data).returning();
  return result[0];
}

export async function updateProductBrand(id: number, data: Partial<InsertProductBrand>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(productBrands)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productBrands.id, id))
    .returning();
  return result[0];
}

export async function deleteProductBrand(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productBrands)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productBrands.id, id));
}

// ============= PRODUCT WARRANTIES =============

export async function getProductWarranties() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productWarranties)
    .where(eq(productWarranties.isActive, true))
    .orderBy(asc(productWarranties.name));
}

export async function getAllProductWarranties() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productWarranties)
    .orderBy(asc(productWarranties.name));
}

export async function createProductWarranty(data: InsertProductWarranty) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(productWarranties).values(data).returning();
  return result[0];
}

export async function updateProductWarranty(id: number, data: Partial<InsertProductWarranty>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(productWarranties)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productWarranties.id, id))
    .returning();
  return result[0];
}

export async function deleteProductWarranty(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productWarranties)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productWarranties.id, id));
}

// ============= SELLING PRICE GROUPS =============

export async function getSellingPriceGroups() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sellingPriceGroups)
    .where(eq(sellingPriceGroups.isActive, true))
    .orderBy(asc(sellingPriceGroups.name));
}

export async function createSellingPriceGroup(data: InsertSellingPriceGroup) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sellingPriceGroups).values(data).returning();
  return result[0];
}

export async function updateSellingPriceGroup(id: number, data: Partial<InsertSellingPriceGroup>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(sellingPriceGroups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sellingPriceGroups.id, id))
    .returning();
  return result[0];
}

export async function deleteSellingPriceGroup(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(sellingPriceGroups)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(sellingPriceGroups.id, id));
}

// ============= PRODUCT VARIATIONS =============

export async function getProductVariations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productVariations)
    .where(eq(productVariations.isActive, true))
    .orderBy(asc(productVariations.name));
}

export async function createProductVariation(data: InsertProductVariation) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(productVariations).values(data).returning();
  return result[0];
}

export async function updateProductVariation(id: number, data: Partial<InsertProductVariation>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(productVariations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productVariations.id, id))
    .returning();
  return result[0];
}

export async function deleteProductVariation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productVariations)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(productVariations.id, id));
}

// ============= PRODUCTS ARCHIVE/RESTORE =============

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesProducts)
    .where(isNull(salesProducts.archivedAt))
    .orderBy(desc(salesProducts.createdAt));
}

export async function getArchivedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesProducts)
    .where(sql`"archived_at" IS NOT NULL`)
    .orderBy(desc(salesProducts.archivedAt));
}

export async function archiveProduct(id: number, archivedBy: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(salesProducts)
    .set({ 
      archivedAt: new Date(),
      archivedBy: archivedBy,
      updatedAt: new Date()
    })
    .where(eq(salesProducts.id, id));
}

export async function restoreProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(salesProducts)
    .set({ 
      archivedAt: null,
      archivedBy: null,
      updatedAt: new Date()
    })
    .where(eq(salesProducts.id, id));
}

export async function createProductFull(data: InsertSalesProduct) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(salesProducts).values(data).returning();
  return result[0];
}

export async function updateProductFull(id: number, data: Partial<InsertSalesProduct>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(salesProducts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(salesProducts.id, id))
    .returning();
  return result[0];
}

// ============ INVENTORY MANAGEMENT ============

// Warehouses
export async function getWarehouses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(warehouses).where(eq(warehouses.isActive, 1)).orderBy(warehouses.name);
}

export async function getAllWarehouses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(warehouses).orderBy(warehouses.name);
}

export async function getWarehouse(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(warehouses).where(eq(warehouses.id, id));
  return result[0] || null;
}

export async function createWarehouse(data: InsertWarehouse) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(warehouses).values(data).returning();
  return result[0];
}

export async function updateWarehouse(id: number, data: Partial<InsertWarehouse>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(warehouses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(warehouses.id, id))
    .returning();
  return result[0];
}

export async function deleteWarehouse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(warehouses).where(eq(warehouses.id, id));
}

// Product Inventory
export async function getProductInventory(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productInventory).where(eq(productInventory.productId, productId));
}

export async function getInventoryByWarehouse(warehouseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productInventory).where(eq(productInventory.warehouseId, warehouseId));
}

export async function getProductInventoryItem(productId: number, warehouseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(productInventory)
    .where(and(eq(productInventory.productId, productId), eq(productInventory.warehouseId, warehouseId)));
  return result[0] || null;
}

export async function createOrUpdateInventory(data: InsertProductInventory) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if inventory exists for this product-warehouse combo
  const existing = await getProductInventoryItem(data.productId, data.warehouseId);
  
  if (existing) {
    const result = await db.update(productInventory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productInventory.id, existing.id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(productInventory).values(data).returning();
    return result[0];
  }
}

export async function updateInventoryQuantity(productId: number, warehouseId: number, quantityChange: number, transactionType: string, userId?: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Get current inventory
  let inventory = await getProductInventoryItem(productId, warehouseId);
  const previousQty = inventory ? parseFloat(inventory.quantity || "0") : 0;
  const newQty = previousQty + quantityChange;
  
  // Create or update inventory record
  if (inventory) {
    await db.update(productInventory)
      .set({ quantity: newQty.toString(), updatedAt: new Date() })
      .where(eq(productInventory.id, inventory.id));
  } else {
    await db.insert(productInventory).values({
      productId,
      warehouseId,
      quantity: newQty.toString(),
    });
  }
  
  // Record transaction
  await db.insert(inventoryTransactions).values({
    productId,
    warehouseId,
    transactionType: transactionType as any,
    quantity: Math.abs(quantityChange).toString(),
    previousQuantity: previousQty.toString(),
    newQuantity: newQty.toString(),
    performedBy: userId,
    notes,
  });
  
  return { previousQty, newQty };
}

export async function getAllInventoryWithProducts() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(sql`
    SELECT 
      pi.id,
      pi.product_id as "productId",
      pi.warehouse_id as "warehouseId",
      pi.quantity,
      pi.reserved_quantity as "reservedQuantity",
      pi.min_stock_level as "minStockLevel",
      pi.max_stock_level as "maxStockLevel",
      pi.reorder_point as "reorderPoint",
      sp.name as "productName",
      sp.sku,
      w.name as "warehouseName"
    FROM product_inventory pi
    JOIN sales_products sp ON pi.product_id = sp.id
    JOIN warehouses w ON pi.warehouse_id = w.id
    WHERE sp.archived_at IS NULL
    ORDER BY sp.name, w.name
  `);
  
  return result.rows;
}

export async function getProductsWithInventory() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(sql`
    SELECT 
      sp.*,
      COALESCE(SUM(CAST(pi.quantity AS DECIMAL)), 0) as "totalStock",
      COALESCE(SUM(CAST(pi.reserved_quantity AS DECIMAL)), 0) as "totalReserved",
      (
        SELECT STRING_AGG(w.name || ':' || COALESCE(pi2.quantity, '0'), ', ')
        FROM warehouses w
        LEFT JOIN product_inventory pi2 ON pi2.warehouse_id = w.id AND pi2.product_id = sp.id
        WHERE w.is_active = 1
      ) as "stockByLocation"
    FROM sales_products sp
    LEFT JOIN product_inventory pi ON pi.product_id = sp.id
    WHERE sp.archived_at IS NULL
    GROUP BY sp.id
    ORDER BY sp.name
  `);
  
  return result.rows;
}

// Inventory Transactions
export async function getInventoryTransactions(productId?: number, warehouseId?: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Use raw SQL for proper join with product and warehouse names
  let sql = `
    SELECT 
      it.id,
      it.product_id as "productId",
      it.warehouse_id as "warehouseId",
      it.transaction_type as "transactionType",
      it.quantity,
      it.previous_quantity as "previousQuantity",
      it.new_quantity as "newQuantity",
      it.reference_type as "referenceType",
      it.reference_id as "referenceId",
      it.notes,
      it.performed_by as "performedBy",
      it.created_at as "createdAt",
      p.name as "productName",
      p.sku,
      w.name as "warehouseName"
    FROM inventory_transactions it
    LEFT JOIN products p ON it.product_id = p.id
    LEFT JOIN warehouses w ON it.warehouse_id = w.id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  if (productId) {
    params.push(productId);
    conditions.push(`it.product_id = $${params.length}`);
  }
  if (warehouseId) {
    params.push(warehouseId);
    conditions.push(`it.warehouse_id = $${params.length}`);
  }
  
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  sql += ` ORDER BY it.created_at DESC`;
  
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }
  
  const result = await db.execute({ sql, params });
  return result.rows;
}

// Get product sales trends (last 30 days)
export async function getProductSalesTrends() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sales = await db.select()
    .from(dailySales)
    .where(gte(dailySales.date, thirtyDaysAgo.toISOString().split('T')[0]));
  
  // Group by day
  const salesByDay: Record<string, number> = {};
  sales.forEach((sale) => {
    const day = sale.date ? new Date(sale.date).toISOString().split('T')[0] : '';
    if (day) {
      salesByDay[day] = (salesByDay[day] || 0) + Number(sale.totalAmount || 0);
    }
  });
  
  // Create 30-day array
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayNum = date.getDate();
    result.push({
      day: dayNum.toString(),
      date: dateStr,
      revenue: salesByDay[dateStr] || 0,
    });
  }
  
  return result;
}

// Get product revenue stats for last 30 days
export async function getProductRevenueStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const prevThirtyDays = new Date();
  prevThirtyDays.setDate(prevThirtyDays.getDate() - 60);
  
  // Current 30 days
  const currentSales = await db.select()
    .from(dailySales)
    .where(gte(dailySales.date, thirtyDaysAgo.toISOString().split('T')[0]));
  
  const currentRevenue = currentSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const currentQuantity = currentSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  
  // Previous 30 days for comparison
  const prevSales = await db.select()
    .from(dailySales)
    .where(
      and(
        gte(dailySales.date, prevThirtyDays.toISOString().split('T')[0]),
        lt(dailySales.date, thirtyDaysAgo.toISOString().split('T')[0])
      )
    );
  
  const prevRevenue = prevSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
  // Calculate percentage change
  const revenueChange = prevRevenue > 0 
    ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
    : 0;
  
  return {
    revenue: currentRevenue,
    revenueChange,
    unitsSold: currentQuantity,
    transactionCount: currentSales.length,
  };
}

// Get top selling products
export async function getTopSellingProducts(limit = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sales = await db.select()
    .from(dailySales)
    .where(gte(dailySales.date, thirtyDaysAgo.toISOString().split('T')[0]));
  
  // Aggregate by product
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach((sale) => {
    const name = sale.productName || 'Unknown';
    if (!productSales[name]) {
      productSales[name] = { name, quantity: 0, revenue: 0 };
    }
    productSales[name].quantity += Number(sale.quantity || 0);
    productSales[name].revenue += Number(sale.totalAmount || 0);
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name.length > 25 ? p.name.substring(0, 22) + '...' : p.name,
      unitsSold: p.quantity,
      revenue: p.revenue,
    }));
}

// Get top category by product count
export async function getTopCategory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allProducts = await db.select().from(salesProducts).where(eq(salesProducts.isActive, 1));
  const allCategories = await db.select().from(productCategories);
  
  // Count products per category
  const categoryCounts: Record<number, { name: string; count: number }> = {};
  allProducts.forEach((product) => {
    const catId = product.categoryId;
    if (catId) {
      if (!categoryCounts[catId]) {
        const cat = allCategories.find(c => c.id === catId);
        categoryCounts[catId] = { name: cat?.name || 'Unknown', count: 0 };
      }
      categoryCounts[catId].count++;
    }
  });
  
  // Find top category
  const sorted = Object.values(categoryCounts).sort((a, b) => b.count - a.count);
  return sorted[0] || { name: 'N/A', count: 0 };
}

// ============ CRM LEADS ============

export async function getAllCrmLeads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmLeads).where(eq(crmLeads.isArchived, false)).orderBy(desc(crmLeads.createdAt));
}

export async function getCrmLeadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(crmLeads).where(eq(crmLeads.id, id));
  return results[0];
}

export async function createCrmLead(data: Omit<InsertCrmLead, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmLeads).values(data).returning();
  return result[0];
}

export async function updateCrmLead(id: number, data: Partial<InsertCrmLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(crmLeads).set({ ...data, updatedAt: new Date() }).where(eq(crmLeads.id, id)).returning();
  return result[0];
}

export async function archiveCrmLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmLeads).set({ isArchived: true, updatedAt: new Date() }).where(eq(crmLeads.id, id));
}

export async function getArchivedCrmLeads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmLeads).where(eq(crmLeads.isArchived, true)).orderBy(desc(crmLeads.createdAt));
}

export async function restoreCrmLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmLeads).set({ isArchived: false, updatedAt: new Date() }).where(eq(crmLeads.id, id));
}

// ============ CRM OPPORTUNITIES ============

export async function getAllCrmOpportunities() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmOpportunities).where(eq(crmOpportunities.isArchived, false)).orderBy(desc(crmOpportunities.createdAt));
}

export async function getCrmOpportunityById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(crmOpportunities).where(eq(crmOpportunities.id, id));
  return results[0];
}

export async function createCrmOpportunity(data: Omit<InsertCrmOpportunity, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmOpportunities).values(data).returning();
  return result[0];
}

export async function updateCrmOpportunity(id: number, data: Partial<InsertCrmOpportunity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(crmOpportunities).set({ ...data, updatedAt: new Date() }).where(eq(crmOpportunities.id, id)).returning();
  return result[0];
}

export async function archiveCrmOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmOpportunities).set({ isArchived: true, updatedAt: new Date() }).where(eq(crmOpportunities.id, id));
}

// ============ CRM ACTIVITIES ============

export async function getAllCrmActivities(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmActivities).orderBy(desc(crmActivities.createdAt)).limit(limit);
}

export async function createCrmActivity(data: Omit<InsertCrmActivity, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmActivities).values(data).returning();
  return result[0];
}

// ============ CRM TASKS ============

export async function getAllCrmTasks() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmTasks).where(ne(crmTasks.status, 'completed')).orderBy(asc(crmTasks.dueDate));
}

export async function getPendingCrmTasks() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(crmTasks).where(eq(crmTasks.status, 'pending')).orderBy(asc(crmTasks.dueDate));
}

export async function createCrmTask(data: Omit<InsertCrmTask, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(crmTasks).values(data).returning();
  return result[0];
}

export async function updateCrmTask(id: number, data: Partial<InsertCrmTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(crmTasks).set({ ...data, updatedAt: new Date() }).where(eq(crmTasks.id, id)).returning();
  return result[0];
}

export async function completeCrmTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(crmTasks).set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() }).where(eq(crmTasks.id, id));
}

// ============ CRM DASHBOARD STATS ============

export async function getCrmDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const leads = await db.select().from(crmLeads).where(eq(crmLeads.isArchived, false));
  const opportunities = await db.select().from(crmOpportunities).where(eq(crmOpportunities.isArchived, false));
  const tasks = await db.select().from(crmTasks).where(eq(crmTasks.status, 'pending'));
  
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  
  // Count leads by status
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const proposalSent = leads.filter(l => l.status === 'proposal_sent').length;
  const negotiation = leads.filter(l => l.status === 'negotiation').length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  
  // Active opportunities (not closed)
  const activeOpportunities = opportunities.filter(o => 
    o.stage !== 'closed_won' && o.stage !== 'closed_lost'
  ).length;
  
  // Deals won this month
  const dealsWonThisMonth = opportunities.filter(o => {
    if (o.stage !== 'closed_won' || !o.actualCloseDate) return false;
    const closeDate = new Date(o.actualCloseDate);
    return closeDate >= thisMonth;
  }).length;
  
  // Total revenue YTD (from won opportunities)
  const totalRevenueYTD = opportunities
    .filter(o => {
      if (o.stage !== 'closed_won' || !o.actualCloseDate) return false;
      const closeDate = new Date(o.actualCloseDate);
      return closeDate >= thisYear;
    })
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);
  
  // Tasks due
  const tasksDue = tasks.length;
  
  return {
    totalLeads: leads.length,
    activeOpportunities,
    dealsWonThisMonth,
    totalRevenueYTD,
    tasksDue,
    pipeline: {
      newLeads,
      qualified: qualifiedLeads,
      proposalSent,
      negotiation,
      closedWon: wonLeads
    }
  };
}

export async function getCrmSalesPerformance() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const opportunities = await db.select().from(crmOpportunities).where(eq(crmOpportunities.isArchived, false));
  
  // Get last 6 months of closed won deals
  const result = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    
    const monthDeals = opportunities.filter(o => {
      if (o.stage !== 'closed_won' || !o.actualCloseDate) return false;
      const closeDate = new Date(o.actualCloseDate);
      return closeDate >= monthDate && closeDate <= monthEnd;
    });
    
    const revenue = monthDeals.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    result.push({ month: monthName, revenue, deals: monthDeals.length });
  }
  
  return result;
}

// =====================================
// PROCUREMENT MODULE DATABASE FUNCTIONS
// =====================================

// Vendor Functions
export async function getVendors(includeArchived = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (includeArchived) {
    return db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }
  return db.select().from(vendors).where(eq(vendors.isArchived, false)).orderBy(desc(vendors.createdAt));
}

export async function getArchivedVendors() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(vendors).where(eq(vendors.isArchived, true)).orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(vendors).where(eq(vendors.id, id));
  return result[0] || null;
}

export async function createVendor(vendor: InsertVendor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vendors).values(vendor).returning();
  return result[0];
}

export async function updateVendor(id: number, vendor: Partial<InsertVendor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(vendors).set({ ...vendor, updatedAt: new Date() }).where(eq(vendors.id, id)).returning();
  return result[0];
}

export async function archiveVendor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vendors).set({ isArchived: true, updatedAt: new Date() }).where(eq(vendors.id, id));
}

export async function restoreVendor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vendors).set({ isArchived: false, updatedAt: new Date() }).where(eq(vendors.id, id));
}

// Purchase Order Functions
export async function getPurchaseOrders(includeArchived = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (includeArchived) {
    return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }
  return db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, false)).orderBy(desc(purchaseOrders.createdAt));
}

export async function getArchivedPurchaseOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, true)).orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  return result[0] || null;
}

export async function createPurchaseOrder(po: InsertPurchaseOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchaseOrders).values(po).returning();
  return result[0];
}

export async function updatePurchaseOrder(id: number, po: Partial<InsertPurchaseOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(purchaseOrders).set({ ...po, updatedAt: new Date() }).where(eq(purchaseOrders.id, id)).returning();
  return result[0];
}

export async function archivePurchaseOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseOrders).set({ isArchived: true, updatedAt: new Date() }).where(eq(purchaseOrders.id, id));
}

export async function restorePurchaseOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseOrders).set({ isArchived: false, updatedAt: new Date() }).where(eq(purchaseOrders.id, id));
}

// Purchase Order Items
export async function getPurchaseOrderItems(purchaseOrderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
}

export async function createPurchaseOrderItem(item: InsertPurchaseOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchaseOrderItems).values(item).returning();
  return result[0];
}

export async function updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(purchaseOrderItems).set(item).where(eq(purchaseOrderItems.id, id)).returning();
  return result[0];
}

export async function deletePurchaseOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
}

// Procurement Dashboard Stats
export async function getProcurementDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allPOs = await db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, false));
  const allVendors = await db.select().from(vendors).where(eq(vendors.isArchived, false));
  
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), 0, 1);
  
  const pendingApprovals = allPOs.filter(po => po.status === 'draft' || po.status === 'sent').length;
  const confirmedPOs = allPOs.filter(po => po.status === 'confirmed').length;
  const inTransitPOs = allPOs.filter(po => po.status === 'in_transit').length;
  const overdueDeliveries = allPOs.filter(po => {
    if (!po.expectedDeliveryDate || po.status === 'received' || po.status === 'cancelled') return false;
    return new Date(po.expectedDeliveryDate) < now;
  }).length;
  
  const totalSpendYTD = allPOs
    .filter(po => new Date(po.orderDate) >= thisYear && po.status !== 'cancelled')
    .reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
  
  const activeVendors = allVendors.filter(v => v.status === 'active').length;
  
  const draftCount = allPOs.filter(po => po.status === 'draft').length;
  const sentCount = allPOs.filter(po => po.status === 'sent').length;
  const confirmedCount = allPOs.filter(po => po.status === 'confirmed').length;
  const inTransitCount = allPOs.filter(po => po.status === 'in_transit').length;
  const receivedCount = allPOs.filter(po => po.status === 'received').length;
  const cancelledCount = allPOs.filter(po => po.status === 'cancelled').length;
  
  return {
    totalPurchaseOrders: allPOs.length,
    pendingApprovals,
    confirmedPOs,
    inTransitPOs,
    overdueDeliveries,
    totalSpendYTD,
    activeVendors,
    statusCounts: { draft: draftCount, sent: sentCount, confirmed: confirmedCount, in_transit: inTransitCount, received: receivedCount, cancelled: cancelledCount }
  };
}

export async function getProcurementSpendTrend() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allPOs = await db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, false));
  const result = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    
    const monthPOs = allPOs.filter(po => {
      const orderDate = new Date(po.orderDate);
      return orderDate >= monthDate && orderDate <= monthEnd && po.status !== 'cancelled';
    });
    
    const spend = monthPOs.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
    result.push({ month: monthName, spend, orders: monthPOs.length });
  }
  
  return result;
}

export async function getTopVendorsBySpend(limit = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allVendors = await db.select().from(vendors).where(eq(vendors.isArchived, false));
  const allPOs = await db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, false));
  
  const vendorSpend = allVendors.map(vendor => {
    const vendorPOs = allPOs.filter(po => po.vendorId === vendor.id && po.status !== 'cancelled');
    const totalSpend = vendorPOs.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
    const orderCount = vendorPOs.length;
    return { ...vendor, totalSpend, orderCount };
  });
  
  return vendorSpend.sort((a, b) => b.totalSpend - a.totalSpend).slice(0, limit);
}

export async function getProcurementByCategory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allPOs = await db.select().from(purchaseOrders).where(eq(purchaseOrders.isArchived, false));
  
  const categories = ['electronics', 'raw_materials', 'office_supplies', 'equipment', 'services', 'other'];
  const result = categories.map(category => {
    const categoryPOs = allPOs.filter(po => po.category === category && po.status !== 'cancelled');
    const totalSpend = categoryPOs.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
    const orderCount = categoryPOs.length;
    return { category, totalSpend, orderCount };
  });
  
  return result.filter(c => c.orderCount > 0);
}

export async function generatePoNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  
  const latestPO = await db.select().from(purchaseOrders)
    .where(sql`${purchaseOrders.poNumber} LIKE ${prefix + '%'}`)
    .orderBy(desc(purchaseOrders.poNumber))
    .limit(1);
  
  let nextNum = 1;
  if (latestPO.length > 0) {
    const lastNum = parseInt(latestPO[0].poNumber.replace(prefix, '')) || 0;
    nextNum = lastNum + 1;
  }
  
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

// =====================================
// FINANCE MODULE DATABASE FUNCTIONS
// =====================================

export async function getFinanceDashboardStats(period: 'mtd' | 'ytd' = 'ytd') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = period === 'mtd' ? startOfMonth : startOfYear;
  
  const [allIncome, allAR, allAP, allSales, allFinancialAccounts, allInventory, allProducts] = await Promise.all([
    db.select().from(incomeExpenditure),
    db.select().from(accountsReceivable),
    db.select().from(accountsPayable),
    db.select().from(dailySales),
    db.select().from(financialAccounts).where(eq(financialAccounts.isActive, true)),
    db.select().from(productInventory),
    db.select().from(salesProducts).where(eq(salesProducts.isActive, true))
  ]);
  
  const periodIncome = allIncome.filter(ie => new Date(ie.date) >= startDate);
  const periodSales = allSales.filter(s => new Date(s.date) >= startDate);
  
  const revenue = periodIncome.filter(ie => ie.type === 'income').reduce((sum, ie) => sum + Number(ie.amount || 0), 0) +
                  periodSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
  const expenses = periodIncome.filter(ie => ie.type === 'expenditure').reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
  
  const cogsAccount = allFinancialAccounts.find(a => a.accountSubtype === 'cost_of_goods_sold');
  const cogsFromAccount = cogsAccount ? Number(cogsAccount.balance || 0) : 0;
  const cogs = cogsFromAccount > 0 ? cogsFromAccount : (revenue > 0 ? revenue * 0.59 : expenses * 0.59);
  const grossProfit = revenue - cogs;
  const opex = expenses > cogs ? expenses - cogs : expenses;
  const netProfit = grossProfit - opex;
  
  const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingExpenseRatio = revenue > 0 ? (opex / revenue) * 100 : 0;
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  const totalAR = allAR.filter(ar => ar.status === 'pending').reduce((sum, ar) => sum + Number(ar.amount || 0), 0);
  const totalAP = allAP.filter(ap => ap.status === 'pending').reduce((sum, ap) => sum + Number(ap.amount || 0), 0);
  
  const getAccountBalance = (subtype: string) => {
    const account = allFinancialAccounts.find(a => a.accountSubtype === subtype);
    return account ? Number(account.balance || 0) : 0;
  };
  
  const cashBalance = getAccountBalance('cash');
  const deposits = getAccountBalance('deposits') + getAccountBalance('bank');
  const inventoryValue = allInventory.reduce((sum, inv) => {
    const product = allProducts.find(p => p.id === inv.productId);
    const unitCost = product ? Number(product.purchasePrice || product.sellingPrice || 0) : 0;
    return sum + Number(inv.quantity || 0) * unitCost;
  }, 0);
  const inventory = inventoryValue || getAccountBalance('inventory');
  const totalAssets = cashBalance + deposits + totalAR + inventory;
  
  const wagesPayable = getAccountBalance('wages_payable');
  const provisions = getAccountBalance('provisions');
  const otherPayable = getAccountBalance('other_payable');
  const totalLiabilities = wagesPayable + totalAP + provisions + otherPayable;
  
  const lastYearRevenue = allIncome
    .filter(ie => ie.type === 'income' && new Date(ie.date).getFullYear() === now.getFullYear() - 1)
    .reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
  const lastYearExpenses = allIncome
    .filter(ie => ie.type === 'expenditure' && new Date(ie.date).getFullYear() === now.getFullYear() - 1)
    .reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
  
  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    netProfit,
    grossProfitMargin,
    operatingExpenseRatio,
    netProfitMargin,
    totalAssets,
    totalLiabilities,
    currentAssets: { cashBalance, deposits, accountReceivables: totalAR, inventory },
    currentLiabilities: { wagesPayable, accountPayables: totalAP, provisions, otherPayable },
    benchmarks: {
      revenueBenchmark: lastYearRevenue > 0 ? lastYearRevenue : revenue * 1.1,
      cogsBenchmark: lastYearExpenses > 0 ? lastYearExpenses * 0.59 : cogs * 1.1,
      grossProfitBenchmark: lastYearRevenue > 0 ? lastYearRevenue - (lastYearExpenses * 0.59) : grossProfit * 1.1,
      netProfitBenchmark: lastYearRevenue > 0 ? lastYearRevenue - lastYearExpenses : netProfit * 1.1
    }
  };
}

export async function getAllFinancialAccounts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(financialAccounts).where(eq(financialAccounts.isActive, true)).orderBy(asc(financialAccounts.accountCode));
}

export async function createFinancialAccount(data: InsertFinancialAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(financialAccounts).values(data).returning();
  return result;
}

export async function updateFinancialAccountBalance(accountId: number, balance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(financialAccounts).set({ balance, updatedAt: new Date() }).where(eq(financialAccounts.id, accountId));
}

export async function getBalanceSheetData() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [accounts, allAR, allAP, allInventory, allProducts] = await Promise.all([
    db.select().from(financialAccounts).where(eq(financialAccounts.isActive, true)),
    db.select().from(accountsReceivable).where(eq(accountsReceivable.status, 'pending')),
    db.select().from(accountsPayable).where(eq(accountsPayable.status, 'pending')),
    db.select().from(productInventory),
    db.select().from(salesProducts).where(eq(salesProducts.isActive, true))
  ]);
  
  const getAccountsByType = (type: string) => accounts.filter(a => a.accountType === type);
  const sumBySubtype = (subtype: string) => {
    const account = accounts.find(a => a.accountSubtype === subtype);
    return account ? Number(account.balance || 0) : 0;
  };
  
  const cashBalance = sumBySubtype('cash');
  const bankBalance = sumBySubtype('bank');
  const deposits = sumBySubtype('deposits');
  const arTotal = allAR.reduce((sum, ar) => sum + Number(ar.amount || 0), 0);
  const inventoryValue = allInventory.reduce((sum, inv) => {
    const product = allProducts.find(p => p.id === inv.productId);
    const unitCost = product ? Number(product.purchasePrice || product.sellingPrice || 0) : 0;
    return sum + Number(inv.quantity || 0) * unitCost;
  }, 0) || sumBySubtype('inventory');
  const fixedAssets = sumBySubtype('fixed_assets');
  
  const totalCurrentAssets = cashBalance + bankBalance + deposits + arTotal + inventoryValue;
  const totalAssets = totalCurrentAssets + fixedAssets;
  
  const apTotal = allAP.reduce((sum, ap) => sum + Number(ap.amount || 0), 0);
  const wagesPayable = sumBySubtype('wages_payable');
  const taxesPayable = sumBySubtype('taxes_payable');
  const provisions = sumBySubtype('provisions');
  const otherPayable = sumBySubtype('other_payable');
  
  const totalCurrentLiabilities = apTotal + wagesPayable + taxesPayable + provisions + otherPayable;
  const totalLiabilities = totalCurrentLiabilities;
  
  const commonStock = sumBySubtype('common_stock');
  const retainedEarnings = sumBySubtype('retained_earnings');
  const totalEquity = totalAssets - totalLiabilities;
  
  return {
    assets: {
      currentAssets: {
        cash: cashBalance,
        bank: bankBalance,
        deposits,
        accountsReceivable: arTotal,
        inventory: inventoryValue,
        total: totalCurrentAssets
      },
      fixedAssets: {
        total: fixedAssets
      },
      totalAssets
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: apTotal,
        wagesPayable,
        taxesPayable,
        provisions,
        otherPayable,
        total: totalCurrentLiabilities
      },
      totalLiabilities
    },
    equity: {
      commonStock,
      retainedEarnings: totalEquity - commonStock,
      totalEquity
    }
  };
}

export async function getAllJournalEntries() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(journalEntries).orderBy(desc(journalEntries.entryDate));
}

export async function createJournalEntry(data: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(journalEntries).values(data).returning();
  return result;
}

export async function getFinanceMonthlyTrend(months = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allIncome = await db.select().from(incomeExpenditure);
  const allSales = await db.select().from(dailySales);
  const result = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    const year = monthDate.getFullYear();
    
    const monthIncome = allIncome.filter(ie => {
      const d = new Date(ie.date);
      return d >= monthDate && d <= monthEnd;
    });
    
    const monthSales = allSales.filter(s => {
      const d = new Date(s.date);
      return d >= monthDate && d <= monthEnd;
    });
    
    const revenue = monthIncome.filter(ie => ie.type === 'income').reduce((sum, ie) => sum + Number(ie.amount || 0), 0) +
                    monthSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    
    const expenses = monthIncome.filter(ie => ie.type === 'expenditure').reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
    const cogs = expenses * 0.59;
    const grossProfit = revenue - cogs;
    const opex = expenses - cogs;
    const netProfit = grossProfit - opex;
    
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    
    result.push({
      month: monthName,
      year,
      revenue,
      cogs,
      grossProfit,
      opex,
      netProfit,
      grossProfitMargin,
      netProfitMargin
    });
  }
  
  return result;
}

export async function getAgingReport(type: 'receivable' | 'payable' = 'receivable') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const data = type === 'receivable' 
    ? await db.select().from(accountsReceivable).where(eq(accountsReceivable.status, 'pending'))
    : await db.select().from(accountsPayable).where(eq(accountsPayable.status, 'pending'));
  
  const aging = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  };
  
  data.forEach(item => {
    const dueDate = new Date(item.dueDate);
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = Number(item.amount || 0);
    
    if (daysOverdue <= 0) aging.current += amount;
    else if (daysOverdue <= 30) aging.days30 += amount;
    else if (daysOverdue <= 60) aging.days60 += amount;
    else if (daysOverdue <= 90) aging.days90 += amount;
    else aging.over90 += amount;
  });
  
  return { aging, items: data };
}

export async function getCashFlowData(months = 6) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allIncome = await db.select().from(incomeExpenditure);
  const allSales = await db.select().from(dailySales);
  const result = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    
    const monthIncome = allIncome.filter(ie => {
      const d = new Date(ie.date);
      return d >= monthDate && d <= monthEnd;
    });
    
    const monthSales = allSales.filter(s => {
      const d = new Date(s.date);
      return d >= monthDate && d <= monthEnd;
    });
    
    const inflow = monthIncome.filter(ie => ie.type === 'income').reduce((sum, ie) => sum + Number(ie.amount || 0), 0) +
                   monthSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    
    const outflow = monthIncome.filter(ie => ie.type === 'expenditure').reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
    
    result.push({ month: monthName, inflow, outflow, net: inflow - outflow });
  }
  
  return result;
}

export async function getIncomeStatement(period: 'mtd' | 'ytd' = 'ytd') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = period === 'mtd' ? startOfMonth : startOfYear;
  
  const allIncome = await db.select().from(incomeExpenditure);
  const allSales = await db.select().from(dailySales);
  
  const periodIncome = allIncome.filter(ie => new Date(ie.date) >= startDate);
  const periodSales = allSales.filter(s => new Date(s.date) >= startDate);
  
  const revenue = periodIncome.filter(ie => ie.type === 'income').reduce((sum, ie) => sum + Number(ie.amount || 0), 0) +
                  periodSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
  const expenses = periodIncome.filter(ie => ie.type === 'expenditure').reduce((sum, ie) => sum + Number(ie.amount || 0), 0);
  const cogs = expenses * 0.59;
  const grossProfit = revenue - cogs;
  const opex = expenses - cogs;
  const netProfit = grossProfit - opex;
  
  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    netProfit,
    items: [
      { name: 'Revenue', value: revenue, percentage: 100 },
      { name: 'COGS', value: cogs, percentage: revenue > 0 ? (cogs / revenue) * 100 : 0 },
      { name: 'Gross Profit', value: grossProfit, percentage: revenue > 0 ? (grossProfit / revenue) * 100 : 0 },
      { name: 'OPEX', value: opex, percentage: revenue > 0 ? (opex / revenue) * 100 : 0 },
      { name: 'Net Profit', value: netProfit, percentage: revenue > 0 ? (netProfit / revenue) * 100 : 0 }
    ]
  };
}

// ============ AI Module ============

export async function getAIConversations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiConversations).orderBy(desc(aiConversations.createdAt));
}

export async function getAIConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [conversation] = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
  return conversation;
}

export async function createAIConversation(title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [conversation] = await db.insert(aiConversations).values({ title }).returning();
  return conversation;
}

export async function deleteAIConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(aiMessages).where(eq(aiMessages.conversationId, id));
  await db.delete(aiConversations).where(eq(aiConversations.id, id));
}

export async function getAIMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(asc(aiMessages.createdAt));
}

export async function createAIMessage(conversationId: number, role: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [message] = await db.insert(aiMessages).values({ conversationId, role, content }).returning();
  return message;
}

// AI Integration Settings
export async function getAIIntegrationSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiIntegrationSettings).orderBy(aiIntegrationSettings.createdAt);
}

export async function getAIIntegrationSetting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [setting] = await db.select().from(aiIntegrationSettings).where(eq(aiIntegrationSettings.id, id));
  return setting;
}

export async function createAIIntegrationSetting(data: InsertAIIntegrationSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [setting] = await db.insert(aiIntegrationSettings).values(data).returning();
  return setting;
}

export async function updateAIIntegrationSetting(id: number, data: Partial<InsertAIIntegrationSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [setting] = await db.update(aiIntegrationSettings).set({ ...data, updatedAt: new Date() }).where(eq(aiIntegrationSettings.id, id)).returning();
  return setting;
}

export async function deleteAIIntegrationSetting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(aiIntegrationSettings).where(eq(aiIntegrationSettings.id, id));
}
