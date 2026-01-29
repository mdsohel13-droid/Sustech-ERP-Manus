import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, managerProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import * as db from "./db";
import { generateQuotationPDF, generateInvoicePDF } from "./_core/pdfGenerator";

// Password strength validation
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      // Clear demo mode cookie too
      ctx.res.clearCookie("erp-demo-mode", { path: "/", maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Password-based login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import('bcryptjs');
        
        // Find user by email
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        // Check if user has password
        const userWithPassword = await db.getUserWithPassword(input.email);
        if (!userWithPassword?.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'This account uses OAuth login. Please use the Sign In button.' });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(input.password, userWithPassword.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        // Set auth cookie for the user
        ctx.res.cookie("erp-user-id", String(user.id), { 
          path: "/", 
          maxAge: 86400000, // 24 hours
          httpOnly: true,
          sameSite: "lax"
        });
        
        // Update last signed in
        await db.updateUserLastSignIn(user.id);
        
        return { 
          success: true, 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        };
      }),
  }),

  // ============ Financial Module ============
  financial: router({
    // Accounts Receivable
    createAR: protectedProcedure
      .input(z.object({
        customerName: z.string().min(1, "Customer name is required"),
        amount: z.string().refine(val => parseFloat(val) >= 0, "Amount cannot be negative"),
        dueDate: z.string(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { dueDate, ...data } = input;
        const result = await db.createAR({ ...data, dueDate: new Date(dueDate) as any, createdBy: ctx.user.id });
        
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "create",
          module: "financial",
          entityType: "accounts_receivable",
          entityId: String(result?.id || "new"),
          entityName: input.customerName,
          newValues: JSON.stringify(input),
          status: "success",
        });
        
        return { success: true };
      }),
    
    getAccountsReceivable: protectedProcedure.query(async () => {
      return await db.getAllAR();
    }),
    
    getAllAR: protectedProcedure.query(async () => {
      return await db.getAllAR();
    }),
    
    updateAR: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerName: z.string().optional(),
        amount: z.string().refine(val => !val || parseFloat(val) >= 0, "Amount cannot be negative").optional(),
        dueDate: z.string().optional(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const oldRecord = await db.getARById(input.id);
        const { id, dueDate, ...data } = input;
        await db.updateAR(id, { ...data, ...(dueDate ? { dueDate: new Date(dueDate) as any } : {}) });
        
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "update",
          module: "financial",
          entityType: "accounts_receivable",
          entityId: String(id),
          entityName: input.customerName || oldRecord?.customerName,
          oldValues: JSON.stringify(oldRecord),
          newValues: JSON.stringify(input),
          changes: Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined).join(", "),
          status: "success",
        });
        
        return { success: true };
      }),
    
    deleteAR: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const oldRecord = await db.getARById(input.id);
        await db.deleteAR(input.id);
        
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "delete",
          module: "financial",
          entityType: "accounts_receivable",
          entityId: String(input.id),
          entityName: oldRecord?.customerName,
          oldValues: JSON.stringify(oldRecord),
          status: "success",
        });
        
        return { success: true };
      }),
    
    bulkDeleteAR: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        for (const id of input.ids) {
          await db.deleteAR(id);
        }
        return { success: true, deleted: input.ids.length };
      }),
    
    getARSummary: protectedProcedure.query(async () => {
      return await db.getARSummary();
    }),

    notifyOverdueAR: protectedProcedure
      .mutation(async () => {
        const overdueAR = await db.getOverdueAR(90); // 90+ days overdue
        
        if (overdueAR.length === 0) {
          return { success: true, message: "No overdue receivables found" };
        }

        const totalOverdue = overdueAR.reduce((sum, ar) => sum + Number(ar.amount), 0);
        const content = `You have ${overdueAR.length} overdue receivables (90+ days) totaling ${totalOverdue.toFixed(2)}:\n\n` +
          overdueAR.map((ar, idx) => 
            `${idx + 1}. ${ar.customerName}: ${ar.amount} (Invoice: ${ar.invoiceNumber || 'N/A'}, Due: ${ar.dueDate})`
          ).join('\n');

        const notified = await notifyOwner({
          title: `⚠️ ${overdueAR.length} Overdue Receivables (90+ days)`,
          content,
        });

        return { success: notified, count: overdueAR.length, totalOverdue };
      }),

    sendSMSReminders: protectedProcedure
      .input(z.object({
        phoneNumbers: z.array(z.string()),
        customMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { sendSMS } = await import("./_core/sms");
        const results: { phoneNumber: string; sent: boolean }[] = [];
        
        for (const phoneNumber of input.phoneNumbers) {
          const message = input.customMessage || "Please settle your overdue invoice at your earliest convenience. Thank you!";
          const sent = await sendSMS({ phoneNumber, message });
          results.push({ phoneNumber, sent });
        }
        
        const successCount = results.filter(r => r.sent).length;
        return { success: successCount === results.length, sent: successCount, total: results.length, results };
      }),

    // Accounts Payable
    createAP: protectedProcedure
      .input(z.object({
        vendorName: z.string().min(1, "Vendor name is required"),
        amount: z.string().refine(val => parseFloat(val) >= 0, "Amount cannot be negative"),
        dueDate: z.string(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { dueDate, ...data } = input;
        await db.createAP({ ...data, dueDate: new Date(dueDate) as any, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getAccountsPayable: protectedProcedure.query(async () => {
      return await db.getAllAP();
    }),
    
    getAllAP: protectedProcedure.query(async () => {
      return await db.getAllAP();
    }),
    
    updateAP: protectedProcedure
      .input(z.object({
        id: z.number(),
        vendorName: z.string().optional(),
        amount: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dueDate, ...data } = input;
        await db.updateAP(id, { ...data, ...(dueDate ? { dueDate: new Date(dueDate) as any } : {}) });
        return { success: true };
      }),
    
    deleteAP: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAP(input.id);
        return { success: true };
      }),
    
    bulkDeleteAP: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        for (const id of input.ids) {
          await db.deleteAP(id);
        }
        return { success: true, deleted: input.ids.length };
      }),
    
    getAPSummary: protectedProcedure.query(async () => {
      return await db.getAPSummary();
    }),

    // Sales
    createSale: protectedProcedure
      .input(z.object({
        productType: z.enum(["fan", "ess", "solar_pv", "projects", "testing", "installation"]),
        weekNumber: z.number().min(1).max(4),
        monthYear: z.string(),
        target: z.string().refine(val => !val || parseFloat(val) >= 0, "Target cannot be negative").optional(),
        actual: z.string().refine(val => !val || parseFloat(val) >= 0, "Actual cannot be negative").optional(),
        unit: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSale({ ...input, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getSalesByMonth: protectedProcedure
      .input(z.object({ monthYear: z.string() }))
      .query(async ({ input }) => {
        return await db.getSalesByMonth(input.monthYear);
      }),
    
    updateSale: protectedProcedure
      .input(z.object({
        id: z.number(),
        target: z.string().optional(),
        actual: z.string().optional(),
        unit: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSale(id, data);
        return { success: true };
      }),
    
    deleteSale: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSale(input.id);
        return { success: true };
      }),
    
    getSalesSummary: protectedProcedure
      .input(z.object({ monthYear: z.string() }))
      .query(async ({ input }) => {
        return await db.getSalesSummary(input.monthYear);
      }),
  }),

  // ============ Project Module ============
  projects: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        customerName: z.string(),
        stage: z.enum(["lead", "proposal", "won", "execution", "testing"]).optional(),
        value: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        expectedCloseDate: z.string().optional(),
        actualCloseDate: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { startDate, expectedCloseDate, actualCloseDate, ...data } = input;
        await db.createProject({
          ...data,
          ...(startDate ? { startDate: new Date(startDate) as any } : {}),
          ...(expectedCloseDate ? { expectedCloseDate: new Date(expectedCloseDate) as any } : {}),
          ...(actualCloseDate ? { actualCloseDate: new Date(actualCloseDate) as any } : {}),
          createdBy: ctx.user.id
        });
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllProjects();
    }),
    
    getByStage: protectedProcedure
      .input(z.object({ stage: z.string() }))
      .query(async ({ input }) => {
        return await db.getProjectsByStage(input.stage);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        customerName: z.string().optional(),
        stage: z.enum(["lead", "proposal", "won", "execution", "testing"]).optional(),
        value: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        expectedCloseDate: z.string().optional(),
        actualCloseDate: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, startDate, expectedCloseDate, actualCloseDate, ...data } = input;
        await db.updateProject(id, {
          ...data,
          ...(startDate ? { startDate: new Date(startDate) as any } : {}),
          ...(expectedCloseDate ? { expectedCloseDate: new Date(expectedCloseDate) as any } : {}),
          ...(actualCloseDate ? { actualCloseDate: new Date(actualCloseDate) as any } : {}),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),
    
    getStats: protectedProcedure.query(async () => {
      return await db.getProjectStats();
    }),
    
    // Project Financial Transactions
    createTransaction: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        transactionDate: z.string(),
        transactionType: z.enum(["revenue", "purchase", "expense", "cogs", "wacc"]),
        amount: z.string(),
        currency: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        invoiceNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { transactionDate, ...data } = input;
        await db.createProjectTransaction({
          ...data,
          transactionDate: new Date(transactionDate) as any,
          createdBy: ctx.user.id
        });
        return { success: true };
      }),
    
    getTransactions: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectTransactions(input.projectId);
      }),
    
    getFinancialSummary: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectFinancialSummary(input.projectId);
      }),
    
    updateTransaction: protectedProcedure
      .input(z.object({
        id: z.number(),
        transactionDate: z.string().optional(),
        transactionType: z.enum(["revenue", "purchase", "expense", "cogs", "wacc"]).optional(),
        amount: z.string().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        invoiceNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, transactionDate, ...data } = input;
        await db.updateProjectTransaction(id, {
          ...data,
          ...(transactionDate ? { transactionDate: new Date(transactionDate) as any } : {}),
        });
        return { success: true };
      }),
    
    deleteTransaction: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProjectTransaction(input.id);
        return { success: true };
      }),
  }),

  // ============ Customer Module ============
  customers: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["hot", "warm", "cold"]).optional(),
        lastContactDate: z.string().optional(),
        nextActionRequired: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { lastContactDate, ...data } = input;
        await db.createCustomer({ ...data, ...(lastContactDate ? { lastContactDate: new Date(lastContactDate) as any } : {}), createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllCustomers();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["hot", "warm", "cold"]).optional(),
        lastContactDate: z.string().optional(),
        nextActionRequired: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, lastContactDate, ...data } = input;
        await db.updateCustomer(id, { ...data, ...(lastContactDate ? { lastContactDate: new Date(lastContactDate) as any } : {}) });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
    
    getStats: protectedProcedure.query(async () => {
      return await db.getCustomerStats();
    }),

    // Customer Interactions
    createInteraction: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        interactionType: z.enum(["call", "email", "meeting", "note"]),
        subject: z.string().optional(),
        notes: z.string().optional(),
        interactionDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { interactionDate, ...data } = input;
        await db.createInteraction({ ...data, interactionDate: new Date(interactionDate) as any, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getInteractions: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInteractionsByCustomer(input.customerId);
      }),
  }),

  // ============ Team Module ============
  team: router({
    addMember: protectedProcedure
      .input(z.object({
        employeeId: z.string(),
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        department: z.string().optional(),
        designation: z.string().optional(),
        joiningDate: z.string(),
        salary: z.string().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deprecated: Use hr.createEmployee instead",
        });
      }),
    
    getAllMembers: protectedProcedure.query(async () => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Deprecated: Use hr.getAllEmployees instead",
      });
    }),
    
    updateMember: protectedProcedure
      .input(z.object({
        id: z.number(),
        position: z.string().optional(),
        department: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deprecated: Use hr.updateEmployee instead",
        });
      }),

    // Attendance
    createAttendance: protectedProcedure
      .input(z.object({
        teamMemberId: z.number(),
        date: z.string(),
        status: z.enum(["present", "absent", "leave", "holiday"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { date, ...data } = input;
        await db.createAttendance({ ...data, date: new Date(date) as any, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getAttendanceByMonth: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(async ({ input }) => {
        return await db.getAttendanceByMonth(input.year, input.month);
      }),
    
    updateAttendance: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["present", "absent", "leave", "holiday"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAttendance(id, data);
        return { success: true };
      }),

    // Leave Requests
    createLeaveRequest: protectedProcedure
      .input(z.object({
        teamMemberId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        leaveType: z.enum(["sick", "vacation", "personal", "other"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { startDate, endDate, ...data } = input;
        await db.createLeaveRequest({
          ...data,
          startDate: new Date(startDate) as any,
          endDate: new Date(endDate) as any,
        });
        return { success: true };
      }),
    
    getAllLeaveRequests: protectedProcedure.query(async () => {
      return await db.getAllLeaveRequests();
    }),
    
    updateLeaveRequest: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        approvedBy: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        if (data.status && !data.approvedBy) {
          data.approvedBy = ctx.user.id;
        }
        await db.updateLeaveRequest(id, data);
        return { success: true };
      }),
  }),

  // ============ Ideas Module ============
  ideas: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createIdeaNote({ ...input, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllIdeaNotes();
    }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateIdeaNote(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIdeaNote(input.id);
        return { success: true };
      }),
  }),

  // ============ Dashboard Module ============
  dashboard: router({
    getOverview: protectedProcedure.query(async () => {
      const [arSummary, apSummary, projectStats, customerStats] = await Promise.all([
        db.getARSummary(),
        db.getAPSummary(),
        db.getProjectStats(),
        db.getCustomerStats(),
      ]);
      
      return {
        ar: arSummary,
        ap: apSummary,
        projects: projectStats,
        customers: customerStats,
      };
    }),
    
    getInsights: protectedProcedure.query(async () => {
      return await db.getRecentInsights(5);
    }),
    
    getNotifications: protectedProcedure.query(async () => {
      return await db.getRecentNotifications(10);
    }),
    
    getKPIs: protectedProcedure.query(async () => {
      return await db.getDashboardKPIs();
    }),
    
    getRevenueTrends: protectedProcedure.query(async () => {
      return await db.getRevenueTrends();
    }),
    
    getTopProducts: protectedProcedure.query(async () => {
      return await db.getTopProductsSales();
    }),
    
    getDepartmentDistribution: protectedProcedure.query(async () => {
      return await db.getDepartmentDistribution();
    }),
  }),

  // ============ Insights Module ============
  insights: router({
    generate: protectedProcedure.mutation(async () => {
      const arSummary = await db.getARSummary();
      const apSummary = await db.getAPSummary();
      const projectStats = await db.getProjectStats();
      const customerStats = await db.getCustomerStats();

      const prompt = `Analyze this business data and provide 2-3 key insights:

Financial:
- AR Total: $${arSummary.total}, Overdue: $${arSummary.overdue}
- AP Total: $${apSummary.total}, Overdue: $${apSummary.overdue}

Projects: ${JSON.stringify(projectStats)}
Customers: ${JSON.stringify(customerStats)}

Provide 2-3 actionable business insights.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a business analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "business_insights",
            strict: true,
            schema: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      summary: { type: "string" },
                      recommendations: { type: "string" },
                      insightType: { type: "string", enum: ["trend", "pattern", "anomaly"] }
                    },
                    required: ["title", "summary", "recommendations", "insightType"],
                    additionalProperties: false
                  }
                }
              },
              required: ["insights"],
              additionalProperties: false
            }
          }
        }
      });

      const rawContent = response.choices[0]?.message?.content || '{"insights":[]}';
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      const parsed = JSON.parse(content);
      const insights = parsed.insights || [];

      for (const insight of insights) {
        await db.createInsight({
          title: insight.title,
          summary: insight.summary,
          recommendations: insight.recommendations,
          insightType: insight.insightType,
        });
      }

      return { success: true, count: insights.length };
    }),
  }),

  // ============ Notifications Module ============
  notifications: router({
    checkAndNotify: protectedProcedure.mutation(async () => {
      const arSummary = await db.getARSummary();
      const apSummary = await db.getAPSummary();
      const alerts: string[] = [];

      if (Number(arSummary.overdue) > 0) {
        alerts.push(`⚠️ Overdue AR: $${arSummary.overdue}`);
      }
      if (Number(apSummary.overdue) > 0) {
        alerts.push(`⚠️ Overdue AP: $${apSummary.overdue}`);
      }

      if (alerts.length > 0) {
        await notifyOwner({
          title: "Dashboard Alert: Overdue Items Detected",
          content: alerts.join("\n"),
        });
        return { success: true, alertsSent: alerts.length };
      }

      return { success: true, alertsSent: 0 };
    }),
  }),

  // ============ Sales Tracking Module ============
  sales: router({
    // Get all sales
    getAll: protectedProcedure.query(async () => {
      return await db.getAllSales();
    }),

    // Products
    getAllProducts: protectedProcedure.query(async () => {
      return await db.getAllSalesProducts();
    }),

    createProduct: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.enum(["fan", "ess", "solar_pv", "epc_project", "testing", "installation", "other"]),
        unit: z.string().default("units"),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSalesProduct(input);
        return { success: true };
      }),

    updateProduct: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.enum(["fan", "ess", "solar_pv", "epc_project", "testing", "installation", "other"]).optional(),
        unit: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSalesProduct(id, data);
        return { success: true };
      }),

    deleteProduct: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSalesProduct(input.id);
        return { success: true };
      }),

    // Tracking
    getAllTracking: protectedProcedure.query(async () => {
      return await db.getAllSalesTracking();
    }),

    getTrackingByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getSalesTrackingByDateRange(new Date(input.startDate), new Date(input.endDate));
      }),

    createTracking: protectedProcedure
      .input(z.object({
        productId: z.number(),
        weekStartDate: z.string(),
        weekEndDate: z.string(),
        target: z.string(),
        actual: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSalesTracking({
          ...input,
          weekStartDate: new Date(input.weekStartDate),
          weekEndDate: new Date(input.weekEndDate),
        });
        return { success: true };
      }),

    updateTracking: protectedProcedure
      .input(z.object({
        id: z.number(),
        productId: z.number().optional(),
        weekStartDate: z.string().optional(),
        weekEndDate: z.string().optional(),
        target: z.string().optional(),
        actual: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, weekStartDate, weekEndDate, ...rest } = input;
        const data: any = { ...rest };
        if (weekStartDate) data.weekStartDate = new Date(weekStartDate);
        if (weekEndDate) data.weekEndDate = new Date(weekEndDate);
        await db.updateSalesTracking(id, data);
        return { success: true };
      }),

    deleteTracking: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSalesTracking(input.id);
        return { success: true };
      }),

    getPerformanceSummary: protectedProcedure.query(async () => {
      return await db.getSalesPerformanceSummary();
    }),

    bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        for (const id of input.ids) {
          await db.deleteSale(Number(id));
        }
        return { success: true, deleted: input.ids.length };
      }),
  }),

  // ============ User Management Module (Admin Only) ============
  users: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await db.getAllUsers();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        role: z.enum(["admin", "manager", "viewer", "user"]),
        openId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        
        // Check if user with this email already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User with this email already exists' });
        }
        
        // Create user with generated openId if not provided
        const openId = input.openId || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createUser({
          openId,
          name: input.name,
          email: input.email,
          loginMethod: 'manual',
          role: input.role,
        });
        
        return { success: true };
      }),

    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "manager", "viewer", "user"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    createWithPassword: adminProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["admin", "manager", "viewer", "user"]),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User with this email already exists' });
        }
        const user = await db.createUserWithPassword(input);
        return { success: true, userId: user.id };
      }),

    updatePassword: adminProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserPassword(input.userId, input.newPassword);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete your own account' });
        }
        await db.deleteUser(input.userId);
        return { success: true };
      }),
  }),

  // ============ Settings Module ============
  settings: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllSettings();
    }),

    getByKey: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSettingByKey(input.key);
      }),

    update: adminProcedure
      .input(z.object({
        settingKey: z.string(),
        settingValue: z.string(),
        category: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertSetting({
          settingKey: input.settingKey,
          settingValue: input.settingValue,
          category: input.category,
          settingType: "string",
          updatedBy: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // ============ Security & Admin Settings ============
  security: router({
    // Get all security settings
    getAll: adminProcedure.query(async () => {
      return await db.getAllSecuritySettings();
    }),

    // Update security setting
    update: adminProcedure
      .input(z.object({
        settingKey: z.string(),
        settingValue: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertSecuritySetting({
          settingKey: input.settingKey,
          settingValue: input.settingValue,
          description: input.description,
          updatedBy: ctx.user.id,
        });
        return { success: true };
      }),

    // Get login attempts
    getLoginAttempts: adminProcedure
      .input(z.object({
        limit: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getLoginAttempts(input.limit || 100, input.startDate, input.endDate);
      }),

    // Get blocked IPs
    getBlockedIPs: adminProcedure.query(async () => {
      return await db.getBlockedIPs();
    }),

    // Block IP
    blockIP: adminProcedure
      .input(z.object({
        ipAddress: z.string(),
        reason: z.string().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.blockIP({
          ipAddress: input.ipAddress,
          reason: input.reason,
          blockedBy: ctx.user.id,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        });
        return { success: true };
      }),

    // Unblock IP
    unblockIP: adminProcedure
      .input(z.object({ ipAddress: z.string() }))
      .mutation(async ({ input }) => {
        await db.unblockIP(input.ipAddress);
        return { success: true };
      }),

    // Get active sessions
    getActiveSessions: adminProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getActiveSessions(input.userId);
      }),

    // Terminate session
    terminateSession: adminProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        await db.terminateSession(input.sessionId);
        return { success: true };
      }),

    // Terminate all sessions for user
    terminateAllUserSessions: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await db.terminateAllUserSessions(input.userId);
        return { success: true };
      }),

    // Get audit logs
    getAuditLogs: adminProcedure
      .input(z.object({
        limit: z.number().optional(),
        userId: z.number().optional(),
        action: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAuditLogs({
          limit: input.limit,
          userId: input.userId,
          action: input.action,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),
  }),

  // ============ Display Preferences ============
  displayPreferences: router({
    // Get all display preferences
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDisplayPreferences(ctx.user.id);
    }),

    // Get global preferences (admin only)
    getGlobal: adminProcedure.query(async () => {
      return await db.getGlobalDisplayPreferences();
    }),

    // Update preference
    update: protectedProcedure
      .input(z.object({
        settingKey: z.string(),
        settingValue: z.string(),
        isGlobal: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admin can set global preferences
        if (input.isGlobal && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required for global settings' });
        }
        await db.upsertDisplayPreference({
          userId: input.isGlobal ? null : ctx.user.id,
          settingKey: input.settingKey,
          settingValue: input.settingValue,
          isGlobal: input.isGlobal || false,
        });
        return { success: true };
      }),
  }),

  // ============ User Management (Enhanced) ============
  userManagement: router({
    // Get all users with details
    getAllWithDetails: adminProcedure.query(async () => {
      return await db.getAllUsersWithDetails();
    }),

    // Create user with password
    createWithPassword: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["admin", "manager", "viewer", "user"]),
        password: z.string().min(8),
        mustChangePassword: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate password strength
        const passwordValidation = validatePasswordStrength(input.password);
        if (!passwordValidation.isValid) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Password does not meet requirements: ${passwordValidation.errors.join(', ')}` 
          });
        }

        // Check if email exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User with this email already exists' });
        }

        // Create user (db.createUserWithPassword handles hashing internally)
        await db.createUserWithPassword({
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
        });

        return { success: true };
      }),

    // Reset user password
    resetPassword: adminProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(8),
        mustChangePassword: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const passwordValidation = validatePasswordStrength(input.newPassword);
        if (!passwordValidation.isValid) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Password does not meet requirements: ${passwordValidation.errors.join(', ')}` 
          });
        }

        // db.updateUserPassword handles hashing internally
        await db.updateUserPassword(input.userId, input.newPassword);
        return { success: true };
      }),

    // Lock/Unlock user account
    toggleLock: adminProcedure
      .input(z.object({
        userId: z.number(),
        lock: z.boolean(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.lock) {
          // Lock for 24 hours by default
          const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await db.lockUserAccount(input.userId, lockedUntil);
        } else {
          await db.unlockUserAccount(input.userId);
        }
        return { success: true };
      }),

    // Force password change
    forcePasswordChange: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await db.forcePasswordChange(input.userId);
        return { success: true };
      }),
  }),

  // ============ Enhanced Sales Module ============
  salesEnhanced: router({
    // Daily Sales
    createDailySale: protectedProcedure
      .input(z.object({
        date: z.string(),
        productId: z.number(),
        productName: z.string(),
        quantity: z.string(),
        unitPrice: z.string(),
        totalAmount: z.string(),
        salespersonId: z.number(),
        salespersonName: z.string(),
        customerName: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createDailySale({ ...input, createdBy: ctx.user.id });
        return { success: true };
      }),

    getDailySales: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getDailySales(input.startDate, input.endDate);
      }),

    updateDailySale: protectedProcedure
      .input(z.object({
        id: z.number(),
        date: z.string(),
        productId: z.number(),
        productName: z.string(),
        quantity: z.string(),
        unitPrice: z.string(),
        totalAmount: z.string(),
        salespersonId: z.number(),
        salespersonName: z.string(),
        customerName: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateDailySale(id, data);
        return { success: true };
      }),

    archiveDailySale: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.archiveDailySale(input.id, ctx.user.id);
        return { success: true };
      }),

    getArchivedDailySales: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getArchivedDailySales(input.startDate, input.endDate);
      }),

    getAllArchivedDailySales: protectedProcedure
      .query(async () => {
        return await db.getAllArchivedDailySales();
      }),

    restoreDailySale: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.restoreDailySale(input.id);
        return { success: true };
      }),

    permanentlyDeleteDailySale: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.permanentlyDeleteDailySale(input.id);
        return { success: true };
      }),

    // Weekly Targets
    createWeeklyTarget: protectedProcedure
      .input(z.object({
        weekStartDate: z.string(),
        weekEndDate: z.string(),
        productId: z.number(),
        productName: z.string(),
        targetAmount: z.string(),
        salespersonId: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createWeeklyTarget({
          ...input,
          achievedAmount: "0",
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    getWeeklyTargets: protectedProcedure.query(async () => {
      return await db.getWeeklyTargets();
    }),

    // Monthly Targets
    createMonthlyTarget: protectedProcedure
      .input(z.object({
        month: z.number(),
        year: z.number(),
        productId: z.number(),
        productName: z.string(),
        targetAmount: z.string(),
        salespersonId: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createMonthlyTarget({
          ...input,
          achievedAmount: "0",
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    getMonthlyTargets: protectedProcedure.query(async () => {
      return await db.getMonthlyTargets();
    }),

    // Update Weekly Target
    updateWeeklyTarget: protectedProcedure
      .input(z.object({
        id: z.number(),
        targetAmount: z.string().optional(),
        salespersonId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWeeklyTarget(id, data);
        return { success: true };
      }),

    // Delete Weekly Target
    deleteWeeklyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWeeklyTarget(input.id);
        return { success: true };
      }),

    // Update Monthly Target
    updateMonthlyTarget: protectedProcedure
      .input(z.object({
        id: z.number(),
        targetAmount: z.string().optional(),
        salespersonId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMonthlyTarget(id, data);
        return { success: true };
      }),

    // Delete Monthly Target
    deleteMonthlyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMonthlyTarget(input.id);
        return { success: true };
      }),

    // Archive Weekly Target
    archiveWeeklyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.archiveWeeklyTarget(input.id, ctx.user.id);
        return { success: true };
      }),

    // Archive Monthly Target
    archiveMonthlyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.archiveMonthlyTarget(input.id, ctx.user.id);
        return { success: true };
      }),

    // Get Archived Weekly Targets
    getArchivedWeeklyTargets: protectedProcedure.query(async () => {
      return await db.getArchivedWeeklyTargets();
    }),

    // Get Archived Monthly Targets
    getArchivedMonthlyTargets: protectedProcedure.query(async () => {
      return await db.getArchivedMonthlyTargets();
    }),

    // Restore Weekly Target
    restoreWeeklyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.restoreWeeklyTarget(input.id);
        return { success: true };
      }),

    // Restore Monthly Target
    restoreMonthlyTarget: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.restoreMonthlyTarget(input.id);
        return { success: true };
      }),

    // Salespeople
    getSalespeople: protectedProcedure.query(async () => {
      return await db.getSalespeople();
    }),

    createSalesperson: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSalesperson(input);
        return { success: true };
      }),

    getProductById: protectedProcedure
      .input(z.object({
        productId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getProductById(input.productId);
      }),
  }),

  // ============ Income & Expenditure Module ============
  incomeExpenditure: router({
    create: protectedProcedure
      .input(z.object({
        date: z.string(),
        type: z.enum(["income", "expenditure"]),
        category: z.string().min(1, "Category is required"),
        subcategory: z.string().optional(),
        amount: z.string().refine(val => parseFloat(val) >= 0, "Amount cannot be negative"),
        currency: z.string().default("BDT"),
        description: z.string().optional(),
        referenceNumber: z.string().optional(),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createIncomeExpenditure({
          ...input,
          date: new Date(input.date),
          createdBy: ctx.user.id,
        } as any);
        return { success: true };
      }),

    getAll: protectedProcedure.query(async () => {
      return await db.getAllIncomeExpenditure();
    }),

    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getIncomeExpenditureByDateRange(input.startDate, input.endDate);
      }),

    getSummary: protectedProcedure.query(async () => {
      return await db.getIncomeExpenditureSummary();
    }),

    getIncomeByCategory: protectedProcedure.query(async () => {
      return await db.getIncomeByCategory();
    }),

    getExpenditureByCategory: protectedProcedure.query(async () => {
      return await db.getExpenditureByCategory();
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        date: z.string().optional(),
        type: z.enum(["income", "expenditure"]).optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        amount: z.string().refine(val => !val || parseFloat(val) >= 0, "Amount cannot be negative").optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        referenceNumber: z.string().optional(),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateIncomeExpenditure(id, data as Partial<any>);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIncomeExpenditure(input.id);
        return { success: true };
      }),
  }),

  // ============ Budget Module ============
  budget: router({  
    create: protectedProcedure
      .input(z.object({
        monthYear: z.string(), // Format: YYYY-MM
        type: z.enum(["income", "expenditure"]),
        category: z.string().min(1, "Category is required"),
        budgetAmount: z.string().refine(val => parseFloat(val) >= 0, "Budget amount cannot be negative"),
        currency: z.string().default("BDT"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createBudget({
          ...input,
          createdBy: ctx.user.id,
        } as any);
        return { success: true };
      }),

    getAll: protectedProcedure.query(async () => {
      return await db.getAllBudgets();
    }),

    getByMonthYear: protectedProcedure
      .input(z.object({ monthYear: z.string() }))
      .query(async ({ input }) => {
        return await db.getBudgetsByMonthYear(input.monthYear);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        budgetAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBudget(id, data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBudget(input.id);
        return { success: true };
      }),
  }),

  // ============ Action Tracker Module ============
  actionTracker: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["action", "decision", "issue", "opportunity"]),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
        tags: z.string().optional(),
        relatedModule: z.string().optional(),
        relatedId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { dueDate, ...data } = input;
        await db.createActionTracker({
          ...data,
          dueDate: dueDate ? (new Date(dueDate) as any) : undefined,
          createdBy: ctx.user.id
        });
        return { success: true };
      }),

    getAll: protectedProcedure.query(async () => {
      return await db.getAllActionTrackers();
    }),

    getByType: protectedProcedure
      .input(z.object({ type: z.enum(["action", "decision", "issue", "opportunity"]) }))
      .query(async ({ input }) => {
        return await db.getActionTrackersByType(input.type);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getActionTrackerById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["action", "decision", "issue", "opportunity"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
        resolvedDate: z.string().optional(),
        tags: z.string().optional(),
        relatedModule: z.string().optional(),
        relatedId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dueDate, resolvedDate, ...data } = input;
        await db.updateActionTracker(id, {
          ...data,
          dueDate: dueDate ? (new Date(dueDate) as any) : undefined,
          resolvedDate: resolvedDate ? (new Date(resolvedDate) as any) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteActionTracker(input.id);
        return { success: true };
      }),

    getOpen: protectedProcedure.query(async () => {
      return await db.getOpenActionTrackers();
    }),
  }),

  // ============ Tender/Quotation Tracking Module ============
  tenderQuotation: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["government_tender", "private_quotation"]),
        referenceId: z.string(),
        description: z.string(),
        clientName: z.string(),
        submissionDate: z.string(),
        followUpDate: z.string().optional(),
        status: z.enum(["not_started", "preparing", "submitted", "win", "loss", "po_received"]).optional(),
        estimatedValue: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { submissionDate, followUpDate, ...data } = input;
        await db.createTenderQuotation({
          ...data,
          submissionDate: new Date(submissionDate) as any,
          followUpDate: followUpDate ? (new Date(followUpDate) as any) : undefined,
          createdBy: ctx.user.id
        });
        return { success: true };
      }),

    getAll: protectedProcedure.query(async () => {
      return await db.getAllTenderQuotations();
    }),

    getByType: protectedProcedure
      .input(z.object({ type: z.enum(["government_tender", "private_quotation"]) }))
      .query(async ({ input }) => {
        return await db.getTenderQuotationsByType(input.type);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTenderQuotationById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["government_tender", "private_quotation"]).optional(),
        referenceId: z.string().optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
        submissionDate: z.string().optional(),
        followUpDate: z.string().optional(),
        status: z.enum(["not_started", "preparing", "submitted", "win", "loss", "po_received"]).optional(),
        estimatedValue: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        transferredToProjectId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, submissionDate, followUpDate, ...data } = input;
        
        // Auto-transfer to Projects if status is "win" or "po_received"
        if ((data.status === "win" || data.status === "po_received") && !data.transferredToProjectId) {
          const tender = await db.getTenderQuotationById(id);
          if (tender && !tender.transferredToProjectId) {
            // Create new project from tender/quotation
            const projectResult = await db.createProject({
              name: tender.description,
              customerName: tender.clientName,
              stage: "won",
              value: tender.estimatedValue || "0",
              currency: tender.currency,
              startDate: new Date() as any,
              description: `Created from ${tender.type === "government_tender" ? "Government Tender" : "Private Quotation"}: ${tender.referenceId}`,
              createdBy: ctx.user.id
            });
            
            // Update tender with project ID
            if (projectResult && projectResult[0]) {
              data.transferredToProjectId = projectResult[0].id;
            }
          }
        }
        
        // Build update data with proper date handling
        const updateData: any = {
          ...data,
          submissionDate: submissionDate ? (new Date(submissionDate) as any) : undefined,
          followUpDate: followUpDate ? (new Date(followUpDate) as any) : undefined,
        };
        
        // Auto-archive if status is "loss" - set archivedAt in the same update
        if (data.status === "loss") {
          updateData.archivedAt = new Date();
        }
        
        await db.updateTenderQuotation(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTenderQuotation(input.id);
        return { success: true };
      }),

    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.archiveTenderQuotation(input.id);
        return { success: true };
      }),

    restore: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateTenderQuotation(input.id, { archivedAt: null } as any);
        return { success: true };
      }),

    getOverdue: protectedProcedure.query(async () => {
      return await db.getOverdueTenderQuotations();
    }),

    getUpcoming: protectedProcedure
      .input(z.object({ daysAhead: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getUpcomingTenderQuotations(input.daysAhead || 3);
      }),

    // Quotation Items
    getQuotationItems: publicProcedure
      .input(z.object({ quotationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuotationItems(input.quotationId);
      }),

    createQuotationItem: protectedProcedure
      .input(z.object({
        quotationId: z.number(),
        description: z.string(),
        specifications: z.string().optional(),
        quantity: z.number().min(0, "Quantity cannot be negative"),
        unit: z.string(),
        unitPrice: z.number().min(0, "Unit price cannot be negative"),
        amount: z.number().min(0, "Amount cannot be negative"),
        discount: z.number().min(0).max(100, "Discount must be 0-100%"),
        discountAmount: z.number().min(0, "Discount amount cannot be negative"),
        finalAmount: z.number().min(0, "Final amount cannot be negative"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Convert numbers to strings for decimal fields
        const processedInput = {
          ...input,
          quantity: String(input.quantity),
          unitPrice: String(input.unitPrice),
          amount: String(input.amount),
          discount: String(input.discount),
          discountAmount: String(input.discountAmount),
          finalAmount: String(input.finalAmount),
        };
        return await db.createQuotationItem(processedInput as any);
      }),

    updateQuotationItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        specifications: z.string().optional(),
        quantity: z.number().optional(),
        unit: z.string().optional(),
        unitPrice: z.number().optional(),
        amount: z.number().optional(),
        discount: z.number().optional(),
        discountAmount: z.number().optional(),
        finalAmount: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // Convert numbers to strings for decimal fields
        const processedData: any = { ...data };
        if (data.quantity !== undefined) processedData.quantity = String(data.quantity);
        if (data.unitPrice !== undefined) processedData.unitPrice = String(data.unitPrice);
        if (data.amount !== undefined) processedData.amount = String(data.amount);
        if (data.discount !== undefined) processedData.discount = String(data.discount);
        if (data.discountAmount !== undefined) processedData.discountAmount = String(data.discountAmount);
        if (data.finalAmount !== undefined) processedData.finalAmount = String(data.finalAmount);
        return await db.updateQuotationItem(id, processedData);
      }),

    deleteQuotationItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteQuotationItem(input.id);
      }),

    getQuotationTotal: publicProcedure
      .input(z.object({ quotationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuotationTotal(input.quotationId);
      }),
  }),

  // ============ Transaction Types ============
  transactionTypes: router({
    getAll: protectedProcedure.query(async () => {
      return await db.getAllTransactionTypes();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        code: z.string(),
        category: z.enum(["income", "expense"]),
        description: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createTransactionType(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        category: z.enum(["income", "expense"]).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTransactionType(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTransactionType(input.id);
        return { success: true };
      }),
  }),

  // ============ Permissions ============
  permissions: router({
    getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
      const permissions = await db.getUserPermissions(ctx.user.id);
      // If no permissions set, return defaults based on role
      if (permissions.length === 0) {
        return db.getDefaultPermissionsByRole(ctx.user.role);
      }
      return permissions;
    }),

    getUserPermissions: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserPermissions(input.userId);
      }),

    setUserPermissions: adminProcedure
      .input(z.object({
        userId: z.number(),
        permissions: z.array(z.object({
          moduleName: z.string(),
          canView: z.boolean(),
          canCreate: z.boolean(),
          canEdit: z.boolean(),
          canDelete: z.boolean(),
        })),
      }))
      .mutation(async ({ input }) => {
        await db.setUserPermissionsBulk(input.userId, input.permissions);
        return { success: true };
      }),
  }),

  // ============ Attachments ============
  attachments: router({
    getByEntity: protectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getAttachmentsByEntity(input.entityType, input.entityId);
      }),

    upload: protectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Convert base64 to buffer and upload to S3
        const base64Data = input.fileData.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `attachments/${input.entityType}/${input.entityId}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.fileType);
        
        // Save to database
        await db.createAttachmentRecord({
          entityType: input.entityType as any,
          entityId: input.entityId,
          fileName: input.fileName,
          fileUrl: url,
          fileType: input.fileType,
          fileSize: input.fileSize,
          uploadedBy: ctx.user.id,
        });
        
        return { success: true, url };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAttachmentRecord(input.id);
        return { success: true };
      }),
  }),

  // ============ HR Module ============
  hr: router({
    getDashboardStats: protectedProcedure.query(async () => {
      return await db.getHRDashboardStats();
    }),

    getAllEmployees: protectedProcedure.query(async () => {
      return await db.getAllEmployees();
    }),

    getPendingLeaveApplications: protectedProcedure.query(async () => {
      return await db.getPendingLeaveApplications();
    }),

    getAllDepartments: protectedProcedure.query(async () => {
      return await db.getAllDepartments();
    }),

    createDepartment: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        headId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createDepartment(input);
        return { success: true };
      }),

    createEmployee: adminProcedure
      .input(z.object({
        userId: z.number(),
        employeeCode: z.string(),
        departmentId: z.number().optional(),
        positionId: z.number().optional(),
        jobTitle: z.string().optional(),
        employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
        joinDate: z.string(),
        contractEndDate: z.string().optional(),
        managerId: z.number().optional(),
        salaryGrade: z.string().optional(),
        workLocation: z.string().optional(),
        workSchedule: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { joinDate, contractEndDate, ...rest } = input;
        const parsedJoinDate = new Date(joinDate);
        const parsedContractEndDate = contractEndDate ? new Date(contractEndDate) : undefined;
        
        // Check if user already has an employee record
        const existingEmployee = await db.getEmployeeByUserId(input.userId);
        if (existingEmployee) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'This user already has an employee record. Please select a different user or edit the existing employee record.' 
          });
        }
        
        await db.createEmployee({
          ...rest,
          joinDate: parsedJoinDate.toISOString().split('T')[0] as any,
          contractEndDate: parsedContractEndDate ? parsedContractEndDate.toISOString().split('T')[0] as any : undefined,
          status: "active",
        });
        return { success: true };
      }),

    updateEmployee: adminProcedure
      .input(z.object({
        id: z.number(),
        jobTitle: z.string().optional(),
        departmentId: z.number().optional(),
        positionId: z.number().optional(),
        employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
        contractEndDate: z.string().optional(),
        managerId: z.number().optional(),
        salaryGrade: z.string().optional(),
        workLocation: z.string().optional(),
        workSchedule: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        status: z.enum(["active", "on_leave", "terminated"]).optional(),
        terminationDate: z.string().optional(),
        terminationReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, contractEndDate, terminationDate, ...rest } = input;
        await db.updateEmployee(id, {
          ...rest,
          contractEndDate: contractEndDate ? new Date(contractEndDate) as any : undefined,
          terminationDate: terminationDate ? new Date(terminationDate) as any : undefined,
        });
        return { success: true };
      }),

    getJobDescriptions: protectedProcedure.query(async () => {
      return await db.getJobDescriptions();
    }),

    createJobDescription: adminProcedure
      .input(z.object({
        positionId: z.number(),
        title: z.string(),
        summary: z.string().optional(),
        responsibilities: z.string().optional(),
        qualifications: z.string().optional(),
        requirements: z.string().optional(),
        salaryRange: z.string().optional(),
        reportingTo: z.string().optional(),
        department: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createJobDescription(input);
        return { success: true };
      }),

    getEmployeeRoles: protectedProcedure.query(async () => {
      return await db.getEmployeeRoles();
    }),

    createEmployeeRole: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        permissions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createEmployeeRole(input);
        return { success: true };
      }),

    getEmployeeConfidential: adminProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployeeConfidential(input.employeeId);
      }),

    updateEmployeeConfidential: adminProcedure
      .input(z.object({
        employeeId: z.number(),
        baseSalary: z.string().optional(),
        currency: z.string().optional(),
        benefits: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        bankName: z.string().optional(),
        taxId: z.string().optional(),
        ssn: z.string().optional(),
        medicalRecords: z.string().optional(),
        emergencyContactRelation: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateEmployeeConfidential(input.employeeId, input);
        return { success: true };
      }),
    // Onboarding Management
    getOnboardingTemplates: protectedProcedure.query(async () => {
      return await db.getOnboardingTemplates();
    }),
    createOnboardingTemplate: adminProcedure
      .input(z.object({
        taskName: z.string(),
        taskCategory: z.enum(["documents", "equipment", "training", "access", "introduction", "other"]),
        description: z.string().optional(),
        daysFromStart: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createOnboardingTemplate(input);
        return { success: true };
      }),
    deleteOnboardingTemplate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOnboardingTemplate(input.id);
        return { success: true };
      }),
    getOnboardingTasks: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOnboardingTasksForEmployee(input.employeeId);
      }),
    initializeOnboarding: adminProcedure
      .input(z.object({ employeeId: z.number(), joinDate: z.string() }))
      .mutation(async ({ input }) => {
        const tasks = await db.createOnboardingTasksFromTemplates(input.employeeId, new Date(input.joinDate));
        return { success: true, tasks };
      }),
    updateOnboardingTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        completed: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateOnboardingTask(input.taskId, {
          completed: input.completed,
          notes: input.notes,
          completedBy: ctx.user.id,
        });
        return { success: true };
      }),
    addOnboardingTask: adminProcedure
      .input(z.object({
        employeeId: z.number(),
        taskName: z.string(),
        taskCategory: z.enum(["documents", "equipment", "training", "access", "introduction", "other"]),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addOnboardingTask(input.employeeId, input);
        return { success: true };
      }),
    deleteOnboardingTask: adminProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOnboardingTask(input.taskId);
        return { success: true };
      }),
    getOnboardingProgress: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOnboardingProgress(input.employeeId);
      }),
  }),

  // ============ Products Module ============
  products: router({
    // Product Categories
    getCategories: protectedProcedure.query(async () => {
      return await db.getProductCategories();
    }),

    getAllCategories: protectedProcedure.query(async () => {
      return await db.getAllProductCategories();
    }),

    createCategory: protectedProcedure
      .input(z.object({
        name: z.string(),
        code: z.string().optional(),
        description: z.string().optional(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductCategory(input);
        return { success: true };
      }),

    updateCategory: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        parentId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductCategory(id, data);
        return { success: true };
      }),

    deleteCategory: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductCategory(input.id);
        return { success: true };
      }),

    // Product Units
    getUnits: protectedProcedure.query(async () => {
      return await db.getProductUnits();
    }),

    getAllUnits: protectedProcedure.query(async () => {
      return await db.getAllProductUnits();
    }),

    createUnit: protectedProcedure
      .input(z.object({
        name: z.string(),
        shortName: z.string(),
        allowDecimal: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductUnit(input);
        return { success: true };
      }),

    updateUnit: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        shortName: z.string().optional(),
        allowDecimal: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductUnit(id, data);
        return { success: true };
      }),

    deleteUnit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductUnit(input.id);
        return { success: true };
      }),

    // Product Brands
    getBrands: protectedProcedure.query(async () => {
      return await db.getProductBrands();
    }),

    getAllBrands: protectedProcedure.query(async () => {
      return await db.getAllProductBrands();
    }),

    createBrand: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductBrand(input);
        return { success: true };
      }),

    updateBrand: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductBrand(id, data);
        return { success: true };
      }),

    deleteBrand: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductBrand(input.id);
        return { success: true };
      }),

    // Product Warranties
    getWarranties: protectedProcedure.query(async () => {
      return await db.getProductWarranties();
    }),

    getAllWarranties: protectedProcedure.query(async () => {
      return await db.getAllProductWarranties();
    }),

    createWarranty: protectedProcedure
      .input(z.object({
        name: z.string(),
        duration: z.number(),
        durationUnit: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductWarranty(input);
        return { success: true };
      }),

    updateWarranty: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        duration: z.number().optional(),
        durationUnit: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductWarranty(id, data);
        return { success: true };
      }),

    deleteWarranty: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductWarranty(input.id);
        return { success: true };
      }),

    // Selling Price Groups
    getPriceGroups: protectedProcedure.query(async () => {
      return await db.getSellingPriceGroups();
    }),

    createPriceGroup: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSellingPriceGroup(input);
        return { success: true };
      }),

    updatePriceGroup: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSellingPriceGroup(id, data);
        return { success: true };
      }),

    deletePriceGroup: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSellingPriceGroup(input.id);
        return { success: true };
      }),

    // Product Variations
    getVariations: protectedProcedure.query(async () => {
      return await db.getProductVariations();
    }),

    createVariation: protectedProcedure
      .input(z.object({
        name: z.string(),
        values: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductVariation(input);
        return { success: true };
      }),

    updateVariation: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        values: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductVariation(id, data);
        return { success: true };
      }),

    deleteVariation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductVariation(input.id);
        return { success: true };
      }),

    // Products - Active & Archived
    getActiveProducts: protectedProcedure.query(async () => {
      return await db.getActiveProducts();
    }),

    getArchivedProducts: protectedProcedure.query(async () => {
      return await db.getArchivedProducts();
    }),

    createProduct: protectedProcedure
      .input(z.object({
        name: z.string(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        categoryId: z.number().optional(),
        unitId: z.number().optional(),
        brandId: z.number().optional(),
        warrantyId: z.number().optional(),
        unit: z.string().optional(),
        description: z.string().optional(),
        purchasePrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        taxRate: z.string().optional(),
        alertQuantity: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Sanitize empty strings to undefined for optional fields
        const sanitized = {
          ...input,
          sku: input.sku || undefined,
          barcode: input.barcode || undefined,
          description: input.description || undefined,
          purchasePrice: input.purchasePrice || undefined,
          sellingPrice: input.sellingPrice || undefined,
          taxRate: input.taxRate || undefined,
        };
        await db.createProductFull(sanitized as any);
        return { success: true };
      }),

    updateProduct: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        categoryId: z.number().optional(),
        unitId: z.number().optional(),
        brandId: z.number().optional(),
        warrantyId: z.number().optional(),
        unit: z.string().optional(),
        description: z.string().optional(),
        purchasePrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        taxRate: z.string().optional(),
        alertQuantity: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // Sanitize empty strings to undefined for optional fields
        const sanitized = {
          ...data,
          sku: data.sku || undefined,
          barcode: data.barcode || undefined,
          description: data.description || undefined,
          purchasePrice: data.purchasePrice || undefined,
          sellingPrice: data.sellingPrice || undefined,
          taxRate: data.taxRate || undefined,
        };
        await db.updateProductFull(id, sanitized as any);
        return { success: true };
      }),

    archiveProduct: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.archiveProduct(input.id, ctx.user.id);
        return { success: true };
      }),

    restoreProduct: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.restoreProduct(input.id);
        return { success: true };
      }),

    // ============ INVENTORY MANAGEMENT ============
    
    // Warehouses
    getWarehouses: protectedProcedure.query(async () => {
      return await db.getWarehouses();
    }),

    getAllWarehouses: protectedProcedure.query(async () => {
      return await db.getAllWarehouses();
    }),

    createWarehouse: protectedProcedure
      .input(z.object({
        name: z.string(),
        code: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        isDefault: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createWarehouse(input as any);
        return { success: true };
      }),

    updateWarehouse: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        isDefault: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWarehouse(id, data as any);
        return { success: true };
      }),

    deleteWarehouse: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWarehouse(input.id);
        return { success: true };
      }),

    // Inventory
    getProductsWithInventory: protectedProcedure.query(async () => {
      return await db.getProductsWithInventory();
    }),

    getProductInventory: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductInventory(input.productId);
      }),

    getInventoryByWarehouse: protectedProcedure
      .input(z.object({ warehouseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryByWarehouse(input.warehouseId);
      }),

    getAllInventoryWithProducts: protectedProcedure.query(async () => {
      return await db.getAllInventoryWithProducts();
    }),

    updateInventory: protectedProcedure
      .input(z.object({
        productId: z.number(),
        warehouseId: z.number(),
        quantity: z.string(),
        minStockLevel: z.string().optional(),
        maxStockLevel: z.string().optional(),
        reorderPoint: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createOrUpdateInventory({
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantity: input.quantity,
          minStockLevel: input.minStockLevel || undefined,
          maxStockLevel: input.maxStockLevel || undefined,
          reorderPoint: input.reorderPoint || undefined,
        } as any);
        return { success: true };
      }),

    adjustStock: protectedProcedure
      .input(z.object({
        productId: z.number(),
        warehouseId: z.number(),
        quantityChange: z.number(),
        transactionType: z.enum(["purchase", "sale", "adjustment", "transfer_in", "transfer_out", "return", "damage", "opening_stock"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateInventoryQuantity(
          input.productId,
          input.warehouseId,
          input.quantityChange,
          input.transactionType,
          ctx.user?.id,
          input.notes
        );
        return { success: true };
      }),

    getInventoryTransactions: protectedProcedure
      .input(z.object({
        productId: z.number().optional(),
        warehouseId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInventoryTransactions(input.productId, input.warehouseId, input.limit);
      }),

    // Product Dashboard Stats
    getSalesTrends: protectedProcedure.query(async () => {
      return await db.getProductSalesTrends();
    }),

    getRevenueStats: protectedProcedure.query(async () => {
      return await db.getProductRevenueStats();
    }),

    getTopSellingProducts: protectedProcedure.query(async () => {
      return await db.getTopSellingProducts(5);
    }),

    getTopCategory: protectedProcedure.query(async () => {
      return await db.getTopCategory();
    }),
  }),
});

export type AppRouter = typeof appRouter;
