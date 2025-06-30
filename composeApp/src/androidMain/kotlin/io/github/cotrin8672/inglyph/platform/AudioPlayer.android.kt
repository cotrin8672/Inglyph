package io.github.cotrin8672.inglyph.platform

import android.media.MediaPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AndroidAudioPlayer(private val scope: CoroutineScope) : AudioPlayer {
    private var mediaPlayer: MediaPlayer? = null
    private var positionJob: Job? = null

    private val _position = MutableStateFlow(0L)
    override val position = _position.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    override val isPlaying = _isPlaying.asStateFlow()

    override suspend fun prepare(sourceUrl: String) {
        mediaPlayer?.release()
        mediaPlayer = MediaPlayer().apply {
            setDataSource(sourceUrl)
            prepare()
            setOnCompletionListener {
                _isPlaying.value = false
                positionJob?.cancel()
            }
        }
    }

    override fun play() {
        mediaPlayer?.start()
        _isPlaying.value = true
        positionJob = scope.launch {
            while (isPlaying.value) {
                _position.value = mediaPlayer?.currentPosition?.toLong() ?: 0L
                delay(100)
            }
        }
    }

    override fun pause() {
        mediaPlayer?.pause()
        _isPlaying.value = false
        positionJob?.cancel()
    }

    override fun setSpeed(speed: Float) {
        mediaPlayer?.playbackParams = mediaPlayer?.playbackParams?.setSpeed(speed)!!
    }
}

actual fun createAudioPlayer(): AudioPlayer {
    return AndroidAudioPlayer(CoroutineScope(Dispatchers.Main))
}
