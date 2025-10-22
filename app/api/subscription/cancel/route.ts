import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: "サブスクリプションIDが必要です" }, { status: 400 })
    }

    // Square API呼び出し
    const squareResponse = await fetch(
      `https://connect.squareup.com/v2/subscriptions/${subscriptionId}/actions/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
      },
    )

    const result = await squareResponse.json()

    if (squareResponse.ok) {
      return NextResponse.json({
        success: true,
        message: "サブスクリプションをキャンセルしました",
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.errors?.[0]?.detail || "キャンセル処理に失敗しました" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
