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
import io.github.cotrin8672.inglyph.presentation.viewmodel.DictationViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.jetbrains.compose.ui.tooling.preview.Preview
import org.koin.compose.koinInject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
@Preview
fun DictationScreen(viewModel: DictationViewModel = koinInject()) {
    val currentSentence by viewModel.currentSentence.collectAsState()
    val currentAudioUrl by viewModel.currentAudioUrl.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    var inputText by remember { mutableStateOf("") }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val audioPlayer = remember { createAudioPlayer() }
    var isPlaying by remember { mutableStateOf(false) }
    var playbackSpeed by remember { mutableFloatStateOf(1f) }

    // エラー発生時にSnackbarを表示
    LaunchedEffect(error) {
        error?.let { errorMessage ->
            snackbarHostState.showSnackbar(
                message = errorMessage,
                actionLabel = "Dismiss",
                duration = SnackbarDuration.Short,
                withDismissAction = false
            )
            viewModel.clearError()
        }
    }

    // 音声URLがロードされたら音声を準備
    LaunchedEffect(currentAudioUrl) {
        currentAudioUrl?.let { audioUrl ->
            audioPlayer.prepare(audioUrl)
            audioPlayer.setSpeed(playbackSpeed)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 難易度選択 (仮の実装)
            var selectedDifficulty by remember { mutableStateOf("A1") }
            val difficulties = listOf("A1", "A2", "B1", "B2", "C1")
            ExposedDropdownMenuBox(
                expanded = false, // TODO: ドロップダウンの展開状態を管理
                onExpandedChange = { /* TODO */ }
            ) {
                OutlinedTextField(
                    value = selectedDifficulty,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Difficulty") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = false) },
                    modifier = Modifier.menuAnchor()
                )
                ExposedDropdownMenu(
                    expanded = false, // TODO: ドロップダウンの展開状態を管理
                    onDismissRequest = { /* TODO */ }
                ) {
                    difficulties.forEach { difficulty ->
                        DropdownMenuItem(
                            text = { Text(difficulty) },
                            onClick = { selectedDifficulty = difficulty /* TODO: ドロップダウンを閉じる */ })
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 例文の表示
            if (isLoading) {
                CircularProgressIndicator()
            } else if (currentSentence != null) {
                Text(
                    text = currentSentence!!.text_en,
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = currentSentence!!.text_ja,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            } else {
                Text("Press 'Load Sentence' to get a new dictation.")
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 音声再生ボタン
            IconButton(
                onClick = {
                    scope.launch {
                        if (isPlaying) {
                            audioPlayer.pause()
                        } else {
                            audioPlayer.play()
                        }
                        isPlaying = !isPlaying
                    }
                },
                enabled = currentAudioUrl != null && !isLoading // 音声URLがある場合のみ有効
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.PauseCircle else Icons.Default.PlayCircle,
                    contentDescription = "Play/Pause Audio",
                    modifier = Modifier.size(64.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ディクテーション入力フィールド
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                label = { Text("Enter your dictation") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Done),
                keyboardActions = androidx.compose.foundation.text.KeyboardActions(onDone = {
                    // Enterキーで提出
                    checkAnswer(inputText, currentSentence?.text_en, scope, snackbarHostState)
                }),
                trailingIcon = {
                    IconButton(
                        onClick = {
                            checkAnswer(inputText, currentSentence?.text_en, scope, snackbarHostState)
                        }
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Submit")
                    }
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 次の例文をロードするボタン
            Button(onClick = { viewModel.fetchNewSentence(selectedDifficulty) }, enabled = !isLoading) {
                Text("Load New Sentence")
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 再生速度スライダー (コメントアウト)
//            Slider(
//                value = playbackSpeed,
//                onValueChange = { playbackSpeed = it },
//                valueRange = 0.5f..2f
//            )
        }
    }
}

private fun checkAnswer(
    inputText: String,
    correctAnswer: String?,
    scope: CoroutineScope,
    snackbarHostState: SnackbarHostState,
) {
    if (correctAnswer == null) {
        scope.launch {
            snackbarHostState.showSnackbar(
                message = "No sentence loaded yet.",
                duration = SnackbarDuration.Short
            )
        }
        return
    }

    val isCorrect = inputText.trim().equals(correctAnswer.trim(), ignoreCase = true)

    scope.launch {
        snackbarHostState.showSnackbar(
            message = if (isCorrect) "Correct!" else "Incorrect. Try again.",
            duration = SnackbarDuration.Short,
            withDismissAction = false
        )
    }
}
