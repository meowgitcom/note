import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { Page } from "./page"

export interface BlockContent {
  caption?: string
  checked?: boolean
  extra: Record<string, any>
  language?: string
  text?: string
  url?: string
}

export interface BlockStyle {
  bgColor?: string
  bold?: boolean
  color?: string
  extra: Record<string, any>
  italic?: boolean
}

export const Block = sqliteTable(
  "blocks",
  {
    content: text("content", { mode: "json" }).$type<BlockContent>(),
    deleted: integer("deleted", { mode: "boolean" }).default(false),
    id: text("id").primaryKey(),
    page_id: text("page_id").references(() => Page.id, { onDelete: "cascade" }),
    parent_block_id: text("parent_block_id").references((): AnySQLiteColumn => Block.id, {
      onDelete: "cascade",
    }),
    position: text("position"),
    style: text("style", { mode: "json" }).$type<BlockStyle>(),
    type: text("type"),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    idx0: index("blocks_page_id_idx").on(table.page_id),
    idx1: index("blocks_parent_block_id_idx").on(table.parent_block_id),
  }),
)

export class BlockDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof Block.$inferInsert) {
    return this.db
      .insert(Block)
      .values(item)
      .onConflictDoUpdate({ target: Block.id, set: item })
      .run()
  }

  async update(item: Partial<typeof Block.$inferInsert> & { id: any }) {
    return this.db.update(Block).set(item).where(eq(Block.id, item.id!)).run()
  }

  async delete(item: { id: any }) {
    return this.db.delete(Block).where(eq(Block.id, item.id!)).run()
  }

  async getById(id: string) {
    return this.db.select().from(Block).where(eq(Block.id, id)).get()
  }

  async getAll() {
    return this.db.select().from(Block).all()
  }

  async getChanges(timestamp: string) {
    return this.db
      .select()
      .from(Block)
      .where(sql`${Block.updated_at} > ${timestamp}`)
      .all()
  }
}
