import { blocks, pages, templates, users, workspaceMembers, workspaces } from "./app"
import { columns, databases, relations, rollups, rows, tables, views } from "./database"
import { syncOperations, syncTombstones } from "./sync"

export interface LocalDbWorkspaceSummary {
  id: string
  name: string
  ownerId: string
  memberCount: number
  createdAt: string | null
}

export interface LocalDbSnapshot {
  driver: string
  location: string
  userCount: number
  workspaceCount: number
  workspaces: LocalDbWorkspaceSummary[]
}

const LOCAL_USER_ID = "local-user"
const LOCAL_WORKSPACE_ID = "local-workspace"

const resetOrder = [
  // Clear sync metadata (keep sync_state so deviceId remains stable).
  syncTombstones,
  syncOperations,
  relations,
  rollups,
  rows,
  views,
  columns,
  tables,
  databases,
  blocks,
  templates,
  pages,
  workspaceMembers,
  workspaces,
  users,
] as const

type DrizzleLikeDb = {
  delete: (table: any) => any
  insert: (table: any) => { values: (values: any) => any }
  select: () => { from: (table: any) => any }
}

export async function ensureLocalDbSeeded(db: DrizzleLikeDb) {
  const existingUsers = await readRows(db.select().from(users))
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    return
  }

  await seedLocalDb(db)
}

export async function resetLocalDbData(db: DrizzleLikeDb) {
  for (const table of resetOrder) {
    await runStatement(db.delete(table))
  }

  await seedLocalDb(db)
}

export async function readLocalDbSnapshot(
  db: DrizzleLikeDb,
  metadata: { driver: string; location: string },
): Promise<LocalDbSnapshot> {
  const [userRows, workspaceRows, membershipRows] = await Promise.all([
    readRows(db.select().from(users)),
    readRows(db.select().from(workspaces)),
    readRows(db.select().from(workspaceMembers)),
  ])

  const membershipsByWorkspace = new Map<string, number>()
  if (Array.isArray(membershipRows)) {
    for (const membership of membershipRows) {
      const current = membershipsByWorkspace.get(membership.workspaceId) ?? 0
      membershipsByWorkspace.set(membership.workspaceId, current + 1)
    }
  }

  return {
    driver: metadata.driver,
    location: metadata.location,
    userCount: Array.isArray(userRows) ? userRows.length : 0,
    workspaceCount: Array.isArray(workspaceRows) ? workspaceRows.length : 0,
    workspaces: Array.isArray(workspaceRows)
      ? workspaceRows.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          ownerId: workspace.ownerId,
          memberCount: membershipsByWorkspace.get(workspace.id) ?? 0,
          createdAt: workspace.createdAt ?? null,
        }))
      : [],
  }
}

async function seedLocalDb(db: DrizzleLikeDb) {
  await runStatement(
    db.insert(users).values({
      id: LOCAL_USER_ID,
      name: "Local Meow",
      image: null,
      type: "person",
    }),
  )

  await runStatement(
    db.insert(workspaces).values({
      id: LOCAL_WORKSPACE_ID,
      name: "Local Workspace",
      ownerId: LOCAL_USER_ID,
    }),
  )

  await runStatement(
    db.insert(workspaceMembers).values({
      workspaceId: LOCAL_WORKSPACE_ID,
      userId: LOCAL_USER_ID,
      role: "owner",
    }),
  )
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
    typeof value === "object" && value !== null && "all" in value && typeof value.all === "function"
  )
}

function hasRun(value: unknown): value is { run: () => unknown } {
  return (
    typeof value === "object" && value !== null && "run" in value && typeof value.run === "function"
  )
}

function hasExecute(value: unknown): value is { execute: () => Promise<unknown> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "execute" in value &&
    typeof value.execute === "function"
  )
}
