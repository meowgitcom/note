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

@Entity(
    tableName = "workspace_members",
    primaryKeys = ["workspace_id", "user_id"],
    foreignKeys = [
        ForeignKey(
            entity = Workspace::class,
            parentColumns = ["id"],
            childColumns = ["workspace_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = User::class,
            parentColumns = ["id"],
            childColumns = ["user_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("workspace_id"), Index("user_id")]
) data class Member(
    @ColumnInfo(name = "workspace_id") val workspaceId: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val role: MemberRole = MemberRole.MEMBER,
    @ColumnInfo(name = "joined_at", defaultValue = "CURRENT_TIMESTAMP") val joinedAt: String = ""
)

@Serializable enum class MemberRole { OWNER, ADMIN, MEMBER, GUEST }

@Dao interface MemberDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: Member)
    @Update suspend fun update(item: Member)
    @Delete suspend fun delete(item: Member)

    @Query("SELECT * FROM workspace_members WHERE workspace_id = :workspaceId")
    fun getByWorkspaceId(workspaceId: String): Flow<List<Member>>

    @Query("SELECT * FROM workspace_members WHERE user_id = :userId")
    fun getByUserId(userId: String): Flow<List<Member>>

    @Query("SELECT * FROM workspace_members WHERE workspace_id = :workspaceId AND user_id = :userId")
    suspend fun get(workspaceId: String, userId: String): Member?

    @Query("SELECT * FROM workspace_members")
    fun getAll(): Flow<List<Member>>
}
