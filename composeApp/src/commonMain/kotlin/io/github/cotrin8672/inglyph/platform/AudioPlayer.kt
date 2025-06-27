package io.github.cotrin8672.inglyph.platform

import kotlinx.coroutines.flow.StateFlow

interface AudioPlayer {
    val position: StateFlow<Long>
    val isPlaying: StateFlow<Boolean>
    suspend fun prepare(sourceUrl: String)
    fun play()
    fun pause()
    fun setSpeed(speed: Float)
}

expect fun createAudioPlayer(): AudioPlayer
