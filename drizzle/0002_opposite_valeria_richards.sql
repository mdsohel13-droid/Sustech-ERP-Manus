CREATE TABLE `action_tracker` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('action','decision','issue','opportunity') NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` date,
	`resolvedDate` date,
	`tags` text,
	`relatedModule` varchar(100),
	`relatedId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `action_tracker_id` PRIMARY KEY(`id`)
);
