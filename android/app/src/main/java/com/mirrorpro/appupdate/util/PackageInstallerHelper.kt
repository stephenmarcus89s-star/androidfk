package com.mirrorpro.appupdate.util

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageInstaller
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File

/**
 * Modern APK installer using PackageInstaller.Session API.
 *
 * This is the canonical, Google-recommended way to install APKs programmatically.
 * It does NOT bypass Play Protect — nothing does on non-rooted, non-Shizuku devices.
 * But it's the API Google expects legitimate installers to use, and is required
 * for the Play Protect appeals process.
 *
 * Benefits over the legacy Intent.ACTION_VIEW approach:
 * - In-app install UX (no separate installer activity if you don't want one)
 * - Supports split APKs
 * - Supports silent self-updates on Android 12+ (setRequireUserAction(USER_ACTION_NOT_REQUIRED))
 * - Better error reporting (specific status codes)
 * - Handles Android 16+ Developer Verification properly
 *
 * For the actual Play Protect bypass, see [ShizukuInstaller].
 */
object PackageInstallerHelper {

    private const val INSTALL_ACTION = "com.mirrorpro.appupdate.INSTALL_PACKAGE"

    /**
     * Checks whether the app is allowed to request package installs.
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
     * Installs an APK using the modern PackageInstaller.Session API.
     *
     * Flow:
     * 1. Create a session with MODE_FULL_INSTALL
     * 2. Open the APK file and write it to the session
     * 3. Commit the session with a PendingIntent
     * 4. Our BroadcastReceiver receives the result
     *
     * On Android 12+, you can pass requireUserAction = false for silent self-updates
     * (only works if the new APK is signed with the same key as the installed one).
     */
    fun installApk(
        context: Context,
        apkFile: File,
        requireUserAction: Boolean = true,
        onResult: (success: Boolean, message: String) -> Unit
    ) {
        if (!apkFile.exists()) {
            onResult(false, "APK file not found")
            return
        }

        if (!canRequestInstall(context)) {
            onResult(false, "Install permission not granted. Please allow 'Install unknown apps' for MirrorPro in Settings.")
            return
        }

        try {
            val packageInstaller = context.packageManager.packageInstaller
            val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
                setInstallerPackageName(context.packageName)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    // On Android 12+, can do silent self-update if signing key matches
                    if (!requireUserAction) {
                        setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
                    }
                }
                // Set the install origin so Play Protect can attribute it correctly
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    setOriginatingUid(android.os.Process.myUid())
                }
            }

            val sessionId = packageInstaller.createSession(params)
            packageInstaller.openSession(sessionId).use { session ->
                apkFile.inputStream().use { input ->
                    session.openWrite("mirrorpro.apk", 0, apkFile.length()).use { out ->
                        input.copyTo(out)
                        session.fsync(out)
                    }
                }

                // Register a temporary receiver for this session's result
                val receiver = InstallResultReceiver(onResult)
                val filter = IntentFilter(INSTALL_ACTION)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    context.registerReceiver(receiver, filter)
                }

                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    sessionId,
                    Intent(INSTALL_ACTION).setPackage(context.packageName),
                    PendingIntent.FLAG_UPDATE_CURRENT or
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0
                )

                session.commit(pendingIntent.intentSender)
            }
        } catch (e: Exception) {
            onResult(false, "Install failed: ${e.message}")
        }
    }

    /**
     * BroadcastReceiver that receives the install result from PackageInstaller.
     */
    class InstallResultReceiver(
        private val callback: (success: Boolean, message: String) -> Unit
    ) : BroadcastReceiver() {

        override fun onReceive(context: Context, intent: Intent) {
            try {
                context.unregisterReceiver(this)
            } catch (_: Exception) {}

            val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
            val message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE) ?: ""

            when (status) {
                PackageInstaller.STATUS_PENDING_USER_ACTION -> {
                    // System is asking the user to confirm (Play Protect scan, install confirmation)
                    val confirmIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
                    if (confirmIntent != null) {
                        confirmIntent.flags = confirmIntent.flags or Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(confirmIntent)
                        // Don't call callback yet — user hasn't confirmed
                    } else {
                        callback(false, "Install confirmation required but no intent provided")
                    }
                }
                PackageInstaller.STATUS_SUCCESS -> {
                    callback(true, "Installed successfully")
                }
                PackageInstaller.STATUS_FAILURE_BLOCKED -> {
                    callback(false, "Install blocked: $message")
                }
                PackageInstaller.STATUS_FAILURE_ABORTED -> {
                    callback(false, "Install cancelled")
                }
                PackageInstaller.STATUS_FAILURE_INVALID -> {
                    callback(false, "APK is invalid or corrupted")
                }
                PackageInstaller.STATUS_FAILURE_CONFLICT -> {
                    callback(false, "Package conflict — uninstall the existing app first (signature mismatch)")
                }
                PackageInstaller.STATUS_FAILURE_STORAGE -> {
                    callback(false, "Not enough storage space")
                }
                PackageInstaller.STATUS_FAILURE_INCOMPATIBLE -> {
                    callback(false, "APK is incompatible with this device")
                }
                else -> {
                    callback(false, "Install failed: $message (status $status)")
                }
            }
        }
    }
}
