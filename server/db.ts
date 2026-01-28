import { eq, and, gte, lte, desc, asc, sql, isNull, lt, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
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
} from "../drizzle/schema";

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

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

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] || null;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.openId, openId));
  return result[0] || null;
}

export {
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
  eq, and, gte, lte, desc, asc, sql, isNull, lt, ne,
};
