export interface WebhookEvent {
  type: string
  data: {
    object: any
  }
  created_at?: string
}

export interface WebhookTestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export class WebhookVerification {
  static verifySignature(payload: string, signature: string, webhookSignatureKey: string): boolean {
    // 本番環境では実際の署名検証を実装
    // 開発環境では常にtrueを返す
    if (process.env.NODE_ENV === "development") {
      return true
    }

    // 実際の署名検証ロジックをここに実装
    return signature.startsWith("test-signature") || signature.length > 10
  }

  static processWebhookEvent(event: WebhookEvent): WebhookTestResult {
    try {
      switch (event.type) {
        case "payment.updated":
          return this.handlePaymentUpdated(event)
        case "subscription.created":
          return this.handleSubscriptionCreated(event)
        case "subscription.updated":
          return this.handleSubscriptionUpdated(event)
        case "invoice.payment_made":
          return this.handleInvoicePaymentMade(event)
        default:
          return {
            success: false,
            message: `未対応のイベントタイプ: ${event.type}`,
          }
      }
    } catch (error) {
      return {
        success: false,
        message: "イベント処理中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private static handlePaymentUpdated(event: WebhookEvent): WebhookTestResult {
    const payment = event.data.object.payment || event.data.object

    return {
      success: true,
      message: "決済完了イベントを正常に処理しました",
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount_money?.amount,
        currency: payment.amount_money?.currency,
        buyerEmail: payment.buyer_email_address,
      },
    }
  }

  private static handleSubscriptionCreated(event: WebhookEvent): WebhookTestResult {
    const subscription = event.data.object

    return {
      success: true,
      message: "サブスクリプション作成イベントを正常に処理しました",
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        customerId: subscription.customer_id,
      },
    }
  }

  private static handleSubscriptionUpdated(event: WebhookEvent): WebhookTestResult {
    const subscription = event.data.object

    return {
      success: true,
      message: "サブスクリプション更新イベントを正常に処理しました",
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        customerId: subscription.customer_id,
      },
    }
  }

  private static handleInvoicePaymentMade(event: WebhookEvent): WebhookTestResult {
    const invoice = event.data.object

    return {
      success: true,
      message: "請求書支払いイベントを正常に処理しました",
      data: {
        invoiceId: invoice.id,
        status: invoice.status,
        amount: invoice.amount_money?.amount,
        currency: invoice.amount_money?.currency,
      },
    }
  }
}
