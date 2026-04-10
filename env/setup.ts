import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const env_path = join(__dirname, ".env")
const env_example_path = join(__dirname, ".env.example")

if (existsSync(env_path)) unlinkSync(env_path)
copyFileSync(env_example_path, env_path)
console.log("📄 Copied .env.example to .env")

const raw_args = process.argv.slice(2).filter((a) => !a.startsWith("-"))
const overrides = new Map<string, string>()

for (let i = 0; i < raw_args.length; i += 2) {
  const key = raw_args[i]
  const value = raw_args[i + 1]
  if (key !== undefined && value !== undefined) {
    overrides.set(key, value)
  }
}

const skip = process.argv.includes("--skip") || process.argv.includes("-s")
const has_overrides = overrides.size > 0

const content = readFileSync(env_path, "utf-8")
const lines = content.split("\n").filter((line) => line.includes("=") && !line.startsWith("#"))
const existing_keys = new Set(lines.map((line) => line.split("=")[0]))

for (const key of overrides.keys()) {
  if (!existing_keys.has(key)) {
    console.warn(`⚠️  "${key}" not found in .env - skipping`)
    overrides.delete(key)
  }
}

const new_lines: string[] = []

for (const line of lines) {
  const [key = ""] = line.split("=")
  const current_value = line.split("=").slice(1).join("=")
  let new_value: string

  const override = overrides.get(key!)
  if (override !== undefined) {
    new_value = override
  } else if (has_overrides || skip) {
    new_value = ""
  } else {
    const input = await prompt(`${key}=${current_value || "(empty)"}: `)
    new_value = input ?? ""
  }

  const trimmed_value = new_value.trim()
  new_lines.push(trimmed_value ? `${key}=${trimmed_value}` : line)
}

writeFileSync(env_path, new_lines.join("\n") + "\n")
console.log("✅ .env updated")
