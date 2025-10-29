"use client"

// サブスクリプション管理とプラン制御（本番環境対応版）

export type PlanType = "free" | "basic" | "premium"

export interface UserSubscription {
  plan: PlanType
  expiresAt: Date | null
  isActive: boolean
  trialEndsAt: Date | null
  gmoSubscriptionId?: string
  squareSubscriptionId?: string
  status?: "active" | "pending" | "cancelled" | "failed"
  nextBillingDate?: Date
  amount?: number
  lastPaymentDate?: Date
  lastFailureReason?: string
  cancelledAt?: Date
  paymentMethod?: "square" | "gmo" | "manual"
}

export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: {
    personalAnalysis: number // -1 = unlimited
    companyAnalysis: number // -1 = unlimited
    babyNaming: number // -1 = unlimited
    fortuneFlow: number // -1 = unlimited
    dataExport: boolean
    prioritySupport: boolean
  }
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "無料プラン",
    price: 0,
    currency: "JPY",
    interval: "month",
    features: ["個人名分析 1日1回", "会社名分析 1日1回", "基本的な姓名判断", "簡易レポート"],
    limits: {
      personalAnalysis: 1,
      companyAnalysis: 1,
      babyNaming: 0,
      fortuneFlow: 0,
      dataExport: false,
      prioritySupport: false,
    },
  },
  {
    id: "basic",
    name: "ベーシックプラン",
    price: 220,
    currency: "JPY",
    interval: "month",
    features: ["個人名分析 1日10回", "会社名分析 1日10回", "赤ちゃん名付け 1日5回", "詳細レポート", "PDF出力"],
    limits: {
      personalAnalysis: 10, // 1日10回に制限
      companyAnalysis: 10, // 1日10回に制限
      babyNaming: 5, // 1日5回に制限
      fortuneFlow: 5, // 1日5回に制限
      dataExport: true,
      prioritySupport: false,
    },
  },
  {
    id: "premium",
    name: "プレミアムプラン",
    price: 440,
    currency: "JPY",
    interval: "month",
    features: [
      "全機能無制限",
      "赤ちゃん名付け 無制限",
      "運勢フロー分析",
      "優先サポート",
      "データエクスポート",
      "カスタムレポート",
    ],
    limits: {
      personalAnalysis: -1,
      companyAnalysis: -1,
      babyNaming: -1,
      fortuneFlow: -1,
      dataExport: true,
      prioritySupport: true,
    },
  },
]

export class SubscriptionManager {
  private static instance: SubscriptionManager
  private currentSubscription: UserSubscription
  private listeners: Set<() => void> = new Set()

