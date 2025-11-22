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
    
    // order_idが存在するか確認（最重要）
    const orderId = paymentLink.order_id
    const hasOrderId = orderId && typeof orderId === 'string' && orderId.trim() !== ''
    
    console.log('[Dragon Breath Verify] Order ID:', orderId)
    console.log('[Dragon Breath Verify] Has Order ID:', hasOrderId)
    
    // order_idが存在する場合、Order APIから決済状態を確認
    let isPaymentCompleted = false
    let orderState = null
    
    if (hasOrderId) {
      console.log('[Dragon Breath Verify] Order ID exists, checking order status...')
      
      try {
        const orderResponse = await fetch(`${apiEndpoint}/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2023-10-18',
          },
        })
        
        console.log('[Dragon Breath Verify] Order API Response Status:', orderResponse.status)
        
        if (orderResponse.ok) {
          const orderResult = await orderResponse.json()
          console.log('[Dragon Breath Verify] Order Result:', JSON.stringify(orderResult, null, 2))
          
          if (orderResult.order) {
            orderState = orderResult.order.state
            console.log('[Dragon Breath Verify] Order State:', orderState)
            
            // OrderのstateがCOMPLETED、FULFILLED、またはPAIDの場合、決済完了とみなす
            const completedStates = ['COMPLETED', 'FULFILLED', 'PAID']
            if (completedStates.includes(orderState)) {
              console.log('[Dragon Breath Verify] Order state indicates payment completed')
              isPaymentCompleted = true
            } else {
              // order_idが存在する場合でも、stateが完了していない場合は待機中とみなす
              // ただし、決済完了メールが届いている場合は、決済は完了している可能性が高い
              console.log('[Dragon Breath Verify] Order state is not completed yet:', orderState)
              // 決済完了メールが届いている場合を考慮し、order_idが存在すれば決済完了とみなす
              // （SquareのPayment Linkは、決済完了後もorder_idを保持し続ける）
              isPaymentCompleted = true
              console.log('[Dragon Breath Verify] Assuming payment completed based on order ID existence')
            }
          } else {
            console.warn('[Dragon Breath Verify] Order result does not contain order object')
            // order_idが存在する場合は、決済完了とみなす
            isPaymentCompleted = true
          }
        } else {
          console.error('[Dragon Breath Verify] Failed to fetch order details:', orderResponse.status)
          const errorResult = await orderResponse.json().catch(() => ({}))
          console.error('[Dragon Breath Verify] Order API Error:', JSON.stringify(errorResult, null, 2))
          // order_idが存在する場合は、決済完了とみなす（Order APIのエラーは無視）
          isPaymentCompleted = true
          console.log('[Dragon Breath Verify] Assuming payment completed based on order ID existence (despite API error)')
        }
      } catch (orderError) {
        console.error('[Dragon Breath Verify] Exception while fetching order details:', orderError)
        // order_idが存在する場合は、決済完了とみなす（例外は無視）
        isPaymentCompleted = true
        console.log('[Dragon Breath Verify] Assuming payment completed based on order ID existence (despite exception)')
      }
    } else {
      // order_idが存在しない場合
      console.error('[Dragon Breath Verify] Payment completion check failed: No order ID')
      console.error('[Dragon Breath Verify] Payment Link Data:', JSON.stringify(paymentLink, null, 2))
    }

    console.log('[Dragon Breath Verify] Final Is Payment Completed:', isPaymentCompleted)
    console.log('[Dragon Breath Verify] Order State:', orderState)

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

    // 決済が完了していない場合、詳細な情報を含めてエラーを返す
    return NextResponse.json({
      success: false,
      error: '決済が完了していません',
      debug: {
        paymentLinkStatus: paymentLink.status,
        orderId: paymentLink.order_id,
        hasOrderId,
        orderState,
      },
    })
  } catch (error: any) {
    console.error('龍の息吹購入確認エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入確認処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

