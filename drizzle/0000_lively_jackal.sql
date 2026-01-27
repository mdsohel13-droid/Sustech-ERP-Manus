CREATE TABLE `accounts_payable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorName` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('admin','manager','viewer','user') NOT NULL DEFAULT 'viewer',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
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
