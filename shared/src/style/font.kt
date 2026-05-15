package shared.style
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import org.jetbrains.compose.resources.Font

import androidx.compose.runtime.Composable
import shared.generated.resources.Res

import shared.generated.resources.internormal
import shared.generated.resources.interitalic

import shared.generated.resources.jetbrainsmononormal
import shared.generated.resources.jetbrainsmonoitalic

val InterFamily: FontFamily @Composable get() = FontFamily(
    Font(resource = Res.font.internormal, style = FontStyle.Normal),
    Font(resource = Res.font.interitalic, style = FontStyle.Italic)
)

val JetbrainsmonoFamily: FontFamily @Composable get() = FontFamily(
    Font(resource = Res.font.jetbrainsmononormal, style = FontStyle.Normal),
    Font(resource = Res.font.jetbrainsmonoitalic, style = FontStyle.Italic)
)

