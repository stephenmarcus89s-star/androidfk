package com.mirrorpro.appupdate.util

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File

/**
 * Handles APK installation across all Android versions (8.0+).
 *
 * - Android 8+ (API 26+): requires REQUEST_INSTALL_PACKAGES permission
 * - Android 11+ (API 30+): scoped storage, FileProvider required
 * - Android 13+ (API 33+): POST_NOTIFICATIONS (handled separately)
 * - Android 14+ (API 34+): foreground service types
 */
object ApkInstallHelper {

    /**
     * Returns true if the app is allowed to install APK packages.
     * On Android 8+, this checks REQUEST_INSTALL_PACKAGES permission grant.
     */
    fun canRequestInstall(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true
        return context.packageManager.canRequestPackageInstalls()
    }

    /**
     * Opens the system settings page so the user can grant "Install unknown apps"
     * permission to this app.
     */
    fun openInstallPermissionSettings(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${context.packageName}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }
    }

    /**
     * Launches the system APK installer for the given file.
     * The file must be inside a path covered by our FileProvider config.
     */
    fun installApk(context: Context, apkFile: File) {
        val authority = "${context.packageName}.fileprovider"
        val uri = FileProvider.getUriForFile(context, authority, apkFile)

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            // Android 14+ recommends using READ_REQ for installer
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                // No special handling needed beyond standard flags for now
            }
        }
        context.startActivity(intent)
    }

    /**
     * Builds a PendingIntent for installing an APK (used in notifications).
     */
    fun buildInstallPendingIntent(context: Context, apkFile: File, requestCode: Int = 1001): PendingIntent {
        val authority = "${context.packageName}.fileprovider"
        val uri = FileProvider.getUriForFile(context, authority, apkFile)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        return PendingIntent.getActivity(context, requestCode, intent, flags)
    }
}
