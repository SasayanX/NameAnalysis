# Twitter API v2 + OAuth 1.0a 実装ガイド

## 📋 Perplexity確認結果に基づく実装

### ✅ 確認された事実

1. **OAuth 1.0aでv2エンドポイントにアクセス可能**
   - `POST /2/tweets`エンドポイントはOAuth 1.0aで利用可能
   - API Key/Secret + Access Token/Secretでアクセスできる

2. **Freeプランで使用可能**
   - Freeプランでも`/2/tweets`エンドポイントは利用可能
   - 月500件程度の投稿まで（1日約17件）
   - v1.1の`statuses/update`は制限が厳しいため、v2推奨

3. **エラーコード453の原因**
   - アプリのアクセス権限（Read and Write）が不足している可能性
   - Developer Portalで設定を確認

### 🔧 実装のポイント

#### 1. エンドポイント
```typescript
const tweetEndpoint = 'https://api.twitter.com/2/tweets'
```

#### 2. OAuth署名の生成
```typescript
const requestData = {
  url: tweetEndpoint,
  method: 'POST',
}
const authHeader = oauth.toHeader(oauth.authorize(requestData, token))
```

#### 3. リクエスト形式
```typescript
// ヘッダー
{
  ...authHeader,  // OAuth署名
  'Content-Type': 'application/json',
}

// ボディ
{
  "text": "ツイート本文"
}
```

### ⚠️ 注意事項

1. **Developer Portalの設定確認**
   - Apps → あなたのアプリ → User authentication settings
   - App permissions: **Read and write** に設定
   - Callback URLを設定（必要に応じて）

2. **レート制限**
   - Freeプラン: 月500件程度（1日約17件）
   - オートパイロットは1日2回実行なので、十分に余裕あり

3. **エラーコード453が出る場合**
   - Developer Portalでアクセス権限を確認
   - アプリの設定を再確認
   - 必要に応じて認証情報を再生成

### 📝 チェックリスト

- [ ] Developer Portalでアプリのアクセス権限が「Read and write」になっている
- [ ] OAuth 1.0a認証情報（4つすべて）が`.env.local`に設定されている
- [ ] 開発サーバーを再起動した
- [ ] `/api/test-twitter-config`で設定を確認した
- [ ] オートパイロットを実行してテストした

### 🔗 参考リンク

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
- [OAuth 1.0a Authentication](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
