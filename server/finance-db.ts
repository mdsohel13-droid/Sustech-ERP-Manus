import { getDb } from "./db";
import { eq, desc, and, sql, gte, lte, asc } from "drizzle-orm";
import {
  accountsReceivable,
  accountsPayable,
  paymentHistory,
  journalEntries,
  journalEntryLines,
  financialAccounts,
  budgets,
  incomeExpenditure,
} from "../drizzle/schema";

async function db() {
  const instance = await getDb();
  if (!instance) throw new Error("Database not available");
  return instance;
}

export async function approveAR(id: number, userId: number) {
  const d = await db();
  await d.update(accountsReceivable).set({
    approvalStatus: "approved",
    approvedBy: userId,
    approvedAt: new Date(),
    rejectionReason: null,
    updatedAt: new Date(),
  }).where(eq(accountsReceivable.id, id));
  return { success: true };
}

export async function rejectAR(id: number, userId: number, reason: string) {
  const d = await db();
  await d.update(accountsReceivable).set({
    approvalStatus: "rejected",
    approvedBy: userId,
    approvedAt: new Date(),
    rejectionReason: reason,
    updatedAt: new Date(),
  }).where(eq(accountsReceivable.id, id));
  return { success: true };
}

export async function approveAP(id: number, userId: number) {
  const d = await db();
  await d.update(accountsPayable).set({
    approvalStatus: "approved",
    approvedBy: userId,
    approvedAt: new Date(),
    rejectionReason: null,
    updatedAt: new Date(),
  }).where(eq(accountsPayable.id, id));
  return { success: true };
}

export async function rejectAP(id: number, userId: number, reason: string) {
  const d = await db();
  await d.update(accountsPayable).set({
    approvalStatus: "rejected",
    approvedBy: userId,
    approvedAt: new Date(),
    rejectionReason: reason,
    updatedAt: new Date(),
  }).where(eq(accountsPayable.id, id));
  return { success: true };
}

