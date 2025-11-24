"use client"

import { useState, useEffect, useCallback } from "react"
import { SubscriptionManager } from "@/lib/subscription-manager"

export interface UseSubscriptionSyncOptions {
  usageTracker: any
  onUsageStatusUpdate: (usageStatus: any) => void
  onPlanUpdate: (plan: "free" | "basic" | "premium") => void
  onTrialUpdate: (isInTrial: boolean, trialDaysRemaining: number) => void
}

export interface SubscriptionSyncState {
  isSynced: boolean
  isSyncing: boolean
  error: string | null
}

export function useSubscriptionSync(options: UseSubscriptionSyncOptions) {
  const { usageTracker, onUsageStatusUpdate, onPlanUpdate, onTrialUpdate } = options

  const [state, setState] = useState<SubscriptionSyncState>({
    isSynced: false,
    isSyncing: false,
    error: null,
  })

  // サブスクリプション同期関数
  const syncSubscription = useCallback(async () => {
    if (typeof window === "undefined") return

    setState((prev) => ({ ...prev, isSyncing: true, error: null }))

    try {
      // TWA環境の検出
      const isTWA =
        typeof navigator !== "undefined" &&
        (navigator.userAgent?.includes("twa") ||
          navigator.userAgent?.includes("androidbrowserhelper") ||
          (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))

      if (isTWA) {
        console.log("[TWA] 🔄 サブスクリプション同期を開始します...")
        console.log("[TWA] localStorage確認:", {
          customerEmail: localStorage.getItem("customerEmail"),
          userId: localStorage.getItem("userId"),
        })
      }

      const subscriptionManager = SubscriptionManager.getInstance()

      // 同期前に少し待機（localStorageの保存が完了するのを待つ）
      // TWA環境ではより長く待機（認証情報の保存が完了するのを待つ）
      const waitTime = isTWA ? 800 : 300
      await new Promise((resolve) => setTimeout(resolve, waitTime))

      // 認証情報を再確認（localStorageから直接取得）
      const customerEmail = localStorage.getItem("customerEmail")
      const userId = localStorage.getItem("userId")
      if (isTWA) {
        console.log("[TWA] 同期前の認証情報確認:", {
          customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : null,
          userId: userId ? `${userId.substring(0, 8)}***` : null,
        })
      }

      if (!userId && !customerEmail) {
        console.warn("[TWA] ⚠️ 認証情報が見つかりません。ログインが必要です。")
        // 認証情報がない場合は、freeプランのままなので同期完了として扱う
        setState((prev) => ({ ...prev, isSynced: true, isSyncing: false }))
        return
      }

      await subscriptionManager.syncSubscriptionFromServer()

      // 同期後の状態を確認
      const currentPlan = subscriptionManager.getCurrentPlan()
      const isActive = subscriptionManager.isSubscriptionActive()

      console.log("✅ ページ読み込み時: サブスクリプション状態を同期しました", {
        plan: currentPlan.id,
        isActive,
      })

      // usageStatusを再取得して更新（プラン変更を反映）
      const updatedUsageStatus = usageTracker.getUsageStatus()
      onUsageStatusUpdate(updatedUsageStatus)
      onPlanUpdate(updatedUsageStatus.plan as "free" | "basic" | "premium")
      onTrialUpdate(updatedUsageStatus.isInTrial || false, updatedUsageStatus.trialDaysRemaining || 0)

      setState((prev) => ({ ...prev, isSynced: true, isSyncing: false }))

      console.log("✅ usageStatusを更新しました:", {
        plan: updatedUsageStatus.plan,
        isInTrial: updatedUsageStatus.isInTrial,
      })

      if (isTWA) {
        console.log("[TWA] ✅ 同期完了:", {
          plan: currentPlan.id,
          isActive,
          subscription: subscriptionManager.getSubscriptionInfo(),
          updatedPlan: updatedUsageStatus.plan,
        })

        // プランが有効になっていない場合の警告
        if (!isActive && currentPlan.id !== "free") {
          console.warn("[TWA] ⚠️ プランが有効になっていません:", {
            plan: currentPlan.id,
            isActive,
            subscription: subscriptionManager.getSubscriptionInfo(),
          })
        }
      }
    } catch (error) {
      console.error("❌ ページ読み込み時: サブスクリプション状態の同期エラー:", error)
      // エラーが発生した場合でも、同期試行は完了したものとして扱う
      setState((prev) => ({
        ...prev,
        isSynced: true,
        isSyncing: false,
        error: error instanceof Error ? error.message : "同期エラーが発生しました",
      }))

      // TWA環境でのエラー詳細
      const isTWA =
        typeof navigator !== "undefined" &&
        (navigator.userAgent?.includes("twa") ||
          navigator.userAgent?.includes("androidbrowserhelper") ||
          (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches))

      if (isTWA && error instanceof Error) {
        console.error("[TWA] ❌ 同期エラー詳細:", {
          message: error.message,
          stack: error.stack,
          localStorage: {
            customerEmail: localStorage.getItem("customerEmail"),
            userId: localStorage.getItem("userId"),
          },
        })
      }
    }
  }, [usageTracker, onUsageStatusUpdate, onPlanUpdate, onTrialUpdate])

  // ページ読み込み時にサブスクリプション状態を同期（最初のマウント時のみ）
  useEffect(() => {
    syncSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    ...state,
    syncSubscription,
  }
}

