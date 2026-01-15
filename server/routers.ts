import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

// Admin-only procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Financial Module ============
  financial: router({
    // Accounts Receivable
    createAR: protectedProcedure
      .input(z.object({
        customerName: z.string(),
        amount: z.string(),
        dueDate: z.string(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { dueDate, ...data } = input;
        await db.createAR({ ...data, dueDate: new Date(dueDate) as any, createdBy: ctx.user.id });
        return { success: true };
      }),
    
    getAllAR: protectedProcedure.query(async () => {
      return await db.getAllAR();
    }),
    
    updateAR: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerName: z.string().optional(),
        amount: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(["pending", "overdue", "paid"]).optional(),
        invoiceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dueDate, ...data } = input;
        await db.updateAR(id, { ...data, ...(dueDate ? { dueDate: new Date(dueDate) as any } : {}) });
        return { success: true };
      }),
    
    deleteAR: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAR(input.id);
        return { success: true };
      }),
    
    getARSummary: protectedProcedure.query(async () => {
      return await db.getARSummary();
    }),

    // Accounts Payable
    createAP: protectedProcedure
      .input(z.object({
        vendorName: z.string(),
        amount: z.string(),
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
    
    getAPSummary: protectedProcedure.query(async () => {
      return await db.getAPSummary();
    }),

    // Sales
    createSale: protectedProcedure
      .input(z.object({
        productType: z.enum(["fan", "ess", "solar_pv", "projects", "testing", "installation"]),
        weekNumber: z.number().min(1).max(4),
        monthYear: z.string(),
        target: z.string().optional(),
        actual: z.string().optional(),
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
        await db.createTeamMember({
          ...input,
          joiningDate: new Date(input.joiningDate),
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    
    getAllMembers: protectedProcedure.query(async () => {
      return await db.getAllTeamMembers();
    }),
    
    updateMember: protectedProcedure
      .input(z.object({
        id: z.number(),
        position: z.string().optional(),
        department: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTeamMember(id, data);
        return { success: true };
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

Provide insights in JSON format:
[{"title": "...", "summary": "...", "recommendations": "...", "insightType": "trend|pattern|anomaly"}]`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });

      const rawContent = response.choices[0]?.message?.content || "[]";
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      const insights = JSON.parse(content.replace(/```json\n?|```/g, ""));

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
  }),

  // ============ User Management Module (Admin Only) ============
  users: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await db.getAllUsers();
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
      .mutation(async ({ input }) => {
        await db.createDailySale(input);
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
      .mutation(async ({ input }) => {
        await db.createWeeklyTarget({
          ...input,
          achievedAmount: "0",
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
      .mutation(async ({ input }) => {
        await db.createMonthlyTarget({
          ...input,
          achievedAmount: "0",
        });
        return { success: true };
      }),

    getMonthlyTargets: protectedProcedure.query(async () => {
      return await db.getMonthlyTargets();
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
  }),
});

export type AppRouter = typeof appRouter;
