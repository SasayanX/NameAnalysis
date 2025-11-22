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
    // デバッグログ
    console.log('[Dragon Breath Verify] Payment Link ID:', paymentLinkId)
    console.log('[Dragon Breath Verify] Request URL:', `${apiEndpoint}/online-checkout/payment-links/${paymentLinkId}`)
    
    const paymentLinkResponse = await fetch(`${apiEndpoint}/online-checkout/payment-links/${paymentLinkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    })
    
    console.log('[Dragon Breath Verify] Response Status:', paymentLinkResponse.status)

    const paymentLinkResult = await paymentLinkResponse.json()
    
    console.log('[Dragon Breath Verify] Response Body:', JSON.stringify(paymentLinkResult, null, 2))

    if (!paymentLinkResponse.ok || !paymentLinkResult.payment_link) {
      console.error('[Dragon Breath Verify] Payment Link取得エラー:', paymentLinkResult)
      return NextResponse.json(
        { error: 'Payment Linkが見つかりません', details: paymentLinkResult.errors },
        { status: paymentLinkResponse.status || 404 }
      )
    }

    const paymentLink = paymentLinkResult.payment_link
    console.log('[Dragon Breath Verify] Payment Link Full Data:', JSON.stringify(paymentLink, null, 2))
    console.log('[Dragon Breath Verify] Payment Link Status:', paymentLink.status)
    console.log('[Dragon Breath Verify] Order ID:', paymentLink.order_id)

    // Payment Linkの状態で決済完了を判定
    // statusが'PAID'または'COMPLETED'の場合は決済完了
    const paymentStatus = paymentLink.status?.toUpperCase()
    const isStatusPaid = paymentStatus === 'PAID' || paymentStatus === 'COMPLETED'
    const hasOrderId = paymentLink.order_id && paymentLink.order_id !== null && paymentLink.order_id !== undefined

    console.log('[Dragon Breath Verify] Payment Status:', paymentStatus)
    console.log('[Dragon Breath Verify] Is Status Paid:', isStatusPaid)
    console.log('[Dragon Breath Verify] Has Order ID:', hasOrderId)

    // 決済が完了しているか確認
    // Payment LinkのstatusがPAID/COMPLETED、またはorder_idが存在する場合
    let isPaymentCompleted = false

    if (isStatusPaid) {
      // Payment Linkの状態がPAIDまたはCOMPLETED → 決済完了
      isPaymentCompleted = true
    } else if (hasOrderId) {
      // order_idが存在する場合は注文情報を確認
      const orderResponse = await fetch(`${apiEndpoint}/orders/${paymentLink.order_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${squareAccessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18',
        },
      })

      const orderResult = await orderResponse.json()
      console.log('[Dragon Breath Verify] Order Result:', JSON.stringify(orderResult, null, 2))

      if (orderResponse.ok && orderResult.order) {
        // 注文が存在する場合、その状態を確認
        const orderState = orderResult.order.state?.toUpperCase()
        console.log('[Dragon Breath Verify] Order State:', orderState)
        
        if (orderState === 'COMPLETED') {
          // 注文が完了している → 決済完了
          isPaymentCompleted = true
        } else {
          // 注文は存在するが、まだ完了していない
          console.log('[Dragon Breath Verify] Order exists but not completed yet. State:', orderState)
          return NextResponse.json({
            success: false,
            error: '決済処理中です。しばらくお待ちください。',
            paymentLinkStatus: paymentLink.status,
            orderState: orderResult.order.state,
          })
        }
      } else {
        // 注文情報が取得できない場合でも、order_idが存在すれば決済済みとみなす
        console.log('[Dragon Breath Verify] Order ID exists but order not found. Assuming payment completed.')
        isPaymentCompleted = true
      }
    }

    console.log('[Dragon Breath Verify] Final Is Payment Completed:', isPaymentCompleted)

    // 決済完了の場合、アイテムを付与
    if (isPaymentCompleted) {
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

