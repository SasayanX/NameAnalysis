"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RokuseiSenseiCalculator } from "@/lib/rokuseisensei-calculator"
import { loadSixStarCSV, findSixStarFromCSV } from "@/lib/six-star-csv-loader"
import { calculateStarPersonFromBirthdate, calculateStarPersonFromCSV } from "@/lib/fortune-flow-calculator"

export default function Debug2000922Issue() {
  const [debugResults, setDebugResults] = useState<any[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [realTimeResult, setRealTimeResult] = useState<string>("")

  const testDate = new Date(2000, 8, 22) // 2000年9月22日

  const performRealTimeTest = () => {
    console.log("🔍 リアルタイム計算テスト開始")

    // 現在のサイトの実際の計算を実行
    const result = calculateStarPersonFromBirthdate(testDate)
    setRealTimeResult(result)

    console.log(`📊 現在のサイト結果: ${result}`)

    // 詳細な計算過程をログ出力
    const year = testDate.getFullYear()
    const month = testDate.getMonth() + 1
    const day = testDate.getDate()

    console.log(`📅 入力: ${year}年${month}月${day}日`)

    // 手動で正しい計算を実行
    console.log("🧮 正しい計算過程:")
    console.log("1. 運命数: 2000年9月 = 59")
    console.log("2. 星数: 59 - 1 + 22 = 80")
    console.log("3. 星数正規化: 80 - 60 = 20")
    console.log("4. 運命星: 20は11-20の範囲 → 金星")
    console.log("5. 陽陰: 2000年は庚辰年 → 辰は陽 → +")
    console.log("6. 結果: 金星人+")
  }

  const performDebug = async () => {
    setIsDebugging(true)
    setDebugResults([])

    const results: any[] = []

    try {
      // リアルタイムテストを実行
      performRealTimeTest()

      // 1. 現在のサイトの計算結果を確認
      const currentResult = calculateStarPersonFromBirthdate(testDate)
      results.push({
        method: "現在のサイト計算",
        title: "calculateStarPersonFromBirthdate",
        result: currentResult,
        description: "サイトで実際に使用されている計算",
        isCorrect: currentResult === "金星人+",
      })

      // 2. 手動で正しい計算を実行
      const correctCalculation = performCorrectCalculation()
      results.push({
        method: "正しい手動計算",
        title: "理論値計算",
        result: correctCalculation.result,
        steps: correctCalculation.steps,
        description: "理論に基づく正しい計算",
        isCorrect: true,
      })

      // 3. CSV優先計算を確認
      const csvResult = await calculateStarPersonFromCSV(testDate)
      results.push({
        method: "CSV優先計算",
        title: "calculateStarPersonFromCSV",
        result: csvResult.starType,
        confidence: csvResult.confidence,
        source: csvResult.source,
        description: "CSVデータを優先した計算",
        isCorrect: csvResult.starType === "金星人+",
      })

      // 4. 細木かおりの公式計算を確認
      try {
        const officialResult = await RokuseiSenseiCalculator.calculateRokuseiSenseiAsync(testDate)
        results.push({
          method: "細木かおりの公式計算",
          title: "RokuseiSenseiCalculator",
          result: officialResult.starType,
          confidence: officialResult.confidence,
          dataSource: officialResult.dataSource,
          details: officialResult.details,
          description: "細木かおりの公式サイト準拠計算",
          isCorrect: officialResult.starType === "金星人+",
        })
      } catch (error) {
        results.push({
          method: "細木かおりの公式計算",
          title: "RokuseiSenseiCalculator",
          result: `エラー: ${error}`,
          description: "細木かおりの公式サイト準拠計算（エラー）",
          isCorrect: false,
        })
      }

      // 5. CSVデータを直接確認
      const csvData = await loadSixStarCSV()
      const csvMatch = findSixStarFromCSV(csvData, testDate)
      results.push({
        method: "CSV直接検索",
        title: "CSVデータ直接確認",
        result: csvMatch ? `${csvMatch.star}人${csvMatch.type}` : "データなし",
        csvMatch: csvMatch,
        description: "CSVファイルから直接検索した結果",
        isCorrect: csvMatch ? `${csvMatch.star}人${csvMatch.type}` === "金星人+" : false,
      })

      // 6. 問題の原因分析
      const problemAnalysis = analyzeProblem(results)
      results.push({
        method: "問題分析",
        title: "なぜ木星人+が出るのか？",
        result: problemAnalysis.mainIssue,
        analysis: problemAnalysis.detailedAnalysis,
        recommendations: problemAnalysis.recommendations,
        description: "問題の根本原因と解決策",
      })

      setDebugResults(results)
    } catch (error) {
      console.error("デバッグエラー:", error)
      results.push({
        method: "エラー",
        title: "デバッグエラー",
        result: `エラー: ${error}`,
        description: "デバッグ中にエラーが発生",
        isCorrect: false,
      })
      setDebugResults(results)
    } finally {
      setIsDebugging(false)
    }
  }

  const performCorrectCalculation = () => {
    const steps: string[] = []

    // 正しい計算過程
    const year = 2000
    const month = 9
    const day = 22

    steps.push(`入力: ${year}年${month}月${day}日`)

    // 1. 運命数（2000年9月は59）
    const destinyNumber = 59
    steps.push(`運命数: ${year}年${month}月 = ${destinyNumber}`)

    // 2. 星数計算
    const rawStarNumber = destinyNumber - 1 + day
    steps.push(`星数計算: ${destinyNumber} - 1 + ${day} = ${rawStarNumber}`)

    // 3. 星数正規化
    const starNumber = rawStarNumber > 60 ? rawStarNumber - 60 : rawStarNumber
    if (rawStarNumber > 60) {
      steps.push(`星数正規化: ${rawStarNumber} - 60 = ${starNumber}`)
    }

    // 4. 運命星決定
    let destinyStar = ""
    if (starNumber >= 1 && starNumber <= 10) destinyStar = "土星"
    else if (starNumber >= 11 && starNumber <= 20) destinyStar = "金星"
    else if (starNumber >= 21 && starNumber <= 30) destinyStar = "火星"
    else if (starNumber >= 31 && starNumber <= 40) destinyStar = "天王星"
    else if (starNumber >= 41 && starNumber <= 50) destinyStar = "木星"
    else if (starNumber >= 51 && starNumber <= 60) destinyStar = "水星"

    steps.push(`運命星: 星数${starNumber} → ${destinyStar} (${getStarRange(starNumber)})`)

    // 5. 陽陰決定
    const zodiac = getZodiac(year)
    const polarity = getPolarity(zodiac)
    steps.push(`陽陰: ${year}年 = ${zodiac}年 → ${polarity}`)

    const result = `${destinyStar}人${polarity}`
    steps.push(`最終結果: ${result}`)

    return { result, steps }
  }

  const getStarRange = (starNumber: number): string => {
    if (starNumber >= 1 && starNumber <= 10) return "1-10"
    if (starNumber >= 11 && starNumber <= 20) return "11-20"
    if (starNumber >= 21 && starNumber <= 30) return "21-30"
    if (starNumber >= 31 && starNumber <= 40) return "31-40"
    if (starNumber >= 41 && starNumber <= 50) return "41-50"
    if (starNumber >= 51 && starNumber <= 60) return "51-60"
    return "範囲外"
  }

  const getZodiac = (year: number): string => {
    const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    const baseYear = 1924
    const zodiacIndex = (((year - baseYear) % 12) + 12) % 12
    return zodiacSigns[zodiacIndex]
  }

  const getPolarity = (zodiac: string): string => {
    const yangZodiacs = ["子", "寅", "辰", "午", "申", "戌"]
    return yangZodiacs.includes(zodiac) ? "+" : "-"
  }

  const analyzeProblem = (
    results: any[],
  ): {
    mainIssue: string
    detailedAnalysis: string[]
    recommendations: string[]
  } => {
    const analysis: string[] = []
    const recommendations: string[] = []

    // 現在のサイト結果を確認
    const siteResult = results.find((r) => r.method === "現在のサイト計算")
    if (siteResult && siteResult.result === "木星人+") {
      analysis.push("現在のサイトは「木星人+」を出力している")
      analysis.push("正しい結果は「金星人+」であるべき")
    }

    // 正しい計算との比較
    const correctResult = results.find((r) => r.method === "正しい手動計算")
    if (correctResult && correctResult.result === "金星人+") {
      analysis.push("理論計算では正しく「金星人+」が算出される")
    }

    // 問題の特定
    analysis.push("問題は calculateStarPersonFromBirthdate 関数内にある")
    analysis.push("運命数、星数計算、または運命星判定のいずれかが間違っている")

    recommendations.push("calculateStarPersonFromBirthdateSimple 関数を修正する")
    recommendations.push("2000年9月の運命数が正しく59になっているか確認")
    recommendations.push("星数計算 (59-1+22=80, 80-60=20) が正しく実行されているか確認")
    recommendations.push("運命星判定 (20→金星) が正しく実行されているか確認")

    return {
      mainIssue: "calculateStarPersonFromBirthdate関数が間違った結果を返している",
      detailedAnalysis: analysis,
      recommendations: recommendations,
    }
  }

  useEffect(() => {
    performDebug()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">2000年9月22日 計算結果調査（詳細版）</CardTitle>
          <CardDescription>なぜ「木星人+」が出続けるのか？根本原因を特定</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription>
              <strong>現在の問題:</strong> 2000年9月22日で「木星人+」が出力される（正しくは「金星人+」）
            </AlertDescription>
          </Alert>

          {realTimeResult && (
            <Alert className="mb-6 border-blue-500 bg-blue-50">
              <AlertDescription>
                <strong>リアルタイム結果:</strong>
                <span
                  className={
                    realTimeResult.includes("木星") ? "text-red-600 font-bold ml-2" : "text-green-600 font-bold ml-2"
                  }
                >
                  {realTimeResult}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {debugResults.map((result, index) => (
              <Card
                key={index}
                className={`border-l-4 ${result.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{result.method}</Badge>
                      {result.isCorrect !== undefined && (
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.isCorrect ? "正しい" : "間違い"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="font-mono text-lg font-bold">
                      結果:{" "}
                      <span
                        className={
                          result.result?.includes("木星")
                            ? "text-red-600"
                            : result.result?.includes("金星")
                              ? "text-green-600"
                              : "text-gray-600"
                        }
                      >
                        {result.result}
                      </span>
                    </div>
                  </div>

                  {result.confidence && (
                    <div className="mb-2">
                      <strong>信頼度:</strong> {result.confidence}
                    </div>
                  )}

                  {result.source && (
                    <div className="mb-2">
                      <strong>データソース:</strong> {result.source}
                    </div>
                  )}

                  {result.steps && (
                    <div className="mt-4">
                      <strong>計算ステップ:</strong>
                      <div className="bg-white p-3 rounded border mt-2">
                        {result.steps.map((step: string, i: number) => (
                          <div key={i} className="font-mono text-sm py-1">
                            {i + 1}. {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.analysis && (
                    <div className="mt-4">
                      <strong>詳細分析:</strong>
                      <div className="bg-white p-3 rounded border mt-2">
                        {result.analysis.map((item: string, i: number) => (
                          <div key={i} className="text-sm py-1">
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations && (
                    <div className="mt-4">
                      <strong>推奨修正:</strong>
                      <div className="bg-yellow-50 p-3 rounded border mt-2">
                        {result.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-sm py-1">
                            {i + 1}. {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.details && (
                    <div className="mt-4">
                      <strong>詳細情報:</strong>
                      <div className="bg-white p-3 rounded border mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <strong>運命数:</strong> {result.details.destinyNumber}
                          </div>
                          <div>
                            <strong>星数:</strong> {result.details.starNumber}
                          </div>
                          <div>
                            <strong>運命星:</strong> {result.details.destinyStar}
                          </div>
                          <div>
                            <strong>陽陰:</strong> {result.details.plusMinus}
                          </div>
                          <div>
                            <strong>干支:</strong> {result.details.zodiac}
                          </div>
                          <div>
                            <strong>十干:</strong> {result.details.tenStems}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.csvMatch && (
                    <div className="mt-4">
                      <strong>CSVマッチ:</strong>
                      <div className="bg-white p-3 rounded border mt-2 font-mono text-sm">
                        年: {result.csvMatch.year}, 月: {result.csvMatch.month}, 日: {result.csvMatch.day}
                        <br />
                        運命数: {result.csvMatch.destinyNumber}
                        <br />
                        星: {result.csvMatch.star}, タイプ: {result.csvMatch.type}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex gap-2">
            <Button onClick={performDebug} disabled={isDebugging} className="flex-1">
              {isDebugging ? "調査中..." : "再調査"}
            </Button>
            <Button onClick={performRealTimeTest} variant="outline">
              リアルタイムテスト
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
