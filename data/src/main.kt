import androidx.room.RoomDatabase

// --- App Module ---
typealias User = data.app.User
typealias Workspace = data.app.Workspace
typealias Member = data.app.Member
typealias Page = data.app.Page
typealias Block = data.app.Block
typealias AppDatabase = data.db.AppDatabase
fun <T : RoomDatabase> createAppDatabase(builder: RoomDatabase.Builder<T>) = data.db.createAppDatabase(builder)
