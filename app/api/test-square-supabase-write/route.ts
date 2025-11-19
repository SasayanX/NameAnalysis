import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

/**
 * 決済成功後のSupabase書き込みをテストするエンドポイント
 * サンドボックスで決済が成功した後、このエンドポイントを呼び出してSupabaseへの書き込みをテストできます
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerEmail, planId, subscriptionId, customerId, cardId } = body

    if (!customerEmail || !planId) {
      return NextResponse.json(
        { success: false, error: "customerEmailとplanIdが必要です" },
        { status: 400 }
      )
    }

    const validPlans = ["basic", "premium"]
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { success: false, error: "planIdは'basic'または'premium'である必要があります" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabaseクライアントが利用できません" },
        { status: 500 }
      )
    }

    const normalizedEmail = customerEmail.toLowerCase()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // 1ヶ月後

    const results: any = {
      user_subscriptions: null,
      square_payments: null,
    }

    // 1. user_subscriptionsテーブルに保存
    try {
      // 既存レコードを検索
      const { data: existingRecord } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("customer_email", normalizedEmail)
        .eq("plan", planId)
        .order("last_verified_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const subscriptionData = {
        customer_email: normalizedEmail,
        plan: planId,
        status: "active",
        payment_method: "square",
        product_id: subscriptionId || `test_${Date.now()}`,
        last_verified_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renewing: true,
        raw_response: {
          subscription_id: subscriptionId,
          customer_id: customerId,
          card_id: cardId,
          test: true,
        },
      }

      if (existingRecord) {
        // 既存レコードを更新
        const { data: updatedRecord, error: updateError } = await supabase
          .from("user_subscriptions")
          .update(subscriptionData)
          .eq("id", existingRecord.id)
          .select()
          .maybeSingle()

        if (updateError) {
          results.user_subscriptions = { error: updateError.message }
        } else {
          results.user_subscriptions = { success: true, record: updatedRecord, action: "updated" }
        }
      } else {
        // 新規レコードを挿入
        const { data: insertedRecord, error: insertError } = await supabase
          .from("user_subscriptions")
          .insert(subscriptionData)
          .select()
          .maybeSingle()

        if (insertError) {
          results.user_subscriptions = { error: insertError.message }
        } else {
          results.user_subscriptions = { success: true, record: insertedRecord, action: "inserted" }
        }
      }
    } catch (error) {
      results.user_subscriptions = {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    // 2. square_paymentsテーブルに保存
    try {
      const paymentId = subscriptionId ? `subscription_${subscriptionId}` : `test_${Date.now()}`
      const { data: paymentRecord, error: paymentError } = await supabase
        .from("square_payments")
        .upsert(
          {
            payment_id: paymentId,
            order_id: subscriptionId || paymentId,
            customer_email: normalizedEmail,
            plan: planId,
            amount: planId === "basic" ? 330 : 550,
            currency: "JPY",
            status: "completed",
            webhook_received_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            metadata: {
              subscription_id: subscriptionId,
              customer_id: customerId,
              card_id: cardId,
              environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
              test: true,
            },
          },
          {
            onConflict: "payment_id",
          }
        )
        .select()
        .maybeSingle()

      if (paymentError) {
        results.square_payments = { error: paymentError.message }
      } else {
        results.square_payments = { success: true, record: paymentRecord }
      }
    } catch (error) {
      results.square_payments = {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    const allSuccess =
      results.user_subscriptions?.success && results.square_payments?.success

    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess
        ? "Supabaseへの書き込みが成功しました"
        : "一部の書き込みに失敗しました",
    })
  } catch (error) {
    console.error("Test Supabase write error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}


