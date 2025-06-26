package io.github.cotrin8672.inglyph.compose.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import io.github.cotrin8672.inglyph.DictationPractice
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun HomeScreen(navHostController: NavHostController) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        Text(
            text = "Inglyph",
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.displayLarge,
        )
        Spacer(modifier = Modifier.padding(16.dp))
        Text(
            text = "Dictation Practice",
            style = MaterialTheme.typography.headlineSmall,
        )
        Button(
            onClick = { navHostController.navigate(DictationPractice) }
        ) {
            Text(
                text = "Start Dictation",
            )
        }
    }
}
