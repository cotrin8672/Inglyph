package io.github.cotrin8672.inglyph.domain.usecase

import io.github.cotrin8672.inglyph.data.model.Sentence
import io.github.cotrin8672.inglyph.data.repository.SentenceRepository

class GetRandomSentenceUseCase(private val sentenceRepository: SentenceRepository) {
    suspend operator fun invoke(difficulty: String): Sentence? {
        return sentenceRepository.getRandomSentenceByDifficulty(difficulty)
    }
}
