import migrations from "../drizzle/migrations"
import { openDatabaseSync } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"
import { migrate } from "drizzle-orm/expo-sqlite/migrator"
import {
  localClientSchema,
  ensureLocalDbSeeded,
  ensureLocalSyncState,
  readLocalDbSnapshot as buildLocalDbSnapshot,
  resetLocalDbData,
  type LocalDbSnapshot,
} from "db"

const databaseName = "meownote.db"
const sqlite = openDatabaseSync(databaseName, { enableChangeListener: true })

export const localDb = drizzle(sqlite, { schema: localClientSchema })

let bootstrapPromise: Promise<LocalDbSnapshot> | null = null

export function bootstrapLocalDb() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await migrate(localDb, migrations)
      await ensureLocalDbSeeded(localDb)
      await ensureLocalSyncState(localDb)
      return buildLocalDbSnapshot(localDb, {
        driver: "expo-sqlite",
        location: databaseName,
      })
    })().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  return bootstrapPromise
}

export async function readLocalDbSnapshot() {
  await bootstrapLocalDb()

  return buildLocalDbSnapshot(localDb, {
    driver: "expo-sqlite",
    location: databaseName,
  })
}

export async function resetLocalDb() {
  await bootstrapLocalDb()
  await resetLocalDbData(localDb)
  return readLocalDbSnapshot()
}
