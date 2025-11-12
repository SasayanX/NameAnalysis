import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

type PlanType = "basic" | "premium"
type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired" | "failed"

interface ResyncRequest {
  userId?: string
  customerEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResyncRequest = await request.json()
    const { userId, customerEmail } = body

    if (!userId && !customerEmail) {
      return NextResponse.json(
        { success: false, error: "userId または customerEmail の指定が必要です" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase クライアントが設定されていません" },
        { status: 503 }
      )
    }

    const normalizedEmail = customerEmail?.toLowerCase() ?? null

    const paymentsQuery = supabase
      .from("square_payments")
      .select("*")
      .eq("status", "completed")
      .order("webhook_received_at", { ascending: false })
      .limit(1)

    if (normalizedEmail) {
      paymentsQuery.eq("customer_email", normalizedEmail)
    }

    const { data: payments, error: paymentError } = await paymentsQuery
    const payment = payments?.[0] ?? null

    if (paymentError) {
      console.error("square_payments の取得に失敗しました:", paymentError)
      return NextResponse.json({ success: false, error: "決済履歴の取得に失敗しました" }, { status: 500 })
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "最新の決済情報が見つかりませんでした" },
        { status: 404 }
      )
    }

    const plan = (payment.plan || "basic") as PlanType
    const expiresAt = payment.expires_at ? new Date(payment.expires_at) : null
    const now = new Date()
    const status: SubscriptionStatus = expiresAt && expiresAt > now ? "active" : "expired"
    const payload = {
      user_id: userId ?? null,
      customer_email: normalizedEmail,
      plan,
      status,
      payment_method: "square" as const,
      product_id: payment.order_id || payment.payment_id || null,
      last_verified_at: now.toISOString(),
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      auto_renewing: status === "active",
      raw_response: {
        source: "manual_resync",
        payment_id: payment.payment_id,
        order_id: payment.order_id,
      },
      updated_at: now.toISOString(),
    }

    let existingId: string | null = null

    if (userId) {
      const { data: existingByUser } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .order("last_verified_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingByUser?.id) {
        existingId = existingByUser.id
      }
    }

    if (!existingId && normalizedEmail) {
      const { data: existingByEmail } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("customer_email", normalizedEmail)
        .order("last_verified_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingByEmail?.id) {
        existingId = existingByEmail.id
      }
    }

    if (existingId) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update(payload)
        .eq("id", existingId)

      if (updateError) {
        console.error("user_subscriptions の更新に失敗しました:", updateError)
        return NextResponse.json({ success: false, error: "サブスクリプションの更新に失敗しました" }, { status: 500 })
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({ ...payload, created_at: now.toISOString() })

      if (insertError) {
        console.error("user_subscriptions への挿入に失敗しました:", insertError)
        return NextResponse.json({ success: false, error: "サブスクリプションの保存に失敗しました" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        status,
        paymentMethod: "square",
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        lastVerifiedAt: now.toISOString(),
      },
    })
  } catch (error) {
    console.error("サブスクリプション再同期処理でエラー:", error)
    return NextResponse.json(
      { success: false, error: "サブスクリプションの再同期に失敗しました" },
      { status: 500 }
    )
  }
}

