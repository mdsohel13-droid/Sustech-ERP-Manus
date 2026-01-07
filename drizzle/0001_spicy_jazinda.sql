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
CREATE TABLE `dashboard_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insightType` enum('financial','project','customer','team','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`recommendations` text,
	`dataSnapshot` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_insights_id` PRIMARY KEY(`id`)
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
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`position` varchar(255),
	`department` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
