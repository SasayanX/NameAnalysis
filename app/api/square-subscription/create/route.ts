import { type NextRequest, NextResponse } from "next/server"
import { getSquarePlanId, validateSquarePlanMapping } from "@/lib/square-plan-mapping"

/**
 * Square Subscriptions APIを使用してサブスクリプションを作成
 * Square側で既に作成したサブスクリプションプランを使用します
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, customerId, cardId } = body

    // プラン検証
    const validPlans = ["basic", "premium"]
    if (!planId || !validPlans.includes(planId)) {
      return NextResponse.json(
        { success: false, error: "無効なプランIDです" },
        { status: 400 }
      )
    }

    // Square側のplan_idを取得
    const squarePlanId = getSquarePlanId(planId as "basic" | "premium")
    if (!squarePlanId) {
      const validation = validateSquarePlanMapping()
      return NextResponse.json(
        {
          success: false,
          error: `SquareサブスクリプションプランIDが設定されていません。環境変数 ${validation.missingPlans.join(", ")} を設定してください。`,
          missingConfig: validation.missingPlans,
        },
        { status: 500 }
      )
    }

    // 環境変数チェック
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { success: false, error: "Square設定が不完全です" },
        { status: 500 }
      )
    }

    // Square Subscriptions APIでサブスクリプションを作成
    try {
      const response = await fetch("https://connect.squareup.com/v2/subscriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
        body: JSON.stringify({
          idempotency_key: `subscription_${planId}_${Date.now()}`,
          location_id: squareLocationId,
          plan_id: squarePlanId, // Square側で作成したplan_idを使用
          ...(customerId && { customer_id: customerId }),
          ...(cardId && { card_id: cardId }),
          start_date: new Date().toISOString().split('T')[0],
        }),
      })

      const result = await response.json()

      if (response.ok && result.subscription) {
        return NextResponse.json({
          success: true,
          subscription: {
            id: result.subscription.id,
            planId: planId,
            squarePlanId: squarePlanId,
            squareSubscriptionId: result.subscription.id,
            status: result.subscription.status,
            startDate: result.subscription.start_date,
            canceledDate: result.subscription.canceled_date,
          },
        })
      } else {
        console.error("Square Subscriptions API error:", result)
        return NextResponse.json(
          {
            success: false,
            error: result.errors?.[0]?.detail || "サブスクリプションの作成に失敗しました",
            squareErrors: result.errors,
          },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error("Square API call error:", error)
      return NextResponse.json(
        { success: false, error: "Square APIへの接続に失敗しました" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
