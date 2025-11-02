"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles, X } from "lucide-react"
import { processLoginBonusSupa } from "@/lib/kanau-points-supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { SubscriptionManager } from "@/lib/subscription-manager"

interface LoginBonusData {
  basePoints: number
  consecutiveBonus: number
  totalPoints: number
  consecutiveDays: number
  specialReward?: {
    name: string
    type: string
  }
  message: string
}

export function LoginBonusNotification() {
  const { user } = useAuth()
  const [showNotification, setShowNotification] = useState(false)
  const [bonusData, setBonusData] = useState<LoginBonusData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const checkAndProcessLoginBonus = async () => {
      if (!user || isProcessing) return

      setIsProcessing(true)
      try {
        // 現在のプランを取得
        const manager = SubscriptionManager.getInstance()
        const currentPlan = manager.getCurrentPlan()
        const plan = currentPlan.id as "free" | "basic" | "premium"
        
        const result = await processLoginBonusSupa(user.id, plan)
        
        // 今日既に受け取っている場合は表示しない
        if (result.bonus.totalPoints === 0) {
          setIsProcessing(false)
          return
        }

        // ボーナスデータを設定して通知を表示
        setBonusData({
          basePoints: result.bonus.basePoints,
          consecutiveBonus: result.bonus.consecutiveBonus,
          totalPoints: result.bonus.totalPoints,
          consecutiveDays: result.bonus.consecutiveBonus + 1,
          message: result.bonus.message,
        })
        setShowNotification(true)

        // 10秒後に自動で閉じる
        setTimeout(() => {
          setShowNotification(false)
        }, 10000)
      } catch (error) {
        console.error("ログインボーナス処理エラー:", error)
      } finally {
        setIsProcessing(false)
      }
    }

    // ユーザーがログインしたら自動でチェック（初回のみ）
    if (user && !isProcessing) {
      const hasChecked = sessionStorage.getItem(`login_bonus_checked_${user.id}_${new Date().toISOString().split('T')[0]}`)
      if (!hasChecked) {
        checkAndProcessLoginBonus()
        sessionStorage.setItem(`login_bonus_checked_${user.id}_${new Date().toISOString().split('T')[0]}`, "true")
      }
    }
  }, [user])

  if (!showNotification || !bonusData) return null

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-md transition-all duration-500",
      showNotification ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
    )}>
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-5">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-pink-200/20 animate-pulse" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-yellow-600 animate-bounce" />
              <h3 className="font-bold text-lg text-yellow-800">ログインボーナス獲得！</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* エフェクト付きポイント表示 */}
          <div className="text-center mb-4 animate-in zoom-in duration-300">
            <div className="text-4xl font-bold text-yellow-600 mb-2 animate-pulse">
              +{bonusData.totalPoints}Kp
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
              <span>連続{bonusData.consecutiveDays}日目</span>
              <Badge variant="outline" className="bg-white/50 border-yellow-300">
                基礎{bonusData.basePoints}Kp × {bonusData.consecutiveDays}日
              </Badge>
            </div>
          </div>

          {/* メッセージ */}
          <p className="text-sm text-center text-yellow-800 mb-4">
            {bonusData.message}
          </p>

          {/* キラキラエフェクト */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-400 animate-ping"
                style={{
                  left: `${20 + (i * 8)}%`,
                  top: `${30 + (i * 5)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "2s",
                }}
                size={16}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

