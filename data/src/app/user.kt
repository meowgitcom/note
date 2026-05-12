package data.app

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
    tableName = "users"
) data class User(
    @PrimaryKey val id: String,
    val name: String,
    val image: String? = null,
    val type: UserType = UserType.PERSON
)

@Serializable enum class UserType { PERSON, BOT }

@Dao interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(item: User)
    @Update suspend fun update(item: User)
    @Delete suspend fun delete(item: User)

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getById(id: String): User?

    @Query("SELECT * FROM users")
    fun getAll(): Flow<List<User>>
}
