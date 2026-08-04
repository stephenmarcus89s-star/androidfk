package com.mirrorpro.appupdate.util

import android.content.Context
import android.content.pm.PackageManager
import android.os.IBinder
import android.os.Parcel
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

/**
 * Shizuku-based APK installer — the ONLY real Play Protect bypass on non-rooted devices.
 *
 * Shizuku runs the installer with shell identity (uid 2000 = adb privileges).
 * Because ADB installs bypass Play Protect entirely, this method:
 *  - Skips the "Send app for security check" prompt
 *  - Skips the "Harmful App Blocked" warning
 *  - Skips the "App not from Play Store" warning
 *  - Installs completely silently (no confirmation dialog)
 *
 * Requirements:
 *  - User must install Shizuku app from https://shizuku.rikka.app/
 *  - User must start Shizuku via Developer Options → Wireless Debugging → pairing
 *  - User must grant MirrorPro permission in Shizuku's permission manager
 *
 * This is the same approach used by:
 *  - PackageInstaller by vvb2060 (https://github.com/vvb2060/PackageInstaller)
 *  - InstallerX Revived
 *  - Universal Installer (F-Droid)
 *
 * For users who don't have Shizuku, fall back to [PackageInstallerHelper]
 * (which triggers Play Protect warnings — that's expected and unavoidable).
 */
object ShizukuInstaller {

    /**
     * Checks if Shizuku is installed and running.
     */
    fun isAvailable(): Boolean {
        return try {
            Shizuku.pingBinder()
        } catch (_: Throwable) {
            false
        }
    }

    /**
     * Checks if MirrorPro has been granted permission to use Shizuku.
     */
    fun hasPermission(): Boolean {
        return if (!isAvailable()) false
        else if (Shizuku.isPreV11()) {
            true  // Pre-v11 Shizuku doesn't require per-app permission
        } else {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Requests permission from the user via Shizuku's permission dialog.
     */
    fun requestPermission(listener: Shizuku.OnRequestPermissionResultListener) {
        if (!isAvailable()) return
        if (Shizuku.isPreV11()) {
            listener.onRequestPermissionResult(0, PackageManager.PERMISSION_GRANTED)
            return
        }
        if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
            listener.onRequestPermissionResult(0, PackageManager.PERMISSION_GRANTED)
            return
        }
        Shizuku.addRequestPermissionResultListener(listener)
        Shizuku.requestPermission(0)
    }

    /**
     * Installs an APK using shell identity (via Shizuku).
     *
     * This completely bypasses Play Protect because the install runs as the shell user
     * (uid 2000), same as `adb install`. Android's package installer sees the install
     * as coming from an ADB source and skips all Play Protect hooks.
     */
    fun installApk(
        context: Context,
        apkFile: File,
        onResult: (success: Boolean, message: String) -> Unit
    ) {
        if (!hasPermission()) {
            onResult(false, "Shizuku permission not granted")
            return
        }
        if (!apkFile.exists()) {
            onResult(false, "APK file not found")
            return
        }

        try {
            // Run `pm install` as shell user via Shizuku's binder transact.
            // Shizuku.newProcess is private in the public API, so we use the
            // IProcessService via SystemServiceHelper which is the supported way.
            //
            // Alternative: use `rikka.shizuku.SystemServiceHelper` which provides
            // a public wrapper around `pm install` via the activity manager binder.
            val command = "pm install -r -t -i com.android.shell ${apkFile.absolutePath}"
            val process = runShellCommand(command)

            val output = BufferedReader(InputStreamReader(process.inputStream)).readText()
            val error = BufferedReader(InputStreamReader(process.errorStream)).readText()
            val exitCode = process.waitFor()

            if (exitCode == 0 && output.contains("Success")) {
                onResult(true, "Installed successfully (bypassed Play Protect)")
            } else {
                val msg = if (error.isNotBlank()) error else output
                onResult(false, "Shizuku install failed: $msg")
            }
        } catch (e: Exception) {
            onResult(false, "Shizuku install error: ${e.message}")
        }
    }

    /**
     * Runs a shell command via Shizuku's binder.
     *
     * We use a raw binder transact because Shizuku.newProcess is private in the API.
     * This calls the `shell` service's `exec` method as the shell user (uid 2000).
     *
     * Alternative: use `rikka.shizuku.SystemServiceHelper.exec()` which wraps this
     * in a public API. We avoid the dependency to keep the bundle small.
     */
    private fun runShellCommand(command: String): Process {
        // Use Runtime.exec via Shizuku's remote process API
        // We construct the command array and execute via Shizuku's IRemoteProcess
        //
        // Actually the cleanest way: use the `pm` binary directly via
        // rikka.shizuku.SystemServiceHelper which is part of the API module.
        val args = arrayOf("sh", "-c", command)

        // Use reflection to access Shizuku's newProcess (it's marked private but works)
        // This is a known pattern used by many Shizuku-based apps.
        val shizukuClass = Class.forName("rikka.shizuku.Shizuku")
        val newProcessMethod = shizukuClass.getDeclaredMethod(
            "newProcess",
            arrayOf<String>::class.java,
            Array<String>::class.java,
            String::class.java
        )
        newProcessMethod.isAccessible = true
        return newProcessMethod.invoke(null, args, null, null) as Process
    }
}
