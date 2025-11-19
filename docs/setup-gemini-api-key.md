# Gemini API キーの設定方法

## エラー: "AI鑑定サービスが設定されていません"

このエラーは、`GOOGLE_GENERATIVE_AI_API_KEY` 環境変数が設定されていないことを示しています。

## 設定手順

### 1. Google AI Studio でAPIキーを取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. プロジェクトを選択（または新規作成）
5. APIキーをコピー

### 2. `.env.local` ファイルを作成・編集

プロジェクトのルートディレクトリ（`D:\project\NameAnalysis`）に `.env.local` ファイルを作成し、以下の内容を追加：

```env
# Google Gemini API（AI鑑定機能用）
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

**重要**: `your_actual_api_key_here` を実際のAPIキーに置き換えてください。

### 3. 開発サーバーを再起動

環境変数を読み込むために、開発サーバーを再起動してください：

```bash
# 現在のサーバーを停止（Ctrl+C）
# 再度起動
npm run dev
```

### 4. テストを再実行

ブラウザのコンソールで、再度テストコードを実行してください。

## オプション: Firestoreの設定（言霊データ用）

言霊データを使用する場合は、Firestoreの設定も必要です：

```env
# Firebase Firestore（言霊マスターデータ用）
# 方法1: サービスアカウントキーのファイルパスを指定
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./secret/firebase-service-account-key.json

# 方法2: JSON文字列を直接設定（Vercelなどの環境変数で推奨）
# FIREBASE_SERVICE_ACCOUNT_KEY_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

**注意**: Firestoreの設定がなくても、APIは動作しますが、言霊データは取得されません。

