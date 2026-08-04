package com.mirrorpro.appupdate.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mirrorpro.appupdate.data.model.AppUpdateInfo
import com.mirrorpro.appupdate.data.model.RatingBreakdown

@Composable
fun RatingsCard(info: AppUpdateInfo) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "Ratings & Reviews",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(0.3f)
                ) {
                    Text(
                        text = String.format("%.1f", info.rating),
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "★ ★ ★ ★ ★",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "${info.reviews} reviews",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(Modifier.width(20.dp))

                Column(
                    modifier = Modifier.weight(0.7f),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    RatingBar(5, info.ratingBreakdown.five, info.ratingBreakdown.total)
                    RatingBar(4, info.ratingBreakdown.four, info.ratingBreakdown.total)
                    RatingBar(3, info.ratingBreakdown.three, info.ratingBreakdown.total)
                    RatingBar(2, info.ratingBreakdown.two, info.ratingBreakdown.total)
                    RatingBar(1, info.ratingBreakdown.one, info.ratingBreakdown.total)
                }
            }
        }
    }
}

@Composable
private fun RatingBar(stars: Int, count: Int, total: Int) {
    val fraction by animateFloatAsState(
        targetValue = if (total > 0) count.toFloat() / total else 0f,
        animationSpec = tween(800),
        label = "bar$stars"
    )
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$stars",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(16.dp)
        )
        Text(
            text = "★",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(end = 6.dp)
        )
        Box(
            modifier = Modifier
                .weight(1f)
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(3.dp))
                    .background(MaterialTheme.colorScheme.primary)
            )
        }
        Text(
            text = count.toString(),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(40.dp).padding(start = 8.dp)
        )
    }
}
