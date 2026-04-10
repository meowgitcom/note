import { Elysia } from "elysia"
import { env } from "env"
new Elysia().get("/", "open[note]").listen(env.DEV_PORT_NUMBER)
console.log("http://localhost:" + env.DEV_PORT_NUMBER)
