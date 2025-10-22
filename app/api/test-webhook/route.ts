import { type NextRequest, NextResponse } from "next/server"

// テスト用Webhook（開発環境でのみ使用）
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoint not available in production" }, { status: 403 })
  }

  try {
    const { customerId, plan, amount } = await request.json()

    // テスト決済データを作成
    const testWebhookData = {
      type: "payment.updated",
      data: {
        object: {
          payment: {
            status: "COMPLETED",
            amount_money: {
              amount: amount || (plan === "premium" ? 44000 : 22000),
              currency: "JPY",
            },
            order_id: `test-order-${Date.now()}`,
            buyer_email_address: customerId || "test@example.com",
          },
        },
      },
    }

    // 実際のWebhookエンドポイントを呼び出し
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/square-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-square-signature": "test-signature",
      },
      body: JSON.stringify(testWebhookData),
    })

    const result = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: "テストWebhook送信完了",
      webhookResult: result,
      testData: testWebhookData,
    })
  } catch (error) {
    console.error("テストWebhookエラー:", error)
    return NextResponse.json({ error: "テストWebhook送信に失敗しました" }, { status: 500 })
  }
}
