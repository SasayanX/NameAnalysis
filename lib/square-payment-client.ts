// Square決済クライアント（本番環境対応）
import { getCurrentConfig } from "./square-config"

export class SquarePaymentClient {
  private config = getCurrentConfig()

  async createSubscription(planId: string, cardNonce: string) {
    try {
      const response = await fetch("https://connect.squareup.com/v2/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
        body: JSON.stringify({
          location_id: this.config.locationId,
          plan_id: planId,
          source_id: cardNonce,
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
          "Square-Version": "2023-10-18",
        },
      })

      return await response.json()
    } catch (error) {
      console.error("Square subscription cancellation failed:", error)
      throw error
    }
  }
}
