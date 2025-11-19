# Square SDK実装ガイド（Perplexity調査結果に基づく）

## 🚨 重要な発見：サブスクリプション作成の変更点

### 問題点

**既存の実装では動作しない可能性があります。**

既存コード（`lib/square-payment-client.ts`）:
```typescript
// ❌ これは動作しない可能性がある
body: JSON.stringify({
  location_id: this.config.locationId,
  plan_id: planId,
  source_id: cardNonce,  // ← 直接使えない！
  start_date: new Date().toISOString().split("T")[0],
})
```

### 正しい実装方法

**Perplexity調査結果によると**：
- `source_id`（card nonce）は直接 `createSubscription` で使えない
- まず `CreateCard` APIでカードを登録し、そのIDをサブスクAPIで指定する必要がある

**正しいフロー**:
1. Web Payments SDKでカードnonce取得
2. `/cards` APIで `customer_id` と `nonce` でカード登録（cardId取得）
3. `/subscriptions` の `cardId` パラメータにセット

---

## 📝 実装ガイド（最新版）

### 1. SDKの読み込み方法

#### 推奨：公式Reactラッパーを使用

```bash
npm install react-square-web-payments-sdk
npm install --save-dev @square/web-payments-sdk-types
```

#### 実装例

```tsx
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk"

function SubscriptionForm() {
  const squareAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

  return (
    <PaymentForm
      applicationId={squareAppId}
      locationId={locationId}
      cardTokenizeResponseReceived={async (token) => {
        // カードnonce取得後の処理
        await handleCardToken(token)
      }}
    >
      <CreditCard />
    </PaymentForm>
  )
}
```

#### 手動実装（既存コードの改善）

```typescript
// lib/square-sdk-loader.ts
export function useSquareSdk(isSandbox: boolean) {
  useEffect(() => {
    const url = isSandbox
      ? "https://sandbox.web.squarecdn.com/v1/square.js"
      : "https://web.squarecdn.com/v1/square.js"
    
    if (document.querySelector(`script[src="${url}"]`)) return
    
    const script = document.createElement("script")
    script.src = url
    script.async = true
    document.head.appendChild(script)
    
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [isSandbox])
}
```

### 2. サブスクリプション作成の正しい実装

#### Step 1: カードを登録（CreateCard API）

```typescript
// app/api/square-cards/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getCurrentConfig } from "@/lib/square-config"

export async function POST(request: NextRequest) {
  try {
    const { cardNonce, customerId } = await request.json()
    const config = getCurrentConfig()
    
    // CreateCard APIでカードを登録
    const response = await fetch("https://connect.squareup.com/v2/cards", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2025-11-18", // 最新版を確認
      },
      body: JSON.stringify({
        source_id: cardNonce, // Web Payments SDKで取得したnonce
        card: {
          customer_id: customerId, // 顧客ID（必須）
        },
      }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.errors },
        { status: response.status }
      )
    }
    
    return NextResponse.json({
      success: true,
      cardId: result.card.id, // このIDをサブスクリプション作成で使用
    })
  } catch (error) {
    console.error("Card creation error:", error)
    return NextResponse.json(
      { success: false, error: "Card creation failed" },
      { status: 500 }
    )
  }
}
```

#### Step 2: サブスクリプションを作成（CreateSubscription API）

```typescript
// lib/square-payment-client.ts（修正版）
import { getCurrentConfig } from "./square-config"

export class SquarePaymentClient {
  private config = getCurrentConfig()

  async createSubscription(planId: string, cardId: string, customerId: string) {
    try {
      const response = await fetch("https://connect.squareup.com/v2/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2025-11-18", // 最新版を確認
        },
        body: JSON.stringify({
          customer_id: customerId, // 顧客ID（必須）
          location_id: this.config.locationId, // 拠点ID（必須）
          plan_id: planId, // プランバリエーションID（必須）
          card_id: cardId, // CreateCardで取得したcardId
          start_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD形式
          idempotency_key: `subscription_${planId}_${Date.now()}`, // 冪等性キー（必須）
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Square subscription creation failed:", error)
      throw error
    }
  }
}
```

#### Step 3: 完全なフロー実装

