package com.mirrorpro.appupdate.util

import android.content.Context
import android.net.Uri
import java.io.File

/**
 * Unified APK installer that picks the best available method.
 *
 * Strategy:
 * 1. If Shizuku is available + has permission → use it (BYPASSES Play Protect)
 * 2. Otherwise → use PackageInstaller.Session API (standard, triggers Play Protect warning)
 *
 * There is NO third option. Play Protect hooks into the OS at the PackageInstallerSession
 * layer, so any non-elevated install path goes through it.
 */
object ApkInstallHelper {

    fun canRequestInstall(context: Context): Boolean {
        return PackageInstallerHelper.canRequestInstall(context)
    }

    fun openInstallPermissionSettings(context: Context) {
        PackageInstallerHelper.openInstallPermissionSettings(context)
    }

    /**
     * Returns true if the Shizuku bypass path is available (installed + running + permission granted).
     * UI should show this as the recommended install method when available.
     */
    fun canBypassPlayProtect(): Boolean {
        return ShizukuInstaller.isAvailable() && ShizukuInstaller.hasPermission()
    }

    /**
     * Returns true if Shizuku is installed but MirrorPro hasn't been granted permission yet.
     * UI should prompt the user to grant permission.
     */
    fun needsShizukuPermission(): Boolean {
        return ShizukuInstaller.isAvailable() && !ShizukuInstaller.hasPermission()
    }

    /**
     * Installs the APK using the best available method.
     *
     * @param context
     * @param apkFile  The downloaded APK file
     * @param useShizukuIfAvailable  If true, uses Shizuku when available (skips Play Protect).
     *                               If false, always uses the standard PackageInstaller API.
     * @param onResult  Callback invoked when the install completes or fails.
     *                  success=true if installed, false with a message if failed.
     */
    fun installApk(
        context: Context,
        apkFile: File,
        useShizukuIfAvailable: Boolean = true,
        onResult: (success: Boolean, message: String) -> Unit
    ) {
        if (useShizukuIfAvailable && ShizukuInstaller.isAvailable() && ShizukuInstaller.hasPermission()) {
            // ⚡ Power-user path: completely bypasses Play Protect
            ShizukuInstaller.installApk(context, apkFile, onResult)
        } else {
            // Standard path: triggers Play Protect warning (expected, unavoidable)
            PackageInstallerHelper.installApk(context, apkFile, requireUserAction = true, onResult = onResult)
        }
    }
}
