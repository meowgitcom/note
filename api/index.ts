import { createApp } from "./app"
import { createApiDb } from "./db/client"
import { env } from "env"

// Bun local dev entrypoint (Wrangler is the default dev server).
const db = createApiDb()
const app = createApp({ db })

app.listen(env.DEV_PORT_NUMBER)
console.log("http://localhost:" + env.DEV_PORT_NUMBER)
