import { parse } from "@cdktf/hcl2json"
import fs from "fs"
import path from "path"

function capFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function mapKotlinTypeToTs(kType: string): string {
  const base = kType.endsWith("?") ? kType.slice(0, -1) : kType
  switch (base) {
    case "String":
      return "string"
    case "Int":
    case "Long":
      return "number"
    case "Boolean":
      return "boolean"
    case "Float":
    case "Double":
      return "number"
    default:
      if (base.startsWith("Map<")) return "Record<string, any>"
      if (base.startsWith("List<")) return "any[]"
      return base
  }
}

function getDrizzleType(kType: string, raw: any): { drizzleType: string; options: string } {
  const base = kType.endsWith("?") ? kType.slice(0, -1) : kType

  if (raw.enum && raw.enum[base]) return { drizzleType: "text", options: "" }
  if (raw.data_class && raw.data_class[base])
    return { drizzleType: "text", options: `, { mode: "json" }` }

  switch (base) {
    case "String":
      return { drizzleType: "text", options: "" }
    case "Int":
    case "Long":
      return { drizzleType: "integer", options: "" }
    case "Boolean":
      return { drizzleType: "integer", options: `, { mode: "boolean" }` }
    case "Float":
    case "Double":
      return { drizzleType: "real", options: "" }
    default:
      return { drizzleType: "text", options: "" }
  }
}

