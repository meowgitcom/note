package data.app

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Entity(tableName = "users") data class User(
    @PrimaryKey val id: String,
    val name: String,
    val image: String?,
    val type: UserType = UserType.PERSON
)

@Serializable enum class UserType { PERSON, BOT }
