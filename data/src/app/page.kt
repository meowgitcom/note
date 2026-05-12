package data.app

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Entity(tableName = "pages") data class Page(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "workspace_id") val workspaceId: String,
    @ColumnInfo(name = "parent_id") val parentId: String?,
    @ColumnInfo(name = "data_source_id") val dataSourceId: String?,

    @ColumnInfo(defaultValue = "Untitled") val title: String = "Untitled",
    @ColumnInfo(defaultValue = "0") val archived: Boolean = false,

    val meta: PageMeta = PageMeta()
)

@Serializable data class PageMeta(
    val icon: String? = null,
    val cover: String? = null,
    val description: String? = null,
    val extra: Map<String, JsonElement> = emptyMap()
)

