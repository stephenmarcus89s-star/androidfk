package com.mirrorpro.appupdate.data.remote

import com.mirrorpro.appupdate.data.dto.LatestResponse
import retrofit2.http.GET

interface MirrorProApi {

    /** GET /latest — public endpoint, returns the latest app info + version. */
    @GET("api/latest")
    suspend fun getLatest(): LatestResponse

    /** GET /download/track — increments download counter. Best-effort. */
    @GET("api/download/track")
    suspend fun trackDownload(): retrofit2.Response<Unit>
}
