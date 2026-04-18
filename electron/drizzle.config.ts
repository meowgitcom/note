import { defineConfig } from "drizzle-kit"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  schema: join(__dirname, "../db/local-client.ts"),
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./meownote.sqlite",
  },
})
