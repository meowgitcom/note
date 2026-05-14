app {
  package = "data"
  version = 3
}

enum "UserType" {
  values = ["PERSON", "BOT"]
  serializable = true
}

enum "MemberRole" {
  values = ["OWNER", "ADMIN", "MEMBER", "GUEST"]
  serializable = true
}

data_class "PageMeta" {
  serializable = true
  field "icon" { type = "String?" }
  field "cover" { type = "String?" }
  field "description" { type = "String?" }
  field "extra" { 
    type = "Map<String, JsonElement>"
    default = "emptyMap()" 
  }
}

data_class "BlockContent" {
  serializable = true
  field "text" { type = "String?" }
  field "checked" { type = "Boolean?" }
  field "url" { type = "String?" }
  field "caption" { type = "String?" }
  field "language" { type = "String?" }
  field "extra" { 
    type = "Map<String, JsonElement>"
    default = "emptyMap()" 
  }
}

data_class "BlockStyle" {
  serializable = true
  field "color" { type = "String?" }
  field "bgColor" { type = "String?" }
  field "bold" { type = "Boolean?" }
  field "italic" { type = "Boolean?" }
  field "extra" { 
    type = "Map<String, JsonElement>"
    default = "emptyMap()" 
  }
}

entity "User" {
  table_name = "users"
  primary_key = "id"

  column "id" { type = "String" }
  column "name" { type = "String" }
  column "image" { type = "String?" }
  column "type" { 
    type = "UserType"
    default = "UserType.PERSON" 
  }
  column "updated_at" { 
    type = "String"
    name = "updated_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "deleted" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }
}

entity "Workspace" {
  table_name = "workspaces"
  primary_key = "id"

  column "id" { type = "String" }
  column "name" { type = "String" }
  column "owner_id" { 
    type = "String"
    name = "owner_id" 
  }
  column "created_at" { 
    type = "String"
    name = "created_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "updated_at" { 
    type = "String"
    name = "updated_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "deleted" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }

  foreign_key {
    entity = "User"
    parent_columns = ["id"]
    child_columns = ["owner_id"]
    on_delete = "RESTRICT"
  }

  index {
    columns = ["owner_id"]
  }
}

entity "Member" {
  table_name = "workspace_members"
  primary_keys = ["workspace_id", "user_id"]

  column "workspace_id" { 
    type = "String"
    name = "workspace_id" 
  }
  column "user_id" { 
    type = "String"
    name = "user_id" 
  }
  column "role" { 
    type = "MemberRole"
    default = "MemberRole.MEMBER" 
  }
  column "joined_at" { 
    type = "String"
    name = "joined_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "updated_at" { 
    type = "String"
    name = "updated_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "deleted" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }

  foreign_key {
    entity = "Workspace"
    parent_columns = ["id"]
    child_columns = ["workspace_id"]
    on_delete = "CASCADE"
  }

  foreign_key {
    entity = "User"
    parent_columns = ["id"]
    child_columns = ["user_id"]
    on_delete = "CASCADE"
  }

  index { columns = ["workspace_id"] }
  index { columns = ["user_id"] }
}

entity "Page" {
  table_name = "pages"
  primary_key = "id"

  column "id" { type = "String" }
  column "workspace_id" { 
    type = "String"
    name = "workspace_id" 
  }
  column "parent_id" { 
    type = "String?"
    name = "parent_id" 
  }
  column "data_source_id" { 
    type = "String?"
    name = "data_source_id" 
  }
  column "title" { 
    type = "String"
    default_value = "Untitled"
    default = "\"Untitled\"" 
  }
  column "position" {
    type = "String"
    default_value = ""
    default = "\"\""
  }
  column "archived" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }
  column "meta" { 
    type = "PageMeta"
    default = "PageMeta()" 
  }
  column "updated_at" { 
    type = "String"
    name = "updated_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "deleted" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }

  foreign_key {
    entity = "Workspace"
    parent_columns = ["id"]
    child_columns = ["workspace_id"]
    on_delete = "CASCADE"
  }

  foreign_key {
    entity = "Page"
    parent_columns = ["id"]
    child_columns = ["parent_id"]
    on_delete = "SET_NULL"
  }

  index { columns = ["workspace_id"] }
  index { columns = ["parent_id"] }
}

entity "Block" {
  table_name = "blocks"
  primary_key = "id"

  column "id" { type = "String" }
  column "page_id" { 
    type = "String"
    name = "page_id" 
  }
  column "parent_block_id" { 
    type = "String?"
    name = "parent_block_id" 
  }
  column "position" { type = "String" }
  column "type" { type = "String" }
  column "content" { 
    type = "BlockContent"
    default = "BlockContent()" 
  }
  column "style" { 
    type = "BlockStyle"
    default = "BlockStyle()" 
  }
  column "updated_at" { 
    type = "String"
    name = "updated_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }
  column "deleted" { 
    type = "Boolean"
    default_value = "0"
    default = "false" 
  }

  foreign_key {
    entity = "Page"
    parent_columns = ["id"]
    child_columns = ["page_id"]
    on_delete = "CASCADE"
  }

  foreign_key {
    entity = "Block"
    parent_columns = ["id"]
    child_columns = ["parent_block_id"]
    on_delete = "CASCADE"
  }

  index { columns = ["page_id"] }
  index { columns = ["parent_block_id"] }
}

entity "Transaction" {
  table_name = "transactions"
  primary_key = "id"

  column "id" { type = "String" }
  column "workspace_id" { 
    type = "String"
    name = "workspace_id" 
  }
  column "user_id" { 
    type = "String"
    name = "user_id" 
  }
  column "seq" { 
    type = "Long" 
    name = "seq"
  }
  column "operations" { 
    type = "String" 
    name = "operations"
  }
  column "created_at" { 
    type = "String"
    name = "created_at"
    default_value = "CURRENT_TIMESTAMP"
    default = "\"\"" 
  }

  index { columns = ["workspace_id", "seq"] }
}


