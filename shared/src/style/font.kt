package shared.style
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import org.jetbrains.compose.resources.Font

import androidx.compose.runtime.Composable
import shared.generated.resources.Res
import shared.generated.resources.interitalic
import shared.generated.resources.internormal

val InterFamily: FontFamily @Composable get() = FontFamily(
    Font(resource = Res.font.internormal, style = FontStyle.Normal),
    Font(resource = Res.font.interitalic, style = FontStyle.Italic)
)

