package env

import io.github.cdimascio.dotenv.dotenv

object Load {
    private val loader = dotenv {
        filename = "app.env"
    }

    operator fun get(name: String): String? = loader[name]
}
