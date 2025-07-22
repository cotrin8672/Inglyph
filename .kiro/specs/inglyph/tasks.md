# Implementation Plan (TDD Approach)

## 開発手法: テストファースト開発（TDD）

各機能の実装は以下の TDD サイクルに従います：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善（テストは通ったまま）

- [ ] 1. プロジェクト設定とテスト環境構築

  - 必要な依存関係を [build.gradle.kts] に追加（SQLDelight、multiplatform-settings、テストライブラリ）
  - テストライブラリの設定（Kotlin Test、MockK、Turbine）
  - データベース設定とマイグレーションファイルの準備
  - Koin モジュールの拡張準備
  - _要件: 全体的な基盤_

- [ ] 2. データモデルとデータベース層の TDD 実装
- [ ] 2.1 データモデルのテストと実装

  - [ ] DictationResult データクラスのテスト作成
  - [ ] DictationResult データクラスの実装
  - [ ] DictationHistory データクラスのテスト作成
  - [ ] DictationHistory データクラスの実装
  - [ ] AppSettings データクラスのテスト作成
  - [ ] AppSettings データクラスの実装
  - [ ] DifficultyLevel enum のテスト作成
  - [ ] DifficultyLevel enum の実装
  - [ ] DiffSegment sealed class のテスト作成
  - [ ] DiffSegment sealed class の実装
  - _要件: 2, 3, 7_

- [ ] 2.2 SQLDelight スキーマとクエリの TDD 実装

  - [ ] dictation_history テーブルのスキーマテスト作成
  - [ ] dictation_history テーブルのスキーマ定義
  - [ ] cached_audio テーブルのスキーマテスト作成
  - [ ] cached_audio テーブルのスキーマ定義
  - [ ] CRUD クエリのテスト作成
  - [ ] 基本的な CRUD クエリの実装
  - _要件: 2, 6_

- [ ] 3. Repository 層の TDD 実装
- [ ] 3.1 DictationHistoryRepository の TDD 実装

  - [ ] DictationHistoryRepository インターフェースのテスト作成
  - [ ] DictationHistoryRepository インターフェース定義
  - [ ] LocalDictationHistoryRepository の単体テスト作成
  - [ ] LocalDictationHistoryRepository の [SQLDelight] 実装
  - [ ] 履歴自動削除ロジックのテスト作成（1000 件超過時）
  - [ ] 履歴自動削除ロジックの実装
  - _要件: 2, 4_

- [ ] 3.2 SettingsRepository の TDD 実装

  - [ ] SettingsRepository インターフェースのテスト作成
  - [ ] SettingsRepository インターフェース定義
  - [ ] LocalSettingsRepository の単体テスト作成
  - [ ] LocalSettingsRepository の [multiplatform-settings] 実装
  - [ ] デフォルト値とエラーハンドリングのテスト作成
  - [ ] デフォルト値とエラーハンドリングの実装
  - _要件: 1, 7_

- [ ] 3.3 AudioCacheRepository の TDD 実装

  - [ ] AudioCacheRepository インターフェースのテスト作成
  - [ ] オーディオファイルのキャッシュ管理インターフェース定義
  - [ ] LRU キャッシュロジックのテスト作成（最大 50 ファイル）
  - [ ] ファイルベースのキャッシュ実装
  - [ ] キャッシュ存在チェックとクリーンアップのテスト作成
  - [ ] キャッシュ存在チェックとクリーンアップの実装
  - _要件: 6_

- [ ] 4. UseCase 層の TDD 実装
- [ ] 4.1 CalculateAccuracyUseCase と CalculateDiffUseCase の TDD 実装

  - [ ] CalculateAccuracyUseCase のテスト作成（各種入力パターン）
  - [ ] CalculateAccuracyUseCase の実装
  - [ ] CalculateDiffUseCase のテスト作成（Myers' algorithm の動作検証）
  - [ ] Myers' diff algorithm ベースの差分計算実装
  - [ ] 正解率計算ロジックの境界値テスト作成
  - [ ] 正解率計算ロジックの実装
  - _要件: 3_

- [ ] 4.2 SaveDictationResultUseCase の TDD 実装

  - [ ] SaveDictationResultUseCase のテスト作成（正常系）
  - [ ] SaveDictationResultUseCase のテスト作成（異常系）
  - [ ] 結果保存時のタイムスタンプ生成実装
  - [ ] データ変換とバリデーションのテスト作成
  - [ ] データ変換とバリデーションの実装
  - [ ] エラーハンドリングのテスト作成
  - [ ] エラーハンドリングの実装
  - _要件: 2_

- [ ] 4.3 統計関連 UseCase の TDD 実装

  - [ ] GetDictationHistoryUseCase のテスト作成
  - [ ] GetDictationHistoryUseCase の実装
  - [ ] GetDictationStatsUseCase のテスト作成（統計計算検証）
  - [ ] GetDictationStatsUseCase の実装
  - [ ] UpdateSettingsUseCase のテスト作成
  - [ ] UpdateSettingsUseCase の実装
  - _要件: 4, 7_

- [ ] 5. ViewModel 層の TDD 更新と作成
- [ ] 5.1 DictationViewModel の TDD 拡張

  - [ ] DictationUiState のテスト作成（状態遷移検証）
  - [ ] DictationUiState の実装
  - [ ] 難易度変更ロジックのテスト作成（Turbine 使用）
  - [ ] 難易度変更ロジックの実装
  - [ ] 結果計算と保存フローの統合テスト作成
  - [ ] 結果計算と保存のフロー統合実装
  - [ ] キーボードショートカットハンドリングのテスト作成
  - [ ] キーボードショートカットハンドリングの実装（デスクトップ）
  - _要件: 1, 3, 8_

