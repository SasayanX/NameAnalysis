# Google Play Billing - Bubblewrap実装ガイド

## 概要

Bubblewrapで作成したTWAアプリにGoogle Play Billingを実装する手順です。

## 前提条件

- Bubblewrap 1.8.2以上
- Google Play Developerアカウント
- Google Playマーチャントアカウント（課金設定用）
- 既存のBubblewrapプロジェクト

## ステップ1: twa-manifest.jsonの設定

`twa/twa-manifest.json`に`playBilling`機能を追加：

```json
{
  "features": {
    "playBilling": {
      "enabled": true
    }
  }
}
```

✅ **完了済み**: `twa-manifest.json`に`playBilling`機能を有効化済み

## ステップ2: Bubblewrapで再ビルド

```bash
cd twa
bubblewrap build
```

または、既存のAABを再生成：

```bash
bubblewrap update
bubblewrap build
```

## ステップ3: Google Play Consoleでの設定

### 3.1 サブスクリプション商品の作成

1. Google Play Consoleにログイン
2. アプリを選択 → **収益化** → **商品** → **サブスクリプション**
3. 以下の商品を作成：

#### ベーシックプラン
- **商品ID**: `basic-monthly` (例)
- **名前**: ベーシックプラン
- **説明**: 日常的に姓名判断を活用したい方に
- **価格**: 330円/月
- **課金期間**: 1ヶ月
- **無料トライアル**: 必要に応じて設定
- **基本期間**: 1ヶ月

#### プレミアムプラン
- **商品ID**: `premium-monthly` (例)
- **名前**: プレミアムプラン
- **説明**: 全機能を無制限で利用したいプロフェッショナル向け
- **価格**: 550円/月
- **課金期間**: 1ヶ月
- **無料トライアル**: 必要に応じて設定
- **基本期間**: 1ヶ月

### 3.2 マーチャントアカウントの設定

1. Google Play Console → **収益化** → **設定**
2. マーチャントアカウントを設定（初回のみ）
3. 銀行口座情報を登録
4. 税務情報を入力

## ステップ4: ウェブ側での実装

### 4.1 Digital Goods APIの使用

Digital Goods APIを使用して、Google Play Billingを呼び出します。

```typescript
// lib/google-play-billing.ts
export class GooglePlayBilling {
  private static service: DigitalGoodsService | null = null

  // Digital Goods APIの初期化
  static async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    // TWA環境でのみ利用可能
    if (!('getDigitalGoodsService' in window)) {
      console.warn('Digital Goods API is not available')
      return false
    }

    try {
      const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing')
      this.service = service
      return true
    } catch (error) {
      console.error('Failed to initialize Digital Goods API:', error)
      return false
    }
  }

  // 利用可能な商品一覧を取得
  static async getAvailableItems(): Promise<any[]> {
    if (!this.service) {
      await this.initialize()
    }

    if (!this.service) {
      throw new Error('Digital Goods API is not available')
    }

    try {
      const items = await this.service.listPurchases()
      return items
    } catch (error) {
      console.error('Failed to get available items:', error)
      throw error
    }
  }

  // 商品情報を取得
  static async getItemDetails(itemIds: string[]): Promise<any[]> {
    if (!this.service) {
      await this.initialize()
    }

    if (!this.service) {
      throw new Error('Digital Goods API is not available')
    }

    try {
      const details = await this.service.getDetails(itemIds)
      return details
    } catch (error) {
      console.error('Failed to get item details:', error)
      throw error
    }
  }

  // 購入を開始
  static async purchase(itemId: string): Promise<any> {
    if (!this.service) {
      await this.initialize()
    }

    if (!this.service) {
      throw new Error('Digital Goods API is not available')
    }

    try {
      const purchase = await this.service.purchase(itemId)
      return purchase
    } catch (error) {
      console.error('Failed to purchase:', error)
      throw error
    }
  }

  // TWA環境かどうかを判定
  static isTWAEnvironment(): boolean {
    if (typeof window === 'undefined') return false
    
    // TWA環境の判定方法
    // 1. Digital Goods APIが利用可能
    // 2. User-Agentに特定の文字列が含まれる
    // 3. CustomTabsを検出
    
    const hasDigitalGoods = 'getDigitalGoodsService' in window
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isCustomTabs = (window as any).chrome?.tabs?.query !== undefined
    
    return hasDigitalGoods && isAndroid && isCustomTabs
  }
}
```

### 4.2 購入フローの実装

