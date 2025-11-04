# Squareサブスクリプションプラン作成ガイド

## 📋 概要

Squareでサブスクリプションプランを作成し、そのリンクで決済できるようにする手順です。

- **ベーシックプラン**: 330円/月
- **プレミアムプラン**: 550円/月
- **頻度**: 1ヶ月ごと

## 🎯 方法1: Squareダッシュボードで手動作成（推奨）

### ステップ1: サブスクリプションプランを作成

1. **Squareダッシュボードにログイン**
   - https://squareup.com/dashboard にアクセス

2. **商品とサービス > サブスクリプションプラン** に移動
   - 左メニューから「商品とサービス」を選択
   - 「サブスクリプションプラン」タブをクリック

3. **「新しいプランを作成」をクリック**

4. **ベーシックプランの設定**
   - **プラン名**: `ベーシックプラン` または `Basic Plan`
   - **価格**: `330` 円
   - **請求頻度**: `1ヶ月ごと` または `Monthly`
   - **プランID**: `basic-plan` (自動生成されるか、手動で設定)
   - **説明**: (任意) 1日10回まで姓名判断、基本的な運勢分析など

5. **「保存」をクリック**

6. **プレミアムプランも同様に作成**
   - **プラン名**: `プレミアムプラン` または `Premium Plan`
   - **価格**: `550` 円
   - **請求頻度**: `1ヶ月ごと` または `Monthly`
   - **プランID**: `premium-plan`

### ステップ2: プランIDを確認

1. 作成したプランの詳細ページを開く
2. **プランID** をコピー（例: `BASIC_MONTHLY`, `PREMIUM_MONTHLY` など）

### ステップ3: 環境変数に設定

`.env.local` または本番環境の環境変数に以下を追加：

```env
# Square側で作成したサブスクリプションプランのID
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=your_basic_plan_id_here
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=your_premium_plan_id_here

# 既存のSquare設定
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_APPLICATION_ID=your_application_id
```

### ステップ4: Square Payment Linkを作成

1. **オンライン決済 > 支払いリンク** に移動
2. **「新しいリンクを作成」をクリック**
3. **商品タイプ**: 「サブスクリプション」を選択
4. **プラン選択**: 作成したプラン（ベーシックまたはプレミアム）を選択
5. **「リンクを作成」をクリック**
6. **生成されたリンクURLをコピー**

### ステップ5: 環境変数にPayment Linkを設定

```env
# Square Payment Links
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/xxxxx
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/xxxxx
```

## 🎯 方法2: APIでプログラム的に作成

### ステップ1: サブスクリプションプランを作成

```bash
# ベーシックプランを作成
curl -X POST http://localhost:3000/api/square-subscription-plans/create \
  -H "Content-Type: application/json" \
  -d '{"planId": "basic"}'

# プレミアムプランを作成
curl -X POST http://localhost:3000/api/square-subscription-plans/create \
  -H "Content-Type: application/json" \
  -d '{"planId": "premium"}'
```

### ステップ2: レスポンスからプランIDを取得

レスポンス例：
```json
{
  "success": true,
  "plan": {
    "id": "BASIC_MONTHLY_1234567890",
    "name": "ベーシックプラン",
    "price": 330,
    "planId": "basic"
  },
  "envVariable": {
    "name": "SQUARE_SUBSCRIPTION_PLAN_ID_BASIC",
    "value": "BASIC_MONTHLY_1234567890"
  }
}
```

### ステップ3: 環境変数に設定

レスポンスの `envVariable` を参考に、環境変数を設定します。

### ステップ4: 既存のプラン一覧を確認

```bash
curl http://localhost:3000/api/square-subscription-plans/create
```

## 🔗 Payment Linkの作成

### 方法A: Squareダッシュボードで手動作成（推奨）

1. **オンライン決済 > 支払いリンク** に移動
2. **「新しいリンクを作成」をクリック**
3. **商品タイプ**: 「サブスクリプション」を選択
4. **プラン選択**: 作成したプランを選択
5. **リンクを作成**

### 方法B: APIで作成（一時的なリンク）

```bash
curl -X POST http://localhost:3000/api/square-payment-links/create \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "subscriptionPlanId": "BASIC_MONTHLY_1234567890"
  }'
```

**注意**: APIで作成したリンクは一時的なものです。永続的なリンクを作成するには、Squareダッシュボードで手動作成してください。

## ✅ 動作確認

### 1. プランが正しく作成されているか確認

```bash
# 既存のプラン一覧を取得
curl http://localhost:3000/api/square-subscription-plans/create
```

### 2. Payment Linkが動作するか確認

1. `/pricing` ページにアクセス
2. 「ベーシックプラン」または「プレミアムプラン」をクリック
3. Square Payment Linkにリダイレクトされることを確認
4. テスト決済を実行

### 3. Webhookが正しく動作するか確認

1. SquareダッシュボードでWebhookを設定
2. テスト決済を実行
3. `/api/square-webhook` でWebhookが受信されることを確認

## 📝 環境変数チェックリスト

以下の環境変数がすべて設定されているか確認：

```env
# Square認証情報
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_APPLICATION_ID=your_application_id

# SquareサブスクリプションプランID
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=your_basic_plan_id
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=your_premium_plan_id

# Square Payment Links
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/xxxxx
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/xxxxx

# Webhook
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
```

## 🚨 トラブルシューティング

### エラー: "SquareサブスクリプションプランIDが設定されていません"

→ 環境変数 `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC` と `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM` が設定されているか確認してください。

### エラー: "サブスクリプションプランの作成に失敗しました"

→ Square APIの認証情報（`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`）が正しく設定されているか確認してください。

### Payment Linkが動作しない

→ Square Payment LinkのURLが正しく設定されているか、Squareダッシュボードでリンクが有効になっているか確認してください。

## 📚 参考資料

- [Square Subscriptions API ドキュメント](https://developer.squareup.com/docs/subscriptions-api/overview)
- [Square Payment Links ドキュメント](https://developer.squareup.com/docs/payment-links)
- [Square Catalog API ドキュメント](https://developer.squareup.com/docs/catalog-api/overview)

