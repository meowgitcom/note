package data.json

import androidx.room.TypeConverter
import data.app.UserType
import data.app.MemberRole
import data.app.PageMeta
import data.app.BlockContent
import data.app.BlockStyle
class AppConverters {
    @TypeConverter fun fromPageMeta(value: PageMeta): String = JsonParser.toJson(value)
    @TypeConverter fun toPageMeta(value: String?): PageMeta = JsonParser.fromJson<PageMeta>(value) ?: PageMeta()

    @TypeConverter fun fromMemberRole(value: MemberRole): String = value.name
    @TypeConverter fun toMemberRole(value: String?): MemberRole =
        try { MemberRole.valueOf(value ?: "MEMBER") } catch (e: Exception) { MemberRole.MEMBER }

    @TypeConverter fun fromUserType(value: UserType): String = value.name
    @TypeConverter fun toUserType(value: String?): UserType =
        try { UserType.valueOf(value ?: "PERSON") } catch (e: Exception) { UserType.PERSON }

    @TypeConverter fun fromBlockContent(value: BlockContent): String = JsonParser.toJson(value)
    @TypeConverter fun toBlockContent(value: String?): BlockContent =
        JsonParser.fromJson<BlockContent>(value) ?: BlockContent()

    @TypeConverter fun fromBlockStyle(value: BlockStyle): String = JsonParser.toJson(value)
    @TypeConverter fun toBlockStyle(value: String?): BlockStyle =
        JsonParser.fromJson<BlockStyle>(value) ?: BlockStyle()
}
