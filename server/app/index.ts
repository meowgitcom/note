import { Hono } from "hono"
import { createAppDatabase, schema } from "../data"
import { gt, and, eq } from "drizzle-orm"
import { SyncRoom } from "./sync"

type Env = {
  Bindings: {
    note: D1Database
    SYNC_ROOM: DurableObjectNamespace
  }
}

const app = new Hono<Env>()

app.get("/", (c) => {
  return c.text("Notion-Scale Sync Server is running.")
})

// PULL: Get all transactions for a workspace since a specific sequence number
app.get("/sync/pull/:workspaceId", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  const lastSeq = parseInt(c.req.query("lastSeq") || "0")
  const db = createAppDatabase(c.env.note)

  const transactions = await db
    .select()
    .from(schema.Transaction)
    .where(
      and(eq(schema.Transaction.workspace_id, workspaceId), gt(schema.Transaction.seq, lastSeq)),
    )
    .orderBy(schema.Transaction.seq)
    .all()

  return c.json(transactions)
})

// PUSH: Save new transactions and apply their operations to the state
app.post("/sync/push/:workspaceId", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  const id = c.env.SYNC_ROOM.idFromName(workspaceId)
  const room = c.env.SYNC_ROOM.get(id)

  // Forward to Durable Object to handle sequencing and state application
  return room.fetch(c.req.raw)
})

app.get("/ws/:workspaceId", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  const id = c.env.SYNC_ROOM.idFromName(workspaceId)
  const room = c.env.SYNC_ROOM.get(id)
  return room.fetch(c.req.raw)
})

export { SyncRoom }
export default app
