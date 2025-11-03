"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionStatusCard } from "@/components/subscription-status-card"
import { CreditCard, Calendar, Download, RefreshCw } from "lucide-react"
import { SubscriptionManager } from "@/lib/subscription-manager"
import { useToast } from "@/hooks/use-toast"

export default function MySubscriptionPage() {
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // ページ読み込み時に、URLパラメータから決済情報を確認
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const planId = params.get("plan") as "basic" | "premium" | null
    const amount = params.get("amount")
    const paymentId = params.get("payment_id")

    if (planId && (planId === "basic" || planId === "premium")) {
      // 決済完了情報がURLにある場合、localStorageに保存
      try {
        const manager = SubscriptionManager.getInstance()
        const plans = {
          basic: { price: 330 },
          premium: { price: 550 },
        }
        const planPrice = plans[planId]?.price || (amount ? parseInt(amount) : 0)

        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const subscription = {
          plan: planId,
          expiresAt,
          isActive: true,
          trialEndsAt: null,
          status: "active" as const,
          paymentMethod: "square" as const,
          amount: planPrice,
          nextBillingDate: expiresAt,
          lastPaymentDate: new Date(),
          ...(paymentId && { squarePaymentId: paymentId }),
        }

        localStorage.setItem("userSubscription", JSON.stringify({
          ...subscription,
          expiresAt: subscription.expiresAt.toISOString(),
          nextBillingDate: subscription.nextBillingDate.toISOString(),
          lastPaymentDate: subscription.lastPaymentDate.toISOString(),
        }))

        // URLパラメータを削除
        const newUrl = window.location.pathname
        window.history.replaceState({}, "", newUrl)

        toast({
          title: "プランが有効化されました",
          description: `${planId === "basic" ? "ベーシック" : "プレミアム"}プランが有効になりました`,
        })

        // ページをリロードして反映
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error("Subscription activation error:", error)
      }
    }
  }, [toast])

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true)
    try {
      // Square APIから最近の決済を確認
      // TODO: 実際の実装では、Square APIを呼び出す
      
      toast({
        title: "確認中",
        description: "決済状況を確認しています...",
      })

      // 簡易実装：localStorageのsubscriptionsキーを確認
      if (typeof window !== "undefined") {
        const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
        if (subscriptions.length > 0) {
          const latest = subscriptions[subscriptions.length - 1]
          if (latest.status === "active") {
            const manager = SubscriptionManager.getInstance()
            manager.debugSwitchPlan(latest.plan)
            toast({
              title: "プランが見つかりました",
              description: "プラン情報を反映しました",
            })
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error("Payment check error:", error)
      toast({
        title: "エラー",
        description: "決済状況の確認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsCheckingPayment(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">マイページ</h1>
          <p className="text-gray-600">サブスクリプション状況と利用履歴を確認できます</p>
        </div>

        <SubscriptionStatusCard />

        {/* 決済確認ボタン */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 mb-1">決済完了後の確認</h3>
                <p className="text-sm text-blue-700">
                  Square Payment Linkで決済を完了した場合、ここでプラン情報を確認・反映できます
                </p>
              </div>
              <Button
                onClick={handleCheckPayment}
                disabled={isCheckingPayment}
                variant="outline"
                className="border-blue-300 bg-white hover:bg-blue-100"
              >
                {isCheckingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    確認中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    決済状況を確認
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 利用履歴 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              最近の利用履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">田中太郎の姓名判断</div>
                  <div className="text-sm text-gray-500">2024年1月15日 14:30</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">相性診断（田中太郎 × 佐藤花子）</div>
                  <div className="text-sm text-gray-500">2024年1月14日 16:45</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">運勢カレンダー表示</div>
                  <div className="text-sm text-gray-500">2024年1月13日 09:15</div>
                </div>
                <Badge variant="outline">完了</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              履歴をダウンロード
            </Button>
          </CardContent>
        </Card>

        {/* 決済履歴 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              決済履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">プレミアムプラン（月額）</div>
                  <div className="text-sm text-gray-500">2024年1月1日</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">¥550</div>
                  <Badge className="bg-green-100 text-green-800">完了</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">プレミアムプラン（月額）</div>
                  <div className="text-sm text-gray-500">2023年12月1日</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">¥550</div>
                  <Badge className="bg-green-100 text-green-800">完了</Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              領収書をダウンロード
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
