package io.github.cotrin8672.inglyph.di

import io.github.cotrin8672.inglyph.BuildKonfig
import io.github.cotrin8672.inglyph.data.repository.SentenceRepository
import io.github.cotrin8672.inglyph.data.repository.StorageRepository
import io.github.cotrin8672.inglyph.data.repository.SupabaseSentenceRepository
import io.github.cotrin8672.inglyph.data.repository.SupabaseStorageRepository
import io.github.cotrin8672.inglyph.domain.usecase.GetPublicAudioUrlUseCase
import io.github.cotrin8672.inglyph.domain.usecase.GetRandomSentenceUseCase
import io.github.cotrin8672.inglyph.presentation.viewmodel.DictationViewModel
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module

val appModule = module {
    // Supabase Client
    single {
        createSupabaseClient(
            supabaseUrl = BuildKonfig.SUPABASE_URL,
            supabaseKey = BuildKonfig.SUPABASE_ANON_KEY
        ) {
            install(Postgrest)
            install(Storage)
            install(Functions)
        }
    }

    // Repositories
    single<SentenceRepository> { SupabaseSentenceRepository(get()) }
    single<StorageRepository> { SupabaseStorageRepository(get()) }

    // Use Cases
    factory { GetRandomSentenceUseCase(get()) }
    factory { GetPublicAudioUrlUseCase(get()) }

    // ViewModels
    viewModelOf(::DictationViewModel)
}
