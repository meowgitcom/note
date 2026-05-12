package data.db

import data.json.AppConverters
import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.IO

@Database(entities = [Page::class], version = 1, exportSchema = true)
@TypeConverters(AppConverters::class)
abstract class AppDatabase : RoomDatabase() {}

fun <T : RoomDatabase> createDatabase(builder: RoomDatabase.Builder<T>): T {
    return builder
        .setDriver(BundledSQLiteDriver())
        .setQueryCoroutineContext(Dispatchers.IO)
        .build()
}