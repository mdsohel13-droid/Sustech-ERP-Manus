CREATE TABLE `accounts_payable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorName` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`dueDate` date NOT NULL,
	`status` enum('pending','overdue','paid') NOT NULL DEFAULT 'pending',
	`invoiceNumber` varchar(100),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_payable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts_receivable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`dueDate` date NOT NULL,
	`status` enum('pending','overdue','paid') NOT NULL DEFAULT 'pending',
	`invoiceNumber` varchar(100),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_receivable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `action_tracker` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('action','decision','issue','opportunity') NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` date,
	`resolvedDate` date,
	`tags` text,
	`relatedModule` varchar(100),
	`relatedId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `action_tracker_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reminderType` enum('client_followup','lead_followup','task','meeting','other') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`descriptionBangla` text,
	`dueDate` date NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('pending','completed','snoozed','cancelled') NOT NULL DEFAULT 'pending',
	`assignedTo` int NOT NULL,
	`aiGenerated` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `archived_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleName` varchar(100) NOT NULL,
	`itemId` int NOT NULL,
	`itemData` text NOT NULL,
	`deletedBy` int NOT NULL,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `archived_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` enum('project','tender_quotation','sale','customer','financial_transaction','income_expenditure','employee','action_tracker') NOT NULL,
	`entity_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_type` varchar(100),
	`file_size` int,
	`uploaded_by` int NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamMemberId` int NOT NULL,
	`date` date NOT NULL,
	`status` enum('present','absent','leave','holiday') NOT NULL DEFAULT 'present',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`date` date NOT NULL,
	`clockIn` timestamp,
	`clockOut` timestamp,
	`workHours` decimal(5,2),
	`status` enum('present','absent','late','half_day','wfh','on_leave') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete','view','export') NOT NULL,
	`module` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` varchar(100) NOT NULL,
	`entityName` varchar(255),
	`oldValues` text,
	`newValues` text,
	`changes` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_ips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`reason` text,
	`blockedBy` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_ips_id` PRIMARY KEY(`id`),
	CONSTRAINT `blocked_ips_ipAddress_unique` UNIQUE(`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month_year` varchar(7) NOT NULL,
	`type` enum('income','expenditure') NOT NULL,
	`category` varchar(100) NOT NULL,
	`budget_amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`notes` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`salespersonName` varchar(255) NOT NULL,
	`period` varchar(10) NOT NULL,
	`totalSalesAmount` decimal(15,2) NOT NULL,
	`totalSalesCount` int NOT NULL DEFAULT 0,
	`commissionRate` decimal(5,2) NOT NULL,
	`commissionAmount` decimal(15,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`payoutDate` date,
	`paymentMethod` varchar(50),
	`transactionId` varchar(100),
	`notes` text,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payoutPeriod` varchar(10) NOT NULL,
	`totalPayoutAmount` decimal(15,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`status` enum('draft','approved','processed','completed','cancelled') NOT NULL DEFAULT 'draft',
	`payoutDate` date,
	`approvedBy` int,
	`approvedAt` timestamp,
	`processedBy` int,
	`processedAt` timestamp,
	`notes` text,
	`attachmentUrl` varchar(500),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`commissionType` enum('percentage','fixed','tiered') NOT NULL DEFAULT 'percentage',
	`baseRate` decimal(5,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`effectiveFrom` date NOT NULL,
	`effectiveTo` date,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commissionRateId` int NOT NULL,
	`tierName` varchar(100) NOT NULL,
	`minAmount` decimal(15,2) NOT NULL,
	`maxAmount` decimal(15,2),
	`commissionPercentage` decimal(5,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`dailySalesId` int NOT NULL,
	`saleAmount` decimal(15,2) NOT NULL,
	`commissionRate` decimal(5,2) NOT NULL,
	`commissionAmount` decimal(15,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`period` varchar(10) NOT NULL,
	`status` enum('earned','pending','paid') NOT NULL DEFAULT 'earned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currency_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromCurrency` varchar(3) NOT NULL,
	`toCurrency` varchar(3) NOT NULL,
	`rate` decimal(15,6) NOT NULL,
	`effectiveDate` date NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `currency_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`interactionType` enum('call','email','meeting','note') NOT NULL,
	`subject` varchar(255),
	`notes` text,
	`interactionDate` date NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`status` enum('hot','warm','cold') NOT NULL DEFAULT 'warm',
	`lastContactDate` date,
	`nextActionRequired` text,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(15,2) NOT NULL,
	`totalAmount` decimal(15,2) NOT NULL,
	`salespersonId` int NOT NULL,
	`salespersonName` varchar(255) NOT NULL,
	`customerName` varchar(255),
	`notes` text,
	`isArchived` boolean NOT NULL DEFAULT false,
	`archivedAt` timestamp,
	`archivedBy` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insightType` enum('financial','project','customer','team','general','pattern','trend','alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`recommendations` text,
	`dataSnapshot` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`headId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `display_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`isGlobal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `display_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_confidential` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`base_salary` decimal(15,2),
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`benefits` text,
	`bank_account_number` varchar(100),
	`bank_name` varchar(100),
	`tax_id` varchar(100),
	`ssn` varchar(50),
	`medical_records` text,
	`emergency_contact_relation` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_confidential_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_confidential_employee_id_unique` UNIQUE(`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `employee_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamMemberId` int NOT NULL,
	`kpiName` varchar(255) NOT NULL,
	`kpiDescription` text,
	`measurementUnit` varchar(50) NOT NULL,
	`targetValue` decimal(15,2) NOT NULL,
	`currentValue` decimal(15,2) NOT NULL DEFAULT '0',
	`period` enum('daily','weekly','monthly','quarterly','yearly') NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`permissions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`employeeCode` varchar(50) NOT NULL,
	`departmentId` int,
	`positionId` int,
	`jobTitle` varchar(100),
	`employmentType` enum('full_time','part_time','contract','intern') NOT NULL DEFAULT 'full_time',
	`joinDate` date NOT NULL,
	`contractEndDate` date,
	`managerId` int,
	`salaryGrade` varchar(50),
	`workLocation` varchar(100),
	`workSchedule` varchar(100),
	`emergencyContactName` varchar(100),
	`emergencyContactPhone` varchar(50),
	`status` enum('active','on_leave','terminated') NOT NULL DEFAULT 'active',
	`terminationDate` date,
	`terminationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `employees_employeeCode_unique` UNIQUE(`employeeCode`)
);
--> statement-breakpoint
CREATE TABLE `idea_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`category` varchar(100),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `idea_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `income_expenditure` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`type` enum('income','expenditure') NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`description` text,
	`referenceNumber` varchar(100),
	`paymentMethod` varchar(50),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `income_expenditure_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`position_id` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`summary` text,
	`responsibilities` text,
	`qualifications` text,
	`requirements` text,
	`salary_range` varchar(100),
	`reporting_to` varchar(100),
	`department` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`leaveType` varchar(50) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`daysCount` decimal(5,1) NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`leaveType` varchar(50) NOT NULL,
	`totalDays` decimal(5,1) NOT NULL,
	`usedDays` decimal(5,1) NOT NULL DEFAULT '0',
	`availableDays` decimal(5,1) NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamMemberId` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`leaveType` enum('sick','vacation','personal','other') NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`email` varchar(320),
	`userId` int,
	`attemptType` enum('success','failed','blocked') NOT NULL,
	`userAgent` text,
	`country` varchar(100),
	`city` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('social_media','email','sms','event','content','branding','other') NOT NULL,
	`platform` varchar(100),
	`startDate` date NOT NULL,
	`endDate` date,
	`budget` decimal(15,2),
	`spent` decimal(15,2) DEFAULT '0',
	`targetAudience` text,
	`description` text,
	`status` enum('planning','active','paused','completed','cancelled') NOT NULL DEFAULT 'planning',
	`metrics` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int,
	`contentType` enum('post','ad','story','video','image','article') NOT NULL,
	`platform` varchar(100) NOT NULL,
	`title` varchar(500),
	`content` text NOT NULL,
	`contentBangla` text,
	`scheduledDate` timestamp,
	`publishedDate` timestamp,
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`productIds` text,
	`aiGenerated` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`module_name` varchar(50) NOT NULL,
	`can_view` boolean NOT NULL DEFAULT true,
	`can_create` boolean NOT NULL DEFAULT false,
	`can_edit` boolean NOT NULL DEFAULT false,
	`can_delete` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_sales_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`targetAmount` decimal(15,2) NOT NULL,
	`achievedAmount` decimal(15,2) NOT NULL DEFAULT '0',
	`salespersonId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_sales_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationType` enum('ar_overdue','project_status','attendance_anomaly','threshold_breach') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sentTo` varchar(320) NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed') NOT NULL DEFAULT 'sent',
	CONSTRAINT `notification_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamMemberId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`basicSalary` decimal(15,2) NOT NULL,
	`allowances` decimal(15,2) DEFAULT '0',
	`deductions` decimal(15,2) DEFAULT '0',
	`bonus` decimal(15,2) DEFAULT '0',
	`netSalary` decimal(15,2) NOT NULL,
	`paymentDate` date,
	`paymentMethod` varchar(50),
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`reviewPeriod` varchar(50) NOT NULL,
	`reviewDate` date NOT NULL,
	`overallRating` decimal(3,1),
	`strengths` text,
	`areasForImprovement` text,
	`goals` text,
	`comments` text,
	`status` enum('draft','submitted','acknowledged') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`departmentId` int NOT NULL,
	`level` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`transactionDate` date NOT NULL,
	`transactionType` enum('revenue','purchase','expense','cogs','wacc') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`description` text,
	`category` varchar(100),
	`invoiceNumber` varchar(100),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`stage` enum('lead','proposal','won','execution','testing') NOT NULL DEFAULT 'lead',
	`value` decimal(15,2),
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`description` text,
	`startDate` date,
	`expectedCloseDate` date,
	`actualCloseDate` date,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotation_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`description` text NOT NULL,
	`specifications` text,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL DEFAULT 'pcs',
	`unitPrice` decimal(15,2) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`discount` decimal(5,2) DEFAULT '0.00',
	`discountAmount` decimal(15,2) DEFAULT '0.00',
	`finalAmount` decimal(15,2) NOT NULL,
	`notes` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productType` enum('fan','ess','solar_pv','projects','testing','installation') NOT NULL,
	`weekNumber` int NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`target` decimal(15,2),
	`actual` decimal(15,2),
	`unit` varchar(50),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('fan','ess','solar_pv','epc_project','testing','installation','other') NOT NULL,
	`unit` varchar(50) NOT NULL DEFAULT 'units',
	`description` text,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`week_start_date` timestamp NOT NULL,
	`week_end_date` timestamp NOT NULL,
	`target` decimal(15,2) NOT NULL,
	`actual` decimal(15,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `security_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`settingType` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`category` varchar(50) NOT NULL,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`department` varchar(100),
	`designation` varchar(100),
	`joiningDate` date NOT NULL,
	`salary` decimal(15,2),
	`status` enum('active','on_leave','resigned','terminated') NOT NULL DEFAULT 'active',
	`userId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_members_employeeId_unique` UNIQUE(`employeeId`)
);
--> statement-breakpoint
CREATE TABLE `tender_quotation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('government_tender','private_quotation') NOT NULL,
	`referenceId` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`submissionDate` date NOT NULL,
	`followUpDate` date,
	`status` enum('not_started','preparing','submitted','win','loss','po_received') NOT NULL DEFAULT 'not_started',
	`estimatedValue` decimal(15,2),
	`currency` varchar(3) NOT NULL DEFAULT 'BDT',
	`notes` text,
	`attachments` text,
	`transferredToProjectId` int,
	`archivedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tender_quotation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50) NOT NULL,
	`category` enum('income','expense') NOT NULL,
	`description` text,
	`color` varchar(50) DEFAULT 'gray',
	`isSystem` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `transaction_types_name_unique` UNIQUE(`name`),
	CONSTRAINT `transaction_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `two_factor_auth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`secret` varchar(255) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`backupCodes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `two_factor_auth_id` PRIMARY KEY(`id`),
	CONSTRAINT `two_factor_auth_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceInfo` text,
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `weekly_sales_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekStartDate` date NOT NULL,
	`weekEndDate` date NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`targetAmount` decimal(15,2) NOT NULL,
	`achievedAmount` decimal(15,2) NOT NULL DEFAULT '0',
	`salespersonId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_sales_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','manager','viewer','user') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE `commission_history` ADD CONSTRAINT `commission_history_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_history` ADD CONSTRAINT `commission_history_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_processedBy_users_id_fk` FOREIGN KEY (`processedBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_rates` ADD CONSTRAINT `commission_rates_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_rates` ADD CONSTRAINT `commission_rates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_tiers` ADD CONSTRAINT `commission_tiers_commissionRateId_commission_rates_id_fk` FOREIGN KEY (`commissionRateId`) REFERENCES `commission_rates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_transactions` ADD CONSTRAINT `commission_transactions_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_transactions` ADD CONSTRAINT `commission_transactions_dailySalesId_daily_sales_id_fk` FOREIGN KEY (`dailySalesId`) REFERENCES `daily_sales`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_sales` ADD CONSTRAINT `daily_sales_salespersonId_employees_id_fk` FOREIGN KEY (`salespersonId`) REFERENCES `employees`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_sales` ADD CONSTRAINT `daily_sales_productId_sales_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `sales_products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_sales` ADD CONSTRAINT `daily_sales_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quotationId_tender_quotation_id_fk` FOREIGN KEY (`quotationId`) REFERENCES `tender_quotation`(`id`) ON DELETE cascade ON UPDATE no action;