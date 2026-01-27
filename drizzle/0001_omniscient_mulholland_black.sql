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
ALTER TABLE `accounts_payable` ADD `currency` varchar(3) DEFAULT 'BDT' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts_receivable` ADD `currency` varchar(3) DEFAULT 'BDT' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `currency` varchar(3) DEFAULT 'BDT' NOT NULL;