"use client"

import React, { useRef, useEffect, useMemo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LockIcon, Settings, Baby, Sparkles } from "lucide-react"
import Link from "next/link"

// コンポーネントの遅延読み込み
import { NameAnalysisResult } from "@/components/name-analysis-result"
import { SimpleAnalysisResult } from "@/components/simple-analysis-result"
import { VerticalNameDisplay } from "@/components/vertical-name-display"
import { DailyFortuneCard } from "@/components/daily-fortune-card"
import { SixStarChart } from "@/components/six-star-chart"
import { NameRankingCard } from "@/components/name-ranking-card"
import { CompatibilityAnalyzer } from "@/components/compatibility-analyzer"
import { AdvancedFiveElementsChart } from "@/components/advanced-five-elements-chart"
import { FortuneFlowTable } from "@/components/fortune-flow-table"
import { CompanyNameResult } from "@/components/company-name-result"
import { ErrorBoundary } from "@/components/error-boundary"
import { TrialBanner } from "@/components/trial-banner"
import { NumerologyResultComponent } from "@/components/numerology-result"
import { BabyNamingTool } from "@/components/baby-naming-tool"

// 型とユーティリティ
import type { StarPersonType } from "@/lib/fortune-flow-calculator"
import { normalizeStarPersonType, calculateStarPersonFromBirthdate } from "@/lib/fortune-flow-calculator"
import { UsageTracker } from "@/lib/usage-tracker"
import { calculateNumerology } from "@/lib/numerology"

// メモ化されたコンポーネント
const MemoizedVerticalNameDisplay = React.memo(VerticalNameDisplay)
const MemoizedDailyFortuneCard = React.memo(DailyFortuneCard)

// デフォルトの使用状況オブジェクト
const DEFAULT_USAGE = {
  personalAnalysis: 0,
  companyAnalysis: 0,
  compatibilityAnalysis: 0,
  numerologyAnalysis: 0,
  babyNaming: 0,
  pdfExport: 0,
  historyStorage: 0,
}

