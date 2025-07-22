# Inglyph プロジェクト構造

## ルートディレクトリ構成

```
Inglyph/
├── composeApp/           # Kotlin Multiplatformアプリモジュール
├── supabase/            # バックエンドエッジ関数
├── gradle/              # Gradleラッパーと設定
├── .gradle/             # Gradleキャッシュ (git無視)
├── build/               # ビルド出力 (git無視)
├── .kiro/               # Kiro spec-driven development ファイル
├── build.gradle.kts     # ルートビルド設定
├── settings.gradle.kts  # Gradle設定
├── gradle.properties    # Gradleプロパティ
└── local.properties     # ローカル環境設定 (git無視)
```

## サブディレクトリ構造

### composeApp/ - マルチプラットフォームアプリケーション

```
composeApp/
├── src/
│   ├── commonMain/      # すべてのプラットフォーム共通コード
│   │   └── kotlin/io/github/cotrin8672/inglyph/
│   │       ├── compose/         # UIコンポーネント
│   │       │   ├── App.kt
│   │       │   └── screen/      # 画面コンポーザブル
│   │       ├── data/           # データ層
│   │       │   ├── model/      # データモデル
│   │       │   └── repository/ # リポジトリ実装
│   │       ├── di/             # 依存性注入
│   │       ├── domain/         # ビジネスロジック
│   │       │   └── usecase/    # ユースケース
│   │       ├── platform/       # プラットフォーム固有インターフェース
│   │       └── presentation/   # プレゼンテーション層
│   │           └── viewmodel/  # ビューモデル
│   ├── androidMain/    # Android固有コード
│   ├── desktopMain/    # デスクトップ固有コード
│   └── wasmJsMain/     # Web固有コード (追加時)
└── build.gradle.kts    # モジュールビルド設定
```

### supabase/functions/ - エッジ関数

```
supabase/functions/
├── generate-sentence-with-audio/  # メイン文章生成
├── generate-text-and-save/       # テキスト生成のみ
├── synthesize-audio-and-save/    # 音声合成のみ
├── get-random-sentence/          # レガシーエンドポイント
└── get-random-sentence-optimized/
```

### .kiro/ - Spec-Driven Development

```
.kiro/
├── steering/           # プロジェクトステアリングドキュメント
│   ├── product.md     # プロダクト概要
│   ├── tech.md        # 技術スタック
│   └── structure.md   # このファイル
└── specs/             # 機能仕様
    └── [feature-name]/
        ├── spec.json        # 仕様メタデータ
        ├── requirements.md  # ビジネス要件
        ├── design.md       # 技術設計
        └── tasks.md        # 実装タスク
```

## コード組織パターン

### MVVM + Repository + UseCase アーキテクチャ

#### 1. **View層** (`compose/screen/`)
   - **責務**: UI表示とユーザーインタラクション
   - **実装**: Composable関数
   - **依存**: ViewModelのみに依存
   - **例**: `DictationScreen.kt`, `HomeScreen.kt`

#### 2. **ViewModel層** (`presentation/viewmodel/`)
   - **責務**: UI状態管理とプレゼンテーションロジック
   - **実装**: ViewModelクラス + UiStateデータクラス
   - **依存**: UseCaseのみに依存
   - **状態管理**: StateFlow + MutableStateFlow
   - **例**: `DictationViewModel.kt` + `DictationUiState`

#### 3. **UseCase層** (`domain/usecase/`)
   - **責務**: ビジネスロジックの実装
   - **実装**: 単一責任の実行可能クラス
   - **依存**: Repositoryインターフェースのみに依存
   - **特徴**: 
     - 純粋なKotlinコード（プラットフォーム非依存）
     - suspend関数として実装
     - 単一のpublicメソッド（invoke）
   - **例**: `GetRandomSentenceUseCase.kt`, `CalculateAccuracyUseCase.kt`

#### 4. **Repository層** (`data/repository/`)
   - **インターフェース**: `data/repository/`にインターフェース定義
   - **実装**: 同じパッケージに具象クラス
   - **責務**: データソースの抽象化
   - **機能**:
     - ローカル/リモートデータソースの切り替え
     - キャッシュ戦略の実装
     - データ変換（Entity ↔ Model）
   - **例**: `SentenceRepository.kt` (インターフェース) + `SupabaseSentenceRepository.kt` (実装)

