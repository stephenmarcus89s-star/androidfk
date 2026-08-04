package com.mirrorpro.appupdate.domain.repository

import com.mirrorpro.appupdate.data.model.AppUpdateInfo

interface AppRepository {
    suspend fun getLatest(): Result<AppUpdateInfo>
    suspend fun trackDownload(): Result<Unit>
}
