import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { tables } from "./tables"
import { pages } from "../app/page"

export const rows = sqliteTable("rows", {
  id: text("id").primaryKey(),
  tableId: text("table_id")
    .notNull()
    .references(() => tables.id),
  pageId: text("page_id")
    .notNull()
    .references(() => pages.id),
  values: text("values", { mode: "json" }).$type<Record<string, unknown>>().default({}),
})

export type Row = typeof rows.$inferSelect
export type NewRow = typeof rows.$inferInsert
