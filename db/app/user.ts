import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  type: text("type", { enum: ["person", "bot"] })
    .notNull()
    .default("person"),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