export default function ClientPage() {
  // 基本的な状態管理
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [birthdate, setBirthdate] = useState<string>("")
  const [results, setResults] = useState<any>(null)
  const [sixStar, setSixStar] = useState<any>(null)
  const [advancedResults, setAdvancedResults] = useState<any>(null)

  const [companyName, setCompanyName] = useState("")
  const [companyResults, setCompanyResults] = useState<any>(null)

  const [activeSection, setActiveSection] = useState<"fortune" | "compatibility" | "baby-naming">("fortune")
  const [nameType, setNameType] = useState<"person" | "company">("person")
  const [activeTab, setActiveTab] = useState("simple")
  const [selectedStarType, setSelectedStarType] = useState<StarPersonType>("水星人+")
  const [calculatedStarType, setCalculatedStarType] = useState<StarPersonType | null>(null)
  const [forceUpdateKey, setForceUpdateKey] = useState(0)
  const [tabsKey, setTabsKey] = useState(0)

  const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">("basic")
  const [isInTrial, setIsInTrial] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  const resultsRef = useRef<HTMLDivElement>(null)

  // 使用制限管理
  const [usageTracker] = useState(() => UsageTracker.getInstance())
  const [usageStatus, setUsageStatus] = useState(() => {
    try {
      return usageTracker.getUsageStatus()
    } catch (error) {
      console.error("Failed to get usage status:", error)
      return {
        plan: "premium" as const,
        isInTrial: false,
        trialDaysRemaining: 0,
        todayUsage: DEFAULT_USAGE,
        limits: {
          personalAnalysis: -1,
          companyAnalysis: -1,
          compatibilityAnalysis: -1,
          numerologyAnalysis: -1,
          babyNaming: -1,
          pdfExport: -1,
          historyStorage: -1,
        },
        canUseFeature: () => ({ allowed: true, remaining: -1 }),
      }
    }
  })

  // 計算されたプロパティ
  const fullName = useMemo(() => `${lastName} ${firstName}`, [lastName, firstName])

  // 安定化されたコールバック関数
  const handleGenderChange = useCallback((value: string) => {
    setGender(value as "male" | "female")
  }, [])

  const handlePersonalAnalysis = useCallback(() => {
    try {
      // 実際の姓名判断分析を実行
      const { analyzeNameFortune } = require("@/lib/name-data-simple-fixed")
      const { customFortuneData } = require("@/lib/fortune-data-custom")
      const analysisResult = analyzeNameFortune(lastName, firstName, gender, customFortuneData)
      console.log("分析結果:", analysisResult)
      setResults(analysisResult)

      if (birthdate) {
        // 生年月日から六星占術の星人タイプを計算
        const dateObject = new Date(birthdate)
        const calculatedStarType = calculateStarPersonFromBirthdate(dateObject)

        const mockSixStar = {
          star: calculatedStarType.includes("水星")
            ? "水星"
            : calculatedStarType.includes("金星")
              ? "金星"
              : calculatedStarType.includes("火星")
                ? "火星"
                : calculatedStarType.includes("木星")
                  ? "木星"
                  : calculatedStarType.includes("土星")
                    ? "土星"
                    : "水星",
          type: calculatedStarType.includes("+") ? "+" : "-",
          starType: calculatedStarType,
        }
        setSixStar(mockSixStar)

        const mockAdvanced = {
          hasBirthdate: true,
          sixStar: mockSixStar,
          gogyoResult: {
            dominantElement: "水",
            weakElement: "火",
            yinYang: "陽",
            elements: { wood: 1, fire: 0, earth: 1, metal: 1, water: 2 },
            // 生年月日から導出された星（4つの星）
            birthStars: ["水星", "金星", "木星", "土星"],
            // 姓名判断から導出された星（5つの格）
            nameStars: ["木星", "火星", "土星", "金星", "水星"],
            // 九星
            nineStar: "一白水星",
            // 外運、内運、一生運
            externalLuck: 15,
            internalLuck: 18,
            lifeLuck: 33,
            elementArray: [
              { element: "木", count: 1, percentage: 20 },
              { element: "火", count: 0, percentage: 0 },
              { element: "土", count: 1, percentage: 20 },
              { element: "金", count: 1, percentage: 20 },
              { element: "水", count: 2, percentage: 40 },
            ],
            balance: "良好",
            advice: "五行のバランスが取れています",
            compatibility: {
              wood: "普通",
              fire: "注意",
              earth: "良好",
              metal: "良好",
              water: "最良",
            },
          },
        }
        setAdvancedResults(mockAdvanced)
      } else {
        // 生年月日なしの場合
        const mockAdvanced = {
          hasBirthdate: false,
          sixStar: null,
          gogyoResult: {
            dominantElement: "水",
            weakElement: "火",
            yinYang: "陽",
            elements: { wood: 1, fire: 0, earth: 1, metal: 1, water: 2 },
            // 生年月日なしなので空配列
            birthStars: [],
            // 姓名判断から導出された星のみ
            nameStars: ["木星", "火星", "土星", "金星", "水星"],
            nineStar: null,
            externalLuck: 15,
            internalLuck: 18,
            lifeLuck: 33,
            elementArray: [
              { element: "木", count: 1, percentage: 20 },
              { element: "火", count: 0, percentage: 0 },
              { element: "土", count: 1, percentage: 20 },
              { element: "金", count: 1, percentage: 20 },
              { element: "水", count: 2, percentage: 40 },
            ],
            balance: "良好",
            advice: "五行のバランスが取れています",
            compatibility: {
              wood: "普通",
              fire: "注意",
              earth: "良好",
              metal: "良好",
              water: "最良",
            },
          },
        }
        setAdvancedResults(mockAdvanced)
      }

      if (usageTracker.incrementUsage("personalAnalysis")) {
        setUsageStatus(usageTracker.getUsageStatus())
      }
    } catch (error) {
      console.error("Error in personal analysis:", error)
    }
  }, [lastName, firstName, gender, birthdate, usageTracker])

  const handleCompanyAnalysis = useCallback(() => {
    try {
      // 社名鑑定専用の計算を実行
      const { analyzeCompanyName } = require("@/lib/company-name-analysis")
      
      const companyResult = analyzeCompanyName(companyName)
      
      console.log("社名分析結果:", companyResult)
      setCompanyResults(companyResult)

      if (usageTracker.incrementUsage("companyAnalysis")) {
        setUsageStatus(usageTracker.getUsageStatus())
      }
    } catch (error) {
      console.error("Error in company analysis:", error)
    }
  }, [companyName, usageTracker])

  const handlePdfExport = useCallback(
    (contentId: string, fileName: string) => {
      try {
        console.log("PDF出力:", contentId, fileName)
        if (usageTracker.incrementUsage("pdfExport")) {
          setUsageStatus(usageTracker.getUsageStatus())
        }
      } catch (error) {
        console.error("Error in PDF export:", error)
      }
    },
    [usageTracker],
  )

  const handlePlanChange = useCallback(
    (plan: "free" | "basic" | "premium") => {
      try {
        setCurrentPlan(plan)
        usageTracker.resetUsage()
        setUsageStatus(usageTracker.getUsageStatus())
      } catch (error) {
        console.error("Error changing plan:", error)
      }
    },
    [usageTracker],
  )

  const handleStartTrial = useCallback(() => {
    setIsInTrial(true)
    setTrialDaysRemaining(3)
  }, [])

  const getButtonClass = useCallback((isActive: boolean) => {
    return isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"
  }, [])

  // 安全な使用状況取得
  const getTodayUsage = useCallback(() => {
    try {
      return usageStatus?.todayUsage || DEFAULT_USAGE
    } catch (error) {
      console.error("Error getting today usage:", error)
      return DEFAULT_USAGE
    }
  }, [usageStatus])

  // 六星占術の結果が更新されたときの処理 - 依存配列を最小限に
  useEffect(() => {
    try {
      if (sixStar) {
        let starType: StarPersonType

        if (sixStar.starType) {
          starType = normalizeStarPersonType(sixStar.starType)
        } else if (sixStar.star && sixStar.type) {
          const starTypeString = sixStar.star + "人" + sixStar.type
          starType = normalizeStarPersonType(starTypeString)
        } else {
          return
        }

        setSelectedStarType(starType)
        setCalculatedStarType(starType)
        setForceUpdateKey((prev) => prev + 1)
        setTabsKey((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error processing sixStar data:", error)
    }
  }, [sixStar]) // sixStarのみに依存

  // 生年月日が変更されたときの処理 - 依存配列を最小限に
  useEffect(() => {
    try {
      if (birthdate) {
        const dateObject = new Date(birthdate)
        if (!isNaN(dateObject.getTime())) {
          const calculatedStarType = calculateStarPersonFromBirthdate(dateObject)
          setSelectedStarType(calculatedStarType)
          setCalculatedStarType(calculatedStarType)
          setForceUpdateKey((prev) => prev + 1)
          setTabsKey((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error calculating star type:", error)
    }
  }, [birthdate]) // birthdateのみに依存

  // 使用状況の更新
  useEffect(() => {
    const updateUsageStatus = () => {
      try {
        setUsageStatus(usageTracker.getUsageStatus())
      } catch (error) {
        console.error("Error updating usage status:", error)
      }
    }

    const interval = setInterval(updateUsageStatus, 60000)
    return () => clearInterval(interval)
  }, [usageTracker])

  // メモ化された計算値
  const displayStarType = useMemo(() => {
    try {
      if (calculatedStarType) return calculatedStarType
      if (sixStar?.star && sixStar?.type) {
        return sixStar.star + "人" + sixStar.type
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating display star type:", error)
      return selectedStarType
    }
  }, [calculatedStarType, sixStar, selectedStarType])

  const starPersonForFortuneFlow = useMemo((): StarPersonType => {
    try {
      if (sixStar?.star && sixStar?.type) {
        const starTypeString = sixStar.star + "人" + sixStar.type
        return normalizeStarPersonType(starTypeString)
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating star person for fortune flow:", error)
      return selectedStarType
    }
  }, [sixStar, selectedStarType])

  const sixStarYearlyStarPerson = useMemo(() => {
    try {
      if (sixStar?.starType) return sixStar.starType
      if (sixStar?.star && sixStar?.type) {
        return sixStar.star + "人" + sixStar.type
      }
      return selectedStarType
    } catch (error) {
      console.error("Error calculating six star yearly star person:", error)
      return selectedStarType
    }
  }, [sixStar, selectedStarType])

  // イベントハンドラー
  const handleTabClick = useCallback(
    (tabValue: string, requiredPlan: "basic" | "premium") => {
      return (e: React.MouseEvent) => {
        try {
          const hasAccess =
            (requiredPlan === "basic" && (currentPlan === "basic" || currentPlan === "premium")) ||
            (requiredPlan === "premium" && currentPlan === "premium")

          if (!hasAccess) {
            e.preventDefault()
          }
        } catch (error) {
          console.error("Error in tab click handler:", error)
        }
      }
    },
    [currentPlan],
  )

  // プラン表示用の情報
  const planInfo = useMemo(() => {
    try {
      if (isInTrial) {
        return {
          text: `プレミアム（トライアル残り${trialDaysRemaining}日）`,
          style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
        }
      }

      switch (currentPlan) {
        case "free":
          return {
            text: "無料プラン",
            style: "bg-gray-100 text-gray-700 border border-gray-300",
          }
        case "basic":
          return {
            text: "ベーシックプラン",
            style: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
          }
        case "premium":
          return {
            text: "プレミアムプラン",
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          }
        default:
          return {
            text: "プレミアムプラン",
            style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          }
      }
    } catch (error) {
      console.error("Error calculating plan info:", error)
      return {
        text: "プレミアムプラン",
        style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      }
    }
  }, [currentPlan, isInTrial, trialDaysRemaining])

  // DailyFortuneCardに渡すpropsを安定化
  const dailyFortuneProps = useMemo(() => {
    return {
      birthStar: sixStar || { star: "水星" as const, type: "+" as const },
      isPremium: currentPlan !== "free",
      premiumLevel: currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0,
    }
  }, [currentPlan, sixStar])

  return (
    <ErrorBoundary>
      {/* トライアルバナー */}
      {isInTrial && <TrialBanner daysRemaining={trialDaysRemaining} />}

      {/* アップグレード促進バナー */}
      {currentPlan === "free" && !isInTrial && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">🎉 今なら3日間無料トライアル！全機能をお試しください</span>
            <Link href="/pricing">
              <Button variant="secondary" size="sm" className="ml-4 bg-white text-purple-600 hover:bg-gray-100">
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="container mx-auto py-10 px-4 md:px-6 pb-16">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">まいにちAI姓名判断</h1>
            <p className="text-muted-foreground">旧字体による正確な画数計算で、あなたの運命を詳しく鑑定</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className={planInfo.style}>
              <Settings className="h-4 w-4 mr-2" />
              {planInfo.text}
            </Button>
          </div>
        </div>

        {/* 開発環境用：デバッグコントロール */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-3">🛠️ 開発環境：デバッグコントロール</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* プラン切り替え */}
              <div>
                <h4 className="text-sm font-medium text-yellow-700 mb-2">プラン切り替え</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handlePlanChange("free")}>
                    無料プラン
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePlanChange("basic")}>
                    ベーシックプラン
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePlanChange("premium")}>
                    プレミアムプラン
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleStartTrial}>
                    トライアル開始
                  </Button>
                </div>
              </div>

              {/* 使用回数リセット */}
              <div>
                <h4 className="text-sm font-medium text-yellow-700 mb-2">使用回数管理</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      usageTracker.resetUsage()
                      setUsageStatus(usageTracker.getUsageStatus())
                    }}
                  >
                    使用回数リセット
                  </Button>
                </div>
              </div>
            </div>

            {/* 現在の状態表示 */}
            <div className="mt-3 p-3 bg-yellow-100 rounded text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>現在のプラン:</strong> {currentPlan}
                  {isInTrial && ` (トライアル残り${trialDaysRemaining}日)`}
                </div>
              </div>
              <div className="mt-2">
                <strong>今日の使用回数:</strong>
                個人名分析: {getTodayUsage().personalAnalysis}, 会社名分析: {getTodayUsage().companyAnalysis}
              </div>
            </div>
          </div>
        )}

        {/* セクション選択 */}
        <div className="flex justify-between items-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "fortune")}
              onClick={() => setActiveSection("fortune")}
            >
              姓名判断
            </Button>
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "compatibility")}
              onClick={() => setActiveSection("compatibility")}
            >
              相性診断
              {currentPlan === "free" && <LockIcon className="h-3 w-3 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              className={getButtonClass(activeSection === "baby-naming")}
              onClick={() => setActiveSection("baby-naming")}
            >
              <Baby className="h-4 w-4 mr-2" />
              赤ちゃん名付け
              {currentPlan === "free" && <LockIcon className="h-3 w-3 ml-1" />}
            </Button>
          </div>

          {results && (
            <Button
              onClick={() => handlePdfExport("results-content", "姓名判断結果_" + lastName + firstName)}
              disabled={currentPlan === "free"}
            >
              {currentPlan === "free" ? (
                <>
                  <LockIcon className="h-4 w-4 mr-2" />
                  PDF出力（有料限定）
                </>
              ) : (
                "PDF出力"
              )}
            </Button>
          )}
        </div>

        {activeSection === "fortune" ? (
          <div className="grid gap-8 md:grid-cols-3">
            {/* メインコンテンツ */}
            <div className="md:col-span-2 order-1 md:order-2">
              {nameType === "person"
                ? results && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} key={tabsKey.toString()}>
                      <div className="mb-4">
                        <TabsList className="grid w-full grid-cols-6">
                          <TabsTrigger value="simple">かんたん鑑定</TabsTrigger>
                          <TabsTrigger value="detailed" onClick={handleTabClick("detailed", "basic")}>
                            {currentPlan === "free" && <LockIcon className="h-3 w-3 mr-1" />}
                            詳細鑑定
                          </TabsTrigger>
                          <TabsTrigger value="advanced">総合分析</TabsTrigger>
                          <TabsTrigger value="ranking">格付け</TabsTrigger>
                          <TabsTrigger value="numerology" onClick={handleTabClick("numerology", "basic")}>
                            {currentPlan === "free" && <LockIcon className="h-3 w-3 mr-1" />}
                            数秘術
                          </TabsTrigger>
                          <TabsTrigger value="fortune-flow" onClick={handleTabClick("fortune-flow", "premium")}>
                            {currentPlan !== "premium" && <LockIcon className="h-3 w-3 mr-1" />}
                            運気運行表
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div id="results-content" ref={resultsRef}>
                        <TabsContent value="simple">
                          <SimpleAnalysisResult
                            results={results}
                            name={fullName}
                            gender={gender}
                            isPremium={currentPlan !== "free"}
                            premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                          />
                        </TabsContent>

                        <TabsContent value="detailed">
                          <NameAnalysisResult 
                            results={results} 
                            name={fullName} 
                            gender={gender} 
                            currentPlan={currentPlan}
                          />
                        </TabsContent>

                        <TabsContent value="advanced">
                          {advancedResults ? (
                            <div className="space-y-6">
                              {sixStar && <SixStarChart birthStar={sixStar} isPremium={currentPlan !== "free"} />}

                              {advancedResults.gogyoResult && (
                                <AdvancedFiveElementsChart
                                  gogyoResult={advancedResults.gogyoResult}
                                  isPremium={currentPlan === "premium"}
                                  isPro={currentPlan === "basic"}
                                />
                              )}
                            </div>
                          ) : (
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center py-8">
                                  <p>生年月日を入力すると、より詳細な総合分析が表示されます</p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="ranking">
                          <NameRankingCard
                            lastName={lastName}
                            firstName={firstName}
                            gender={gender}
                            isPremium={currentPlan === "premium"}
                            premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                          />
                        </TabsContent>

                        <TabsContent value="numerology">
                          {(() => {
                            // birthdateが文字列の場合、Dateオブジェクトに変換
                            let birthdateObj: Date | undefined = undefined
                            if (birthdate) {
                              const dateObj = new Date(birthdate)
                              // 有効な日付かチェック
                              if (!isNaN(dateObj.getTime())) {
                                birthdateObj = dateObj
                              }
                            }

                            const numerologyResult = calculateNumerology(fullName, birthdateObj)
                            return (
                              <NumerologyResultComponent
                                result={numerologyResult}
                                name={fullName}
                                isPremium={currentPlan !== "free"}
                                premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                              />
                            )
                          })()}
                        </TabsContent>

                        <TabsContent value="fortune-flow">
                          <FortuneFlowTable
                            starPerson={starPersonForFortuneFlow}
                            isPremium={currentPlan === "premium"}
                            key={forceUpdateKey}
                          />
                        </TabsContent>
                      </div>
                    </Tabs>
                  )
                : companyResults && <CompanyNameResult result={companyResults} companyName={companyName} />}
            </div>

            {/* サイドバー */}
            <div className="space-y-6 order-2 md:order-1">
              {/* 入力フォーム */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {nameType === "person" ? "個人名鑑定" : "会社名鑑定"}
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={getButtonClass(nameType === "person")}
                        onClick={() => setNameType("person")}
                      >
                        個人名
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={getButtonClass(nameType === "company")}
                        onClick={() => setNameType("company")}
                      >
                        会社名
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {nameType === "person"
                      ? "お名前と生年月日を入力してください"
                      : "会社名を入力してください（法人格は除く）"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nameType === "person" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lastName">姓</Label>
                          <Input
                            id="lastName"
                            placeholder="山田"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="firstName">名</Label>
                          <Input
                            id="firstName"
                            placeholder="太郎"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>性別</Label>
                        <RadioGroup value={gender} onValueChange={handleGenderChange} className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">男性</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">女性</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="birthdate">生年月日（任意）</Label>
                        <Input
                          id="birthdate"
                          type="date"
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          生年月日を入力すると、六星占術による運気分析も表示されます
                        </p>
                      </div>

                      <Button onClick={handlePersonalAnalysis} className="w-full" disabled={!lastName || !firstName}>
                        姓名判断を実行
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="companyName">会社名</Label>
                        <Input
                          id="companyName"
                          placeholder="例：トヨタ自動車"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          「株式会社」「有限会社」などの法人格は除いて入力してください
                        </p>
                      </div>

                      <Button onClick={handleCompanyAnalysis} className="w-full" disabled={!companyName}>
                        会社名鑑定を実行
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 縦書き表示 */}
              {(lastName || firstName) && (
                <Card>
                  <CardHeader>
                    <CardTitle>縦書き表示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemoizedVerticalNameDisplay lastName={lastName} firstName={firstName} />
                  </CardContent>
                </Card>
              )}

              {/* 社名鑑定の縦書き表示 */}
              {companyName && nameType === "company" && (
                <Card>
                  <CardHeader>
                    <CardTitle>縦書き表示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemoizedVerticalNameDisplay name={companyName} />
                  </CardContent>
                </Card>
              )}

              {/* 今日の運勢 */}
              {sixStar && (
                <Card>
                  <CardHeader>
                    <CardTitle>今日の運勢</CardTitle>
                    <CardDescription>
                      {displayStarType}の{new Date().toLocaleDateString("ja-JP")}の運勢
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemoizedDailyFortuneCard {...dailyFortuneProps} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : activeSection === "compatibility" ? (
          <div className="max-w-4xl mx-auto">
            <CompatibilityAnalyzer
              isPremium={currentPlan !== "free"}
              premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <BabyNamingTool
              isPremium={currentPlan !== "free"}
              premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
            />
          </div>
        )}
      </main>
    </ErrorBoundary>
  )
}
