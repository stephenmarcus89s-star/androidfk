package com.mirrorpro.appupdate.util

import android.content.Context
import android.content.pm.PackageManager

object AppInfoUtil {

    fun getInstalledVersionCode(context: Context): Int {
        return try {
            val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            // Use longVersionCode on Android 9+ for safety
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                pkgInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                pkgInfo.versionCode
            }
        } catch (e: PackageManager.NameNotFoundException) {
            1
        }
    }

    fun getInstalledVersionName(context: Context): String {
        return try {
            val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pkgInfo.versionName ?: "1.0.0"
        } catch (e: PackageManager.NameNotFoundException) {
            "1.0.0"
        }
    }
}
