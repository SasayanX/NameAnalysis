/**
 * Google Play Billing初期化コンポーネント
 * アプリ起動時およびログイン時にDigital Goods APIを初期化し、購入状態を確認します
 */
"use client"

import { useEffect } from 'react'
import { GooglePlayBillingDetector } from '@/lib/google-play-billing-detector'
import { SubscriptionManager } from '@/lib/subscription-manager'
import { GOOGLE_PLAY_PRODUCT_IDS } from '@/lib/google-play-product-ids'
import { useAuth } from '@/components/auth/auth-provider'

export function GooglePlayBillingInitializer() {
  const { user } = useAuth()

  // TWA判定と初期化を行う共通関数
  const initializeAndCheckPurchases = async (context: string = 'initial') => {
    try {
      // まずTWA環境を判定（強化された判定ロジックを使用）
      const isTWA = GooglePlayBillingDetector.isTWAEnvironment()
      console.log(`[Google Play Billing] ${context}: TWA環境判定結果:`, isTWA)

      if (!isTWA) {
        console.log(`[Google Play Billing] ${context}: TWA環境ではありません。スキップします。`)
        return
      }

      // TWA環境が検出された場合、検出結果をキャッシュ
      if (typeof window !== "undefined") {
        localStorage.setItem("isTWAEnvironment", "true")
      }

      const subscriptionManager = SubscriptionManager.getInstance()

      // サーバー側のサブスクリプション状態を同期（ログイン済みの場合のみ）
      if (user) {
        try {
          await subscriptionManager.syncSubscriptionFromServer()
          console.log(`[Google Play Billing] ${context}: サブスクリプション状態を同期しました`)
        } catch (syncError) {
          console.warn(`[Google Play Billing] ${context}: SubscriptionManager sync failed:`, syncError)
          // エラーが発生しても続行
        }
      } else {
        console.log(`[Google Play Billing] ${context}: ログインしていないため、同期をスキップします`)
      }

      // Digital Goods APIを初期化
      const available = await GooglePlayBillingDetector.initialize()
      
      if (available) {
        console.log(`[Google Play Billing] ${context}: Digital Goods API初期化成功`)
        
        // TWA環境で、購入状態を確認
        try {
          const purchases = await GooglePlayBillingDetector.getPurchases()
          
          if (purchases && purchases.length > 0) {
            console.log(`[Google Play Billing] ${context}: 購入が見つかりました:`, purchases.length)
            
            // 有効な購入を確認し、SubscriptionManagerを更新
            for (const purchase of purchases) {
              // 商品IDからプランIDを判定
              const planId = purchase.itemId === GOOGLE_PLAY_PRODUCT_IDS.basic ? 'basic' 
                           : purchase.itemId === GOOGLE_PLAY_PRODUCT_IDS.premium ? 'premium' 
                           : null
              
              if (planId && user) {
                // 購入レシートを検証してプランを有効化
                const result = await subscriptionManager.startGooglePlayBillingSubscription(
                  planId,
                  purchase.purchaseToken
                )
                
                if (result.success) {
                  console.log(`[Google Play Billing] ${context}: プランを有効化しました: ${planId}`)
                } else {
                  console.warn(`[Google Play Billing] ${context}: プラン有効化に失敗: ${planId}`, result.error)
                }
              }
            }
          } else {
            console.log(`[Google Play Billing] ${context}: アクティブな購入は見つかりませんでした`)
          }
        } catch (error) {
          console.warn(`[Google Play Billing] ${context}: 購入状態の確認に失敗:`, error)
        }
      } else {
        console.log(`[Google Play Billing] ${context}: Digital Goods APIが利用できません`)
      }
    } catch (error) {
      console.warn(`[Google Play Billing] ${context}: 初期化エラー:`, error)
    }
  }

  // 初回マウント時の初期化
  useEffect(() => {
    initializeAndCheckPurchases('初回起動時')
  }, [])

  // ログイン状態が変わったとき（ログイン時）に再初期化
  useEffect(() => {
    if (user) {
      console.log('[Google Play Billing] ログインを検出。TWA判定と初期化を再実行します...')
      // ログイン後に少し待機してから初期化（localStorage保存が完了するのを待つ）
      const timeoutId = setTimeout(() => {
        initializeAndCheckPurchases('ログイン後')
      }, 1000) // 1秒待機

      return () => clearTimeout(timeoutId)
    } else {
      // ログアウト時はTWA環境のキャッシュをクリアしない（環境自体は変わらないため）
      console.log('[Google Play Billing] ログアウトを検出。TWA環境判定は維持します。')
    }
  }, [user])

  // UI表示なし（バックグラウンドで初期化のみ）
  return null
}

