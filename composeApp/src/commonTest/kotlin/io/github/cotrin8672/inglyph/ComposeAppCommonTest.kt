package io.github.cotrin8672.inglyph

import io.github.cotrin8672.inglyph.data.model.Sentence
import io.github.cotrin8672.inglyph.data.repository.SentenceRepository
import io.github.cotrin8672.inglyph.domain.usecase.GetRandomSentenceUseCase
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import kotlinx.datetime.Clock
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ComposeAppCommonTest {

    @Test
    fun example() {
        assertEquals(3, 1 + 2)
    }

    @Test
    fun `GetRandomSentenceUseCase returns sentence for valid difficulty`() = runTest {
        // Given
        val mockSentenceRepository = mockk<SentenceRepository>()
        val useCase = GetRandomSentenceUseCase(mockSentenceRepository)
        val expectedSentence = Sentence(
            id = "test-id-1",
            text_en = "Hello, world.",
            text_ja = "こんにちは、世界。",
            difficulty = "A1",
            created_at = Clock.System.now()
        )

        coEvery { mockSentenceRepository.getRandomSentenceByDifficulty("A1") } returns expectedSentence

        // When
        val result = useCase("A1")

        // Then
        assertEquals(expectedSentence, result)
    }

    @Test
    fun `GetRandomSentenceUseCase returns null for unknown difficulty`() = runTest {
        // Given
        val mockSentenceRepository = mockk<SentenceRepository>()
        val useCase = GetRandomSentenceUseCase(mockSentenceRepository)

        coEvery { mockSentenceRepository.getRandomSentenceByDifficulty("Z9") } returns null

        // When
        val result = useCase("Z9")

        // Then
        assertNull(result)
    }

    @Test
    fun `GetRandomSentenceUseCase handles repository error`() = runTest {
        // Given
        val mockSentenceRepository = mockk<SentenceRepository>()
        val useCase = GetRandomSentenceUseCase(mockSentenceRepository)

        coEvery { mockSentenceRepository.getRandomSentenceByDifficulty("B1") } throws RuntimeException("Network error")

        // When
        val result = useCase("B1")

        // Then
        assertNull(result) // UseCase should return null or handle error gracefully
    }
}
