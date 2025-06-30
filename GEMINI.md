# AIエージェント.md

## 1. 概要

- **アプリ名**: Inglyph
- **目的**: 英語のリスニング力とタイピング力を同時に鍛える
- **対象プラットフォーム**: Android, Desktop (Compose Multiplatform)

## 2. 技術スタック

- **言語**: Kotlin Multiplatform
- **UI フレームワーク**: Compose Multiplatform
    - Android
    - Desktop (Desktop Compose)
- **バックエンド**: Supabase
    - Database (PostgreSQL)
    - Storage (音声ファイル管理)
- **依存注入**: Koin
- **ナビゲーション**: Compose Navigation (TypesafeNavigation)
- **状態管理**: ViewModel + StateFlow
- **テスト**: Kotlin.test + MockK, CI (GitHub Actions)

## 3. アーキテクチャ

- **アーキテクチャ**: MVVM + Repository + UseCase を採用
- **DI フレームワーク**: Koin を採用

| 層          | 使用ライブラリ                                 | 粒度・抽象度                                       |
|------------|-----------------------------------------|----------------------------------------------|
| Model      | Kotlin data class                       | 純粋なデータ表現に限定。バリデーションは最低限、変換ロジックは含まない。         |
| View       | Compose Multiplatform                   | 宣言型 UI の定義に集中。状態やイベント処理は ViewModel に委譲。      |
| ViewModel  | lifecycle-viewmodel-compose + StateFlow | UI 状態管理とイベント窓口。UseCase 呼び出しのみを担当し、副作用処理は最小化。 |
| Repository | Supabase Kotlin Client                  | データ取得・永続化の抽象化に特化。ビジネスロジックは含めず、純粋な I/O レイヤー。  |
| UseCase    | 単一責任クラス (e.g., FetchSentenceUseCase)    | 各ユースケースごとのビジネスロジックに集中。副作用管理と結果の返却を担う。        | ## 4. データ設計 |

### Supabase Storage

- 音声ファイル (.mp3)
- パス設計: `<sentence.id>.mp3` （ファイル名にデータベースの UUID をそのまま使用）

### Supabase Database

- **Table: sentence**

  | カラム名   | 型       | 説明                                   |
      | ---------- | -------- | -------------------------------------- |
  | id         | UUID     | プライマリキー                         |
  | text_en    | Text     | 英文                                   |
  | text_ja    | Text     | 日本語訳                               |
  | difficulty | Text     | CEFRレベル (A1, A2, B1, B2, C1) を格納 |
  | created_at | DateTime | レコード作成日時                       |

## 5. Difficulty設計

- **CEFRベース**: A1～C1 の5段階
- **運用方法**: sentencesテーブルの difficulty カラムに対応するCEFRレベルを文字列で保持

| CEFR | 概要           | 目安単語数 | 主な文法/語彙特徴      |
|------|--------------|-------|----------------|
| A1   | 基本的な表現       | ～5    | 単文、現在形         |
| A2   | 日常的な表現の理解と使用 | 6～10  | 過去形、進行形        |
| B1   | 複雑な文の理解      | 11～15 | 従属節、比較級、現在完了形  |
| B2   | 幅広いトピックに対応   | 16～20 | 関係代名詞、受動態      |
| C1   | 高度な学術・専門的内容  | 20以上  | 仮定法、間接話法、複雑な構造 |

## 6. UI/UX フロー

1. **ホーム画面**
    - 練習開始ボタン
    - 難易度選択ドロップダウン
2. **ディクテーション画面**
    - 英語音声再生 (連続再生機能)
    - テキスト入力フィールド
    - 提出ボタン
    - フィードバック表示（80%以上の一致で合格）
    - 「次へ」ボタン or 自動連続モード
3. **結果画面 (任意)**
    - 正解率表示
    - 間違えた箇所のハイライト

## 7. テスト戦略

- **Unit Test**
    - UseCase 単体テスト (Kotlin.test + MockK)
    - Repository のモックテスト
- **CI パイプライン**
    - GitHub Actions でビルド & テスト自動化
- **カバレッジ**
    - 主要ロジックは 80%以上を目標
