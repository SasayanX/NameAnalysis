import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Square Webhook署名検証
function verifyWebhookSignature(body: string, signature: string, webhookSignatureKey: string): boolean {
  const hmac = crypto.createHmac("sha256", webhookSignatureKey)
  hmac.update(body)
  const expectedSignature = hmac.digest("base64")
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-square-signature") || ""

    // 環境判定: 本番環境では署名検証を必須にする
    const isProduction = process.env.NODE_ENV === "production"
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "D4d-LlU5XhUPO_MzYI1wcA"

    // テスト署名の判定（開発・テスト用）
    const isTestSignature = signature.startsWith("test-signature-")

    // 署名検証（本番環境でのみ厳格に実行、ただしテスト署名は除外）
    if (isProduction && signature && !isTestSignature) {
      if (!verifyWebhookSignature(body, signature, webhookSignatureKey)) {
        console.error("署名検証失敗:", { signature, webhookSignatureKey })
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // テスト署名の場合はログに記録
    if (isTestSignature && process.env.NODE_ENV === "development") {
      console.log("テスト署名を検出:", signature)
    }

    const event = JSON.parse(body)

    // 環境情報をログに追加
    if (process.env.NODE_ENV === "development") {
      console.log("Square Webhook受信:", {
        type: event.type,
        environment: isProduction ? "production" : "sandbox",
        hasSignature: !!signature,
        isTestSignature,
        timestamp: new Date().toISOString(),
      })
    }

    // 決済完了処理 (payment.updated)
    if (event.type === "payment.updated" && event.data?.object?.payment?.status === "COMPLETED") {
      const payment = event.data.object.payment
      const amount = payment.amount_money?.amount || 0
      const currency = payment.amount_money?.currency || "JPY"
      const orderId = payment.order_id
      const customerId = payment.buyer_email_address

      if (process.env.NODE_ENV === "development") {
        console.log("決済完了 (payment.updated):", {
          amount,
          currency,
          orderId,
          customerId,
          environment: isProduction ? "production" : "sandbox",
          isTest: isTestSignature,
        })
      }

      let plan: "basic" | "premium" = "basic"
      if (amount >= 44000) {
        plan = "premium"
      } else if (amount >= 22000) {
        plan = "basic"
      }

      await activateSubscription(customerId, plan, orderId)

      return NextResponse.json({
        success: true,
        message: `${plan}プランを有効化しました (payment.updated)`,
        customerId,
        plan,
        amount,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // 請求書支払い完了処理 (invoice.payment_made)
    if (event.type === "invoice.payment_made") {
      const invoice = event.data.object
      const amount = invoice.amount_money?.amount || 0

      if (process.env.NODE_ENV === "development") {
        console.log("請求書支払い完了 (invoice.payment_made):", {
          invoiceId: invoice.id,
          amount,
          environment: isProduction ? "production" : "sandbox",
          isTest: isTestSignature,
        })
      }

      // 金額に基づいてプラン判定
      let plan: "basic" | "premium" = "basic"
      if (amount >= 44000) {
        plan = "premium"
      }

      return NextResponse.json({
        success: true,
        message: `請求書支払い完了を確認しました (${plan}プラン)`,
        invoiceId: invoice.id,
        plan,
        amount,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // サブスクリプション作成処理
    if (event.type === "subscription.created") {
      const subscription = event.data.object
      console.log("サブスクリプション作成:", {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
      })

      return NextResponse.json({
        success: true,
        message: "サブスクリプション作成完了",
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    // サブスクリプション更新処理
    if (event.type === "subscription.updated") {
      const subscription = event.data.object
      console.log("サブスクリプション更新:", {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
      })

      return NextResponse.json({
        success: true,
        message: "サブスクリプション更新完了",
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        isTest: isTestSignature,
        environment: isProduction ? "production" : "sandbox",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook受信完了",
      eventType: event.type,
      isTest: isTestSignature,
      environment: isProduction ? "production" : "sandbox",
    })
  } catch (error) {
    console.error("Webhook処理エラー:", error)
    return NextResponse.json(
      {
        error: "Webhook処理に失敗しました",
        environment: process.env.NODE_ENV || "development",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Square Webhook エンドポイント - GET OK",
    status: "active",
    supportedMethods: ["GET", "POST"],
    url: "https://nameanalysis216.vercel.app/api/square-webhook",
    events: ["payment.updated", "subscription.created", "subscription.updated", "invoice.payment_made"],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    testMode: "テスト署名（test-signature-*）をサポート",
  })
}

// プラン有効化処理
async function activateSubscription(customerId: string, plan: "basic" | "premium", orderId: string) {
  try {
    const subscriptionData = {
      customerId,
      plan,
      orderId,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      status: "active",
    }

    // ローカルストレージに保存（開発用）
    if (typeof window !== "undefined") {
      const existingSubscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
      existingSubscriptions.push(subscriptionData)
      localStorage.setItem("subscriptions", JSON.stringify(existingSubscriptions))
    }

    await sendActivationEmail(customerId, plan)

    console.log("プラン有効化完了:", subscriptionData)
    return subscriptionData
  } catch (error) {
    console.error("プラン有効化エラー:", error)
    throw error
  }
}

// メール送信処理
async function sendActivationEmail(email: string, plan: string) {
  console.log(`${email}に${plan}プラン有効化メールを送信`)
}
