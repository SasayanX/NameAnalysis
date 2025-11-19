# Webhookサブスクリプション vs Squareサブスクリプションプラン

## 🔍 重要な違い

これらは**全く別物**です。混同しやすいので、明確に区別してください。

---

## 1. Webhookサブスクリプション（Webhook設定）

### 目的
Squareから**決済イベントの通知を受信する**ための設定

### 何をするか
- Squareが決済イベント（決済完了、サブスクリプション作成など）を検知
- あなたのサーバー（`/api/square-webhook`）にHTTPリクエストを送信
- サーバー側でイベントを処理（プラン有効化、データベース更新など）

### 設定場所
- Square Developer Dashboard → **Webhooks** セクション
- エンドポイントURL: `https://your-domain.com/api/square-webhook`
- 購読するイベント:
  - `subscription.created`（サブスクリプション作成時）
  - `subscription.updated`（サブスクリプション更新時）
  - `subscription.canceled`（サブスクリプションキャンセル時）
  - `invoice.payment_made`（請求書支払い完了時）

### 例
```
Square側で決済が完了
  ↓
SquareがWebhookイベントを送信
  ↓
/api/square-webhook が受信
  ↓
プランを有効化、データベース更新
```

---

## 2. Squareサブスクリプションプラン（商品プラン）

### 目的
顧客が**定期購入する商品**を定義する

### 何をするか
- 月額330円の「ベーシックプラン」
- 月額550円の「プレミアムプラン」
- などの商品プランを作成

### 設定場所
- Square Developer Dashboard → **商品とサービス** → **サブスクリプションプラン**
- または Square Catalog API で作成

### 例
```
ベーシックプラン:
  - 名前: "ベーシックプラン"
  - 価格: 330円/月
  - プランID: "BASIC_MONTHLY" または "catalog_object_id"

プレミアムプラン:
  - 名前: "プレミアムプラン"
  - 価格: 550円/月
  - プランID: "PREMIUM_MONTHLY" または "catalog_object_id"
```

### 環境変数での設定
```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=プランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=プランID
```

---

## 📊 比較表

| 項目 | Webhookサブスクリプション | Squareサブスクリプションプラン |
|------|-------------------------|---------------------------|
| **目的** | イベント通知を受信 | 商品プランを定義 |
| **設定場所** | Webhooks セクション | 商品とサービス セクション |
| **必要なもの** | エンドポイントURL、署名キー | プラン名、価格、プランID |
| **用途** | 決済完了後の処理 | 顧客が購入する商品 |
| **例** | `subscription.created` イベントを受信 | 月額330円のプラン |

---

## 🔄 実際の流れ

### 1. サブスクリプションプランを作成
```
Square Developer Dashboard
  → 商品とサービス
    → サブスクリプションプラン
      → ベーシックプラン（330円/月）を作成
      → プランID: "BASIC_MONTHLY" を取得
```

### 2. プランIDを環境変数に設定
```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=BASIC_MONTHLY
```

### 3. 顧客が決済
```
顧客が決済ボタンをクリック
  → Square Subscriptions APIでサブスクリプション作成
  → プランID "BASIC_MONTHLY" を使用
```

### 4. Webhookで通知を受信
```
Squareが subscription.created イベントを送信
  → /api/square-webhook が受信
  → プランを有効化、データベース更新
```

---

## ✅ 現在必要な設定

### 1. Squareサブスクリプションプラン（商品プラン）を作成

**これが現在不足しています！**

以下のいずれかの方法で作成：

#### 方法A: APIで作成
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

#### 方法B: Square Developer Dashboardで手動作成
1. Square Developer Dashboard → 商品とサービス → サブスクリプションプラン
2. プランを作成
3. プランIDをコピー

### 2. プランIDを環境変数に設定
```env
SQUARE_SUBSCRIPTION_PLAN_ID_BASIC=取得したプランID
SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM=取得したプランID
```

### 3. Webhookサブスクリプション（既に設定済みの場合）
- 既に設定されている場合はそのままでOK
- 未設定の場合は、後で設定（決済は動作しますが、自動有効化されない）

---

## 🎯 まとめ

- **Webhookサブスクリプション**: イベント通知を受信する設定（既に設定済みの可能性あり）
- **Squareサブスクリプションプラン**: 顧客が購入する商品プラン（**今作成が必要**）

現在のエラーは、**Squareサブスクリプションプラン（商品プラン）が作成されていない**ことが原因です。

まずは、サブスクリプションプランを作成してください！



