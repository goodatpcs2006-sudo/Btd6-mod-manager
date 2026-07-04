CREATE TABLE `screenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modId` int NOT NULL,
	`url` text NOT NULL,
	`caption` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `screenshots_id` PRIMARY KEY(`id`)
);
