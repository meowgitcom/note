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
import kotlinx.serialization.Serializable

@Entity(
    tableName = "transactions"
) @Serializable data class Transaction(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "workspace_id") val workspaceId: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val seq: Long,
    val operations: String,
    @ColumnInfo(name = "created_at", defaultValue = "CURRENT_TIMESTAMP") val createdAt: String = ""
)

@Dao interface TransactionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: Transaction)
    @Update suspend fun update(item: Transaction)
    @Delete suspend fun delete(item: Transaction)

    @Query("SELECT * FROM transactions WHERE workspace_id = :workspaceId AND seq = 0 ORDER BY created_at ASC")
    suspend fun getPending(workspaceId: String): List<Transaction>

    @Query("SELECT * FROM transactions WHERE workspace_id = :workspaceId AND seq > :lastSeq ORDER BY seq ASC")
    suspend fun getSince(workspaceId: String, lastSeq: Long): List<Transaction>

    @Query("SELECT MAX(seq) FROM transactions WHERE workspace_id = :workspaceId")
    suspend fun getMaxSeq(workspaceId: String): Long?

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getById(id: String): Transaction?

    @Query("SELECT * FROM transactions")
    fun getAll(): Flow<List<Transaction>>
}
