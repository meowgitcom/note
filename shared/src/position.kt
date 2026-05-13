package sync

import data.app.Block
import data.app.Page

object PositionHelper {
    fun between(prev: String?, next: String?): String = LexoRank.between(prev, next)

    fun getPositionForBlock(siblings: List<Block>): String {
        if (siblings.isEmpty()) return LexoRank.between(null, null)
        val sorted = siblings.sortedBy { it.position }
        return LexoRank.between(null, sorted.firstOrNull()?.position)
    }

    fun getPositionForBlockAfter(siblings: List<Block>, afterBlockId: String?): String {
        val sorted = siblings.sortedBy { it.position }
        val afterIndex = if (afterBlockId != null) sorted.indexOfFirst { it.id == afterBlockId } else -1
        val prev = if (afterIndex >= 0) sorted.getOrNull(afterIndex)?.position else null
        val next = if (afterIndex >= 0) sorted.getOrNull(afterIndex + 1)?.position else null
        return LexoRank.between(prev, next)
    }

    suspend fun getPositionForBlock(
        getSiblings: suspend () -> List<Block>
    ): String {
        val siblings = getSiblings()
        if (siblings.isEmpty()) {
            return LexoRank.between(null, null)
        }
        val sorted = siblings.sortedBy { it.position }
        val first = sorted.firstOrNull()?.position
        return LexoRank.between(null, first)
    }

    suspend fun getPositionForBlockAfter(
        getSiblings: suspend () -> List<Block>,
        afterBlockId: String?
    ): String {
        val siblings = getSiblings().sortedBy { it.position }
        val afterIndex = if (afterBlockId != null) {
            siblings.indexOfFirst { it.id == afterBlockId }
        } else -1

        val prev = if (afterIndex >= 0) siblings.getOrNull(afterIndex)?.position else null
        val next = if (afterIndex >= 0) siblings.getOrNull(afterIndex + 1)?.position else null

        return LexoRank.between(prev, next)
    }

    fun getPositionForPage(pages: List<Page>): String {
        if (pages.isEmpty()) return LexoRank.between(null, null)
        val sorted = pages.sortedBy { it.position }
        return LexoRank.between(null, sorted.firstOrNull()?.position)
    }

    fun getPositionForPageAfter(pages: List<Page>, afterPageId: String?): String {
        val sorted = pages.sortedBy { it.position }
        val afterIndex = if (afterPageId != null) sorted.indexOfFirst { it.id == afterPageId } else -1
        val prev = if (afterIndex >= 0) sorted.getOrNull(afterIndex)?.position else null
        val next = if (afterIndex >= 0) sorted.getOrNull(afterIndex + 1)?.position else null
        return LexoRank.between(prev, next)
    }

    suspend fun getPositionForPage(
        getPages: suspend () -> List<Page>
    ): String {
        val pages = getPages()
        if (pages.isEmpty()) {
            return LexoRank.between(null, null)
        }
        val sorted = pages.sortedBy { it.position }
        val first = sorted.firstOrNull()?.position
        return LexoRank.between(null, first)
    }

    suspend fun getPositionForPageAfter(
        getPages: suspend () -> List<Page>,
        afterPageId: String?
    ): String {
        val pages = getPages().sortedBy { it.position }
        val afterIndex = if (afterPageId != null) {
            pages.indexOfFirst { it.id == afterPageId }
        } else -1

        val prev = if (afterIndex >= 0) pages.getOrNull(afterIndex)?.position else null
        val next = if (afterIndex >= 0) pages.getOrNull(afterIndex + 1)?.position else null

        return LexoRank.between(prev, next)
    }
}