  private constructor() {
    this.currentSubscription = this.loadSubscription()
  }

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager()
    }
    return SubscriptionManager.instance
  }

  private loadSubscription(): UserSubscription {
    try {
      if (typeof window === "undefined") {
        return this.getDefaultSubscription()
      }

      const stored = localStorage.getItem("userSubscription")
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
          trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : null,
          nextBillingDate: parsed.nextBillingDate ? new Date(parsed.nextBillingDate) : null,
          lastPaymentDate: parsed.lastPaymentDate ? new Date(parsed.lastPaymentDate) : null,
          cancelledAt: parsed.cancelledAt ? new Date(parsed.cancelledAt) : null,
        }
      }

      // 開発環境：デフォルトは無料プラン
      return this.getDefaultSubscription()
    } catch (error) {
      console.error("Failed to load subscription:", error)
      return this.getDefaultSubscription()
    }
  }

  private getDefaultSubscription(): UserSubscription {
    return {
      plan: "free",
      expiresAt: null,
      isActive: false,
      trialEndsAt: null,
    }
  }

  private saveSubscription(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("userSubscription", JSON.stringify(this.currentSubscription))
        this.notifyListeners()
      }
    } catch (error) {
      console.error("Failed to save subscription:", error)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getCurrentPlan(): SubscriptionPlan {
    try {
      if (!this.isSubscriptionActive()) {
        return SUBSCRIPTION_PLANS[0] // Free plan
      }

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === this.currentSubscription.plan)
      return plan || SUBSCRIPTION_PLANS[0]
    } catch (error) {
      console.error("Error getting current plan:", error)
      return SUBSCRIPTION_PLANS[0]
    }
  }

  isSubscriptionActive(): boolean {
    try {
      // 無料プランの場合は常にfalse（有効なサブスクリプションではない）
      if (this.currentSubscription.plan === "free") {
        return false
      }

      if (this.currentSubscription.status === "cancelled" || this.currentSubscription.status === "failed") {
        return false
      }

      if (!this.currentSubscription.expiresAt) {
        // expiresAtがない場合は無効（無料プラン以外で有効なサブスクリプションにはexpiresAtが必要）
        return false
      }

      return new Date() < this.currentSubscription.expiresAt
    } catch (error) {
      console.error("Error checking subscription active:", error)
      return false
    }
  }

  isInTrial(): boolean {
    try {
      if (!this.currentSubscription.trialEndsAt) return false
      return new Date() < this.currentSubscription.trialEndsAt
    } catch (error) {
      console.error("Error checking trial status:", error)
      return false
    }
  }

  getTrialDaysRemaining(): number {
    try {
      if (!this.isInTrial()) return 0

      const now = new Date()
      const trialEnd = this.currentSubscription.trialEndsAt!
      const diffTime = trialEnd.getTime() - now.getTime()
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    } catch (error) {
      console.error("Error getting trial days remaining:", error)
      return 0
    }
  }

  // 本番環境：Square決済でのサブスクリプション開始
  async startSquareSubscription(planId: PlanType): Promise<{ success: boolean; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) {
        return { success: false, error: "Invalid plan" }
      }

      // Square APIを呼び出してサブスクリプションを作成
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          paymentMethod: "square",
        }),
      })

      const result = await response.json()

      if (result.success) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        this.currentSubscription = {
          plan: planId,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          squareSubscriptionId: result.subscriptionId,
          status: "active",
          paymentMethod: "square",
          amount: plan.price,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
        }

        this.saveSubscription()
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error("Error starting Square subscription:", error)
      return { success: false, error: "Failed to start subscription" }
    }
  }

  // 本番環境：GMO決済でのサブスクリプション開始
  async startGMOSubscription(planId: PlanType): Promise<{ success: boolean; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) {
        return { success: false, error: "Invalid plan" }
      }

      // GMO APIを呼び出してサブスクリプションを作成
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          paymentMethod: "gmo",
        }),
      })

      const result = await response.json()

      if (result.success) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        this.currentSubscription = {
          plan: planId,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          gmoSubscriptionId: result.subscriptionId,
          status: "active",
          paymentMethod: "gmo",
          amount: plan.price,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
        }

        this.saveSubscription()
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error("Error starting GMO subscription:", error)
      return { success: false, error: "Failed to start subscription" }
    }
  }

  // サブスクリプションキャンセル
  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: this.currentSubscription.squareSubscriptionId || this.currentSubscription.gmoSubscriptionId,
          paymentMethod: this.currentSubscription.paymentMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        this.currentSubscription.status = "cancelled"
        this.currentSubscription.cancelledAt = new Date()
        this.saveSubscription()
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      return { success: false, error: "Failed to cancel subscription" }
    }
  }

  // デバッグ用：プラン切り替え（開発環境のみ）
  debugSwitchPlan(planId: PlanType): void {
    try {
      if (process.env.NODE_ENV !== "development") {
        console.warn("debugSwitchPlan is only available in development mode")
        return
      }

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) return

      if (planId === "free") {
        this.currentSubscription = {
          plan: "free",
          expiresAt: null,
          isActive: false,
          trialEndsAt: null,
        }
      } else {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        this.currentSubscription = {
          plan: planId,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          status: "active",
          paymentMethod: "square",
          amount: plan.price,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
        }
      }

      this.saveSubscription()
    } catch (error) {
      console.error("Error in debug switch plan:", error)
    }
  }

  // 開発環境用：3日間トライアルを開始
  debugStartTrial(): void {
    try {
      if (process.env.NODE_ENV !== "development") {
        console.warn("debugStartTrial is only available in development mode")
        return
      }

      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 3) // 3日間トライアル

      this.currentSubscription = {
        plan: "premium",
        expiresAt: trialEndsAt,
        isActive: true,
        trialEndsAt,
        status: "active",
        paymentMethod: "square",
      }

      this.saveSubscription()
    } catch (error) {
      console.error("Error starting trial:", error)
    }
  }

  // サブスクリプション情報の取得
  getSubscriptionInfo(): UserSubscription {
    return { ...this.currentSubscription }
  }

  // 支払い履歴の取得（実装予定）
  async getPaymentHistory(): Promise<any[]> {
    // 実装予定：決済プロバイダーから支払い履歴を取得
    return []
  }

  // 次回請求日の取得
  getNextBillingDate(): Date | null {
    return this.currentSubscription.nextBillingDate || null
  }

  // 請求金額の取得
  getCurrentAmount(): number {
    return this.currentSubscription.amount || 0
  }
}

// React Hook
import { useState, useEffect, useCallback } from "react"

export function useSubscription() {
  const [manager] = useState(() => SubscriptionManager.getInstance())
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const unsubscribe = manager.addListener(() => {
      forceUpdate({})
    })
    return unsubscribe
  }, [manager])

  const getCurrentPlan = useCallback(() => manager.getCurrentPlan(), [manager])
  const isActive = useCallback(() => manager.isSubscriptionActive(), [manager])
  const isInTrial = useCallback(() => manager.isInTrial(), [manager])
  const getTrialDaysRemaining = useCallback(() => manager.getTrialDaysRemaining(), [manager])
  const startSquareSubscription = useCallback((planId: PlanType) => manager.startSquareSubscription(planId), [manager])
  const startGMOSubscription = useCallback((planId: PlanType) => manager.startGMOSubscription(planId), [manager])
  const cancelSubscription = useCallback(() => manager.cancelSubscription(), [manager])
  const getSubscriptionInfo = useCallback(() => manager.getSubscriptionInfo(), [manager])
  const getNextBillingDate = useCallback(() => manager.getNextBillingDate(), [manager])
  const getCurrentAmount = useCallback(() => manager.getCurrentAmount(), [manager])
  const debugSwitchPlan = useCallback((planId: PlanType) => manager.debugSwitchPlan(planId), [manager])
  const debugStartTrial = useCallback(() => manager.debugStartTrial(), [manager])

  return {
    getCurrentPlan,
    isActive,
    isInTrial,
    getTrialDaysRemaining,
    startSquareSubscription,
    startGMOSubscription,
    cancelSubscription,
    getSubscriptionInfo,
    getNextBillingDate,
    getCurrentAmount,
    debugSwitchPlan,
    debugStartTrial,
  }
}