export async function recordARPayment(data: {
  arId: number;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  createdBy: number;
}) {
  const d = await db();
  const [ar] = await d.select().from(accountsReceivable).where(eq(accountsReceivable.id, data.arId));
  if (!ar) throw new Error("AR entry not found");
  if (ar.approvalStatus === "pending_approval") throw new Error("Cannot record payment: entry is pending approval");
  if (ar.approvalStatus === "rejected") throw new Error("Cannot record payment: entry was rejected");

  const newPayment = Number(data.amount);
  if (newPayment <= 0) throw new Error("Payment amount must be positive");

  const currentPaid = Number(ar.paidAmount || 0);
  const totalPaid = currentPaid + newPayment;
  const totalAmount = Number(ar.amount);

  await d.insert(paymentHistory).values({
    recordType: "ar_payment",
    referenceId: data.arId,
    paymentDate: data.paymentDate,
    amount: data.amount,
    currency: ar.currency,
    paymentMethod: data.paymentMethod,
    referenceNumber: data.referenceNumber,
    bankAccount: data.bankAccount,
    notes: data.notes,
    createdBy: data.createdBy,
  });

  const newStatus = totalPaid >= totalAmount ? "paid" : "pending";
  await d.update(accountsReceivable).set({
    paidAmount: totalPaid.toFixed(2),
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod,
    paymentNotes: data.notes,
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(accountsReceivable.id, data.arId));

  return { success: true, totalPaid, remaining: totalAmount - totalPaid, status: newStatus };
}

export async function recordAPPayment(data: {
  apId: number;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  createdBy: number;
}) {
  const d = await db();
  const [ap] = await d.select().from(accountsPayable).where(eq(accountsPayable.id, data.apId));
  if (!ap) throw new Error("AP entry not found");
  if (ap.approvalStatus === "pending_approval") throw new Error("Cannot record payment: entry is pending approval");
  if (ap.approvalStatus === "rejected") throw new Error("Cannot record payment: entry was rejected");

  const newPayment = Number(data.amount);
  if (newPayment <= 0) throw new Error("Payment amount must be positive");

  const currentPaid = Number(ap.paidAmount || 0);
  const totalPaid = currentPaid + newPayment;
  const totalAmount = Number(ap.amount);

  await d.insert(paymentHistory).values({
    recordType: "ap_payment",
    referenceId: data.apId,
    paymentDate: data.paymentDate,
    amount: data.amount,
    currency: ap.currency,
    paymentMethod: data.paymentMethod,
    referenceNumber: data.referenceNumber,
    bankAccount: data.bankAccount,
    notes: data.notes,
    createdBy: data.createdBy,
  });

  const newStatus = totalPaid >= totalAmount ? "paid" : "pending";
  await d.update(accountsPayable).set({
    paidAmount: totalPaid.toFixed(2),
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod,
    paymentNotes: data.notes,
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(accountsPayable.id, data.apId));

  return { success: true, totalPaid, remaining: totalAmount - totalPaid, status: newStatus };
}

export async function getPaymentHistory(recordType: "ar_payment" | "ap_payment", referenceId: number) {
  const d = await db();
  return await d.select().from(paymentHistory)
    .where(and(eq(paymentHistory.recordType, recordType), eq(paymentHistory.referenceId, referenceId)))
    .orderBy(desc(paymentHistory.paymentDate));
}

export async function getPendingApprovals() {
  const d = await db();
  const pendingAR = await d.select().from(accountsReceivable)
    .where(eq(accountsReceivable.approvalStatus, "pending_approval"));
  const pendingAP = await d.select().from(accountsPayable)
    .where(eq(accountsPayable.approvalStatus, "pending_approval"));
  return { pendingAR, pendingAP, totalPending: pendingAR.length + pendingAP.length };
}

export async function createJournalEntryWithLines(data: {
  entryDate: string;
  description: string;
  reference?: string;
  currency?: string;
  createdBy: number;
  lines: Array<{
    accountId: number;
    debitAmount: string;
    creditAmount: string;
    description?: string;
  }>;
}) {
  const d = await db();

  const totalDebits = data.lines.reduce((sum, l) => sum + Number(l.debitAmount || 0), 0);
  const totalCredits = data.lines.reduce((sum, l) => sum + Number(l.creditAmount || 0), 0);
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error(`Debits (${totalDebits.toFixed(2)}) must equal Credits (${totalCredits.toFixed(2)})`);
  }

  const debitLine = data.lines.find(l => Number(l.debitAmount) > 0);
  const creditLine = data.lines.find(l => Number(l.creditAmount) > 0);

  const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const [entry] = await d.insert(journalEntries).values({
    entryNumber,
    entryDate: data.entryDate,
    description: data.description,
    reference: data.reference,
    debitAccountId: debitLine?.accountId || 0,
    creditAccountId: creditLine?.accountId || 0,
    amount: totalDebits.toFixed(2),
    currency: data.currency || "BDT",
    createdBy: data.createdBy,
  }).returning();

  for (const line of data.lines) {
    await d.insert(journalEntryLines).values({
      journalEntryId: entry.id,
      accountId: line.accountId,
      debitAmount: line.debitAmount || "0",
      creditAmount: line.creditAmount || "0",
      description: line.description,
    });
  }

  return entry;
}

export async function getJournalEntryWithLines(id: number) {
  const d = await db();
  const [entry] = await d.select().from(journalEntries).where(eq(journalEntries.id, id));
  if (!entry) return null;
  const lines = await d.select().from(journalEntryLines)
    .where(eq(journalEntryLines.journalEntryId, id))
    .orderBy(asc(journalEntryLines.id));
  const accounts = await d.select().from(financialAccounts).where(eq(financialAccounts.isActive, true));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  return {
    ...entry,
    lines: lines.map(l => ({ ...l, account: accountMap[l.accountId] })),
  };
}

export async function getAllJournalEntriesWithLines() {
  const d = await db();
  const entries = await d.select().from(journalEntries).orderBy(desc(journalEntries.entryDate));
  const allLines = await d.select().from(journalEntryLines);
  const accounts = await d.select().from(financialAccounts).where(eq(financialAccounts.isActive, true));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const linesByEntry = new Map<number, Array<typeof allLines[0] & { account?: typeof accounts[0] }>>();
  for (const line of allLines) {
    if (!linesByEntry.has(line.journalEntryId)) linesByEntry.set(line.journalEntryId, []);
    linesByEntry.get(line.journalEntryId)!.push({ ...line, account: accountMap[line.accountId] });
  }
  return entries.map(e => ({ ...e, lines: linesByEntry.get(e.id) || [] }));
}

export async function postJournalEntry(id: number) {
  const d = await db();
  await d.update(journalEntries).set({ isPosted: true, updatedAt: new Date() }).where(eq(journalEntries.id, id));

  const lines = await d.select().from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  for (const line of lines) {
    const debit = Number(line.debitAmount || 0);
    const credit = Number(line.creditAmount || 0);
    const netChange = debit - credit;
    if (netChange !== 0) {
      const [account] = await d.select().from(financialAccounts).where(eq(financialAccounts.id, line.accountId));
      if (account) {
        const currentBalance = Number(account.balance || 0);
        const isDebitNormal = ["asset", "expense"].includes(account.accountType);
        const newBalance = isDebitNormal ? currentBalance + netChange : currentBalance - netChange;
        await d.update(financialAccounts).set({
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        }).where(eq(financialAccounts.id, line.accountId));
      }
    }
  }

  return { success: true };
}

export async function deleteJournalEntry(id: number) {
  const d = await db();
  await d.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  await d.delete(journalEntries).where(eq(journalEntries.id, id));
  return { success: true };
}

export async function getBudgetVarianceAnalysis(monthYear?: string) {
  const d = await db();
  const targetMonth = monthYear || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const monthBudgets = await d.select().from(budgets).where(eq(budgets.monthYear, targetMonth));

  const [year, month] = targetMonth.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const actuals = await d.select().from(incomeExpenditure)
    .where(and(
      gte(incomeExpenditure.date, startDate),
      lte(incomeExpenditure.date, endDate),
      eq(incomeExpenditure.isArchived, false),
    ));

  const actualsByCategory = new Map<string, { income: number; expenditure: number }>();
  for (const entry of actuals) {
    const key = entry.category;
    if (!actualsByCategory.has(key)) actualsByCategory.set(key, { income: 0, expenditure: 0 });
    const current = actualsByCategory.get(key)!;
    if (entry.type === "income") current.income += Number(entry.amount);
    else current.expenditure += Number(entry.amount);
  }

  const variance = monthBudgets.map(b => {
    const actualData = actualsByCategory.get(b.category);
    const actual = b.type === "income" ? (actualData?.income || 0) : (actualData?.expenditure || 0);
    const budget = Number(b.budgetAmount);
    const diff = actual - budget;
    const percentUsed = budget > 0 ? (actual / budget) * 100 : 0;
    return {
      ...b,
      actual: actual.toFixed(2),
      variance: diff.toFixed(2),
      percentUsed: Math.round(percentUsed),
      status: percentUsed > 100 ? "over_budget" : percentUsed > 80 ? "warning" : "on_track",
    };
  });

  const totalBudget = monthBudgets.reduce((sum, b) => sum + Number(b.budgetAmount), 0);
  const totalActual = actuals.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    monthYear: targetMonth,
    items: variance,
    summary: {
      totalBudget: totalBudget.toFixed(2),
      totalActual: totalActual.toFixed(2),
      totalVariance: (totalActual - totalBudget).toFixed(2),
      overBudgetCount: variance.filter(v => v.status === "over_budget").length,
      warningCount: variance.filter(v => v.status === "warning").length,
      onTrackCount: variance.filter(v => v.status === "on_track").length,
    },
  };
}

