# 環境変数が読み込まれない問題の解決方法

## 🔴 問題

「開発環境モード：Twitter API認証情報が設定されていません」というエラーが出る

## ✅ 解決手順

### Step 1: .env.localファイルの確認

`.env.local`ファイルに以下が正しく設定されているか確認：

```bash
TWITTER_API_KEY=0QdwZhPitmIc4BjIzoprXERoo
TWITTER_API_SECRET=X0EcV8jVbZMk8sCB0gZTBBfh5pIp0GZuzWhdsRLXCfQ2qQvk4e
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR
```

**確認ポイント**:
- 環境変数名が正確か（`TWITTER_API_SECRET`で`TWITTER_API_KEY_SECRET`ではない）
- 値の前後にスペースがないか
- 引用符（`"`や`'`）で囲んでいないか
- ファイルが保存されているか

### Step 2: 開発サーバーを完全に再起動

**重要**: 環境変数を変更した後は、必ず開発サーバーを完全に再起動してください。

```bash
# 1. 現在のサーバーを停止（Ctrl+C）
# 2. ターミナルで完全に停止したことを確認
# 3. 再起動
npm run dev
```

### Step 3: 設定を確認

ブラウザで以下にアクセスして、環境変数が読み込まれているか確認：

```
http://localhost:3000/api/test-twitter-config
```

期待される結果：
```json
{
  "oauth": {
    "configured": true,
    "status": "✅ 設定済み",
    "apiKey": "✅",
    "apiSecret": "✅",
    "accessToken": "✅",
    "accessTokenSecret": "✅"
  }
}
```

もし「❌ 未設定」と表示される場合は、環境変数が読み込まれていません。

### Step 4: サーバーのログを確認

開発サーバーのターミナルに、以下のようなログが表示されているか確認：

```
🔍 Twitter API認証情報チェック:
  - TWITTER_API_KEY: ✅ 設定済み
  - TWITTER_API_SECRET: ✅ 設定済み
  - TWITTER_ACCESS_TOKEN: ✅ 設定済み
  - TWITTER_ACCESS_TOKEN_SECRET: ✅ 設定済み
```

もし「❌ 未設定」と表示される場合は、環境変数が読み込まれていません。

## 🔧 よくある問題と解決方法

### 問題1: 環境変数名が間違っている

**確認**: `.env.local`に`TWITTER_API_SECRET`があるか（`TWITTER_API_KEY_SECRET`ではない）

### 問題2: 開発サーバーが再起動されていない

**解決**: 開発サーバーを完全に停止して再起動

### 問題3: ファイルが保存されていない

**解決**: `.env.local`ファイルを保存（Ctrl+S）

### 問題4: .env.localファイルの場所が間違っている

**確認**: `.env.local`ファイルがプロジェクトのルートディレクトリ（`package.json`と同じ場所）にあるか

### 問題5: 値の前後にスペースがある

**確認**: 環境変数の値に余分なスペースがないか確認

```bash
# ❌ 間違い
TWITTER_API_KEY= 0QdwZhPitmIc4BjIzoprXERoo 

# ✅ 正しい
TWITTER_API_KEY=0QdwZhPitmIc4BjIzoprXERoo
```

### 問題6: 引用符で囲んでいる

**確認**: 環境変数の値を引用符で囲んでいないか確認

```bash
# ❌ 間違い
TWITTER_API_KEY="0QdwZhPitmIc4BjIzoprXERoo"

# ✅ 正しい
TWITTER_API_KEY=0QdwZhPitmIc4BjIzoprXERoo
```

## 📋 チェックリスト

- [ ] `.env.local`ファイルがプロジェクトルートにある
- [ ] 環境変数名が正確（`TWITTER_API_SECRET`）
- [ ] 値の前後にスペースがない
- [ ] 引用符で囲んでいない
- [ ] ファイルを保存した
- [ ] 開発サーバーを完全に再起動した
- [ ] `/api/test-twitter-config`で設定を確認した
- [ ] サーバーのログで環境変数が読み込まれているか確認した

## 🆘 それでも解決しない場合

1. `.env.local`ファイルを一度削除して再作成
2. 環境変数を1つずつ追加して確認
3. 開発サーバーを再起動して確認

この手順で解決するはずです！
