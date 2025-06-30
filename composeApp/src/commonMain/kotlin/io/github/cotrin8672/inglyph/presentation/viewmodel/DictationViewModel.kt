package io.github.cotrin8672.inglyph.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.cotrin8672.inglyph.data.model.Sentence
import io.github.cotrin8672.inglyph.domain.usecase.GetPublicAudioUrlUseCase
import io.github.cotrin8672.inglyph.domain.usecase.GetRandomSentenceUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DictationViewModel(
    private val getRandomSentenceUseCase: GetRandomSentenceUseCase,
    private val getPublicAudioUrlUseCase: GetPublicAudioUrlUseCase,
) : ViewModel() {
    private val _currentSentence = MutableStateFlow<Sentence?>(null)
    val currentSentence: StateFlow<Sentence?> = _currentSentence.asStateFlow()

    private val _currentAudioUrl = MutableStateFlow<String?>(null)
    val currentAudioUrl: StateFlow<String?> = _currentAudioUrl.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    /**
     * 指定された難易度の新しい例文を取得します。
     * @param difficulty 取得する例文のCEFR難易度 (例: "A1", "B2")
     */
    fun fetchNewSentence(difficulty: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null // エラーをリセット
            _currentAudioUrl.value = null // 音声URLをリセット

            try {
                val sentence = getRandomSentenceUseCase(difficulty)
                _currentSentence.value = sentence

                if (sentence == null) {
                    _error.value = "No sentence found for difficulty: $difficulty"
                } else {
                    // 音声URLを取得
                    val audioUrl = getPublicAudioUrlUseCase(sentence.id)
                    _currentAudioUrl.value = audioUrl
                    if (audioUrl == null) {
                        _error.value = "Failed to get audio URL for sentence: ${sentence.id}"
                    }
                }
            } catch (e: Exception) {
                _error.value = "Failed to fetch sentence: ${e.message}"
                println("Error fetching sentence: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * 現在のエラーメッセージをクリアします。
     */
    fun clearError() {
        _error.value = null
    }
}
