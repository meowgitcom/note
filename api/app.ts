import type { SQLWrapper } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { Elysia } from "elysia"

type DbLike = {
  // Common surface area across Drizzle adapters (D1, bun-sqlite, etc.).
  run: (query: string | SQLWrapper) => unknown | Promise<unknown>
}

export function createApp(deps: { db?: DbLike } = {}) {
  // Cloudflare Workers disallow eval/new Function; disable Elysia AOT compilation.
  return new Elysia({ aot: false })
    .get("/", "meow[note]")
    .get("/health", () => ({ ok: true }))
    .get("/db/health", async () => {
      if (!deps.db) return { ok: false, error: "db_not_configured" }
      await deps.db.run(sql`select 1 as one`)
      return { ok: true }
    })
}
