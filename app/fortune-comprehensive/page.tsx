"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Star, TrendingUp, Heart, Briefcase, Crown } from "lucide-react"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { SixStarChart } from "@/components/six-star-chart"
import { AdvancedFiveElementsChart } from "@/components/advanced-five-elements-chart"
import { useUserPreferences } from "@/contexts/user-preferences-context"
import Link from "next/link"

export default function FortuneComprehensivePage() {
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [birthdateString, setBirthdateString] = useState("")
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sixStarResult, setSixStarResult] = useState<any>(null)
  const [gogyoResult, setGogyoResult] = useState<any>(null)

  const { getCurrentPlan } = useUserPreferences()
  const currentPlan = getCurrentPlan()

  // 生年月日の処理
  const handleBirthdateChange = (dateString: string) => {
    setBirthdateString(dateString)

    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        setBirthdate(date)
      } else {
        setBirthdate(null)
      }
    } catch (error) {
      console.error("Error parsing date:", error)
      setBirthdate(null)
    }
  }

  const handleAnalyze = async () => {
    if (!birthdate) {
      alert("生年月日を入力してください。")
      return
    }

    if (currentPlan === "free") {
      alert("総合運気表はベーシックプラン以上でご利用いただけます。")
      return
    }

    setIsAnalyzing(true)
    setSixStarResult(null)
    setGogyoResult(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 六星占術の計算
      const sixStarData = await calculateSixStarFromCSV(birthdate)
      setSixStarResult(sixStarData)

      // 五行分析の計算（名前がある場合）
      if (lastName && firstName) {
        const gogyoData = calculateGogyo(lastName, firstName, birthdate)
        setGogyoResult(gogyoData)
      }
    } catch (error) {
      console.error("分析エラー:", error)
      alert("分析中にエラーが発生しました。")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setBirthdate(null)
    setBirthdateString("")
    setLastName("")
    setFirstName("")
    setSixStarResult(null)
    setGogyoResult(null)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            総合運気表
          </h1>
          <p className="text-gray-600">生年月日から六星占術と五行分析による詳細な運勢診断を行います</p>
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
              <p className="text-sm text-gray-600">
                {currentPlan === "free"
                  ? "総合運気表はベーシックプラン以上でご利用いただけます"
                  : "総合運気表をご利用いただけます"}
              </p>
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
              <Calendar className="h-5 w-5" />
              基本情報入力
            </CardTitle>
            <CardDescription>生年月日は必須です。お名前を入力すると、より詳細な分析が可能です。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 生年月日入力 - 最初から表示 */}
            <div className="space-y-2">
              <Label htmlFor="birthdate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                生年月日（必須）
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdateString}
                onChange={(e) => handleBirthdateChange(e.target.value)}
                className="text-lg"
                disabled={currentPlan === "free"}
              />
              <p className="text-sm text-gray-600">六星占術による本命星と運勢の流れを分析します</p>
            </div>

            {/* 名前入力（任意） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">姓（任意）</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="例: 田中"
                  className="text-lg"
                  disabled={currentPlan === "free"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">名（任意）</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="例: 太郎"
                  className="text-lg"
                  disabled={currentPlan === "free"}
                />
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>総合運気表の特徴</strong>
                <br />• 六星占術による本命星と年運の詳細分析
                <br />• 五行バランスによる健康・恋愛・仕事運の総合診断
                <br />• 月別・年別の運勢の流れと開運アドバイス
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !birthdate || currentPlan === "free"}
                className="flex-1"
                size="lg"
              >
                {isAnalyzing
                  ? "分析中..."
                  : currentPlan === "free"
                    ? "ベーシックプラン以上で利用可能"
                    : "総合運気を分析する"}
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                クリア
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 分析結果表示 */}
        {sixStarResult && (
          <div className="space-y-6">
            {/* 六星占術結果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">⭐ 六星占術</CardTitle>
                <CardDescription>生年月日から導き出される本命星と運勢の流れ</CardDescription>
              </CardHeader>
              <CardContent>
                <SixStarChart sixStarData={sixStarResult} />
              </CardContent>
            </Card>

            {/* 五行分析結果（名前入力時） */}
            {gogyoResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🌟 五行分析</CardTitle>
                  <CardDescription>名前の画数から導き出される五行（木・火・土・金・水）のバランス分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedFiveElementsChart
                    elements={(() => {
                      // グラフの実際の値から最大値と最小値を計算
                      const elementArray = [
                        { element: "木" as const, count: gogyoResult.elements.wood },
                        { element: "火" as const, count: gogyoResult.elements.fire },
                        { element: "土" as const, count: gogyoResult.elements.earth },
                        { element: "金" as const, count: gogyoResult.elements.metal },
                        { element: "水" as const, count: gogyoResult.elements.water },
                      ]
                      elementArray.sort((a, b) => b.count - a.count)
                      const actualDominantElement = elementArray[0].element
                      const actualWeakElement = elementArray[elementArray.length - 1].element
                      
                      return {
                        woodCount: gogyoResult.elements.wood,
                        fireCount: gogyoResult.elements.fire,
                        earthCount: gogyoResult.elements.earth,
                        metalCount: gogyoResult.elements.metal,
                        waterCount: gogyoResult.elements.water,
                        dominantElement: actualDominantElement,
                        weakElement: actualWeakElement,
                      }
                    })()}
                    healthAdvice={(() => {
                      // グラフの実際の値から最大値と最小値を計算
                      const elementArray = [
                        { element: "木" as const, count: gogyoResult.elements.wood },
                        { element: "火" as const, count: gogyoResult.elements.fire },
                        { element: "土" as const, count: gogyoResult.elements.earth },
                        { element: "金" as const, count: gogyoResult.elements.metal },
                        { element: "水" as const, count: gogyoResult.elements.water },
                      ]
                      elementArray.sort((a, b) => b.count - a.count)
                      const actualDominantElement = elementArray[0].element
                      const actualWeakElement = elementArray[elementArray.length - 1].element
                      
                      return {
                        generalAdvice: `あなたは${actualDominantElement}の気が強く、${actualWeakElement}の気が弱い傾向があります。`,
                        weeklyHealthForecast: [],
                        balanceAdvice: `バランスを整えるには、${actualWeakElement}の気を高める活動を取り入れると良いでしょう。`,
                      }
                    })()}
                  />
                </CardContent>
              </Card>
            )}

            {/* 総合アドバイス */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  総合アドバイス
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      恋愛運
                    </h4>
                    <p className="text-sm text-red-700">
                      {sixStarResult?.fortune?.love || "良好な時期です。積極的な行動が吉。"}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      仕事運
                    </h4>
                    <p className="text-sm text-blue-700">
                      {sixStarResult?.fortune?.work || "新しいチャレンジに適した時期です。"}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      金運
                    </h4>
                    <p className="text-sm text-green-700">
                      {sixStarResult?.fortune?.money || "堅実な投資や貯蓄を心がけましょう。"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
