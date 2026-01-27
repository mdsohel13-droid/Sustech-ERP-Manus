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
