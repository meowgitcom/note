import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.isSystemInDarkTheme
import config.baseurl

@Composable
fun Screen() {
    val palette = if (isSystemInDarkTheme()) Colors.dark else Colors.light
    MaterialTheme {
        Column(
            modifier = Modifier.fillMaxSize().background(palette.background),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Hello, ${getWorld()}!", color = palette.foreground)
            Text("API URL : $baseurl", color = palette.foreground)
        }
    }
}