export async function getFinanceDashboardKPIs() {
  const d = await db();

  const pendingAR = await d.select().from(accountsReceivable)
    .where(and(eq(accountsReceivable.status, "pending"), eq(accountsReceivable.isArchived, false)));
  const pendingAP = await d.select().from(accountsPayable)
    .where(and(eq(accountsPayable.status, "pending"), eq(accountsPayable.isArchived, false)));
  const overdueAR = await d.select().from(accountsReceivable)
    .where(and(eq(accountsReceivable.status, "overdue"), eq(accountsReceivable.isArchived, false)));
  const overdueAP = await d.select().from(accountsPayable)
    .where(and(eq(accountsPayable.status, "overdue"), eq(accountsPayable.isArchived, false)));

  const pendingApprovalAR = await d.select().from(accountsReceivable)
    .where(eq(accountsReceivable.approvalStatus, "pending_approval"));
  const pendingApprovalAP = await d.select().from(accountsPayable)
    .where(eq(accountsPayable.approvalStatus, "pending_approval"));

  const totalPendingAR = pendingAR.reduce((sum, r) => sum + Number(r.amount) - Number(r.paidAmount || 0), 0);
  const totalPendingAP = pendingAP.reduce((sum, r) => sum + Number(r.amount) - Number(r.paidAmount || 0), 0);
  const totalOverdueAR = overdueAR.reduce((sum, r) => sum + Number(r.amount) - Number(r.paidAmount || 0), 0);
  const totalOverdueAP = overdueAP.reduce((sum, r) => sum + Number(r.amount) - Number(r.paidAmount || 0), 0);

  return {
    pendingARCount: pendingAR.length,
    pendingAPCount: pendingAP.length,
    overdueARCount: overdueAR.length,
    overdueAPCount: overdueAP.length,
    totalPendingAR: totalPendingAR.toFixed(2),
    totalPendingAP: totalPendingAP.toFixed(2),
    totalOverdueAR: totalOverdueAR.toFixed(2),
    totalOverdueAP: totalOverdueAP.toFixed(2),
    pendingApprovalCount: pendingApprovalAR.length + pendingApprovalAP.length,
    pendingApprovalARCount: pendingApprovalAR.length,
    pendingApprovalAPCount: pendingApprovalAP.length,
  };
}
