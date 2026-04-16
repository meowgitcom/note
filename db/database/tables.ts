import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { databases } from "./database"

export const tables = sqliteTable("tables", {
  id: text("id").primaryKey(),
  databaseId: text("database_id")
    .notNull()
    .references(() => databases.id),
  name: text("name").notNull().default("Untitled"),
})

export type Table = typeof tables.$inferSelect
export type NewTable = typeof tables.$inferInsert
