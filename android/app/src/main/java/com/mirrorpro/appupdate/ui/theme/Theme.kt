package com.mirrorpro.appupdate.ui.theme

import androidx.compose.runtime.Composable

@Composable
fun MirrorProTheme(
    darkTheme: Boolean = androidx.compose.foundation.isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    MirrorProThemeImpl(darkTheme, dynamicColor, content)
}

@Composable
private fun MirrorProThemeImpl(
    darkTheme: Boolean,
    dynamicColor: Boolean,
    content: @Composable () -> Unit
) {
    androidx.compose.material3.MaterialTheme(
        colorScheme = when {
            dynamicColor && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S -> {
                val context = androidx.compose.ui.platform.LocalContext.current
                if (darkTheme) androidx.compose.material3.dynamicDarkColorScheme(context)
                else androidx.compose.material3.dynamicLightColorScheme(context)
            }
            darkTheme -> DarkColors
            else -> LightColors
        },
        typography = MirrorTypography,
        shapes = MirrorShapes,
        content = content
    )
}
