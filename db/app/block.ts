import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull(),
  parentBlockId: text("parent_block_id"),

  position: text("position").notNull(),

  type: text("type").notNull(),

  content: text("content", { mode: "json" })
    .$type<{
      text?: string
      checked?: boolean
      url?: string
      caption?: string
      language?: string
      [key: string]: unknown
    }>()
    .default({}),

  style: text("style", { mode: "json" })
    .$type<{
      color?: string
      bgColor?: string
      bold?: boolean
      italic?: boolean
      [key: string]: unknown
    }>()
    .default({}),
})

export type Block = typeof blocks.$inferSelect
export type NewBlock = typeof blocks.$inferInsert
