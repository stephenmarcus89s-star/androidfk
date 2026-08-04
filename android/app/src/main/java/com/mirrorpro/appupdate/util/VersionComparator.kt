package com.mirrorpro.appupdate.util

/**
 * Compares version strings like "1.2.3" > "1.2.2".
 * Returns positive if a > b, negative if a < b, zero if equal.
 */
object VersionComparator {

    fun compare(a: String, b: String): Int {
        val partsA = a.split(".").map { it.toIntOrNull() ?: 0 }
        val partsB = b.split(".").map { it.toIntOrNull() ?: 0 }
        val maxLen = maxOf(partsA.size, partsB.size)
        for (i in 0 until maxLen) {
            val va = partsA.getOrElse(i) { 0 }
            val vb = partsB.getOrElse(i) { 0 }
            if (va != vb) return va - vb
        }
        return 0
    }

    fun isNewer(candidate: String, current: String): Boolean = compare(candidate, current) > 0
}
