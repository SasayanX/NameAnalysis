"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, User, Building2, Baby, Crown, Lock, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeNameFortune } from "@/lib/name-data-simple-fixed"
import { analyzeCompanyName } from "@/lib/company-name-analyzer"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { useUserPreferences } from "@/contexts/user-preferences-context"
import { NameAnalysisResult } from "@/components/name-analysis-result"
import { CompanyNameResult } from "@/components/company-name-result"
import { SimpleAnalysisResult } from "@/components/simple-analysis-result"
import { VerticalNameDisplay } from "@/components/vertical-name-display"
import { BabyNamingTool } from "@/components/baby-naming-tool"
import { UsageLimitModal } from "@/components/usage-limit-modal"
import { TrialBanner } from "@/components/trial-banner"
import { checkUsageLimit, getUpgradeMessage } from "@/lib/usage-limits"
import { AdvancedFiveElementsChart } from "@/components/advanced-five-elements-chart"
import { SixStarChart } from "@/components/six-star-chart"
import { SixStarTest } from "@/components/six-star-test"
import Link from "next/link"

export function NameAnalyzer() {
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [gender, setGender] = useState("male")
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [birthdateString, setBirthdateString] = useState("")
  const [analysisType, setAnalysisType] = useState<"person" | "company" | "baby">("person")
  const [result, setResult] = useState<any>(null)
  const [companyResult, setCompanyResult] = useState<any>(null)
  const [advancedResults, setAdvancedResults] = useState<any>(null)
  const [sixStarResult, setSixStarResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showUsageModal, setShowUsageModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")

  const { fortuneData } = useFortuneData()
  const {
    preferences,
    incrementUsage,
    canPerformAnalysis,
    getRemainingAnalyses,
    isTrialActive,
    getTrialDaysRemaining,
    getCurrentPlan,
    getTodayUsage,
  } = useUserPreferences()

  // 生年月日の処理
  const handleBirthdateChange = (dateString: string) => {
    setBirthdateString(dateString)
    console.log("生年月日入力:", dateString)

    try {
      if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString + "T00:00:00")
        if (!isNaN(date.getTime())) {
          setBirthdate(date)
          console.log("生年月日が正常に設定されました:", date)
          console.log("年:", date.getFullYear(), "月:", date.getMonth() + 1, "日:", date.getDate())
        } else {
          setBirthdate(null)
          console.log("無効な日付です")
        }
      } else {
        setBirthdate(null)
        console.log("日付がクリアされました")
      }
    } catch (error) {
      console.error("日付解析エラー:", error)
      setBirthdate(null)
    }
  }

  // 使用制限チェック（修正版）
  const checkFeatureUsage = (feature: "personalAnalysis" | "companyAnalysis") => {
    const currentPlan = getCurrentPlan()
    const todayUsage = getTodayUsage()

    if (!todayUsage) {
      // 使用状況が取得できない場合は許可
      return true
    }

    const currentUsage = feature === "personalAnalysis" ? todayUsage.personalAnalysis : todayUsage.companyAnalysis

    const usageCheck = checkUsageLimit(currentPlan, feature, currentUsage)

    if (!usageCheck.allowed) {
      const message = getUpgradeMessage(feature, currentPlan)
      setUpgradeMessage(message)
      setShowUpgradeModal(true)
      return false
    }
    return true
  }

  const handleAnalyze = async () => {
    console.log("=== 分析開始 ===")
    console.log("分析タイプ:", analysisType)
    console.log("姓:", lastName)
    console.log("名:", firstName)
    console.log("生年月日:", birthdate)
    console.log("生年月日文字列:", birthdateString)

    // 基本的な入力チェック
    if (analysisType === "person" && (!lastName.trim() || !firstName.trim())) {
      alert("姓と名の両方を入力してください。")
      return
    }

    if (analysisType === "company" && !companyName.trim()) {
      alert("会社名を入力してください。")
      return
    }

    // 使用制限チェック
    const featureType = analysisType === "person" ? "personalAnalysis" : "companyAnalysis"
    if (!checkFeatureUsage(featureType)) {
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    setCompanyResult(null)
    setAdvancedResults(null)
    setSixStarResult(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (analysisType === "person") {
        console.log("🔍 name-analyzer: 姓名判断開始: 姓=" + lastName + ", 名=" + firstName + ", 性別=" + gender)
        console.log("🔍 name-analyzer: fortuneData提供状況:", !!fortuneData)
        if (fortuneData) {
            console.log("🔍 name-analyzer: fortuneData件数:", Object.keys(fortuneData).length)
        }
        const analysisResult = analyzeNameFortune(lastName, firstName, gender, fortuneData)
        console.log("🔍 name-analyzer: 分析結果取得完了")
        setResult(analysisResult)

        // 生年月日が入力されている場合は詳細分析を実行
        if (birthdate) {
          console.log("🎯 生年月日が設定されています - 詳細分析を開始")
          console.log("生年月日詳細:", {
            date: birthdate,
            year: birthdate.getFullYear(),
            month: birthdate.getMonth() + 1,
            day: birthdate.getDate(),
            iso: birthdate.toISOString(),
          })

          try {
            // 六星占術の計算
            console.log("🌟 六星占術計算を開始します...")
            const sixStarData = await calculateSixStarFromCSV(birthdate)
            console.log("✅ 六星占術計算完了:", sixStarData)
            setSixStarResult(sixStarData)

            // 五行分析の計算
            console.log("🌿 五行分析を開始します...")
            const gogyoResult = calculateGogyo(lastName, firstName, birthdate)
            console.log("✅ 五行分析完了:", gogyoResult)

            const advancedData = {
              hasBirthdate: true,
              sixStar: sixStarData,
              fiveElements: {
                elements: {
                  woodCount: gogyoResult.elements.wood,
                  fireCount: gogyoResult.elements.fire,
                  earthCount: gogyoResult.elements.earth,
                  metalCount: gogyoResult.elements.metal,
                  waterCount: gogyoResult.elements.water,
                  dominantElement: gogyoResult.dominantElement,
                  weakElement: gogyoResult.weakElement,
                },
                healthAdvice: {
                  generalAdvice: `あなたは${gogyoResult.dominantElement}の気が強く、${gogyoResult.weakElement}の気が弱い傾向があります。`,
                  weeklyHealthForecast: [],
                  balanceAdvice: `バランスを整えるには、${gogyoResult.weakElement}の気を高める活動を取り入れると良いでしょう。`,
                },
              },
              gogyoResult,
            }
            setAdvancedResults(advancedData)
            console.log("✅ 詳細分析データ設定完了")
          } catch (sixStarError) {
            console.error("❌ 六星占術計算エラー:", sixStarError)
            // 六星占術でエラーが発生しても、基本的な五行分析は実行
            const gogyoResult = calculateGogyo(lastName, firstName)
            const advancedData = {
              hasBirthdate: false,
              fiveElements: {
                elements: {
                  woodCount: gogyoResult.elements.wood,
                  fireCount: gogyoResult.elements.fire,
                  earthCount: gogyoResult.elements.earth,
                  metalCount: gogyoResult.elements.metal,
                  waterCount: gogyoResult.elements.water,
                  dominantElement: gogyoResult.dominantElement,
                  weakElement: gogyoResult.weakElement,
                },
                healthAdvice: {
                  generalAdvice: `あなたは${gogyoResult.dominantElement}の気が強く、${gogyoResult.weakElement}の気が弱い傾向があります。`,
                  weeklyHealthForecast: [],
                  balanceAdvice: `バランスを整えるには、${gogyoResult.weakElement}の気を高める活動を取り入れると良いでしょう。`,
                },
              },
              gogyoResult,
            }
            setAdvancedResults(advancedData)
          }
        } else {
          // 生年月日なしの場合は基本的な五行分析のみ
          console.log("📅 生年月日なし - 基本五行分析のみ実行")
          const gogyoResult = calculateGogyo(lastName, firstName)
          const advancedData = {
            hasBirthdate: false,
            fiveElements: {
              elements: {
                woodCount: gogyoResult.elements.wood,
                fireCount: gogyoResult.elements.fire,
                earthCount: gogyoResult.elements.earth,
                metalCount: gogyoResult.elements.metal,
                waterCount: gogyoResult.elements.water,
                dominantElement: gogyoResult.dominantElement,
                weakElement: gogyoResult.weakElement,
              },
              healthAdvice: {
                generalAdvice: `あなたは${gogyoResult.dominantElement}の気が強く、${gogyoResult.weakElement}の気が弱い傾向があります。`,
                weeklyHealthForecast: [],
                balanceAdvice: `バランスを整えるには、${gogyoResult.weakElement}の気を高める活動を取り入れると良いでしょう。`,
              },
            },
            gogyoResult,
          }
          setAdvancedResults(advancedData)
        }

        // 使用回数を増加（分析成功後）
        incrementUsage()
      } else if (analysisType === "company") {
        console.log("会社名分析開始: " + companyName)
        const companyAnalysisResult = analyzeCompanyName(companyName, fortuneData)
        setCompanyResult(companyAnalysisResult)

        // 使用回数を増加（分析成功後）
        incrementUsage()
      }
    } catch (error) {
      console.error("分析エラー:", error)
      alert("分析中にエラーが発生しました。")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setLastName("")
    setFirstName("")
    setCompanyName("")
    setBirthdate(null)
    setBirthdateString("")
    setResult(null)
    setCompanyResult(null)
    setAdvancedResults(null)
    setSixStarResult(null)
  }

  const remainingAnalyses = getRemainingAnalyses()
  const trialDaysRemaining = getTrialDaysRemaining()
  const currentPlan = getCurrentPlan()
  const todayUsage = getTodayUsage() || { personalAnalysis: 0, companyAnalysis: 0 }

  // 使用状況表示（修正版）
  const getUsageStatus = () => {
    if (analysisType === "person") {
      const usageCheck = checkUsageLimit(currentPlan, "personalAnalysis", todayUsage.personalAnalysis || 0)
      return {
        current: todayUsage.personalAnalysis || 0,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining,
        allowed: usageCheck.allowed,
      }
    } else if (analysisType === "company") {
      const usageCheck = checkUsageLimit(currentPlan, "companyAnalysis", todayUsage.companyAnalysis || 0)
      return {
        current: todayUsage.companyAnalysis || 0,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining,
        allowed: usageCheck.allowed,
      }
    }
    return { current: 0, limit: -1, remaining: -1, allowed: true }
  }

  const usageStatus = getUsageStatus()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isTrialActive() && <TrialBanner daysRemaining={trialDaysRemaining} remainingAnalyses={remainingAnalyses} />}

      {/* デバッグ用六星占術テスト */}
      <div className="mb-6">
        <SixStarTest />
      </div>

      {/* プラン表示 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">
              現在のプラン:{" "}
              {currentPlan === "free"
                ? "無料プラン"
                : currentPlan === "basic"
                  ? "ベーシックプラン"
                  : "プレミアムプラン"}
            </h3>
            {analysisType !== "baby" && (
              <p className="text-sm text-gray-600">
                {analysisType === "person" ? "個人名分析" : "会社名分析"}:
                {usageStatus.limit === -1 ? "無制限" : `${usageStatus.current}/${usageStatus.limit}回`}
                {usageStatus.limit !== -1 && ` (残り${usageStatus.remaining}回)`}
              </p>
            )}
          </div>
          {currentPlan === "free" && (
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Crown className="h-4 w-4 mr-2" />
                アップグレード
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            姓名判断・会社名分析・赤ちゃん名付け
          </CardTitle>
          <CardDescription>
            お名前や会社名の画数から運勢を詳しく分析、または赤ちゃんの名付けをサポートします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as "person" | "company" | "baby")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="person" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                個人名分析
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                会社名・商品名
              </TabsTrigger>
              <TabsTrigger value="baby" className="flex items-center gap-2">
                <Baby className="h-4 w-4" />
                赤ちゃん名付け
              </TabsTrigger>
            </TabsList>

            {/* 個人名分析タブ */}
            <TabsContent value="person" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">姓（苗字）</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="例: 田中"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">名（下の名前）</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="例: 太郎"
                    className="text-lg"
                  />
                </div>
              </div>

              {/* 生年月日入力 - 常に表示 */}
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  生年月日（任意）
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdateString}
                  onChange={(e) => handleBirthdateChange(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-600">
                  生年月日を入力すると、六星占術と五行分析による詳細な運勢診断が可能です
                </p>
                {birthdate && (
                  <p className="text-xs text-green-600">
                    ✅ 生年月日設定済み: {birthdate.getFullYear()}年{birthdate.getMonth() + 1}月{birthdate.getDate()}日
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>性別</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
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

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !usageStatus.allowed}
                  className="flex-1"
                  size="lg"
                >
                  {isAnalyzing ? (
                    "分析中..."
                  ) : !usageStatus.allowed ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      制限に達しました
                    </>
                  ) : (
                    "個人名を分析する"
                  )}
                </Button>
                <Button onClick={handleClear} variant="outline" size="lg">
                  クリア
                </Button>
              </div>

              {/* 制限警告 */}
              {!usageStatus.allowed && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    個人名分析の回数制限に達しました。
                    {currentPlan === "free" ? "ベーシックプラン（220円/月）" : "プレミアムプラン（440円/月）"}
                    で無制限利用できます。
                  </AlertDescription>
                </Alert>
              )}

              {usageStatus.allowed && usageStatus.remaining <= 1 && usageStatus.limit !== -1 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    残り{usageStatus.remaining}回の分析が可能です。
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* 会社名・商品名分析タブ */}
            <TabsContent value="company" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">会社名・ブランド名・商品名</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="例: 株式会社サンプル、iPhone、トヨタ"
                  className="text-lg"
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>会社名・商品名・ブランド名の画数占い</strong>
                  <br />
                  ビジネスの成功運、商品の売れ行き、ブランドの発展性を画数から分析します。
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !usageStatus.allowed}
                  className="flex-1"
                  size="lg"
                >
                  {isAnalyzing ? (
                    "分析中..."
                  ) : !usageStatus.allowed ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      制限に達しました
                    </>
                  ) : (
                    "会社名・商品名を分析する"
                  )}
                </Button>
                <Button onClick={handleClear} variant="outline" size="lg">
                  クリア
                </Button>
              </div>

              {/* 制限警告 */}
              {!usageStatus.allowed && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    会社名分析の回数制限に達しました。
                    {currentPlan === "free" ? "ベーシックプラン（220円/月）" : "プレミアムプラン（440円/月）"}
                    で無制限利用できます。
                  </AlertDescription>
                </Alert>
              )}

              {usageStatus.allowed && usageStatus.remaining <= 1 && usageStatus.limit !== -1 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    残り{usageStatus.remaining}回の分析が可能です。
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* 赤ちゃん名付けタブ */}
            <TabsContent value="baby" className="space-y-4">
              <Alert className="border-pink-200 bg-pink-50">
                <Baby className="h-4 w-4 text-pink-600" />
                <AlertDescription className="text-pink-800">
                  <strong>赤ちゃん名付けツール</strong>
                  <br />
                  豊富な名前候補から、姓名判断で凶数を完全に排除した最適な名前をご提案します。
                </AlertDescription>
              </Alert>

              {/* 赤ちゃん名付けツールを埋め込み */}
              <BabyNamingTool />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 個人名分析の結果表示 */}
      {result && analysisType === "person" && (
        <div className="space-y-6">
          <VerticalNameDisplay lastName={lastName} firstName={firstName} result={result} />
          <SimpleAnalysisResult result={result} name={`${lastName} ${firstName}`} />
          <NameAnalysisResult
            results={result}
            name={`${lastName} ${firstName}`}
            gender={gender}
            currentPlan={currentPlan}
          />

          {/* 詳細分析結果（生年月日入力時） */}
          {advancedResults && currentPlan !== "free" && (
            <div className="space-y-6">
              {/* 五行分析チャート */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🌟 五行分析</CardTitle>
                  <CardDescription>名前の画数から導き出される五行（木・火・土・金・水）のバランス分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedFiveElementsChart
                    elements={advancedResults.fiveElements.elements}
                    healthAdvice={advancedResults.fiveElements.healthAdvice}
                  />
                </CardContent>
              </Card>

              {/* 六星占術結果（生年月日入力時のみ） */}
              {advancedResults.hasBirthdate && sixStarResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">⭐ 六星占術</CardTitle>
                    <CardDescription>生年月日から導き出される本命星と運勢の流れ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SixStarChart sixStarData={sixStarResult} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* 会社名分析の結果表示 */}
      {companyResult && analysisType === "company" && (
        <CompanyNameResult result={companyResult} companyName={companyName} />
      )}

      <UsageLimitModal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} />

      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-amber-800">使用制限に達しました</h3>
              <p
                className="text-amber-700"
                dangerouslySetInnerHTML={{ __html: upgradeMessage.replace(/🔒|💎|👶|📄|💾|🚀/g, "") }}
              />
              <div className="flex space-x-3 mt-6">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    プランを見る
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
