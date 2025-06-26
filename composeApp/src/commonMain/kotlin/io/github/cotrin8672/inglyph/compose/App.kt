package io.github.cotrin8672.inglyph.compose

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.compose.currentBackStackEntryAsState
import io.github.cotrin8672.inglyph.DictationPractice
import io.github.cotrin8672.inglyph.Home
import io.github.cotrin8672.inglyph.compose.screen.DictationScreen
import io.github.cotrin8672.inglyph.compose.screen.HomeScreen
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val canNavigateBack = navController.previousBackStackEntry != null

    MaterialTheme {
        Scaffold(
            topBar = {
                if (canNavigateBack) {
                    TopBar { navController.popBackStack() }
                }
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding)) {
                AppNavHost(navController)
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
        composable<Home> {
            HomeScreen(navHostController)
        }

        composable<DictationPractice> {
            DictationScreen()
        }
    }
}

@Preview
@Composable
fun TopBar(onBack: () -> Unit = {}) {
    CenterAlignedTopAppBar(
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back"
                )
            }
        },
        title = {}
    )
}
