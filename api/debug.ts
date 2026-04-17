import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const API_ROOT = resolve(fileURLToPath(import.meta.url), ".")
console.log("API_ROOT:", API_ROOT)

for await (const f of new Bun.Glob("pages/**/*.ts").scan({ cwd: API_ROOT })) {
  console.log("found:", f)
}