package com.mirrorpro.appupdate.ui.home

import android.Manifest
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.mirrorpro.appupdate.ui.components.*
import com.mirrorpro.appupdate.ui.download.DownloadService
import com.mirrorpro.appupdate.ui.download.DownloadServiceStateHolder
import com.mirrorpro.appupdate.ui.download.DownloadState
import com.mirrorpro.appupdate.util.ApkFileStorage
import com.mirrorpro.appupdate.util.ApkInstallHelper
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Local download state (mirrors service state)
    var downloadState by remember { mutableStateOf<DownloadState>(DownloadState.Idle) }
    var apkUrlToDownload by remember { mutableStateOf<String?>(null) }
    var versionCodeToDownload by remember { mutableStateOf(1) }
    var showPrivacyPolicy by remember { mutableStateOf(false) }
    var showPlayProtectInfo by remember { mutableStateOf(false) }
    var showShizukuInfo by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    // Notification permission (Android 13+)
    val notifPermLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (!granted) {
            // continue anyway — notifications are not critical
        }
    }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notifPermLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    // Bind to download service to receive state updates
    // For simplicity, we use a static state flow on the service companion object.
    // A real app would bind/unbind — but this works for our foreground service.
    LaunchedEffect(Unit) {
        // Poll service state via reflection is overkill — use a simple state holder
        DownloadServiceStateHolder.state.collect { st ->
            downloadState = st
        }
    }

    // Mandatory update lock
    val isMandatory = (uiState as? HomeUiState.Success)?.info?.mandatory == true
    BackHandler(enabled = isMandatory) {
        // Block back press when update is mandatory
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            if (uiState is HomeUiState.Success) {
                SmallTopAppBar(
                    title = { Text("MirrorPro", fontWeight = FontWeight.SemiBold) },
                    actions = {
                        IconButton(onClick = { viewModel.refresh() }) {
                            Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                        }
                        IconButton(onClick = { showPrivacyPolicy = true }) {
                            Icon(Icons.Filled.PrivacyTip, contentDescription = "Privacy Policy")
                        }
                    }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val st = uiState) {
                HomeUiState.Loading -> {
                    ShimmerHomeScreen()
                }
                is HomeUiState.Error -> ErrorState(
                    message = st.message,
                    onRetry = { viewModel.loadLatest() }
                )
                is HomeUiState.Success -> {
                    val info = st.info
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Spacer(Modifier.height(8.dp))
                        UpdateHeader(info, st.installedVersionName, st.updateAvailable)

                        AnimatedVisibility(
                            visible = info.mandatory,
                            enter = fadeIn() + scaleIn(),
                            exit = fadeOut()
                        ) {
                            MandatoryUpdateBanner()
                        }

                        DescriptionCard(info)
                        VersionInfoCard(info)
                        ChangelogCard(info)
                        ScreenshotsCarousel(info.screenshots)
                        RatingsCard(info)

                        // Download button + state
                        val apkAlreadyDownloaded = ApkFileStorage.isApkDownloaded(context, info.versionCode)
                        DownloadButton(
                            state = downloadState,
                            updateAvailable = st.updateAvailable,
                            apkAlreadyDownloaded = apkAlreadyDownloaded,
                            onDownloadClick = {
                                info.apkUrl?.let { url ->
                                    apkUrlToDownload = url
                                    versionCodeToDownload = info.versionCode
                                    viewModel.trackDownload()
                                    DownloadService.start(context, url, info.versionCode)
                                }
                            },
                            onInstallClick = {
                                val apk = ApkFileStorage.getApkFile(context, info.versionCode)
                                if (!apk.exists()) {
                                    scope.launch {
                                        snackbarHostState.showSnackbar("APK file not found. Please download again.")
                                    }
                                    return@DownloadButton
                                }
                                if (!ApkInstallHelper.canRequestInstall(context) && !ApkInstallHelper.canBypassPlayProtect()) {
                                    // No install permission and no Shizuku bypass — ask user to grant permission first
                                    ApkInstallHelper.openInstallPermissionSettings(context)
                                    showPlayProtectInfo = true
                                    return@DownloadButton
                                }
                                // Try install — uses Shizuku if available, else standard API
                                ApkInstallHelper.installApk(
                                    context = context,
                                    apkFile = apk,
                                    useShizukuIfAvailable = true
                                ) { success, message ->
                                    scope.launch {
                                        if (success) {
                                            snackbarHostState.showSnackbar("✅ $message")
                                        } else {
                                            // If standard install failed and Shizuku not available,
                                            // show Play Protect info dialog explaining how to install anyway
                                            if (message.contains("blocked", ignoreCase = true) ||
                                                message.contains("cancel", ignoreCase = true)) {
                                                showPlayProtectInfo = true
                                            }
                                            snackbarHostState.showSnackbar("❌ $message")
                                        }
                                    }
                                }
                            },
                            onPauseClick = { DownloadService.pause(context) },
                            onResumeClick = {
                                apkUrlToDownload?.let { url ->
                                    DownloadService.start(context, url, versionCodeToDownload)
                                }
                            },
                            onCancelClick = {
                                DownloadService.cancel(context)
                                downloadState = DownloadState.Idle
                            },
                            onContinueLaterClick = {
                                // Optional: close app (no-op here since this is the only screen)
                                scope.launch {
                                    snackbarHostState.showSnackbar("You can update later. The app will check again on next launch.")
                                }
                            },
                            canSkip = !info.mandatory
                        )

                        Spacer(Modifier.height(40.dp))
                    }
                }
            }
        }
    }

    // Privacy policy dialog — shows the embedded privacy_policy.md from res/raw/
    if (showPrivacyPolicy) {
        PrivacyPolicyDialog(onDismiss = { showPrivacyPolicy = false })
    }

    // Play Protect info dialog — explains why the warning appears + how to install anyway
    if (showPlayProtectInfo) {
        PlayProtectInfoDialog(
            onDismiss = { showPlayProtectInfo = false },
            onOpenShizukuInfo = {
                showPlayProtectInfo = false
                showShizukuInfo = true
            }
        )
    }

    // Shizuku info dialog — explains how to install Shizuku for Play Protect bypass
    if (showShizukuInfo) {
        ShizukuInfoDialog(onDismiss = { showShizukuInfo = false })
    }
}

