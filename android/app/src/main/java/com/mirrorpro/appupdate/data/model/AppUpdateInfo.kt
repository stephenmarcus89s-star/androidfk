package com.mirrorpro.appupdate.data.model

data class AppUpdateInfo(
    val name: String,
    val developer: String,
    val packageName: String,
    val description: String,
    val currentVersion: String,
    val versionCode: Int,
    val releaseDate: String,
    val apkUrl: String?,
    val apkSize: Long,
    val apkSizeText: String,
    val logoUrl: String?,
    val screenshots: List<Screenshot>,
    val minAndroid: String,
    val downloads: String,
    val rating: Double,
    val reviews: Int,
    val ratingBreakdown: RatingBreakdown,
    val mandatory: Boolean,
    val changelog: List<String>
)

data class Screenshot(
    val id: Long,
    val url: String,
    val caption: String?
)

data class RatingBreakdown(
    val five: Int,
    val four: Int,
    val three: Int,
    val two: Int,
    val one: Int
) {
    val total: Int get() = five + four + three + two + one
}
