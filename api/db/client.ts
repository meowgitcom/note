import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import { serverSchema } from "db/server"

// Bun local-dev sqlite client. Cloudflare D1 wiring can replace this later.
export function createApiDb(options?: { url?: string }) {
  const sqlite = new Database(options?.url ?? "api.sqlite")
  return drizzle(sqlite, { schema: serverSchema })
}
