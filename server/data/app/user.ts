import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"

export const UserTypeValues = ["PERSON", "BOT"] as const
export type UserType = (typeof UserTypeValues)[number]

export const User = sqliteTable("users", {
  deleted: integer("deleted", { mode: "boolean" }).default(false),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name"),
  type: text("type"),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export class UserDao {
  constructor(private db: DrizzleD1Database<any>) {}

  async upsert(item: typeof User.$inferInsert) {
    return this.db
      .insert(User)
      .values(item)
      .onConflictDoUpdate({ target: User.id, set: item })
      .run()
  }

  async update(item: Partial<typeof User.$inferInsert> & { id: any }) {
    return this.db.update(User).set(item).where(eq(User.id, item.id!)).run()
  }

  async delete(item: { id: any }) {
    return this.db.delete(User).where(eq(User.id, item.id!)).run()
  }

  async getById(id: string) {
    return this.db.select().from(User).where(eq(User.id, id)).get()
  }

  async getAll() {
    return this.db.select().from(User).all()
  }

  async getChanges(timestamp: string) {
    return this.db
      .select()
      .from(User)
      .where(sql`${User.updated_at} > ${timestamp}`)
      .all()
  }
}
