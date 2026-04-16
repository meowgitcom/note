import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { databases } from "./database"

export const views = sqliteTable("views", {
  id: text("id").primaryKey(),
  databaseId: text("database_id")
    .notNull()
    .references(() => databases.id),
  name: text("name").notNull().default("Untitled"),
  type: text("type").notNull().default("table"),

  filters: text("filters", { mode: "json" })
    .$type<Array<{ columnId: string; op: string; value: unknown }>>()
    .default([]),

  sorts: text("sorts", { mode: "json" })
    .$type<Array<{ columnId: string; direction: "asc" | "desc" }>>()
    .default([]),

  groupBy: text("group_by", { mode: "json" })
    .$type<{
      columnId: string
      order?: "asc" | "desc" | "manual"
      manualOrder?: string[]
    } | null>()
    .default(null),
})

export type View = typeof views.$inferSelect
export type NewView = typeof views.$inferInsert
