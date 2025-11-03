# テキストのみツイートのテストガイド

## 📋 現在の状況

テキストのみのツイートでも、OAuth 1.0a認証（4つの認証情報）が必要です。

## ✅ 必要な環境変数

`.env.local`に以下を設定してください：

```bash
# OAuth 1.0a認証情報（4つすべて必要）
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR
```

## 🔑 TWITTER_API_KEY と TWITTER_API_SECRET の取得方法

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にログイン
2. **Apps** → あなたのアプリ（例: `1983660111185752064kanaukiryu`）を選択
3. **Keys and tokens**タブを開く
4. 以下をコピー：
   - **API Key** → `TWITTER_API_KEY`
   - **API Key Secret** → `TWITTER_API_SECRET`
   - （表示されない場合は「Regenerate」をクリックして生成）

## 📝 .env.local の完全な設定例

```bash
# OAuth 1.0a認証情報（テキストのみツイートに必要）
TWITTER_API_KEY=your_actual_api_key_here
TWITTER_API_SECRET=your_actual_api_secret_here
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR

# Bearer Token（現在は使用していませんが、将来のために保持）
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAA7Wy8JGmXpm64BujPjKc%2BSeOhbDQ%3DhUMaLygWbaiaAWN6z5W4YmS3jv4DZ5HWUbqtvp5X5RIqePZgSj
```

## 🔄 次のステップ

### 1. 環境変数を設定

`.env.local`に`TWITTER_API_KEY`と`TWITTER_API_SECRET`を追加

### 2. 開発サーバーを再起動

```bash
# 現在のサーバーを停止（Ctrl+C）
npm run dev
```

### 3. 設定を確認

ブラウザで以下にアクセス：
```
http://localhost:3000/api/test-twitter-config
```

期待される結果：
```json
{
  "oauth": {
    "configured": true,
    "status": "✅ 設定済み",
    "canPostImage": true
  },
  "summary": {
    "canPostText": true,
    "canPostImage": true,
    "recommended": "テキストのみ投稿可能"
  }
}
```

### 4. オートパイロットを実行

1. ブラウザで `/data-expansion` にアクセス
2. 「オートパイロット実行」ボタンをクリック
3. 結果画面で「✅ X投稿成功」と表示されるか確認

## 🖼️ 画像生成を一時的に無効にする（オプション）

画像生成をスキップしてテキストのみでテストしたい場合：

`app/api/autopilot/execute/route.ts`の282-298行目を一時的にコメントアウト：

```typescript
// 縦書き名前画像を生成（オプション）
// let imageBuffer: Buffer | undefined = undefined
// try {
//   const { generateNameResultImage } = await import('@/lib/name-result-image-generator')
//   ...
// } catch (imageError: any) {
//   console.warn('⚠️ 画像生成に失敗しましたが、テキストのみで投稿します:', imageError.message)
// }

// 画像なしで投稿
tweetId = await postToTwitter(tweetText, undefined) // 画像なし
```

ただし、現在のコードでは画像生成に失敗しても自動的にテキストのみで投稿するので、この変更は必須ではありません。

## ✅ テスト手順まとめ

1. ✅ `TWITTER_API_KEY`と`TWITTER_API_SECRET`を取得
2. ✅ `.env.local`に追加
3. ✅ 開発サーバーを再起動
4. ✅ `/api/test-twitter-config`で設定確認
5. ✅ オートパイロットを実行してテスト

設定が完了すれば、テキストのみのツイートが正常に投稿されます！
