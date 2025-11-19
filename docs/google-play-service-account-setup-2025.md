# Google Play サービスアカウントキー設定ガイド（2025年最新版）

## 概要

Google Play ConsoleのUIが変更され、「API アクセス」セクションがなくなった場合の最新の設定方法です。

## 重要な変更点

Google Play ConsoleのUIが変更され、サービスアカウントキーの設定方法が変わりました。現在は、**Google Cloud Console**でサービスアカウントを作成し、**Google Play Console**で権限を付与する方法になっています。

## 設定手順（最新版）

### ステップ1: Google Cloud Consoleでサービスアカウントを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択（または新規作成）
3. **IAM & Admin** → **Service Accounts**を選択
4. **+ CREATE SERVICE ACCOUNT**をクリック
5. サービスアカウントの情報を入力：
   - **Service account name**: `google-play-billing-verification`（任意）
   - **Service account ID**: 自動生成
   - **Description**: `Google Play購入検証用`
6. **CREATE AND CONTINUE**をクリック
7. **Grant this service account access to project**はスキップ（後で設定）
8. **DONE**をクリック

### ステップ2: サービスアカウントキーを作成

1. 作成したサービスアカウントをクリック
2. **KEYS**タブを選択
3. **ADD KEY** → **Create new key**をクリック
4. **JSON**を選択
5. **CREATE**をクリック
6. JSONファイルがダウンロードされます

### ステップ3: Google Play Consoleで権限を付与

1. [Google Play Console](https://play.google.com/console)にアクセス
2. アプリを選択
3. **設定**（左メニュー）を選択
4. **API アクセス**または**開発者アカウント**セクションを探す
   - UIが変更されている場合は、**設定** → **開発者アカウント** → **API アクセス**を確認
5. サービスアカウントのメールアドレスをコピー（Google Cloud Consoleで確認）
6. **招待**または**追加**をクリック
7. 権限を付与：
   - **財務データの表示**
   - **注文と返金の管理**

### ステップ4: 環境変数を設定

#### 方法1: JSONファイルのパスを指定（ローカル開発用）

```env
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=./google-play-service-account-key.json
```

#### 方法2: JSON文字列を直接設定（Vercelなどの本番環境用）⭐ 推奨

1. ダウンロードしたJSONファイルを開く
2. 内容をコピー
3. Vercel Dashboard → **Settings** → **Environment Variables**
4. 新しい環境変数を追加：
   - **Name**: `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON`
   - **Value**: JSONファイルの内容をそのまま貼り付け
   - **Environment**: Production, Preview, Development（必要に応じて）

## 代替方法: 検証をスキップする（一時的な回避策）

サービスアカウントキーの設定が難しい場合、一時的に検証をスキップすることもできます。

**注意**: セキュリティのため、本番環境では必ず検証を行うことを推奨します。

### 検証をスキップする方法

環境変数を設定しない場合、コードで自動的に検証をスキップして成功を返します：

```typescript
// app/api/verify-google-play-purchase/route.ts
if (!auth) {
  // 認証が設定されていない場合は、検証をスキップ
  return NextResponse.json({
    success: true,
    verified: true,
    message: "Google Auth not configured, verification skipped",
  })
}
```

## トラブルシューティング

### 問題1: Google Play Consoleに「API アクセス」セクションが見つからない

**解決方法**:
1. **設定** → **開発者アカウント**を確認
2. **API アクセス**または**サービスアカウント**セクションを探す
3. UIが変更されている場合は、Google Play Consoleのヘルプを確認

### 問題2: サービスアカウントに権限を付与できない

**解決方法**:
1. Google Cloud Consoleでサービスアカウントのメールアドレスを確認
2. Google Play Consoleで正しいメールアドレスを入力
3. 権限を付与する際に、適切な権限を選択

### 問題3: 環境変数の設定が反映されない

**解決方法**:
1. Vercel Dashboardで環境変数が正しく設定されているか確認
2. デプロイメントを再実行
3. 環境変数の値に改行やスペースが含まれていないか確認

## 参考リンク

- [Google Cloud Console - Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
- [Google Play Console - API Access](https://play.google.com/console/developers)
- [Google Play Developer API - Authentication](https://developers.google.com/android-publisher/getting_started#using_a_service_account)

## 次のステップ

1. **サービスアカウントを作成** - Google Cloud Consoleで作成
2. **権限を付与** - Google Play Consoleで権限を付与
3. **環境変数を設定** - Vercel Dashboardで設定
4. **デプロイメントを再実行** - 環境変数を反映

問題が続く場合は、エラーメッセージの詳細を共有してください。


