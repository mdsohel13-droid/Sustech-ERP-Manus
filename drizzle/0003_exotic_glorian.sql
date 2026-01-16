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
