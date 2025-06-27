# Inglyph — Compose Multiplatform Architecture (rev B)

---

## 1 │ Guiding Principles

1. **Single‑state rendering**– every screen is a pure function of a `StateFlow<ScreenState>` held by the official CMP
   `ViewModel`.
2. **Pure domain logic**– Use‑case classes contain no framework code; they depend only on Kotlin and repository
   interfaces.
3. **Platform isolation**– anything that touches network, storage, or OS APIs lives in `actual` implementations; the
   rest is shared.
4. **Dependency inversion via Koin 4.0.3**– wiring is declared once and injected everywhere (including preview & tests).

---

## 2 │ Layer Responsibilities & Recommended Tech

| Layer                    | Granularity & Artifact                               | Libraries / Lang features                                                | Notes                                                                                                                |
|--------------------------|------------------------------------------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **Screen (UI)**          | one Composable file per screen                       | **Compose Material3\*\*\*\*androidx.navigation.compose (MPP)**           | No business logic. Collects `ScreenState` via `collectAsState()`. Navigation handled by official Compose Navigation. |
| **ViewModel**            | 1 class per screen                                   | **org.jetbrains.compose.viewmodel** (CMP official)**kotlinx.coroutines** | Holds `MutableStateFlow<ScreenState>` and exposes read‑only `StateFlow`. Accepts **Action** objects (user intents).  |
| **Use‑case**             | 1 Kotlin class per operation (e.g. *ScoreDictation*) | Pure Kotlin + Coroutines                                                 | `operator fun invoke(params…): Result` – stateless, injectable.                                                      |
| **Repository interface** | grouped by bounded context                           | Kotlin `interface` (no libs)                                             | Abstract contract for data access.                                                                                   |
| **Repository impl**      | 1 per platform                                       | **Ktor Client** (remote)**SQLDelight / LocalStorage** (local)            | Declared as `expect class` in `commonMain`, realised in platform sources.                                            |
| **DataSource**           | fine‑grained helpers                                 | same as repo impl                                                        | Raw HTTP, DB, key‑value, etc., no mapping logic.                                                                     |
| **DI**                   | one Koin module per source‑set                       | **Koin 4.0.3**                                                           | `module { viewModel { … } single { … } }`.                                                                           |

---

## 3 │ Data / Event Flow (textual)

- **Action → ViewModel**: UI sends an `Action` object (click, text change).
- **ViewModel**: processes the Action, invokes one or more *Use‑cases*, and updates a \`\`.
- **State → UI**: each screen collects the `StateFlow<ScreenState>` via `collectAsState()` and recomposes.
- **Use‑case → Repository**: Use‑cases depend on repository **interfaces** only.
- **Repository → DataSource**: platform‑specific implementations delegate raw I/O to Remote / Local DataSources.

---

## 4 │ Navigation – Type-safe Destinations

```kotlin
// Define destinations as @Serializable objects or data classes when parameters needed
@Serializable
object HomeDestination

@Serializable
object DictationDestination

@Serializable
data class SettingsDestination(val userId: String)

@Composable
fun AppContent() {
    val navController: NavHostController = rememberNavController()

    NavHost(
        controller = navController,
        startDestination = HomeDestination
    ) {
        composable(HomeDestination) {
            HomeScreen(navController)
        }

        composable(DictationDestination) {
            DictationScreen(navController)
        }

        composable(SettingsDestination) { dest ->
            SettingsScreen(navController, dest.userId)
        }
    }
}
```

- Routes are represented by the object or data class instance itself, without raw strings.
- `NavHostController` drives all navigation actions.
- **Web/Wasm**: call `navController.enableWebHistory()` to bind browser history.
- **Android/Desktop**: use `BackHandler { navController.popBackStack() }` for hardware Back or Escape.

---

### Key Points Recap

- **Official CMP ViewModel** + **StateFlow** keep lifecycle & preview working everywhere.
- **Koin 4.0.3** with `KoinApplication` wrapper gives one‑liner DI on all targets.
- **Compose‑Navigation (MPP)** handles back stack; no Decompose required.
- **Use‑cases** remain plain Kotlin → easiest to unit‑test and reuse.

