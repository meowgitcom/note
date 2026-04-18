import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const syncTombstones = sqliteTable(
  "sync_tombstones",
  {
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),

    deletedByDeviceId: text("deleted_by_device_id").notNull(),
    deletedAtMs: integer("deleted_at_ms")
      .notNull()
      .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
    lamport: integer("lamport").notNull(),
  },
  (t) => [primaryKey({ columns: [t.entityType, t.entityId] })],
)

export type SyncTombstone = typeof syncTombstones.$inferSelect
export type NewSyncTombstone = typeof syncTombstones.$inferInsert
