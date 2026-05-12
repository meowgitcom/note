package data.app

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.serialization.Serializable

@Entity(
    tableName = "workspaces",
    foreignKeys = [
        ForeignKey(
            entity = User::class,
            parentColumns = ["id"],
            childColumns = ["owner_id"],
            onDelete = ForeignKey.RESTRICT
        )
    ],
    indices = [Index("owner_id")]
) data class Workspace(
    @PrimaryKey val id: String,
    val name: String,

    @ColumnInfo(name = "owner_id")
    val ownerId: String,

    @ColumnInfo(name = "created_at", defaultValue = "CURRENT_TIMESTAMP")
    val createdAt: String = ""
)

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
    indices = [
        Index("workspace_id"),
        Index("user_id")
    ]
) data class WorkspaceMember(
    @ColumnInfo(name = "workspace_id") val workspaceId: String,
    @ColumnInfo(name = "user_id") val userId: String,

    val role: MemberRole = MemberRole.MEMBER,

    @ColumnInfo(name = "joined_at", defaultValue = "CURRENT_TIMESTAMP")
    val joinedAt: String = ""
)

@Serializable enum class MemberRole { OWNER, ADMIN, MEMBER, GUEST }