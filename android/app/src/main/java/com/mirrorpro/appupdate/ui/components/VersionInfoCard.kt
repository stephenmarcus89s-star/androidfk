package com.mirrorpro.appupdate.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.GetApp
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material.icons.outlined.Tag
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mirrorpro.appupdate.data.model.AppUpdateInfo

@Composable
fun VersionInfoCard(info: AppUpdateInfo) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "Version Information",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(Modifier.height(16.dp))
            val rows = listOf(
                InfoRow(Icons.Outlined.CalendarMonth, "Release Date", info.releaseDate),
                InfoRow(Icons.Outlined.GetApp, "APK Size", info.apkSizeText),
                InfoRow(Icons.Outlined.PhoneAndroid, "Android Required", info.minAndroid),
                InfoRow(Icons.Outlined.GetApp, "Downloads", info.downloads),
                InfoRow(Icons.Outlined.Star, "Rating", "${info.rating} ★ (${info.reviews} reviews)"),
                InfoRow(Icons.Outlined.Tag, "Package", info.packageName),
                InfoRow(Icons.Outlined.Info, "Version Code", info.versionCode.toString())
            )
            rows.forEach { row ->
                InfoRowItem(row)
                if (row != rows.last()) Spacer(Modifier.height(14.dp))
            }
        }
    }
}

private data class InfoRow(val icon: ImageVector, val label: String, val value: String)

@Composable
private fun InfoRowItem(row: InfoRow) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = row.icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = row.label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = row.value,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
