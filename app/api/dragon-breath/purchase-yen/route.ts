/**
 * 龍の息吹 円購入API
 * 価格: 120円（固定）
 * Square決済を使用
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getSquareConfig } from '@/lib/square-config'
import { Client, Environment } from 'squareup'

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

    const config = getSquareConfig()
    if (!config.accessToken || !config.locationId) {
      return NextResponse.json(
        { error: 'Square設定が不完全です' },
        { status: 500 }
      )
    }

    const squareClient = new Client({
      accessToken: config.accessToken,
      environment: config.environment === 'production' ? Environment.Production : Environment.Sandbox,
    })

    const usageCount = PLAN_USAGE_COUNTS[planKey]

    // Square Payment Linkを作成
    const { result: paymentLinkResult, statusCode } = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey: `dragon_breath_${userId}_${Date.now()}`,
      quickPay: {
        name: `龍の息吹（${planKey}プラン: ${usageCount}回）`,
        priceMoney: {
          amount: BigInt(DRAGON_BREATH_PRICE),
          currency: 'JPY',
        },
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seimei.app'}/shop/talisman?purchase=dragon-breath&userId=${userId}&plan=${planKey}&paymentLinkId={PAYMENT_LINK_ID}`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: customerEmail,
      },
      metadata: {
        userId,
        plan: planKey,
        usageCount: usageCount.toString(),
        itemType: 'dragon_breath',
      },
    })

    if (statusCode !== 200 || !paymentLinkResult.paymentLink) {
      return NextResponse.json(
        { error: 'Payment Linkの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLinkResult.paymentLink.url,
      paymentLinkId: paymentLinkResult.paymentLink.id,
    })
  } catch (error: any) {
    console.error('龍の息吹購入エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

