import { type NextRequest, NextResponse } from "next/server"
import { getSquarePlanId, validateSquarePlanMapping } from "@/lib/square-plan-mapping"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, paymentMethod, cardNonce } = body

    if (!planId || !paymentMethod || !cardNonce) {
      return NextResponse.json({ success: false, error: "必要なパラメータが不足しています" }, { status: 400 })
    }

    // アプリ内のプランID（"basic", "premium"）をSquare側のplan_idに変換
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

    // Square Subscriptions APIを使用してサブスクリプションを作成
    const squareResponse = await fetch("https://connect.squareup.com/v2/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
      body: JSON.stringify({
        idempotency_key: `subscription_${planId}_${Date.now()}`,
        location_id: process.env.SQUARE_LOCATION_ID,
        plan_id: squarePlanId, // Square側で作成したplan_idを使用
        customer_id: undefined, // 必要に応じて設定
        card_id: undefined, // カード情報は別途処理が必要
        source_id: cardNonce, // カードトークンまたはカードID
        start_date: new Date().toISOString().split('T')[0], // 開始日
      }),
    })

    const result = await squareResponse.json()

    if (squareResponse.ok) {
      return NextResponse.json({
        success: true,
        subscriptionId: result.subscription?.id,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.errors?.[0]?.detail || "決済処理に失敗しました" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
