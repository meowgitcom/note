import Database from "better-sqlite3"
import { app } from "electron"
import path from "path"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import {
  localClientSchema,
  ensureLocalDbSeeded,
  ensureLocalSyncState,
  readLocalDbSnapshot,
  resetLocalDbData,
  type LocalDbSnapshot,
} from "db"

type DesktopDb = BetterSQLite3Database<typeof localClientSchema>

let sqlite: Database.Database | null = null
let desktopDb: DesktopDb | null = null
let databaseFilePath = ""

export function initializeDesktopDb() {
  if (desktopDb) {
    return desktopDb
  }

  databaseFilePath = path.join(app.getPath("userData"), "meownote.sqlite")
  sqlite = new Database(databaseFilePath)
  desktopDb = drizzle(sqlite, { schema: localClientSchema })

  migrate(desktopDb, {
    migrationsFolder: path.join(app.getAppPath(), "drizzle"),
  })

  void ensureLocalDbSeeded(desktopDb)
  void ensureLocalSyncState(desktopDb)

  return desktopDb
}

export async function getDesktopDbSnapshot(): Promise<LocalDbSnapshot> {
  const db = initializeDesktopDb()
  await ensureLocalDbSeeded(db)
  await ensureLocalSyncState(db)

  return readLocalDbSnapshot(db, {
    driver: "better-sqlite3",
    location: databaseFilePath,
  })
}

export async function resetDesktopDb(): Promise<LocalDbSnapshot> {
  const db = initializeDesktopDb()
  await resetLocalDbData(db)
  return getDesktopDbSnapshot()
}
