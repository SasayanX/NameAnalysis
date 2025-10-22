"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RokuseiSenseiCalculator } from "@/lib/rokuseisensei-calculator"

export default function Test2000922Calculation() {
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const testDate = new Date(2000, 8, 22) // 2000年9月22日

  const calculateStep = async () => {
    setIsAnimating(true)
    setIsLoading(true)

    try {
      // CSV優先の詳細計算を実行
      const calculation = await RokuseiSenseiCalculator.debugCalculationAsync(testDate)

      // 運命数表から直接確認
      const destinyNumber = await RokuseiSenseiCalculator.calculateDestinyNumber(2000, 9)
      const starNumber = RokuseiSenseiCalculator.calculateStarNumber(destinyNumber, 22)
      const destinyStar = RokuseiSenseiCalculator.determineDestinyStar(starNumber)
      const plusMinus = RokuseiSenseiCalculator.determinePlusMinus(2000)
      const zodiac = RokuseiSenseiCalculator.getZodiac(2000)
      const tenStems = RokuseiSenseiCalculator.getTenStems(2000)

      setResult({
        ...calculation,
        stepByStep: {
          input: "2000年9月22日",
          step1: {
            title: "【1】運命数を出す",
            description: `${calculation.dataSource === "csv" ? "CSVデータ" : calculation.dataSource === "fallback" ? "フォールバック表" : "計算推定"}から2000年9月の値を取得`,
            calculation: calculation.dataSource === "csv" ? "CSV[2000][9]" : "計算による推定",
            result: destinyNumber,
            details: `2000年9月 → ${destinyNumber}`,
            dataSource: calculation.dataSource,
            confidence: calculation.confidence,
          },
          step2: {
            title: "【2】星数を出す",
            description: "運命数 - 1 + 生まれ日 = 星数",
            calculation: `${destinyNumber} - 1 + 22`,
            result: starNumber,
            details: `${destinyNumber} - 1 + 22 = ${starNumber}${starNumber > 60 ? ` → ${starNumber - 60} (60を引く)` : ""}`,
            normalizedStarNumber: starNumber > 60 ? starNumber - 60 : starNumber,
          },
          step3: {
            title: "【3】運命星を決定",
            description: "星数の範囲から運命星を判定",
            calculation: `星数${starNumber > 60 ? starNumber - 60 : starNumber}の範囲判定`,
            result: destinyStar,
            details: `${starNumber > 60 ? starNumber - 60 : starNumber}は${getStarRange(starNumber > 60 ? starNumber - 60 : starNumber)}の範囲 → ${destinyStar}`,
          },
          step4: {
            title: "【4】陽陰を決定",
            description: "生まれ年の干支から陽陰を判定",
            calculation: `${tenStems}${zodiac}年の陽陰`,
            result: plusMinus,
            details: `2000年は${tenStems}${zodiac}年 → ${zodiac}は${plusMinus === "+" ? "陽" : "陰"} → ${plusMinus}`,
          },
          final: {
            title: "【最終結果】",
            result: `${destinyStar}人${plusMinus}`,
            confidence: calculation.confidence,
            dataSource: calculation.dataSource,
          },
        },
      })
    } catch (error) {
      console.error("計算エラー:", error)
      setResult({
        error: String(error),
        stepByStep: {
          input: "2000年9月22日",
          final: {
            title: "【エラー】",
            result: "計算エラー",
            confidence: 0,
            dataSource: "error",
          },
        },
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 500)
    }
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

  const animateSteps = () => {
    setStep(0)
    setIsAnimating(true)

    const steps = [1, 2, 3, 4, 5] // 5つのステップ

    steps.forEach((stepNum, index) => {
      setTimeout(() => {
        setStep(stepNum)
        if (index === steps.length - 1) {
          setIsAnimating(false)
        }
      }, index * 1000)
    })
  }

  useEffect(() => {
    calculateStep()
  }, [])

  if (!result || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg">{isLoading ? "CSVデータを読み込み中..." : "計算中..."}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg text-red-600">エラーが発生しました: {result.error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">2000年9月22日の六星占術計算</CardTitle>
          <CardDescription>CSV優先システムによる星人タイプの判定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* データソース情報 */}
          <Alert
            className={
              result.dataSource === "csv"
                ? "border-green-500"
                : result.dataSource === "fallback"
                  ? "border-yellow-500"
                  : "border-red-500"
            }
          >
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    result.dataSource === "csv"
                      ? "default"
                      : result.dataSource === "fallback"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {result.dataSource === "csv"
                    ? "CSV"
                    : result.dataSource === "fallback"
                      ? "フォールバック"
                      : "計算推定"}
                </Badge>
                <span>
                  <strong>データソース:</strong> {result.source}
                  （信頼度: {(result.confidence * 100).toFixed(0)}%）
                </span>
              </div>
            </AlertDescription>
          </Alert>

          {/* 計算結果サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">最終結果</div>
                <div className="text-3xl font-bold text-primary">{result.result}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  信頼度: {(result.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">運命数</div>
                <div className="text-2xl font-bold">{result.destinyNumber}</div>
                <div className="text-sm text-muted-foreground mt-1">2000年9月</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">星数</div>
                <div className="text-2xl font-bold">{result.starNumber}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.stepByStep?.step2?.normalizedStarNumber &&
                  result.stepByStep.step2.normalizedStarNumber !== result.starNumber
                    ? `正規化後: ${result.stepByStep.step2.normalizedStarNumber}`
                    : "正規化不要"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">干支</div>
                <div className="text-2xl font-bold">{result.zodiac}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.plusMinus === "+" ? "陽年" : "陰年"}</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* ステップ表示ボタン */}
          <div className="flex gap-2">
            <Button onClick={animateSteps} disabled={isAnimating}>
              {isAnimating ? "計算中..." : "ステップ表示"}
            </Button>
            <Button variant="outline" onClick={calculateStep} disabled={isLoading}>
              {isLoading ? "読み込み中..." : "再計算"}
            </Button>
          </div>

          {/* 詳細計算過程 */}
          <div className="space-y-4">
            {/* ステップ1: 運命数 */}
            <Card
              className={`transition-all duration-500 ${step >= 1 ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.stepByStep.step1.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant={step >= 1 ? "default" : "secondary"}>{step >= 1 ? "完了" : "待機中"}</Badge>
                    <Badge variant={result.stepByStep.step1.dataSource === "csv" ? "default" : "secondary"}>
                      {result.stepByStep.step1.dataSource === "csv"
                        ? "CSV"
                        : result.stepByStep.step1.dataSource === "fallback"
                          ? "フォールバック"
                          : "計算"}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{result.stepByStep.step1.description}</div>
                <div className="bg-muted p-3 rounded-md font-mono">
                  {result.stepByStep.step1.calculation} = <strong>{result.stepByStep.step1.result}</strong>
                </div>
                <div className="mt-2 text-sm">{result.stepByStep.step1.details}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  信頼度: {(result.stepByStep.step1.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            {/* ステップ2: 星数 */}
            <Card
              className={`transition-all duration-500 ${step >= 2 ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.stepByStep.step2.title}</h3>
                  <Badge variant={step >= 2 ? "default" : "secondary"}>{step >= 2 ? "完了" : "待機中"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{result.stepByStep.step2.description}</div>
                <div className="bg-muted p-3 rounded-md font-mono">
                  {result.stepByStep.step2.calculation} = <strong>{result.stepByStep.step2.result}</strong>
                </div>
                <div className="mt-2 text-sm">{result.stepByStep.step2.details}</div>
                {result.stepByStep.step2.result > 60 && (
                  <Alert className="mt-2">
                    <AlertDescription className="text-blue-700">
                      ℹ️ 星数が60を超えたため、60を引いて正規化しました
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* ステップ3: 運命星 */}
            <Card
              className={`transition-all duration-500 ${step >= 3 ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.stepByStep.step3.title}</h3>
                  <Badge variant={step >= 3 ? "default" : "secondary"}>{step >= 3 ? "完了" : "待機中"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{result.stepByStep.step3.description}</div>
                <div className="bg-muted p-3 rounded-md font-mono">
                  {result.stepByStep.step3.calculation} = <strong>{result.stepByStep.step3.result}</strong>
                </div>
                <div className="mt-2 text-sm">{result.stepByStep.step3.details}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  範囲: 1-10:土星, 11-20:金星, 21-30:火星, 31-40:天王星, 41-50:木星, 51-60:水星
                </div>
              </CardContent>
            </Card>

            {/* ステップ4: 陽陰 */}
            <Card
              className={`transition-all duration-500 ${step >= 4 ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.stepByStep.step4.title}</h3>
                  <Badge variant={step >= 4 ? "default" : "secondary"}>{step >= 4 ? "完了" : "待機中"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{result.stepByStep.step4.description}</div>
                <div className="bg-muted p-3 rounded-md font-mono">
                  {result.stepByStep.step4.calculation} = <strong>{result.stepByStep.step4.result}</strong>
                </div>
                <div className="mt-2 text-sm">{result.stepByStep.step4.details}</div>
                <div className="mt-2 text-xs text-muted-foreground">陽: 子寅辰午申戌 / 陰: 丑卯巳未酉亥</div>
              </CardContent>
            </Card>

            {/* 最終結果 */}
            <Card
              className={`transition-all duration-500 ${step >= 5 ? "opacity-100 scale-100 border-primary" : "opacity-50 scale-95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.stepByStep.final.title}</h3>
                  <Badge variant={step >= 5 ? "default" : "secondary"}>{step >= 5 ? "完了" : "待機中"}</Badge>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-primary mb-2">{result.stepByStep.final.result}</div>
                  <div className="text-sm text-muted-foreground">
                    信頼度: {(result.stepByStep.final.confidence * 100).toFixed(0)}% (
                    {result.stepByStep.final.dataSource === "csv"
                      ? "CSV"
                      : result.stepByStep.final.dataSource === "fallback"
                        ? "フォールバック"
                        : "計算"}
                    )
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* 検証情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">計算詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>入力:</strong> {result.input}
                </div>
                <div>
                  <strong>立春調整:</strong> {result.risshunAdjustment ? "適用" : "なし"}
                </div>
                <div>
                  <strong>運命数:</strong> {result.destinyNumber}
                </div>
                <div>
                  <strong>星数:</strong> {result.starNumber}
                </div>
                <div>
                  <strong>運命星:</strong> {result.destinyStar}
                </div>
                <div>
                  <strong>陽陰:</strong> {result.plusMinus}
                </div>
                <div>
                  <strong>干支:</strong> {result.zodiac}
                </div>
                <div>
                  <strong>データソース:</strong> {result.dataSource}
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                <strong>計算根拠:</strong> {result.source}
                <br />
                <strong>データソース優先順位:</strong> 1. CSV（最高精度） → 2. フォールバック表（中精度） → 3.
                計算推定（低精度）
              </div>

              {/* 計算過程の詳細 */}
              {result.calculation && (
                <div className="mt-4">
                  <strong>計算過程:</strong>
                  <div className="mt-2 space-y-1 text-xs font-mono bg-muted p-3 rounded">
                    {result.calculation.map((step: string, index: number) => (
                      <div key={index}>{step}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
