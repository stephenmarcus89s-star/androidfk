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
import androidx.compose.material.icons.filled.Refresh
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
import com.mirrorpro.appupdate.ui.download.DownloadState
import com.mirrorpro.appupdate.ui.download.DownloadService
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
                                if (ApkInstallHelper.canRequestInstall(context)) {
                                    val apk = ApkFileStorage.getApkFile(context, info.versionCode)
                                    if (apk.exists()) {
                                        ApkInstallHelper.installApk(context, apk)
                                    } else {
                                        scope.launch {
                                            snackbarHostState.showSnackbar("APK file not found. Please download again.")
                                        }
                                    }
                                } else {
                                    ApkInstallHelper.openInstallPermissionSettings(context)
                                    scope.launch {
                                        snackbarHostState.showSnackbar("Please grant 'Install unknown apps' permission, then tap Install again.")
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
