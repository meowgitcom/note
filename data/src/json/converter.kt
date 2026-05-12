package data.json
import data.app.PageMeta
import androidx.room.TypeConverter

class AppConverters {
    @TypeConverter fun fromPageMeta(value: PageMeta): String = JsonParser.toJson(value)
    @TypeConverter fun toPageMeta(value: String?): PageMeta = JsonParser.fromJson<PageMeta>(value) ?: PageMeta()
}
