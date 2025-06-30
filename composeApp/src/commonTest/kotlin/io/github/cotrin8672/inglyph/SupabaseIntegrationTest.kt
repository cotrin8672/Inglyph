package io.github.cotrin8672.inglyph

import io.github.cotrin8672.inglyph.data.repository.SupabaseSentenceRepository
import io.github.cotrin8672.inglyph.data.repository.SupabaseStorageRepository
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SupabaseIntegrationTest {

    private val supabaseClient = createSupabaseClient(
        supabaseUrl = BuildKonfig.SUPABASE_URL,
        supabaseKey = BuildKonfig.SUPABASE_ANON_KEY
    ) {
        install(Postgrest)
        install(Storage)
        install(Functions)
    }

    @Test
    fun `SupabaseStorageRepository can get public audio URL from real Supabase`() = runTest {
        // Arrange
        val storageRepository = SupabaseStorageRepository(supabaseClient)
        // TODO: Replace with an actual sentence ID that has an audio file in your Supabase 'audio' bucket
        val testSentenceId = "3a777310-4d34-424c-96df-0f83b488da81"

        // Act
        val audioUrl = storageRepository.getPublicAudioUrl(testSentenceId)

        // Assert
        assertNotNull(audioUrl, "Audio URL should not be null")
        assertTrue(audioUrl.contains(testSentenceId), "Audio URL should contain the sentence ID")
        assertTrue(audioUrl.startsWith("http"), "Audio URL should be a valid URL")
        println("Successfully retrieved audio URL: $audioUrl")
    }

    @Test
    fun `SupabaseSentenceRepository can get random sentence from real Supabase Edge Function`() = runTest {
        // Arrange
        val sentenceRepository = SupabaseSentenceRepository(supabaseClient)
        // TODO: Replace with a difficulty level that has sentences in your Supabase 'sentence' table
        val testDifficulty = "A1"

        // Act
        val sentence = sentenceRepository.getRandomSentenceByDifficulty(testDifficulty)

        // Assert
        assertNotNull(sentence, "Sentence should not be null")
        assertEquals(testDifficulty, sentence.difficulty, "Retrieved sentence should match the requested difficulty")
        assertNotNull(sentence.text_en, "English text should not be null")
        assertNotNull(sentence.text_ja, "Japanese text should not be null")
        println("Successfully retrieved random sentence: ${sentence.text_en} (${sentence.text_ja})")
    }
}
