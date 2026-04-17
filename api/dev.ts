import { spawn } from "bun"

const gen = spawn(["bun", "run", "routes:watch"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
})

const server = spawn(["bun", "--watch", "bun.ts"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
})

const killAll = () => {
  try {
    gen.kill()
  } catch {}
  try {
    server.kill()
  } catch {}
}

process.on("SIGINT", () => {
  killAll()
  process.exit(0)
})

process.on("SIGTERM", () => {
  killAll()
  process.exit(0)
})

await Promise.all([gen.exited, server.exited])
