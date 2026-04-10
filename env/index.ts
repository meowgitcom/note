import { createEnv } from "@t3-oss/env-core"
import { string } from "valibot"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const env_file = await Bun.file(join(__dirname, ".env")).text()
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
  },
  runtimeEnv: { DEV_PORT_NUMBER: env_vars.DEV_PORT_NUMBER },
})
