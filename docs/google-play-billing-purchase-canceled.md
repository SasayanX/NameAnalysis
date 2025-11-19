# Google Play Billing - 購入キャンセルと検証エラー

## エラーメッセージ

```
[Google Play Billing] Launching PaymentRequest for SKU: premium_monthly
[Google Play Billing] Purchase failed: AbortError: Payment app returned RESULT_CANCELED code.
[Pricing] Google Play purchase error: AbortError: Payment app returned RESULT_CANCELED code.
POST https://seimei.app/api/verify-google-play-purchase 500 (Internal Server Error)
[Google Play Billing] Failed to activate plan premium: Purchase verification failed
```

## エラーの分析

### 1. 購入キャンセル（正常な動作）

```
Payment app returned RESULT_CANCELED code
```

これは、ユーザーが購入をキャンセルしたことを示しています。これは正常な動作です。

### 2. 購入検証の500エラー（問題）

```
POST https://seimei.app/api/verify-google-play-purchase 500 (Internal Server Error)
```

購入が成功した場合でも、検証APIで500エラーが発生しています。これは、Google Play Developer APIの認証エラーが原因の可能性が高いです。

## 原因

### 1. Google Play Developer APIのサービスアカウントキーが設定されていない ⭐ 最も可能性が高い

**確認方法**:
本番環境（Vercelなど）の環境変数を確認：

- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`

**解決方法**:
1. Google Play Consoleでサービスアカウントキーを作成
2. 環境変数を設定（Vercel Dashboard → Settings → Environment Variables）

### 2. サービスアカウントキーの権限が不足している

**解決方法**:
1. Google Play Console → **設定** → **API アクセス**
2. サービスアカウントに適切な権限を付与

### 3. パッケージ名の不一致

**確認方法**:
1. Google Play Console → **アプリの設定**
2. パッケージ名が`com.nameanalysis.ai`と一致しているか確認

## デバッグ手順

### ステップ1: エラーレスポンスの詳細を確認

次回購入を試したときに、Chrome DevToolsのConsoleタブで以下のログを確認：

```
[Google Play Billing] Verification API error: {
  status: 500,
  statusText: "Internal Server Error",
  error: "...",
  details: {...},
  fullResponse: {...}
}
```

### ステップ2: サーバー側のログを確認

本番環境（Vercelなど）のログを確認：

1. Vercel Dashboard → **Deployments** → 最新のデプロイメント
2. **Functions**タブを選択
3. `/api/verify-google-play-purchase`のログを確認

**確認すべきログ**:
```
[Google Play Billing] Purchase verification error: ...
[Google Play Billing] Error details: ...
```

### ステップ3: 環境変数を確認

本番環境の環境変数を確認：

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 以下の環境変数が設定されているか確認：
   - `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH`
   - `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`

## 一時的な回避策

認証が設定されていない場合、検証をスキップして成功を返すようになっています。ただし、本番環境では必ずGoogle Play Developer APIで検証することを推奨します。

## 次のステップ

1. **サーバー側のログを確認** - エラーの詳細を確認
2. **環境変数を確認** - サービスアカウントキーが設定されているか確認
3. **再度購入を試す** - エラーレスポンスの詳細を確認

問題が続く場合は、サーバー側のログの詳細を共有してください。


