package io.github.cotrin8672.inglyph.compose.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PauseCircle
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import io.github.cotrin8672.inglyph.platform.createAudioPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun DictationScreen() {
    DictationScreenComposable()
}

@Composable
fun DictationScreenComposable() {
    val correctAnswer = "Learning a new language can be challenging but rewarding."
    var isPlaying by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    var helperText by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }
    var playbackSpeed by remember { mutableFloatStateOf(1f) }
    val audioPlayer = remember { createAudioPlayer() }

    suspend fun playMp3() {
        audioPlayer.prepare("C:\\Users\\gummy\\IdeaProjects\\Inglyph\\synthesis.mp3")
        audioPlayer.setSpeed(playbackSpeed)
        audioPlayer.play()
    }

    Row(
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth(0.5f),
        ) {
            IconButton(
                onClick = {
                    if (!isPlaying) {
                        CoroutineScope(Dispatchers.IO).launch {
                            playMp3()
                        }
                    } else {
                        audioPlayer.pause()
                    }
                    isPlaying = !isPlaying
                },
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.PauseCircle else Icons.Default.PlayCircle,
                    contentDescription = null,
                    modifier = Modifier.size(512.dp)
                )
            }

            Spacer(modifier = Modifier.padding(16.dp))

            OutlinedTextField(
                value = inputText,
                onValueChange = {
                    inputText = it
                    isError = false
                    helperText = ""
                },
                isError = isError,
                modifier = Modifier.fillMaxWidth(),
                trailingIcon = {
                    IconButton(
                        onClick = {
                            if (inputText == correctAnswer) {
                                isError = false
                                helperText = "正解！"
                            } else {
                                isError = true
                                helperText = "不正解"
                            }
                        }
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Submit")
                    }
                },
                label = { Text("ディクテーションを入力") },
                supportingText = {
                    if (helperText.isNotEmpty()) {
                        Text(
                            text = helperText,
                            color = if (isError) MaterialTheme.colorScheme.error else Color(0xFF43A047) // 緑
                        )
                    }
                }
            )

            Spacer(modifier = Modifier.padding(16.dp))

//            Slider(
//                value = playbackSpeed,
//                onValueChange = { playbackSpeed = it },
//                valueRange = 0.5f..2f
//            )
        }
    }
}
