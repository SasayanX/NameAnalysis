"use client"

import { useState, useEffect } from "react"
import { Coins } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrCreatePointsSummary } from "@/lib/kanau-points-supabase"
import { KanauPointsManager } from "@/lib/kanau-points-system"
import { SubscriptionManager } from "@/lib/subscription-manager"
import Link from "next/link"

export function KanauPointsHeader() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">("free")

  // 現在のプランを取得（サブスクリプション変更も監視）
  useEffect(() => {
    if (authLoading) return

    const subscriptionManager = SubscriptionManager.getInstance()
    const updatePlan = () => {
      const plan = subscriptionManager.getCurrentPlan()
      setCurrentPlan(plan.id as "free" | "basic" | "premium")
    }
    
    // 初回取得
    updatePlan()

    // サブスクリプション変更イベントをリッスン
    const handleSubscriptionChange = () => {
      updatePlan()
    }

    // カスタムイベントをリッスン（SubscriptionManagerから発行される可能性がある）
    if (typeof window !== "undefined") {
      window.addEventListener("subscription-updated", handleSubscriptionChange)
      return () => {
        window.removeEventListener("subscription-updated", handleSubscriptionChange)
      }
    }
  }, [authUser, authLoading])

  // プランバッジの色を取得（「このアプリについて」の配色に統一）
  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "bg-gray-500 text-white"
      case "basic":
        return "bg-[#C4B5FD] text-[#4C1D95] dark:bg-[#6D28D9] dark:text-[#E9D5FF]"
      case "premium":
        return "bg-[#FCD34D] text-[#78350F] dark:bg-[#F59E0B] dark:text-[#FEF3C7]"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "free":
        return "無料"
      case "basic":
        return "Basic"
      case "premium":
        return "Premium"
      default:
        return "無料"
    }
  }

  useEffect(() => {
    // 認証状態の読み込み中は待機
    if (authLoading) {
      return
    }

    const loadPoints = async () => {
      try {
        if (authUser) {
          // ログイン済み：Supabaseから読み込み
          const summary = await getOrCreatePointsSummary(authUser.id)
          setPoints(summary.points)
        } else {
          // ゲストモード：ローカルストレージから読み込み
          const manager = KanauPointsManager.getInstance()
          manager.loadFromStorage()
          const guestId = "demo_user_001" // ゲストユーザーID
          let user = manager.getUser(guestId)
          if (!user) {
            user = manager.initializeUser(guestId)
            manager.saveToStorage()
          }
          setPoints(user.points)
        }
      } catch (error) {
        console.error("ポイント読み込みエラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPoints()

    // 定期的に更新（30秒ごと）- ログイン済みの場合のみ
    if (authUser) {
      const interval = setInterval(loadPoints, 30000)
      return () => clearInterval(interval)
    }
  }, [authUser, authLoading]) // authLoadingも依存配列に追加

  return (
    <div className="flex items-center gap-2">
      <Link href="/points" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Coins className="h-4 w-4 text-yellow-600" />
        {isLoading ? (
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
        ) : (
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700 font-semibold px-2 py-1"
          >
            {points !== null ? `${points.toLocaleString()}Kp` : "0Kp"}
          </Badge>
        )}
      </Link>
      {/* 現在のプランバッジ */}
      <Badge className={`text-xs ${getPlanBadgeColor(currentPlan)}`}>
        {getPlanName(currentPlan)}
      </Badge>
    </div>
  )
}

