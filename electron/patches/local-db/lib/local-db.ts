import type { LocalDbSnapshot } from "db"

declare global {
  interface Window {
    electronAPI: {
      getDbSnapshot: () => Promise<LocalDbSnapshot>
      resetDb: () => Promise<LocalDbSnapshot>
    }
  }
}

export async function bootstrapLocalDb() {
  return window.electronAPI.getDbSnapshot()
}

export async function readLocalDbSnapshot() {
  return window.electronAPI.getDbSnapshot()
}

export async function resetLocalDb() {
  return window.electronAPI.resetDb()
}
