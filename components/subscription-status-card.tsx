"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, CreditCard, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"
import { SubscriptionManager, SUBSCRIPTION_PLANS } from "@/lib/subscription-manager"
import { useToast } from "@/hooks/use-toast"
import { UsageTracker } from "@/lib/usage-tracker"
import { GooglePlayBillingDetector } from "@/lib/google-play-billing-detector"
import { getGooglePlayProductId } from "@/lib/google-play-product-ids"

interface SubscriptionStatus {
  plan: "free" | "basic" | "premium"
  status: "active" | "inactive" | "pending"
  usageToday: number
  usageLimit: number
  nextBillingDate?: string
  amount?: number
}

export function SubscriptionStatusCard() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    plan: "free",
    status: "inactive",
    usageToday: 0,
    usageLimit: 1,
  })
  const [isGooglePlayAvailable, setIsGooglePlayAvailable] = useState(false)
  const [isTWAContext, setIsTWAContext] = useState(false)
  const [processingPlan, setProcessingPlan] = useState<"basic" | "premium" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // 実際のサブスクリプション情報を取得
    const manager = SubscriptionManager.getInstance()
    const subscription = manager.getSubscriptionInfo()
    
    // サブスクリプションが有効かどうかを確認
    const isActive = manager.isSubscriptionActive()
    
    // 解約済みまたは無効な場合は、無料プランとして表示
    const effectivePlan = (isActive && subscription.status !== "cancelled") ? subscription.plan : "free"
    
    // プラン情報を取得
    const planInfo = SUBSCRIPTION_PLANS.find((p) => p.id === effectivePlan) || SUBSCRIPTION_PLANS[0]
    
    // 使用状況を取得
    const usageTracker = UsageTracker.getInstance()
    const usageStatus = usageTracker.getUsageStatus()
    
    const newStatus: SubscriptionStatus = {
      plan: effectivePlan,
      status: isActive ? "active" : "inactive",
      usageToday: usageStatus.todayUsage.personalAnalysis || 0,
      usageLimit: planInfo.limits.personalAnalysis === -1 ? -1 : planInfo.limits.personalAnalysis,
      nextBillingDate: (isActive && subscription.status !== "cancelled") ? (subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toISOString().split('T')[0] : undefined) : undefined,
      amount: (isActive && subscription.status !== "cancelled") ? (subscription.amount || planInfo.price) : 0,
    }
    setStatus(newStatus)

    const checkPlatform = async () => {
      try {
        const isTWA = GooglePlayBillingDetector.isTWAEnvironment()
        setIsTWAContext(isTWA)

        if (isTWA) {
          const available = await GooglePlayBillingDetector.initialize()
          setIsGooglePlayAvailable(available)
        } else {
          setIsGooglePlayAvailable(false)
        }
      } catch (error) {
        console.warn("[SubscriptionStatusCard] Failed to initialize Google Play Billing:", error)
        setIsGooglePlayAvailable(false)
      }
    }

    checkPlatform()
  }, [])

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "ベーシックプラン"
      case "premium":
        return "プレミアムプラン"
      default:
        return "無料プラン"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-500"
      case "premium":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">有効</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">処理中</Badge>
      default:
        return <Badge variant="secondary">無効</Badge>
    }
  }

  const usagePercentage = (status.usageToday / status.usageLimit) * 100

  const handleGooglePlayUpgrade = async (planId: "basic" | "premium") => {
    try {
      setProcessingPlan(planId)

      if (!GooglePlayBillingDetector.isTWAEnvironment()) {
        toast({
          title: "Google Play アプリ内で実行してください",
          description: "Google Play 決済はアプリ内ブラウザでのみご利用いただけます。",
          variant: "destructive",
        })
        return
      }

      const initialized = await GooglePlayBillingDetector.initialize()
      if (!initialized) {
        toast({
          title: "初期化に失敗しました",
          description: "Google Play Billing の初期化に失敗しました。時間をおいて再度お試しください。",
          variant: "destructive",
        })
        return
      }

      const productId = getGooglePlayProductId(planId)
      const purchase = await GooglePlayBillingDetector.purchase(productId)

      const manager = SubscriptionManager.getInstance()
      const result = await manager.startGooglePlayBillingSubscription(planId, purchase.purchaseToken)
      if (!result.success) {
        toast({
          title: "プラン変更に失敗しました",
          description: result.error ?? "原因不明のエラーが発生しました。",
          variant: "destructive",
        })
      } else {
        toast({
          title: "プランが有効化されました",
          description: `${planId === "basic" ? "ベーシック" : "プレミアム"}プランが有効になりました。`,
        })
      }
    } catch (error: any) {
      console.error("[SubscriptionStatusCard] Google Play upgrade error:", error)
      const message = error?.message?.includes("User cancelled")
        ? "購入がキャンセルされました。"
        : `購入に失敗しました: ${error?.message ?? "原因不明のエラー"}`
      toast({
        title: "決済エラー",
        description: message,
        variant: "destructive",
      })
    } finally {
      setProcessingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPlanColor(status.plan)}`} />
              {getPlanName(status.plan)}
            </span>
            {getStatusBadge(status.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.status === "active" && status.nextBillingDate && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">プラン有効中</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>次回更新日: {new Date(status.nextBillingDate).toLocaleDateString("ja-JP")}</div>
                <div>月額: ¥{status.amount?.toLocaleString()}</div>
              </div>
            </div>
          )}

          {status.status === "pending" && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">決済処理中</span>
              </div>
              <p className="text-sm text-yellow-700">
                決済処理が完了次第、プランが自動的に有効化されます。通常1-2分で完了します。
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">今日の利用状況</span>
              <span className="text-sm text-gray-600">
                {status.usageToday} / {status.usageLimit === -1 ? "無制限" : status.usageLimit}
              </span>
            </div>
            {status.usageLimit !== -1 && <Progress value={usagePercentage} className="h-2" />}
            {status.usageLimit !== -1 && usagePercentage >= 80 && (
              <p className="text-sm text-orange-600 mt-1">利用制限に近づいています</p>
            )}
          </div>

          {status.plan === "free" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">プランをアップグレード</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">より多くの機能と利用回数でお楽しみいただけます</p>
              {(isGooglePlayAvailable || isTWAContext) ? (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleGooglePlayUpgrade("premium")}
                  disabled={processingPlan === "premium"}
                >
                  {processingPlan === "premium" ? "処理中..." : "Google Play でアップグレード"}
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full">
                  <Link href="/subscribe">プランを選択</Link>
                </Button>
              )}
            </div>
          )}

          {status.status === "active" && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/pricing">
                    <CreditCard className="h-4 w-4 mr-2" />
                    支払い方法
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (!confirm("本当に解約しますか？解約後は無料プランに戻ります。")) {
                      return
                    }
                    
                    try {
                      // Squareダッシュボードで解約する必要があることを通知
                      toast({
                        title: "解約について",
                        description: "解約はSquareダッシュボードから行う必要があります。詳細はマイページをご確認ください。",
                        variant: "default",
                      })
                      
                      // ローカルでは無料プランに戻す
                      const manager = SubscriptionManager.getInstance()
                      const now = new Date()
                      const freeSubscription = {
                        plan: "free" as const,
                        expiresAt: now.toISOString(), // 過去の日付に設定（即座に無効化）
                        isActive: false,
                        trialEndsAt: null,
                        status: "cancelled" as const,
                        cancelledAt: now.toISOString(),
                      }
                      
                      localStorage.setItem("userSubscription", JSON.stringify(freeSubscription))
                      
                      toast({
                        title: "プランを無料に戻しました",
                        description: "Squareダッシュボードで解約手続きも完了してください。",
                      })
                      
                      setTimeout(() => {
                        window.location.reload()
                      }, 1000)
                    } catch (error) {
                      console.error("解約エラー:", error)
                      toast({
                        title: "エラー",
                        description: "解約処理に失敗しました",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  解約
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">利用履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-01-15", count: 8, type: "姓名判断" },
              { date: "2024-01-14", count: 5, type: "相性診断" },
              { date: "2024-01-13", count: 12, type: "姓名判断" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{item.date}</div>
                  <div className="text-sm text-gray-600">{item.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.count}回</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
