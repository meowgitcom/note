package data.app

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Entity(
    tableName = "workspaces"
) data class Workspace(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "owner_id") val ownerId: String,
    @ColumnInfo(name = "created_at", defaultValue = "CURRENT_TIMESTAMP") val createdAt: String = ""
)

@Dao interface WorkspaceDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: Workspace)
    @Update suspend fun update(item: Workspace)
    @Delete suspend fun delete(item: Workspace)

    @Query("SELECT * FROM workspaces WHERE id = :id")
    suspend fun getById(id: String): Workspace?

    @Query("SELECT * FROM workspaces")
    fun getAll(): Flow<List<Workspace>>
}
