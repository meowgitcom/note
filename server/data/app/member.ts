import { sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core"
import { eq, sql, and } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { User } from "./user"
import { Workspace } from "./workspace"

export const MemberRoleValues = ["OWNER", "ADMIN", "MEMBER", "GUEST"] as const
export type MemberRole = (typeof MemberRoleValues)[number]

export const Member = sqliteTable(
  "workspace_members",
  {
    joined_at: text("joined_at").default(sql`CURRENT_TIMESTAMP`),
    role: text("role"),
    user_id: text("user_id").references(() => User.id, { onDelete: "cascade" }),
    workspace_id: text("workspace_id").references(() => Workspace.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspace_id, table.user_id] }),
    idx0: index("workspace_members_workspace_id_idx").on(table.workspace_id),
    idx1: index("workspace_members_user_id_idx").on(table.user_id),
  }),
)

export class MemberDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof Member.$inferInsert) {
    return this.db
      .insert(Member)
      .values(item)
      .onConflictDoUpdate({ target: [Member.workspace_id, Member.user_id], set: item })
      .run()
  }

  async update(item: Partial<typeof Member.$inferInsert> & { workspace_id: any; user_id: any }) {
    return this.db
      .update(Member)
      .set(item)
      .where(and(eq(Member.workspace_id, item.workspace_id!), eq(Member.user_id, item.user_id!)))
      .run()
  }

  async delete(item: { workspace_id: any; user_id: any }) {
    return this.db
      .delete(Member)
      .where(and(eq(Member.workspace_id, item.workspace_id!), eq(Member.user_id, item.user_id!)))
      .run()
  }

  async get(workspace_id: any, user_id: any) {
    return this.db
      .select()
      .from(Member)
      .where(and(eq(Member.workspace_id, workspace_id), eq(Member.user_id, user_id)))
      .get()
  }

  async getAll() {
    return this.db.select().from(Member).all()
  }
}
