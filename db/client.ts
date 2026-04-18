import * as appSchema from "./app"
import * as databaseSchema from "./database"

export * from "./app"
export * from "./database"
export * from "./local"

export const clientSchema = {
  ...appSchema,
  ...databaseSchema,
}

export type ClientSchema = typeof clientSchema
