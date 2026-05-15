import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.isSystemInDarkTheme
import shared.config.baseurl
import shared.style.Colors
import shared.style.H2
import shared.style.InlineCode

@Composable
fun Screen() {
    val palette = if (isSystemInDarkTheme()) Colors.dark else Colors.light
    MaterialTheme {
        Column(
            modifier = Modifier.fillMaxSize().background(palette.background),
            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Hello, ${getWorld()}!", style = H2.copy(color=palette.foreground))
            Text("API URL : $baseurl", style = InlineCode.copy(color = palette.foreground))
        }
    }
}
