import androidx.room.RoomDatabase

typealias User = data.app.User
typealias Workspace = data.app.Workspace
typealias WorkspaceMember = data.app.WorkspaceMember
typealias Page = data.app.Page
typealias Block = data.app.Block

typealias AppDatabase = data.db.AppDatabase
fun <T : RoomDatabase> createDatabase(builder: RoomDatabase.Builder<T>) = data.db.createDatabase(builder)