package com.mirrorpro.appupdate.util

import android.content.Context
import android.os.Environment
import java.io.File
import java.security.MessageDigest

/**
 * Manages downloaded APK files on local storage.
 * Remembers downloaded APKs so users can re-install without re-downloading.
 */
object ApkFileStorage {

    private const val APK_DIR = "mirrorpro_apks"

    fun getApkDir(context: Context): File {
        // Use app-specific external storage — no special permissions needed on Android 10+
        val dir = File(context.getExternalFilesDir(null), APK_DIR)
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    /**
     * Returns the path where the APK for [versionCode] would live.
     */
    fun getApkFile(context: Context, versionCode: Int): File {
        return File(getApkDir(context), "mirrorpro_v$versionCode.apk")
    }

    /**
     * Checks if the APK for [versionCode] has already been downloaded.
     */
    fun isApkDownloaded(context: Context, versionCode: Int): Boolean {
        return getApkFile(context, versionCode).exists()
    }

    /**
     * Computes the SHA-256 of a file for checksum verification.
     */
    fun computeSha256(file: File): String? {
        if (!file.exists()) return null
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { input ->
                val buffer = ByteArray(8192)
                var read: Int
                while (input.read(buffer).also { read = it } != -1) {
                    digest.update(buffer, 0, read)
                }
            }
            digest.digest().joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Cleans up old APK files except the most recent N (default 1).
     */
    fun cleanupOldApks(context: Context, keepCount: Int = 1) {
        val dir = getApkDir(context)
        val files = dir.listFiles()?.sortedByDescending { it.lastModified() } ?: return
        files.drop(keepCount).forEach { it.delete() }
    }
}
