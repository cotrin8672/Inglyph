# Requirements Specification

## 概要

Inglyph アプリを MVP レベルに引き上げるための機能強化要件。ユーザーの学習体験を向上させ、進捗を可視化し、オフライン環境でも基本的な学習を可能にする。

## 要件

### 要件 1: 難易度選択機能

**ユーザーストーリー:** 英語学習者として、私は学習中いつでも難易度を調整したい。これにより、その時の調子に合わせて適切なレベルで練習できる。

#### 受け入れ条件

1. WHEN ディクテーション画面を開いた時 THEN 前回最後に使用した難易度が自動的に選択されている
2. WHEN ディクテーション中 THEN 難易度選択 UI（ボタン群またはセグメントコントロール）が常に表示され、いつでも変更可能
3. WHEN 難易度を変更した時 THEN 即座に新しい難易度レベルに応じた文章が生成される
4. WHEN アプリを再起動した時 THEN 最後に使用した難易度が復元される
5. IF ネットワークエラーが発生した場合 THEN Snackbar でエラーメッセージが表示され、現在の難易度設定が保持される

### 要件 2: 学習履歴の保存と表示

**ユーザーストーリー:** 英語学習者として、私は自分の学習履歴を確認したい。これにより、学習の進捗と改善点を把握できる。

#### 受け入れ条件

1. WHEN ディクテーションを完了した時 THEN 結果（正解率、所要時間、難易度）がローカルに保存される
2. WHEN ホーム画面を開いた時 THEN 最近の学習履歴（最大 10 件）が新しい順に表示される
3. WHEN 学習履歴項目をタップした時 THEN その詳細（文章、ユーザー入力、正解率）が表示される
4. IF ローカルストレージが満杯の場合 THEN 古い履歴から自動的に削除される

### 要件 3: ディクテーション結果の詳細表示

**ユーザーストーリー:** 英語学習者として、私はディクテーション結果を視覚的に分かりやすく確認したい。これにより、スペルミスや誤りを明確に把握できる。

#### 受け入れ条件

1. WHEN ディクテーションを提出した時 THEN 結果が Snackbar またはダイアログで表示される
2. WHEN 結果が表示された時 THEN 正解文とユーザー入力が Git diff 形式で並べて表示される
3. WHEN スペルミスがある時 THEN 削除された文字は赤色、追加された文字は緑色でハイライト表示される
4. WHEN 結果表示に加えて THEN 正解率、所要時間も表示される
5. WHEN 正解率が 80%以上の時 THEN 「合格」メッセージが Snackbar で緑色背景で表示される
6. WHEN 正解率が 80%未満の時 THEN 「もう一度挑戦」ボタンが表示される
7. IF 日本語翻訳が利用可能な場合 THEN 結果画面に日本語訳も表示される

### 要件 4: 統計情報の集計と表示

**ユーザーストーリー:** 英語学習者として、私は学習統計を確認したい。これにより、全体的な進捗と傾向を把握できる。

#### 受け入れ条件

1. WHEN ホーム画面を開いた時 THEN 総学習セッション数が表示される
2. WHEN ホーム画面を開いた時 THEN 平均正解率がパーセンテージで表示される
3. WHEN 統計データを計算する時 THEN 全ての保存された学習履歴から集計される
4. IF 学習履歴がない場合 THEN 「まだ学習履歴がありません」というメッセージが表示される

### 要件 5: エラーハンドリングの改善

**ユーザーストーリー:** アプリユーザーとして、私はエラーが発生した時に邪魔にならない形で適切なフィードバックを受けたい。これにより、問題を理解し適切に対処できる。

#### 受け入れ条件

1. WHEN ネットワークエラーが発生した時 THEN 「インターネット接続を確認してください」というメッセージが Snackbar で表示される
2. WHEN API エラーが発生した時 THEN 「サーバーエラーが発生しました。しばらくしてから再度お試しください」というメッセージが Snackbar で表示される
3. WHEN 音声ファイルの読み込みに失敗した時 THEN 「音声ファイルの読み込みに失敗しました」というメッセージと再試行アクションが Snackbar で表示される
4. WHEN エラーメッセージが Snackbar で表示された時 THEN 3-5 秒後に自動的に消えるか、ユーザーがスワイプして閉じることができる
5. WHEN 重要なエラーが発生した時 THEN Snackbar にアクションボタン（例：再試行、設定を開く）が含まれる

### 要件 6: 基本的なオフライン対応

**ユーザーストーリー:** 英語学習者として、私はオフライン時でも基本的な機能を使いたい。これにより、インターネット接続がない環境でも学習を継続できる。

#### 受け入れ条件

1. WHEN オフライン時にアプリを開いた時 THEN 学習履歴と統計情報が表示される
2. WHEN オフライン時に新しい文章を取得しようとした時 THEN 「オフラインモードです。新しい文章を取得するにはインターネット接続が必要です」というメッセージが表示される
3. WHEN 以前に読み込んだ音声ファイルがキャッシュにある時 THEN オフラインでも再生できる
4. WHEN オンラインに復帰した時 THEN 自動的に通常モードに切り替わる

### 要件 7: 設定管理

**ユーザーストーリー:** アプリユーザーとして、私はアプリの設定をカスタマイズしたい。これにより、自分の学習スタイルに合わせてアプリを使用できる。

#### 受け入れ条件

1. WHEN アプリを初めて起動した時 THEN デフォルト設定（音声速度 1.0 倍、自動再生オフ、ヒント表示オン、難易度 A1）が適用される
2. WHEN 設定を変更した時 THEN 変更が即座に反映され、ローカルに保存される
3. WHEN アプリを再起動した時 THEN 前回の設定が復元される
4. IF 設定データが破損している場合 THEN デフォルト設定にリセットされる

### 要件 8: デスクトップ版キーボード操作

**ユーザーストーリー:** デスクトップユーザーとして、私はマウスを使わずキーボードだけで全ての操作を完結したい。これにより、効率的に学習を進めることができる。

#### 受け入れ条件

1. WHEN デスクトップ版でディクテーション画面を開いた時 THEN テキスト入力フィールドに自動的にフォーカスが当たる
2. WHEN キーボードショートカットを使用した時 THEN 以下の操作が可能：
   - Ctrl/Cmd + Enter: ディクテーション提出
   - Space: 音声再生/一時停止
   - Tab: UI 要素間の移動
   - 1-6 の数字キー: 難易度選択（1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2）
   - N: 新しい文章を取得
   - R: 音声を最初から再生
3. WHEN 結果が表示された時 THEN Escape キーで結果を閉じ、次の文章入力に移れる
4. WHEN ホーム画面にいる時 THEN Enter キーでディクテーション練習を開始できる
5. WHEN キーボードショートカットが利用可能な時 THEN 画面上にショートカットヒントが表示される（設定で非表示可能）
