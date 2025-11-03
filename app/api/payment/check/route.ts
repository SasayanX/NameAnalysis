import { type NextRequest, NextResponse } from "next/server"

/**
 * 決済完了をチェックするAPI
 * 最近の決済完了イベントを確認して、プラン情報を返す
 * 
 * 注意：現在は簡易実装です。本番環境では、データベースや
 * Square APIから決済履歴を取得する必要があります
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, sessionId } = body

    // TODO: 実際の実装では、Square APIから決済履歴を取得
    // または、Webhookで保存したデータをデータベースから取得
    
    // 現在は、Webhookで保存されたlocalStorage（subscriptionsキー）のデータを
    // サーバー側では確認できないため、クライアント側で処理する必要があります
    
    return NextResponse.json({
      success: true,
      message: "決済履歴を確認するには、Square APIから取得する必要があります",
      // 実際の実装例：
      // const payments = await fetchSquarePayments(email)
      // const latestPayment = payments.find(p => p.status === "COMPLETED")
      // if (latestPayment) {
      //   const plan = getPlanFromAmount(latestPayment.amount)
      //   return { success: true, plan, amount: latestPayment.amount }
      // }
    })
  } catch (error) {
    console.error("Payment check error:", error)
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // URLパラメータから決済情報を取得（Square Payment Links経由で戻ってきた場合）
  const searchParams = request.nextUrl.searchParams
  const planId = searchParams.get("plan")
  const amount = searchParams.get("amount")
  const paymentId = searchParams.get("payment_id")

  if (planId && (planId === "basic" || planId === "premium")) {
    return NextResponse.json({
      success: true,
      plan: planId,
      amount: amount ? parseInt(amount) : null,
      paymentId,
      message: "決済情報を取得しました",
    })
  }

  return NextResponse.json({
    success: false,
    message: "決済情報が見つかりませんでした",
  })
}
