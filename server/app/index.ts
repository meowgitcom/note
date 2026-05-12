import { Hono } from "hono"

const app = new Hono()

function getWelcomeMessage(name: string): string {
  return `Hello, ${name}! This message was generated in javascript.`
}

function calculateScore(points: number): number {
  return points * 10
}

app.get("/", (c) => {
  const name = c.req.query("name") || "Guest"
  return c.text(getWelcomeMessage(name))
})

app.get("/score/:val", (c) => {
  const val = parseInt(c.req.param("val"))
  const score = calculateScore(val)
  return c.json({ score })
})

export default app
