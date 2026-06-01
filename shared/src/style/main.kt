package shared.style

import androidx.compose.ui.graphics.Color

data class Palette(
    val brand: Color,
    val brandOn: Color,
    val accent: Color,
    val accentOn: Color,
    val background: Color,
    val foreground: Color,
    val surface: Color,
    val surfaceOn: Color,
    val gradientTop: Color,
    val gradientMid: Color,
    val gradientBottom: Color,
    val heroShape: Color,
    val accentShape: Color,
)

object Colors {
    val light = Palette(
        brand = Color(0xFF0F172A),
        brandOn = Color(0xFFF8FAFC),
        accent = Color(0xFFF1F5F9),
        accentOn = Color(0xFF0F172A),
        background = Color(0xFFFFFFFF),
        foreground = Color(0xFF0F172A),
        surface = Color(0xFFFFFFFF),
        surfaceOn = Color(0xFF0F172A),
        gradientTop = Color(0xFFFFFFFF),
        gradientMid = Color(0xFFF1F5F9),
        gradientBottom = Color(0xFFE2E8F0),
        heroShape = Color(0xFFE2E8F0),
        accentShape = Color(0xFFF1F5F9),
    )

    val dark = Palette(
        brand = Color(0xFFF8FAFC),
        brandOn = Color(0xFF0F172A),
        accent = Color(0xFF1E293B),
        accentOn = Color(0xFFF8FAFC),
        background = Color(0xFF0F172A),
        foreground = Color(0xFFF8FAFC),
        surface = Color(0xFF0F172A),
        surfaceOn = Color(0xFFF8FAFC),
        gradientTop = Color(0xFF0F172A),
        gradientMid = Color(0xFF1E293B),
        gradientBottom = Color(0xFF0F172A),
        heroShape = Color(0xFF1E293B),
        accentShape = Color(0xFF1E293B),
    )
}