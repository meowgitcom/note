import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

// Single-row local sync state. This lives only in the local (device) DB.
export const syncState = sqliteTable("sync_state", {
  id: text("id").primaryKey(),

  deviceId: text("device_id").notNull(),
  userId: text("user_id"),

  // Cursors are opaque server-provided strings.
  lastPushCursor: text("last_push_cursor"),
  lastPullCursor: text("last_pull_cursor"),

  lastFullSyncAtMs: integer("last_full_sync_at_ms"),

  // Local lamport clock for deterministic ordering.
  lamport: integer("lamport").notNull().default(0),

  syncEnabled: integer("sync_enabled", { mode: "boolean" }).notNull().default(false),

  updatedAtMs: integer("updated_at_ms")
    .notNull()
    .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
})

export type SyncState = typeof syncState.$inferSelect
export type NewSyncState = typeof syncState.$inferInsert