@Composable
private fun PrivacyPolicyDialog(onDismiss: () -> Unit) {
    val context = LocalContext.current
    var policyText by remember { mutableStateOf("Loading…") }

    LaunchedEffect(Unit) {
        policyText = try {
            context.resources.openRawResource(com.mirrorpro.appupdate.R.raw.privacy_policy)
                .bufferedReader()
                .use { it.readText() }
        } catch (e: Exception) {
            "Failed to load privacy policy."
        }
    }

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Privacy Policy", fontWeight = FontWeight.Bold) },
        text = {
            androidx.compose.foundation.layout.Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = policyText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        }
    )
}

@Composable
private fun PlayProtectInfoDialog(
    onDismiss: () -> Unit,
    onOpenShizukuInfo: () -> Unit
) {
    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("About the Play Protect Warning", fontWeight = FontWeight.Bold) },
        text = {
            androidx.compose.foundation.layout.Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 500.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Google Play Protect may show a warning when you install MirrorPro. This is expected and the app is safe.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Text("Why does the warning appear?", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "• MirrorPro needs REQUEST_INSTALL_PACKAGES permission to install APK updates — this is the app's core feature.\n" +
                           "• Any app with this permission gets extra scrutiny from Play Protect because malware also uses it.\n" +
                           "• MirrorPro is not from the Play Store, so it has no reputation yet.\n\n" +
                           "This is a false positive. The warning is the same one shown for F-Droid, Obtainium, and APKMirror Installer.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Text("How to install anyway:", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "1. When Play Protect shows the warning, tap \"More details\"\n" +
                           "2. Tap \"Install anyway\" (or \"Still install\")\n" +
                           "3. The app will install normally\n\n" +
                           "MirrorPro is 100% open source. You can audit every line of code at:\n" +
                           "github.com/stephenmarcus89s-star/androidfk",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "⚡ Want to skip the warning entirely?",
                    fontWeight = FontWeight.SemiBold,
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "You can install Shizuku (a free, open-source Android utility) and grant MirrorPro permission. " +
                           "Shizuku runs the installer with the same privileges as ADB, which completely bypasses Play Protect. " +
                           "This is a power-user feature — most users should just tap \"Install anyway\".",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        },
        confirmButton = {
            Row {
                TextButton(onClick = onOpenShizukuInfo) { Text("Learn about Shizuku") }
                Spacer(Modifier.width(8.dp))
                TextButton(onClick = onDismiss) { Text("Got it") }
            }
        }
    )
}

@Composable
private fun ShizukuInfoDialog(onDismiss: () -> Unit) {
    val context = LocalContext.current
    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Install via Shizuku (No Play Protect)", fontWeight = FontWeight.Bold) },
        text = {
            androidx.compose.foundation.layout.Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 500.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Shizuku is a free, open-source Android utility that lets apps run with ADB (debug) privileges — without root. " +
                           "Because Android's package installer treats ADB installs as trusted, Play Protect is completely skipped.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Text("Setup steps (5 minutes):", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "1. Install Shizuku from the Play Store or F-Droid\n" +
                           "2. Open Shizuku → follow the on-screen guide to start it via Wireless Debugging\n" +
                           "3. In Shizuku, go to \"Apps using Shizuku\" → find MirrorPro → toggle permission ON\n" +
                           "4. Come back to MirrorPro and tap Install — no Play Protect warning will appear",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "Note: Shizuku needs to be restarted after every phone reboot. This is a power-user feature — if it sounds too complex, just tap \"Install anyway\" on the Play Protect warning instead.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Got it") }
        }
    )
}

@Composable
private fun MandatoryUpdateBanner() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Filled.Warning,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error
            )
            Spacer(Modifier.width(12.dp))
            Column {
                Text(
                    text = "Mandatory Update",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
                Text(
                    text = "This update is required to continue using the app.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Filled.WifiOff,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(64.dp)
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Couldn't load update info",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(24.dp))
        Button(onClick = onRetry, shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)) {
            Icon(Icons.Filled.Refresh, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Retry")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SmallTopAppBar(title: @Composable () -> Unit, actions: @Composable RowScope.() -> Unit) {
    TopAppBar(
        title = title,
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background,
            titleContentColor = MaterialTheme.colorScheme.onBackground
        )
    )
}
