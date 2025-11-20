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
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // ページ読み込み時に、URLパラメータから決済情報を確認
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const planId = params.get("plan") as "basic" | "premium" | null
    const amount = params.get("amount")
    const paymentId = params.get("payment_id")
    const email = params.get("email")

    // メールアドレスがURLパラメータにある場合、自動的に決済情報を確認
    if (email) {
      setTimeout(async () => {
        try {
          const response = await fetch(`/api/square-payments/auto-activate?email=${encodeURIComponent(email)}`)
          const result = await response.json()

          if (result.success && result.subscription) {
            // プランを自動的に有効化
            localStorage.setItem("userSubscription", JSON.stringify(result.subscription))
            
            toast({
              title: "プランが有効化されました",
              description: `${result.subscription.plan === "basic" ? "ベーシック" : "プレミアム"}プランが有効になりました`,
            })

            // URLパラメータを削除
            params.delete("email")
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
            window.history.replaceState({}, "", newUrl)

            // ページをリロード
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          }
        } catch (error) {
          console.error("自動決済確認エラー:", error)
        }
      }, 1000)
    }

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
      toast({
        title: "確認中",
        description: "決済状況を確認しています...",
      })

      // ユーザーのメールアドレスを取得（優先順位: URLパラメータ > customerEmail > userSession）
      let customerEmail: string | null = null
      
      if (typeof window !== "undefined") {
        // 1. URLパラメータから取得（最優先）
        const params = new URLSearchParams(window.location.search)
        customerEmail = params.get("email")
        
        // 2. localStorageのcustomerEmailから取得（決済時に保存したメールアドレス）
        if (!customerEmail) {
          customerEmail = localStorage.getItem("customerEmail")
        }
        
        // 3. userSessionから取得
        if (!customerEmail) {
          try {
            const sessionData = localStorage.getItem("userSession")
            if (sessionData) {
              const session = JSON.parse(sessionData)
              customerEmail = session.email || null
            }
          } catch (e) {
            // パースエラーは無視
          }
        }
      }

      if (!customerEmail) {
        toast({
          title: "情報不足",
          description: "決済確認にはメールアドレスが必要です。URLパラメータに?email=your@email.comを追加してください。",
          variant: "destructive",
        })
        setIsCheckingPayment(false)
        return
      }

      // APIから決済情報を取得
      const response = await fetch(`/api/square-payments/check?email=${encodeURIComponent(customerEmail)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({
          title: "エラー",
          description: errorData.error || `決済履歴の確認に失敗しました（${response.status}）`,
          variant: "destructive",
        })
        setIsCheckingPayment(false)
        return
      }

      const result = await response.json()

      if (!result.success || !result.payment) {
        toast({
          title: "決済情報が見つかりません",
          description: result.message || "最近の決済情報が見つかりませんでした。決済が完了していないか、Webhookが受信されていない可能性があります。",
          variant: "destructive",
        })
        setIsCheckingPayment(false)
        return
      }

      const payment = result.payment

      // プランを有効化
      const manager = SubscriptionManager.getInstance()
      const plans = {
        basic: { price: 330 },
        premium: { price: 550 },
      }
      const planPrice = plans[payment.plan as "basic" | "premium"]?.price || payment.amount

      // 有効期限を計算（次回請求日まで有効）
      // expires_atが設定されている場合はそれを使用、なければ次回請求日（12月1日）を設定
      let expiresAt: Date
      if (payment.expires_at) {
        expiresAt = new Date(payment.expires_at)
      } else {
        // 次回請求日（2025年12月1日）を設定
        expiresAt = new Date("2025-12-01")
        // または、現在の日付から1ヶ月後（決済完了から1ヶ月間有効）
        if (expiresAt < new Date()) {
          expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)
        }
      }
      
      // 次回請求日も同様に設定
      const nextBillingDate = expiresAt

      const subscription = {
        plan: payment.plan,
        expiresAt,
        isActive: true,
        trialEndsAt: null,
        status: "active" as const,
        paymentMethod: "square" as const,
        amount: planPrice,
        nextBillingDate: nextBillingDate,
        lastPaymentDate: new Date(payment.webhook_received_at || Date.now()),
        squarePaymentId: payment.payment_id,
      }

      // localStorageに保存
      if (typeof window !== "undefined") {
        localStorage.setItem("userSubscription", JSON.stringify({
          ...subscription,
          expiresAt: subscription.expiresAt.toISOString(),
          nextBillingDate: subscription.nextBillingDate.toISOString(),
          lastPaymentDate: subscription.lastPaymentDate.toISOString(),
        }))
      }

      // 有効化時刻を記録
      await fetch("/api/square-payments/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: payment.payment_id,
          activated_at: new Date().toISOString(),
        }),
      })

      toast({
        title: "プランが見つかりました",
        description: `${payment.plan === "basic" ? "ベーシック" : "プレミアム"}プランが有効化されました`,
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Payment check error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "エラー",
        description: `決済履歴の確認に失敗しました：${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handleResyncSubscription = async () => {
    setIsSyncing(true)
    try {
      toast({
        title: "同期中",
        description: "サブスクリプション情報を再同期しています...",
      })

      // 直接APIを呼び出してエラーの詳細を取得
      const customerEmail = localStorage.getItem("customerEmail")
      const userId = localStorage.getItem("userId")
      
      if (!customerEmail && !userId) {
        toast({
          title: "エラー",
          description: "ログインが必要です。サブスクリプション情報を同期するには、ログインしてください。",
          variant: "destructive",
        })
        setIsSyncing(false)
        return
      }

      const payload: any = {}
      if (customerEmail) payload.customerEmail = customerEmail.toLowerCase()
      if (userId) payload.userId = userId

      console.log("[MySubscription] Resync request:", payload)

      const response = await fetch("/api/subscriptions/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      console.log("[MySubscription] Resync response:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.error || errorMessage
          console.error("[MySubscription] Resync error details:", errorJson)
        } catch {
          errorMessage = responseText || errorMessage
        }
        
        toast({
          title: "同期エラー",
          description: `サブスクリプション情報の同期に失敗しました：${errorMessage}`,
          variant: "destructive",
        })
        setIsSyncing(false)
        return
      }

      const result = JSON.parse(responseText)
      console.log("[MySubscription] Resync success:", result)

      // SubscriptionManagerも同期
      const manager = SubscriptionManager.getInstance()
      await manager.syncSubscriptionFromServer()

      toast({
        title: "同期完了",
        description: "サブスクリプション情報を更新しました",
      })

      // ページをリロードして反映
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("[MySubscription] Subscription sync error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "同期エラー",
        description: `サブスクリプション情報の同期に失敗しました：${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
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

        {/* 再同期ボタン */}
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900 mb-1">購入状況を再確認する</h3>
                <p className="text-sm text-green-700">
                  Supabaseから最新のサブスクリプション情報を取得して同期します
                </p>
              </div>
              <Button
                onClick={handleResyncSubscription}
                disabled={isSyncing}
                variant="outline"
                className="border-green-300 bg-white hover:bg-green-100"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    同期中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    再同期
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
