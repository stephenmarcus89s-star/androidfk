package com.mirrorpro.appupdate.data.repository

import com.mirrorpro.appupdate.data.dto.LatestResponse
import com.mirrorpro.appupdate.data.dto.RatingBreakdownDto
import com.mirrorpro.appupdate.data.dto.ScreenshotDto
import com.mirrorpro.appupdate.data.model.AppUpdateInfo
import com.mirrorpro.appupdate.data.model.RatingBreakdown
import com.mirrorpro.appupdate.data.model.Screenshot
import com.mirrorpro.appupdate.data.remote.MirrorProApi
import com.mirrorpro.appupdate.domain.repository.AppRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppRepositoryImpl @Inject constructor(
    private val api: MirrorProApi
) : AppRepository {

    override suspend fun getLatest(): Result<AppUpdateInfo> = runCatching {
        val dto = api.getLatest()
        dto.toModel()
    }

    override suspend fun trackDownload(): Result<Unit> = runCatching {
        api.trackDownload()
        Unit
    }

    private fun LatestResponse.toModel(): AppUpdateInfo = AppUpdateInfo(
        name = name.ifBlank { "MirrorPro" },
        developer = developer,
        packageName = `package`,
        description = description,
        currentVersion = currentVersion,
        versionCode = versionCode,
        releaseDate = releaseDate,
        apkUrl = apkUrl,
        apkSize = apkSize,
        apkSizeText = size,
        logoUrl = logo,
        screenshots = screenshots.map { it.toModel() },
        minAndroid = minAndroid,
        downloads = downloads,
        rating = rating,
        reviews = reviews,
        ratingBreakdown = ratingBreakdown?.toModel() ?: RatingBreakdown(0, 0, 0, 0, 0),
        mandatory = mandatory,
        changelog = changelog
    )

    private fun ScreenshotDto.toModel(): Screenshot = Screenshot(
        id = id,
        url = url,
        caption = caption
    )

    private fun RatingBreakdownDto.toModel(): RatingBreakdown = RatingBreakdown(
        five = five,
        four = four,
        three = three,
        two = two,
        one = one
    )
}
