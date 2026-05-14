import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { Workspace } from "./workspace"

export interface PageMeta {
  cover?: string
  description?: string
  extra: Record<string, any>
  icon?: string
}

export const Page = sqliteTable(
  "pages",
  {
    archived: integer("archived", { mode: "boolean" }).default(false),
    data_source_id: text("data_source_id"),
    deleted: integer("deleted", { mode: "boolean" }).default(false),
    id: text("id").primaryKey(),
    meta: text("meta", { mode: "json" }).$type<PageMeta>(),
    parent_id: text("parent_id").references((): AnySQLiteColumn => Page.id, {
      onDelete: "set null",
    }),
    position: text("position").default(""),
    title: text("title").default("Untitled"),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    workspace_id: text("workspace_id").references(() => Workspace.id, { onDelete: "cascade" }),
  },
  (table) => ({
    idx0: index("pages_workspace_id_idx").on(table.workspace_id),
    idx1: index("pages_parent_id_idx").on(table.parent_id),
  }),
)

export class PageDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof Page.$inferInsert) {
    return this.db
      .insert(Page)
      .values(item)
      .onConflictDoUpdate({ target: Page.id, set: item })
      .run()
  }

  async update(item: Partial<typeof Page.$inferInsert> & { id: any }) {
    return this.db.update(Page).set(item).where(eq(Page.id, item.id!)).run()
  }

  async delete(item: { id: any }) {
    return this.db.delete(Page).where(eq(Page.id, item.id!)).run()
  }

  async getById(id: string) {
    return this.db.select().from(Page).where(eq(Page.id, id)).get()
  }

  async getAll() {
    return this.db.select().from(Page).all()
  }

  async getChanges(timestamp: string) {
    return this.db
      .select()
      .from(Page)
      .where(sql`${Page.updated_at} > ${timestamp}`)
      .all()
  }
}
