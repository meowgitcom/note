@file:JsExport

package logic

fun getWelcomeMessage(name: String): String {
    return "Hello, $name! This message was generated in Kotlin."
}

fun calculateScore(points: Int): Int {
    return points * 10
}
