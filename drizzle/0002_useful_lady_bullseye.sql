CREATE TABLE `conversation_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`summary` text NOT NULL,
	`keyPoints` json NOT NULL,
	`topics` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_summaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_summaries_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `memory_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`type` enum('fact','preference','skill','context','summary') NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`metadata` json,
	`importance` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`accessCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `memory_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`prompt` text NOT NULL,
	`schedule` varchar(255) NOT NULL,
	`type` enum('cron','interval') NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_tasks_id` PRIMARY KEY(`id`)
);
