CREATE TABLE `sync_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`user_id` text,
	`workspace_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`mutation_type` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`lamport` integer NOT NULL,
	`wall_clock_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`user_id` text,
	`last_push_cursor` text,
	`last_pull_cursor` text,
	`last_full_sync_at_ms` integer,
	`lamport` integer DEFAULT 0 NOT NULL,
	`sync_enabled` integer DEFAULT false NOT NULL,
	`updated_at_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_tombstones` (
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`deleted_by_device_id` text NOT NULL,
	`deleted_at_ms` integer DEFAULT (cast(strftime('%s','now') as integer) * 1000) NOT NULL,
	`lamport` integer NOT NULL,
	PRIMARY KEY(`entity_type`, `entity_id`)
);
