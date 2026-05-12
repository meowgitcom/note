import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./app/data/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
})
