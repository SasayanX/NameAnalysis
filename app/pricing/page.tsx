"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, X, Trophy, Star, Crown, Sparkles } from "lucide-react"
import { useSubscription } from "@/lib/subscription-manager"
import { SquareCheckoutButton } from "@/components/square-checkout-button"
import Link from "next/link"
import { GooglePlayBillingDetector } from "@/lib/google-play-billing-detector"
import { getGooglePlayProductId } from "@/lib/google-play-product-ids"

export default function PricingPage() {
  const subscription = useSubscription()
  const currentPlan = subscription.getCurrentPlan()
  // 年額プランは無効化：常に月額のみ
  const billingCycle: "monthly" = "monthly"
  const [isGooglePlayAvailable, setIsGooglePlayAvailable] = useState(false)
  const [isTWAContext, setIsTWAContext] = useState(false)
  const [processingPlan, setProcessingPlan] = useState<"basic" | "premium" | null>(null)

  const plans = {
    free: {
      name: "無料プラン",
      price: { monthly: 0 },
      description: "まずはお試しで基本機能を体験",
      features: ["個人名判断: 1日1回", "会社名判断: 1日1回", "基本的な運勢分析", "五行バランス表示"],
      limitations: [
        "相性診断利用不可",
        "数秘術分析利用不可",
        "赤ちゃん名付け利用不可",
        "運勢フロー分析利用不可",
        "PDF出力利用不可",
        "履歴保存利用不可",
        "おなまえ格付けランク利用不可",
      ],
      buttonText: "無料で始める",
      buttonVariant: "outline" as const,
    },
    basic: {
      name: "ベーシックプラン",
      price: { monthly: 330 },
      description: "日常的に姓名判断を活用したい方に",
      features: [
        "個人名判断: 1日10回",
        "会社名判断: 1日10回",
        "相性診断: 1日3回",
        "数秘術分析: 1日5回",
        "赤ちゃん名付け: 1日5回",
        "運勢フロー分析: 1日5回",
        "PDF出力: 1日10回",
        "履歴保存: 50件まで",
        "詳細な運勢解説",
        "データエクスポート機能",
      ],
      limitations: ["おなまえ格付けランク利用不可", "優先サポートなし", "カスタムレポートなし"],
      buttonText: "ベーシックプランを選ぶ",
      buttonVariant: "default" as const,
      popular: false,
    },
    premium: {
      name: "プレミアムプラン",
      price: { monthly: 550 },
      description: "全機能を無制限で利用したいプロフェッショナル向け",
      features: [
        "全機能無制限利用",
        "🏆 おなまえ格付けランク（S・A・B・C・D評価）",
        "全国ランキング比較",
        "運勢の強さ・バランス・希少性総合判定",
        "優先サポート",
        "カスタムレポート",
        "高度な分析機能",
        "無制限履歴保存",
        "無制限PDF出力",
        "専用ダッシュボード",
      ],
      limitations: [],
      buttonText: "プレミアムプランを選ぶ",
      buttonVariant: "default" as const,
      popular: true,
      highlight: true,
    },
  }

  useEffect(() => {
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
        console.warn("[Pricing] Failed to initialize Google Play Billing:", error)
        setIsGooglePlayAvailable(false)
      }
    }

    checkPlatform()
  }, [])

  const handleGooglePlayPurchase = async (planId: "basic" | "premium") => {
    try {
      setProcessingPlan(planId)

      if (!GooglePlayBillingDetector.isTWAEnvironment()) {
        alert("Google Playアプリ内でのみ購入できます。")
        return
      }

      const initialized = await GooglePlayBillingDetector.initialize()
      if (!initialized) {
        alert("Google Play Billingの初期化に失敗しました。しばらくしてから再度お試しください。")
        return
      }

      const productId = getGooglePlayProductId(planId)
      const purchase = await GooglePlayBillingDetector.purchase(productId)

      const result = await subscription.startGooglePlayBillingSubscription(planId, purchase.purchaseToken)
      if (!result.success) {
        alert(`プラン変更に失敗しました: ${result.error ?? "原因不明のエラー"}`)
      }
    } catch (error: any) {
      console.error("[Pricing] Google Play purchase error:", error)
      const errorMessage = error?.message?.includes("User cancelled")
        ? "購入がキャンセルされました。"
        : `購入に失敗しました: ${error?.message ?? "原因不明のエラー"}`
      alert(errorMessage)
    } finally {
      setProcessingPlan(null)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">料金プラン</h1>
          <p className="text-xl text-gray-600 mb-8">あなたに最適なプランをお選びください</p>
          
          {/* 定期購入のみ表示 */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              定期購入プランのみ対応
            </Badge>
          </div>

          {/* 現在のプラン（ヘッダーと連動） */}
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
              現在のプラン: {currentPlan.name}
            </span>
          </div>
        </div>

        {/* Premium Feature Highlight */}
        <div className="mb-12">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-purple-600" />
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  プレミアム限定
                </Badge>
              </div>
              <CardTitle className="text-2xl text-purple-900">🏆 おなまえ格付けランク</CardTitle>
              <CardDescription className="text-lg text-purple-700">
                あなたの名前を全国レベルで格付け！S・A・B・C・D の5段階評価
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Star className="h-8 w-8 text-yellow-500 mb-2" />
                  <h4 className="font-semibold text-purple-900">運勢の強さ</h4>
                  <p className="text-sm text-purple-700">総合運勢スコアを算出</p>
                </div>
                <div className="flex flex-col items-center">
                  <Crown className="h-8 w-8 text-purple-500 mb-2" />
                  <h4 className="font-semibold text-purple-900">全国ランキング</h4>
                  <p className="text-sm text-purple-700">全国での順位を表示</p>
                </div>
                <div className="flex flex-col items-center">
                  <Sparkles className="h-8 w-8 text-pink-500 mb-2" />
                  <h4 className="font-semibold text-purple-900">希少性判定</h4>
                  <p className="text-sm text-purple-700">名前の珍しさを評価</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {Object.entries(plans).map(([key, plan]) => {
            const isPaidPlan = key !== "free"
            const typedPlanId = key === "basic" || key === "premium" ? (key as "basic" | "premium") : null

            return (
              <Card
                key={key}
                className={`relative ${
                  plan.highlight ? "border-2 border-purple-500 shadow-2xl scale-105" : "border border-gray-200 shadow-lg"
                }`}
              >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    <Trophy className="h-4 w-4 mr-1" />
                    おすすめ
                  </Badge>
                </div>
              )}

              <CardHeader className={plan.highlight ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className={plan.highlight ? "text-purple-100" : ""}>
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">¥{plan.price[billingCycle].toLocaleString()}</span>
                    {plan.price[billingCycle] > 0 && (
                      <span className={`ml-2 ${plan.highlight ? "text-purple-100" : "text-gray-500"}`}>
                        /{billingCycle === "monthly" ? "月" : "年"}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">利用可能機能</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">制限事項</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  {key === "free" ? (
                    <Button variant={plan.buttonVariant} className="w-full" asChild>
                      <Link href="/">{plan.buttonText}</Link>
                    </Button>
                  ) : (isGooglePlayAvailable || isTWAContext) && typedPlanId ? (
                    <Button
                      onClick={() => handleGooglePlayPurchase(typedPlanId)}
                      disabled={processingPlan === typedPlanId}
                      className={`w-full ${
                        plan.highlight
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {processingPlan === typedPlanId ? (
                        "処理中..."
                      ) : (
                        <>
                          {plan.highlight && <Trophy className="h-4 w-4 mr-2" />}
                          {`${plan.buttonText}（Google Play）`}
                        </>
                      )}
                    </Button>
                  ) : typedPlanId ? (
                    <SquareCheckoutButton
                      planId={typedPlanId}
                      price={plan.price[billingCycle]}
                      className={`w-full ${
                        plan.highlight
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : ""
                      }`}
                    >
                      {plan.highlight && <Trophy className="h-4 w-4 mr-2" />}
                      {plan.buttonText}
                    </SquareCheckoutButton>
                  ) : null}
                </div>

                {isPaidPlan && (isGooglePlayAvailable || isTWAContext) && (
                  <p className="mt-3 text-xs text-blue-600 text-center">Google Play決済で処理されます</p>
                )}
              </CardContent>
            </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">よくある質問</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="ranking">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  おなまえ格付けランクとは何ですか？
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p>おなまえ格付けランクは、あなたの名前を全国レベルで評価する画期的な機能です。</p>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">評価基準：</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • <strong>運勢の強さ</strong>：総合的な運勢スコア
                      </li>
                      <li>
                        • <strong>バランス</strong>：五行のバランスと調和
                      </li>
                      <li>
                        • <strong>希少性</strong>：名前の珍しさと特別感
                      </li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-sm">
                    <div className="bg-yellow-100 p-2 rounded">
                      <div className="font-bold text-yellow-800">Sランク</div>
                      <div className="text-yellow-600">最高級</div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                      <div className="font-bold text-blue-800">Aランク</div>
                      <div className="text-blue-600">優秀</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded">
                      <div className="font-bold text-green-800">Bランク</div>
                      <div className="text-green-600">良好</div>
                    </div>
                    <div className="bg-orange-100 p-2 rounded">
                      <div className="font-bold text-orange-800">Cランク</div>
                      <div className="text-orange-600">標準</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <div className="font-bold text-gray-800">Dランク</div>
                      <div className="text-gray-600">要改善</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="billing">
              <AccordionTrigger>支払い方法について教えてください</AccordionTrigger>
              <AccordionContent>
                <p>
                  クレジットカード決済に対応しています。現在は月額プランのみのご提供となります。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancel">
              <AccordionTrigger>解約はいつでもできますか？</AccordionTrigger>
              <AccordionContent>
                <p>はい、いつでも解約可能です。解約後も現在の請求期間終了まではサービスをご利用いただけます。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upgrade">
              <AccordionTrigger>プランの変更はできますか？</AccordionTrigger>
              <AccordionContent>
                <p>
                  はい、いつでもプランのアップグレード・ダウングレードが可能です。変更は次回請求日から適用されます。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limits">
              <AccordionTrigger>利用制限はどのようにカウントされますか？</AccordionTrigger>
              <AccordionContent>
                <p>
                  利用制限は日本時間の0時にリセットされます。プレミアムプランでは全ての機能が無制限でご利用いただけます。
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">今すぐ始めて、あなたの名前の真の価値を発見しましょう</h3>
              <p className="text-purple-100 mb-6">無料プランから始めて、必要に応じてアップグレードできます</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/">無料で試してみる</Link>
                </Button>
                {(isGooglePlayAvailable || isTWAContext) ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                    onClick={() => handleGooglePlayPurchase("premium")}
                    disabled={processingPlan === "premium"}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {processingPlan === "premium" ? "処理中..." : "プレミアムで格付けランクを体験（Google Play）"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                    asChild
                  >
                    <Link href="/subscribe?plan=premium&billing=monthly">
                      <Trophy className="h-4 w-4 mr-2" />
                      プレミアムで格付けランクを体験
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
