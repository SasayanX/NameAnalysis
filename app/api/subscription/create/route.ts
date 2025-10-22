import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, paymentMethod, cardNonce } = body

    if (!planId || !paymentMethod || !cardNonce) {
      return NextResponse.json({ success: false, error: "必要なパラメータが不足しています" }, { status: 400 })
    }

    // Square API呼び出し（実装例）
    const squareResponse = await fetch("https://connect.squareup.com/v2/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
      body: JSON.stringify({
        location_id: process.env.SQUARE_LOCATION_ID,
        plan_id: planId,
        card_nonce: cardNonce,
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
