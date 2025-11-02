# Google Play Console - AAB登録前チェックリスト

## ✅ 完了済み項目

### 1. アプリ開発
- [x] TWAプロジェクトの初期化完了
- [x] Digital Asset Links設定完了
- [x] 署名キー作成完了
- [x] APK/AABビルド完了（バージョン5）

### 2. 機能実装
- [x] 無料プランでの詳細鑑定制限実装
- [x] プラン判定ロジック強化
- [x] UI改善（タブラベル短縮）

### 3. デプロイ
- [x] 本番環境（seimei.app）にデプロイ完了
- [x] APKでの動作確認完了
- [x] 制限機能が正しく動作していることを確認

## 📋 Google Play Console登録前の確認事項

### 必須ファイル
- [x] **AABファイル**: `app-release-bundle.aab` (4.53 MB)
- [x] **署名キー**: `android.keystore` (保存場所: `D:\project\NameAnalysis\twa\android.keystore`)
- [x] **キーストアパスワード**: `P@ssword` (安全な場所に保管)
- [x] **キーエイリアス**: `android`
- [x] **キーパスワード**: `P@ssword`

### Digital Asset Links
- [x] **Asset Linksファイル**: `https://seimei.app/.well-known/assetlinks.json`
- [x] **パッケージ名**: `com.nameanalysis.ai`
- [x] **SHA256フィンガープリント**: `B766698D95C2B3A1E236143DE6DC91343DFBFD5732C8C117F0F30E46F9DC15A9`
- [x] **検証**: Google検証ツールで確認済み

### アプリ情報
- **パッケージ名**: `com.nameanalysis.ai`
- **アプリ名**: まいにちAI姓名判断
- **バージョン**: 5 (appVersionCode: 5)
- **最小SDK**: 21 (Android 5.0)
- **対象SDK**: 最新

### 重要な注意事項

#### 1. 署名キーの管理
⚠️ **署名キーは絶対に紛失しないでください！**
- バックアップを取って安全な場所に保管
- キーストアファイル（`android.keystore`）とパスワード（`P@ssword`）を記録
- 将来のアップデートで同じキーが必要

#### 2. バージョン管理
- 現在のバージョン: 5
- 次回アップデート時は、`appVersionCode`を6に増やす必要があります
- `bubblewrap update`を実行すると自動的に増えます

#### 3. テスト確認
- [x] APKで無料プランでの制限が機能している
- [x] タブラベルが正しく表示されている
- [ ] Google Play Consoleでの内部テスト配布を推奨

## 🚀 Google Play Console登録手順

### ステップ1: アプリ作成
1. Google Play Consoleにログイン
2. 「アプリを作成」をクリック
3. アプリ名を入力: 「まいにちAI姓名判断」
4. デフォルトの言語を選択: 日本語
5. アプリの種類: アプリ
6. 無料/有料: 無料

### ステップ2: アプリの詳細情報
- **アプリ名**: まいにちAI姓名判断
- **短い説明**: （50文字以内）
- **詳細な説明**: （4000文字以内）
- **グラフィック素材**: 
  - アプリアイコン（512x512）
  - 機能グラフィック
  - スクリーンショット

### ステップ3: コンテンツレーティング
- アプリのカテゴリを選択
- コンテンツレーティングを完了

### ステップ4: プライバシーポリシー
- プライバシーポリシーのURLが必要: `https://seimei.app/privacy`

### ステップ5: アプリの配布とデバイス
- 対象デバイスを選択
- Android 5.0 (API 21) 以上

### ステップ6: AABアップロード
1. 「リリース」→「内部テスト」を選択
2. 「新しいリリースを作成」をクリック
3. `app-release-bundle.aab`をアップロード
4. リリースノートを入力
5. 「レビューに送信」

## ⚠️ 注意事項

### 初回審査
- 初回審査には数日から1週間かかる場合があります
- 審査完了まで待機が必要

### アップデート時
- 同じ署名キーを使用する必要があります
- バージョンコードを必ず増やす必要があります
- `bubblewrap update` → `bubblewrap build`の順で実行

### トラブルシューティング
- Digital Asset Linksが正しく設定されているか確認
- 署名キーが正しく使用されているか確認
- エラーが出た場合は、エラーメッセージを確認

## 📝 次回アップデート時の手順

1. コードを修正
2. `twa/twa-manifest.json`でバージョンを確認（`bubblewrap update`で自動増加）
3. `gradle.properties`を`-Xmx512m`に修正（必要に応じて）
4. `$env:GRADLE_OPTS = "-Xmx512m -XX:MaxMetaspaceSize=512m"`
5. `bubblewrap build --skipPwaValidation`
6. パスワード入力（`P@ssword`）
7. 新しいAABをGoogle Play Consoleにアップロード

## ✅ 準備完了

すべての準備が整いました。Google Play Consoleでアプリを登録できます！

