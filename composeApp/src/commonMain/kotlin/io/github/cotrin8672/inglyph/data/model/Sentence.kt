package io.github.cotrin8672.inglyph.data.model

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class Sentence(
    val id: String,
    val text_en: String,
    val text_ja: String,
    val difficulty: String,
    val created_at: Instant
)