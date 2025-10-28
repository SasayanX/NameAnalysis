"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, CreditCard, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Square: any
  }
}

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "ベーシックプラン",
    price: 220,
    yearlyPrice: 2200,
    features: ["1日10回まで姓名判断", "基本的な運勢分析", "五行相性診断", "メール通知"],
  },
  {
    id: "premium",
    name: "プレミアムプラン",
    price: 440,
    yearlyPrice: 4400,
    features: ["無制限姓名判断", "詳細運勢分析", "六星占術", "PDF出力", "優先サポート"],
    popular: true,
  },
]

export function SquarePaymentForm() {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [card, setCard] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadSquareSDK = async () => {
      if (window.Square) {
        initializeSquare()
        return
      }

      const script = document.createElement("script")
      script.src = "https://web.squarecdn.com/v1/square.js" // 本番環境用URL
      script.onload = () => {
        initializeSquare()
      }
      document.head.appendChild(script)
    }

    const initializeSquare = async () => {
      try {
        // DOM要素の存在確認
        const cardContainer = document.getElementById("card-container")
        if (!cardContainer) {
          console.error("Card container not found")
          return
        }

        const payments = window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || "sq0idp-CbbdF82IxFWDSqf8D2S0Pw",
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "L0YH3ASTVNNMA",
        )

        const cardElement = await payments.card()
        await cardElement.attach("#card-container")
        setCard(cardElement)
        setSquareLoaded(true)
      } catch (error) {
        console.error("Square initialization error:", error)
        toast({
          title: "エラー",
          description: "決済システムの初期化に失敗しました",
          variant: "destructive",
        })
      }
    }

    // DOM要素が存在することを確認してから初期化
    const timer = setTimeout(() => {
      loadSquareSDK()
    }, 100)

    return () => clearTimeout(timer)
  }, [toast])

  const handlePayment = async () => {
    if (!selectedPlan || !card) {
      toast({
        title: "エラー",
        description: "プランを選択してカード情報を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await card.tokenize()
      if (result.status === "OK") {
        const selectedPlanData = plans.find((p) => p.id === selectedPlan)
        const amount = billingCycle === "yearly" ? selectedPlanData?.yearlyPrice : selectedPlanData?.price

        const response = await fetch("/api/create-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId: result.token,
            planId: selectedPlan,
            billingCycle,
            amount: amount! * 100, // Convert to cents
          }),
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "決済完了",
            description: "サブスクリプションが正常に作成されました",
          })
          window.location.href = "/subscription-success"
        } else {
          throw new Error(data.error || "決済に失敗しました")
        }
      } else {
        throw new Error("カード情報の処理に失敗しました")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "決済エラー",
        description: error instanceof Error ? error.message : "決済処理中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">料金プラン</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                月額
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                年額（2ヶ月分お得）
              </button>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-300"
                } ${plan.popular ? "relative" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">人気</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {selectedPlan === plan.id && <CheckCircle className="h-5 w-5 text-blue-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      ¥{billingCycle === "yearly" ? plan.yearlyPrice.toLocaleString() : plan.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {billingCycle === "yearly" ? "年額" : "月額"}
                      {billingCycle === "yearly" && (
                        <span className="ml-2 text-green-600 font-medium">
                          (月額¥{Math.round(plan.yearlyPrice / 12).toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              お支払い情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{plans.find((p) => p.id === selectedPlan)?.name}</h3>
                  <p className="text-sm text-gray-600">{billingCycle === "yearly" ? "年額プラン" : "月額プラン"}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ¥
                    {(billingCycle === "yearly"
                      ? plans.find((p) => p.id === selectedPlan)?.yearlyPrice
                      : plans.find((p) => p.id === selectedPlan)?.price
                    )?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{billingCycle === "yearly" ? "年額" : "月額"}</div>
                </div>
              </div>
            </div>

            {/* Square Card Element */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カード情報</label>
              <div id="card-container" className="border border-gray-300 rounded-md p-3 min-h-[60px] bg-white" />
              {!squareLoaded && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">決済フォームを読み込み中...</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">ご注意事項</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 決済完了後、すぐにプランが有効化されます</li>
                <li>• {billingCycle === "yearly" ? "年額" : "月額"}で自動更新されます</li>
                <li>• いつでもマイページから解約可能です</li>
                <li>• 安全なSSL暗号化通信で保護されています</li>
              </ul>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!squareLoaded || isLoading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  決済処理中...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />¥
                  {(billingCycle === "yearly"
                    ? plans.find((p) => p.id === selectedPlan)?.yearlyPrice
                    : plans.find((p) => p.id === selectedPlan)?.price
                  )?.toLocaleString()}{" "}
                  で申し込む
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
