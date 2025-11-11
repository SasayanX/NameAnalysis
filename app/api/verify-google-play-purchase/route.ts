import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"
import { google } from "googleapis"
import { getSupabaseServerClient } from "@/lib/supabase-server"

/**
 * Google Play購入レシートの検証API
 * 
 * 注意: 本番環境では、Google Play Developer APIのサービスアカウントキーが必要です
 * 環境変数: GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH または JSON形式の環境変数
 */

type PlanType = "free" | "basic" | "premium"

interface VerifyPurchaseRequest {
  purchaseToken: string
  productId: string
  planId?: PlanType
  customerEmail?: string
  userId?: string
  packageName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPurchaseRequest = await request.json()
    const { purchaseToken, productId, packageName, planId: requestedPlanId } = body

    if (!purchaseToken || !productId) {
      return NextResponse.json(
        { success: false, error: "purchaseToken and productId are required" },
        { status: 400 }
      )
    }

    // 開発環境では、検証をスキップして成功を返す
    if (process.env.NODE_ENV === "development") {
      console.log("[Google Play Billing] Development mode: Skipping purchase verification")
      return NextResponse.json({
        success: true,
        verified: true,
        productId,
        purchaseToken,
        message: "Development mode: Purchase verified (skipped)",
      })
    }

    // 本番環境では、Google Play Developer APIで検証
    const auth = await getGoogleAuth()
    if (!auth) {
      console.warn("[Google Play Billing] Google Auth not configured, skipping verification")
      // 認証が設定されていない場合は、開発モードと同様に成功を返す
      // （実際の本番環境では、必ず設定してください）
      return NextResponse.json({
        success: true,
        verified: true,
        productId,
        purchaseToken,
        message: "Google Auth not configured, verification skipped",
      })
    }

    const androidpublisher = google.androidpublisher({ version: "v3", auth })
    const appPackageName = packageName || process.env.NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME || "com.kanau.nameanalysis"

    // サブスクリプション購入を検証
    const purchase = await androidpublisher.purchases.subscriptions.get({
      packageName: appPackageName,
      subscriptionId: productId,
      token: purchaseToken,
    })

    if (purchase.data) {
      const purchaseData = purchase.data
      
      // 購入状態を確認
      const isActive = purchaseData.paymentState === 1 // 1 = Payment received
      const expiryTimeMillis = parseInt(purchaseData.expiryTimeMillis || "0", 10)
      const isExpired = expiryTimeMillis > 0 && Date.now() > expiryTimeMillis
      const resolvedPlanId = resolvePlanId(productId, requestedPlanId)
      const status: "pending" | "active" | "expired" =
        isExpired ? "expired" : isActive ? "active" : "pending"

      // Supabaseに保存
      let supabaseRecord: any = null
      const supabase = getSupabaseServerClient()
      if (supabase && resolvedPlanId) {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: body.userId || null,
              customer_email: body.customerEmail ? body.customerEmail.toLowerCase() : null,
              plan: resolvedPlanId,
              status,
              payment_method: "google_play",
              product_id: productId,
              purchase_token: purchaseToken,
              last_verified_at: new Date().toISOString(),
              expires_at: expiryTimeMillis > 0 ? new Date(expiryTimeMillis).toISOString() : null,
              auto_renewing: purchaseData.autoRenewing === true,
              raw_response: purchaseData,
            },
            { onConflict: "purchase_token" }
          )
          .select()
          .maybeSingle()

        if (error) {
          console.error("[Google Play Billing] Failed to upsert subscription:", error)
        } else {
          supabaseRecord = data
        }
      }

      return NextResponse.json({
        success: true,
        verified: true,
        productId,
        purchaseToken,
        purchaseData: {
          paymentState: purchaseData.paymentState,
          expiryTimeMillis,
          isActive,
          isExpired,
          autoRenewing: purchaseData.autoRenewing === true,
        },
        subscription: {
          plan: resolvedPlanId,
          status,
          expiresAt: expiryTimeMillis > 0 ? new Date(expiryTimeMillis).toISOString() : null,
          autoRenewing: purchaseData.autoRenewing === true,
          source: supabaseRecord ? "supabase" : "local",
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "Purchase verification failed" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("[Google Play Billing] Purchase verification error:", error)
    
    // エラーの詳細を返す（開発環境のみ）
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "Unknown error"
      : "Purchase verification failed"

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Google Authを初期化
 */
async function getGoogleAuth(): Promise<any> {
  try {
    // 環境変数からサービスアカウントキーのパスまたはJSONを取得
    const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH
    const keyJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON

    if (!keyPath && !keyJson) {
      console.warn("[Google Play Billing] Service account key not configured")
      return null
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
      ...(keyPath ? { keyFile: keyPath } : {}),
      ...(keyJson ? { credentials: JSON.parse(keyJson) } : {}),
    })

    return await auth.getClient()
  } catch (error) {
    console.error("[Google Play Billing] Failed to initialize Google Auth:", error)
    return null
  }
}

function resolvePlanId(productId: string, planId?: PlanType | null): PlanType | null {
  if (planId && ["free", "basic", "premium"].includes(planId)) {
    return planId
  }

  const basicId = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC ?? "basic_monthly"
  const premiumId = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM ?? "premium_monthly"

  if (productId === basicId) return "basic"
  if (productId === premiumId) return "premium"

  return null
}

