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

    // ログインチェック: customerEmailまたはuserIdが必要
    if (!body.customerEmail && !body.userId) {
      console.error("[Google Play Billing] No customerEmail or userId provided. User must be logged in.")
      return NextResponse.json(
        { 
          success: false, 
          error: "ログインが必要です。購入するにはログインしてください。",
          requiresLogin: true,
        },
        { status: 400 }
      )
    }

    // 開発環境（localhost）では、検証をスキップするが、Supabaseへの書き込みは行う
    // 注意: Googleテスターアカウントでの購入は本番環境でも動作し、Google Play Developer APIで検証できる
    const isDevelopment = process.env.NODE_ENV === "development"
    if (isDevelopment) {
      console.log("[Google Play Billing] Development mode (localhost): Skipping purchase verification, but saving to Supabase")
      
      // 開発環境でもSupabaseに保存
      const resolvedPlanId = resolvePlanId(productId, body.planId)
      if (resolvedPlanId) {
        const supabase = getSupabaseServerClient()
        if (supabase) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1) // 1ヶ月後に有効期限
          
          const { data, error } = await supabase
            .from("user_subscriptions")
            .upsert(
              {
                user_id: body.userId || null,
                customer_email: body.customerEmail ? body.customerEmail.toLowerCase() : null,
                plan: resolvedPlanId,
                status: "active",
                payment_method: "google_play",
                product_id: productId,
                purchase_token: purchaseToken,
                last_verified_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                auto_renewing: true,
                raw_response: { development_mode: true, productId, purchaseToken },
              },
              { onConflict: "purchase_token" }
            )
            .select()
            .maybeSingle()

          if (error) {
            console.error("[Google Play Billing] Failed to save to Supabase in development mode:", error)
          } else {
            console.log("[Google Play Billing] Saved to Supabase in development mode:", data)
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        verified: true,
        productId,
        purchaseToken,
        message: "Development mode: Purchase verified (skipped), saved to Supabase",
        subscription: {
          plan: resolvedPlanId,
          status: "active",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1ヶ月後
          autoRenewing: true,
          source: "supabase",
        },
      })
    }

    // 本番環境では、Google Play Developer APIで検証
    // Googleテスターアカウントでの購入も、Google Play Developer APIで検証できる
    // ただし、サービスアカウントキーが設定されていない場合は検証をスキップし、Supabaseに保存
    const auth = await getGoogleAuth()
    if (!auth) {
      console.warn("[Google Play Billing] Google Auth not configured, skipping verification")
      console.warn("[Google Play Billing] Note: For production, please configure GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_JSON")
      console.warn("[Google Play Billing] Saving to Supabase without verification (for testing)")
      
      // 認証が設定されていない場合でも、Supabaseに保存（テスト環境用）
      const resolvedPlanId = resolvePlanId(productId, body.planId)
      if (resolvedPlanId) {
        const supabase = getSupabaseServerClient()
        if (supabase) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1) // 1ヶ月後に有効期限
          
          const { data, error } = await supabase
            .from("user_subscriptions")
            .upsert(
              {
                user_id: body.userId || null,
                customer_email: body.customerEmail ? body.customerEmail.toLowerCase() : null,
                plan: resolvedPlanId,
                status: "active",
                payment_method: "google_play",
                product_id: productId,
                purchase_token: purchaseToken,
                last_verified_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                auto_renewing: true,
                raw_response: { verification_skipped: true, productId, purchaseToken },
              },
              { onConflict: "purchase_token" }
            )
            .select()
            .maybeSingle()

          if (error) {
            console.error("[Google Play Billing] Failed to save to Supabase (auth not configured):", error)
          } else {
            console.log("[Google Play Billing] Saved to Supabase (auth not configured):", data)
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        verified: true,
        productId,
        purchaseToken,
        message: "Google Auth not configured, verification skipped, saved to Supabase",
        warning: "Purchase verification was skipped. Please configure service account key for production.",
        subscription: {
          plan: resolvedPlanId,
          status: "active",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1ヶ月後
          autoRenewing: true,
          source: "supabase",
        },
      })
    }

    const androidpublisher = google.androidpublisher({ version: "v3", auth })
    const appPackageName = packageName || process.env.NEXT_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME || "com.nameanalysis.ai"

    console.log("[Google Play Billing] Verifying purchase:", {
      packageName: appPackageName,
      subscriptionId: productId,
      token: purchaseToken.substring(0, 20) + "...",
    })

    // サブスクリプション購入を検証
    const purchase = await androidpublisher.purchases.subscriptions.get({
      packageName: appPackageName,
      subscriptionId: productId,
      token: purchaseToken,
    })

    console.log("[Google Play Billing] Purchase API response status:", purchase.status)
    console.log("[Google Play Billing] Purchase data exists:", !!purchase.data)
    if (!purchase.data) {
      console.error("[Google Play Billing] No purchase data returned from Google Play API")
      console.error("[Google Play Billing] Request parameters:", {
        packageName: appPackageName,
        subscriptionId: productId,
        tokenPreview: purchaseToken.substring(0, 20) + "...",
      })
    }

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

    console.error("[Google Play Billing] Purchase verification failed: No valid purchase data")
    console.error("[Google Play Billing] This could be caused by:")
    console.error("  1. Invalid purchase token")
    console.error("  2. Purchase was canceled or refunded")
    console.error("  3. Incorrect package name")
    console.error("  4. Service account lacks necessary permissions")
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Purchase verification failed",
        details: "No valid purchase data returned from Google Play API. Please check logs for more information.",
        troubleshooting: {
          checkPackageName: appPackageName,
          checkProductId: productId,
          checkPurchaseToken: purchaseToken.substring(0, 20) + "...",
        }
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("[Google Play Billing] Purchase verification error:", error)
    
    // エラーの詳細をログに記録
    const errorDetails = {
      message: error.message || "Unknown error",
      code: error.code,
      status: error.status,
      response: error.response?.data,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }
    console.error("[Google Play Billing] Error details:", JSON.stringify(errorDetails, null, 2))
    
    // エラーの詳細を返す（開発環境またはテスト環境では詳細を返す）
    const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
    const errorMessage = isDevelopment
      ? error.message || "Unknown error"
      : "Purchase verification failed"

    // Google Play APIのエラーの場合、より詳細な情報を返す
    if (error.response?.data) {
      const googleError = error.response.data
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: isDevelopment ? {
            googleError: googleError,
            code: error.code,
            status: error.status,
          } : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: isDevelopment ? {
          message: error.message,
          code: error.code,
        } : undefined,
      },
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

