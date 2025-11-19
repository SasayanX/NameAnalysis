# Square SDK統合提案（Payment Link → SDK方式への移行）

## 🎯 目的

現在のPayment Link方式から、Square Web Payments SDK方式に移行することで、以下の課題を解決します：

1. ✅ **テスト環境の扱いがシンプルになる**（環境変数で自動切り替え）
2. ✅ **アプリ内で完結**（リダイレクト不要）
3. ✅ **決済完了を即座に検知**（Webhook待ち不要）
4. ✅ **より統合的なUX**（スムーズな決済フロー）

## 📊 現在の実装 vs SDK方式

### 現在の方式（Payment Link）

```typescript
// 問題点
- 環境ごとにPayment Linkを作り直す必要がある
- リダイレクトが必要（UXが分断される）
- 決済完了の検知がWebhookのみ
- テスト環境の扱いが複雑
```

### SDK方式（提案）

```typescript
// メリット
- 環境変数で自動切り替え（SQUARE_ENVIRONMENT=sandbox）
- アプリ内で完結（リダイレクト不要）
- 決済完了を即座に検知可能
- テスト環境の扱いがシンプル
```

## 🔧 実装方法

### 1. 既存のSDK実装を活用

既に以下のコンポーネントが存在します：
- `components/square-payment-form.tsx` - 完全なSDK実装
- `components/square-payment-button.tsx` - シンプルなSDK実装

### 2. 環境変数で自動切り替え

```typescript
// lib/square-sdk-config.ts
import { getCurrentConfig } from "./square-config"

export function getSquareSDKConfig() {
  const config = getCurrentConfig()
  
  return {
    applicationId: config.applicationId,
    locationId: config.locationId,
    environment: config.environment, // 'sandbox' or 'production'
  }
}
```

### 3. SDK初期化の改善

```typescript
// components/square-payment-form.tsx の改善版
const initializeSquare = async () => {
  const sdkConfig = getSquareSDKConfig()
  
  // 環境に応じて自動的にSandbox/Productionを切り替え
  const payments = window.Square.payments(
    sdkConfig.applicationId,
    sdkConfig.locationId
  )
  
  // Sandbox環境では自動的にテストモードになる
  const cardElement = await payments.card()
  await cardElement.attach("#card-container")
}
```

### 4. サブスクリプション作成API

```typescript
// app/api/square-subscription/create/route.ts
import { getCurrentConfig } from "@/lib/square-config"
import { SquarePaymentClient } from "@/lib/square-payment-client"

export async function POST(request: NextRequest) {
  const { planId, cardNonce, customerEmail } = await request.json()
  
  const config = getCurrentConfig()
  const client = new SquarePaymentClient()
  
  // サブスクリプション作成
  const subscription = await client.createSubscription(planId, cardNonce)
  
  // 決済完了を即座に検知可能
  return NextResponse.json({
    success: true,
    subscriptionId: subscription.id,
    message: "決済が完了しました"
  })
}
```

## 📋 移行手順

### Step 1: 環境変数の設定

`.env.local`:
```env
# Square SDK用設定
SQUARE_ENVIRONMENT=sandbox  # または production
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-xxxxx  # Sandbox/Productionで自動切り替え
NEXT_PUBLIC_SQUARE_LOCATION_ID=LMxxxxxx  # Sandbox/Productionで自動切り替え
```

### Step 2: 既存コンポーネントの更新

`components/square-checkout-button.tsx` を更新：
- Payment Link方式からSDK方式に変更
- `SquarePaymentForm` コンポーネントを使用

### Step 3: テスト環境の確認

```typescript
// テスト環境では自動的にSandboxモード
// テストカード: 4111 1111 1111 1111
// 環境変数 SQUARE_ENVIRONMENT=sandbox で自動切り替え
```

## ✅ メリット

### 1. テスト環境の扱いがシンプル

**Before (Payment Link方式)**:
```typescript
// 環境ごとにPayment Linkを作り直す必要がある
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_SANDBOX=https://square.link/u/xxxxx
NEXT_PUBLIC_SQUARE_PAYMENT_LINK_BASIC_PRODUCTION=https://square.link/u/yyyyy
```

**After (SDK方式)**:
```typescript
// 環境変数一つで自動切り替え
SQUARE_ENVIRONMENT=sandbox  // または production
// 同じコード、同じ設定で動作
```

### 2. アプリ内で完結

**Before**:
- Payment Linkにリダイレクト
- 決済完了後に手動で戻る必要がある
- Webhook待ちが必要

**After**:
- アプリ内で決済完了
- 即座に結果を検知
- スムーズなUX

### 3. エラーハンドリングが改善

```typescript
// SDK方式では、エラーを即座に検知可能
try {
  const tokenResult = await card.tokenize()
  if (tokenResult.status === "OK") {
    // 成功処理
  } else {
    // エラーを即座に表示
    toast.error(tokenResult.errors[0].detail)
  }
} catch (error) {
  // エラーハンドリング
}
```

## 🚀 実装例

### 統合された決済コンポーネント

```typescript
// components/integrated-square-payment.tsx
"use client"

import { SquarePaymentForm } from "./square-payment-form"
import { getSquareSDKConfig } from "@/lib/square-sdk-config"

export function IntegratedSquarePayment() {
  const sdkConfig = getSquareSDKConfig()
  
  return (
    <div>
      <h2>プランを選択</h2>
      <SquarePaymentForm />
      {/* 環境表示（開発時のみ） */}
      {process.env.NODE_ENV === "development" && (
        <p>環境: {sdkConfig.environment}</p>
      )}
    </div>
  )
}
```

## 📝 注意事項

### 1. PCI準拠

Square Web Payments SDKはPCI準拠済み：
- カード情報はSquare側で処理
- アプリ側でカード情報を保存する必要がない
- PCI準拠の責任はSquare側

### 2. サブスクリプションプランの設定

Squareダッシュボードでサブスクリプションプランを作成：
- Sandbox環境でテストプランを作成
- Production環境で本番プランを作成
- プランIDを環境変数で管理

### 3. Webhookの設定

決済完了の検知は2つの方法：
1. **SDK方式**: 即座に検知（推奨）
2. **Webhook方式**: バックアップ（サーバー側での確認用）

## 🎯 次のステップ

1. ✅ 既存のSDK実装を確認
2. ⏳ 環境変数での自動切り替えを実装
3. ⏳ `SquareCheckoutButton` をSDK方式に更新
4. ⏳ テスト環境での動作確認
5. ⏳ 本番環境へのデプロイ

## 📚 参考資料

- [Square Web Payments SDK Documentation](https://developer.squareup.com/docs/web-payments/overview)
- [Square Subscriptions API](https://developer.squareup.com/reference/square/subscriptions-api)
- 既存実装: `components/square-payment-form.tsx`



