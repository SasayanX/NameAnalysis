import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionManager } from "@/lib/subscription-manager"

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()

    // GMOからのWebhook署名検証（実装必要）
    if (!verifyGMOWebhook(webhookData, request.headers.get("x-gmo-signature"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const subscriptionManager = SubscriptionManager.getInstance()

    switch (webhookData.EventType) {
      case "payment.succeeded":
        await handleSuccessfulPayment(webhookData, subscriptionManager)
        break

      case "payment.failed":
        await handleFailedPayment(webhookData, subscriptionManager)
        break

      case "subscription.cancelled":
        await handleCancellation(webhookData, subscriptionManager)
        break

      default:
        if (process.env.NODE_ENV === "development") {
          console.log("Unknown webhook event:", webhookData.EventType)
        }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook処理に失敗しました" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(webhookData: any, manager: SubscriptionManager) {
  const { OrderID, MemberID, Amount } = webhookData

  // サブスクリプション更新
  await manager.updateSubscriptionStatus(MemberID, {
    status: "active",
    lastPaymentDate: new Date(),
    nextBillingDate: calculateNextBillingDate(webhookData.PayTimes),
  })

  // 成功通知メール送信
  await sendPaymentSuccessEmail(MemberID, Amount)
}

async function handleFailedPayment(webhookData: any, manager: SubscriptionManager) {
  const { OrderID, MemberID, ErrInfo } = webhookData

  // サブスクリプション状態更新
  await manager.updateSubscriptionStatus(MemberID, {
    status: "failed",
    lastFailureReason: ErrInfo,
  })

  // 失敗通知メール送信
  await sendPaymentFailureEmail(MemberID, ErrInfo)
}

async function handleCancellation(webhookData: any, manager: SubscriptionManager) {
  const { OrderID, MemberID } = webhookData

  // サブスクリプション停止
  await manager.updateSubscriptionStatus(MemberID, {
    status: "cancelled",
    cancelledAt: new Date(),
  })

  // 解約確認メール送信
  await sendCancellationEmail(MemberID)
}

function verifyGMOWebhook(data: any, signature: string | null): boolean {
  // GMOのWebhook署名検証ロジックを実装
  // 実際のGMO仕様に合わせて実装が必要
  return true // 仮実装
}

function calculateNextBillingDate(payTimes: number): Date {
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + payTimes)
  return nextDate
}

async function sendPaymentSuccessEmail(userId: string, amount: number) {
  // メール送信ロジック
  if (process.env.NODE_ENV === "development") {
    console.log(`Payment success email sent to ${userId}, amount: ${amount}`)
  }
}

async function sendPaymentFailureEmail(userId: string, reason: string) {
  // メール送信ロジック
  if (process.env.NODE_ENV === "development") {
    console.log(`Payment failure email sent to ${userId}, reason: ${reason}`)
  }
}

async function sendCancellationEmail(userId: string) {
  // メール送信ロジック
  if (process.env.NODE_ENV === "development") {
    console.log(`Cancellation email sent to ${userId}`)
  }
}
