import { DurableObject } from "cloudflare:workers"
import { createAppDatabase, schema } from "../data"
import { eq, sql } from "drizzle-orm"

export class SyncRoom extends DurableObject {
  private lastSeq: number | null = null

  constructor(state: DurableObjectState, env: any) {
    super(state, env)
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Handle WebSocket
    if (url.pathname.startsWith("/ws")) {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      this.ctx.acceptWebSocket(server)
      return new Response(null, { status: 101, webSocket: client })
    }

    // Handle Transaction Pull
    if (request.method === "GET" && url.pathname.includes("/sync/pull")) {
      const workspaceId = url.pathname.split("/").pop()!
      const lastSeq = parseInt(url.searchParams.get("lastSeq") || "0", 10)
      const db = createAppDatabase((this.env as any).note)

      const transactions = await db
        .select()
        .from(schema.Transaction)
        .where(sql`workspace_id = ${workspaceId} and seq > ${lastSeq}`)
        .orderBy(sql`seq ASC`)
        .all()

      return Response.json({ transactions })
    }

    // Handle Transaction Push
    if (request.method === "POST" && url.pathname.includes("/sync/push")) {
      const workspaceId = url.pathname.split("/").pop()!
      const incomingTransactions = await request.json<any[]>()
      const db = createAppDatabase((this.env as any).note)

      let pushLastSeq = 0

      // Use transaction for atomicity - ensures seq increments are sequential
      await db.transaction(async (trx) => {
        // Get current max seq inside transaction to lock the row
        const res = await trx
          .select({ val: sql<number>`max(seq)` })
          .from(schema.Transaction)
          .where(eq(schema.Transaction.workspace_id, workspaceId))
          .get()
        let currentSeq = res?.val || 0

        // Apply each transaction
        for (const incomingTx of incomingTransactions) {
          currentSeq++
          const operations = JSON.parse(incomingTx.operations)

          // Apply operations to state tables (Blocks, Pages, etc.)
          await this.applyOperations(trx, operations)

          // Save transaction to log
          await trx
            .insert(schema.Transaction)
            .values({
              id: incomingTx.id,
              workspace_id: workspaceId,
              user_id: incomingTx.user_id,
              seq: currentSeq,
              operations: incomingTx.operations,
              created_at: new Date().toISOString(),
            })
            .run()
        }

        pushLastSeq = currentSeq
      })

      this.lastSeq = pushLastSeq

      // 3. Notify others
      this.broadcast({ type: "fetch_needed", workspace_id: workspaceId, lastSeq: this.lastSeq })

      return Response.json({ success: true, lastSeq: this.lastSeq })
    }

    return new Response("Not Found", { status: 404 })
  }

  private async applyOperations(db: any, operations: any[]) {
    for (const op of operations) {
      const { command, table, id, data } = op
      const targetTable = (schema as any)[table]
      if (!targetTable) continue

      if (command === "set" || command === "update") {
        // Cycle Detection for nested structures (Page -> parent_id, Block -> parent_block_id)
        const parentId = data.parent_id || data.parent_block_id
        if (parentId) {
          const hasCycle = await this.checkForCycle(db, table, id, parentId)
          if (hasCycle) {
            console.warn(`Cycle detected for ${table} ${id} -> ${parentId}. Skipping operation.`)
            continue
          }
        }

        // Fetch existing record to merge with partial updates
        const existing =
          command === "update"
            ? await db.select().from(targetTable).where(eq(targetTable.id, id)).get()
            : null

        const mergedData = existing
          ? { ...existing, ...data, updated_at: new Date().toISOString() }
          : { ...data, id, updated_at: new Date().toISOString() }

        await db
          .insert(targetTable)
          .values(mergedData)
          .onConflictDoUpdate({
            target: targetTable.id
              ? targetTable.id
              : [targetTable.workspace_id, targetTable.user_id],
            set: mergedData,
          })
          .run()
      } else if (command === "delete") {
        await db
          .update(targetTable)
          .set({ deleted: true, updated_at: new Date().toISOString() })
          .where(eq(targetTable.id || targetTable.workspace_id, id))
          .run()
      }
    }
  }

  private async checkForCycle(
    db: any,
    table: string,
    childId: string,
    targetParentId: string,
  ): Promise<boolean> {
    if (childId === targetParentId) return true

    const targetTable = (schema as any)[table]
    const parentField = table === "Page" ? targetTable.parent_id : targetTable.parent_block_id
    if (!parentField) return false

    let currentParentId = targetParentId
    const seen = new Set<string>([childId])

    // Trace up the parent chain (max 50 levels to prevent infinite loops in bad states)
    for (let i = 0; i < 50; i++) {
      if (!currentParentId) return false
      if (seen.has(currentParentId)) return true
      seen.add(currentParentId)

      const parentRecord = await db
        .select({ parent: parentField })
        .from(targetTable)
        .where(eq(targetTable.id, currentParentId))
        .get()

      if (!parentRecord) return false
      currentParentId = parentRecord.parent
    }

    return true // Assume cycle if too deep
  }

  broadcast(message: any, exclude?: WebSocket) {
    const data = JSON.stringify(message)
    this.ctx.getWebSockets().forEach((ws) => {
      if (ws !== exclude) {
        try {
          ws.send(data)
        } catch (e) {
          console.error(`Failed to broadcast to client: ${e}`)
        }
      }
    })
  }
}
