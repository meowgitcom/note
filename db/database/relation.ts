import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core"
import { columns } from "./column"
import { rows } from "./row"

export const relations = sqliteTable(
  "relations",
  {
    columnId: text("column_id")
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),

    fromRowId: text("from_row_id")
      .notNull()
      .references(() => rows.id, { onDelete: "cascade" }),

    toRowId: text("to_row_id")
      .notNull()
      .references(() => rows.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.columnId, t.fromRowId, t.toRowId] })],
)

export type Relation = typeof relations.$inferSelect
export type NewRelation = typeof relations.$inferInsert
