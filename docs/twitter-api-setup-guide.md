# Twitter (X) API設定ガイド

## 📋 現在の状態確認

あなたのTwitter Developer Portal情報：
- **Project**: Default project-1983660111185752064
- **App**: 1983660111185752064kanaukiryu
- **プラン**: Free
- **投稿制限**: 100件/月（読み取り）、500件/月（書き込み）

## 🔑 APIキーとBearer Tokenの取得手順

### ステップ1: キーとトークンを確認

1. Twitter Developer Portal → **Apps** → **1983660111185752064kanaukiryu** → **Keys**をクリック
2. 以下の情報が表示されます：
   - **API Key**（Consumer Key）
   - **API Key Secret**（Consumer Secret）
   - **Bearer Token**（作成されている場合）

### ステップ2: Bearer Tokenの作成（推奨）

Bearer Tokenが表示されていない場合：

1. **Keys**タブで「**Generate**」ボタンをクリック
2. Bearer Tokenをコピー（一度しか表示されないので注意！）
3. `.env.local`ファイルに追加：
   ```
   TWITTER_BEARER_TOKEN=your_bearer_token_here
   ```

### ステップ3: OAuth認証情報の取得（オプション）

Bearer Tokenの代わりにOAuth 1.0aを使用する場合：

1. **Keys and tokens**タブを開く
2. 以下をコピー：
   - **API Key** → `TWITTER_API_KEY`
   - **API Key Secret** → `TWITTER_API_SECRET`
3. **Access Token and Secret**セクションで以下を生成：
   - **Access Token** → `TWITTER_ACCESS_TOKEN`
   - **Access Token Secret** → `TWITTER_ACCESS_TOKEN_SECRET`

### ステップ4: 環境変数の設定

#### 開発環境（`.env.local`）
```env
# Bearer Token方式（推奨・シンプル）
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAH...（実際のトークン）

# または OAuth 1.0a方式
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

#### 本番環境（Vercel/Netlify）

**Vercelの場合**:
1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. 以下を追加：
   - `TWITTER_BEARER_TOKEN` = （実際のトークン）

**Netlifyの場合**:
1. Netlify Dashboard → Site → **Site settings** → **Environment variables**
2. 以下を追加：
   - `TWITTER_BEARER_TOKEN` = （実際のトークン）

## ✅ 動作確認

### 1. 環境変数の確認
```bash
# 開発サーバーを再起動（環境変数の変更を反映）
npm run dev
```

### 2. オートパイロットを実行
1. ブラウザで `/data-expansion` にアクセス
2. 「オートパイロット実行」ボタンをクリック
3. 結果画面で「✅ X投稿成功」と表示されればOK

### 3. ログの確認
開発サーバーのコンソールで以下のようなログが表示されます：

```
🐦 Xへの投稿開始: 田中大翔さん
📝 ツイート内容: 🔮【田中大翔さんの姓名判断】...
✅ X投稿成功: Tweet ID 1234567890123456789
```

## 📊 使用制限の確認

### 現在の制限（Freeプラン）
- **読み取り**: 100件/月
- **書き込み**: 500件/月
- **リセット**: 毎月29日 00:00 UTC

### オートパイロットの使用量
- オートパイロットは1日2回実行（07:00 JST / 19:00 JST）
- 1回の実行で1件のツイート = 月60件程度
- **Freeプランの制限内で十分動作します** ✅

## 🔒 セキュリティ注意事項

⚠️ **重要**: Bearer Tokenは**秘密情報**です。以下の点に注意してください：

1. **GitHubにコミットしない**
   - `.env.local`は`.gitignore`に含まれていることを確認
   - トークンが公開リポジトリに上がらないように注意

2. **トークンの再生成**
   - 万が一トークンが漏洩した場合は、すぐにTwitter Developer Portalで再生成

3. **権限の確認**
   - Twitter Developer Portal → **User authentication settings**で権限を確認
   - **Read and write**権限が必要です

## ❌ エラー対処

### エラー: "Twitter API credentials are not configured"
→ `TWITTER_BEARER_TOKEN`が設定されていないか、環境変数が読み込まれていません

**解決方法**:
1. `.env.local`ファイルを確認
2. 開発サーバーを再起動
3. 本番環境の場合は、Vercel/Netlifyの環境変数を確認

### エラー: "Twitter API error: 401 Unauthorized"
→ Bearer Tokenが無効です

**解決方法**:
1. Twitter Developer Portalで新しいBearer Tokenを生成
2. 環境変数を更新
3. サーバーを再起動

### エラー: "Twitter API error: 403 Forbidden"
→ アプリの権限が不足しています

**解決方法**:
1. Twitter Developer Portal → **User authentication settings**
2. **Read and write**権限を有効化
3. **Callback URL**を設定（必要に応じて）

## 📚 参考リンク

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [API Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## 🎯 次のステップ

1. ✅ Bearer Tokenを取得
2. ✅ `.env.local`に設定
3. ✅ 開発サーバーを再起動
4. ✅ オートパイロットを実行してテスト
5. ✅ 本番環境に環境変数を設定

設定が完了すれば、オートパイロット実行時に実際にXに投稿されます！
