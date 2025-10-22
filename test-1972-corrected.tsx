"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Test1972Corrected() {
  const [result, setResult] = useState<any>(null)

  // 正しい計算（運命数60で）
  const correctCalculation = () => {
    const birthDate = new Date(1972, 5, 14) // 1972年6月14日

    // 【1】運命数：1972年6月 = 60（PDFの正しい値）
    const destinyNumber = 60

    // 【2】星数：60 - 1 + 14 = 73
    let starNumber = destinyNumber - 1 + 14 // = 73

    // 61以上なので60を引く：73 - 60 = 13
    if (starNumber > 60) {
      starNumber = starNumber - 60
    }

    // 【3】運命星：13は11-20の範囲なので金星人
    const destinyStar = starNumber >= 11 && starNumber <= 20 ? "金星" : "不明"

    // 【4】+/-：1972年は子年なので陽(+)
    const zodiac = "子" // 1972年は子年
    const plusMinus = "+" // 子年は陽

    return {
      destinyNumber,
      starNumber,
      destinyStar,
      plusMinus,
      zodiac,
      finalResult: `${destinyStar}人${plusMinus}`,
      calculation: [
        "生年月日: 1972年6月14日",
        "【1】運命数: 60 (1972年6月)",
        "【2】星数: 60 - 1 + 14 = 73",
        "【2-2】61以上なので60を引く: 73 - 60 = 13",
        "【3】運命星: 金星 (星数13は11-20の範囲)",
        "【4】干支: 子年 = 陽(+)",
        "結果: 金星人+",
      ],
    }
  }

  const handleCalculate = () => {
    const corrected = correctCalculation()
    setResult(corrected)
  }

  const corrected = correctCalculation()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">1972年6月14日生まれ（修正版）</CardTitle>
          <CardDescription>運命数60で正しく計算</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="font-semibold text-red-800 mb-2">🔧 修正内容</h3>
            <div className="text-sm text-red-700">
              <div>
                ❌ <strong>間違い:</strong> 1972年6月の運命数 = 33
              </div>
              <div>
                ✅ <strong>正しい:</strong> 1972年6月の運命数 = 60
              </div>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            正しい計算で再計算
          </Button>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-800">📋 正しい計算過程</h3>
            <div className="space-y-2 text-sm">
              {corrected.calculation.map((step, index) => (
                <div key={index} className="bg-white p-2 rounded border-l-4 border-green-400">
                  {step}
                </div>
              ))}
            </div>
            <div className="pt-4 text-center">
              <Badge variant="default" className="text-2xl py-2 px-4 bg-green-600">
                {corrected.finalResult}
              </Badge>
            </div>
          </div>

          {result && (
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">🎯 修正後の結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">🌟 金星人+の特徴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>
                  <strong>金星人の特徴:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>美的センスに優れている</li>
                  <li>人間関係を大切にする</li>
                  <li>愛情深く、調和を重視</li>
                  <li>芸術的才能がある</li>
                  <li>社交的で魅力的</li>
                </ul>
                <p className="mt-2">
                  <strong>陽(+):</strong> より積極的で外向的、リーダーシップを発揮する傾向
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🔍 なぜ間違えたか</h3>
            <div className="text-sm text-gray-700">
              <p>PDFの運命数表を転記する際に、1972年6月の値を間違って読み取っていました。</p>
              <p className="mt-1">
                正確には <strong>60</strong> であるべきところを <strong>33</strong> と記録していました。
              </p>
              <p className="mt-1">これにより星数計算が大きく変わり、結果的に運命星も変わってしまいました。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
