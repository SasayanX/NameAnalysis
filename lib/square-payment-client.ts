// Square決済クライアント（本番環境対応）
import { getCurrentConfig } from "./square-config"

export class SquarePaymentClient {
  private config = getCurrentConfig()

  /**
   * サブスクリプションを作成（最新版）
   * Perplexity調査結果に基づき、cardIdとcustomerIdを使用
   */
  async createSubscription(planId: string, cardId: string, customerId: string) {
    try {
      const response = await fetch("https://connect.squareup.com/v2/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2025-11-18", // 最新版
        },
        body: JSON.stringify({
          idempotency_key: `subscription_${planId}_${Date.now()}`,
          location_id: this.config.locationId,
          plan_id: planId,
          customer_id: customerId, // 必須
          card_id: cardId, // CreateCardで取得したcardId（必須）
          start_date: new Date().toISOString().split("T")[0],
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Square subscription creation failed:", error)
      throw error
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await fetch(`https://connect.squareup.com/v2/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2025-11-18", // 最新版
        },
      })

      return await response.json()
    } catch (error) {
      console.error("Square subscription cancellation failed:", error)
      throw error
    }
  }
}
