# Square Developer 設定ガイド

## 1. Square Developerアカウント作成

1. https://developer.squareup.com/ にアクセス
2. 「Get Started」をクリック
3. Square アカウントでログイン（なければ作成）

## 2. アプリケーション作成

1. Dashboard → 「Create your first application」
2. アプリケーション名: 「姓名判断アプリ」
3. 「Create Application」をクリック

## 3. 認証情報取得

### サンドボックス（テスト用）
- Application ID: `sandbox-sq0idb-xxxxx`
- Access Token: `EAAAExxxxxx`
- Location ID: `LHxxxxxx`

### 本番環境
- Application ID: `sq0idp-xxxxx`
- Access Token: `EAAAExxxxxx`
- Location ID: `LMxxxxxx`

## 4. Webhook設定

1. Dashboard → Webhooks
2. 「Add Endpoint」
3. URL: `https://yourdomain.vercel.app/api/square-webhook`
4. Events: 
   - subscription.created
   - subscription.updated
   - subscription.canceled
5. 署名キーをコピー

## 5. サブスクリプションプラン作成

1. Dashboard → Subscriptions → Plans
2. ベーシックプラン:
   - 名前: Basic Plan
   - 価格: ¥220/月
   - ID: basic-plan
3. プレミアムプラン:
   - 名前: Premium Plan
   - 価格: ¥440/月
   - ID: premium-plan
