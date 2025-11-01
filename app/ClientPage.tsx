"use client"

import React, { useRef, useEffect, useMemo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { PdfExportButton } from "@/components/pdf-export-button"
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
import { KanauPointsHeader } from "@/components/kanau-points-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSubscription } from "@/lib/subscription-manager"
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
  // サブスクリプション状態（ヘッダー表示用）
  const subscription = useSubscription()

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
    console.log("🔍 ClientPage: handlePersonalAnalysis関数が呼び出されました")
    try {
      // 実際の姓名判断分析を実行
      console.log("🔍 ClientPage: 分析開始前")
      const { analyzeNameFortune } = require("@/lib/name-data-simple-fixed")
      console.log("🔍 ClientPage: analyzeNameFortune関数取得完了")
      console.log("🔍 ClientPage: analyzeNameFortune関数の型:", typeof analyzeNameFortune)
      console.log("🔍 ClientPage: analyzeNameFortune関数の名前:", analyzeNameFortune.name)
      const { customFortuneData } = require("@/lib/fortune-data-custom")
      console.log("🔍 ClientPage: customFortuneData取得状況:", !!customFortuneData)
      if (customFortuneData) {
        console.log("🔍 ClientPage: customFortuneData件数:", Object.keys(customFortuneData).length)
      }
      console.log("🔍 ClientPage: analyzeNameFortune関数呼び出し開始")
      const analysisResult = analyzeNameFortune(lastName, firstName, gender, customFortuneData)
      console.log("🔍 ClientPage: analyzeNameFortune関数呼び出し完了")
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

  // 使用状況の状態管理（Hydrationエラー対策）
  const [todayUsage, setTodayUsage] = useState(DEFAULT_USAGE)
  
  // クライアントサイドでのみ使用状況を更新
  useEffect(() => {
    try {
      if (usageStatus?.todayUsage) {
        setTodayUsage(usageStatus.todayUsage)
      }
    } catch (error) {
      console.error("Error setting today usage:", error)
    }
  }, [usageStatus])

  // 安全な使用状況取得
  const getTodayUsage = useCallback(() => {
    return todayUsage
  }, [todayUsage])

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

  // ヒーロー右側のプラン表示は実サブスクに追従させる
  const headerPlanInfo = useMemo(() => {
    try {
      const current = subscription.getCurrentPlan()
      const inTrial = subscription.isInTrial()
      const trialDays = subscription.getTrialDaysRemaining()

      if (inTrial) {
        return {
          text: `プレミアム（トライアル残り${trialDays}日）`,
          style: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
        }
      }

      switch (current.id) {
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
            text: "無料プラン",
            style: "bg-gray-100 text-gray-700 border border-gray-300",
          }
      }
    } catch (e) {
      return {
        text: "無料プラン",
        style: "bg-gray-100 text-gray-700 border border-gray-300",
      }
    }
  }, [subscription])

  const handleHeaderPlanClick = useCallback(() => {
    try {
      const current = subscription.getCurrentPlan()
      if (current.id === "free") {
        window.location.href = "/pricing"
      } else {
        window.location.href = "/my-subscription"
      }
    } catch (e) {
      window.location.href = "/pricing"
    }
  }, [subscription])

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
        {/* ヘッダー（モバイルは中央寄せ、md以上で左右配置） */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left mx-auto max-w-[22rem] sm:max-w-none">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-2">まいにちAI姓名判断</h1>
            <p className="text-muted-foreground md:max-w-[34rem] mx-auto md:mx-0">
              旧字体による正確な画数計算で、あなたの運命を詳しく鑑定
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end gap-3">
            <KanauPointsHeader />
            <Button variant="outline" className={headerPlanInfo.style} onClick={handleHeaderPlanClick}>
              <Settings className="h-4 w-4 mr-2" />
              {headerPlanInfo.text}
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* 開発環境用：デバッグコントロール */}
        {/* 開発用のデバッグコントロールは非表示化（モバイルの視認性優先） */}

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
            currentPlan === "free" ? (
              <Button disabled>
                <LockIcon className="h-4 w-4 mr-2" />
                PDF出力（有料限定）
              </Button>
            ) : (
              <PdfExportButton contentId="results-content" fileName={`姓名判断結果_${lastName}${firstName}`} />
            )
          )}
        </div>

        {activeSection === "fortune" ? (
          <div className="grid gap-8 md:grid-cols-3">
            {/* メインコンテンツ */}
            <div className="md:col-span-2 order-1 md:order-2">
              {nameType === "person" ? (
                results ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} key={tabsKey.toString()}>
                      <div className="mb-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="simple">かんたん鑑定</TabsTrigger>
                          <TabsTrigger value="detailed" onClick={handleTabClick("detailed", "basic")}>
                            {currentPlan === "free" && <LockIcon className="h-3 w-3 mr-1" />}
                            詳細鑑定
                          </TabsTrigger>
                          <TabsTrigger value="advanced">総合分析</TabsTrigger>
                          <TabsTrigger value="others">その他</TabsTrigger>
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

                        <TabsContent value="others">
                          <Card>
                            <CardHeader>
                              <CardTitle>その他の機能</CardTitle>
                              <CardDescription>プレミアム機能をご利用いただけます</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 格付け */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ranking")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">格付け</h3>
                                        <p className="text-sm text-muted-foreground">名前の総合評価</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan === "free" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ベーシック</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* 数秘術 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("numerology")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">数秘術</h3>
                                        <p className="text-sm text-muted-foreground">数字による運命分析</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan === "free" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ベーシック</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* 運気運行表 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("fortune-flow")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">運気運行表</h3>
                                        <p className="text-sm text-muted-foreground">年間の運気の流れ</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">プレミアム</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* AI心理分析 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ai-personality")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">AI心理分析</h3>
                                        <p className="text-sm text-muted-foreground">AIによる深層心理鑑定</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">プレミアム</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* AI相性診断 */}
                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ai-compatibility")}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">AI相性診断</h3>
                                        <p className="text-sm text-muted-foreground">AIによる相性分析</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentPlan !== "premium" && <LockIcon className="h-4 w-4 text-muted-foreground" />}
                                        <Sparkles className="h-4 w-4 text-pink-600" />
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">プレミアム</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* アップグレード案内 */}
                                {currentPlan === "free" && (
                                  <Card className="md:col-span-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                                    <CardContent className="pt-6 text-center">
                                      <h3 className="font-semibold text-purple-800 mb-2">プレミアム機能をすべてお試しください</h3>
                                      <p className="text-sm text-purple-600 mb-4">3日間無料トライアルで全機能をご利用いただけます</p>
                                      <Button 
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                        onClick={() => handleStartTrial()}
                                      >
                                        無料で始める
                                      </Button>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* プレミアム機能のTabsContent（隠しタブとして保持） */}
                        <TabsContent value="ranking" style={{ display: activeTab === "ranking" ? "block" : "none" }}>
                          <NameRankingCard
                            lastName={lastName}
                            firstName={firstName}
                            gender={gender}
                            isPremium={currentPlan === "premium"}
                            premiumLevel={currentPlan === "premium" ? 3 : currentPlan === "basic" ? 1 : 0}
                          />
                        </TabsContent>

                        <TabsContent value="numerology" style={{ display: activeTab === "numerology" ? "block" : "none" }}>
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

                        <TabsContent value="fortune-flow" style={{ display: activeTab === "fortune-flow" ? "block" : "none" }}>
                          <FortuneFlowTable
                            starPerson={starPersonForFortuneFlow}
                            isPremium={currentPlan === "premium"}
                            key={forceUpdateKey}
                          />
                        </TabsContent>

                        {/* AI機能のTabsContent */}
                        <TabsContent value="ai-personality" style={{ display: activeTab === "ai-personality" ? "block" : "none" }}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                AI深層心理鑑定
                              </CardTitle>
                              <CardDescription>
                                AIがあなたの名前から深層心理を分析します
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8">
                                <div className="text-6xl mb-4">🤖</div>
                                <h3 className="text-xl font-semibold mb-2">AI深層心理鑑定</h3>
                                <p className="text-muted-foreground mb-6">
                                  OpenAI GPT-4を使用した高度な心理分析機能です
                                </p>
                                {currentPlan !== "premium" ? (
                                  <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                      <p className="text-purple-800">プレミアムプランでご利用いただけます</p>
                                    </div>
                                    <Button 
                                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                      onClick={() => handleStartTrial()}
                                    >
                                      3日間無料で始める
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => {
                                      // AI分析の実行処理（後で実装）
                                      alert("AI深層心理鑑定機能は準備中です")
                                    }}
                                  >
                                    AI分析を実行
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="ai-compatibility" style={{ display: activeTab === "ai-compatibility" ? "block" : "none" }}>
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-pink-600" />
                                AI相性診断
                              </CardTitle>
                              <CardDescription>
                                AIがあなたとパートナーの相性を分析します
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8">
                                <div className="text-6xl mb-4">💕</div>
                                <h3 className="text-xl font-semibold mb-2">AI相性診断</h3>
                                <p className="text-muted-foreground mb-6">
                                  OpenAI GPT-4を使用した高度な相性分析機能です
                                </p>
                                {currentPlan !== "premium" ? (
                                  <div className="space-y-4">
                                    <div className="p-4 bg-pink-50 rounded-lg">
                                      <p className="text-pink-800">プレミアムプランでご利用いただけます</p>
                                    </div>
                                    <Button 
                                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                      onClick={() => handleStartTrial()}
                                    >
                                      3日間無料で始める
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    className="bg-pink-600 hover:bg-pink-700 text-white"
                                    onClick={() => {
                                      // AI分析の実行処理（後で実装）
                                      alert("AI相性診断機能は準備中です")
                                    }}
                                  >
                                    AI分析を実行
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </Tabs>
                  ) : (
                    // 結果がない時の説明・お知らせ表示
                    <div className="space-y-6">
                      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-neutral-800 dark:border-neutral-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 dark:text-neutral-100">
                            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            このアプリについて
                          </CardTitle>
                          <CardDescription>
                            <span className="dark:text-gray-300">姓名判断・数秘術・六星占術を組み合わせた総合的な名前分析を行います</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2 dark:text-neutral-100">主要機能</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-300">
                              <li>✓ <strong>かんたん鑑定</strong>: 基本的な姓名判断結果を表示</li>
                              <li>✓ <strong>詳細鑑定</strong>: 天格・人格・地格・外格・総格の詳細分析</li>
                              <li>✓ <strong>総合分析</strong>: 六星占術・五行分析を含む高度な分析</li>
                              <li>✓ <strong>相性診断</strong>: パートナーとの相性を診断</li>
                              <li>✓ <strong>赤ちゃん名付け</strong>: 最適な名前候補をご提案</li>
                            </ul>
                          </div>
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2 dark:text-neutral-100">💡 使い方</h3>
                            <p className="text-sm text-muted-foreground dark:text-gray-300">
                              左側のフォームに「姓」と「名」を入力して「姓名判断を実行」ボタンをクリックしてください。
                              生年月日を入力すると、より詳細な分析結果が表示されます。
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:bg-neutral-800 dark:border-neutral-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 dark:text-neutral-100">
                            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            お知らせ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-3 bg-white/50 rounded-lg dark:bg-white/5">
                            <h4 className="font-semibold text-sm mb-1 dark:text-neutral-100">🎉 カナウポイントシステム開始！</h4>
                            <p className="text-xs text-muted-foreground dark:text-gray-300">
                              各種分析を実行するとKpを獲得できます。1日最大5Kpまで獲得可能です。
                              ログインボーナスも毎日受け取れます！
                            </p>
                          </div>
                          <div className="p-3 bg-white/50 rounded-lg dark:bg-white/5">
                            <h4 className="font-semibold text-sm mb-1 dark:text-neutral-100">📊 ランキング機能</h4>
                            <p className="text-xs text-muted-foreground dark:text-gray-300">
                              名前の格付けをランキングに登録して、季節ごとの順位を競いましょう。
                              プレミアム会員は5Kpでランキングに登録できます。
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                ) : companyResults ? (
                  <CompanyNameResult result={companyResults} companyName={companyName} />
                ) : (
                  // 会社名分析の説明
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        会社名鑑定について
                      </CardTitle>
                      <CardDescription>
                        会社名・商品名の姓名判断分析を行います
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">機能</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 会社名の格数分析</li>
                          <li>✓ 運勢判定（大吉・吉・凶など）</li>
                          <li>✓ 経営運勢の評価</li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          左側のフォームに会社名を入力して「会社名鑑定を実行」ボタンをクリックしてください。
                          「株式会社」「有限会社」などの法人格は除いて入力してください。
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
              myName={lastName && firstName ? { lastName, firstName } : undefined}
              myGender={gender}
              myBirthdate={birthdate ? new Date(birthdate) : undefined}
              isPremium={currentPlan !== "free"}
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
