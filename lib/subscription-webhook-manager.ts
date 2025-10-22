export class SubscriptionWebhookManager {
  private static instance: SubscriptionWebhookManager

  static getInstance(): SubscriptionWebhookManager {
    if (!SubscriptionWebhookManager.instance) {
      SubscriptionWebhookManager.instance = new SubscriptionWebhookManager()
    }
    return SubscriptionWebhookManager.instance
  }

  // アクティブなサブスクリプションを取得
  getActiveSubscription(customerId: string): any | null {
    try {
      if (typeof window === "undefined") return null

      const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
      const activeSubscription = subscriptions.find(
        (sub: any) => sub.customerId === customerId && sub.status === "active" && new Date(sub.expiresAt) > new Date(),
      )

      return activeSubscription || null
    } catch (error) {
      console.error("サブスクリプション取得エラー:", error)
      return null
    }
  }

  // プラン状態を確認
  checkPlanStatus(customerId: string): { plan: "free" | "basic" | "premium"; isActive: boolean } {
    const subscription = this.getActiveSubscription(customerId)

    if (!subscription) {
      return { plan: "free", isActive: false }
    }

    return {
      plan: subscription.plan,
      isActive: true,
    }
  }

  // サブスクリプション履歴を取得
  getSubscriptionHistory(customerId: string): any[] {
    try {
      if (typeof window === "undefined") return []

      const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
      return subscriptions.filter((sub: any) => sub.customerId === customerId)
    } catch (error) {
      console.error("履歴取得エラー:", error)
      return []
    }
  }

  // テスト用：サブスクリプションを手動で追加
  addTestSubscription(customerId: string, plan: "basic" | "premium") {
    try {
      if (typeof window === "undefined") return false

      const subscriptionData = {
        customerId,
        plan,
        orderId: `test-${Date.now()}`,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      }

      const existingSubscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
      existingSubscriptions.push(subscriptionData)
      localStorage.setItem("subscriptions", JSON.stringify(existingSubscriptions))

      return true
    } catch (error) {
      console.error("テストサブスクリプション追加エラー:", error)
      return false
    }
  }
}
