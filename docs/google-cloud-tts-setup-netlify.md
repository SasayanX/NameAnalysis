# Google Cloud Text-to-Speech API セットアップ（Netlify環境）

## 重要: APIキー方式は使用できません

Google Cloud Text-to-Speech APIは、**APIキー方式をサポートしていません**。
以下のエラーが発生します：

```
HTTP 401: API keys are not supported by this API. Expected OAuth2 access token or other authentication credentials that assert a principal.
```

## ⚠️ 重要: Netlifyの4KB制限について

Netlifyの環境変数の合計サイズは**4KB制限**があります。サービスアカウントキーのJSONを環境変数に直接設定すると、この制限を超える可能性があります。

## 解決方法: サービスアカウントキーを使用

Netlify環境では、**ファイルパス方式**を使用することを推奨します（環境変数のサイズを削減するため）。

### 方法1: ファイルパス方式（推奨・4KB制限を回避）

#### 手順

1. **Google Cloud Consoleでサービスアカウントキーを作成**

   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - IAM & Admin → Service Accounts
   - サービスアカウントを選択（または新規作成）
   - 「Keys」タブ → 「Add Key」→ 「Create new key」
   - キータイプ: **JSON** を選択
   - ダウンロードしたJSONファイルを保存

2. **プロジェクトに配置**

   - ダウンロードしたJSONファイルを `functions/config/google-cloud-tts-service-account.json` に配置
   - **注意**: プライベートリポジトリの場合のみGitにコミットしてください
   - 公開リポジトリの場合は、**絶対にコミットしないでください**

3. **Netlify Dashboardで環境変数を設定**

   - Netlify Dashboard → Site settings → Environment variables
   - 新しい環境変数を追加:
     - **Key**: `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_PATH`
     - **Value**: `functions/config/google-cloud-tts-service-account.json`
     - **Scopes**: Production, Deploy Previews, Branch Deploys（必要に応じて）
   - **重要**: `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON` が設定されている場合は**削除**してください（4KB制限の原因になります）

4. **Gitにコミット（プライベートリポジトリの場合のみ）**

   ```bash
   # .gitignoreから除外する必要がある場合
   git add -f functions/config/google-cloud-tts-service-account.json
   git commit -m "Add Google Cloud TTS service account key"
   git push
   ```

5. **デプロイ**

   - 環境変数を設定した後、**再デプロイが必要**です
   - Deploys → Trigger deploy → Deploy site

### 方法2: JSON文字列方式（非推奨・4KB制限に注意）

環境変数に直接JSONを設定する方法も動作しますが、4KB制限を超える可能性があります。

1. **サービスアカウントキーをダウンロード**（上記と同じ）

2. **Netlify Dashboardで環境変数を設定**

   - **Key**: `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON`
   - **Value**: ダウンロードしたJSONファイルの内容を**そのまま貼り付け**
   
   ⚠️ **注意**: この方法は、他の環境変数と合わせて4KB制限を超えない場合のみ使用してください。

### 環境変数の例

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### セキュリティについて

**Netlify環境変数は暗号化されて保存されます**。これは一般的で推奨される方法です：

- ✅ 環境変数は暗号化されて保存される
- ✅ サーバーレス環境では一時的なファイルシステムのため、ファイル配置は不適切
- ✅ 環境変数でのJSON文字列設定は、AWS Lambda、Vercel、Netlifyなどで標準的な方法

### サービスアカウントの権限

サービスアカウントに以下のロールを付与してください：

- **Cloud Text-to-Speech API User** (`roles/cloudtts.user`)
- または **Editor** ロール（より広い権限）

### 確認方法

デプロイ後、以下で確認できます：

- デバッグエンドポイント: `/api/debug/tts-env-check`
- Netlifyの関数ログで、`[Text-to-Speech] Using service account key from JSON environment variable` が表示されることを確認

### トラブルシューティング

#### エラー: "PERMISSION_DENIED"

- サービスアカウントに適切なロールが付与されているか確認
- Text-to-Speech APIが有効化されているか確認

#### エラー: "ENOENT: no such file or directory"

- `GOOGLE_CLOUD_TTS_SERVICE_ACCOUNT_KEY_JSON` が正しく設定されているか確認
- JSON文字列が正しい形式か確認（改行文字が `\n` として含まれている必要がある）

#### 500エラーが続く場合

- [Google Cloud Status](https://status.cloud.google.com/) で障害状況を確認
- テキストが長すぎないか確認（3000文字以上は警告、5000文字以上はエラー）
- クォータ制限に達していないか確認（Cloud Console → Quotas）

