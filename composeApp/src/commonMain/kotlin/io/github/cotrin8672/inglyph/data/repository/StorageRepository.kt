package io.github.cotrin8672.inglyph.data.repository

interface StorageRepository {
    /**
     * 指定された例文IDに対応する音声ファイルの公開URLを取得します。
     * @param sentenceId 例文のID
     * @return 音声ファイルの公開URL、または取得できなかった場合はnull
     */
    suspend fun getPublicAudioUrl(sentenceId: String): String?
}