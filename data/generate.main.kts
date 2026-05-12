#!/usr/bin/env kotlin

@file:DependsOn("com.bertramlabs.plugins:hcl4j:0.9.8")

import com.bertramlabs.plugins.hcl4j.HCLParser
import java.io.File

// --- Schema Objects ---

data class HclEnum(val name: String, val values: List<String>)
data class HclField(val name: String, val type: String, val default: String?)
data class HclDataClass(val name: String, val fields: List<HclField>)
data class HclColumn(val name: String, val type: String, val colName: String?, val defaultValue: String?, val default: String?, val isPrimaryKey: Boolean = false)
data class HclForeignKey(val entity: String, val parentColumns: List<String>, val childColumns: List<String>, val onDelete: String)
data class HclIndex(val columns: List<String>)
data class HclEntity(
    val name: String, 
    val tableName: String, 
    val primaryKeys: List<String>,
    val columns: List<HclColumn>,
    val foreignKeys: List<HclForeignKey>,
    val indices: List<HclIndex>
)

class HclSchema(val packageName: String, val moduleName: String) {
    val enums = mutableListOf<HclEnum>()
    val dataClasses = mutableListOf<HclDataClass>()
    val entities = mutableListOf<HclEntity>()
}

@Suppress("UNCHECKED_CAST")
fun parseHcl(file: File): HclSchema {
    val moduleName = file.nameWithoutExtension.lowercase()
    val parser = HCLParser()
    val raw = parser.parse(file) as Map<String, Any>
    
    val app = raw["app"] as? Map<String, Any>
    val pkg = app?.get("package")?.toString() ?: "data"
    val schema = HclSchema(pkg, moduleName)

    // Parse Enums
    (raw["enum"] as? Map<String, Any>)?.forEach { (name, body) ->
        val b = body as Map<String, Any>
        val values = (b["values"] as? List<String>) ?: emptyList()
        schema.enums.add(HclEnum(name, values))
    }

    // Parse Data Classes
    (raw["data_class"] as? Map<String, Any>)?.forEach { (name, body) ->
        val b = body as Map<String, Any>
        val fields = (b["field"] as? Map<String, Any>)?.map { (fName, fBody) ->
            val fb = fBody as Map<String, Any>
            HclField(fName, fb["type"].toString(), fb["default"]?.toString())
        } ?: emptyList()
        schema.dataClasses.add(HclDataClass(name, fields))
    }

    // Parse Entities
    (raw["entity"] as? Map<String, Any>)?.forEach { (name, body) ->
        val b = body as Map<String, Any>
        val tableName = b["table_name"]?.toString() ?: name.lowercase()
        val pKey = b["primary_key"]?.toString()
        val pKeys = (b["primary_keys"] as? List<String>) ?: (if (pKey != null) listOf(pKey) else emptyList())

        val columns = (b["column"] as? Map<String, Any>)?.map { (cName, cBody) ->
            val cb = cBody as Map<String, Any>
            HclColumn(
                cName, 
                cb["type"].toString(), 
                cb["name"]?.toString(), 
                cb["default_value"]?.toString(), 
                cb["default"]?.toString(),
                pKeys.contains(cName)
            )
        } ?: emptyList()

        val fks = (b["foreign_key"] as? List<Map<String, Any>>)?.map { fb ->
            HclForeignKey(
                fb["entity"].toString(),
                (fb["parent_columns"] as? List<String>) ?: emptyList(),
                (fb["child_columns"] as? List<String>) ?: emptyList(),
                fb["on_delete"]?.toString() ?: "CASCADE"
            )
        } ?: emptyList()

        val indices = (b["index"] as? List<Map<String, Any>>)?.map { ib ->
            HclIndex((ib["columns"] as? List<String>) ?: emptyList())
        } ?: emptyList()

        schema.entities.add(HclEntity(name, tableName, pKeys, columns, fks, indices))
    }

    return schema
}

// --- Generator ---

fun String.snakeToCamelCase(): String {
    val pattern = "_([a-z])".toRegex()
    return replace(pattern) { it.groupValues[1].uppercase() }
}

