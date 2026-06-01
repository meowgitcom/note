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
    indices = [Index("workspace_id"), Index("parent_id")]
) @Serializable data class Page(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "workspace_id") val workspaceId: String,
    @ColumnInfo(name = "parent_id") val parentId: String? = null,
    @ColumnInfo(name = "data_source_id") val dataSourceId: String? = null,
    @ColumnInfo(defaultValue = "Untitled") val title: String = "Untitled",
    @ColumnInfo(defaultValue = "") val position: String = "",
    @ColumnInfo(defaultValue = "0") val archived: Boolean = false,
    val meta: PageMeta = PageMeta(),
    @ColumnInfo(name = "updated_at", defaultValue = "CURRENT_TIMESTAMP") val updatedAt: String = "",
    @ColumnInfo(defaultValue = "0") val deleted: Boolean = false
)

@Serializable data class PageMeta(
    val icon: String? = null,
    val cover: String? = null,
    val description: String? = null,
    val extra: Map<String, JsonElement> = emptyMap<String, JsonElement>()
)

@Dao interface PageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: Page)
    @Update suspend fun update(item: Page)
    @Delete suspend fun delete(item: Page)

    @Query("UPDATE pages SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = :id")
    suspend fun softDelete(id: String)

    @Query("SELECT * FROM pages WHERE updated_at > :timestamp")
    suspend fun getChanges(timestamp: String): List<Page>

    @Query("SELECT * FROM pages WHERE id = :id")
    suspend fun getById(id: String): Page?

    @Query("SELECT * FROM pages")
    fun getAll(): Flow<List<Page>>
}
