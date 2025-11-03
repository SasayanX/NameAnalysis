# Twitter API認証エラー32の解決方法

## 🔴 エラー内容

```
エラーコード: 32
メッセージ: "Could not authenticate you."
```

## 🔍 原因

OAuth 1.0a認証情報（API Key/Secret、Access Token/Secret）が無効、または署名の生成方法に問題があります。

## ✅ 解決方法

### 1. Twitter Developer Portalで認証情報を確認

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にログイン
2. **Apps** → あなたのアプリを選択
3. **Keys and tokens**タブを確認：
   - **API Key**（Consumer Key）
   - **API Key Secret**（Consumer Secret）
   - **Access Token**
   - **Access Token Secret**

### 2. 認証情報を再生成（推奨）

古い認証情報が無効になっている可能性があります：

1. **API Key Secret**を再生成（「Regenerate」をクリック）
2. **Access Token and Secret**を再生成（「Regenerate」をクリック）
3. 新しい値を`.env.local`にコピー

### 3. アプリの権限を確認

1. **User authentication settings**を開く
2. **App permissions**が**Read and write**になっているか確認
3. **Callback URL**を設定（必要に応じて）

### 4. .env.localの確認

以下の4つの環境変数が正しく設定されているか確認：

```bash
TWITTER_API_KEY=MILgveWKmuC2vAT2KFEPVKbWv
TWITTER_API_SECRET=xyaZXZJ2MldCO3qf2iHhcgc7o3DKMTHAvvpIgb6zmPjWD4Q4U7
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR
```

**重要**: 
- 値の前後にスペースがないか確認
- 引用符（`"`や`'`）で囲んでいないか確認
- 値が完全にコピーされているか確認

### 5. 開発サーバーを再起動

```bash
# Ctrl+Cで停止
npm run dev
```

## 🔧 よくある問題

### 問題1: API Key Secretが表示されない

**解決策**: 「Regenerate」をクリックして新しいSecretを生成

### 問題2: Access Tokenが無効

**解決策**: 「Regenerate」をクリックして新しいAccess Tokenを生成

### 問題3: アプリの権限が「Read only」

**解決策**: 「User authentication settings」で「Read and write」に変更

### 問題4: 環境変数が正しく読み込まれていない

**解決策**: 
- `.env.local`ファイルの保存を確認
- 開発サーバーを再起動
- `/api/test-twitter-config`で設定を確認

## 📝 チェックリスト

- [ ] Twitter Developer Portalで認証情報を確認
- [ ] API Key Secretを再生成（必要に応じて）
- [ ] Access Tokenを再生成（必要に応じて）
- [ ] アプリの権限が「Read and write」になっている
- [ ] `.env.local`に4つの環境変数が正しく設定されている
- [ ] 開発サーバーを再起動
- [ ] `/api/test-twitter-config`で設定を確認

認証情報を再生成して、`.env.local`を更新し、開発サーバーを再起動してください。
