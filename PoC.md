# Inglyph MVP (Minimum Viable Product) Architecture

## Overview
InglyphアプリをMVP（Minimum Viable Product）レベルに仕上げるために必要なクラス・インターフェースの定義。
MVVM + Repository + UseCase アーキテクチャパターンに基づいて設計。

## MVP機能要件
1. 難易度選択の実装（現在TODO）
2. 基本的な学習履歴の保存
3. シンプルな結果表示
4. エラーハンドリングの改善
5. 基本的なオフライン対応（キャッシュ）

## Architecture Layers

### 1. View層（Compose UI）

#### 必要なコンポーネント
- **`DictationScreen`** (既存改善)
  - 難易度選択ドロップダウンの実装
  - 結果表示の改善
  
- **`HomeScreen`** (既存改善)
  - 最近の学習履歴表示追加
  - 学習統計のサマリー表示
  
- **`ResultDialog`** (新規)
  - ディクテーション結果をポップアップで表示
  - 正解率、所要時間、正解テキストの表示
  
- **`LoadingIndicator`** (新規)
  - 統一的なローディング表示コンポーネント
  
- **`ErrorMessage`** (新規)
  - エラー表示用の共通コンポーネント

### 2. ViewModel層

#### 必要なクラス
- **`DictationViewModel`** (既存拡張)
  - 結果履歴の一時保存機能追加
  - 難易度状態管理
  - 結果計算ロジックの統合
  
- **`HomeViewModel`** (新規)
  - 最近の学習履歴管理
  - 統計情報の集計
  
- **`DictationUiState`** (新規)
  ```kotlin
  data class DictationUiState(
      val currentSentence: Sentence? = null,
      val audioUrl: String? = null,
      val isLoading: Boolean = false,
      val error: String? = null,
      val selectedDifficulty: String = "A1",
      val lastResult: DictationResult? = null
  )
  ```
  
- **`HomeUiState`** (新規)
  ```kotlin
  data class HomeUiState(
      val recentHistory: List<DictationHistory> = emptyList(),
      val totalSessions: Int = 0,
      val averageAccuracy: Float = 0f,
      val isLoading: Boolean = false
  )
  ```

### 3. Repository層

#### インターフェース
- **`SentenceRepository`** (既存)
  - 現状のまま維持
  
- **`StorageRepository`** (既存)
  - 現状のまま維持
  
- **`DictationHistoryRepository`** (新規)
  ```kotlin
  interface DictationHistoryRepository {
      suspend fun saveResult(result: DictationResult)
      suspend fun getRecentHistory(limit: Int = 10): List<DictationHistory>
      suspend fun getTotalSessions(): Int
      suspend fun getAverageAccuracy(): Float
  }
  ```
  
- **`SettingsRepository`** (新規)
  ```kotlin
  interface SettingsRepository {
      suspend fun getSettings(): AppSettings
      suspend fun updateSettings(settings: AppSettings)
  }
  ```

#### 実装クラス
- **`LocalDictationHistoryRepository`**
  - ローカルストレージ（Room/SQLDelight）実装
  
- **`LocalSettingsRepository`**
  - SharedPreferences/DataStore実装

### 4. UseCase層

#### 必要なクラス
- **`GetRandomSentenceUseCase`** (既存)
  - 現状のまま維持
  
- **`GetPublicAudioUrlUseCase`** (既存)
  - 現状のまま維持
  
- **`SaveDictationResultUseCase`** (新規)
  ```kotlin
  class SaveDictationResultUseCase(
      private val repository: DictationHistoryRepository
  ) {
      suspend operator fun invoke(
          sentence: Sentence,
          userInput: String,
          accuracy: Float,
          duration: Long
      )
  }
  ```
  
- **`GetDictationHistoryUseCase`** (新規)
  ```kotlin
  class GetDictationHistoryUseCase(
      private val repository: DictationHistoryRepository
  ) {
      suspend operator fun invoke(limit: Int = 10): List<DictationHistory>
  }
  ```
  
- **`CalculateAccuracyUseCase`** (新規)
  ```kotlin
  class CalculateAccuracyUseCase {
      operator fun invoke(
          correctText: String,
          userInput: String
      ): Float
  }
  ```
  
- **`UpdateSettingsUseCase`** (新規)
  ```kotlin
  class UpdateSettingsUseCase(
      private val repository: SettingsRepository
  ) {
      suspend operator fun invoke(settings: AppSettings)
  }
  ```

### 5. Model層

#### データクラス
- **`Sentence`** (既存)
  - 現状のまま維持
  
- **`DictationResult`** (新規)
  ```kotlin
  @Serializable
  data class DictationResult(
      val sentenceId: String,
      val userInput: String,
      val correctText: String,
      val accuracy: Float,
      val duration: Long,
      val timestamp: Instant
  )
  ```
  
- **`DictationHistory`** (新規)
  ```kotlin
  @Serializable
  data class DictationHistory(
      val id: String,
      val sentenceText: String,
      val difficulty: String,
      val accuracy: Float,
      val duration: Long,
      val timestamp: Instant
  )
  ```
  
- **`AppSettings`** (新規)
  ```kotlin
  @Serializable
  data class AppSettings(
      val audioSpeed: Float = 1.0f,
      val autoPlay: Boolean = false,
      val showHints: Boolean = true,
      val selectedDifficulty: String = "A1"
  )
  ```
  
- **`DifficultyLevel`** (enum)
  ```kotlin
  enum class DifficultyLevel(val value: String) {
      A1("A1"),
      A2("A2"),
      B1("B1"),
      B2("B2"),
      C1("C1"),
      C2("C2")
  }
  ```

### 6. DI（依存性注入）

#### 更新が必要なモジュール
- **`AppModule`** (既存拡張)
  ```kotlin
  // 追加が必要な登録
  single<DictationHistoryRepository> { LocalDictationHistoryRepository() }
  single<SettingsRepository> { LocalSettingsRepository() }
  factory { SaveDictationResultUseCase(get()) }
  factory { GetDictationHistoryUseCase(get()) }
  factory { CalculateAccuracyUseCase() }
  factory { UpdateSettingsUseCase(get()) }
  viewModel { HomeViewModel(get()) }
  ```

## 実装優先順位

1. **Phase 1: Core Features**
   - DictationResult, DictationHistory モデルの作成
   - CalculateAccuracyUseCase の実装
   - ResultDialog の実装
   - DictationViewModel の拡張

2. **Phase 2: Data Persistence**
   - DictationHistoryRepository の実装
   - SaveDictationResultUseCase の実装
   - ローカルストレージの設定

3. **Phase 3: UI Enhancement**
   - HomeViewModel の実装
   - HomeScreen の改善
   - 難易度選択ドロップダウンの修正

4. **Phase 4: Settings & Polish**
   - SettingsRepository の実装
   - AppSettings の保存・読み込み
   - エラーハンドリングの改善
   - LoadingIndicator, ErrorMessage の統一

## 技術的な考慮事項

- **マルチプラットフォーム対応**: Kotlin Multiplatformの特性を活かし、共通コードは`commonMain`に配置
- **非同期処理**: Coroutinesを使用した非同期処理の実装
- **状態管理**: StateFlowを使用したリアクティブな状態管理
- **エラーハンドリング**: Result型やsealed classを使用した型安全なエラーハンドリング
- **テスタビリティ**: インターフェースを使用した疎結合な設計により、単体テストが容易