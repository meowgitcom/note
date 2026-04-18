import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

// Server-only sync journal tables. These should never exist in local app databases.

export const userDevices = sqliteTable(
  "user_devices",
  {
    userId: text("user_id").notNull(),
    deviceId: text("device_id").notNull(),
    createdAtMs: integer("created_at_ms")
      .notNull()
      .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
    lastSeenAtMs: integer("last_seen_at_ms"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deviceId] })],
)

export type UserDevice = typeof userDevices.$inferSelect
export type NewUserDevice = typeof userDevices.$inferInsert

export const serverMutations = sqliteTable("server_mutations", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  workspaceId: text("workspace_id").notNull(),
  deviceId: text("device_id").notNull(),
  userId: text("user_id").notNull(),

  operationId: text("operation_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  mutationType: text("mutation_type").notNull(),

  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),

  lamport: integer("lamport").notNull(),
  serverTsMs: integer("server_ts_ms")
    .notNull()
    .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
})

export type ServerMutation = typeof serverMutations.$inferSelect
export type NewServerMutation = typeof serverMutations.$inferInsert

export const serverTombstones = sqliteTable("server_tombstones", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  workspaceId: text("workspace_id").notNull(),
  deviceId: text("device_id").notNull(),
  userId: text("user_id").notNull(),

  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),

  lamport: integer("lamport").notNull(),
  serverTsMs: integer("server_ts_ms")
    .notNull()
    .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
})

export type ServerTombstone = typeof serverTombstones.$inferSelect
export type NewServerTombstone = typeof serverTombstones.$inferInsert

export const syncCheckpoints = sqliteTable(
  "sync_checkpoints",
  {
    userId: text("user_id").notNull(),
    deviceId: text("device_id").notNull(),
    workspaceId: text("workspace_id").notNull(),

    lastPushedMutationId: integer("last_pushed_mutation_id").notNull().default(0),
    lastPulledMutationId: integer("last_pulled_mutation_id").notNull().default(0),
    updatedAtMs: integer("updated_at_ms")
      .notNull()
      .default(sql`(cast(strftime('%s','now') as integer) * 1000)`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deviceId, t.workspaceId] })],
)

export type SyncCheckpoint = typeof syncCheckpoints.$inferSelect
export type NewSyncCheckpoint = typeof syncCheckpoints.$inferInsert
