/**
 * 龍の息吹 円購入API
 * 価格: 120円（固定）
 * Square決済を使用
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getSquareApiEndpoint } from '@/lib/square-config'

const DRAGON_BREATH_PRICE = 120 // 120円

// プラン別の回数
const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, customerEmail } = body

    if (!userId || !plan || !customerEmail) {
      return NextResponse.json(
        { error: 'userId、plan、customerEmailが必要です' },
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

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { error: 'Square設定が不完全です' },
        { status: 500 }
      )
    }

    const usageCount = PLAN_USAGE_COUNTS[planKey]
    const apiEndpoint = getSquareApiEndpoint()

    // Square Payment Linkを作成
    // リクエストボディを構築
    const requestBody = {
      idempotency_key: `dragon_breath_${userId}_${Date.now()}`,
      quick_pay: {
        name: `龍の息吹（${planKey}プラン: ${usageCount}回）`,
        price_money: {
          amount: DRAGON_BREATH_PRICE,
          currency: 'JPY',
        },
      },
      checkout_options: {
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seimei.app'}/shop/talisman?purchase=dragon-breath&userId=${userId}&plan=${planKey}&paymentLinkId={PAYMENT_LINK_ID}`,
        ask_for_shipping_address: false,
      },
      pre_populated_data: {
        buyer_email: customerEmail,
      },
      metadata: {
        userId,
        plan: planKey,
        usageCount: usageCount.toString(),
        itemType: 'dragon_breath',
      },
    }

    // デバッグ: リクエストボディをログに出力
    console.log('[Dragon Breath Purchase] Request URL:', `${apiEndpoint}/online-checkout/payment-links`)
    console.log('[Dragon Breath Purchase] Request Body:', JSON.stringify(requestBody, null, 2))

    const paymentLinkResponse = await fetch(`${apiEndpoint}/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
      body: JSON.stringify(requestBody),
    })

    const paymentLinkResult = await paymentLinkResponse.json()

    // デバッグログ（常に出力）
    console.log('[Dragon Breath Purchase] Square API Response Status:', paymentLinkResponse.status)
    console.log('[Dragon Breath Purchase] Square API Response Body:', JSON.stringify(paymentLinkResult, null, 2))

    if (!paymentLinkResponse.ok || !paymentLinkResult.payment_link) {
      console.error('[Dragon Breath Purchase] Payment Link作成エラー:', paymentLinkResult)
      const errorDetails = paymentLinkResult.errors || paymentLinkResult
      return NextResponse.json(
        { 
          error: 'Payment Linkの作成に失敗しました', 
          details: errorDetails,
          statusCode: paymentLinkResponse.status,
          fullResponse: paymentLinkResult,
        },
        { status: paymentLinkResponse.status || 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLinkResult.payment_link.url,
      paymentLinkId: paymentLinkResult.payment_link.id,
    })
  } catch (error: any) {
    console.error('龍の息吹購入エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

