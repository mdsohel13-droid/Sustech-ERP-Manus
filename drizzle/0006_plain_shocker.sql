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
