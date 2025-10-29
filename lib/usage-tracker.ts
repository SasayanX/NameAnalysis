// lib/usage-tracker.ts
"use client"

import { SubscriptionManager } from "./subscription-manager"

interface UsageLimits {
  personalAnalysis: number
  companyAnalysis: number
  compatibilityAnalysis: number
  numerologyAnalysis: number
  babyNaming: number
  pdfExport: number
  historyStorage: number
}

interface UsageStatus {
  plan: string
  isInTrial: boolean
  trialDaysRemaining: number
  todayUsage: UsageLimits
  limits: UsageLimits
  canUseFeature: (feature: keyof UsageLimits) => { allowed: boolean; limit: number; current: number; remaining: number }
}

interface UsageLimit {
  allowed: boolean
  limit: number
  current: number
  remaining: number
}

interface UsageData {
  personalAnalysis: number
  companyAnalysis: number
  compatibilityAnalysis: number
  numerologyAnalysis: number
  babyNaming: number
  pdfExport: number
  historyStorage: number
  lastReset: string
}

const PLAN_LIMITS: { [plan: string]: UsageLimits } = {
  free: {
    personalAnalysis: 1,
    companyAnalysis: 1,
    compatibilityAnalysis: 0,
    numerologyAnalysis: 0,
    babyNaming: 0,
    pdfExport: 0,
    historyStorage: 10,
  },
  basic: {
    personalAnalysis: -1,
    companyAnalysis: -1,
    compatibilityAnalysis: 5,
    numerologyAnalysis: 5,
    babyNaming: 5,
    pdfExport: 5,
    historyStorage: 50,
  },
  premium: {
    personalAnalysis: -1,
    companyAnalysis: -1,
    compatibilityAnalysis: -1,
    numerologyAnalysis: -1,
    babyNaming: -1,
    pdfExport: -1,
    historyStorage: -1,
  },
}

