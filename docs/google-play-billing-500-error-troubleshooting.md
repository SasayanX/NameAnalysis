# Google Play Billing - 500エラー トラブルシューティング

## エラーメッセージ

```
POST https://seimei.app/api/verify-google-play-purchase 500 (Internal Server Error)
[Google Play Billing] Failed to activate plan premium: Purchase verification failed
```

## 原因

Google Play購入検証API（`/api/verify-google-play-purchase`）で500エラーが発生しています。考えられる原因：

### 1. Google Play Developer APIのサービスアカウントキーが設定されていない ⭐ 最も可能性が高い

**確認方法**:
本番環境（Vercelなど）の環境変数を確認：

- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH` - サービスアカウントキーのファイルパス
- `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON` - サービスアカウントキーのJSON文字列

**解決方法**:
1. Google Play Consoleでサービスアカウントキーを作成
2. 環境変数を設定：
   - 方法1: JSONファイルのパスを設定
     ```
     GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
     ```
   - 方法2: JSON文字列を直接設定（推奨）
     ```
     GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON={"type":"service_account",...}
     ```

### 2. サービスアカウントキーの権限が不足している

**確認方法**:
1. Google Play Console → **設定** → **API アクセス**
2. サービスアカウントに適切な権限が付与されているか確認

**解決方法**:
1. Google Play Console → **設定** → **API アクセス**
2. サービスアカウントを選択
3. **権限**を確認：
   - **財務データの表示**が必要
   - **注文と返金の管理**が必要

### 3. パッケージ名の不一致

**確認方法**:
1. Google Play Console → **アプリの設定**
2. パッケージ名が`com.nameanalysis.ai`と一致しているか確認

**解決方法**:
1. 環境変数`NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME`を設定
2. または、APIリクエストに`packageName`を追加

### 4. Google Play Developer APIの呼び出しエラー

**確認方法**:
サーバー側のログを確認：

```
[Google Play Billing] Purchase verification error: ...
[Google Play Billing] Error details: ...
```

**解決方法**:
- エラーの詳細を確認
- Google Play Developer APIの制限を確認

## デバッグ手順

### ステップ1: エラーレスポンスの詳細を確認

Chrome DevToolsのConsoleタブで、エラーレスポンスの詳細を確認：

```javascript
// エラーレスポンスを確認
fetch('/api/verify-google-play-purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    purchaseToken: 'test_token',
    productId: 'premium_monthly',
    planId: 'premium',
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))
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

### ステップ4: サービスアカウントキーを確認

1. Google Play Console → **設定** → **API アクセス**
2. サービスアカウントが作成されているか確認
3. サービスアカウントキーをダウンロード
4. 環境変数に設定

## 一時的な回避策

開発環境やテスト環境では、認証が設定されていない場合、検証をスキップして成功を返すようになっています。

本番環境でも同様の動作にする場合：

1. 環境変数`GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH`または`GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`を設定しない
2. コードで認証が設定されていない場合、検証をスキップして成功を返す

**注意**: 本番環境では、必ずGoogle Play Developer APIで検証することを推奨します。

## 次のステップ

1. **サーバー側のログを確認** - エラーの詳細を確認
2. **環境変数を確認** - サービスアカウントキーが設定されているか確認
3. **エラーレスポンスの詳細を確認** - Chrome DevToolsのConsoleタブで確認

問題が続く場合は、サーバー側のログの詳細を共有してください。


