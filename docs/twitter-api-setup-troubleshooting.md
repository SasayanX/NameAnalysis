# X（Twitter）投稿エラー解決ガイド

## 🔴 エラー内容

```
❌ X投稿失敗
エラー: Twitter API credentials are not configured. 
Set TWITTER_BEARER_TOKEN or OAuth credentials.
```

## 🔍 原因

環境変数が正しく設定されていない、または読み込まれていません。

## ✅ 解決方法

### Step 1: 環境変数の確認

#### ローカル開発環境（`.env.local`）

プロジェクトルートに`.env.local`ファイルを作成/編集：

```bash
# テキストのみのツイート用（最低限これだけでもOK）
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAEJ85AEAAAAA7Wy8JGmXpm64BujPjKc%2BSeOhbDQ%3DhUMaLygWbaiaAWN6z5W4YmS3jv4DZ5HWUbqtvp5X5RIqePZgSj

# 画像付きツイート用（オプション、画像付きが必要な場合のみ）
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=1918491750152478720-vqI4CWjfUKb5mvYK16D6ypwvPuubkd
TWITTER_ACCESS_TOKEN_SECRET=4Eh8S6kLxq8aOz1hTmk0VBqYJf9vBbZEthtzRievB2nqR
```

#### 本番環境（Vercel）

1. Vercel Dashboardにログイン
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の環境変数を追加：

| 環境変数名 | 値 | 説明 |
|-----------|-----|------|
| `TWITTER_BEARER_TOKEN` | `AAAAAAAA...` | テキストのみツイート用（必須） |
| `TWITTER_API_KEY` | `your_api_key` | 画像付きツイート用（オプション） |
| `TWITTER_API_SECRET` | `your_api_secret` | 画像付きツイート用（オプション） |
| `TWITTER_ACCESS_TOKEN` | `1918491750...` | 画像付きツイート用（オプション） |
| `TWITTER_ACCESS_TOKEN_SECRET` | `4Eh8S6kL...` | 画像付きツイート用（オプション） |

5. **Environment**で**Production**, **Preview**, **Development**すべてに適用
6. **Save**
7. **Redeploy**（再デプロイ）

### Step 2: 環境変数の確認方法

#### ローカル環境で確認

```bash
# Next.js開発サーバーを再起動
npm run dev
```

#### 本番環境で確認

API Routeで環境変数を確認するテストエンドポイントを作成：

```typescript
// app/api/test-twitter-config/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const hasBearerToken = !!process.env.TWITTER_BEARER_TOKEN
  const hasOAuth = !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET)
  
  return NextResponse.json({
    bearerToken: hasBearerToken ? '✅ 設定済み' : '❌ 未設定',
    oauth: hasOAuth ? '✅ 設定済み' : '❌ 未設定',
    canPostText: hasBearerToken,
    canPostImage: hasOAuth && hasBearerToken,
  })
}
```

### Step 3: 画像なしでテスト（一時的な解決策）

画像付きツイートが失敗する場合、一時的に画像生成を無効にしてテキストのみで投稿：

```typescript
// app/api/autopilot/execute/route.ts
// 一時的に画像生成をコメントアウト
// let imageBuffer: Buffer | undefined = undefined
// try {
//   const { generateNameResultImage } = await import('@/lib/name-result-image-generator')
//   ...
// } catch (imageError: any) {
//   ...
// }

// テキストのみで投稿
tweetId = await postToTwitter(tweetText, undefined) // 画像なし
```

## 📋 チェックリスト

### ローカル環境
- [ ] `.env.local`ファイルが存在する
- [ ] `TWITTER_BEARER_TOKEN`が設定されている
- [ ] 値に余分なスペースや引用符がない
- [ ] 開発サーバーを再起動した

### 本番環境（Vercel）
- [ ] Vercel Dashboardで環境変数が設定されている
- [ ] すべての環境（Production, Preview, Development）に設定されている
- [ ] 環境変数設定後に再デプロイした
- [ ] 環境変数名が正確（大文字小文字を含む）

## 🔧 よくある問題

### 問題1: 環境変数が読み込まれない

**原因**: Next.jsの環境変数は`NEXT_PUBLIC_`プレフィックスが必要（クライアント側の場合）

**解決策**: サーバー側（API Route）で使用する場合は、プレフィックス不要

```bash
# ✅ 正しい（サーバー側）
TWITTER_BEARER_TOKEN=xxx

# ❌ 間違い（クライアント側で使用する場合のみ必要）
NEXT_PUBLIC_TWITTER_BEARER_TOKEN=xxx
```

### 問題2: 画像付きツイートが失敗する

**原因**: `TWITTER_API_KEY`と`TWITTER_API_SECRET`が設定されていない

**解決策**: 
1. Twitter Developer PortalでAPI KeyとAPI Secretを取得
2. 環境変数に設定
3. または、画像なしでテキストのみで投稿（自動的にフォールバック）

### 問題3: 再デプロイ後もエラーが続く

**原因**: 環境変数のキャッシュ

**解決策**:
1. Vercel Dashboardで環境変数を確認
2. 一度削除して再追加
3. 完全に再デプロイ（Redeploy）

## 🎯 推奨設定

### 最小構成（テキストのみ）
```bash
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

### 完全構成（画像付き対応）
```bash
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

## 📝 次のステップ

1. ✅ 環境変数を設定
2. ✅ 再デプロイ（本番環境の場合）
3. ✅ オートパイロットを再実行
4. ✅ ログで投稿成功を確認

## 🆘 それでも解決しない場合

1. **ログを確認**: Vercel Dashboard → Functions → Logs
2. **環境変数の値**: 実際に設定されている値を確認（トークンが正しいか）
3. **Twitter APIの状態**: Twitter Developer PortalでAPIが有効か確認
4. **レート制限**: Twitter APIのレート制限に達していないか確認

## 💡 ヒント

- **テキストのみで十分な場合**: `TWITTER_BEARER_TOKEN`だけでOK
- **画像付きが必要な場合**: OAuth認証情報（4つ）も必要
- **開発環境**: `.env.local`を使用
- **本番環境**: Vercel Dashboardで設定

環境変数を正しく設定すれば、X投稿は正常に動作します！
