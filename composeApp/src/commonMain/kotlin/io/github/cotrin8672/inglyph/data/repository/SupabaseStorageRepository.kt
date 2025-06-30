package io.github.cotrin8672.inglyph.data.repository

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.storage.storage

class SupabaseStorageRepository(private val supabaseClient: SupabaseClient) : StorageRepository {

    override suspend fun getPublicAudioUrl(sentenceId: String): String? {
        return try {
            // Supabase Storageの公開URLの形式に合わせて構築
            // 例: https://<project_ref>.supabase.co/storage/v1/object/public/audio/<sentenceId>.mp3
            val bucketName = "audio" // GEMINI.mdで定義されたバケット名
            val filePath = "$sentenceId.mp3"

            // Supabase SDKのgetPublicUrlを使用
            supabaseClient.storage[bucketName].publicUrl(filePath)

        } catch (e: Exception) {
            println("Error getting public audio URL: ${e.message}")
            null
        }
    }
}
