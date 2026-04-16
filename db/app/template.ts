import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { workspaces } from "./workspace"
import { pages } from "./page"
import { databases } from "../database/database"

// Templates are pre-filled content used to create new pages or new database rows.
// Scope is controlled via optional foreign keys : 
// - workspaceId : template is visible within a workspace
// - pageId : template appears in the "New" menu for a given page
// - databaseId : template appears in the "New" menu for a database
export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Optional placement/scope anchors.
  pageId: text("page_id").references(() => pages.id, { onDelete: "cascade" }),
  databaseId: text("database_id").references(() => databases.id, { onDelete: "cascade" }),

  name: text("name").notNull().default("Untitled"),
  type: text("type", { enum: ["page", "row"] }).notNull(),

  // Arbitrary pre-filled content. For a page template this might include blocks/metadata;
  // for a row template this might include column values.
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),

  archived: integer("archived", { mode: "boolean" }).notNull().default(false),

  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

export type Template = typeof templates.$inferSelect
export type NewTemplate = typeof templates.$inferInsert
