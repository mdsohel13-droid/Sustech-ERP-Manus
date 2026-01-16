import { eq, and, gte, lte, desc, asc, sql, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  accountsReceivable, InsertAccountsReceivable,
  accountsPayable, InsertAccountsPayable,
  sales, InsertSales,
  dailySales,
  weeklySalesTargets,
  monthlySalesTargets,
  projects, InsertProject,
  customers, InsertCustomer,
  customerInteractions, InsertCustomerInteraction,
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
  transactionTypes, InsertTransactionType
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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

// ============ Accounts Receivable ============
export async function createAR(data: InsertAccountsReceivable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accountsReceivable).values(data);
  return result;
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
  return await db.insert(projects).values(data);
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
  return await db.select().from(teamMembers).where(eq(teamMembers.status, "active"));
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
  
  const [result] = await db.insert(dailySales).values(sale);
  return result;
}

export async function getDailySales(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailySales)
    .where(
      sql`${dailySales.date} >= ${startDate} AND ${dailySales.date} <= ${endDate}`
    )
    .orderBy(desc(dailySales.date));
}

export async function createWeeklyTarget(target: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(weeklySalesTargets).values(target);
  return result;
}

export async function getWeeklyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(weeklySalesTargets)
    .orderBy(desc(weeklySalesTargets.weekStartDate));
}

export async function createMonthlyTarget(target: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(monthlySalesTargets).values(target);
  return result;
}

export async function getMonthlyTargets() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(monthlySalesTargets)
    .orderBy(desc(monthlySalesTargets.year), desc(monthlySalesTargets.month));
}

export async function getSalespeople() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(salesProducts);
}

export async function createSalesperson(person: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(salesProducts).values(person);
  return result;
}


// ===== Project Financial Transactions =====
export async function createProjectTransaction(transaction: InsertProjectTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(projectTransactions).values(transaction);
  return result.insertId;
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
  
  return await db.select().from(incomeExpenditure).orderBy(desc(incomeExpenditure.date));
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
  
  return await db.select().from(tenderQuotation)
    .where(isNull(tenderQuotation.archivedAt))
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
