"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Gift } from "lucide-react"
import Link from "next/link"
import { SubscriptionManager } from "@/lib/subscription-manager"

export default function SubscriptionSuccessPage() {
  const [subscriptionSaved, setSubscriptionSaved] = useState(false)

  useEffect(() => {
    // URLパラメータからプラン情報を取得
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const planId = params.get("plan") as "free" | "basic" | "premium" | null
    const amount = params.get("amount")
    const subscriptionId = params.get("subscriptionId")

    if (planId && planId !== "free") {
      try {
        const manager = SubscriptionManager.getInstance()
        
        // プラン情報を取得
        const plans = {
          basic: { price: 330 },
          premium: { price: 550 },
        }
        // amountは既に円単位で渡されている
        const planPrice = plans[planId as "basic" | "premium"]?.price || (amount ? parseInt(amount) : 0)

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
          ...(subscriptionId && { squareSubscriptionId: subscriptionId }),
        }

        // SubscriptionManager経由で保存（これによりuserSubscriptionキーに正しく保存される）
        manager.debugSwitchPlan(planId)
        // 手動で詳細情報を設定
        if (typeof window !== "undefined") {
          localStorage.setItem("userSubscription", JSON.stringify({
            ...subscription,
            expiresAt: subscription.expiresAt.toISOString(),
            nextBillingDate: subscription.nextBillingDate.toISOString(),
            lastPaymentDate: subscription.lastPaymentDate.toISOString(),
          }))
        }

        setSubscriptionSaved(true)
        console.log("サブスクリプションを保存しました:", subscription)
      } catch (error) {
        console.error("サブスクリプション保存エラー:", error)
      }
    } else {
      setSubscriptionSaved(true) // プラン情報がない場合はスキップ
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-800">申し込み完了！</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-green-700 mb-4">
                {subscriptionSaved
                  ? "プランの申し込みが正常に完了しました。プランが有効化されました！"
                  : "プランの申し込みが正常に完了しました。決済処理が完了次第、プランが自動的に有効化されます。"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                次のステップ
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  決済処理の完了（通常1-2分）
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  プランの自動有効化
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  拡張機能のご利用開始
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">ご利用可能な機能</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 1日の利用回数制限の拡張</li>
                <li>• 詳細な運勢分析レポート</li>
                <li>• 五行相性診断</li>
                <li>• PDF出力機能</li>
                <li>• 優先サポート</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  姓名判断を始める
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/my-subscription">マイページで確認</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                ご不明な点がございましたら、
                <Link href="/contact" className="text-blue-600 hover:underline">
                  お問い合わせ
                </Link>
                からご連絡ください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
