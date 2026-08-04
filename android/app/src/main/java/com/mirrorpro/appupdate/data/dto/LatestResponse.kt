package com.mirrorpro.appupdate.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LatestResponse(
    val name: String = "",
    val developer: String = "",
    val `package`: String = "",
    val description: String = "",
    val currentVersion: String = "1.0.0",
    val versionCode: Int = 1,
    val releaseDate: String = "",
    val apkUrl: String? = null,
    val apkSize: Long = 0,
    val size: String = "0 KB",
    val logo: String? = null,
    val screenshots: List<ScreenshotDto> = emptyList(),
    val minAndroid: String = "8.0",
    val downloads: String = "0",
    val rating: Double = 4.8,
    val reviews: Int = 0,
    val ratingBreakdown: RatingBreakdownDto? = null,
    val mandatory: Boolean = false,
    val changelog: List<String> = emptyList()
)

@Serializable
data class ScreenshotDto(
    val id: Long,
    val url: String,
    val caption: String? = null
)

@Serializable
data class RatingBreakdownDto(
    @SerialName("1") val one: Int = 0,
    @SerialName("2") val two: Int = 0,
    @SerialName("3") val three: Int = 0,
    @SerialName("4") val four: Int = 0,
    @SerialName("5") val five: Int = 0
)
