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
