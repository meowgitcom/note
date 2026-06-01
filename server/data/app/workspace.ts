import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { User } from "./user"

export const Workspace = sqliteTable(
  "workspaces",
  {
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    deleted: integer("deleted", { mode: "boolean" }).default(false),
    id: text("id").primaryKey(),
    name: text("name"),
    owner_id: text("owner_id").references(() => User.id, { onDelete: "restrict" }),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    idx0: index("workspaces_owner_id_idx").on(table.owner_id),
  }),
)

export class WorkspaceDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof Workspace.$inferInsert) {
    return this.db
      .insert(Workspace)
      .values(item)
      .onConflictDoUpdate({ target: Workspace.id, set: item })
      .run()
  }

  async update(item: Partial<typeof Workspace.$inferInsert> & { id: any }) {
    return this.db.update(Workspace).set(item).where(eq(Workspace.id, item.id!)).run()
  }

  async delete(item: { id: any }) {
    return this.db.delete(Workspace).where(eq(Workspace.id, item.id!)).run()
  }

  async getById(id: string) {
    return this.db.select().from(Workspace).where(eq(Workspace.id, id)).get()
  }

  async getAll() {
    return this.db.select().from(Workspace).all()
  }

  async getChanges(timestamp: string) {
    return this.db
      .select()
      .from(Workspace)
      .where(sql`${Workspace.updated_at} > ${timestamp}`)
      .all()
  }
}
