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
    let body: ResyncRequest
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[Subscription Resync] JSON parse error:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }
    
    const { userId, customerEmail } = body
    
    console.log("[Subscription Resync] Request:", {
      userId,
      customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : undefined,
    })

    if (!userId && !customerEmail) {
      return NextResponse.json(
        { success: false, error: "userId または customerEmail の指定が必要です" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      console.error("[Subscription Resync] Supabase client is not configured", {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      })
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
      console.error("[Subscription Resync] square_payments query error:", {
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint,
        code: paymentError.code,
        query: {
          table: "square_payments",
          customerEmail: normalizedEmail ? `${normalizedEmail.substring(0, 3)}***` : undefined,
        },
      })
      
      // エラー情報をログに記録（本番環境でも）
      const errorInfo = {
        message: paymentError.message,
        code: paymentError.code,
        hint: paymentError.hint,
        details: paymentError.details,
      }
      console.error("[Subscription Resync] Full error info:", errorInfo)
      
      // 開発環境では詳細なエラー情報を返す
      const errorResponse: any = {
        success: false,
        error: "決済履歴の取得に失敗しました",
      }
      
      // 本番環境でも、エラーコードとメッセージは返す（セキュリティ上問題ない情報のみ）
      errorResponse.errorCode = paymentError.code
      if (process.env.NODE_ENV === "development") {
        errorResponse.details = errorInfo
      }
      
      return NextResponse.json(errorResponse, { status: 500 })
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
        console.error("[Subscription Resync] user_subscriptions update error:", {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        })
        return NextResponse.json(
          { 
            success: false, 
            error: "サブスクリプションの更新に失敗しました",
            details: process.env.NODE_ENV === "development" ? updateError.message : undefined,
          },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({ ...payload, created_at: now.toISOString() })

      if (insertError) {
        console.error("[Subscription Resync] user_subscriptions insert error:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        })
        return NextResponse.json(
          { 
            success: false, 
            error: "サブスクリプションの保存に失敗しました",
            details: process.env.NODE_ENV === "development" ? insertError.message : undefined,
          },
          { status: 500 }
        )
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
    console.error("[Subscription Resync] Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        success: false, 
        error: "サブスクリプションの再同期に失敗しました",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}

