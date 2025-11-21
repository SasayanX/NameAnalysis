/**
 * Google Play Billing初期化コンポーネント
 * アプリ起動時にDigital Goods APIを初期化し、購入状態を確認します
 */
"use client"

import { useEffect } from 'react'
import { GooglePlayBillingDetector } from '@/lib/google-play-billing-detector'
import { SubscriptionManager } from '@/lib/subscription-manager'
import { GOOGLE_PLAY_PRODUCT_IDS } from '@/lib/google-play-product-ids'

export function GooglePlayBillingInitializer() {
  useEffect(() => {
    const initializeAndCheckPurchases = async () => {
      try {
        const subscriptionManager = SubscriptionManager.getInstance()

        // サーバー側のサブスクリプション状態を同期 (エラーをキャッチしてログに記録するが、処理は続行)
        try {
          await subscriptionManager.syncSubscriptionFromServer()
        } catch (syncError) {
          console.warn('[Google Play Billing] SubscriptionManager initial sync failed (possibly not logged in):', syncError)
          // ログインしていない場合でも、Digital Goods APIの初期化は試みる
        }

        // Digital Goods APIを初期化
        const available = await GooglePlayBillingDetector.initialize()
        
        if (available) {
          console.log('[Google Play Billing] Initialized - GPCで商品追加が可能になります')
          
          // TWA環境で、購入状態を確認
          try {
            const purchases = await GooglePlayBillingDetector.getPurchases()
            
            if (purchases && purchases.length > 0) {
              console.log('[Google Play Billing] Found purchases:', purchases.length)
              
              // 有効な購入を確認し、SubscriptionManagerを更新
              for (const purchase of purchases) {
                // 商品IDからプランIDを判定
                const planId = purchase.itemId === GOOGLE_PLAY_PRODUCT_IDS.basic ? 'basic' 
                             : purchase.itemId === GOOGLE_PLAY_PRODUCT_IDS.premium ? 'premium' 
                             : null
                
                if (planId) {
                  // 購入レシートを検証してプランを有効化
                  const result = await subscriptionManager.startGooglePlayBillingSubscription(
                    planId,
                    purchase.purchaseToken
                  )
                  
                  if (result.success) {
                    console.log(`[Google Play Billing] Activated plan: ${planId}`)
                  } else {
                    console.warn(`[Google Play Billing] Failed to activate plan ${planId}:`, result.error)
                  }
                }
              }
            } else {
              console.log('[Google Play Billing] No active purchases found')
            }
          } catch (error) {
            console.warn('[Google Play Billing] Failed to check purchases:', error)
          }
        } else {
          console.log('[Google Play Billing] Not available (Web版またはTWA未対応環境)')
        }
      } catch (error) {
        console.warn('[Google Play Billing] Initialization error:', error)
      }
    }

    initializeAndCheckPurchases()
  }, [])

  // UI表示なし（バックグラウンドで初期化のみ）
  return null
}

