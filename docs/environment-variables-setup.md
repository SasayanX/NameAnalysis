# 環境変数の設定場所ガイド

## 基本的な考え方

環境変数の設定は**用途別**に行います：

1. **ローカル開発環境**: `.env.local` に設定
2. **本番環境**: デプロイ先（Vercel または Netlify）の環境変数に設定

**片方だけでOK**ですが、ローカルでテストする場合は `.env.local` も必要です。

## このプロジェクトの場合

プロジェクトにはVercelとNetlifyの両方の設定があります：

- `vercel.json` → Vercel用のcron設定
- `netlify.toml` → Netlify用のscheduled functions設定

### 使用しているデプロイ先を確認

どちらを使用しているか確認してください：

#### Vercelを使用している場合

**設定場所**: Vercel Dashboard

1. https://vercel.com/dashboard
2. プロジェクトを選択
3. Settings → Environment Variables

#### Netlifyを使用している場合

**設定場所**: Netlify Dashboard

1. https://app.netlify.com
2. サイトを選択
3. Site configuration → Environment variables

### 推奨設定方法

#### パターン1: 両方にデプロイしている場合

- **Vercel**: Vercel Dashboardの環境変数に設定
- **Netlify**: Netlify Dashboardの環境変数に設定
- **ローカル**: `.env.local` に設定（開発・テスト用）

#### パターン2: 片方のみ使用している場合

- **デプロイ先**: 使用している方のDashboardで環境変数を設定
- **ローカル**: `.env.local` に設定（オプション、ローカルでテストする場合のみ）

## 具体的な設定

### ローカル開発環境（.env.local）

プロジェクトルートに `.env.local` を作成/編集：

```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAAx4XEj5rrjyRzItG8329lbKMIQ9O%3D3g0M0gziauEh5Xla6HIGAEQddUJc8cElXTTD15Thg2jmMMMDV7
TWITTER_ACCESS_TOKEN=1918491750152478720-pi0feBTRYdNnCwzXwZ2SkOLdsxiq7j
TWITTER_ACCESS_TOKEN_SECRET=mZdiP68pgJ4auLpJENxNQL1nm0VrXW23mSkWs88N4wVEi
```

**使用する場合**:
- ローカルで開発サーバー（`npm run dev`）を起動する場合
- ローカルでテストする場合

**不要な場合**:
- ローカルで開発しない場合（クラウドのみで動作）

### Vercel本番環境

Vercel Dashboard → Settings → Environment Variables に以下を追加：

```
TWITTER_BEARER_TOKEN = AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAAx4XEj5rrjyRzItG8329lbKMIQ9O%3D3g0M0gziauEh5Xla6HIGAEQddUJc8cElXTTD15Thg2jmMMMDV7
TWITTER_ACCESS_TOKEN = 1918491750152478720-pi0feBTRYdNnCwzXwZ2SkOLdsxiq7j
TWITTER_ACCESS_TOKEN_SECRET = mZdiP68pgJ4auLpJENxNQL1nm0VrXW23mSkWs88N4wVEi
```

**環境**: Production, Preview, Development すべてにチェック

### Netlify本番環境

Netlify Dashboard → Site configuration → Environment variables に以下を追加：

```
TWITTER_BEARER_TOKEN = AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAAx4XEj5rrjyRzItG8329lbKMIQ9O%3D3g0M0gziauEh5Xla6HIGAEQddUJc8cElXTTD15Thg2jmMMMDV7
TWITTER_ACCESS_TOKEN = 1918491750152478720-pi0feBTRYdNnCwzXwZ2SkOLdsxiq7j
TWITTER_ACCESS_TOKEN_SECRET = mZdiP68pgJ4auLpJENxNQL1nm0VrXW23mSkWs88N4wVEi
```

## まとめ

| 場所 | 必須 | 使用目的 |
|------|------|----------|
| `.env.local` | オプション | ローカル開発・テスト用 |
| Vercel環境変数 | 使用する場合のみ | Vercelデプロイ時の本番環境 |
| Netlify環境変数 | 使用する場合のみ | Netlifyデプロイ時の本番環境 |

**結論**: 
- **本番環境**: 使用しているデプロイ先（VercelまたはNetlify）に設定
- **ローカル**: テストする場合のみ `.env.local` に設定

両方に設定する必要はありません。使用しているデプロイ先に合わせて設定してください。

