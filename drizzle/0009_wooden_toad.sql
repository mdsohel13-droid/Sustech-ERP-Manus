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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_confidential_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_confidential_employee_id_unique` UNIQUE(`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `employee_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`permissions` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_roles_name_unique` UNIQUE(`name`)
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
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_descriptions_id` PRIMARY KEY(`id`)
);