```typescript
// components/google-play-billing-button.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GooglePlayBilling } from "@/lib/google-play-billing"

interface GooglePlayBillingButtonProps {
  planId: "basic" | "premium"
  price: number
  children: React.ReactNode
  className?: string
}

export function GooglePlayBillingButton({
  planId,
  price,
  children,
  className,
}: GooglePlayBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    // TWA環境かどうかを確認
    const checkAvailability = async () => {
      const isTWA = GooglePlayBilling.isTWAEnvironment()
      if (isTWA) {
        const initialized = await GooglePlayBilling.initialize()
        setIsAvailable(initialized)
      }
    }
    checkAvailability()
  }, [])

  const handlePurchase = async () => {
    if (!isAvailable) {
      alert('Google Play Billingは、Androidアプリ内でのみ利用可能です。')
      return
    }

    setIsLoading(true)
    try {
      // Google Play Consoleで設定した商品ID
      const productId = planId === 'basic' ? 'basic-monthly' : 'premium-monthly'
      
      const purchase = await GooglePlayBilling.purchase(productId)
      
      // 購入成功時の処理
      console.log('Purchase successful:', purchase)
      
      // サーバー側で購入を検証
      await verifyPurchase(purchase)
      
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('購入に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPurchase = async (purchase: any) => {
    // サーバー側で購入レシートを検証
    const response = await fetch('/api/verify-google-play-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
      }),
    })

    const result = await response.json()
    if (result.success) {
      // プランを有効化
      // SubscriptionManagerを更新
    }
  }

  if (!isAvailable) {
    // TWA環境でない場合は、Web版の決済ボタンを表示
    return null // または、Square決済ボタンにフォールバック
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? '読み込み中...' : children}
    </Button>
  )
}
```

### 4.3 購入状態の確認

```typescript
// アプリ起動時に購入状態を確認
useEffect(() => {
  const checkPurchases = async () => {
    if (GooglePlayBilling.isTWAEnvironment()) {
      try {
        const purchases = await GooglePlayBilling.getAvailableItems()
        // 有効な購入を確認
        for (const purchase of purchases) {
          // サーバー側で検証
          await verifyPurchase(purchase)
        }
      } catch (error) {
        console.error('Failed to check purchases:', error)
      }
    }
  }
  
  checkPurchases()
}, [])
```

## ステップ5: サーバー側での検証

### 5.1 Google Play Developer APIの設定

1. Google Cloud Consoleでプロジェクトを作成
2. Google Play Developer APIを有効化
3. サービスアカウントを作成
4. JSONキーをダウンロード
5. Google Play Consoleでサービスアカウントに権限を付与

### 5.2 購入レシートの検証

```typescript
// app/api/verify-google-play-purchase/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    const { purchaseToken, productId } = await request.json()

    // Google Play Developer APIを使用して購入を検証
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth,
    })

    const packageName = 'com.nameanalysis.ai'
    
    const result = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    })

    // 購入が有効かどうかを確認
    if (result.data.expiryTimeMillis) {
      const expiryTime = parseInt(result.data.expiryTimeMillis)
      const now = Date.now()
      
      if (expiryTime > now) {
        // 購入が有効
        // データベースにサブスクリプション情報を保存
        // ...
        
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid purchase' })
  } catch (error) {
    console.error('Purchase verification failed:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' })
  }
}
```

## ステップ6: プラットフォーム検出の実装

### 6.1 環境判定

```typescript
// lib/platform-detector.ts
export function getPaymentMethod(): 'google-play' | 'square' | 'gmo' {
  if (typeof window === 'undefined') return 'square'
  
  // TWA環境かどうかを判定
  const isTWA = GooglePlayBilling.isTWAEnvironment()
  
  if (isTWA) {
    return 'google-play'
  }
  
  // Web版では既存の決済方法を使用
  return 'square'
}
```

### 6.2 決済ボタンの切り替え

```typescript
// components/unified-payment-button.tsx
import { GooglePlayBillingButton } from './google-play-billing-button'
import { SquareCheckoutButton } from './square-checkout-button'
import { getPaymentMethod } from '@/lib/platform-detector'

export function UnifiedPaymentButton(props: any) {
  const paymentMethod = getPaymentMethod()
  
  if (paymentMethod === 'google-play') {
    return <GooglePlayBillingButton {...props} />
  }
  
  return <SquareCheckoutButton {...props} />
}
```

## ステップ7: テスト

### 7.1 内部テストトラック

1. Google Play Console → **テスト** → **内部テスト**
2. AABをアップロード
3. テストアカウントを追加
4. テスト用のGoogleアカウントで購入をテスト

### 7.2 ライセンステスト

1. Google Play Console → **設定** → **ライセンステスト**
2. テスト用のGoogleアカウントを追加
3. テストアカウントでの購入は実際に課金されない

## 注意事項

1. **Digital Goods APIの制限**:
   - TWA環境でのみ利用可能
   - 通常のブラウザでは利用できない

2. **商品IDの管理**:
   - Google Play Consoleで設定した商品IDと一致させる必要がある
   - 環境変数で管理することを推奨

3. **購入検証**:
   - 必ずサーバー側で購入を検証すること
   - クライアント側の検証のみでは不十分

4. **エラーハンドリング**:
   - ネットワークエラー、ユーザーキャンセルなどのエラーを適切に処理

## 参考資料

- [Digital Goods API - Chrome Developers](https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing)
- [Google Play Billing Library](https://developer.android.com/google/play/billing)
- [Google Play Developer API](https://developers.google.com/android-publisher)

## 次のステップ

1. ✅ `twa-manifest.json`の設定完了
2. ⏳ Bubblewrapで再ビルド
3. ⏳ Google Play Consoleで商品設定
4. ⏳ Digital Goods APIの実装
5. ⏳ サーバー側での検証実装
6. ⏳ テストとデバッグ

