import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * メールアドレスで最近の決済情報を確認し、自動的にプラン情報を返す
 * クライアント側から呼び出して、未有効化の決済があればプランを有効化
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

    // 最近の決済情報を取得（24時間以内、完了済み、未有効化、解約されていない）
    const { data, error } = await supabase
      .from("square_payments")
      .select("*")
      .eq("customer_email", email)
      .eq("status", "completed")
      .not("status", "eq", "cancelled") // 解約されていないもののみ
      .is("activated_at", null) // 未有効化のもののみ
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
        message: "未有効化の決済情報が見つかりませんでした",
        payment: null,
      })
    }

    const payment = data[0]

    // 解約済みの場合はスキップ
    if (payment.status === "cancelled") {
      return NextResponse.json({
        success: false,
        message: "このサブスクリプションは解約済みです",
        payment: null,
      })
    }

    // 有効期限を計算（次回請求日まで有効）
    // expires_atが設定されている場合はそれを使用、なければ次回請求日を設定
    let expiresAt: Date
    if (payment.expires_at) {
      expiresAt = new Date(payment.expires_at)
      // 有効期限が過去の場合はスキップ（解約済み）
      if (expiresAt < new Date()) {
        return NextResponse.json({
          success: false,
          message: "このサブスクリプションの有効期限が切れています",
          payment: null,
        })
      }
    } else {
      // 次回請求日（2025年12月1日）を設定
      expiresAt = new Date("2025-12-01")
      // または、現在の日付から1ヶ月後（決済完了から1ヶ月間有効）
      if (expiresAt < new Date()) {
        expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }
    }
    
    // 次回請求日も同様に設定
    const nextBillingDate = expiresAt

    return NextResponse.json({
      success: true,
      message: "未有効化の決済情報が見つかりました",
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
        amount: payment.amount,
        nextBillingDate: nextBillingDate.toISOString(),
        lastPaymentDate: payment.webhook_received_at || new Date().toISOString(),
        squarePaymentId: payment.payment_id,
      },
    })
  } catch (error) {
    console.error("自動有効化APIエラー:", error)
    return NextResponse.json(
      {
        error: "決済確認に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

