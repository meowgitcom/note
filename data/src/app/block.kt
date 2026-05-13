package data.app

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow
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
) @Serializable data class Block(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "page_id") val pageId: String,
    @ColumnInfo(name = "parent_block_id") val parentBlockId: String? = null,
    val position: String,
    val type: String,
    val content: BlockContent = BlockContent(),
    val style: BlockStyle = BlockStyle(),
    @ColumnInfo(name = "updated_at", defaultValue = "CURRENT_TIMESTAMP") val updatedAt: String = "",
    @ColumnInfo(defaultValue = "0") val deleted: Boolean = false
)

@Serializable data class BlockContent(
    val text: String? = null,
    val checked: Boolean? = null,
    val url: String? = null,
    val caption: String? = null,
    val language: String? = null,
    val extra: Map<String, JsonElement> = emptyMap<String, JsonElement>()
)

@Serializable data class BlockStyle(
    val color: String? = null,
    val bgColor: String? = null,
    val bold: Boolean? = null,
    val italic: Boolean? = null,
    val extra: Map<String, JsonElement> = emptyMap<String, JsonElement>()
)

@Dao interface BlockDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: Block)
    @Update suspend fun update(item: Block)
    @Delete suspend fun delete(item: Block)

    @Query("UPDATE blocks SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = :id")
    suspend fun softDelete(id: String)

    @Query("SELECT * FROM blocks WHERE updated_at > :timestamp")
    suspend fun getChanges(timestamp: String): List<Block>

    @Query("SELECT * FROM blocks WHERE id = :id")
    suspend fun getById(id: String): Block?

    @Query("SELECT * FROM blocks")
    fun getAll(): Flow<List<Block>>
}
