import * as authSchema from "./auth"
import { clientSchema } from "./client"
import * as serverSyncSchema from "./sync/server"

export * from "./client"
export * from "./auth"
export * from "./sync/server"

export const serverSchema = {
  ...clientSchema,
  ...authSchema,
  ...serverSyncSchema,
}

export type ServerSchema = typeof serverSchema