```typescript
// components/square-subscription-form.tsx
const handlePayment = async () => {
  try {
    // 1. カードをトークン化
    const tokenResult = await card.tokenize()
    if (tokenResult.status !== "OK") {
      throw new Error("カード情報の処理に失敗しました")
    }
    
    // 2. 顧客を作成または取得（必要に応じて）
    const customerId = await createOrGetCustomer(customerEmail)
    
    // 3. カードを登録
    const cardResponse = await fetch("/api/square-cards/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardNonce: tokenResult.token,
        customerId: customerId,
      }),
    })
    
    const cardData = await cardResponse.json()
    if (!cardData.success) {
      throw new Error(cardData.error || "カード登録に失敗しました")
    }
    
    // 4. サブスクリプションを作成
    const subscriptionResponse = await fetch("/api/square-subscription/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: selectedPlan,
        cardId: cardData.cardId, // CreateCardで取得したID
        customerId: customerId,
      }),
    })
    
    const subscriptionData = await subscriptionResponse.json()
    if (!subscriptionData.success) {
      throw new Error(subscriptionData.error || "サブスクリプション作成に失敗しました")
    }
    
    // 5. 成功処理
    toast.success("サブスクリプションが正常に作成されました")
  } catch (error) {
    toast.error(error.message || "決済処理中にエラーが発生しました")
  }
}
```

### 3. 環境切り替えの実装

```typescript
// lib/square-config.ts（改善版）
export function getSquareSDKUrl(): string {
  const isSandbox = process.env.SQUARE_ENVIRONMENT === "sandbox"
  return isSandbox
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js"
}

export function getSquareApplicationId(): string {
  const config = getCurrentConfig()
  return config.applicationId
}

export function getSquareLocationId(): string {
  const config = getCurrentConfig()
  return config.locationId
}
```

### 4. TypeScript型定義

```bash
npm install --save-dev @square/web-payments-sdk-types
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./node_modules/@square/web-payments-sdk-types"]
  }
}
```

---

## 🔧 既存コードの修正が必要な箇所

### 1. `lib/square-payment-client.ts`

**修正が必要**:
- `source_id` を直接使っている → `cardId` を使うように変更
- `customer_id` が不足 → 必須パラメータとして追加
- `idempotency_key` が不足 → 必須パラメータとして追加
- APIバージョンが古い → `2025-11-18` に更新

### 2. `components/square-payment-form.tsx`

**修正が必要**:
- カード登録APIを追加
- サブスクリプション作成前にカード登録を行う
- エラーハンドリングを改善

### 3. 新しいAPIエンドポイントの追加

**追加が必要**:
- `app/api/square-cards/create/route.ts` - カード登録API

---

## 📋 実装チェックリスト

- [ ] `@square/web-payments-sdk-types` をインストール
- [ ] `react-square-web-payments-sdk` を検討（推奨）
- [ ] `CreateCard` APIエンドポイントを実装
- [ ] `CreateSubscription` APIを修正（`cardId`を使用）
- [ ] `customer_id` の管理を実装
- [ ] `idempotency_key` を追加
- [ ] APIバージョンを `2025-11-18` に更新
- [ ] 環境切り替えロジックを実装
- [ ] エラーハンドリングを改善
- [ ] テスト環境で動作確認

---

## 🚨 注意事項

1. **顧客IDの管理**
   - `customer_id` は必須パラメータ
   - 顧客を作成するAPIも必要になる可能性がある

2. **APIバージョン**
   - `Square-Version: 2025-11-18` などの最新版を確認
   - 公式ドキュメントで最新版を確認すること

3. **エラーハンドリング**
   - `errors` オブジェクトの形式を確認
   - 適切なエラーメッセージを表示

4. **テスト環境**
   - Sandbox環境で十分にテスト
   - テストカード: `4111 1111 1111 1111`

---

## 🔗 参考リンク

- Square Web Payments SDK: https://developer.squareup.com/docs/web-payments/overview
- Square Subscriptions API: https://developer.squareup.com/docs/subscriptions-api/overview
- Square Cards API: https://developer.squareup.com/docs/cards-api/overview
- Reactラッパー: https://www.npmjs.com/package/react-square-web-payments-sdk
- TypeScript型定義: https://www.npmjs.com/package/@square/web-payments-sdk-types



