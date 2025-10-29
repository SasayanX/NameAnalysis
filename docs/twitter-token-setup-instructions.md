# Twitter API認証情報の設定手順

## 提供された認証情報

以下の認証情報を受け取りました。これらを環境変数に設定してください。

- **Bearer Token** (X認証トークン)
- **Access Token**
- **Access Token Secret**

⚠️ **重要**: これらの情報は機密情報です。GitHubにコミットしないよう注意してください。

## ローカル環境の設定

### ステップ1: .env.localファイルを作成/編集

プロジェクトのルートディレクトリ（`package.json`がある場所）に`.env.local`ファイルを作成または編集します。

### ステップ2: 認証情報を追加

`.env.local`ファイルに以下を追加してください：

```env
# X (Twitter) API設定
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAAx4XEj5rrjyRzItG8329lbKMIQ9O%3D3g0M0gziauEh5Xla6HIGAEQddUJc8cElXTTD15Thg2jmMMMDV7
TWITTER_ACCESS_TOKEN=1918491750152478720-pi0feBTRYdNnCwzXwZ2SkOLdsxiq7j
TWITTER_ACCESS_TOKEN_SECRET=mZdiP68pgJ4auLpJENxNQL1nm0VrXW23mSkWs88N4wVEi
```

**注意**: Bearer TokenにはURLエンコードされた文字（`%3D`）が含まれていますが、そのままで使用できます。

### ステップ3: 開発サーバーを再起動

環境変数は起動時に読み込まれるため、開発サーバーを再起動してください：

```bash
# 現在のサーバーを停止（Ctrl+C）
# 再度起動
npm run dev
```

## Vercel本番環境の設定

### ステップ1: Vercel Dashboardにアクセス

1. https://vercel.com/dashboard にアクセス
2. プロジェクトを選択

### ステップ2: Environment Variablesを設定

1. 「Settings」タブをクリック
2. 左メニューから「Environment Variables」を選択
3. 以下の環境変数を追加：

#### Bearer Token設定（推奨）

- **Name**: `TWITTER_BEARER_TOKEN`
- **Value**: `AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAAx4XEj5rrjyRzItG8329lbKMIQ9O%3D3g0M0gziauEh5Xla6HIGAEQddUJc8cElXTTD15Thg2jmMMMDV7`
- **Environment**: Production, Preview, Development（すべてにチェック）
- 「Save」をクリック

#### OAuth 1.0a設定（Bearer Tokenと併用可能）

- **Name**: `TWITTER_ACCESS_TOKEN`
- **Value**: `1918491750152478720-pi0feBTRYdNnCwzXwZ2SkOLdsxiq7j`
- **Environment**: Production, Preview, Development（すべてにチェック）
- 「Save」をクリック

- **Name**: `TWITTER_ACCESS_TOKEN_SECRET`
- **Value**: `mZdiP68pgJ4auLpJENxNQL1nm0VrXW23mSkWs88N4wVEi`
- **Environment**: Production, Preview, Development（すべてにチェック）
- 「Save」をクリック

**注意**: Consumer Keys（API Key & Secret）も必要な場合は、同様に追加してください。

### ステップ3: デプロイを再実行

環境変数はデプロイ時に読み込まれるため、再デプロイが必要です：

1. Vercel Dashboardの「Deployments」タブ
2. 最新のデプロイの「...」メニュー
3. 「Redeploy」をクリック

または、GitHubにプッシュして自動デプロイをトリガーします。

## 動作確認

### テスト方法

1. **ローカル環境**:
   ```bash
   # 開発サーバー起動後
   curl http://localhost:3000/api/autopilot/execute
   ```

2. **Vercel環境**:
   ```
   https://your-domain.vercel.app/api/autopilot/execute
   ```

正常に動作すれば、Xアカウントにテストツイートが投稿されます。

### ログの確認

- **ローカル**: ターミナルのコンソール出力
- **Vercel**: Dashboard → Functions → View Function Logs

## セキュリティチェックリスト

✅ `.env.local`が`.gitignore`に含まれているか確認  
✅ 認証情報をGitHubにコミットしていないか確認  
✅ Vercelの環境変数が正しく設定されているか確認  
✅ 認証情報を共有していないか確認  

## トラブルシューティング

### エラー: "Twitter API credentials are not configured"

- 環境変数名が正確か確認（大文字小文字も含む）
- 開発サーバーを再起動
- `.env.local`ファイルがプロジェクトルートにあるか確認

### エラー: "Unauthorized" (401)

- Bearer TokenまたはAccess Tokenが正しいか確認
- Tokenが有効期限内か確認（再生成が必要な場合あり）

### エラー: "Forbidden" (403)

- App権限が「Read and Write」になっているか確認
- 権限変更後はAccess Tokenを再生成

### 投稿されない

- ログを確認してエラーがないかチェック
- Twitter Developer PortalでAppの状態を確認

以上の設定でTwitter APIが動作します。

