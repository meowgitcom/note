package data.app

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Entity(
    tableName = "blocks",
    foreignKeys = [
        ForeignKey(
            entity = Page::class,
            parentColumns = ["id"],
            childColumns = ["page_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = Block::class,
            parentColumns = ["id"],
            childColumns = ["parent_block_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("page_id"), Index("parent_block_id")]
) data class Block(
    @PrimaryKey val id: String,

    @ColumnInfo(name = "page_id") val pageId: String,

    @ColumnInfo(name = "parent_block_id") val parentBlockId: String?,

    val position: String,
    val type: String,

    val content: BlockContent = BlockContent(),
    val style: BlockStyle = BlockStyle()
)

@Serializable data class BlockContent(
    val text: String? = null,
    val checked: Boolean? = null,
    val url: String? = null,
    val caption: String? = null,
    val language: String? = null,
    val extra: Map<String, JsonElement> = emptyMap()
)

@Serializable data class BlockStyle(
    val color: String? = null,
    val bgColor: String? = null,
    val bold: Boolean? = null,
    val italic: Boolean? = null,
    val extra: Map<String, JsonElement> = emptyMap()
)
