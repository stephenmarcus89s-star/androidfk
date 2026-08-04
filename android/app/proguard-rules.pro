# Add project specific ProGuard rules here.

# === Retrofit ===
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement

# === OkHttp ===
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# === Kotlinx Serialization ===
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.mirrorpro.appupdate.**$$serializer { *; }
-keepclassmembers class com.mirrorpro.appupdate.** {
    *** Companion;
}
-keepclasseswithmembers class com.mirrorpro.appupdate.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# === Hilt / Dagger ===
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-dontwarn dagger.hilt.**
-keep class * extends dagger.hilt.android.lifecycle.HiltViewModel { *; }

# === Coroutines ===
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keep class kotlinx.coroutines.android.AndroidExceptionPreHandler { *; }

# === Keep model classes for serialization ===
-keep class com.mirrorpro.appupdate.data.dto.** { *; }
-keep class com.mirrorpro.appupdate.data.model.** { *; }
-keep class com.mirrorpro.appupdate.domain.** { *; }

# === Compose ===
-dontwarn androidx.compose.**
-keep class androidx.compose.runtime.** { *; }

# === Coil ===
-dontwarn coil.**
-keep class coil.** { *; }

# === Lottie ===
-dontwarn com.airbnb.lottie.**
-keep class com.airbnb.lottie.** { *; }

# === Shizuku ===
-dontwarn rikka.shizuku.**
-keep class rikka.shizuku.** { *; }

# === Render our app's main classes ===
-keep class com.mirrorpro.appupdate.MirrorProApp { *; }
-keep class com.mirrorpro.appupdate.MainActivity { *; }

# === Remove logging in release ===
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
    public static *** w(...);
}
