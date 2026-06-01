CREATE TABLE `transactions` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`id` text PRIMARY KEY NOT NULL,
	`operations` text,
	`seq` integer,
	`user_id` text,
	`workspace_id` text
);
--> statement-breakpoint
CREATE INDEX `transactions_workspace_id_seq_idx` ON `transactions` (`workspace_id`,`seq`);