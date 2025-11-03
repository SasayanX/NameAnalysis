# Twitter OAuth 1.0a権限エラーの解決方法

## 🔴 エラー内容

```
"Your client app is not configured with the appropriate oauth1 app permissions for this endpoint."
```

## ✅ 解決手順（重要：順番に実行）

### Step 1: Developer PortalでApp permissionsを確認・変更

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にログイン
2. **Apps** → あなたのアプリを選択
3. **User authentication settings**を開く
4. **App permissions**セクションを確認：
   - **「Read and write」が選択されているか確認**
   - 選択されていない場合は、**「Read and write」を選択**
5. 他の必須項目も確認：
   - **Type of App**: 「Web App, Automated App or Bot」を選択
   - **Callback URI**: 適切なURLを設定（例: `https://seimei.app/callback`）
   - **Website URL**: アプリのURLを設定（例: `https://seimei.app`）
6. **Save**ボタンをクリック
7. **数分待つ**（設定反映に時間がかかる場合がある）

### Step 2: Access TokenとSecretを再生成（必須）

**重要**: App permissionsを変更した後は、**必ずAccess TokenとSecretを再生成**してください。

1. **Keys and tokens**タブに移動
2. **Access Token and Secret**セクションを開く
3. **「Regenerate」ボタンをクリック**
4. 新しい**Access Token**をコピー
5. 新しい**Access Token Secret**をコピー
   - ⚠️ **一度しか表示されません。必ずコピーしてください**

### Step 3: .env.localを更新

新しいAccess TokenとSecretを`.env.local`に反映：

```bash
TWITTER_API_KEY=MILgveWKmuC2vAT2KFEPVKbWv
TWITTER_API_SECRET=xyaZXZJ2MldCO3qf2iHhcgc7o3DKMTHAvvpIgb6zmPjWD4Q4U7
TWITTER_ACCESS_TOKEN=新しいAccess_Token_をここに貼り付け
TWITTER_ACCESS_TOKEN_SECRET=新しいAccess_Token_Secret_をここに貼り付け
```

### Step 4: 開発サーバーを再起動

```bash
# Ctrl+Cで停止
npm run dev
```

### Step 5: テスト

オートパイロットを実行して、正常に動作するか確認してください。

## ⚠️ よくある間違い

### ❌ 間違い1: App permissionsを変更しただけで、Access Tokenを再生成しない

**正しい手順**: App permissionsを変更したら、**必ずAccess TokenとSecretを再生成**してください。

### ❌ 間違い2: 設定を保存した直後にテストする

**正しい手順**: 設定を保存した後、**数分待ってから**Access Tokenを再生成し、テストしてください。

### ❌ 間違い3: 古いAccess Tokenを使い続ける

**正しい手順**: App permissionsを変更した後は、**必ず新しいAccess Tokenを生成**して、`.env.local`を更新してください。

## 📋 チェックリスト

- [ ] Developer Portalで「Read and write」を選択
- [ ] 他の必須項目（Type of App、Callback URI、Website URL）を設定
- [ ] **Save**ボタンをクリック
- [ ] **数分待つ**
- [ ] Access TokenとSecretを**再生成**
- [ ] 新しいAccess TokenとSecretをコピー
- [ ] `.env.local`を更新
- [ ] 開発サーバーを再起動
- [ ] オートパイロットを実行してテスト

## 🎯 重要なポイント

1. **App permissionsを「Read and write」に設定** ← これが最重要
2. **Access Tokenを再生成** ← これも必須
3. **数分待つ** ← 設定反映に時間がかかる場合がある

この手順を正確に実行すれば、エラーは解決するはずです。頑張ってください！
