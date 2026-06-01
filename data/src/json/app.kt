package data.json

import androidx.room.TypeConverter
import data.app.*

class AppConverters {
    @TypeConverter fun fromPageMeta(value: PageMeta): String = JsonParser.toJson(value)
    @TypeConverter fun toPageMeta(value: String?): PageMeta = JsonParser.fromJson<PageMeta>(value) ?: PageMeta()

    @TypeConverter fun fromBlockContent(value: BlockContent): String = JsonParser.toJson(value)
    @TypeConverter fun toBlockContent(value: String?): BlockContent = JsonParser.fromJson<BlockContent>(value) ?: BlockContent()

    @TypeConverter fun fromBlockStyle(value: BlockStyle): String = JsonParser.toJson(value)
    @TypeConverter fun toBlockStyle(value: String?): BlockStyle = JsonParser.fromJson<BlockStyle>(value) ?: BlockStyle()

    @TypeConverter fun fromUserType(value: UserType): String = value.name
    @TypeConverter fun toUserType(value: String?): UserType =
        try { UserType.valueOf(value ?: "PERSON") } catch (e: Exception) { UserType.PERSON }

    @TypeConverter fun fromMemberRole(value: MemberRole): String = value.name
    @TypeConverter fun toMemberRole(value: String?): MemberRole =
        try { MemberRole.valueOf(value ?: "OWNER") } catch (e: Exception) { MemberRole.OWNER }
}
