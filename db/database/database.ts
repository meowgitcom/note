import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { workspaces } from "../app/workspace"

export const databases = sqliteTable("databases", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull().default("Untitled"),
  icon: text("icon"),
})

export type Database = typeof databases.$inferSelect
export type NewDatabase = typeof databases.$inferInsert
