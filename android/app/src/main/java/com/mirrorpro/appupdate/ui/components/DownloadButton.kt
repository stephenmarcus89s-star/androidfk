package com.mirrorpro.appupdate.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.InstallMobile
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mirrorpro.appupdate.ui.download.DownloadState

@Composable
fun DownloadButton(
    state: DownloadState,
    updateAvailable: Boolean,
    apkAlreadyDownloaded: Boolean,
    onDownloadClick: () -> Unit,
    onInstallClick: () -> Unit,
    onPauseClick: () -> Unit,
    onResumeClick: () -> Unit,
    onCancelClick: () -> Unit,
    onContinueLaterClick: () -> Unit,
    canSkip: Boolean,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        when {
            // Download complete → install button
            state is DownloadState.Completed -> {
                GradientButton(
                    text = "Install Update",
                    icon = Icons.Filled.InstallMobile,
                    onClick = onInstallClick
                )
            }
            // Downloading → progress + pause/cancel
            state is DownloadState.Downloading -> {
                ProgressCard(
                    progress = state.progress,
                    downloadedBytes = state.downloadedBytes,
                    totalBytes = state.totalBytes,
                    onPause = onPauseClick,
                    onCancel = onCancelClick
                )
            }
            // Paused → resume / cancel
            state is DownloadState.Paused -> {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    GradientButton(
                        text = "Resume",
                        icon = Icons.Filled.PlayArrow,
                        onClick = onResumeClick,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedButton(
                        onClick = onCancelClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(Icons.Filled.Close, contentDescription = "Cancel")
                        Spacer(Modifier.width(8.dp))
                        Text("Cancel")
                    }
                }
            }
            // Failed → retry
            state is DownloadState.Failed -> {
                GradientButton(
                    text = "Retry Download",
                    icon = Icons.Filled.Download,
                    onClick = onDownloadClick
                )
                Text(
                    text = state.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
            // Idle + update available
            !updateAvailable -> {
                SuccessPill("You're Up To Date")
            }
            // Idle + update available → start download (or open if already downloaded)
            else -> {
                if (apkAlreadyDownloaded) {
                    GradientButton(
                        text = "Install Downloaded APK",
                        icon = Icons.Filled.InstallMobile,
                        onClick = onInstallClick
                    )
                } else {
                    GradientButton(
                        text = "Download Update",
                        icon = Icons.Filled.Download,
                        onClick = onDownloadClick
                    )
                }
                AnimatedVisibility(
                    visible = canSkip,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    TextButton(
                        onClick = onContinueLaterClick,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("Continue Later", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun GradientButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(16.dp),
        contentPadding = PaddingValues(horizontal = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(16.dp))
                .background(
                    Brush.horizontalGradient(
                        listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.secondary
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = Color.White)
                Spacer(Modifier.width(10.dp))
                Text(text, color = Color.White, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun ProgressCard(
    progress: Int,
    downloadedBytes: Long,
    totalBytes: Long,
    onPause: () -> Unit,
    onCancel: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Downloading… $progress%",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(onClick = onPause, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Filled.Pause, "Pause")
                    }
                    IconButton(onClick = onCancel, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Filled.Close, "Cancel", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
            LinearProgressIndicator(
                progress = { progress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SuccessPill(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f))
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.width(10.dp))
            Text(text, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
        }
    }
}

private fun formatBytes(bytes: Long): String {
    if (bytes <= 0) return "0 KB"
    val mb = bytes / (1024.0 * 1024.0)
    return when {
        mb >= 1 -> String.format("%.1f MB", mb)
        else -> "${bytes / 1024} KB"
    }
}
