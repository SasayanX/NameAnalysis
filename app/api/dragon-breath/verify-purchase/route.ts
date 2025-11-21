/**
 * 龍の息吹購入確認API
 * Square決済完了後に呼び出される
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getSquareApiEndpoint } from '@/lib/square-config'

const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentLinkId, userId } = body

    if (!paymentLinkId || !userId) {
      return NextResponse.json(
        { error: 'paymentLinkIdとuserIdが必要です' },
        { status: 400 }
      )
    }

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN

    if (!squareAccessToken) {
      return NextResponse.json(
        { error: 'Square設定が不完全です' },
        { status: 500 }
      )
    }

    const apiEndpoint = getSquareApiEndpoint()

    // Payment Linkの状態を確認
    const paymentLinkResponse = await fetch(`${apiEndpoint}/checkout/payment-links/${paymentLinkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    })

    const paymentLinkResult = await paymentLinkResponse.json()

    if (!paymentLinkResponse.ok || !paymentLinkResult.payment_link) {
      return NextResponse.json(
        { error: 'Payment Linkが見つかりません', details: paymentLinkResult.errors },
        { status: paymentLinkResponse.status || 404 }
      )
    }

    const paymentLink = paymentLinkResult.payment_link

    // 決済が完了しているか確認
    if (paymentLink.order_id) {
      // 注文情報を取得
      const orderResponse = await fetch(`${apiEndpoint}/orders/${paymentLink.order_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${squareAccessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18',
        },
      })

      const orderResult = await orderResponse.json()

      if (orderResponse.ok && orderResult.order?.state === 'COMPLETED') {
        // メタデータからプラン情報を取得
        const metadata = paymentLink.metadata || {}
        const plan = (metadata.plan as keyof typeof PLAN_USAGE_COUNTS) || 'free'
        const usageCount = PLAN_USAGE_COUNTS[plan] || 1

        const supabase = getSupabaseServerClient()
        if (!supabase) {
          return NextResponse.json(
            { error: 'データベース接続エラー' },
            { status: 500 }
          )
        }

        // special_itemsテーブルに龍の息吹を保存
        const { data: savedItem, error: saveError } = await supabase
          .from('special_items')
          .insert({
            user_id: userId,
            name: '龍の息吹',
            type: 'dragon_breath',
            effect_type: 'ai_fortune_usage',
            effect_value: usageCount,
            usage_count: usageCount,
            description: `AI深層言霊鑑定を${usageCount}回利用できます`,
            is_used: false,
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
            plan,
            obtainedAt: savedItem.obtained_at,
          },
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: '決済が完了していません',
    })
  } catch (error: any) {
    console.error('龍の息吹購入確認エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入確認処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

