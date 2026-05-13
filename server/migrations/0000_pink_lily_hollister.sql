CREATE TABLE `blocks` (
	`content` text,
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text,
	`parent_block_id` text,
	`position` text,
	`style` text,
	`type` text,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `blocks_page_id_idx` ON `blocks` (`page_id`);--> statement-breakpoint
CREATE INDEX `blocks_parent_block_id_idx` ON `blocks` (`parent_block_id`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`joined_at` text DEFAULT CURRENT_TIMESTAMP,
	`role` text,
	`user_id` text,
	`workspace_id` text,
	PRIMARY KEY(`workspace_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workspace_members_workspace_id_idx` ON `workspace_members` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `workspace_members_user_id_idx` ON `workspace_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `pages` (
	`archived` integer DEFAULT false,
	`data_source_id` text,
	`id` text PRIMARY KEY NOT NULL,
	`meta` text,
	`parent_id` text,
	`title` text DEFAULT 'Untitled',
	`workspace_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pages_workspace_id_idx` ON `pages` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `pages_parent_id_idx` ON `pages` (`parent_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text,
	`type` text
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`owner_id` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `workspaces_owner_id_idx` ON `workspaces` (`owner_id`);