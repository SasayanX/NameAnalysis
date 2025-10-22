"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculate19720614, RokuseiSenseiCalculator } from "@/lib/rokuseisensei-calculator"

export default function Test1972Calculation() {
  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true)
    try {
      const calculationResult = calculate19720614()
      setResult(calculationResult)
      console.log("計算結果:", calculationResult)
    } catch (error) {
      console.error("計算エラー:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  // 手動で詳細計算も表示
  const manualCalculation = () => {
    const birthDate = new Date(1972, 5, 14) // 1972年6月14日

    // 【1】運命数を取得
    const destinyNumber = RokuseiSenseiCalculator.calculateDestinyNumber(1972, 6)

    // 【2】星数を計算
    const starNumber = RokuseiSenseiCalculator.calculateStarNumber(destinyNumber, 14)

    // 【3】運命星を決定
    const destinyStar = RokuseiSenseiCalculator.determineDestinyStar(starNumber)

    // 【4】+/-を決定
    const plusMinus = RokuseiSenseiCalculator.determinePlusMinus(1972)

    // 干支を取得
    const zodiac = RokuseiSenseiCalculator.getZodiac(1972)

    return {
      destinyNumber,
      starNumber,
      destinyStar,
      plusMinus,
      zodiac,
      finalResult: `${destinyStar}人${plusMinus}`,
    }
  }

  const manual = manualCalculation()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">1972年6月14日生まれの六星占術</CardTitle>
          <CardDescription>PDFの公式計算法による正確な結果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCalculate} disabled={isCalculating} className="w-full">
            {isCalculating ? "計算中..." : "六星占術を計算する"}
          </Button>

          {/* 手動計算の詳細表示 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📋 詳細計算過程</h3>
            <div className="space-y-2 text-sm">
              <div>
                🗓️ <strong>生年月日:</strong> 1972年6月14日
              </div>
              <div>
                📊 <strong>【1】運命数:</strong> {manual.destinyNumber} (1972年6月)
              </div>
              <div>
                ⭐ <strong>【2】星数:</strong> {manual.destinyNumber} - 1 + 14 = {manual.starNumber}
              </div>
              <div>
                🌟 <strong>【3】運命星:</strong> {manual.destinyStar} (星数{manual.starNumber})
              </div>
              <div>
                🐭 <strong>干支:</strong> {manual.zodiac}年
              </div>
              <div>
                ➕➖ <strong>【4】陽陰:</strong> {manual.plusMinus} ({manual.zodiac}年 ={" "}
                {manual.plusMinus === "+" ? "陽" : "陰"})
              </div>
              <div className="pt-2 border-t">
                <strong>🎯 結果:</strong>
                <Badge variant="secondary" className="ml-2 text-lg">
                  {manual.finalResult}
                </Badge>
              </div>
            </div>
          </div>

          {result && (
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">🎯 計算結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <Badge variant="default" className="text-2xl py-2 px-4">
                    {result.starType}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong>信頼度:</strong> {(result.confidence * 100).toFixed(0)}%
                  </div>
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
                    <strong>干支:</strong> {result.details.tenStems}
                    {result.details.zodiac}
                  </div>
                  <div>
                    <strong>陽陰:</strong> {result.details.plusMinus}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">📝 計算ステップ:</h4>
                  <div className="text-sm space-y-1">
                    {result.calculation.map((step: string, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border-l-4 border-blue-400">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 星人の特徴説明 */}
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">
                🌟 {manual.destinyStar}人{manual.plusMinus}の特徴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {manual.destinyStar === "水星" && (
                  <div>
                    <p>
                      <strong>水星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>知的で頭の回転が早い</li>
                      <li>コミュニケーション能力に長けている</li>
                      <li>変化を好み、新しいことに敏感</li>
                      <li>情報収集が得意</li>
                    </ul>
                    {manual.plusMinus === "+" ? (
                      <p className="mt-2">
                        <strong>陽(+):</strong> より積極的で外向的な傾向
                      </p>
                    ) : (
                      <p className="mt-2">
                        <strong>陰(-):</strong> より慎重で内向的な傾向
                      </p>
                    )}
                  </div>
                )}
                {manual.destinyStar === "土星" && (
                  <div>
                    <p>
                      <strong>土星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>真面目で責任感が強い</li>
                      <li>忍耐力があり、コツコツ努力する</li>
                      <li>安定を求める傾向</li>
                      <li>信頼性が高い</li>
                    </ul>
                  </div>
                )}
                {manual.destinyStar === "金星" && (
                  <div>
                    <p>
                      <strong>金星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>美的センスに優れている</li>
                      <li>人間関係を大切にする</li>
                      <li>愛情深く、調和を重視</li>
                      <li>芸術的才能がある</li>
                    </ul>
                  </div>
                )}
                {manual.destinyStar === "火星" && (
                  <div>
                    <p>
                      <strong>火星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>エネルギッシュで行動力がある</li>
                      <li>競争心が強い</li>
                      <li>リーダーシップを発揮する</li>
                      <li>チャレンジ精神旺盛</li>
                    </ul>
                  </div>
                )}
                {manual.destinyStar === "天王星" && (
                  <div>
                    <p>
                      <strong>天王星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>独創性があり、個性的</li>
                      <li>革新的な発想を持つ</li>
                      <li>自由を愛する</li>
                      <li>型にはまらない生き方を好む</li>
                    </ul>
                  </div>
                )}
                {manual.destinyStar === "木星" && (
                  <div>
                    <p>
                      <strong>木星人の特徴:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>寛大で包容力がある</li>
                      <li>向上心が強い</li>
                      <li>教育や指導に向いている</li>
                      <li>正義感が強い</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
