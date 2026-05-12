package data.json
import kotlinx.serialization.json.Json

object JsonParser {
    val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    inline fun <reified T> fromJson(value: String?): T? {
        return try {
            value?.let { json.decodeFromString<T>(it) }
        } catch (e: Exception) {
            throw IllegalStateException("failed to parse ${T::class.simpleName} : ${e.message}", e)
        }
    }

    inline fun <reified T> toJson(value: T): String {
        return json.encodeToString(value)
    }
}
