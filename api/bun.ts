import { app } from "./app"
import { env } from "env"

// Bun local dev entrypoint
app.listen(env.DEV_PORT_NUMBER)
console.log("http://localhost:" + env.DEV_PORT_NUMBER)
