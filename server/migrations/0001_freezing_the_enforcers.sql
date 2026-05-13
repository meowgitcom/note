ALTER TABLE `blocks` ADD `deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `blocks` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD `deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `pages` ADD `deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `pages` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;