export class UsageTracker {
  private static instance: UsageTracker
  private usageData: UsageData

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker()
    }
    return UsageTracker.instance
  }

  private constructor() {
    this.usageData = this.loadUsageData()
    this.checkDailyReset()
  }

  // v0環境かどうかを判定
  private isV0Environment(): boolean {
    // プロダクション環境では常にfalse（制限を適用）
    // 開発環境でも、明示的にデバッグモードが設定されていない限りfalse
    if (typeof window !== "undefined") {
      // 明示的なデバッグフラグがある場合のみ無制限
      const isDebugMode = localStorage.getItem("debug_unlimited_mode") === "true"
      if (isDebugMode && window.location.hostname === "localhost") {
        return true
      }
    }
    // それ以外は常にfalse（制限を適用）
    return false
  }

  private loadUsageData(): UsageData {
    try {
      if (typeof window === "undefined") {
        return this.getDefaultUsageData()
      }

      const stored = localStorage.getItem("usage_tracker_data")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (this.isValidUsageData(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.error("Failed to load usage data:", error)
    }

    return this.getDefaultUsageData()
  }

  private getDefaultUsageData(): UsageData {
    return {
      personalAnalysis: 0,
      companyAnalysis: 0,
      compatibilityAnalysis: 0,
      numerologyAnalysis: 0,
      babyNaming: 0,
      pdfExport: 0,
      historyStorage: 0,
      lastReset: new Date().toISOString().split("T")[0],
    }
  }

  private isValidUsageData(data: any): data is UsageData {
    return (
      data &&
      typeof data === "object" &&
      typeof data.personalAnalysis === "number" &&
      typeof data.companyAnalysis === "number" &&
      typeof data.compatibilityAnalysis === "number" &&
      typeof data.numerologyAnalysis === "number" &&
      typeof data.babyNaming === "number" &&
      typeof data.pdfExport === "number" &&
      typeof data.historyStorage === "number" &&
      typeof data.lastReset === "string"
    )
  }

  private saveUsageData() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("usage_tracker_data", JSON.stringify(this.usageData))
      }
    } catch (error) {
      console.error("Failed to save usage data:", error)
    }
  }

  incrementUsage(feature: keyof Omit<UsageData, "lastReset">): boolean {
    try {
      // v0環境では常に許可
      if (this.isV0Environment()) {
        return true
      }

      const canUse = this.canUseFeature(feature)
      if (!canUse.allowed) {
        return false
      }

      this.usageData[feature] = (this.usageData[feature] || 0) + 1
      this.saveUsageData()
      return true
    } catch (error) {
      console.error("Error incrementing usage:", error)
      return false
    }
  }

  resetUsage() {
    try {
      this.usageData = {
        ...this.getDefaultUsageData(),
        lastReset: new Date().toISOString().split("T")[0],
      }
      this.saveUsageData()
    } catch (error) {
      console.error("Error resetting usage:", error)
    }
  }

  private getCurrentPlan(): string {
    try {
      // 開発環境でのデバッグモードチェック（明示的に設定された場合のみ）
      if (this.isV0Environment()) {
        return "premium"
      }

      // SubscriptionManagerから実際のプラン情報を取得
      if (typeof window !== "undefined") {
        // デバッグモードで上書きできるようにする（開発用）
        const debugPlan = localStorage.getItem("debug_current_plan")
        if (debugPlan && process.env.NODE_ENV === "development") {
          console.log(`[UsageTracker] デバッグプラン: ${debugPlan}`)
          return debugPlan
        }

        // SubscriptionManagerから実際のプランを取得
        try {
          // SubscriptionManagerは直接インポート
          const manager = SubscriptionManager.getInstance()
          const subscriptionInfo = manager.getSubscriptionInfo()
          
          console.log(`[UsageTracker] サブスクリプション情報:`, subscriptionInfo)
          
          if (subscriptionInfo && subscriptionInfo.plan) {
            const plan = subscriptionInfo.plan
            
            // 無料プランの場合はそのまま返す
            if (plan === "free") {
              console.log(`[UsageTracker] 無料プラン`)
              return "free"
            }
            
            // 有料プラン（basic/premium）の場合
            // isSubscriptionActive()で有効性をチェック
            // subscriptionInfo.isActiveは信用せず、必ずisSubscriptionActive()を使用
            const isActive = manager.isSubscriptionActive()
            console.log(`[UsageTracker] 有料プラン: ${plan}, isSubscriptionActive()=${isActive}`)
            console.log(`[UsageTracker] subscriptionInfo詳細:`, {
              plan: subscriptionInfo.plan,
              isActive: subscriptionInfo.isActive,
              status: subscriptionInfo.status,
              expiresAt: subscriptionInfo.expiresAt
            })
            
            if (isActive) {
              console.log(`[UsageTracker] ✅ 有効な有料プラン: ${plan}`)
              return plan
            } else {
              // 有料プランだが期限切れなどの場合は無料プランに戻す
              console.log(`[UsageTracker] ❌ 有料プランだが無効 (status=${subscriptionInfo.status}, expiresAt=${subscriptionInfo.expiresAt}) → 無料プランに戻す`)
              return "free"
            }
          }
          
          // サブスクリプション情報がない場合は無料プラン
          console.log(`[UsageTracker] サブスクリプション情報なし → 無料プラン`)
          return "free"
        } catch (error) {
          console.error("[UsageTracker] SubscriptionManager取得エラー:", error)
          // エラーが発生した場合はfreeプランを返す
        }
      }
      
      // デフォルトは"free"プラン
      console.log(`[UsageTracker] デフォルト: freeプラン`)
      return "free"
    } catch (error) {
      console.error("[UsageTracker] getCurrentPlan エラー:", error)
      return "free"
    }
  }

  private isInTrialMode(): boolean {
    try {
      // v0環境では常にfalse
      if (this.isV0Environment()) {
        return false
      }

      // In a real implementation, this would get trial status from SubscriptionManager
      if (typeof window !== "undefined") {
        const debugTrial = localStorage.getItem("debug_is_trial")
        return debugTrial === "true"
      }
      return false
    } catch (error) {
      console.error("Error checking trial status:", error)
      return false
    }
  }

  private getTrialDaysRemaining(): number {
    try {
      // v0環境では常に0
      if (this.isV0Environment()) {
        return 0
      }

      // In a real implementation, this would get trial days from SubscriptionManager
      if (typeof window !== "undefined") {
        const debugTrialDays = localStorage.getItem("debug_trial_days")
        if (debugTrialDays) {
          return Number.parseInt(debugTrialDays, 10) || 0
        }
      }
      return 0
    } catch (error) {
      console.error("Error getting trial days:", error)
      return 0
    }
  }

  private getPlanLimits(plan: string): UsageLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS["free"]
  }

  private checkDailyReset() {
    try {
      const today = new Date().toISOString().split("T")[0]
      if (this.usageData.lastReset !== today) {
        this.usageData = {
          ...this.getDefaultUsageData(),
          lastReset: today,
        }
        this.saveUsageData()
      }
    } catch (error) {
      console.error("Failed to check daily reset:", error)
    }
  }

  getTodayUsage(): UsageLimits {
    try {
      const { lastReset, ...todayUsage } = this.usageData
      return todayUsage
    } catch (error) {
      console.error("Error getting today usage:", error)
      return {
        personalAnalysis: 0,
        companyAnalysis: 0,
        compatibilityAnalysis: 0,
        numerologyAnalysis: 0,
        babyNaming: 0,
        pdfExport: 0,
        historyStorage: 0,
      }
    }
  }

  canUseFeature(feature: keyof Omit<UsageData, "lastReset">): UsageLimit {
    try {
      // v0環境（開発環境でのデバッグモード）では常に無制限
      if (this.isV0Environment()) {
        console.log(`[UsageTracker] v0環境モード: ${feature} は無制限`)
        return {
          allowed: true,
          limit: -1,
          current: this.usageData[feature] || 0,
          remaining: -1,
        }
      }

      // 開発環境での無制限モードチェック（明示的に設定された場合のみ）
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("debug_unlimited_mode") === "true"
      ) {
        console.log(`[UsageTracker] デバッグ無制限モード: ${feature} は無制限`)
        return {
          allowed: true,
          limit: -1,
          current: this.usageData[feature] || 0,
          remaining: -1,
        }
      }

      this.checkDailyReset()

      const currentPlan = this.getCurrentPlan()
      console.log(`[UsageTracker] canUseFeature: ${feature}, プラン: ${currentPlan}`)
      const limits = this.getPlanLimits(currentPlan)

      const featureLimit = limits[feature]
      const currentUsage = this.usageData[feature] || 0

      console.log(`[UsageTracker] ${feature}: 制限=${featureLimit}, 使用=${currentUsage}`)

      if (featureLimit === -1) {
        // 無制限
        return {
          allowed: true,
          limit: -1,
          current: currentUsage,
          remaining: -1,
        }
      }

      const remaining = Math.max(0, featureLimit - currentUsage)
      const result = {
        allowed: remaining > 0,
        limit: featureLimit,
        current: currentUsage,
        remaining,
      }
      
      console.log(`[UsageTracker] ${feature}: 結果:`, result)
      return result
    } catch (error) {
      console.error("[UsageTracker] canUseFeature エラー:", error)
      return {
        allowed: false,
        limit: 0,
        current: 0,
        remaining: 0,
      }
    }
  }

  getUsageStatus(): UsageStatus {
    try {
      // v0環境（開発環境でのデバッグモード）では常に無制限として扱う
      if (this.isV0Environment()) {
        const { lastReset, ...todayUsage } = this.usageData
        console.log("[UsageTracker] getUsageStatus: v0環境モード（無制限）")
        return {
          plan: "premium", // v0環境ではpremiumとして扱う
          isInTrial: false,
          trialDaysRemaining: 0,
          todayUsage,
          limits: {
            personalAnalysis: -1, // 無制限
            companyAnalysis: -1,
            compatibilityAnalysis: -1,
            numerologyAnalysis: -1,
            babyNaming: -1,
            pdfExport: -1,
            historyStorage: -1,
          },
          canUseFeature: () => ({ allowed: true, limit: -1, current: 0, remaining: -1 }),
        }
      }

      // 開発環境での無制限モードチェック（明示的に設定された場合のみ）
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("debug_unlimited_mode") === "true"
      ) {
        const { lastReset, ...todayUsage } = this.usageData
        console.log("[UsageTracker] getUsageStatus: デバッグ無制限モード")
        return {
          plan: this.getCurrentPlan(),
          isInTrial: this.isInTrialMode(),
          trialDaysRemaining: this.getTrialDaysRemaining(),
          todayUsage,
          limits: {
            personalAnalysis: -1, // 無制限
            companyAnalysis: -1,
            compatibilityAnalysis: -1,
            numerologyAnalysis: -1,
            babyNaming: -1,
            pdfExport: -1,
            historyStorage: -1,
          },
          canUseFeature: () => ({ allowed: true, limit: -1, current: 0, remaining: -1 }),
        }
      }

      this.checkDailyReset()

      const currentPlan = this.getCurrentPlan()
      const limits = this.getPlanLimits(currentPlan)

      // todayUsageから lastReset を除外
      const { lastReset, ...todayUsage } = this.usageData

      return {
        plan: currentPlan,
        isInTrial: this.isInTrialMode(),
        trialDaysRemaining: this.getTrialDaysRemaining(),
        todayUsage,
        limits,
        canUseFeature: (feature: keyof Omit<UsageData, "lastReset">) => this.canUseFeature(feature),
      }
    } catch (error) {
      console.error("Error getting usage status:", error)
      return {
        plan: "free",
        isInTrial: false,
        trialDaysRemaining: 0,
        todayUsage: {
          personalAnalysis: 0,
          companyAnalysis: 0,
          compatibilityAnalysis: 0,
          numerologyAnalysis: 0,
          babyNaming: 0,
          pdfExport: 0,
          historyStorage: 0,
        },
        limits: {
          personalAnalysis: 1,
          companyAnalysis: 1,
          compatibilityAnalysis: 0,
          numerologyAnalysis: 0,
          babyNaming: 0,
          pdfExport: 0,
          historyStorage: 0,
        },
        canUseFeature: () => ({ allowed: false, limit: 0, current: 0, remaining: 0 }),
      }
    }
  }
}
