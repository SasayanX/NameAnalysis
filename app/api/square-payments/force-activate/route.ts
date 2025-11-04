import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 強制的にプランを有効化するAPI（デバッグ用）
 * メールアドレスで決済情報を検索し、プラン情報を返す
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    
    if (!email) {
      return NextResponse.json(
        { error: "emailが必要です" },
        { status: 400 }
      )
    }

    // 最近の決済情報を取得（完了済み、有効期限が未来のもの）
    const { data, error } = await supabase
      .from("square_payments")
      .select("*")
      .eq("customer_email", email)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Square決済情報取得エラー:", error)
      return NextResponse.json(
        { error: "決済情報の取得に失敗しました", details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: "決済情報が見つかりませんでした",
        payment: null,
        subscription: null,
      })
    }

    const payment = data[0]

    // 有効期限を計算（次回請求日まで有効）
    let expiresAt: Date
    if (payment.expires_at) {
      expiresAt = new Date(payment.expires_at)
    } else {
      // 次回請求日（2025年12月1日）を設定
      expiresAt = new Date("2025-12-01")
      // または、現在の日付から1ヶ月後
      if (expiresAt < new Date()) {
        expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }
    }
    
    // 次回請求日も同様に設定
    const nextBillingDate = expiresAt

    // プラン情報を取得
    const plans = {
      basic: { price: 330 },
      premium: { price: 550 },
    }
    const planPrice = plans[payment.plan as "basic" | "premium"]?.price || payment.amount

    return NextResponse.json({
      success: true,
      message: "決済情報が見つかりました",
      payment: {
        id: payment.id,
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        customer_email: payment.customer_email,
        plan: payment.plan,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        webhook_received_at: payment.webhook_received_at,
        expires_at: payment.expires_at,
        created_at: payment.created_at,
      },
      subscription: {
        plan: payment.plan,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        status: "active",
        paymentMethod: "square",
        amount: planPrice,
        nextBillingDate: nextBillingDate.toISOString(),
        lastPaymentDate: payment.webhook_received_at || new Date().toISOString(),
        squarePaymentId: payment.payment_id,
      },
      // デバッグ情報
      debug: {
        expiresAtDate: expiresAt.toISOString(),
        expiresAtLocale: expiresAt.toLocaleString("ja-JP"),
        isExpired: expiresAt < new Date(),
        daysUntilExpiry: Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      },
    })
  } catch (error) {
    console.error("強制有効化APIエラー:", error)
    return NextResponse.json(
      {
        error: "決済確認に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

