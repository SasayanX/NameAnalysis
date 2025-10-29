# Twitter API トークン取得ガイド

X（旧Twitter）APIを使用して自動投稿するための認証情報を取得する方法です。

## 前提条件

- Xアカウントを持っていること
- メールアドレス認証済みであること

## 手順1: Twitter Developer Portal にアクセス

1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. 既存のXアカウントでログイン

## 手順2: Developer Account を作成

1. 「Apply for a Developer Account」をクリック
2. 「Making a bot」を選択（または「Exploring the API」）
3. アカウント情報を入力：
   - **Account name**: アプリケーション名（例: "姓名判断自動投稿ボット"）
   - **Use case**: 「I am making a bot」を選択
   - **App description**: 使用目的を説明（例: "毎日姓名判断の結果を自動で投稿するボットです"）
4. 利用規約に同意して送信
5. メール確認（数分〜数時間で承認されることが多い）

## 手順3: Appを作成

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) のダッシュボードにアクセス
2. 左メニューから「Projects & Apps」→「Overview」を選択
3. 「+ Create App」または「+ Create」をクリック
4. App名を入力（例: "seimei-handan-bot"）
5. 作成

## 手順4: API Keys & Tokens を取得

### Bearer Token方式（推奨：シンプル）

1. 作成したAppの「Keys and tokens」タブを開く
2. 「Bearer Token」セクションを確認
3. 「Generate」をクリック（既にある場合は表示される）
4. **重要**: Bearer Tokenは一度しか表示されないので、必ずコピーして保存

### OAuth 1.0a方式（ユーザー認証が必要な場合）

1. 「Consumer Keys」セクション
   - **API Key** をコピー → `TWITTER_API_KEY`
   - **API Key Secret** をコピー → `TWITTER_API_SECRET`

2. 「Authentication Tokens」セクション
   - 「Generate」をクリックしてAccess TokenとSecretを生成
   - **Access Token** をコピー → `TWITTER_ACCESS_TOKEN`
   - **Access Token Secret** をコピー → `TWITTER_ACCESS_TOKEN_SECRET`

## 手順5: App権限の設定

1. 「Settings」タブを開く
2. **App permissions** を確認・変更：
   - **Read and Write** または **Read and write and Direct message** を選択
   - ツイート投稿には「Write」権限が必要

3. 「Save」をクリック
4. **重要**: 権限を変更した場合は、Access Tokenを再生成する必要があります

## 手順6: 環境変数に設定

### Vercelの場合

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数を追加：

#### Bearer Token方式（推奨）

```
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

#### OAuth 1.0a方式

```
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

5. 環境（Production, Preview, Development）を選択
6. 「Save」をクリック
7. **デプロイを再実行**（環境変数はデプロイ時に読み込まれるため）

### ローカル開発環境の場合

`.env.local` ファイルに追加：

```env
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

## 手順7: Twitter API v2のアクセスレベル確認

Twitter API v2には無料プランと有料プランがあります：

### Free Tier（無料プラン）
- 月間ツイート投稿: 1,500件まで
- 毎日7時・19時の2回投稿なら月60件程度なので十分です

### Basic Tier（有料プラン）
- $100/月から
- より多くの制限

## トラブルシューティング

### 「Unauthorized」エラー

- Bearer TokenまたはAccess Tokenが正しく設定されているか確認
- 環境変数名が正確か確認（大文字小文字も含む）
- デプロイを再実行（環境変数が反映されていない可能性）

### 「Forbidden」エラー

- App権限が「Read and Write」になっているか確認
- 権限変更後はAccess Tokenを再生成

### 「Rate limit exceeded」エラー

- APIの使用制限に達しています
- 無料プランでも十分な制限があるので、通常は問題ありません

### Bearer Tokenが見つからない

- 一部のAppではBearer Tokenが表示されない場合があります
- その場合はOAuth 1.0a方式を使用してください
- または、新しくAppを作成してみてください

## セキュリティ注意事項

⚠️ **重要**:

1. **API KeysやTokensは絶対に公開しないでください**
   - GitHubにコミットしない
   - `.env.local` は `.gitignore` に追加済みのはず
   - 共有や公開の場所に貼り付けない

2. **定期ローテーション**
   - 定期的にTokenを更新することを推奨
   - 漏洩が疑われる場合は即座に再生成

3. **最小権限の原則**
   - 必要最小限の権限のみ付与
   - この場合は「Read and Write」で十分

## テスト方法

環境変数を設定後、以下でテストできます：

1. Vercel Dashboardの「Functions」→「View Function Logs」
2. または `/api/autopilot/execute` に直接GETリクエスト（開発環境）

正常に動作すれば、Xアカウントにツイートが投稿されます。

