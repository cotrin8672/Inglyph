package io.github.cotrin8672.inglyph.data.repository

import io.github.cotrin8672.inglyph.data.model.Sentence

interface SentenceRepository {
    /**
     * 指定された難易度のランダムな例文を1つ取得します。
     * @param difficulty CEFRレベル (例: "A1", "B2")
     * @return 取得した例文、または見つからなかった場合はnull
     */
    suspend fun getRandomSentenceByDifficulty(difficulty: String): Sentence?

    /**
     * 指定されたIDの例文を取得します。
     * @param id 例文のUUID
     * @return 取得した例文、または見つからなかった場合はnull
     */
    suspend fun getSentenceById(id: String): Sentence?
}