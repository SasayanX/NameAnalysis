# Twitter Developer Portal 設定ガイド

## 🔧 User authentication settings の設定方法

### 1. App permissions（必須）

**選択**: **Read and write** ✅

```
Read and write
Read and Post Posts and profile information
```

**理由**: ツイートを投稿するためには「Read and write」権限が必要です。

### 2. Type of App（必須）

**選択**: **Web App, Automated App or Bot** ✅

```
Web App, Automated App or Bot
Confidential client
```

**理由**: オートパイロット（自動投稿）なので、このタイプを選択します。

### 3. Callback URI / Redirect URL（必須）

**設定例**: 
```
https://seimei.app/callback
```

または、一時的なURLでもOK：
```
https://localhost:3000/callback
```

**注意**: 
- オートパイロットでは実際にはユーザー認証フローを使わないため、任意のURLでOK
- ただし、`https://`または`scheme://`形式である必要がある

### 4. Website URL（必須）

**設定例**:
```
https://seimei.app
```

**注意**: あなたのアプリの実際のURLを設定してください。

### 5. Organization name（オプション）

**設定例**:
```
まいにちAI姓名判断
```

または空白でもOK

### 6. Organization URL（オプション）

**設定例**:
```
https://seimei.app
```

または空白でもOK

### 7. Terms of service（オプション）

**設定例**:
```
https://seimei.app/legal/terms
```

または空白でもOK

### 8. Privacy policy（オプション）

**設定例**:
```
https://seimei.app/privacy
```

または空白でもOK

## ✅ 設定後の確認

1. すべての必須項目（App permissions、Type of App、Callback URI、Website URL）を設定
2. **Save**ボタンをクリック
3. 変更が保存されたことを確認

## 🔄 設定変更後の対応

### 1. 認証情報を再生成（推奨）

設定を変更した後は、以下の認証情報を再生成することを推奨します：

1. **Keys and tokens**タブに移動
2. **Access Token and Secret**セクションで「**Regenerate**」をクリック
3. 新しい`Access Token`と`Access Token Secret`をコピー
4. `.env.local`ファイルを更新

### 2. .env.localを更新

```bash
TWITTER_API_KEY=MILgveWKmuC2vAT2KFEPVKbWv
TWITTER_API_SECRET=xyaZXZJ2MldCO3qf2iHhcgc7o3DKMTHAvvpIgb6zmPjWD4Q4U7
TWITTER_ACCESS_TOKEN=新しいAccess_Token
TWITTER_ACCESS_TOKEN_SECRET=新しいAccess_Token_Secret
```

### 3. 開発サーバーを再起動

```bash
# Ctrl+Cで停止
npm run dev
```

## 📋 チェックリスト

- [ ] App permissions: **Read and write** を選択
- [ ] Type of App: **Web App, Automated App or Bot** を選択
- [ ] Callback URI: 適切なURLを設定（例: `https://seimei.app/callback`）
- [ ] Website URL: アプリのURLを設定（例: `https://seimei.app`）
- [ ] **Save**ボタンをクリック
- [ ] Access TokenとSecretを再生成
- [ ] `.env.local`を更新
- [ ] 開発サーバーを再起動
- [ ] オートパイロットを実行してテスト

## ⚠️ よくある問題

### 問題1: 設定を保存しても反映されない

**解決策**: 
- ページをリロード
- しばらく待ってから再確認（反映に時間がかかる場合がある）

### 問題2: エラーコード453が続く

**解決策**:
- App permissionsが「Read and write」になっているか再確認
- Access TokenとSecretを再生成
- 数分待ってから再試行（設定反映に時間がかかる場合がある）

設定を完了したら、Access Tokenを再生成して`.env.local`を更新してください。
