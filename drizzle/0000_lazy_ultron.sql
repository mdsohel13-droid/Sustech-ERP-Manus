CREATE TYPE "public"."action_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('action', 'decision', 'issue', 'opportunity');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'leave', 'holiday');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'view', 'export');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."commission_history_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."commission_transaction_status" AS ENUM('earned', 'pending', 'paid');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('percentage', 'fixed', 'tiered');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('post', 'ad', 'story', 'video', 'image', 'article');--> statement-breakpoint
CREATE TYPE "public"."critical_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('hot', 'warm', 'cold');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'on_leave', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'intern');--> statement-breakpoint
CREATE TYPE "public"."enhanced_attendance_status" AS ENUM('present', 'absent', 'late', 'half_day', 'wfh', 'on_leave');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('project', 'tender_quotation', 'sale', 'customer', 'financial_transaction', 'income_expenditure', 'employee', 'action_tracker');--> statement-breakpoint
CREATE TYPE "public"."income_expenditure_type" AS ENUM('income', 'expenditure');--> statement-breakpoint
CREATE TYPE "public"."insight_type" AS ENUM('financial', 'project', 'customer', 'team', 'general', 'pattern', 'trend', 'alert');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('call', 'email', 'meeting', 'note');--> statement-breakpoint
CREATE TYPE "public"."kpi_period" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."kpi_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."leave_application_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('sick', 'vacation', 'personal', 'other');--> statement-breakpoint
CREATE TYPE "public"."login_attempt_type" AS ENUM('success', 'failed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."marketing_status" AS ENUM('planning', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."marketing_type" AS ENUM('social_media', 'email', 'sms', 'event', 'content', 'branding', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ar_overdue', 'project_status', 'attendance_anomaly', 'threshold_breach');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('draft', 'approved', 'processed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('fan', 'ess', 'solar_pv', 'epc_project', 'testing', 'installation', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('fan', 'ess', 'solar_pv', 'projects', 'testing', 'installation');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('lead', 'proposal', 'won', 'execution', 'testing');--> statement-breakpoint
CREATE TYPE "public"."reminder_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'completed', 'snoozed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('client_followup', 'lead_followup', 'task', 'meeting', 'other');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('draft', 'submitted', 'acknowledged');--> statement-breakpoint
CREATE TYPE "public"."setting_type" AS ENUM('string', 'number', 'boolean', 'json');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'overdue', 'paid');--> statement-breakpoint
CREATE TYPE "public"."team_member_status" AS ENUM('active', 'on_leave', 'resigned', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('not_started', 'preparing', 'submitted', 'win', 'loss', 'po_received');--> statement-breakpoint
CREATE TYPE "public"."tender_type" AS ENUM('government_tender', 'private_quotation');--> statement-breakpoint
CREATE TYPE "public"."transaction_category" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('revenue', 'purchase', 'expense', 'cogs', 'wacc');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'viewer', 'user');--> statement-breakpoint
CREATE TYPE "public"."yes_no" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TABLE "accounts_payable" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorName" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"dueDate" date NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"invoiceNumber" varchar(100),
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts_receivable" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerName" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"dueDate" date NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"invoiceNumber" varchar(100),
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_tracker" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "action_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "action_status" DEFAULT 'open' NOT NULL,
	"priority" "critical_priority" DEFAULT 'medium' NOT NULL,
	"assignedTo" integer,
	"dueDate" date,
	"resolvedDate" date,
	"tags" text,
	"relatedModule" varchar(100),
	"relatedId" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"reminderType" "reminder_type" NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"descriptionBangla" text,
	"dueDate" date NOT NULL,
	"priority" "reminder_priority" DEFAULT 'medium' NOT NULL,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"assignedTo" integer NOT NULL,
	"aiGenerated" "yes_no" DEFAULT 'yes' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archived_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleName" varchar(100) NOT NULL,
	"itemId" integer NOT NULL,
	"itemData" text NOT NULL,
	"deletedBy" integer NOT NULL,
	"deletedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(100),
	"file_size" integer,
	"uploaded_by" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamMemberId" integer NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"date" date NOT NULL,
	"clockIn" timestamp,
	"clockOut" timestamp,
	"workHours" numeric(5, 2),
	"status" "enhanced_attendance_status" NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"action" "audit_action" NOT NULL,
	"module" varchar(100) NOT NULL,
	"entityType" varchar(100) NOT NULL,
	"entityId" varchar(100) NOT NULL,
	"entityName" varchar(255),
	"oldValues" text,
	"newValues" text,
	"changes" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"status" "audit_status" DEFAULT 'success' NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_ips" (
	"id" serial PRIMARY KEY NOT NULL,
	"ipAddress" varchar(45) NOT NULL,
	"reason" text,
	"blockedBy" integer,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blocked_ips_ipAddress_unique" UNIQUE("ipAddress")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"month_year" varchar(7) NOT NULL,
	"type" "income_expenditure_type" NOT NULL,
	"category" varchar(100) NOT NULL,
	"budget_amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"salespersonName" varchar(255) NOT NULL,
	"period" varchar(10) NOT NULL,
	"totalSalesAmount" numeric(15, 2) NOT NULL,
	"totalSalesCount" integer DEFAULT 0 NOT NULL,
	"commissionRate" numeric(5, 2) NOT NULL,
	"commissionAmount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"status" "commission_history_status" DEFAULT 'pending' NOT NULL,
	"payoutDate" date,
	"paymentMethod" varchar(50),
	"transactionId" varchar(100),
	"notes" text,
	"approvedBy" integer,
	"approvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"payoutPeriod" varchar(10) NOT NULL,
	"totalPayoutAmount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"status" "payout_status" DEFAULT 'draft' NOT NULL,
	"payoutDate" date,
	"approvedBy" integer,
	"approvedAt" timestamp,
	"processedBy" integer,
	"processedAt" timestamp,
	"notes" text,
	"attachmentUrl" varchar(500),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"commissionType" "commission_type" DEFAULT 'percentage' NOT NULL,
	"baseRate" numeric(5, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"effectiveFrom" date NOT NULL,
	"effectiveTo" date,
	"isActive" boolean DEFAULT true NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"commissionRateId" integer NOT NULL,
	"tierName" varchar(100) NOT NULL,
	"minAmount" numeric(15, 2) NOT NULL,
	"maxAmount" numeric(15, 2),
	"commissionPercentage" numeric(5, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"dailySalesId" integer NOT NULL,
	"saleAmount" numeric(15, 2) NOT NULL,
	"commissionRate" numeric(5, 2) NOT NULL,
	"commissionAmount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"period" varchar(10) NOT NULL,
	"status" "commission_transaction_status" DEFAULT 'earned' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromCurrency" varchar(3) NOT NULL,
	"toCurrency" varchar(3) NOT NULL,
	"rate" numeric(15, 6) NOT NULL,
	"effectiveDate" date NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"interactionType" "interaction_type" NOT NULL,
	"subject" varchar(255),
	"notes" text,
	"interactionDate" date NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320),
	"phone" varchar(50),
	"company" varchar(255),
	"status" "customer_status" DEFAULT 'warm' NOT NULL,
	"lastContactDate" date,
	"nextActionRequired" text,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unitPrice" numeric(15, 2) NOT NULL,
	"totalAmount" numeric(15, 2) NOT NULL,
	"salespersonId" integer NOT NULL,
	"salespersonName" varchar(255) NOT NULL,
	"customerName" varchar(255),
	"notes" text,
	"isArchived" boolean DEFAULT false NOT NULL,
	"archivedAt" timestamp,
	"archivedBy" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"insightType" "insight_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"recommendations" text,
	"dataSnapshot" text,
	"generatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"headId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "display_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"settingKey" varchar(100) NOT NULL,
	"settingValue" text,
	"isGlobal" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_confidential" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"base_salary" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"benefits" text,
	"bank_account_number" varchar(100),
	"bank_name" varchar(100),
	"tax_id" varchar(100),
	"ssn" varchar(50),
	"medical_records" text,
	"emergency_contact_relation" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_confidential_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "employee_kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamMemberId" integer NOT NULL,
	"kpiName" varchar(255) NOT NULL,
	"kpiDescription" text,
	"measurementUnit" varchar(50) NOT NULL,
	"targetValue" numeric(15, 2) NOT NULL,
	"currentValue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"period" "kpi_period" NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"status" "kpi_status" DEFAULT 'active' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"permissions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"employeeCode" varchar(50) NOT NULL,
	"departmentId" integer,
	"positionId" integer,
	"jobTitle" varchar(100),
	"employmentType" "employment_type" DEFAULT 'full_time' NOT NULL,
	"joinDate" date NOT NULL,
	"contractEndDate" date,
	"managerId" integer,
	"salaryGrade" varchar(50),
	"workLocation" varchar(100),
	"workSchedule" varchar(100),
	"emergencyContactName" varchar(100),
	"emergencyContactPhone" varchar(50),
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"terminationDate" date,
	"terminationReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_userId_unique" UNIQUE("userId"),
	CONSTRAINT "employees_employeeCode_unique" UNIQUE("employeeCode")
);
--> statement-breakpoint
CREATE TABLE "idea_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"category" varchar(100),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_expenditure" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"type" "income_expenditure_type" NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100),
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"description" text,
	"referenceNumber" varchar(100),
	"paymentMethod" varchar(50),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"summary" text,
	"responsibilities" text,
	"qualifications" text,
	"requirements" text,
	"salary_range" varchar(100),
	"reporting_to" varchar(100),
	"department" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"leaveType" varchar(50) NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"daysCount" numeric(5, 1) NOT NULL,
	"reason" text NOT NULL,
	"status" "leave_application_status" DEFAULT 'pending' NOT NULL,
	"approvedBy" integer,
	"approvedAt" timestamp,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"leaveType" varchar(50) NOT NULL,
	"totalDays" numeric(5, 1) NOT NULL,
	"usedDays" numeric(5, 1) DEFAULT '0' NOT NULL,
	"availableDays" numeric(5, 1) NOT NULL,
	"year" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamMemberId" integer NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"leaveType" "leave_type" NOT NULL,
	"reason" text,
	"status" "leave_status" DEFAULT 'pending' NOT NULL,
	"approvedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"ipAddress" varchar(45) NOT NULL,
	"email" varchar(320),
	"userId" integer,
	"attemptType" "login_attempt_type" NOT NULL,
	"userAgent" text,
	"country" varchar(100),
	"city" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "marketing_type" NOT NULL,
	"platform" varchar(100),
	"startDate" date NOT NULL,
	"endDate" date,
	"budget" numeric(15, 2),
	"spent" numeric(15, 2) DEFAULT '0',
	"targetAudience" text,
	"description" text,
	"status" "marketing_status" DEFAULT 'planning' NOT NULL,
	"metrics" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer,
	"contentType" "content_type" NOT NULL,
	"platform" varchar(100) NOT NULL,
	"title" varchar(500),
	"content" text NOT NULL,
	"contentBangla" text,
	"scheduledDate" timestamp,
	"publishedDate" timestamp,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"productIds" text,
	"aiGenerated" "yes_no" DEFAULT 'no' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_name" varchar(50) NOT NULL,
	"can_view" boolean DEFAULT true NOT NULL,
	"can_create" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_sales_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"targetAmount" numeric(15, 2) NOT NULL,
	"achievedAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"salespersonId" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"notificationType" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"sentTo" varchar(320) NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"status" "notification_status" DEFAULT 'sent' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamMemberId" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"basicSalary" numeric(15, 2) NOT NULL,
	"allowances" numeric(15, 2) DEFAULT '0',
	"deductions" numeric(15, 2) DEFAULT '0',
	"bonus" numeric(15, 2) DEFAULT '0',
	"netSalary" numeric(15, 2) NOT NULL,
	"paymentDate" date,
	"paymentMethod" varchar(50),
	"status" "payroll_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"reviewerId" integer NOT NULL,
	"reviewPeriod" varchar(50) NOT NULL,
	"reviewDate" date NOT NULL,
	"overallRating" numeric(3, 1),
	"strengths" text,
	"areasForImprovement" text,
	"goals" text,
	"comments" text,
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"departmentId" integer NOT NULL,
	"level" varchar(50),
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"transactionDate" date NOT NULL,
	"transactionType" "transaction_type" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"description" text,
	"category" varchar(100),
	"invoiceNumber" varchar(100),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"customerName" varchar(255) NOT NULL,
	"stage" "project_stage" DEFAULT 'lead' NOT NULL,
	"value" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"description" text,
	"startDate" date,
	"expectedCloseDate" date,
	"actualCloseDate" date,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"assignedTo" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotationId" integer NOT NULL,
	"description" text NOT NULL,
	"specifications" text,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'pcs' NOT NULL,
	"unitPrice" numeric(15, 2) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0.00',
	"discountAmount" numeric(15, 2) DEFAULT '0.00',
	"finalAmount" numeric(15, 2) NOT NULL,
	"notes" text,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"productType" "product_type" NOT NULL,
	"weekNumber" integer NOT NULL,
	"monthYear" varchar(7) NOT NULL,
	"target" numeric(15, 2),
	"actual" numeric(15, 2),
	"unit" varchar(50),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "product_category" NOT NULL,
	"unit" varchar(50) DEFAULT 'units' NOT NULL,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"week_start_date" timestamp NOT NULL,
	"week_end_date" timestamp NOT NULL,
	"target" numeric(15, 2) NOT NULL,
	"actual" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"settingKey" varchar(100) NOT NULL,
	"settingValue" text,
	"description" text,
	"updatedBy" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "security_settings_settingKey_unique" UNIQUE("settingKey")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"settingKey" varchar(100) NOT NULL,
	"settingValue" text,
	"settingType" "setting_type" DEFAULT 'string' NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"updatedBy" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_settingKey_unique" UNIQUE("settingKey")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320),
	"phone" varchar(20),
	"department" varchar(100),
	"designation" varchar(100),
	"joiningDate" date NOT NULL,
	"salary" numeric(15, 2),
	"status" "team_member_status" DEFAULT 'active' NOT NULL,
	"userId" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_employeeId_unique" UNIQUE("employeeId")
);
--> statement-breakpoint
CREATE TABLE "tender_quotation" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "tender_type" NOT NULL,
	"referenceId" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"clientName" varchar(255) NOT NULL,
	"submissionDate" date NOT NULL,
	"followUpDate" date,
	"status" "tender_status" DEFAULT 'not_started' NOT NULL,
	"estimatedValue" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"notes" text,
	"attachments" text,
	"transferredToProjectId" integer,
	"archivedAt" timestamp,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"category" "transaction_category" NOT NULL,
	"description" text,
	"color" varchar(50) DEFAULT 'gray',
	"isSystem" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_types_name_unique" UNIQUE("name"),
	CONSTRAINT "transaction_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"secret" varchar(255) NOT NULL,
	"isEnabled" boolean DEFAULT false NOT NULL,
	"backupCodes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "two_factor_auth_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"sessionToken" varchar(255) NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" text,
	"deviceInfo" text,
	"lastActivity" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "weekly_sales_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekStartDate" date NOT NULL,
	"weekEndDate" date NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"targetAmount" numeric(15, 2) NOT NULL,
	"achievedAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"salespersonId" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
