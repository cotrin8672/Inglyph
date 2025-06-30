package io.github.cotrin8672.inglyph.data.repository

import io.github.cotrin8672.inglyph.data.model.GetRandomSentenceRequest
import io.github.cotrin8672.inglyph.data.model.Sentence
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.postgrest
import io.ktor.client.call.*

class SupabaseSentenceRepository(private val supabaseClient: SupabaseClient) : SentenceRepository {
    override suspend fun getRandomSentenceByDifficulty(difficulty: String): Sentence? {
        return try {
            val response = supabaseClient.functions.invoke(
                function = "get-random-sentence",
                body = GetRandomSentenceRequest(difficulty)
            )

            response.body<Sentence>()
        } catch (e: Exception) {
            println("Error invoking get-random-sentence Edge Function: ${e.message}")
            null
        }
    }

    override suspend fun getSentenceById(id: String): Sentence? {
        return try {
            supabaseClient.postgrest["sentence"]
                .select {
                    filter { eq("id", id) }
                }
                .decodeSingleOrNull<Sentence>()
        } catch (e: Exception) {
            println("Error fetching sentence by ID: ${e.message}")
            null
        }
    }
}
