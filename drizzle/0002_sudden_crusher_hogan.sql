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
