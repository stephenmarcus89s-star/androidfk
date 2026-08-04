package com.mirrorpro.appupdate.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * Animated shimmer placeholder for loading states.
 */
@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    cornerRadius: Int = 12
) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val x by transition.animateFloat(
        initialValue = -2f,
        targetValue = 2f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerX"
    )
    val baseColor = MaterialTheme.colorScheme.surfaceVariant
    val highlightColor = MaterialTheme.colorScheme.surface

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(cornerRadius.dp))
            .background(baseColor)
            .drawWithContent {
                drawContent()
                val width = size.width
                val brush = Brush.horizontalGradient(
                    colors = listOf(
                        Color.Transparent,
                        highlightColor.copy(alpha = 0.4f),
                        Color.Transparent
                    ),
                    startX = x * width,
                    endX = (x + 1) * width
                )
                drawRect(brush = brush)
            }
    )
}

@Composable
fun ShimmerHomeScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ShimmerBox(modifier = Modifier.size(72.dp), cornerRadius = 16)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.5f).height(20.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.3f).height(14.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(12.dp))
            }
        }
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(60.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(200.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(150.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(60.dp))
    }
}
