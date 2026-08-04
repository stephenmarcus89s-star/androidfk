package com.mirrorpro.appupdate.ui.download

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Singleton bridge between the [DownloadService] and any active Compose screens.
 *
 * The service updates this holder's state whenever the download progresses;
 * the UI collects [state] to render the progress bar.
 */
object DownloadServiceStateHolder {
    private val _state = MutableStateFlow<DownloadState>(DownloadState.Idle)
    val state: StateFlow<DownloadState> = _state.asStateFlow()

    fun publish(newState: DownloadState) {
        _state.value = newState
    }
}
