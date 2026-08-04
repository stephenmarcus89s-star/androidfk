package com.mirrorpro.appupdate.di

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.mirrorpro.appupdate.BuildConfig
import com.mirrorpro.appupdate.data.remote.MirrorProApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    /**
     * ⚠️ UPDATE THIS when you deploy to Render.
     * After deploying, change this to your Render URL, e.g.:
     *   "https://mirrorpro-xxxx.onrender.com"
     *
     * For local development, use your machine's LAN IP (10.0.2.2 = host from emulator).
     */
    private const val BASE_URL = "http://10.0.2.2:10000/"

    @Provides
    @Singleton
    @Named("baseUrl")
    fun provideBaseUrl(): String = BASE_URL

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        explicitNulls = false
        prettyPrint = false
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                    else HttpLoggingInterceptor.Level.NONE
        }
        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(120, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(
        client: OkHttpClient,
        json: Json,
        @Named("baseUrl") baseUrl: String
    ): Retrofit {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
    }

    @Provides
    @Singleton
    fun provideMirrorProApi(retrofit: Retrofit): MirrorProApi =
        retrofit.create(MirrorProApi::class.java)
}
