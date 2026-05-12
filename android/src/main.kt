package hello.world

import Screen
import appContext
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class Main : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appContext = applicationContext
        setContent {
            Screen()
        }
    }
}