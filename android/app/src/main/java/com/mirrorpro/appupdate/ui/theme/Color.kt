package com.mirrorpro.appupdate.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

// MirrorPro brand palette
val Indigo = Color(0xFF6366F1)
val IndigoLight = Color(0xFF818CF8)
val IndigoDark = Color(0xFF4F46E5)
val Purple = Color(0xFFA855F7)
val SurfaceDark = Color(0xFF0A0A0F)
val SurfaceDarkElevated = Color(0xFF1A1A24)
val SurfaceLight = Color(0xFFF5F5FA)
val SurfaceLightElevated = Color(0xFFFFFFFF)

val DarkColors = darkColorScheme(
    primary = Indigo,
    onPrimary = Color.White,
    primaryContainer = IndigoDark,
    onPrimaryContainer = Color.White,
    secondary = Purple,
    onSecondary = Color.White,
    background = SurfaceDark,
    onBackground = Color.White,
    surface = SurfaceDarkElevated,
    onSurface = Color.White,
    surfaceVariant = Color(0xFF22222E),
    onSurfaceVariant = Color(0xFFBBBBCC),
    outline = Color(0xFF3A3A48),
    error = Color(0xFFEF4444),
    onError = Color.White,
)

val LightColors = lightColorScheme(
    primary = IndigoDark,
    onPrimary = Color.White,
    primaryContainer = IndigoLight,
    onPrimaryContainer = Color.White,
    secondary = Purple,
    onSecondary = Color.White,
    background = SurfaceLight,
    onBackground = Color(0xFF111118),
    surface = SurfaceLightElevated,
    onSurface = Color(0xFF111118),
    surfaceVariant = Color(0xFFE5E5EE),
    onSurfaceVariant = Color(0xFF555566),
    outline = Color(0xFFCCCCDD),
    error = Color(0xFFDC2626),
    onError = Color.White,
)
