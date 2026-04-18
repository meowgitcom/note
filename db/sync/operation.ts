import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const syncOperations = sqliteTable("sync_operations", {
  id: text("id").primaryKey(),

  deviceId: text("device_id").notNull(),
  userId: text("user_id"),
  workspaceId: text("workspace_id").notNull(),

  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  mutationType: text("mutation_type").notNull(),

  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),

  lamport: integer("lamport").notNull(),
  wallClockMs: integer("wall_clock_ms")
    .notNull()
    .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),

  status: text("status", { enum: ["pending", "pushed", "acked", "failed"] })
    .notNull()
    .default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
})

export type SyncOperation = typeof syncOperations.$inferSelect
export type NewSyncOperation = typeof syncOperations.$inferInsert
