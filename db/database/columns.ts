import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { tables } from "./tables"

export const columns = sqliteTable(
  "columns",
  {
    id: text("id").primaryKey(),
    tableId: text("table_id")
      .notNull()
      .references(() => tables.id),
    name: text("name").notNull(),
    type: text("type").notNull(),
    settings: text("settings", { mode: "json" })
      .$type<{
        choices?: string[]
        foreignkey?: string
        formula?: string
        [key: string]: unknown
      }>()
      .default({}),
  },
  () => [],
)

export type Column = typeof columns.$inferSelect
export type NewColumn = typeof columns.$inferInsert
