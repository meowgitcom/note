import { drizzle } from "drizzle-orm/d1"
import * as BlockModule from "../app/block"
import * as MemberModule from "../app/member"
import * as PageModule from "../app/page"
import * as TransactionModule from "../app/transaction"
import * as UserModule from "../app/user"
import * as WorkspaceModule from "../app/workspace"

export const schema = {
  ...BlockModule,
  ...MemberModule,
  ...PageModule,
  ...TransactionModule,
  ...UserModule,
  ...WorkspaceModule,
}

type D1Binding = Parameters<typeof drizzle>[0]

export function createAppDatabase(d1: D1Binding) {
  return drizzle(d1, { schema })
}
