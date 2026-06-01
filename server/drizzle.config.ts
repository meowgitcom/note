import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./data/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
})
