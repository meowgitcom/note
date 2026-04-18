import { drizzle } from "drizzle-orm/d1"
import { serverSchema } from "db/server"

export function createD1Db(db: D1Database) {
  return drizzle(db, { schema: serverSchema })
}
