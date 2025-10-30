// GMOペイメントゲートウェイ API クライアント

export interface GMOConfig {
  siteId: string
  sitePass: string
  shopId: string
  shopPass: string
  apiUrl: string
}

export interface CreateSubscriptionParams {
  customerId: string
  planId: string
  cardToken?: string
  startDate?: Date
  billingCycle: "monthly" | "quarterly" | "biannual" | "annual"
}

export interface GMOSubscriptionResponse {
  subscriptionId: string
  status: "active" | "pending" | "cancelled" | "failed"
  nextBillingDate: Date
  amount: number
  currency: string
}

export class GMOPaymentClient {
  private config: GMOConfig

  constructor(config: GMOConfig) {
    this.config = config
  }

  // 定期課金登録
  async createSubscription(params: CreateSubscriptionParams): Promise<GMOSubscriptionResponse> {
    try {
      const requestData = {
        SiteID: this.config.siteId,
        SitePass: this.config.sitePass,
        ShopID: this.config.shopId,
        ShopPass: this.config.shopPass,
        OrderID: this.generateOrderId(),
        MemberID: params.customerId,
        Amount: this.getPlanAmount(params.planId),
        Tax: this.calculateTax(this.getPlanAmount(params.planId)),
        Currency: "JPY",
        PayTimes: this.getBillingCycle(params.billingCycle),
        CardToken: params.cardToken,
      }

      const response = await fetch(`${this.config.apiUrl}/payment/EntryTran.idPass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestData),
      })

      const result = await response.text()
      return this.parseGMOResponse(result)
    } catch (error) {
      console.error("GMO Subscription creation failed:", error)
      throw new Error("サブスクリプション作成に失敗しました")
    }
  }

  // 定期課金停止
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const requestData = {
        SiteID: this.config.siteId,
        SitePass: this.config.sitePass,
        ShopID: this.config.shopId,
        ShopPass: this.config.shopPass,
        OrderID: subscriptionId,
      }

      const response = await fetch(`${this.config.apiUrl}/payment/AlterTran.idPass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ...requestData,
          JobCd: "CANCEL",
        }),
      })

      const result = await response.text()
      return this.isSuccessResponse(result)
    } catch (error) {
      console.error("GMO Subscription cancellation failed:", error)
      return false
    }
  }

  // 課金状態確認
  async getSubscriptionStatus(subscriptionId: string): Promise<GMOSubscriptionResponse | null> {
    try {
      const requestData = {
        SiteID: this.config.siteId,
        SitePass: this.config.sitePass,
        ShopID: this.config.shopId,
        ShopPass: this.config.shopPass,
        OrderID: subscriptionId,
      }

      const response = await fetch(`${this.config.apiUrl}/payment/SearchTrade.idPass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestData),
      })

      const result = await response.text()
      return this.parseGMOResponse(result)
    } catch (error) {
      console.error("GMO Subscription status check failed:", error)
      return null
    }
  }

  private generateOrderId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getPlanAmount(planId: string): number {
    const plans = {
      basic: 330,
      premium: 550,
    }
    return plans[planId as keyof typeof plans] || 0
  }

  private calculateTax(amount: number): number {
    return Math.floor(amount * 0.1) // 10%消費税
  }

  private getBillingCycle(cycle: string): number {
    const cycles = {
      monthly: 1,
      quarterly: 3,
      biannual: 6,
      annual: 12,
    }
    return cycles[cycle as keyof typeof cycles] || 1
  }

  private parseGMOResponse(response: string): GMOSubscriptionResponse {
    // GMOのレスポンス形式に応じてパース
    const params = new URLSearchParams(response)

    return {
      subscriptionId: params.get("OrderID") || "",
      status: this.mapGMOStatus(params.get("Status") || ""),
      nextBillingDate: new Date(params.get("NextBillingDate") || Date.now()),
      amount: Number.parseInt(params.get("Amount") || "0"),
      currency: params.get("Currency") || "JPY",
    }
  }

  private mapGMOStatus(gmoStatus: string): "active" | "pending" | "cancelled" | "failed" {
    const statusMap: Record<string, "active" | "pending" | "cancelled" | "failed"> = {
      CAPTURE: "active",
      AUTH: "pending",
      CANCEL: "cancelled",
      RETURN: "cancelled",
      VOID: "failed",
    }
    return statusMap[gmoStatus] || "failed"
  }

  private isSuccessResponse(response: string): boolean {
    return !response.includes("ErrCode")
  }
}
