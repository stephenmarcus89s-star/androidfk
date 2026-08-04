package com.mirrorpro.appupdate.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mirrorpro.appupdate.data.model.AppUpdateInfo
import com.mirrorpro.appupdate.domain.usecase.CheckIfUpdateAvailableUseCase
import com.mirrorpro.appupdate.domain.usecase.GetLatestUpdateUseCase
import com.mirrorpro.appupdate.domain.usecase.TrackDownloadUseCase
import com.mirrorpro.appupdate.util.AppInfoUtil
import com.mirrorpro.appupdate.util.NetworkUtil
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Sealed UI state for the home screen.
 */
sealed class HomeUiState {
    data object Loading : HomeUiState()
    data class Success(
        val info: AppUpdateInfo,
        val installedVersionCode: Int,
        val installedVersionName: String,
        val updateAvailable: Boolean
    ) : HomeUiState()
    data class Error(val message: String, val offline: Boolean = false) : HomeUiState()
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    application: Application,
    private val getLatestUseCase: GetLatestUpdateUseCase,
    private val trackDownloadUseCase: TrackDownloadUseCase,
    private val checkIfUpdateAvailableUseCase: CheckIfUpdateAvailableUseCase
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadLatest()
    }

    fun loadLatest() {
        _uiState.value = HomeUiState.Loading
        viewModelScope.launch {
            val context = getApplication<Application>()
            if (!NetworkUtil.isOnline(context)) {
                _uiState.value = HomeUiState.Error("No internet connection. Please check your network and try again.", offline = true)
                return@launch
            }
            getLatestUseCase()
                .onSuccess { info ->
                    val installedVc = AppInfoUtil.getInstalledVersionCode(context)
                    val installedVn = AppInfoUtil.getInstalledVersionName(context)
                    val updateAvailable = checkIfUpdateAvailableUseCase(installedVc, info.versionCode)
                    _uiState.value = HomeUiState.Success(
                        info = info,
                        installedVersionCode = installedVc,
                        installedVersionName = installedVn,
                        updateAvailable = updateAvailable
                    )
                }
                .onFailure { e ->
                    _uiState.value = HomeUiState.Error(
                        message = e.message ?: "Failed to load update info. Please try again."
                    )
                }
        }
    }

    /**
     * Increments the backend download counter (best-effort, ignored on failure).
     */
    fun trackDownload() {
        viewModelScope.launch {
            trackDownloadUseCase()
        }
    }

    /**
     * Refresh — same as loadLatest but does not show loading skeleton if we already have data.
     */
    fun refresh() {
        val current = _uiState.value
        viewModelScope.launch {
            val context = getApplication<Application>()
            if (!NetworkUtil.isOnline(context)) {
                if (current !is HomeUiState.Success) {
                    _uiState.value = HomeUiState.Error("No internet connection.", offline = true)
                }
                return@launch
            }
            getLatestUseCase()
                .onSuccess { info ->
                    val installedVc = AppInfoUtil.getInstalledVersionCode(context)
                    val installedVn = AppInfoUtil.getInstalledVersionName(context)
                    val updateAvailable = checkIfUpdateAvailableUseCase(installedVc, info.versionCode)
                    _uiState.update {
                        HomeUiState.Success(
                            info = info,
                            installedVersionCode = installedVc,
                            installedVersionName = installedVn,
                            updateAvailable = updateAvailable
                        )
                    }
                }
                .onFailure { /* keep old state on refresh failure */ }
        }
    }
}
