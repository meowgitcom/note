import { clientSchema } from "./client"
import * as syncSchema from "./sync"

export * from "./client"
export * from "./sync"

// Schema used by local apps (Expo/Electron) : shared app tables + local sync metadata.
export const localClientSchema = {
  ...clientSchema,
  ...syncSchema,
}

export type LocalClientSchema = typeof localClientSchema