- [ ] 5.2 HomeViewModel の TDD 新規作成

  - [ ] HomeUiState のテスト作成
  - [ ] HomeUiState の実装
  - [ ] 履歴取得ロジックのテスト作成（モックデータ使用）
  - [ ] 統計データ表示ロジックのテスト作成
  - [ ] 履歴と統計データの取得・表示ロジック実装
  - [ ] オフライン時の表示対応テスト作成
  - [ ] オフライン時の表示対応実装
  - _要件: 2, 4, 6_

- [ ] 6. UI コンポーネントの TDD 実装
- [ ] 6.1 難易度選択とフィードバック UI の TDD 実装

  - [ ] DifficultySelector のスナップショットテスト作成
  - [ ] DifficultySelector のインタラクションテスト作成
  - [ ] DifficultySelector コンポーネント実装（セグメントコントロール風）
  - [ ] SnackbarController の単体テスト作成
  - [ ] SnackbarController の実装とグローバル統合
  - [ ] メッセージ表示ロジックのテスト作成（各種タイプ）
  - [ ] エラー/成功/情報メッセージの表示ロジック実装
  - _要件: 1, 5_

- [ ] 6.2 結果表示コンポーネントの TDD 実装

  - [ ] DiffTextComparator のスナップショットテスト作成
  - [ ] DiffTextComparator の差分表示テスト作成
  - [ ] DiffTextComparator の実装（Git diff 形式表示）
  - [ ] ResultDialog の UI 統合テスト作成
  - [ ] ResultDialog の実装（詳細結果表示）
  - [ ] 色分けとアニメーションのテスト作成
  - [ ] 色分けとアニメーション実装
  - _要件: 3_

- [ ] 6.3 画面の TDD 更新

  - [ ] DictationScreen の統合テスト作成
  - [ ] DictationScreen への新コンポーネント統合
  - [ ] HomeScreen の統合テスト作成
  - [ ] HomeScreen への履歴・統計表示追加
  - [ ] レスポンシブデザインのテスト作成
  - [ ] レスポンシブデザインの調整実装
  - _要件: 2, 4_

- [ ] 7. プラットフォーム固有実装の TDD
- [ ] 7.1 オーディオプレイヤーの TDD 実装

  - [ ] AudioPlayer インターフェースのテスト作成
  - [ ] AudioPlayer expect/actual クラスの作成
  - [ ] Android AudioPlayer の単体テスト作成
  - [ ] Android 実装（[MediaPlayer]）
  - [ ] Desktop AudioPlayer の単体テスト作成
  - [ ] Desktop 実装（[JavaFX MediaPlayer]）
  - [ ] 速度調整機能のテスト作成（各プラットフォーム）
  - [ ] 速度調整機能の実装
  - _要件: 全般_

- [ ] 7.2 デスクトップ版キーボードハンドラーの TDD 実装

  - [ ] KeyboardHandler インターフェースのテスト作成
  - [ ] KeyboardHandler の expect/actual 実装
  - [ ] キーイベントリスナーのテスト作成
  - [ ] キーイベントリスナーの設定実装
  - [ ] ショートカットヒント表示のテスト作成
  - [ ] ショートカットヒント表示の実装
  - _要件: 8_

- [ ] 8. 統合テストとリファクタリング
- [ ] 8.1 統合テストスイートの構築

  - [ ] テストカバレッジツールの設定（Kover）
  - [ ] UseCase 層の統合テスト強化
  - [ ] ViewModel の統合テスト強化
  - [ ] Repository 層の統合テスト強化
  - [ ] カバレッジ目標: 80%以上
  - _要件: 全要件のテストカバレッジ_

- [ ] 8.2 E2E テストの実装

  - [ ] ディクテーション提出フロー全体の E2E テスト作成
  - [ ] ディクテーション提出フロー全体の動作確認
  - [ ] オフライン動作の E2E テスト作成
  - [ ] オフライン動作の動作確認
  - [ ] キーボードショートカットの E2E テスト作成（デスクトップ）
  - [ ] キーボードショートカットの動作確認
  - _要件: 3, 6, 8_

- [ ] 8.3 最終リファクタリングと品質保証
  - [ ] コードレビューとリファクタリング
  - [ ] パフォーマンステスト実施
  - [ ] アクセシビリティテスト実施
  - [ ] ドキュメント更新（README、アーキテクチャ図）
  - _要件: 全体的な品質保証_

## TDD 実装のガイドライン

### 各タスクの実施手順

1. **テスト作成**: まず失敗するテストを書く（Red）
2. **最小実装**: テストを通す最小限のコードを書く（Green）
3. **リファクタリング**: コードを改善する（Refactor）

### テスト種別

- **単体テスト**: 各クラス・関数の動作検証
- **統合テスト**: 複数コンポーネントの連携検証
- **E2E テスト**: ユーザーシナリオ全体の検証
- **スナップショットテスト**: UI 表示の回帰検証

### テストツール

- **Kotlin Test**: 基本的なアサーション
- **MockK**: モック作成
- **Turbine**: Flow/StateFlow のテスト
- **Compose Testing**: UI テスト
- **Kover**: カバレッジ測定

## 進捗状況

- 作成日: 2025-01-21T15:40:00Z
- 更新日: 2025-01-22T00:00:00Z
- ステータス: TDD 実装準備完了
- 総タスク数: 約 150（テストタスク含む）
- 完了: 0
- 残り: 約 150
