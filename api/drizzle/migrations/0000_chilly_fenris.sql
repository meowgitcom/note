-- This file is used by Wrangler D1 migrations (not drizzle-kit).
-- It mirrors the initial Drizzle-generated schema for the API server.

CREATE TABLE `blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`parent_block_id` text,
	`position` text NOT NULL,
	`type` text NOT NULL,
	`content` text DEFAULT '{}',
	`style` text DEFAULT '{}'
);
-- statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`parent_id` text,
	`data_source_id` text,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`meta` text DEFAULT '{}'
);
-- statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`page_id` text,
	`database_id` text,
	`name` text DEFAULT 'Untitled' NOT NULL,
	`type` text NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`type` text DEFAULT 'person' NOT NULL
);
-- statement-breakpoint
CREATE TABLE `workspace_members` (
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`workspace_id`, `user_id`),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `columns` (
	`id` text PRIMARY KEY NOT NULL,
	`table_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`settings` text DEFAULT '{}',
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `databases` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text DEFAULT 'Untitled' NOT NULL,
	`icon` text,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `relations` (
	`column_id` text NOT NULL,
	`from_row_id` text NOT NULL,
	`to_row_id` text NOT NULL,
	PRIMARY KEY(`column_id`, `from_row_id`, `to_row_id`),
	FOREIGN KEY (`column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_row_id`) REFERENCES `rows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_row_id`) REFERENCES `rows`(`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE `rollups` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`column_id` text NOT NULL,
	`relation_column_id` text NOT NULL,
	`aggregate_type` text DEFAULT 'count' NOT NULL,
	`value` text DEFAULT 'null',
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`relation_column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `rows` (
	`id` text PRIMARY KEY NOT NULL,
	`table_id` text NOT NULL,
	`page_id` text NOT NULL,
	`values` text DEFAULT '{}',
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`database_id` text NOT NULL,
	`name` text DEFAULT 'Untitled' NOT NULL,
	FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `views` (
	`id` text PRIMARY KEY NOT NULL,
	`database_id` text NOT NULL,
	`name` text DEFAULT 'Untitled' NOT NULL,
	`type` text DEFAULT 'table' NOT NULL,
	`filters` text DEFAULT '[]',
	`sorts` text DEFAULT '[]',
	`group_by` text DEFAULT 'null',
	FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
-- statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
-- statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
-- statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
-- statement-breakpoint
CREATE TABLE `server_mutations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` text NOT NULL,
	`device_id` text NOT NULL,
	`user_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`mutation_type` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`lamport` integer NOT NULL,
	`server_ts_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL
);
-- statement-breakpoint
CREATE TABLE `server_tombstones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` text NOT NULL,
	`device_id` text NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`lamport` integer NOT NULL,
	`server_ts_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL
);
-- statement-breakpoint
CREATE TABLE `sync_checkpoints` (
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`last_pushed_mutation_id` integer DEFAULT 0 NOT NULL,
	`last_pulled_mutation_id` integer DEFAULT 0 NOT NULL,
	`updated_at_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `device_id`, `workspace_id`)
);
-- statement-breakpoint
CREATE TABLE `user_devices` (
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`created_at_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL,
	`last_seen_at_ms` integer,
	PRIMARY KEY(`user_id`, `device_id`)
);
