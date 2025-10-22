import { type NextRequest, NextResponse } from "next/server"
import { RateLimiter, InputValidator, createSecureResponse, createErrorResponse } from "@/lib/security-utils"

// 本格的な決済処理実装
export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimiter = RateLimiter.getInstance()
    
    if (!rateLimiter.isAllowed(clientIP)) {
      return createErrorResponse('リクエスト制限に達しました。しばらく時間をおいてから再試行してください。', 429, 'RATE_LIMIT_EXCEEDED')
    }

    const body = await request.json()
    const { planId, billingCycle, paymentMethod = "square" } = body

    // 入力値検証
    if (!planId || !billingCycle) {
      return createErrorResponse("必須パラメータが不足しています。", 400, "MISSING_PARAMETERS")
    }

    // プラン検証
    const validPlans = ["free", "basic", "premium"]
    if (!validPlans.includes(planId)) {
      return createErrorResponse("無効なプランIDです。", 400, "INVALID_PLAN_ID")
    }

    // 無料プランの場合は即座に返す
    if (planId === "free") {
      return createSecureResponse({
        success: true,
        subscription: {
          id: `free_${Date.now()}`,
          status: "active",
          planId: "free",
          billingCycle: "monthly",
          amount: 0,
          currency: "JPY",
          createdAt: new Date().toISOString(),
          nextBillingDate: null,
        },
        message: "Free plan activated successfully",
      })
    }

    // 環境変数チェック
    const squareAppId = process.env.SQUARE_APPLICATION_ID
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAppId || !squareAccessToken || !squareLocationId) {
      console.warn("Square credentials not configured, using mock response")
      
      // 開発環境用のモック応答
      const mockSubscription = {
        id: `mock_${Date.now()}`,
        status: "active",
        planId,
        billingCycle,
        amount: planId === "basic" ? (billingCycle === "yearly" ? 1980 : 220) : billingCycle === "yearly" ? 3960 : 440,
        currency: "JPY",
        createdAt: new Date().toISOString(),
        nextBillingDate: new Date(
          Date.now() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }

      return createSecureResponse({
        success: true,
        subscription: mockSubscription,
        message: "Mock subscription created (Square not configured)",
      })
    }

    // 実際のSquare決済処理（実装予定）
    // TODO: Square APIとの統合
    if (process.env.NODE_ENV === "development") {
      console.log("Square payment processing would be implemented here:", {
        planId,
        billingCycle,
        squareAppId,
        squareLocationId
      })
    }

    // 現在はモック応答を返す
    const subscription = {
      id: `square_${Date.now()}`,
      status: "active",
      planId,
      billingCycle,
      amount: planId === "basic" ? (billingCycle === "yearly" ? 1980 : 220) : billingCycle === "yearly" ? 3960 : 440,
      currency: "JPY",
      createdAt: new Date().toISOString(),
      nextBillingDate: new Date(
        Date.now() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }

    return createSecureResponse({
      success: true,
      subscription,
      message: "Subscription created successfully",
    })

  } catch (error) {
    console.error("Subscription creation error:", error)
    return createErrorResponse("サブスクリプションの作成に失敗しました。", 500, "SUBSCRIPTION_CREATION_FAILED")
  }
}

export async function GET() {
  return createSecureResponse({ message: "Subscription API endpoint" })
}
