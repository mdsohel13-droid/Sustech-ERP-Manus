import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  accountsReceivable, InsertAccountsReceivable,
  accountsPayable, InsertAccountsPayable,
  sales, InsertSales,
  projects, InsertProject,
  customers, InsertCustomer,
  customerInteractions, InsertCustomerInteraction,
  teamMembers, InsertTeamMember,
  attendance, InsertAttendance,
  leaveRequests, InsertLeaveRequest,
  ideaNotes, InsertIdeaNote,
  dashboardInsights, InsertDashboardInsight,
  notificationLog, InsertNotificationLog
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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
  return await db.select().from(teamMembers).where(eq(teamMembers.isActive, true));
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

export async function deleteIdeaNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(ideaNotes).where(eq(ideaNotes.id, id));
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
