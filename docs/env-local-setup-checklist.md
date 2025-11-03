# .env.local 設定後の確認チェックリスト

## ✅ 完了したこと

- [x] `.env.local`ファイルを作成
- [x] `TWITTER_BEARER_TOKEN`を設定
- [x] `TWITTER_ACCESS_TOKEN`を設定
- [x] `TWITTER_ACCESS_TOKEN_SECRET`を設定

## 🔄 次のステップ

### 1. 開発サーバーを再起動

**重要**: `.env.local`を変更した後は、必ず開発サーバーを再起動してください。

```bash
# 現在のサーバーを停止（Ctrl+C）
# そして再起動
npm run dev
```

### 2. 設定を確認

ブラウザで以下にアクセスして、設定が正しく読み込まれているか確認：

```
http://localhost:3000/api/test-twitter-config
```

期待される結果：
```json
{
  "bearerToken": {
    "configured": true,
    "status": "✅ 設定済み",
    "canPostText": true
  },
  "oauth": {
    "configured": false,
    "status": "❌ 未設定",
    ...
  },
  "summary": {
    "canPostText": true,
    "canPostImage": false,
    "recommended": "テキストのみ投稿可能"
  }
}
```

### 3. オートパイロットをテスト

1. ブラウザで `/data-expansion` にアクセス
2. 「オートパイロット実行」ボタンをクリック
3. 結果画面で「✅ X投稿成功」と表示されるか確認

## 📝 現在の設定状態

- ✅ **テキストのみのツイート**: 可能（`TWITTER_BEARER_TOKEN`あり）
- ❌ **画像付きツイート**: 不可（`TWITTER_API_KEY`と`TWITTER_API_SECRET`が必要）

## 🎯 画像付きツイートを有効にする場合

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にログイン
2. **Apps** → あなたのアプリ → **Keys and tokens**
3. **API Key**と**API Key Secret**をコピー
4. `.env.local`に追加：

```bash
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
```

5. 開発サーバーを再起動

## ⚠️ 注意事項

- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません（正しい）
- 本番環境（Vercel）にも環境変数を設定する必要があります
- 環境変数を変更した後は、必ずサーバーを再起動してください

## 🚀 次のアクション

1. 開発サーバーを再起動
2. `/api/test-twitter-config`で設定を確認
3. オートパイロットを実行してテスト
