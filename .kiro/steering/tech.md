# Inglyph 技術スタック

## アーキテクチャ

### MVVM + Repository + UseCase パターン

- **全体的なパターン**: MVVM + Repository + UseCase による厳密なレイヤー分離
- **システム設計**: Kotlin Multiplatformフロントエンドとsupabaseバックエンドによるクライアント・サーバーアーキテクチャ

### レイヤー構成

1. **View Layer (Compose UI)**
   - Composable関数によるUI定義
   - ViewModelの状態を観察し、UIを更新
   - ユーザーイベントをViewModelに委譲

2. **ViewModel Layer (Presentation)**
   - UIの状態管理 (StateFlow)
   - UseCaseを呼び出してビジネスロジックを実行
   - UIイベントの処理とUI状態の更新

3. **UseCase Layer (Domain)**
   - 単一責任のビジネスロジック
   - Repositoryを組み合わせて複雑な処理を実現
   - プラットフォーム非依存の純粋なKotlinコード

4. **Repository Layer (Data)**
   - データソースの抽象化
   - ローカル/リモートデータソースの統合
   - データのキャッシュ戦略

5. **Data Source (Infrastructure)**
   - Ktor Clientによる API通信
   - Supabase SDK統合
   - ローカルストレージ実装

### 状態管理とデータフロー

- **単方向データフロー**: View → ViewModel → UseCase → Repository → DataSource
- **状態管理**: StateFlowとCoroutinesによるリアクティブな状態管理
- **エラーハンドリング**: Result型による型安全なエラー処理
- **依存性注入**: Koinによるマルチプラットフォーム対応DI

## フロントエンド

### Kotlin Multiplatform
- **言語**: Kotlin
- **UIフレームワーク**: Compose Multiplatform
- **プラットフォーム**: 
  - Android (ネイティブ)
  - Desktop (JVM)
  - Web (Kotlin/JS + Wasm)
- **ナビゲーション**: Jetpack Navigation Compose

### 主要ライブラリ
- **HTTPクライアント**: Ktor Client
- **シリアライゼーション**: Kotlinx Serialization
- **DIコンテナ**: Koin
- **非同期/コルーチン**: Kotlinx Coroutines
- **UIコンポーネント**: Material3デザインシステム

## バックエンド

### Supabaseサービス
- **データベース**: PostgreSQL (Supabase経由)
- **認証**: Supabase Auth (実装時)
- **ストレージ**: 音声ファイル用のSupabase Storage
- **エッジ関数**: Denoベースのサーバーレス関数

### 外部API
- **テキスト生成**: Google Gemini API (gemini-2.0-flash)
- **テキスト読み上げ**: Google Cloud Text-to-Speech API
- **言語**: 英語 (米国、英国、豪州) 音声

## 開発環境

### ビルドツール
- **ビルドシステム**: Gradle 8.9
- **Kotlinバージョン**: libs.versions.tomlを確認
- **Javaバージョン**: JDK 17以上が必要

### IDE
- **主要**: IntelliJ IDEA または Android Studio
- **Kotlinプラグイン**: 最新の安定版

## 一般的なコマンド

```bash
# Androidアプリの実行
./gradlew :composeApp:assembleDebug

# デスクトップアプリの実行
./gradlew :composeApp:run

# Webアプリの実行 (開発)
./gradlew :composeApp:wasmJsBrowserDevelopmentRun

# すべてのプラットフォームのビルド
./gradlew build

# クリーンビルド
./gradlew clean

# テストの実行
./gradlew test
```

## 環境変数

### エッジ関数に必要なもの
- `SUPABASE_URL`: SupabaseプロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: 管理者アクセス用のサービスロールキー
- `GEMINI_API_KEY`: Google Gemini APIキー
- `GOOGLE_CLOUD_API_KEY`: TTS用のGoogle Cloud APIキー

### ローカル開発
- `local.properties`で設定 (Git無視)
- またはシステム環境変数として設定

## ポート設定

- **Web開発サーバー**: 8080 (デフォルト)
- **Supabaseローカル**: 54321 (ローカルSupabase使用時)
- **デスクトップアプリ**: 特定のポートなし (ネイティブアプリケーション)