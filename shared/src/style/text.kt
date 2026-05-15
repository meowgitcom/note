package shared.style

import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val PageTitle: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.SemiBold,
    fontSize = 40.sp,
    lineHeight = 48.sp,
    letterSpacing = (-0.02).sp
)

val H1: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.SemiBold,
    fontSize = 30.sp,
    lineHeight = 39.sp,
    letterSpacing = (-0.02).sp
)

val H2: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.SemiBold,
    fontSize = 24.sp,
    lineHeight = 32.sp,
    letterSpacing = (-0.015).sp
)

val H3: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.SemiBold,
    fontSize = 18.sp,
    lineHeight = 25.sp,
    letterSpacing = (-0.01).sp
)

val H4: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.SemiBold,
    fontSize = 15.sp,
    lineHeight = 21.sp
)

val Body: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.Normal,
    fontSize = 16.sp,
    lineHeight = 24.sp,
    letterSpacing = (-0.01).sp
)

val BodySmall: TextStyle @Composable get() = TextStyle(
    fontFamily = InterFamily,
    fontWeight = FontWeight.Normal,
    fontSize = 14.sp,
    lineHeight = 21.sp
)

val InlineCode: TextStyle @Composable get() = TextStyle(
    fontFamily = JetbrainsmonoFamily,
    fontWeight = FontWeight.Normal,
    fontSize = 13.5.sp,
    lineHeight = 18.sp
)

val CodeBlockText: TextStyle @Composable get() = TextStyle(
    fontFamily = JetbrainsmonoFamily,
    fontWeight = FontWeight.Normal,
    fontSize = 14.sp,
    lineHeight = 22.sp,
    letterSpacing = 0.sp
)