fun generate(schema: HclSchema) {
    val moduleName = schema.moduleName
    val moduleNameCap = moduleName.replaceFirstChar { it.uppercase() }
    val entityPkg = "${schema.packageName}.$moduleName"
    
    // 1. Entities & DAOs -> src/[module]/
    val entityDir = File("src/$moduleName")
    entityDir.mkdirs()
    
    schema.entities.forEach { entity ->
        val fileName = entity.name.lowercase()
        val file = File(entityDir, "$fileName.kt")
        
        val relatedDataClasses = schema.dataClasses.filter { dc -> entity.columns.any { it.type == dc.name } }
        val imports = mutableSetOf("androidx.room.Entity", "androidx.room.PrimaryKey", "androidx.room.Dao", "androidx.room.Insert", "androidx.room.Update", "androidx.room.Delete", "androidx.room.Query", "androidx.room.OnConflictStrategy")
        if (entity.columns.any { it.colName != null || it.defaultValue != null || it.name.contains("_") }) imports.add("androidx.room.ColumnInfo")
        if (entity.foreignKeys.isNotEmpty()) imports.add("androidx.room.ForeignKey")
        if (entity.indices.isNotEmpty()) imports.add("androidx.room.Index")
        
        val allTypes = entity.columns.map { it.type } + relatedDataClasses.flatMap { dc -> dc.fields.map { it.type } }
        if (allTypes.any { type -> schema.enums.any { it.name == type } || schema.dataClasses.any { it.name == type } }) imports.add("kotlinx.serialization.Serializable")
        if (allTypes.any { it.contains("JsonElement") }) imports.add("kotlinx.serialization.json.JsonElement")
        imports.add("kotlinx.coroutines.flow.Flow")

        val sb = StringBuilder("package $entityPkg\n\n")
        imports.sorted().forEach { sb.append("import $it\n") }
        sb.append("\n@Entity(\n")
        sb.append("    tableName = \"${entity.tableName}\"")
        if (entity.primaryKeys.size > 1) {
            sb.append(",\n    primaryKeys = [${entity.primaryKeys.joinToString { "\"$it\"" }}]")
        }
        if (entity.foreignKeys.isNotEmpty()) {
            sb.append(",\n    foreignKeys = [\n")
            entity.foreignKeys.forEach { fk ->
                sb.append("        ForeignKey(\n")
                sb.append("            entity = ${fk.entity}::class,\n")
                sb.append("            parentColumns = [${fk.parentColumns.joinToString { "\"$it\"" }}],\n")
                sb.append("            childColumns = [${fk.childColumns.joinToString { "\"$it\"" }}],\n")
                sb.append("            onDelete = ForeignKey.${fk.onDelete}\n")
                sb.append("        ),\n")
            }
            sb.deleteRange(sb.length - 2, sb.length - 1)
            sb.append("    ]")
        }
        if (entity.indices.isNotEmpty()) {
            sb.append(",\n    indices = [${entity.indices.joinToString { "Index(${it.columns.joinToString { "\"$it\"" }})" }}]")
        }
        sb.append("\n) data class ${entity.name}(\n")
        val colsStr = entity.columns.joinToString(",\n") { col ->
            val fieldSb = StringBuilder("    ")
            if (col.isPrimaryKey && entity.primaryKeys.size == 1) fieldSb.append("@PrimaryKey ")
            
            val propName = col.name.snakeToCamelCase()
            val effectiveColName = col.colName ?: col.name
            
            if (effectiveColName != propName || col.defaultValue != null) {
                fieldSb.append("@ColumnInfo(")
                val parts = mutableListOf<String>()
                if (effectiveColName != propName) parts.add("name = \"$effectiveColName\"")
                if (col.defaultValue != null) parts.add("defaultValue = \"${col.defaultValue}\"")
                fieldSb.append(parts.joinToString(", "))
                fieldSb.append(") ")
            }
            
            fieldSb.append("val $propName: ${col.type}")
            if (col.default != null) {
                fieldSb.append(" = ${col.default}")
            } else if (col.type.endsWith("?")) {
                fieldSb.append(" = null")
            }
            fieldSb.toString()
        }
        sb.append(colsStr).append("\n)\n")

        schema.enums.filter { en -> entity.columns.any { it.type == en.name } }.forEach { en ->
            sb.append("\n@Serializable enum class ${en.name} { ${en.values.joinToString(", ")} }\n")
        }
        relatedDataClasses.forEach { dc ->
            sb.append("\n@Serializable data class ${dc.name}(\n")
            val fieldsStr = dc.fields.joinToString(",\n") { f ->
                val propName = f.name.snakeToCamelCase()
                val defValue = when {
                    f.default != null -> {
                        var def = f.default
                        if (def == "emptyMap()" && f.type.startsWith("Map<")) {
                            val inner = f.type.substringAfter("<").substringBeforeLast(">")
                            def = "emptyMap<$inner>()"
                        }
                        " = $def"
                    }
                    f.type.endsWith("?") -> " = null"
                    else -> ""
                }
                "    val $propName: ${f.type}$defValue"
            }
            sb.append(fieldsStr).append("\n)\n")
        }

        // DAO Generation
        sb.append("\n@Dao interface ${entity.name}Dao {\n")
        sb.append("    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: ${entity.name})\n")
        sb.append("    @Update suspend fun update(item: ${entity.name})\n")
        sb.append("    @Delete suspend fun delete(item: ${entity.name})\n\n")
        
        if (entity.primaryKeys.size == 1) {
            val pk = entity.primaryKeys[0]
            val col = entity.columns.first { it.name == pk }
            val propName = pk.snakeToCamelCase()
            sb.append("    @Query(\"SELECT * FROM ${entity.tableName} WHERE $pk = :$propName\")\n")
            sb.append("    suspend fun getById($propName: ${col.type}): ${entity.name}?\n\n")
        } else {
            entity.primaryKeys.forEach { pk ->
                val col = entity.columns.first { it.name == pk }
                val propName = pk.snakeToCamelCase()
                val methodName = "getBy${propName.replaceFirstChar { it.uppercase() }}"
                sb.append("    @Query(\"SELECT * FROM ${entity.tableName} WHERE $pk = :$propName\")\n")
                sb.append("    fun $methodName($propName: ${col.type}): Flow<List<${entity.name}>>\n\n")
            }
            
            val pkWhere = entity.primaryKeys.joinToString(" AND ") { "$it = :${it.snakeToCamelCase()}" }
            val pkParams = entity.primaryKeys.joinToString(", ") { pk ->
                val col = entity.columns.first { it.name == pk }
                "${pk.snakeToCamelCase()}: ${col.type}"
            }
            sb.append("    @Query(\"SELECT * FROM ${entity.tableName} WHERE $pkWhere\")\n")
            sb.append("    suspend fun get($pkParams): ${entity.name}?\n\n")
        }
        
        sb.append("    @Query(\"SELECT * FROM ${entity.tableName}\")\n")
        sb.append("    fun getAll(): Flow<List<${entity.name}>>\n")
        sb.append("}\n")

        file.writeText(sb.toString().trim() + "\n")
    }

    // 2. Database -> src/db/[module].kt
    val dbPkg = "${schema.packageName}.db"
    val dbDir = File("src/db")
    dbDir.mkdirs()
    val dbFile = File(dbDir, "$moduleName.kt")
    val dbSb = StringBuilder("package $dbPkg\n\n")
    dbSb.append("import ${schema.packageName}.json.${moduleNameCap}Converters\n")
    dbSb.append("import androidx.room.Database\n")
    dbSb.append("import androidx.room.RoomDatabase\n")
    dbSb.append("import androidx.room.TypeConverters\n")
    dbSb.append("import androidx.sqlite.driver.bundled.BundledSQLiteDriver\n")
    dbSb.append("import kotlinx.coroutines.Dispatchers\n")
    dbSb.append("import kotlinx.coroutines.IO\n")
    dbSb.append("import $entityPkg.*\n\n")
    dbSb.append("@Database(\n    entities = [\n")
    schema.entities.forEach { dbSb.append("        ${it.name}::class,\n") }
    dbSb.deleteRange(dbSb.length - 2, dbSb.length - 1)
    dbSb.append("   ],\n    version = 1,\n    exportSchema = true\n)\n")
    dbSb.append("@TypeConverters(${moduleNameCap}Converters::class)\n")
    dbSb.append("abstract class ${moduleNameCap}Database : RoomDatabase() {\n")
    schema.entities.forEach { entity ->
        dbSb.append("    abstract fun ${entity.name.replaceFirstChar { it.lowercase() }}Dao(): ${entity.name}Dao\n")
    }
    dbSb.append("}\n\n")
    dbSb.append("fun <T : RoomDatabase> create${moduleNameCap}Database(builder: RoomDatabase.Builder<T>): T {\n")
    dbSb.append("    return builder\n        .setDriver(BundledSQLiteDriver())\n        .setQueryCoroutineContext(Dispatchers.IO)\n        .build()\n}")
    dbFile.writeText(dbSb.toString().trim() + "\n")

    // 3. JSON -> src/json/[module].kt (Converters)
    val jsonPkg = "${schema.packageName}.json"
    val jsonDir = File("src/json")
    jsonDir.mkdirs()
    
    // Parser is shared, only write if not exists
    val parserFile = File(jsonDir, "parser.kt")
    if (!parserFile.exists()) {
        parserFile.writeText("""package $jsonPkg
import kotlinx.serialization.json.Json

object JsonParser {
    val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    inline fun <reified T> fromJson(value: String?): T? {
        return try {
            value?.let { json.decodeFromString<T>(it) }
        } catch (e: Exception) {
            throw IllegalStateException("failed to parse ${'$'}{T::class.simpleName} : ${'$'}{e.message}", e)
        }
    }

    inline fun <reified T> toJson(value: T): String {
        return json.encodeToString(value)
    }
}
""")
    }

    val convFile = File(jsonDir, "$moduleName.kt")
    val convSb = StringBuilder("package $jsonPkg\n\n")
    convSb.append("import androidx.room.TypeConverter\n")
    convSb.append("import $entityPkg.*\n\n")
    convSb.append("class ${moduleNameCap}Converters {\n")
    schema.dataClasses.forEach { dc ->
        convSb.append("    @TypeConverter fun from${dc.name}(value: ${dc.name}): String = JsonParser.toJson(value)\n")
        convSb.append("    @TypeConverter fun to${dc.name}(value: String?): ${dc.name} = JsonParser.fromJson<${dc.name}>(value) ?: ${dc.name}()\n\n")
    }
    schema.enums.forEach { en ->
        convSb.append("    @TypeConverter fun from${en.name}(value: ${en.name}): String = value.name\n")
        convSb.append("    @TypeConverter fun to${en.name}(value: String?): ${en.name} =\n")
        convSb.append("        try { ${en.name}.valueOf(value ?: \"${en.values[0]}\") } catch (e: Exception) { ${en.name}.${en.values[0]} }\n\n")
    }
    convFile.writeText(convSb.toString().trim() + "\n}\n")

