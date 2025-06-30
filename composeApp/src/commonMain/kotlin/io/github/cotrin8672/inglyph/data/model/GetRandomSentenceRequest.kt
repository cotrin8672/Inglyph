package io.github.cotrin8672.inglyph.data.model

import kotlinx.serialization.Serializable

@Serializable
data class GetRandomSentenceRequest(
    val difficulty: String
)