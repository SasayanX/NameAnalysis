# 決済連携の信頼性向上案

## 🔍 現在の問題点

### 問題1: 決済完了とアプリの連携が不完全

- ❌ WebhookはSupabaseに保存するが、クライアント側のlocalStorageには直接書き込めない
- ❌ ユーザーが手動で「決済状況を確認」ボタンをクリックする必要がある
- ❌ メールアドレスをURLパラメータで渡す必要がある（不便）

### 問題2: Square Payment Linksの制限

- ❌ リダイレクトURLが設定できない
- ❌ 決済完了後の自動処理ができない
- ❌ カスタムパラメータを渡せない

## 💡 より確実な解決方法

### 方法1: Square Checkout APIに移行（最推奨）

**メリット**:
- ✅ リダイレクトURLを設定できる
- ✅ 決済完了後に自動的にアプリに戻れる
- ✅ URLパラメータでプラン情報を渡せる
- ✅ より確実な連携が可能

**実装イメージ**:
```typescript
// 1. Checkoutセッションを作成
const checkout = await createCheckoutSession({
  planId: "basic",
  amount: 330,
  redirectUrl: "https://your-app.com/subscription-success?plan=basic&email=kanaukiryu@gmail.com"
})

// 2. Checkout URLにリダイレクト
window.location.href = checkout.checkoutUrl

// 3. 決済完了後、自動的にredirectUrlに戻る
// 4. subscription-successページでプランを自動有効化
```

### 方法2: 決済完了メールに確認URLを含める

**メリット**:
- ✅ ユーザーが簡単にプランを有効化できる
- ✅ 現在の実装を維持できる

**実装**:
1. Square Payment Linkで決済完了時にメールが送信される
2. そのメールに確認URLを追加（手動でメール本文を編集）
3. ユーザーがURLをクリックすると自動的にプランが有効化

### 方法3: ポーリング機能の強化

**メリット**:
- ✅ 現在の実装を維持できる
- ✅ ユーザーの操作を最小限に

**実装**:
1. ページ読み込み時に自動的に決済情報を確認
2. メールアドレスをCookieやlocalStorageに保存
3. 一定時間内（例: 5分）であれば自動的に確認

## 🎯 推奨実装: Square Checkout APIへの移行

### ステップ1: Checkout APIエンドポイントの作成

```typescript
// app/api/square-checkout/create/route.ts
export async function POST(request: NextRequest) {
  const { planId, amount, email } = await request.json()
  
  const response = await fetch("https://connect.squareup.com/v2/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: `checkout_${planId}_${Date.now()}`,
      checkout_page_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?plan=${planId}&email=${email}`,
      order: {
        line_items: [{
          name: `${planId}プラン`,
          quantity: "1",
          base_price_money: {
            amount: amount * 100, // セント単位
            currency: "JPY"
          }
        }]
      }
    })
  })
  
  const result = await response.json()
  return NextResponse.json({ checkoutUrl: result.checkout.checkout_page_url })
}
```

### ステップ2: 決済ボタンの変更

```typescript
// components/square-checkout-button.tsx
const handleCheckout = async () => {
  const response = await fetch("/api/square-checkout/create", {
    method: "POST",
    body: JSON.stringify({ 
      planId, 
      amount: price,
      email: userEmail // ユーザーのメールアドレス
    })
  })
  const { checkoutUrl } = await response.json()
  window.location.href = checkoutUrl // リダイレクト
}
```

### ステップ3: 決済完了ページでの自動有効化

```typescript
// app/subscription-success/page.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const plan = params.get("plan")
  const email = params.get("email")
  
  if (plan && email) {
    // プランを直接有効化
    const subscription = {
      plan,
      expiresAt: new Date("2025-12-01"), // 次回請求日
      isActive: true,
      status: "active",
      paymentMethod: "square",
      amount: plan === "basic" ? 330 : 550,
      nextBillingDate: new Date("2025-12-01"),
      lastPaymentDate: new Date(),
    }
    
    localStorage.setItem("userSubscription", JSON.stringify({
      ...subscription,
      expiresAt: subscription.expiresAt.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      lastPaymentDate: subscription.lastPaymentDate.toISOString(),
    }))
    
    // WebhookでSupabaseにも保存（既に実装済み）
    // ページをリロード
    window.location.reload()
  }
}, [])
```

## 📊 比較表

| 方法 | 確実性 | 実装の複雑さ | UX | 推奨度 |
|------|--------|------------|-----|--------|
| **Square Payment Links（現状）** | 🟡 中 | 🔴 複雑 | 🟡 普通 | 🟡 |
| **Square Checkout API** | 🟢 高 | 🟢 シンプル | 🟢 良い | 🟢 推奨 |
| **メール確認URL** | 🟡 中 | 🟢 シンプル | 🟡 普通 | 🟡 |
| **ポーリング強化** | 🟡 中 | 🟡 普通 | 🟡 普通 | 🟡 |

## 🚨 現在の実装で確実に動作させる方法

### 即座に使える方法

1. **メールアドレスを保存**
   - 決済前にメールアドレスを入力してもらう
   - localStorageに保存: `localStorage.setItem("customerEmail", "kanaukiryu@gmail.com")`

2. **自動確認機能を強化**
   - ページ読み込み時に自動的にメールアドレスで確認
   - 決済情報があれば自動的に有効化

3. **決済完了メールにURLを追加**
   - Squareから送信されるメールに確認URLを追加
   - `https://your-app.com/my-subscription?email=kanaukiryu@gmail.com`

## ✅ 今すぐできる改善

現在の実装を維持しつつ、確実性を高める方法：

1. **メールアドレスをCookieに保存**
2. **ページ読み込み時に自動確認**
3. **決済完了メールに確認URLを追加**

これで、ユーザーがメールからURLをクリックするだけで、プランが自動的に有効化されます。

## 🎯 結論

**短期対応**: 現在の実装 + メール確認URL
**長期対応**: Square Checkout APIに移行

どちらを進めますか？

