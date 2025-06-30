package io.github.cotrin8672.inglyph.domain.usecase

import io.github.cotrin8672.inglyph.data.repository.StorageRepository

class GetPublicAudioUrlUseCase(private val storageRepository: StorageRepository) {
    suspend operator fun invoke(sentenceId: String): String? {
        return storageRepository.getPublicAudioUrl(sentenceId)
    }
}