"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap } from "lucide-react"
import { SubscriptionManager, SUBSCRIPTION_PLANS } from "@/lib/subscription-manager"

interface PlanSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  onPlanSelect?: (planId: "free" | "basic" | "premium") => void
}

export function PlanSelectorModal({ isOpen, onClose, currentPlan = "free", onPlanSelect }: PlanSelectorModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [subscriptionManager] = React.useState(() => SubscriptionManager.getInstance())

  const handlePlanSelect = async (planId: "free" | "basic" | "premium") => {
    if (planId === currentPlan) {
      onClose()
      return
    }

    setIsLoading(true)

    try {
      if (process.env.NODE_ENV === "development") {
        // 開発環境：即座にプラン変更
        subscriptionManager.debugSwitchPlan(planId)
        onPlanSelect?.(planId)
        onClose()
      } else {
        // 本番環境：決済処理
        if (planId === "free") {
          // ダウングレード処理
          await subscriptionManager.cancelSubscription()
          onPlanSelect?.(planId)
          onClose()
        } else {
          // アップグレード処理（Square決済）
          const result = await subscriptionManager.startSquareSubscription(planId)
          if (result.success) {
            onPlanSelect?.(planId)
            onClose()
          } else {
            alert(`プラン変更に失敗しました: ${result.error}`)
          }
        }
      }
    } catch (error) {
      console.error("Plan selection error:", error)
      alert("プラン変更中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="h-6 w-6 text-gray-500" />
      case "basic":
        return <Zap className="h-6 w-6 text-blue-500" />
      case "premium":
        return <Crown className="h-6 w-6 text-purple-500" />
      default:
        return <Star className="h-6 w-6 text-gray-500" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "border-gray-200 bg-gray-50"
      case "basic":
        return "border-blue-200 bg-blue-50"
      case "premium":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">プラン選択</DialogTitle>
          <DialogDescription className="text-center">
            あなたに最適なプランを選択してください
            {process.env.NODE_ENV === "development" && (
              <Badge variant="secondary" className="ml-2">
                開発モード
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${getPlanColor(plan.id)} ${
                currentPlan === plan.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {plan.id === "premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">おすすめ</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">{getPlanIcon(plan.id)}</div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ¥{plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/月</span>
                </div>
                {currentPlan === plan.id && (
                  <Badge variant="secondary" className="mt-2">
                    現在のプラン
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isLoading || currentPlan === plan.id}
                  className={`w-full ${
                    plan.id === "premium"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : plan.id === "basic"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 hover:bg-gray-700"
                  }`}
                  variant={currentPlan === plan.id ? "outline" : "default"}
                >
                  {isLoading
                    ? "処理中..."
                    : currentPlan === plan.id
                      ? "選択中"
                      : plan.id === "free"
                        ? "無料で始める"
                        : `${plan.name}を選択`}
                </Button>

                {plan.id !== "free" && process.env.NODE_ENV !== "development" && (
                  <p className="text-xs text-muted-foreground text-center">
                    7日間無料トライアル付き
                    <br />
                    いつでもキャンセル可能
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            プランはいつでも変更・キャンセルできます。
            {process.env.NODE_ENV === "development" && (
              <span className="block mt-1 text-blue-600">開発モードでは即座にプランが切り替わります</span>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
