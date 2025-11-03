# 🔴 緊急：Twitter API認証情報の設定

## 問題

`.env.local`に`TWITTER_API_KEY`と`TWITTER_API_SECRET`が設定されていません。

現在設定されているもの：
- ✅ `TWITTER_BEARER_TOKEN`
- ✅ `TWITTER_ACCESS_TOKEN`
- ✅ `TWITTER_ACCESS_TOKEN_SECRET`
- ❌ `TWITTER_API_KEY` ← **不足**
- ❌ `TWITTER_API_SECRET` ← **不足**

## ✅ 解決方法

### Step 1: Twitter Developer PortalでAPI KeyとSecretを取得

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にログイン
2. **Apps** → あなたのアプリを選択
3. **Keys and tokens**タブを開く
4. **Consumer Keys**セクションで：
   - **API Key**をコピー
   - **API Key Secret**をコピー（表示されない場合は「Regenerate」をクリック）

### Step 2: .env.localに追加

`.env.local`ファイルを開いて、以下を追加：

```bash
# 既存の設定
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAA7Wy8JGmXpm64BujPjKc%2BSeOhbDQ%3DhUMaLygWbaiaAWN6z5W4YmS3jv4DZ5HWUbqtvp5X5RIqePZgSj
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR

# 以下を追加（Twitter Developer Portalで取得した値）
TWITTER_API_KEY=your_actual_api_key_here
TWITTER_API_SECRET=your_actual_api_secret_here
```

### Step 3: 開発サーバーを再起動

```bash
# 現在のサーバーを停止（Ctrl+C）
npm run dev
```

### Step 4: 設定確認

ブラウザで以下にアクセス：
```
http://localhost:3000/api/test-twitter-config
```

すべてのOAuth認証情報が「✅ 設定済み」と表示されればOKです。

## 🌐 Netlify（本番環境）の設定

Netlifyにも同じ環境変数を設定する必要があります：

### Netlify Dashboardでの設定

1. [Netlify Dashboard](https://app.netlify.com/)にログイン
2. サイトを選択
3. **Site configuration** → **Environment variables**
4. 以下を追加：

| 環境変数名 | 値 |
|-----------|-----|
| `TWITTER_API_KEY` | （Twitter Developer Portalで取得） |
| `TWITTER_API_SECRET` | （Twitter Developer Portalで取得） |
| `TWITTER_ACCESS_TOKEN` | `1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd` |
| `TWITTER_ACCESS_TOKEN_SECRET` | `4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR` |

5. **Save**
6. **Deploy** → **Trigger deploy** → **Deploy site**

## ✅ チェックリスト

- [ ] Twitter Developer Portalで`TWITTER_API_KEY`を取得
- [ ] Twitter Developer Portalで`TWITTER_API_SECRET`を取得
- [ ] `.env.local`に`TWITTER_API_KEY`を追加
- [ ] `.env.local`に`TWITTER_API_SECRET`を追加
- [ ] 開発サーバーを再起動
- [ ] `/api/test-twitter-config`で設定確認
- [ ] Netlifyにも同じ環境変数を設定（本番環境用）

これで、テキストのみのツイートが正常に投稿されるようになります！
