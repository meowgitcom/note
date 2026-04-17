import { Elysia } from "elysia"
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker"

import { registerFileRoutes } from "./router"

// Worker-compatible Elysia app.
// Uses Cloudflare adapter + compile() per Elysia docs.
export const app = new Elysia({
  adapter: CloudflareAdapter,
})

registerFileRoutes(app)

app.compile()

export default app
