# Squareサブスクリプションプランの設定方法

Square側で既に作成したサブスクリプションプランをアプリに割り当てる方法

## 方法1: Square Payment Linksを使用（推奨・最も簡単）

Square Payment Linksを直接使用する方法です。API呼び出しが不要で、最もシンプルです。

### 現在の設定

- ベーシックプラン: https://square.link/u/6sJ33DdY
- プレミアムプラン: https://square.link/u/TjSKFJhj

### 環境変数の設定

```env
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC=https://square.link/u/6sJ33DdY
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_PREMIUM=https://square.link/u/TjSKFJhj
```

### 動作

`SquareCheckoutButton`をクリックすると、対応するSquare Payment Linkに直接リダイレクトされます。
決済完了後、Square側で設定したリダイレクトURL（例: `/subscription-success`）に戻ります。

---

## 方法2: Square Subscriptions APIを使用

## 手順

### 1. Square側でplan_idを確認

1. Squareダッシュボードにログイン
2. **商品とサービス** > **サブスクリプションプラン** に移動
3. 作成したプランの詳細を開く
4. **プランID** をコピー（例: `BASIC_MONTHLY`, `PREMIUM_MONTHLY` など）

### 2. 環境変数を設定

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

### 3. マッピング確認

`lib/square-plan-mapping.ts` が自動的に以下のようにマッピングします：

- アプリ内プランID `"basic"` → 環境変数 `SQUARE_SUBSCRIPTION_PLAN_ID_BASIC`
- アプリ内プランID `"premium"` → 環境変数 `SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM`

### 4. 動作確認

1. `/api/square-checkout/create` または `/api/subscription/create` を呼び出す
2. `planId: "basic"` または `planId: "premium"` を指定
3. Square側のplan_idが正しく使用されることを確認

## API使用例

### Subscriptions APIを使用する場合

```typescript
// アプリ内プランIDからSquare側のplan_idを取得
const squarePlanId = getSquarePlanId("basic") // → SQUARE_SUBSCRIPTION_PLAN_ID_BASICの値

// Square Subscriptions APIでサブスクリプションを作成
const response = await fetch("https://connect.squareup.com/v2/subscriptions", {
  method: "POST",
  body: JSON.stringify({
    location_id: "...",
    plan_id: squarePlanId, // ← Square側で作成したplan_idを使用
    source_id: cardNonce,
  }),
})
```

### Webhookからの逆マッピング

Square Webhookで受信したplan_idからアプリ内プランIDを取得：

```typescript
const appPlanId = getAppPlanId(squarePlanId) // "basic" | "premium" | null
```

## トラブルシューティング

### エラー: "SquareサブスクリプションプランIDが設定されていません"

→ 環境変数が設定されていない可能性があります。`.env.local`を確認してください。

### plan_idが見つからない

→ SquareダッシュボードでプランIDを再確認してください。API経由で取得する場合は、Square Catalog APIを使用できます。

## Square Catalog APIでプラン一覧を取得

```typescript
// すべてのサブスクリプションプランを取得
const response = await fetch("https://connect.squareup.com/v2/catalog/search", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    object_types: ["SUBSCRIPTION_PLAN"],
  }),
})

const plans = await response.json()
// plans.objects にすべてのサブスクリプションプランが含まれます
```
