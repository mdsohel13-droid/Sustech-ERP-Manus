CREATE TABLE `attendance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`date` date NOT NULL,
	`clockIn` timestamp,
	`clockOut` timestamp,
	`workHours` decimal(5,2),
	`status` enum('present','absent','late','half_day','wfh','on_leave') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`headId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`employeeCode` varchar(50) NOT NULL,
	`departmentId` int,
	`positionId` int,
	`jobTitle` varchar(100),
	`employmentType` enum('full_time','part_time','contract','intern') NOT NULL DEFAULT 'full_time',
	`joinDate` date NOT NULL,
	`contractEndDate` date,
	`managerId` int,
	`salaryGrade` varchar(50),
	`workLocation` varchar(100),
	`workSchedule` varchar(100),
	`emergencyContactName` varchar(100),
	`emergencyContactPhone` varchar(50),
	`status` enum('active','on_leave','terminated') NOT NULL DEFAULT 'active',
	`terminationDate` date,
	`terminationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `employees_employeeCode_unique` UNIQUE(`employeeCode`)
);
--> statement-breakpoint
CREATE TABLE `leave_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`leaveType` varchar(50) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`daysCount` decimal(5,1) NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`leaveType` varchar(50) NOT NULL,
	`totalDays` decimal(5,1) NOT NULL,
	`usedDays` decimal(5,1) NOT NULL DEFAULT '0',
	`availableDays` decimal(5,1) NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`reviewPeriod` varchar(50) NOT NULL,
	`reviewDate` date NOT NULL,
	`overallRating` decimal(3,1),
	`strengths` text,
	`areasForImprovement` text,
	`goals` text,
	`comments` text,
	`status` enum('draft','submitted','acknowledged') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`departmentId` int NOT NULL,
	`level` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
