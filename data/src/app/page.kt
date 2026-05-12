package data.app

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Entity(
    tableName = "pages",
    foreignKeys = [
        ForeignKey(
            entity = Workspace::class,
            parentColumns = ["id"],
            childColumns = ["workspace_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = Page::class,
            parentColumns = ["id"],
            childColumns = ["parent_id"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [
        Index("workspace_id"),
        Index("parent_id")
    ]
) data class Page(
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

