import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { pages } from "../app/page"
import { columns } from "./column"

export const rollups = sqliteTable("rollups", {
  id: text("id").primaryKey(),
  pageId: text("page_id")
    .notNull()
    .references(() => pages.id),

  // The rollup property itself.
  columnId: text("column_id")
    .notNull()
    .references(() => columns.id),

  // The relation property this rollup aggregates over.
  relationColumnId: text("relation_column_id")
    .notNull()
    .references(() => columns.id),

  aggregateType: text("aggregate_type", {
    enum: ["sum", "count", "average", "min", "max"],
  })
    .notNull()
    .default("count"),
  value: text("value", { mode: "json" }).$type<number | string | null>().default(null),
})

export type Rollup = typeof rollups.$inferSelect
export type NewRollup = typeof rollups.$inferInsert
