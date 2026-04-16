import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  parentId: text("parent_id"),
  dataSourceId: text("data_source_id"),

  title: text("title").notNull().default("Untitled"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),

  meta: text("meta", { mode: "json" })
    .$type<{
      icon?: string
      cover?: string
      description?: string
      [key: string]: unknown
    }>()
    .default({}),
})

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
