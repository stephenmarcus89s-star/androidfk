package com.mirrorpro.appupdate.ui.download

import java.io.File

/**
 * Sealed UI state for the download flow.
 */
sealed class DownloadState {
    /** Not started. */
    data object Idle : DownloadState()

    /** Actively downloading. progress 0..100. */
    data class Downloading(
        val progress: Int,
        val downloadedBytes: Long,
        val totalBytes: Long
    ) : DownloadState()

    /** User paused. */
    data class Paused(
        val progress: Int,
        val downloadedBytes: Long,
        val totalBytes: Long
    ) : DownloadState()

    /** Done — file is ready to install. */
    data class Completed(val file: File) : DownloadState()

    /** Failed with an error message. */
    data class Failed(val message: String) : DownloadState()
}
