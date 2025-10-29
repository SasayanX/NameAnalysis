# Twitter APIキー取得場所ガイド

Twitter Developer PortalでAPIキーを取得する具体的な手順です。

## 前提条件

1. Developer Accountが承認済みであること
2. Appを作成済みであること

## APIキーの取得場所

### ステップ1: Twitter Developer Portalにアクセス

1. https://developer.twitter.com/en/portal/dashboard にアクセス
2. Xアカウントでログイン

### ステップ2: プロジェクトとAppを選択

1. 左サイドバーの「Projects & Apps」をクリック
2. 作成したプロジェクトを選択（もしくは新規作成）
3. プロジェクト内のAppを選択

### ステップ3: Keys and tokensタブを開く

Appの詳細画面で以下のタブがあります：

```
Overview | Keys and tokens | Settings | Analytics
```

「**Keys and tokens**」タブをクリック

### ステップ4: APIキーを確認・生成

「Keys and tokens」タブ内に以下のセクションがあります：

#### 🔑 Consumer Keys（API Key & Secret）

ここに以下が表示されます：

1. **API Key**
   - 表示：`xK9...` のような形式
   - コピーアイコンをクリックしてコピー
   - これが `TWITTER_API_KEY`

2. **API Key Secret**
   - 表示：「Reveal」ボタンまたは「Show」をクリック
   - パスワード確認後、表示される
   - コピーアイコンをクリックしてコピー
   - これが `TWITTER_API_SECRET`

⚠️ **注意**: 初回作成時は自動生成されますが、表示されない場合は「Regenerate」ボタンで再生成できます。

#### 🔐 Authentication Tokens（Access Token & Secret）

1. 「**Access Token and Secret**」セクションを見つける
2. 「Generate」ボタンをクリック（既にある場合は表示されている）
3. **Access Token**
   - コピーアイコンでコピー
   - これが `TWITTER_ACCESS_TOKEN`

4. **Access Token Secret**
   - 「Reveal」ボタンをクリック
   - パスワード確認後、表示される
   - コピーアイコンでコピー
   - これが `TWITTER_ACCESS_TOKEN_SECRET`

⚠️ **重要**: これらのトークンは一度しか表示されません。必ず安全な場所に保存してください。

#### 🎫 Bearer Token（推奨）

1. 「**Bearer Token**」セクションを探す
2. 「Generate」ボタンをクリック
3. 表示されたBearer Tokenをコピー
   - これが `TWITTER_BEARER_TOKEN`
   - これ一つだけで投稿できるので便利

⚠️ **注意**: 一部のAppではBearer Tokenが表示されない場合があります。その場合はOAuth 1.0a方式（上記のConsumer Keys + Access Tokens）を使用してください。

## 画面の見つけ方（スクリーンショット説明）

```
┌─────────────────────────────────────────┐
│  Twitter Developer Portal               │
├─────────────────────────────────────────┤
│  [Projects & Apps] ← ここをクリック    │
│                                         │
│  My Project                             │
│  └─ My App ← ここをクリック            │
│                                         │
│  [Overview] [Keys and tokens] ← ここ！ │
│                                         │
│  ═════════════════════════════════════ │
│                                         │
│  🔑 Consumer Keys                      │
│  API Key: xK9...ABC [📋 Copy]          │
│  API Key Secret: [Reveal]             │
│                                         │
│  🔐 Authentication Tokens               │
│  Access Token & Secret: [Generate]     │
│                                         │
│  🎫 Bearer Token                        │
│  Bearer Token: [Generate]              │
│                                         │
└─────────────────────────────────────────┘
```

## よくある質問

### Q: 「Keys and tokens」タブが見つからない

**A**: 以下の点を確認してください：
1. Developer Accountが承認されているか
2. Appが正常に作成されているか
3. ブラウザをリフレッシュしてみる

### Q: API Keyが表示されない

**A**: 
1. Appを新規作成した場合、自動生成されます
2. 表示されない場合は「Regenerate」ボタンで再生成
3. それでも表示されない場合は、Appの作成に失敗している可能性があります

### Q: Bearer Tokenが表示されない

**A**: 
1. 一部のAppタイプではBearer Tokenが利用できない場合があります
2. OAuth 1.0a方式（Consumer Keys + Access Tokens）を使用してください

### Q: トークンが漏洩した可能性がある

**A**:
1. 該当するセクションの「Regenerate」ボタンをクリック
2. 新しいトークンを生成
3. 古いトークンは無効になります
4. 環境変数を更新して再デプロイ

## 設定後の確認

環境変数を設定後、以下で確認できます：

```bash
# ローカル環境
echo $TWITTER_BEARER_TOKEN

# Vercel環境
# Vercel Dashboard → Settings → Environment Variables で確認
```

## 次のステップ

1. 取得したトークンを環境変数に設定
2. デプロイを再実行
3. テスト投稿を実行（`/api/autopilot/execute` にGETリクエスト）

以上の手順でAPIキーを取得できます。