#### 5. **Model層** (`data/model/`)
   - **責務**: データ構造の定義
   - **実装**: `@Serializable`データクラス
   - **種類**:
     - API Request/Response モデル
     - ドメインモデル
     - UI表示用モデル
   - **例**: `Sentence.kt`, `GetRandomSentenceRequest.kt`

### 依存関係の方向

```
View → ViewModel → UseCase → Repository Interface
                                    ↑
                                    |
                            Repository Implementation → Data Source
```

### パッケージ構成の詳細

```
kotlin/io/github/cotrin8672/inglyph/
├── compose/              # View層
│   ├── App.kt           # アプリケーションルート
│   └── screen/          # 各画面のComposable
├── presentation/        # ViewModel層
│   └── viewmodel/       # ViewModelとUiState
├── domain/              # ビジネスロジック層
│   └── usecase/         # 各種UseCase
├── data/                # データ層
│   ├── model/           # データモデル定義
│   └── repository/      # Repositoryインターフェースと実装
├── di/                  # 依存性注入設定
└── platform/            # プラットフォーム固有実装
```

### プラットフォーム固有コード

- **共通インターフェース**: `commonMain/platform/`で定義
- **プラットフォーム実装**: プラットフォーム固有のソースセットで実装
- **例**: Android/デスクトップ実装を持つAudioPlayerインターフェース

## ファイル命名規則

### Kotlinファイル
- **クラス/インターフェース**: PascalCase (例: `DictationViewModel.kt`)
- **ユースケース**: [アクション][エンティティ]UseCase (例: `GetRandomSentenceUseCase.kt`)
- **リポジトリ**: [エンティティ]Repository (例: `SentenceRepository.kt`)
- **モデル**: 単数名詞 (例: `Sentence.kt`)
- **画面**: [名前]Screen (例: `HomeScreen.kt`)

### エッジ関数
- **ディレクトリ**: kebab-case (例: `generate-sentence-with-audio/`)
- **エントリーポイント**: 常に `index.ts`

### リソース
- **Composeリソース**: 小文字とアンダースコア
- **Androidリソース**: Android規約に従う

## インポート組織

標準インポート順序 (IDEによって強制):
1. Kotlin標準ライブラリ
2. Java/JVMインポート
3. Androidインポート (Androidのみ)
4. サードパーティライブラリ
5. プロジェクトインポート

例:
```kotlin
import kotlin.coroutines.*
import java.util.*
import androidx.compose.runtime.*
import io.ktor.client.*
import io.github.cotrin8672.inglyph.domain.usecase.*
```

## 主要なアーキテクチャ原則

### MVVM + Repository + UseCase の原則

1. **単方向データフロー**: View → ViewModel → UseCase → Repository の一方向の依存関係
2. **レイヤー間の厳密な境界**: 各レイヤーは下位レイヤーのインターフェースのみに依存
3. **依存性の逆転 (DIP)**: 上位レイヤーは下位レイヤーの抽象に依存、具象実装には依存しない
4. **単一責任の原則 (SRP)**:
   - View: UI表示のみ
   - ViewModel: UI状態管理のみ
   - UseCase: 単一のビジネスロジックのみ
   - Repository: データアクセスの抽象化のみ
5. **インターフェース分離**: Repositoryは必要最小限のメソッドのみを公開
6. **テスタビリティ**:
   - ViewModelはUseCaseのモックでテスト可能
   - UseCaseはRepositoryのモックでテスト可能
   - 各レイヤーが独立してテスト可能
7. **リアクティブプログラミング**: StateFlowによる状態の監視と自動UI更新
8. **非同期処理の統一**: すべての非同期操作はKotlin Coroutinesで実装

### アーキテクチャ上の制約

- ViewはViewModelのみを知る（UseCaseやRepositoryを直接参照しない）
- ViewModelはドメイン層（UseCase）のみを知る（データ層を直接参照しない）
- UseCaseは他のUseCaseに依存しない（必要なら新しいUseCaseを作成）
- Repositoryの実装詳細（Supabase、Ktorなど）は上位レイヤーから隠蔽
- プラットフォーム固有コードは`platform`パッケージに隔離