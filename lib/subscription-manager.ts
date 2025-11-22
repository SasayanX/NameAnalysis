"use client"

// サブスクリプション管理とプラン制御（本番環境対応版）

import { getGooglePlayProductId } from "./google-play-product-ids"

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
  paymentMethod?: "square" | "gmo" | "manual" | "google_play"
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
    price: 330,
    currency: "JPY",
    interval: "month",
    features: [
      "個人名分析 無制限",
      "会社名分析 無制限",
      "相性診断 1日5回",
      "数秘術分析 1日5回",
      "赤ちゃん名付け 1日5回",
      "運気運行表 1日5回",
      "詳細レポート",
      "PDF出力 1日5回",
    ],
    limits: {
      personalAnalysis: -1, // 無制限
      companyAnalysis: -1, // 無制限
      babyNaming: 5, // 1日5回に制限
      fortuneFlow: 5, // 1日5回に制限
      dataExport: false, // 将来の機能として予定
      prioritySupport: false,
    },
  },
  {
    id: "premium",
    name: "プレミアムプラン",
    price: 550,
    currency: "JPY",
    interval: "month",
    features: [
      "全機能無制限",
      "個人名分析 無制限",
      "会社名分析 無制限",
      "相性診断 無制限",
      "数秘術分析 無制限",
      "赤ちゃん名付け 無制限",
      "運気運行表 無制限",
      "AI深層言霊鑑定: 1日1回まで無料",
      "おなまえ格付けランク",
      "全国ランキング比較",
      "PDF出力 無制限",
      "優先サポート",
    ],
    limits: {
      personalAnalysis: -1,
      companyAnalysis: -1,
      babyNaming: -1,
      fortuneFlow: -1,
      dataExport: false, // 将来の機能として予定
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
    if (typeof window !== "undefined") {
      // TWA環境では、認証情報が確実に取得できるまで待機してから同期
      const isTWA = typeof navigator !== "undefined" && 
        (navigator.userAgent?.includes("twa") || 
         navigator.userAgent?.includes("androidbrowserhelper") ||
         (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))
      
      if (isTWA) {
        // TWA環境では、少し待機してから同期（localStorageの保存が完了するのを待つ）
        setTimeout(async () => {
          try {
            const identity = this.getIdentityMetadata()
            if (identity.userId || identity.customerEmail) {
              console.log("[TWA] SubscriptionManager: 認証情報を確認、同期を開始します", identity)
              await this.syncSubscriptionFromServer()
            } else {
              console.warn("[TWA] SubscriptionManager: 認証情報が見つかりません。ログインが必要です。")
            }
          } catch (error) {
            console.error("[TWA] SubscriptionManager initial sync failed:", error)
          }
        }, 500)
      } else {
        // 通常のWeb環境では即座に同期
        this.syncSubscriptionFromServer().catch((error) => {
          console.warn("SubscriptionManager initial sync failed:", error)
        })
      }
    }
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

  private getIdentityMetadata(): { userId?: string; customerEmail?: string } {
    const metadata: { userId?: string; customerEmail?: string } = {}

    if (typeof window === "undefined") {
      return metadata
    }

    try {
      // localStorageから直接取得（TWA環境では複数回試行）
      const getFromLocalStorage = (key: string, retries = 3): string | null => {
        for (let i = 0; i < retries; i++) {
          try {
            const value = window.localStorage.getItem(key)
            if (value) {
              return value
            }
          } catch (error) {
            console.warn(`[TWA] localStorage読み取りエラー (試行 ${i + 1}/${retries}):`, error)
            if (i < retries - 1) {
              // 次の試行前に少し待機
              setTimeout(() => {}, 50)
            }
          }
        }
        return null
      }
      
      const storedEmail = getFromLocalStorage("customerEmail")
      if (storedEmail) {
        metadata.customerEmail = storedEmail.toLowerCase()
        console.log("[SubscriptionManager] customerEmail from localStorage:", metadata.customerEmail)
      }
      
      const storedUserId = getFromLocalStorage("userId")
      if (storedUserId) {
        metadata.userId = storedUserId
        console.log("[SubscriptionManager] userId from localStorage:", metadata.userId)
      }
      
      // TWA環境の検出とログ出力
      const isTWA = typeof navigator !== "undefined" && 
        (navigator.userAgent?.includes("twa") || 
         navigator.userAgent?.includes("androidbrowserhelper") ||
         (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))
      
      if (isTWA && !metadata.customerEmail && !metadata.userId) {
        console.warn("[TWA] ⚠️ localStorageに認証情報が見つかりません。ログイン状態を確認してください。")
      }
    } catch (error) {
      console.warn("Failed to read identity from localStorage:", error)
    }

    try {
      const sessionData = window.localStorage.getItem("userSession")
      if (sessionData) {
        const session = JSON.parse(sessionData)

        const sessionEmail =
          session?.email ??
          session?.user?.email ??
          session?.user?.user_email ??
          session?.user?.primary_email

        if (!metadata.customerEmail && typeof sessionEmail === "string") {
          metadata.customerEmail = sessionEmail.toLowerCase()
        }

        const sessionUserId =
          session?.user?.id ??
          session?.user?.uuid ??
          session?.user_id ??
          session?.id

        if (typeof sessionUserId === "string") {
          metadata.userId = sessionUserId
        }
      }
    } catch (error) {
      console.warn("Failed to parse userSession from localStorage:", error)
    }

    // Supabase Authセッションから取得（sb-<project>-auth-token）
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i)
        if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue

        const raw = window.localStorage.getItem(key)
        if (!raw) continue

        let parsed: any
        try {
          parsed = JSON.parse(raw)
        } catch (error) {
          continue
        }

        const supabaseSession = parsed?.currentSession
        const supabaseUser = supabaseSession?.user
        if (!supabaseUser) continue

        if (!metadata.userId && typeof supabaseUser.id === "string") {
          metadata.userId = supabaseUser.id
        }

        const supabaseEmail: string | undefined =
          supabaseUser.email ||
          supabaseUser.user_email ||
          supabaseUser.primary_email ||
          supabaseSession?.email

        if (!metadata.customerEmail && typeof supabaseEmail === "string") {
          metadata.customerEmail = supabaseEmail.toLowerCase()
        }

        if (metadata.userId && metadata.customerEmail) {
          break
        }
      }
    } catch (error) {
      console.warn("Failed to extract Supabase auth session:", error)
    }

    return metadata
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
        console.log("[SubscriptionManager] isSubscriptionActive - Free plan, returning false")
        return false
      }

      // statusが"cancelled"または"failed"の場合は無効
      if (this.currentSubscription.status === "cancelled" || this.currentSubscription.status === "failed") {
        console.log("[SubscriptionManager] isSubscriptionActive - Status is cancelled/failed, returning false")
        return false
      }

      // statusが"active"でない場合は無効（pendingやexpiredも含む）
      if (this.currentSubscription.status !== "active") {
        console.log("[SubscriptionManager] isSubscriptionActive - Status is not active:", this.currentSubscription.status, "returning false")
        return false
      }

      // expiresAtがない場合は無効（無料プラン以外で有効なサブスクリプションにはexpiresAtが必要）
      if (!this.currentSubscription.expiresAt) {
        console.log("[SubscriptionManager] isSubscriptionActive - No expiresAt, returning false")
        return false
      }

      // 有効期限をチェック
      const now = new Date()
      const expiresAt = new Date(this.currentSubscription.expiresAt)
      const isNotExpired = now < expiresAt
      
      console.log("[SubscriptionManager] isSubscriptionActive - Check:", {
        plan: this.currentSubscription.plan,
        status: this.currentSubscription.status,
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        isNotExpired,
      })

      return isNotExpired
    } catch (error) {
      console.error("[SubscriptionManager] isSubscriptionActive - Error:", error)
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

  // Google Play Billingでのサブスクリプション開始
  async startGooglePlayBillingSubscription(
    planId: PlanType,
    purchaseToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      if (!plan) {
        return { success: false, error: "Invalid plan" }
      }

      const productKey = planId === "premium" ? "premium" : planId === "basic" ? "basic" : null
      if (!productKey) {
        return { success: false, error: "Invalid Google Play subscription plan" }
      }

      // ログインチェック
      const identity = this.getIdentityMetadata()
      if (!identity.customerEmail && !identity.userId) {
        console.error("[Google Play Billing] No customerEmail or userId found. User must be logged in.")
        return { 
          success: false, 
          error: "ログインが必要です。購入するにはログインしてください。" 
        }
      }

      const payload: Record<string, any> = {
        planId,
        purchaseToken,
        productId: getGooglePlayProductId(productKey),
      }

      if (identity.customerEmail) {
        payload.customerEmail = identity.customerEmail.toLowerCase()
      }

      if (identity.userId) {
        payload.userId = identity.userId
      }

      console.log("[Google Play Billing] Starting subscription with identity:", {
        hasEmail: !!identity.customerEmail,
        hasUserId: !!identity.userId,
        planId,
      })

      // 購入レシートを検証
      const verifyResponse = await fetch("/api/verify-google-play-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      let verifyResult: any
      try {
        const responseText = await verifyResponse.text()
        try {
          verifyResult = JSON.parse(responseText)
        } catch (parseError) {
          console.error("[Google Play Billing] Failed to parse response:", {
            status: verifyResponse.status,
            statusText: verifyResponse.statusText,
            responseText: responseText.substring(0, 500),
          })
          return { 
            success: false, 
            error: `Purchase verification failed: Invalid response (${verifyResponse.status})`,
            details: { responseText: responseText.substring(0, 500) },
          }
        }
      } catch (error) {
        console.error("[Google Play Billing] Failed to read response:", error)
        return { 
          success: false, 
          error: "Purchase verification failed: Network error",
          details: { error: error instanceof Error ? error.message : String(error) },
        }
      }

      if (!verifyResponse.ok) {
        console.error("[Google Play Billing] Verification API error:", {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          error: verifyResult.error,
          details: verifyResult.details,
          fullResponse: verifyResult,
        })
        
        // ログインが必要な場合のエラーメッセージ
        if (verifyResult.requiresLogin) {
          return { 
            success: false, 
            error: "ログインが必要です。購入するにはログインしてください。",
            requiresLogin: true,
          }
        }
        
        return { 
          success: false, 
          error: verifyResult.error || `購入の検証に失敗しました (${verifyResponse.status})`,
          details: verifyResult.details,
        }
      }

      if (!verifyResult.success || !verifyResult.verified) {
        console.error("[Google Play Billing] Verification failed:", {
          success: verifyResult.success,
          verified: verifyResult.verified,
          error: verifyResult.error,
          details: verifyResult.details,
        })
        
        // ログインが必要な場合のエラーメッセージ
        if (verifyResult.requiresLogin) {
          return { 
            success: false, 
            error: "ログインが必要です。購入するにはログインしてください。",
            requiresLogin: true,
          }
        }
        
        return { 
          success: false, 
          error: verifyResult.error || "購入の検証に失敗しました",
          details: verifyResult.details,
        }
      }

      // 検証成功：プランを有効化
      const purchaseData = verifyResult.purchaseData || {}
      const expiryTimeMillis = purchaseData.expiryTimeMillis || 0
      const expiresAt = expiryTimeMillis > 0 ? new Date(expiryTimeMillis) : null

      // 有効期限が設定されていない場合は、1ヶ月後に設定
      const finalExpiresAt = expiresAt || (() => {
        const date = new Date()
        date.setMonth(date.getMonth() + 1)
        return date
      })()

      const statusFromServer = verifyResult.subscription?.status
      const expiresAtFromServer = verifyResult.subscription?.expiresAt

      this.currentSubscription = {
        plan: planId,
        expiresAt: finalExpiresAt,
        isActive: true,
        trialEndsAt: null,
        status:
          statusFromServer ||
          (purchaseData.isActive === false
            ? "pending"
            : expiryTimeMillis > 0 && finalExpiresAt <= new Date()
              ? "expired"
              : "active"),
        paymentMethod: "google_play",
        amount: plan.price,
        nextBillingDate: expiresAtFromServer ? new Date(expiresAtFromServer) : finalExpiresAt,
        lastPaymentDate: new Date(),
      }

      this.saveSubscription()
      this.notifyListeners()

      // Supabaseから最新の状態を同期（サーバー側で保存されたデータを取得）
      await this.syncSubscriptionFromServer()

      return { success: true }
    } catch (error) {
      console.error("Error starting Google Play Billing subscription:", error)
      return { success: false, error: "Failed to start subscription" }
    }
  }

  async syncSubscriptionFromServer(): Promise<void> {
    try {
      // TWA環境の検出（関数の最初で1回だけ宣言）
      const isTWA = typeof navigator !== "undefined" && 
        (navigator.userAgent?.includes("twa") || 
         navigator.userAgent?.includes("androidbrowserhelper") ||
         (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))
      
      const identity = this.getIdentityMetadata()
      console.log("[SubscriptionManager] syncSubscriptionFromServer - identity:", identity)
      
      if (!identity.userId && !identity.customerEmail) {
        // ログイン情報がない場合はエラーを投げずにfreeプランにリセットして早期リターン
        this.currentSubscription = {
          plan: "free",
          expiresAt: null,
          isActive: false,
          trialEndsAt: null,
          status: "inactive",
        }
        this.saveSubscription()
        this.notifyListeners()
        console.warn("[SubscriptionManager] syncSubscriptionFromServer - No userId or customerEmail found. Resetting to free plan.")
        return
      }

      const payload = {
        ...identity,
        ...(identity.customerEmail ? { customerEmail: identity.customerEmail.toLowerCase() } : {}),
      }
      
      console.log("[SubscriptionManager] syncSubscriptionFromServer - payload:", payload)

      const response = await fetch("/api/subscriptions/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails: any = null
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
          errorDetails = errorJson.details || errorJson
        } catch {
          // JSONパースに失敗した場合は、テキストをそのまま使用
          if (errorText && errorText !== "Unknown error") {
            errorMessage = errorText
          }
        }
        
        console.error("[SubscriptionManager] Failed to sync subscription from server:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails,
          fullResponse: errorText,
        })
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[SubscriptionManager] syncSubscriptionFromServer - result:", result)
      
      if (!result.success) {
        const errorMessage = result.error || "サブスクリプション情報の取得に失敗しました"
        console.error("[SubscriptionManager] syncSubscriptionFromServer - API returned success: false", errorMessage)
        throw new Error(errorMessage)
      }
      
      if (!result.subscription) {
        console.log("[SubscriptionManager] syncSubscriptionFromServer - No subscription found in result (user may not have active subscription)")
        // サブスクリプションがない場合は、freeプランにリセット
        this.currentSubscription = {
          plan: "free",
          expiresAt: null,
          isActive: false,
          trialEndsAt: null,
          status: "cancelled",
        }
        this.saveSubscription()
        this.notifyListeners()
        return
      }

      const serverSubscription = result.subscription
      console.log("[SubscriptionManager] syncSubscriptionFromServer - serverSubscription:", serverSubscription)

      const expiresAt = serverSubscription.expiresAt ? new Date(serverSubscription.expiresAt) : null
      const trialEndsAt = serverSubscription.trialEndsAt ? new Date(serverSubscription.trialEndsAt) : null
      const nextBillingDate = serverSubscription.nextBillingDate
        ? new Date(serverSubscription.nextBillingDate)
        : expiresAt
      const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === serverSubscription.plan)
      const amount = planDetails?.price ?? this.currentSubscription.amount ?? 0

      // isActiveの計算を改善
      const now = Date.now()
      const expiresAtTime = expiresAt ? expiresAt.getTime() : null
      const isExpired = expiresAtTime ? expiresAtTime <= now : false
      
      // statusが"active"で、かつ有効期限が切れていない場合は有効
      // ただし、statusが"active"で有効期限がない場合も有効とする（Google Play Billingの場合など）
      const isActive = serverSubscription.status === "active" && (!expiresAtTime || !isExpired)

      console.log("[SubscriptionManager] syncSubscriptionFromServer - isActive calculation:", {
        status: serverSubscription.status,
        expiresAt: expiresAt?.toISOString(),
        expiresAtTime,
        now: new Date().toISOString(),
        nowTime: now,
        isExpired,
        isActive,
        hasExpiresAt: !!expiresAtTime,
      })
      
      // TWA環境でのデバッグ情報
      if (isTWA) {
        console.log("[TWA] Subscription sync details:", {
          plan: serverSubscription.plan,
          status: serverSubscription.status,
          isActive,
          expiresAt: expiresAt?.toISOString(),
          customerEmail: serverSubscription.customerEmail,
          userId: serverSubscription.userId,
        })
      }

      this.currentSubscription = {
        plan: serverSubscription.plan as PlanType,
        expiresAt,
        isActive,
        trialEndsAt, // トライアル終了日を設定
        status: serverSubscription.status,
        paymentMethod: serverSubscription.paymentMethod ?? "google_play",
        amount,
        nextBillingDate: nextBillingDate ?? undefined,
        lastPaymentDate: this.currentSubscription.lastPaymentDate,
      }

      console.log("[SubscriptionManager] syncSubscriptionFromServer - Updated currentSubscription:", {
        plan: this.currentSubscription.plan,
        isActive: this.currentSubscription.isActive,
        status: this.currentSubscription.status,
        expiresAt: this.currentSubscription.expiresAt?.toISOString(),
        fullSubscription: this.currentSubscription,
      })

      this.saveSubscription()
      
      // localStorageへの保存を確認
      const saved = typeof window !== "undefined" ? localStorage.getItem("userSubscription") : null
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log("[SubscriptionManager] syncSubscriptionFromServer - Saved to localStorage:", {
          plan: parsed.plan,
          isActive: parsed.isActive,
          status: parsed.status,
        })
      } else {
        console.warn("[SubscriptionManager] syncSubscriptionFromServer - ⚠️ Failed to save to localStorage")
      }
      
      this.notifyListeners() // UIを更新
      
      console.log("[SubscriptionManager] syncSubscriptionFromServer - ✅ Sync completed successfully")
      
      // TWA環境での追加確認
      if (isTWA) {
        console.log("[TWA] ✅ Subscription sync completed:", {
          plan: this.currentSubscription.plan,
          isActive: this.currentSubscription.isActive,
          status: this.currentSubscription.status,
        })
      }
    } catch (error) {
      console.error("[SubscriptionManager] syncSubscriptionFromServer - ❌ Error:", error)
      if (error instanceof Error) {
        console.error("[SubscriptionManager] syncSubscriptionFromServer - Error message:", error.message)
        console.error("[SubscriptionManager] syncSubscriptionFromServer - Error stack:", error.stack)
      }
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
  const startGooglePlayBillingSubscription = useCallback(
    (planId: PlanType, purchaseToken: string) => manager.startGooglePlayBillingSubscription(planId, purchaseToken),
    [manager]
  )
  const cancelSubscription = useCallback(() => manager.cancelSubscription(), [manager])
  const syncSubscriptionFromServer = useCallback(() => manager.syncSubscriptionFromServer(), [manager])
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
    startGooglePlayBillingSubscription,
    cancelSubscription,
    syncSubscriptionFromServer,
    getSubscriptionInfo,
    getNextBillingDate,
    getCurrentAmount,
    debugSwitchPlan,
    debugStartTrial,
  }
}
