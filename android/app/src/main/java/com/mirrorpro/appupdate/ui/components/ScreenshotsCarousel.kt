package com.mirrorpro.appupdate.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mirrorpro.appupdate.data.model.Screenshot

@Composable
fun ScreenshotsCarousel(screenshots: List<Screenshot>) {
    if (screenshots.isEmpty()) return
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Screenshots",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
        )
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            items(screenshots, key = { it.id }) { shot ->
                ScreenshotItem(shot)
            }
        }
    }
}

@Composable
private fun ScreenshotItem(shot: Screenshot) {
    Card(
        modifier = Modifier
            .width(180.dp)
            .height(320.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = shot.url,
                contentDescription = shot.caption ?: "Screenshot",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            if (!shot.caption.isNullOrBlank()) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.85f))
                        .padding(8.dp)
                ) {
                    Text(
                        text = shot.caption,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
