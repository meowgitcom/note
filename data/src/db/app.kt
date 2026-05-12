package data.db

import data.json.AppConverters
import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.IO
import data.app.*

@Database(
    entities = [
        User::class,
        Workspace::class,
        Member::class,
        Page::class,
        Block::class
   ],
    version = 1,
    exportSchema = true
)
@TypeConverters(AppConverters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun workspaceDao(): WorkspaceDao
    abstract fun memberDao(): MemberDao
    abstract fun pageDao(): PageDao
    abstract fun blockDao(): BlockDao
}

fun <T : RoomDatabase> createAppDatabase(builder: RoomDatabase.Builder<T>): T {
    return builder
        .setDriver(BundledSQLiteDriver())
        .setQueryCoroutineContext(Dispatchers.IO)
        .build()
}
