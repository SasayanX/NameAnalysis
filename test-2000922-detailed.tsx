"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RokuseiSenseiCalculator } from "@/lib/rokuseisensei-calculator"
import { loadSixStarCSV } from "@/lib/six-star-csv-loader"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Test2000922Detailed() {
  const [calculationSteps, setCalculationSteps] = useState<any[]>([])
  const [finalResult, setFinalResult] = useState<string>("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [csvData, setCsvData] = useState<any[]>([])

  const testDate = new Date(2000, 8, 22) // 2000年9月22日

  const performCalculation = async () => {
    setIsCalculating(true)
    setCalculationSteps([])

    const steps: any[] = []

    try {
      // ステップ0: 入力確認
      steps.push({
        step: 0,
        title: "入力データ確認",
        description: "生年月日: 2000年9月22日",
        details: {
          year: 2000,
          month: 9,
          day: 22,
          note: "立春調整は不要（9月生まれ）",
        },
        status: "completed",
      })
      setCalculationSteps([...steps])
      await sleep(1000)

      // ステップ1: CSVデータ読み込み
      steps.push({
        step: 1,
        title: "【1】運命数を取得",
        description: "CSVデータから2000年9月の運命数を検索",
        status: "processing",
      })
      setCalculationSteps([...steps])

      const csvDataLoaded = await loadSixStarCSV()
      setCsvData(csvDataLoaded)

      // 2000年9月のデータを検索
      const year2000Data = csvDataLoaded.filter((d) => d.year === 2000)
      const month9Data = csvDataLoaded.filter((d) => d.year === 2000 && d.month === 9)

      console.log("2000年のデータ件数:", year2000Data.length)
      console.log("2000年9月のデータ件数:", month9Data.length)
      console.log("2000年9月のサンプル:", month9Data.slice(0, 3))

      let destinyNumber = 0
      let dataSource = "calculation"

      if (month9Data.length > 0) {
        destinyNumber = month9Data[0].destinyNumber
        dataSource = "csv"
      } else {
        // フォールバック計算
        destinyNumber = 59 // 2000年9月の正しい運命数
        dataSource = "fallback"
      }

      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        status: "completed",
        result: destinyNumber,
        details: {
          searchResult: month9Data.length > 0 ? "CSV発見" : "CSV未発見",
          destinyNumber: destinyNumber,
          dataSource: dataSource,
          csvMatches: month9Data.length,
          note: dataSource === "csv" ? "CSVから正確な値を取得" : "既知の正しい値を使用",
        },
      }
      setCalculationSteps([...steps])
      await sleep(1000)

      // ステップ2: 星数計算
      steps.push({
        step: 2,
        title: "【2】星数を計算",
        description: "運命数 - 1 + 生まれ日 = 星数",
        status: "processing",
      })
      setCalculationSteps([...steps])

      const starNumber = RokuseiSenseiCalculator.calculateStarNumber(destinyNumber, 22)
      const rawStarNumber = destinyNumber - 1 + 22

      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        status: "completed",
        result: starNumber,
        details: {
          calculation: `${destinyNumber} - 1 + 22 = ${rawStarNumber}`,
          rawResult: rawStarNumber,
          finalResult: starNumber,
          normalization: rawStarNumber > 60 ? `${rawStarNumber - 60} = ${starNumber}` : "正規化不要",
        },
      }
      setCalculationSteps([...steps])
      await sleep(1000)

      // ステップ3: 運命星決定
      steps.push({
        step: 3,
        title: "【3】運命星を決定",
        description: "星数の範囲から運命星を判定",
        status: "processing",
      })
      setCalculationSteps([...steps])

      const destinyStar = RokuseiSenseiCalculator.determineDestinyStar(starNumber)
      const starRange = getStarRange(starNumber)

      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        status: "completed",
        result: destinyStar,
        details: {
          starNumber: starNumber,
          range: starRange,
          destinyStar: destinyStar,
          rangeTable: "1-10:土星, 11-20:金星, 21-30:火星, 31-40:天王星, 41-50:木星, 51-60:水星",
        },
      }
      setCalculationSteps([...steps])
      await sleep(1000)

      // ステップ4: 陽陰決定
      steps.push({
        step: 4,
        title: "【4】陽陰を決定",
        description: "生まれ年の干支から陽陰を判定",
        status: "processing",
      })
      setCalculationSteps([...steps])

      const plusMinus = RokuseiSenseiCalculator.determinePlusMinus(2000)
      const zodiac = RokuseiSenseiCalculator.getZodiac(2000)
      const tenStems = RokuseiSenseiCalculator.getTenStems(2000)

      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        status: "completed",
        result: plusMinus,
        details: {
          year: 2000,
          zodiac: zodiac,
          tenStems: tenStems,
          fullZodiac: `${tenStems}${zodiac}`,
          polarity: plusMinus === "+" ? "陽" : "陰",
          rule: "陽: 子寅辰午申戌 / 陰: 丑卯巳未酉亥",
        },
      }
      setCalculationSteps([...steps])
      await sleep(1000)

      // 最終結果
      const finalStarType = `${destinyStar}人${plusMinus}`
      setFinalResult(finalStarType)

      steps.push({
        step: 5,
        title: "【最終結果】",
        description: "運命星 + 陽陰 = 星人タイプ",
        status: "completed",
        result: finalStarType,
        details: {
          destinyStar: destinyStar,
          polarity: plusMinus,
          finalResult: finalStarType,
          confidence: dataSource === "csv" ? "高" : "中",
          dataSource: dataSource,
        },
      })
      setCalculationSteps([...steps])
    } catch (error) {
      console.error("計算エラー:", error)
      steps.push({
        step: -1,
        title: "エラー",
        description: `計算中にエラーが発生しました: ${error}`,
        status: "error",
      })
      setCalculationSteps([...steps])
    } finally {
      setIsCalculating(false)
    }
  }

  const getStarRange = (starNumber: number): string => {
    if (starNumber >= 1 && starNumber <= 10) return "1-10 (土星)"
    if (starNumber >= 11 && starNumber <= 20) return "11-20 (金星)"
    if (starNumber >= 21 && starNumber <= 30) return "21-30 (火星)"
    if (starNumber >= 31 && starNumber <= 40) return "31-40 (天王星)"
    if (starNumber >= 41 && starNumber <= 50) return "41-50 (木星)"
    if (starNumber >= 51 && starNumber <= 60) return "51-60 (水星)"
    return "範囲外"
  }

  useEffect(() => {
    performCalculation()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">2000年9月22日 星人タイプ計算</CardTitle>
          <CardDescription>細木かおりの六星占術による詳細計算過程</CardDescription>
        </CardHeader>
        <CardContent>
          {finalResult && (
            <Alert className="mb-6 border-green-500">
              <AlertDescription>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">{finalResult}</div>
                  <div className="text-sm text-muted-foreground">2000年9月22日生まれの星人タイプ</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {calculationSteps.map((step, index) => (
              <Card
                key={index}
                className={`transition-all duration-500 ${
                  step.status === "completed"
                    ? "border-green-500 bg-green-50"
                    : step.status === "processing"
                      ? "border-blue-500 bg-blue-50"
                      : step.status === "error"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <Badge
                      variant={
                        step.status === "completed"
                          ? "default"
                          : step.status === "processing"
                            ? "secondary"
                            : step.status === "error"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {step.status === "completed"
                        ? "完了"
                        : step.status === "processing"
                          ? "処理中"
                          : step.status === "error"
                            ? "エラー"
                            : "待機"}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">{step.description}</div>

                  {step.result !== undefined && (
                    <div className="bg-white p-3 rounded border">
                      <div className="font-mono text-lg font-bold text-center">結果: {step.result}</div>
                    </div>
                  )}

                  {step.details && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(step.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                          </span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex gap-2">
            <Button onClick={performCalculation} disabled={isCalculating} className="flex-1">
              {isCalculating ? "計算中..." : "再計算"}
            </Button>
          </div>

          {csvData.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">CSVデータ情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>総データ数:</strong> {csvData.length.toLocaleString()}件
                  </div>
                  <div>
                    <strong>2000年データ:</strong> {csvData.filter((d) => d.year === 2000).length}件
                  </div>
                  <div>
                    <strong>2000年9月データ:</strong> {csvData.filter((d) => d.year === 2000 && d.month === 9).length}件
                  </div>
                  <div>
                    <strong>データ範囲:</strong> {Math.min(...csvData.map((d) => d.year))} -{" "}
                    {Math.max(...csvData.map((d) => d.year))}年
                  </div>
                </div>

                {csvData.filter((d) => d.year === 2000 && d.month === 9).length > 0 && (
                  <div className="mt-4">
                    <strong>2000年9月のサンプルデータ:</strong>
                    <div className="mt-2 bg-muted p-3 rounded font-mono text-xs">
                      {csvData
                        .filter((d) => d.year === 2000 && d.month === 9)
                        .slice(0, 3)
                        .map((d, i) => (
                          <div key={i}>
                            {d.year}/{d.month}/{d.day} → 運命数{d.destinyNumber} → {d.star}人{d.type}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
