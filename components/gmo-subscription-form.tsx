"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, CheckCircle } from "lucide-react"

interface GMOSubscriptionFormProps {
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: string) => void
}

export function GMOSubscriptionForm({ onSuccess, onError }: GMOSubscriptionFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("premium")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "biannual" | "annual">("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  const plans = {
    basic: {
      name: "ベーシックプラン",
      monthly: 330, // 正しい価格に修正
      quarterly: 891, // 10%割引 (330 * 3 * 0.9)
      biannual: 1782, // 10%割引 (330 * 6 * 0.9)
      annual: 3564, // 10%割引 (330 * 12 * 0.9)
    },
    premium: {
      name: "プレミアムプラン",
      monthly: 550, // 正しい価格に修正
      quarterly: 1485, // 10%割引 (550 * 3 * 0.9)
      biannual: 2970, // 10%割引 (550 * 6 * 0.9)
      annual: 5940, // 10%割引 (550 * 12 * 0.9)
    },
  }

  const getCurrentPrice = () => {
    return plans[selectedPlan][billingCycle]
  }

  const getBillingText = () => {
    const texts = {
      monthly: "月額",
      quarterly: "3ヶ月",
      biannual: "6ヶ月",
      annual: "年額",
    }
    return texts[billingCycle]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // カード情報をGMOトークン化（実際の実装では GMO の JavaScript SDK を使用）
      const cardToken = await tokenizeCard(cardInfo)

      // サブスクリプション作成
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          cardToken,
          userId: generateUserId(), // 実際の実装ではログインユーザーのIDを使用
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess?.(result.subscriptionId)
      } else {
        onError?.(result.error || "サブスクリプション作成に失敗しました")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      onError?.("サブスクリプション作成中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* プラン選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            プラン選択
          </CardTitle>
          <CardDescription>お客様に最適なプランをお選びください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(plans).map(([planId, plan]) => (
              <div
                key={planId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPlan === planId ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPlan(planId as "basic" | "premium")}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{plan.name}</h3>
                  {planId === "premium" && <Badge className="bg-purple-600">おすすめ</Badge>}
                </div>
                <p className="text-2xl font-bold mt-2">
                  {plan[billingCycle]}円<span className="text-sm font-normal text-gray-600">/{getBillingText()}</span>
                </p>
              </div>
            ))}
          </div>

          {/* 課金サイクル選択 */}
          <div>
            <Label htmlFor="billing-cycle">課金サイクル</Label>
            <Select value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月額課金</SelectItem>
                <SelectItem value="quarterly">3ヶ月課金（10%割引）</SelectItem>
                <SelectItem value="biannual">6ヶ月課金（10%割引）</SelectItem>
                <SelectItem value="annual">年額課金（10%割引）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* カード情報入力 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            お支払い情報
          </CardTitle>
          <CardDescription>GMOペイメントゲートウェイで安全に処理されます</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="card-number">カード番号</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardInfo.number}
                onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="expiry">有効期限</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardInfo.expiry}
                  onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc">セキュリティコード</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardInfo.cvc}
                  onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="card-name">カード名義</Label>
              <Input
                id="card-name"
                placeholder="YAMADA TARO"
                value={cardInfo.name}
                onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                required
              />
            </div>

            {/* 料金確認 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">お支払い金額</span>
                <span className="text-2xl font-bold">
                  {getCurrentPrice()}円<span className="text-sm font-normal text-gray-600">/{getBillingText()}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                次回課金日:{" "}
                {new Date(
                  Date.now() +
                    (billingCycle === "monthly"
                      ? 30
                      : billingCycle === "quarterly"
                        ? 90
                        : billingCycle === "biannual"
                          ? 180
                          : 365) *
                      24 *
                      60 *
                      60 *
                      1000,
                ).toLocaleDateString()}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "処理中..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  サブスクリプションを開始
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* セキュリティ情報 */}
      <div className="text-center text-sm text-gray-600">
        <p className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          SSL暗号化通信により、お客様の情報は安全に保護されます
        </p>
      </div>
    </div>
  )
}

// カード情報をトークン化（実際の実装ではGMO JavaScript SDKを使用）
async function tokenizeCard(cardInfo: any): Promise<string> {
  // 実際の実装では GMO の JavaScript SDK を使用してトークン化
  // ここでは仮のトークンを返す
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ユーザーID生成（実際の実装では認証システムから取得）
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