async function processFile(hclFile: string): Promise<string[]> {
  const moduleName = path.basename(hclFile, ".hcl").toLowerCase()
  const moduleNameCap = capFirst(moduleName)
  const hclContent = fs.readFileSync(hclFile, "utf-8")
  const raw = (await parse(hclFile, hclContent)) as any

  const moduleDir = path.join(__dirname, "../", "data", moduleName)
  if (fs.existsSync(moduleDir)) {
    fs.rmSync(moduleDir, { recursive: true, force: true })
  }
  fs.mkdirSync(moduleDir, { recursive: true })

  const allEntities = Object.keys(raw.entity || {})

  const entities = raw.entity || {}
  for (const [name, bodies] of Object.entries(entities)) {
    const body = (bodies as any)[0]
    const tableName = body.table_name || name.toLowerCase()
    const fileName = name.toLowerCase()
    const filePath = path.join(moduleDir, `${fileName}.ts`)

    const columns = body.column || {}
    const pkList: string[] = body.primary_keys || [body.primary_key]
    const hasCompositePk = body.primary_keys && body.primary_keys.length > 1
    const hasIndexes = body.index && body.index.length > 0

    const colToFk = new Map<string, any>()
    if (body.foreign_key) {
      body.foreign_key.forEach((fk: any) => {
        if (fk.child_columns.length === 1) colToFk.set(fk.child_columns[0], fk)
      })
    }

    const sqliteImports = new Set<string>(["sqliteTable", "text"])
    const drizzleImports = new Set<string>(["eq"])
    let needsAnySQLiteColumn = false

    for (const [, cBodies] of Object.entries(columns)) {
      const cBody = (cBodies as any)[0]
      const typeInfo = getDrizzleType(cBody.type, raw)
      if (typeInfo.drizzleType === "integer") sqliteImports.add("integer")
      if (typeInfo.drizzleType === "real") sqliteImports.add("real")
      if (cBody.default_value === "CURRENT_TIMESTAMP") drizzleImports.add("sql")
    }

    if (hasCompositePk) {
      sqliteImports.add("primaryKey")
      drizzleImports.add("and")
    }
    if (pkList.length > 1) drizzleImports.add("and")
    if (hasIndexes) sqliteImports.add("index")

    for (const cName of Object.keys(columns)) {
      const fk = colToFk.get(cName)
      if (fk && fk.entity === name) needsAnySQLiteColumn = true
    }

    const crossEntityImports = new Set<string>()
    for (const cName of Object.keys(columns)) {
      const fk = colToFk.get(cName)
      if (fk && fk.entity !== name) crossEntityImports.add(fk.entity)
    }

    let code = `import { ${[...sqliteImports].join(", ")} } from "drizzle-orm/sqlite-core"\n`
    if (needsAnySQLiteColumn) {
      code += `import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"\n`
    }
    code += `import { ${[...drizzleImports].join(", ")} } from "drizzle-orm"\n`
    code += `import { DrizzleD1Database } from "drizzle-orm/d1"\n`
    for (const dep of crossEntityImports) {
      code += `import { ${dep} } from "./${dep.toLowerCase()}"\n`
    }
    code += "\n"

    if (raw.enum) {
      for (const [enName, enBodies] of Object.entries(raw.enum)) {
        const enBody = (enBodies as any)[0]
        if (
          body.column &&
          Object.values(body.column).some((cB: any) => cB[0].type.startsWith(enName))
        ) {
          code += `export const ${enName}Values = ${JSON.stringify(enBody.values)} as const\n`
          code += `export type ${enName} = (typeof ${enName}Values)[number]\n\n`
        }
      }
    }

    if (raw.data_class) {
      for (const [dcName, dcBodies] of Object.entries(raw.data_class)) {
        const dcBody = (dcBodies as any)[0]
        if (
          body.column &&
          Object.values(body.column).some((cB: any) => cB[0].type.startsWith(dcName))
        ) {
          code += `export interface ${dcName} {\n`
          if (dcBody.field) {
            for (const [fName, fBodies] of Object.entries(dcBody.field)) {
              const fBody = (fBodies as any)[0]
              const tsType = mapKotlinTypeToTs(fBody.type)
              code += `  ${fName}${fBody.type.endsWith("?") ? "?" : ""}: ${tsType}\n`
            }
          }
          code += `}\n\n`
        }
      }
    }

    code += `export const ${name} = sqliteTable("${tableName}", {\n`

    for (const [cName, cBodies] of Object.entries(columns)) {
      const cBody = (cBodies as any)[0]
      const colName = cBody.name || cName
      const typeInfo = getDrizzleType(cBody.type, raw)

      let colDef = `  ${cName}: ${typeInfo.drizzleType}("${colName}"${typeInfo.options})`

      if (typeInfo.options.includes("json")) {
        const base = cBody.type.endsWith("?") ? cBody.type.slice(0, -1) : cBody.type
        colDef += `.$type<${base}>()`
      }

      if (body.primary_key === cName) {
        colDef += `.primaryKey()`
      }

      const fk = colToFk.get(cName)
      if (fk) {
        const parentTable = fk.entity
        const parentCol = fk.parent_columns[0]
        const refExpr =
          parentTable === name
            ? `(): AnySQLiteColumn => ${name}.${parentCol}`
            : `() => ${parentTable}.${parentCol}`
        colDef += `.references(${refExpr}`
        if (fk.on_delete)
          colDef += `, { onDelete: "${fk.on_delete.toLowerCase().replace("_", " ")}" }`
        colDef += ")"
        code += colDef + ",\n"
      } else {
        if (cBody.default_value !== undefined) {
          if (cBody.default_value === "CURRENT_TIMESTAMP") {
            colDef += `.default(sql\`CURRENT_TIMESTAMP\`)`
          } else if (typeInfo.options.includes("boolean")) {
            const boolVal =
              cBody.default_value === "0" || cBody.default_value === 0 ? "false" : "true"
            colDef += `.default(${boolVal})`
          } else if (
            typeInfo.drizzleType === "text" &&
            !String(cBody.default_value).startsWith('"')
          ) {
            colDef += `.default("${cBody.default_value}")`
          } else {
            colDef += `.default(${cBody.default_value})`
          }
        }
        code += colDef + ",\n"
      }
    }

    if (hasCompositePk || hasIndexes) {
      code += `}, (table) => ({\n`
      if (hasCompositePk) {
        const pks = body.primary_keys.map((pk: string) => `table.${pk}`).join(", ")
        code += `  pk: primaryKey({ columns: [${pks}] }),\n`
      }
      if (hasIndexes) {
        body.index.forEach((idxBody: any, i: number) => {
          const cols = idxBody.columns.map((c: string) => `table.${c}`).join(", ")
          code += `  idx${i}: index("${tableName}_${idxBody.columns.join("_")}_idx").on(${cols}),\n`
        })
      }
      code += `}))\n\n`
    } else {
      code += `})\n\n`
    }

    code += `export class ${name}Dao {\n`
    code += `  constructor(private db: DrizzleD1Database<any>) {}\n\n`

    const target = hasCompositePk
      ? `[${body.primary_keys.map((pk: string) => `${name}.${pk}`).join(", ")}]`
      : `${name}.${body.primary_key}`
    code += `  async upsert(item: typeof ${name}.$inferInsert) {\n`
    code += `    return this.db.insert(${name}).values(item).onConflictDoUpdate({ target: ${target}, set: item }).run()\n`
    code += `  }\n\n`

    const pkWhere = pkList.map((pk: string) => `eq(${name}.${pk}, item.${pk}!)`).join(", ")
    const pkCondition = pkList.length > 1 ? `and(${pkWhere})` : pkWhere

    code += `  async update(item: Partial<typeof ${name}.$inferInsert> & { ${pkList.map((pk: string) => `${pk}: any`).join(", ")} }) {\n`
    code += `    return this.db.update(${name}).set(item).where(${pkCondition}).run()\n`
    code += `  }\n\n`

    code += `  async delete(item: { ${pkList.map((pk: string) => `${pk}: any`).join(", ")} }) {\n`
    code += `    return this.db.delete(${name}).where(${pkCondition}).run()\n`
    code += `  }\n\n`

    if (pkList.length === 1) {
      code += `  async getById(id: string) {\n`
      code += `    return this.db.select().from(${name}).where(eq(${name}.${pkList[0]}, id)).get()\n`
      code += `  }\n\n`
    } else {
      const pkArgs = pkList.map((pk: string) => `${pk}: any`).join(", ")
      const getWhere = pkList.map((pk: string) => `eq(${name}.${pk}, ${pk})`).join(", ")
      code += `  async get(${pkArgs}) {\n`
      code += `    return this.db.select().from(${name}).where(and(${getWhere})).get()\n`
      code += `  }\n\n`
    }

    code += `  async getAll() {\n`
    code += `    return this.db.select().from(${name}).all()\n`
    code += `  }\n`
    code += `}\n`

    fs.writeFileSync(filePath, code)
  }

  const dbDir = path.join(__dirname, "../", "data", "db")
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

  let dbCode = `import { drizzle } from "drizzle-orm/d1"\n`
  for (const entity of allEntities) {
    dbCode += `import * as ${entity}Module from "../${moduleName}/${entity.toLowerCase()}"\n`
  }
  dbCode += `\nexport const schema = {\n`
  for (const entity of allEntities) {
    dbCode += `  ...${entity}Module,\n`
  }
  dbCode += `}\n\n`
  dbCode += `type D1Binding = Parameters<typeof drizzle>[0]\n\n`
  dbCode += `export function create${moduleNameCap}Database(d1: D1Binding) {\n`
  dbCode += `  return drizzle(d1, { schema })\n`
  dbCode += `}\n`

  fs.writeFileSync(path.join(dbDir, `${moduleName}.ts`), dbCode)

  const mainFile = path.join(__dirname, "../", "data", "index.ts")
  let mainCode = fs.existsSync(mainFile) ? fs.readFileSync(mainFile, "utf-8") : ""
  for (const entity of allEntities) {
    mainCode += `export * from "./${moduleName}/${entity.toLowerCase()}"\n`
  }
  mainCode += `export { create${moduleNameCap}Database } from "./db/${moduleName}"\n`
  fs.writeFileSync(mainFile, mainCode)

  return allEntities
}

async function main() {
  const hclDir = path.join(__dirname, "../../data/hcl")
  const files = fs.readdirSync(hclDir).filter((f) => f.endsWith(".hcl"))

  const dataDir = path.join(__dirname, "../", "data")
  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
  fs.mkdirSync(dataDir, { recursive: true })

  fs.writeFileSync(path.join(dataDir, "index.ts"), "")

  const moduleEntities: Record<string, string[]> = {}
  for (const file of files) {
    const mod = path.basename(file, ".hcl").toLowerCase()
    moduleEntities[mod] = await processFile(path.join(hclDir, file))
    console.log(`Processed ${file}`)
  }

  const schemaFile = path.join(dataDir, "db", "schema.ts")
  let combinedSchema = ""
  for (const [mod, entities] of Object.entries(moduleEntities)) {
    for (const entity of entities) {
      combinedSchema += `export * from "../${mod}/${entity.toLowerCase()}"\n`
    }
  }
  fs.writeFileSync(schemaFile, combinedSchema)
}

main().catch(console.error)
