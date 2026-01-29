ALTER TABLE `appointments` MODIFY COLUMN `status` enum('pending','confirmed','completed','cancelled','no-show') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `appointments` ADD `noShowReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `noShowCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBlocked` int DEFAULT 0 NOT NULL;