package io.github.cotrin8672.inglyph.compose

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import io.github.cotrin8672.inglyph.DictationPractice
import io.github.cotrin8672.inglyph.Home
import io.github.cotrin8672.inglyph.compose.screen.DictationScreen
import io.github.cotrin8672.inglyph.compose.screen.HomeScreen
import io.github.cotrin8672.inglyph.di.appModule
import org.jetbrains.compose.ui.tooling.preview.Preview
import org.koin.compose.KoinApplication

@Composable
@Preview
fun App() {
    KoinApplication(application = { modules(appModule) }) {
        val navController = rememberNavController()
        val canNavigateBack by remember {
            derivedStateOf { navController.previousBackStackEntry != null }
        }

        MaterialTheme {
            Scaffold(
                topBar = {
                    if (canNavigateBack) {
                        TopBar { navController.popBackStack() }
                    }
                }
            ) { padding ->
                Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(padding)) {
                    // AppNavHost(navController)
                    // DictationScreenを直接表示
                    DictationScreen()
                }
            }
        }
    }
}

@Preview
@Composable
fun AppNavHost(
    navHostController: NavHostController = rememberNavController(),
) {
    NavHost(
        navController = navHostController,
        startDestination = Home,
    ) {
        composable<Home> { HomeScreen(navHostController) }

        composable<DictationPractice> { DictationScreen() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
fun TopBar(onBack: () -> Unit = {}) {
    TopAppBar(
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
            }
        },
        title = {}
    )
}
