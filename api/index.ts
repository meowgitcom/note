import { Elysia } from "elysia"

new Elysia().get("/", "open[note]").listen(3000)
