/**
 * 龍の息吹 Google Play Billing購入API
 * 価格: 120円（固定）
 * Google Play Billingを使用（一回限りの購入）
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'

const DRAGON_BREATH_PRICE = 120 // 120円

// プラン別の回数
const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

/**
 * Google Authを初期化
 */
async function getGoogleAuth(): Promise<any> {
  try {
    const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH
    const keyJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON

    if (!keyPath && !keyJson) {
      console.warn('[Dragon Breath Google Play] Service account key not configured')
      return null
    }

    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      ...(keyPath ? { keyFile: keyPath } : {}),
      ...(keyJson ? { credentials: JSON.parse(keyJson) } : {}),
    })

    return await auth.getClient()
  } catch (error) {
    console.error('[Dragon Breath Google Play] Failed to initialize Google Auth:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, purchaseToken, productId } = body

    if (!userId || !plan || !purchaseToken || !productId) {
      return NextResponse.json(
        { 
          error: 'userId、plan、purchaseToken、productIdが必要です' 
        },
        { status: 400 }
      )
    }

    const planKey = plan as keyof typeof PLAN_USAGE_COUNTS
    if (!(planKey in PLAN_USAGE_COUNTS)) {
      return NextResponse.json(
        { error: '無効なプランです' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'データベース接続エラー' },
        { status: 500 }
      )
    }

    // Google Play購入を検証（一回限りの購入用）
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment) {
      const auth = await getGoogleAuth()
      if (auth) {
        try {
          const androidpublisher = google.androidpublisher({ version: 'v3', auth })
          const appPackageName = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME || 'com.nameanalysis.ai'

          console.log('[Dragon Breath Google Play] Verifying purchase:', {
            packageName: appPackageName,
            productId,
            token: purchaseToken.substring(0, 20) + '...',
          })

          // 一回限りの購入を検証
          const purchase = await androidpublisher.purchases.products.get({
            packageName: appPackageName,
            productId,
            token: purchaseToken,
          })

          if (!purchase.data || purchase.data.purchaseState !== 0) {
            // 0 = Purchased
            console.error('[Dragon Breath Google Play] Purchase verification failed:', purchase.data)
            return NextResponse.json(
              { 
                error: '購入の検証に失敗しました',
                details: 'Purchase state is not valid'
              },
              { status: 400 }
            )
          }

          console.log('[Dragon Breath Google Play] Purchase verified successfully')
        } catch (verifyError: any) {
          console.error('[Dragon Breath Google Play] Verification error:', verifyError)
          return NextResponse.json(
            { 
              error: '購入の検証中にエラーが発生しました',
              details: verifyError.message 
            },
            { status: 500 }
          )
        }
      } else {
        console.warn('[Dragon Breath Google Play] Google Auth not configured, skipping verification')
      }
    } else {
      console.log('[Dragon Breath Google Play] Development mode: Skipping purchase verification')
    }

    // special_itemsテーブルに龍の息吹を保存
    const usageCount = PLAN_USAGE_COUNTS[planKey]
    const { data: savedItem, error: saveError } = await supabase
      .from('special_items')
      .insert({
        user_id: userId,
        name: '龍の息吹',
        type: 'dragon_breath',
        effect_type: 'ai_fortune_usage',
        effect_value: usageCount,
        description: `AI深層言霊鑑定を${usageCount}回利用できます`,
        is_used: false,
        metadata: {
          purchaseToken,
          productId,
          purchaseMethod: 'google_play_billing',
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('龍の息吹保存エラー:', saveError)
      return NextResponse.json(
        { error: '龍の息吹の保存に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      item: {
        id: savedItem.id,
        name: '龍の息吹',
        usageCount,
        plan: planKey,
        obtainedAt: savedItem.obtained_at,
      },
    })
  } catch (error: any) {
    console.error('龍の息吹Google Play購入エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

