package io.github.cotrin8672.inglyph.platform

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.NonCancellable.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.sound.sampled.*

class DesktopAudioPlayer() : AudioPlayer {
    private val _position = MutableStateFlow(0L)
    override val position: StateFlow<Long>
        get() = _position.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    override val isPlaying: StateFlow<Boolean>
        get() = _isPlaying.asStateFlow()

    private var audioThread: Job? = null
    private var audioFile: File? = null
    private var audioStream: AudioInputStream? = null
    private var pcmFormat: AudioFormat? = null
    private var decodedStream: AudioInputStream? = null
    private var line: SourceDataLine? = null

    private var playbackSpeed = 1.0f

    override suspend fun prepare(sourceUrl: String) {
        audioFile = File(sourceUrl)
        audioStream = AudioSystem.getAudioInputStream(audioFile)
        val baseFormat = audioStream!!.format
        pcmFormat = AudioFormat(
            AudioFormat.Encoding.PCM_SIGNED,
            baseFormat.sampleRate,
            16,
            baseFormat.channels,
            baseFormat.channels * 2,
            baseFormat.sampleRate,
            false
        )
        decodedStream = AudioSystem.getAudioInputStream(pcmFormat, audioStream)
        val info = DataLine.Info(SourceDataLine::class.java, pcmFormat)
        line = AudioSystem.getLine(info) as SourceDataLine
        line?.open(pcmFormat)
        val sampleRateControl = line?.controls
            ?.firstOrNull { it.type == FloatControl.Type.SAMPLE_RATE }
        if (sampleRateControl is FloatControl) {
            sampleRateControl.value = pcmFormat!!.sampleRate * playbackSpeed
        }
        _position.value = 0L
        _isPlaying.value = false
    }

    override fun play() {
        if (_isPlaying.value) return
        _isPlaying.value = true
        audioThread = CoroutineScope(Dispatchers.IO).launch {
            line?.start()
            decodedStream?.let { stream ->
                val buffer = ByteArray(4096)
                var bytesRead = 0
                while (isActive && stream.read(buffer).also { bytesRead = it } != -1 && _isPlaying.value) {
                    line?.write(buffer, 0, bytesRead)
                    _position.value = line?.microsecondPosition ?: 0L
                }
                line?.drain()
                line?.stop()
                _isPlaying.value = false
            }
        }
    }

    override fun pause() {
        _isPlaying.value = false
        line?.stop()
        audioThread?.cancel()
    }

    override fun setSpeed(speed: Float) {
        playbackSpeed = speed
        val sampleRateControl = line?.controls
            ?.firstOrNull { it.type == FloatControl.Type.SAMPLE_RATE }
        if (sampleRateControl is FloatControl) {
            sampleRateControl.value = pcmFormat!!.sampleRate * playbackSpeed
        }
    }

}

actual fun createAudioPlayer(): AudioPlayer {
    return DesktopAudioPlayer()
}
