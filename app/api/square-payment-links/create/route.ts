import { type NextRequest, NextResponse } from "next/server"

/**
 * Square Payment Linkを作成するAPI
 * サブスクリプションプランに関連付けたPayment Linkを生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, subscriptionPlanId } = body

    if (!planId || (planId !== "basic" && planId !== "premium")) {
      return NextResponse.json(
        { success: false, error: "planIdは'basic'または'premium'である必要があります" },
        { status: 400 }
      )
    }

    if (!subscriptionPlanId) {
      return NextResponse.json(
        { success: false, error: "subscriptionPlanIdが必要です。Square側で作成したサブスクリプションプランのIDを指定してください" },
        { status: 400 }
      )
    }

    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      return NextResponse.json(
        { success: false, error: "Square設定が不足しています。SQUARE_ACCESS_TOKENとSQUARE_LOCATION_IDを設定してください" },
        { status: 500 }
      )
    }

    // Square Payment Links APIを使用してPayment Linkを作成
    // 注: Square Payment Links APIは現在、Web Checkout APIの一部として提供されています
    // サブスクリプションプランに関連付ける場合は、Checkout APIを使用します

    const planConfig = {
      basic: {
        name: "ベーシックプラン",
        price: 330,
      },
      premium: {
        name: "プレミアムプラン",
        price: 550,
      },
    }

    const config = planConfig[planId]

    // Square Checkout APIでCheckoutセッションを作成
    // サブスクリプションプランを使用する場合
    const checkoutResponse = await fetch("https://connect.squareup.com/v2/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-10-18",
      },
      body: JSON.stringify({
        idempotency_key: `checkout_${planId}_${Date.now()}`,
        checkout_page_settings: {
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription-success?plan=${planId}`,
          button_text: "決済を完了する",
        },
        order: {
          location_id: squareLocationId,
          line_items: [
            {
              name: config.name,
              quantity: "1",
              // サブスクリプションプランの場合は、item_idではなくsubscription_plan_idを使用
              // ただし、Checkout APIでは直接サブスクリプションプランを指定できないため、
              // 代わりに金額を指定します
              base_price_money: {
                amount: config.price, // 円単位
                currency: "JPY",
              },
              metadata: {
                subscription_plan_id: subscriptionPlanId,
                plan_id: planId,
              },
            },
          ],
        },
      }),
    })

    const checkoutResult = await checkoutResponse.json()

    if (!checkoutResponse.ok) {
      console.error("Square Checkout API エラー:", checkoutResult)
      return NextResponse.json(
        {
          success: false,
          error: "Payment Linkの作成に失敗しました",
          details: checkoutResult.errors || checkoutResult,
        },
        { status: checkoutResponse.status }
      )
    }

    // 注意: Square Checkout APIは一時的なCheckout URLを返します
    // 永続的なPayment Linkを作成するには、Squareダッシュボードで手動作成する必要があります

    return NextResponse.json({
      success: true,
      message: "Payment Linkを作成しました",
      paymentLink: {
        url: checkoutResult.checkout?.checkout_page_url,
        checkoutId: checkoutResult.checkout?.id,
        planId: planId,
        subscriptionPlanId: subscriptionPlanId,
      },
      note: "このURLは一時的なものです。永続的なPayment Linkを作成するには、Squareダッシュボードで手動作成してください。",
      // Squareダッシュボードでの手動作成手順
      manualSteps: [
        "1. Squareダッシュボードにログイン",
        "2. オンライン決済 > 支払いリンク に移動",
        "3. 「新しいリンクを作成」をクリック",
        "4. 商品を選択: サブスクリプションプランを選択",
        `5. プランを選択: ${config.name} (${subscriptionPlanId})`,
        "6. リンクを作成",
        "7. 生成されたリンクURLをコピー",
        `8. 環境変数 NEXT_PUBLIC_SQUARE_PAYMENT_LINK_${planId.toUpperCase()} に設定`,
      ],
    })
  } catch (error) {
    console.error("Square Payment Link作成エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Payment Linkの作成に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

