import { Hono } from "hono"
import { getWelcomeMessage, calculateScore } from "../dist/server.mjs"

const app = new Hono()

app.get('/', (c) => {
  const name = c.req.query('name') || 'Guest'
  return c.text(getWelcomeMessage(name))
})

app.get('/score/:val', (c) => {
  const val = parseInt(c.req.param('val'))
  const score = calculateScore(val)
  return c.json({ score })
})

export default app
