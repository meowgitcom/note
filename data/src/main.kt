import androidx.room.RoomDatabase

typealias Page = data.app.Page

typealias AppDatabase = data.db.AppDatabase
fun <T : RoomDatabase> createDatabase(builder: RoomDatabase.Builder<T>) = data.db.createDatabase(builder)