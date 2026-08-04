package com.mirrorpro.appupdate.domain.usecase

import com.mirrorpro.appupdate.data.model.AppUpdateInfo
import com.mirrorpro.appupdate.domain.repository.AppRepository
import javax.inject.Inject

class GetLatestUpdateUseCase @Inject constructor(
    private val repository: AppRepository
) {
    suspend operator fun invoke(): Result<AppUpdateInfo> = repository.getLatest()
}

class TrackDownloadUseCase @Inject constructor(
    private val repository: AppRepository
) {
    suspend operator fun invoke(): Result<Unit> = repository.trackDownload()
}

class CheckIfUpdateAvailableUseCase @Inject constructor() {

    /**
     * @return true if installed versionCode < backend versionCode
     */
    operator fun invoke(installedVersionCode: Int, latestVersionCode: Int): Boolean {
        return latestVersionCode > installedVersionCode
    }
}
