import { type NextRequest, NextResponse } from "next/server"
import { getSquarePlanId, validateSquarePlanMapping } from "@/lib/square-plan-mapping"

/**
 * Square Checkout APIを使用して決済リンクを作成
 * ユーザーをSquareの決済ページにリダイレクトする
 * 
 * 注意：Square側で既にサブスクリプションプランを作成している場合、
 * 環境変数 SQUARE_SUBSCRIPTION_PLAN_ID_BASIC と SQUARE_SUBSCRIPTION_PLAN_ID_PREMIUM
 * にSquare側のplan_idを設定してください
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body

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
      // 設定が不完全な場合は検証結果を返す
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

    // プラン価格
    const prices = {
      basic: 330,
      premium: 550,
    }
    const amount = prices[planId as "basic" | "premium"]

    // 環境変数チェック
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
    const squareLocationId = process.env.SQUARE_LOCATION_ID

    if (!squareAccessToken || !squareLocationId) {
      // 開発環境：モックチェックアウトリンクを返す
      if (process.env.NODE_ENV === "development") {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const mockCheckoutId = `mock_checkout_${Date.now()}`
        
        // モック決済ページへのリンク（実際には開発用のテストページ）
        const mockCheckoutUrl = `${baseUrl}/payment-test?plan=${planId}&amount=${amount}&checkoutId=${mockCheckoutId}`
        
        return NextResponse.json({
          success: true,
          checkoutUrl: mockCheckoutUrl,
          checkoutId: mockCheckoutId,
          isMock: true,
        })
      }

      return NextResponse.json(
        { success: false, error: "Square設定が不完全です" },
        { status: 500 }
      )
    }

    // Square Invoices APIを使用して請求書と支払いリンクを作成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nameanalysis216.vercel.app"
    const returnUrl = `${baseUrl}/subscription-success?plan=${planId}&amount=${amount}`
    const cancelUrl = `${baseUrl}/pricing?cancelled=true`

    try {
      // まず請求書を作成
      const invoiceResponse = await fetch("https://connect.squareup.com/v2/invoices", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
        body: JSON.stringify({
          idempotency_key: `invoice_${planId}_${Date.now()}`,
          invoice: {
            location_id: squareLocationId,
            order_id: undefined, // 注文IDはオプション
            primary_recipient: {
              customer_id: undefined, // 顧客IDはオプション
            },
            payment_requests: [
              {
                request_type: "BALANCE",
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7日後
                tipping_enabled: false,
                automatic_payment_source: "NONE",
                reminders: [],
              },
            ],
            invoice_line_items: [
              {
                name: planId === "basic" ? "ベーシックプラン（月額）" : "プレミアムプラン（月額）",
                quantity: "1",
                unit_price: {
                  amount: amount * 100, // セント単位
                  currency: "JPY",
                },
              },
            ],
            delivery_method: "EMAIL",
            accepted_payment_methods: {
              card: true,
              bank_account: false,
              square_gift_card: false,
            },
            title: planId === "basic" ? "ベーシックプラン（月額）" : "プレミアムプラン（月額）",
            description: `${planId === "basic" ? "ベーシック" : "プレミアム"}プランの月額料金`,
            scheduled_pub_date: new Date().toISOString().split('T')[0],
          },
        }),
      })

      const invoiceResult = await invoiceResponse.json()

      if (!invoiceResponse.ok || !invoiceResult.invoice) {
        console.error("Square Invoice API error:", invoiceResult)
        // フォールバック：直接決済リンクを生成（簡易版）
        // 実際の実装では、Square Payment Links APIやOrders APIを使用
        return NextResponse.json(
          {
            success: false,
            error: invoiceResult.errors?.[0]?.detail || "請求書の作成に失敗しました",
          },
          { status: 400 }
        )
      }

      const invoiceId = invoiceResult.invoice.id

      // 請求書を公開して支払いリンクを取得
      const publishResponse = await fetch(
        `https://connect.squareup.com/v2/invoices/${invoiceId}/publish`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${squareAccessToken}`,
            "Content-Type": "application/json",
            "Square-Version": "2023-10-18",
          },
          body: JSON.stringify({
            idempotency_key: `publish_${invoiceId}_${Date.now()}`,
            version: invoiceResult.invoice.version,
          }),
        }
      )

      const publishResult = await publishResponse.json()

      if (publishResponse.ok && publishResult.invoice?.public_url) {
        return NextResponse.json({
          success: true,
          checkoutUrl: publishResult.invoice.public_url,
          checkoutId: invoiceId,
          isMock: false,
        })
      }

      // フォールバック：Invoice URLを直接使用
      const invoiceUrl = `https://squareup.com/invoices/${invoiceId}`
      
      return NextResponse.json({
        success: true,
        checkoutUrl: invoiceUrl,
        checkoutId: invoiceId,
        isMock: false,
      })
    } catch (error) {
      console.error("Square API call error:", error)
      return NextResponse.json(
        { success: false, error: "Square APIへの接続に失敗しました" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