// 4. Main Aliases -> src/main.kt (Overwrites to keep it simple, or we could append)
    val mainFile = File("src/main.kt")
    mainFile.delete()
    val mainSb = StringBuilder("import androidx.room.RoomDatabase\n\n")
    
    mainSb.append("// --- $moduleNameCap Module ---\n")
    schema.entities.forEach { mainSb.append("typealias ${it.name} = $entityPkg.${it.name}\n") }
    mainSb.append("typealias ${moduleNameCap}Database = ${schema.packageName}.db.${moduleNameCap}Database\n")
    mainSb.append("fun <T : RoomDatabase> create${moduleNameCap}Database(builder: RoomDatabase.Builder<T>) = ${schema.packageName}.db.create${moduleNameCap}Database(builder)\n")
    
    mainFile.writeText(mainSb.toString().trim() + "\n")
}

fun main(args: Array<String>) {
    val hclFiles = if (args.isEmpty()) {
        val hclDir = File("hcl")
        if (!hclDir.exists() || !hclDir.isDirectory) {
            println("Error: 'hcl' directory not found and no files provided as arguments.")
            return
        }
        hclDir.listFiles { _, name -> name.endsWith(".hcl") }?.toList() ?: emptyList()
    } else {
        args.map { File(it) }
    }

    if (hclFiles.isEmpty()) {
        println("No HCL files found to process.")
        return
    }

    hclFiles.forEach { hclFile ->
        if (!hclFile.exists()) {
            println("Error: ${hclFile.path} not found")
        } else {
            val schema = parseHcl(hclFile)
            generate(schema)
            println("Code generation complete for ${schema.moduleName}!")
        }
    }
}

main(args)
