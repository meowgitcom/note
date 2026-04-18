import { syncState } from "./state"

type DrizzleLikeDb = {
  insert: (table: any) => { values: (values: any) => any }
  select: () => { from: (table: any) => any }
}

const LOCAL_SYNC_STATE_ID = "local"

export async function ensureLocalSyncState(db: DrizzleLikeDb) {
  const existing = await readRows(db.select().from(syncState))
  if (Array.isArray(existing) && existing.length > 0) {
    return existing[0]
  }

  const deviceId = generateId()
  await runStatement(
    db.insert(syncState).values({
      id: LOCAL_SYNC_STATE_ID,
      deviceId,
    }),
  )

  const rows = await readRows(db.select().from(syncState))
  return rows[0] ?? null
}

export function generateId() {
  const cryptoObj: any = (globalThis as any).crypto
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID() as string
  }

  const getRandomValues: ((a: Uint8Array) => Uint8Array) | undefined = cryptoObj?.getRandomValues
  if (getRandomValues) {
    const bytes = getRandomValues(new Uint8Array(16))
    // RFC4122 v4
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // Last resort (non-cryptographic) : still stable enough for a local device id.
  return `dev_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`
}

async function readRows<T>(query: T): Promise<any[]> {
  if (hasAll(query)) {
    return query.all()
  }
  if (hasExecute(query)) {
    return (await query.execute()) as any[]
  }
  return (await query) as any[]
}

async function runStatement<T>(query: T) {
  if (hasRun(query)) {
    return query.run()
  }
  if (hasExecute(query)) {
    return await query.execute()
  }
  return await query
}

function hasAll(value: unknown): value is { all: () => any[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "all" in value &&
    typeof (value as any).all === "function"
  )
}

function hasRun(value: unknown): value is { run: () => unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "run" in value &&
    typeof (value as any).run === "function"
  )
}

function hasExecute(value: unknown): value is { execute: () => Promise<unknown> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "execute" in value &&
    typeof (value as any).execute === "function"
  )
}
