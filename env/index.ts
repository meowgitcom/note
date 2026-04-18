import { createEnv } from "@t3-oss/env-core"
import { string } from "valibot"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, ".env")
const envExamplePath = join(__dirname, ".env.example")

// Workspace env lives in `env/.env`, but many commands (CI, fresh clones) won't have it yet.
// Fall back to `.env.example` so non-interactive tooling still works.
const env_file = (await Bun.file(envPath).exists())
  ? await Bun.file(envPath).text()
  : await Bun.file(envExamplePath).text()
const env_vars = Object.fromEntries(
  env_file
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const [k, ...v] = line.split("=")
      return [k, v.join("=")]
    }),
)

export const env = createEnv({
  server: {
    DEV_PORT_NUMBER: string(),
    API_D1_DB_NAME: string(),
  },
  runtimeEnv: {
    DEV_PORT_NUMBER: env_vars.DEV_PORT_NUMBER,
    API_D1_DB_NAME: env_vars.API_D1_DB_NAME,
  },
})
