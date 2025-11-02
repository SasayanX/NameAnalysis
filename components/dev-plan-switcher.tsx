"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { RefreshCw, Crown, Zap, Star } from "lucide-react"

export function DevPlanSwitcher() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">("free")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const manager = SubscriptionManager.getInstance()
      const info = manager.getSubscriptionInfo()
      setCurrentPlan(info.plan || "free")
    }
  }, [])

  const handleSwitchPlan = (planId: "free" | "basic" | "premium") => {
    if (process.env.NODE_ENV !== "development") {
      alert("この機能は開発環境でのみ利用できます")
      return
    }

    setIsLoading(true)
    try {
      const manager = SubscriptionManager.getInstance()
      manager.debugSwitchPlan(planId)
      
      // プラン情報を再取得
      const info = manager.getSubscriptionInfo()
      setCurrentPlan(info.plan || "free")
      
      // ページをリロードして状態を更新
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("プラン切り替えエラー:", error)
      alert("プラン切り替えに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "premium":
        return <Crown className="h-4 w-4" />
      case "basic":
        return <Zap className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-purple-600 hover:bg-purple-700"
      case "basic":
        return "bg-blue-600 hover:bg-blue-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <Card className="mb-4 border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <RefreshCw className="h-5 w-5" />
          開発用：プラン切り替え
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-orange-700">現在のプラン:</span>
          <Badge className={`${getPlanColor(currentPlan)} text-white flex items-center gap-1`}>
            {getPlanIcon(currentPlan)}
            {currentPlan === "free"
              ? "無料プラン"
              : currentPlan === "basic"
                ? "ベーシックプラン"
                : "プレミアムプラン"}
          </Badge>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={currentPlan === "free" ? "default" : "outline"}
            onClick={() => handleSwitchPlan("free")}
            disabled={isLoading}
            className="flex-1"
          >
            <Star className="h-3 w-3 mr-1" />
            無料
          </Button>
          <Button
            size="sm"
            variant={currentPlan === "basic" ? "default" : "outline"}
            onClick={() => handleSwitchPlan("basic")}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Zap className="h-3 w-3 mr-1" />
            ベーシック
          </Button>
          <Button
            size="sm"
            variant={currentPlan === "premium" ? "default" : "outline"}
            onClick={() => handleSwitchPlan("premium")}
            disabled={isLoading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Crown className="h-3 w-3 mr-1" />
            プレミアム
          </Button>
        </div>
        <p className="text-xs text-orange-600 mt-2">
          ※ 開発環境でのみ表示されます。プラン切り替え後、ページが自動的にリロードされます。
        </p>
      </CardContent>
    </Card>
  )
}









