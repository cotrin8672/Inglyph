package io.github.cotrin8672.inglyph.compose.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.PauseCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun DictationScreen() {
    DictationScreenComposable()
}

@Composable
fun DictationScreenComposable() {
    var isPlaying by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    var playbackSpeed by remember { mutableFloatStateOf(1f) }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize(),
    ) {
        IconButton(
            onClick = {
                isPlaying = !isPlaying
            },
        ) {
            Icon(
                imageVector = if (isPlaying) Icons.Default.PauseCircle else Icons.Default.PlayCircle,
                contentDescription = null,
                modifier = Modifier.size(128.dp)
            )
        }

        Spacer(modifier = Modifier.padding(16.dp))

        OutlinedTextField(
            value = inputText,
            onValueChange = { inputText = it }
        )

        Spacer(modifier = Modifier.padding(16.dp))

        Slider(
            value = playbackSpeed,
            onValueChange = { playbackSpeed = it },
            valueRange = 0.5f..2f
        )
    }
}
