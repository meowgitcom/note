import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"

export const Transaction = sqliteTable(
  "transactions",
  {
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    id: text("id").primaryKey(),
    operations: text("operations"),
    seq: integer("seq"),
    user_id: text("user_id"),
    workspace_id: text("workspace_id"),
  },
  (table) => ({
    idx0: index("transactions_workspace_id_seq_idx").on(table.workspace_id, table.seq),
  }),
)

export class TransactionDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof Transaction.$inferInsert) {
    return this.db
      .insert(Transaction)
      .values(item)
      .onConflictDoUpdate({ target: Transaction.id, set: item })
      .run()
  }

  async update(item: Partial<typeof Transaction.$inferInsert> & { id: any }) {
    return this.db.update(Transaction).set(item).where(eq(Transaction.id, item.id!)).run()
  }

  async delete(item: { id: any }) {
    return this.db.delete(Transaction).where(eq(Transaction.id, item.id!)).run()
  }

  async getById(id: string) {
    return this.db.select().from(Transaction).where(eq(Transaction.id, id)).get()
  }

  async getAll() {
    return this.db.select().from(Transaction).all()
  }

  async getPending(workspaceId: string) {
    return this.db
      .select()
      .from(Transaction)
      .where(sql`${Transaction.workspace_id} = ${workspaceId} AND ${Transaction.seq} = 0`)
      .all()
  }

  async getSince(workspaceId: string, lastSeq: number) {
    return this.db
      .select()
      .from(Transaction)
      .where(sql`${Transaction.workspace_id} = ${workspaceId} AND ${Transaction.seq} > ${lastSeq}`)
      .orderBy(Transaction.seq)
      .all()
  }

  async getMaxSeq(workspaceId: string) {
    const result = await this.db
      .select({ seq: Transaction.seq })
      .from(Transaction)
      .where(eq(Transaction.workspace_id, workspaceId))
      .orderBy(sql`${Transaction.seq} DESC`)
      .limit(1)
      .get()
    return result?.seq ?? null
  }
}
