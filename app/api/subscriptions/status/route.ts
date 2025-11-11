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

export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionStatusRequest = await request.json()
    const { userId, customerEmail, purchaseToken, planId } = body

    if (!userId && !customerEmail && !purchaseToken) {
      return NextResponse.json(
        { success: false, error: "At least one identifier (userId, customerEmail, purchaseToken) is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
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
      console.error("[Subscription Status] Supabase query error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch subscription status" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: true, subscription: null })
    }

    const subscription = transformSubscriptionRecord(data)

    return NextResponse.json({
      success: true,
      subscription,
    })
  } catch (error) {
    console.error("[Subscription Status] Unexpected error:", error)
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 })
  }
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
    lastVerifiedAt: record.last_verified_at,
    nextBillingDate: record.expires_at,
    rawResponse: record.raw_response,
  }
}

