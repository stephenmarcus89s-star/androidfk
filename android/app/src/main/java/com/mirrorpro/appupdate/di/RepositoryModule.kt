package com.mirrorpro.appupdate.di

import com.mirrorpro.appupdate.data.remote.MirrorProApi
import com.mirrorpro.appupdate.data.repository.AppRepositoryImpl
import com.mirrorpro.appupdate.domain.repository.AppRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindAppRepository(impl: AppRepositoryImpl): AppRepository
}
