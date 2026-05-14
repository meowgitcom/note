package sync

import java.util.Random

object LexoRank {
    private const val ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    private val random = Random()

    fun between(prev: String?, next: String?): String {
        val p = prev ?: "0"
        val n = next ?: "z"
        
        val midpoint = calculateMidpoint(p, n)
        return midpoint + jitter()
    }

    private fun calculateMidpoint(prev: String, next: String): String {
        val length = maxOf(prev.length, next.length) + 1
        val p = prev.padEnd(length, '0')
        val n = next.padEnd(length, 'z')

        val result = StringBuilder()
        
        for (i in 0 until length) {
            val pVal = ALPHABET.indexOf(p[i])
            val nVal = ALPHABET.indexOf(n[i])
            
            val mid = (pVal + nVal) / 2
            result.append(ALPHABET[mid])
        }
        
        return result.toString()
    }

    private fun jitter(): String {
        val sb = StringBuilder()
        repeat(3) {
            sb.append(ALPHABET[random.nextInt(ALPHABET.length)])
        }
        return sb.toString()
    }
}
