package io.github.cotrin8672.inglyph.platform

import kotlinx.coroutines.flow.StateFlow

class AndroidAudioPlayer() : AudioPlayer {
    override val position: StateFlow<Long>
        get() = TODO("Not yet implemented")
    override val isPlaying: StateFlow<Boolean>
        get() = TODO("Not yet implemented")

    override suspend fun prepare(sourceUrl: String) {
        TODO("Not yet implemented")
    }

    override fun play() {
        TODO("Not yet implemented")
    }

    override fun pause() {
        TODO("Not yet implemented")
    }

    override fun setSpeed(speed: Float) {
        TODO("Not yet implemented")
    }

}

actual fun createAudioPlayer(): AudioPlayer {
    return AndroidAudioPlayer()
}
