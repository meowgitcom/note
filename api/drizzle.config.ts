import { defineConfig } from "drizzle-kit"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  schema: join(__dirname, "../db/server.ts"),
  out: "./drizzle",
  dialect: "sqlite",
  // Local dev DB file. Production uses Cloudflare D1 (wired via wrangler later).
  dbCredentials: {
    url: "./api.sqlite",
  },
})
