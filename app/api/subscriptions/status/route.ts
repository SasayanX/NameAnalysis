import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

type PlanType = "free" | "basic" | "premium"
type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired" | "failed"

interface SubscriptionStatusRequest {
  userId?: string
  customerEmail?: string
  purchaseToken?: string
  planId?: PlanType
}

async function getSubscriptionStatus(request: NextRequest) {
  try {
    let body: SubscriptionStatusRequest
    
    // GETリクエストの場合はクエリパラメータから取得
    if (request.method === "GET") {
      const { searchParams } = new URL(request.url)
      body = {
        userId: searchParams.get("userId") || undefined,
        customerEmail: searchParams.get("customerEmail") || undefined,
        purchaseToken: searchParams.get("purchaseToken") || undefined,
        planId: (searchParams.get("planId") as PlanType) || undefined,
      }
    } else {
      // POSTリクエストの場合はリクエストボディから取得
      try {
        body = await request.json()
      } catch (parseError) {
        console.error("[Subscription Status] JSON parse error:", parseError)
        return NextResponse.json(
          { success: false, error: "Invalid JSON in request body" },
          { status: 400 }
        )
      }
    }
    
    const { userId, customerEmail, purchaseToken, planId } = body
    
    console.log("[Subscription Status] Request:", {
      method: request.method,
      userId,
      customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : undefined,
      hasPurchaseToken: !!purchaseToken,
      planId,
    })

    if (!userId && !customerEmail && !purchaseToken) {
      return NextResponse.json(
        { success: false, error: "At least one identifier (userId, customerEmail, purchaseToken) is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      console.error("[Subscription Status] Supabase client is not configured", {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      })
      return NextResponse.json(
        { success: false, error: "Supabase client is not configured" },
        { status: 503 }
      )
    }

    let query = supabase
      .from("user_subscriptions")
      .select("*")
      .order("last_verified_at", { ascending: false })
      .limit(1)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (customerEmail) {
      query = query.eq("customer_email", customerEmail.toLowerCase())
    }

    if (purchaseToken) {
      query = query.eq("purchase_token", purchaseToken)
    }

    if (planId) {
      query = query.eq("plan", planId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("[Subscription Status] Supabase query error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        query: {
          table: "user_subscriptions",
          userId,
          customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : undefined,
          purchaseToken: purchaseToken ? `${purchaseToken.substring(0, 10)}***` : undefined,
          planId,
        },
      })
      
      // エラー情報をログに記録（本番環境でも）
      const errorInfo = {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }
      console.error("[Subscription Status] Full error info:", errorInfo)
      
      // 開発環境では詳細なエラー情報を返す
      const errorResponse: any = {
        success: false,
        error: "Failed to fetch subscription status",
      }
      
      // 本番環境でも、エラーコードとメッセージは返す（セキュリティ上問題ない情報のみ）
      errorResponse.errorCode = error.code
      if (process.env.NODE_ENV === "development") {
        errorResponse.details = errorInfo
      }
      
      return NextResponse.json(errorResponse, { status: 500 })
    }

    if (!data) {
      console.log("[Subscription Status] No subscription found for:", {
        userId,
        customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : undefined,
      })
      return NextResponse.json({ success: true, subscription: null })
    }

    // 🚨 一時的な対処：特定ユーザーを無料プランに強制
    if (userId === '15bfa2d1-bfac-41a6-b149-ddd494758b47' || customerEmail === 'sasayanfx@gmail.com') {
      console.log("[Subscription Status] ⚠️ 強制的に無料プラン（テストユーザー）:", {
        userId,
        customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : undefined,
      })
      return NextResponse.json({ success: true, subscription: null })
    }

    console.log("[Subscription Status] Found subscription:", {
      id: data.id,
      plan: data.plan,
      status: data.status,
      expiresAt: data.expires_at,
    })

    const subscription = transformSubscriptionRecord(data)

    return NextResponse.json({
      success: true,
      subscription,
    })
  } catch (error) {
    console.error("[Subscription Status] Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // エラー情報をログに記録（本番環境でも）
    console.error("[Subscription Status] Full error info:", {
      message: errorMessage,
      stack: errorStack,
      error: error,
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Unexpected error",
        errorCode: "UNEXPECTED_ERROR",
        errorMessage: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          message: errorMessage,
          stack: errorStack,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return getSubscriptionStatus(request)
}

export async function POST(request: NextRequest) {
  return getSubscriptionStatus(request)
}

function transformSubscriptionRecord(record: any) {
  const status: SubscriptionStatus = record.status

  return {
    id: record.id,
    plan: record.plan as PlanType,
    status,
    paymentMethod: record.payment_method ?? "google_play",
    autoRenewing: record.auto_renewing ?? false,
    customerEmail: record.customer_email ?? null,
    userId: record.user_id ?? null,
    expiresAt: record.expires_at,
    trialEndsAt: record.trial_ends_at ?? null, // トライアル終了日を追加
    lastVerifiedAt: record.last_verified_at,
    nextBillingDate: record.expires_at,
    rawResponse: record.raw_response,
  }
}

