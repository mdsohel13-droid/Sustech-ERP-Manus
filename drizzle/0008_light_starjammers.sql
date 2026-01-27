CREATE TABLE `quotation_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`description` text NOT NULL,
	`specifications` text,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL DEFAULT 'pcs',
	`unitPrice` decimal(15,2) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`discount` decimal(5,2) DEFAULT 0,
	`discountAmount` decimal(15,2) DEFAULT 0,
	`finalAmount` decimal(15,2) NOT NULL,
	`notes` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quotationId_tender_quotation_id_fk` FOREIGN KEY (`quotationId`) REFERENCES `tender_quotation`(`id`) ON DELETE cascade ON UPDATE no action;