import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { pages } from "../app/page"
import { columns } from "./column"
import { relations } from "./relation"

export const rollups = sqliteTable("rollups", {
  id: text("id").primaryKey(),
  pageId: text("page_id")
    .notNull()
    .references(() => pages.id),
  columnId: text("column_id")
    .notNull()
    .references(() => columns.id),
  relationId: text("relation_id")
    .notNull()
    .references(() => relations.columnId),
  aggregateType: text("aggregate_type", {
    enum: ["sum", "count", "average", "min", "max"],
  })
    .notNull()
    .default("count"),
  value: text("value", { mode: "json" }).$type<number | string | null>().default(null),
})

export type Rollup = typeof rollups.$inferSelect
export type NewRollup = typeof rollups.$inferInsert
