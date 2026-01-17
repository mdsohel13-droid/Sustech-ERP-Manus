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
import { storagePut } from "./storage";
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

  // ============ Income & Expenditure Module ============
  incomeExpenditure: router({
    create: protectedProcedure
      .input(z.object({
        date: z.string(),
        type: z.enum(["income", "expenditure"]),
        category: z.string(),
        subcategory: z.string().optional(),
        amount: z.string(),
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
        amount: z.string().optional(),
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
        category: z.string(),
        budgetAmount: z.string(),
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
      .mutation(async ({ input }) => {
        const { id, submissionDate, followUpDate, ...data } = input;
        
        // Auto-transfer to Projects if status is "po_received"
        if (data.status === "po_received" && !data.transferredToProjectId) {
          const tender = await db.getTenderQuotationById(id);
          if (tender) {
            // Create new project from tender/quotation
            const projectResult = await db.createProject({
              name: tender.description,
              customerName: tender.clientName,
              stage: "lead",
              value: tender.estimatedValue || "0",
              currency: tender.currency,
              startDate: new Date() as any,
              description: `Transferred from ${tender.type === "government_tender" ? "Government Tender" : "Private Quotation"}: ${tender.referenceId}`,
              createdBy: tender.createdBy
            });
            
            // Update tender with project ID
            data.transferredToProjectId = Number(projectResult[0].insertId);
          }
        }
        
        // Archive if status is "loss"
        if (data.status === "loss") {
          await db.archiveTenderQuotation(id);
        }
        
        await db.updateTenderQuotation(id, {
          ...data,
          submissionDate: submissionDate ? (new Date(submissionDate) as any) : undefined,
          followUpDate: followUpDate ? (new Date(followUpDate) as any) : undefined,
        });
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

    getOverdue: protectedProcedure.query(async () => {
      return await db.getOverdueTenderQuotations();
    }),

    getUpcoming: protectedProcedure
      .input(z.object({ daysAhead: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getUpcomingTenderQuotations(input.daysAhead || 3);
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
  }),
});

export type AppRouter = typeof appRouter;
