import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin-only procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const hrExtendedRouter = {
  // ============ Employee Management ============
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
      await db.createEmployee({
        ...rest,
        joinDate: new Date(joinDate) as any,
        contractEndDate: contractEndDate ? new Date(contractEndDate) as any : undefined,
        status: "active",
      });
      return { success: true };
    }),

  getEmployeeById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getEmployeeById(input.id);
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

  deleteEmployee: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateEmployee(input.id, { status: "terminated" });
      return { success: true };
    }),

  // ============ Job Descriptions ============
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

  updateJobDescription: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      summary: z.string().optional(),
      responsibilities: z.string().optional(),
      qualifications: z.string().optional(),
      requirements: z.string().optional(),
      salaryRange: z.string().optional(),
      reportingTo: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateJobDescription(id, data);
      return { success: true };
    }),

  deleteJobDescription: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteJobDescription(input.id);
      return { success: true };
    }),

  // ============ Employee Roles ============
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

  updateEmployeeRole: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      permissions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateEmployeeRole(id, data);
      return { success: true };
    }),

  deleteEmployeeRole: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteEmployeeRole(input.id);
      return { success: true };
    }),

  // ============ Employee Confidential Information (Admin Only) ============
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
};
