"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RokuseiSenseiCalculator } from "@/lib/rokuseisensei-calculator"
import DestinyNumberValidator from "@/components/destiny-number-validator"

export default function TestDestinyValidation() {
  const [testDate, setTestDate] = useState("1972-06-14")
  const [result, setResult] = useState<any>(null)

  const handleTest = () => {
    const date = new Date(testDate)
    const calculation = RokuseiSenseiCalculator.debugCalculation(date)
    setResult(calculation)
  }

  const handleQuickTest = (dateStr: string, expectedDestiny: number, expectedStar: number, expectedResult: string) => {
    const date = new Date(dateStr)
    const calculation = RokuseiSenseiCalculator.debugCalculation(date)

    const isCorrect =
      calculation.destinyNumber === expectedDestiny &&
      calculation.starNumber === expectedStar &&
      calculation.result === expectedResult

    setResult({
      ...calculation,
      expected: {
        destinyNumber: expectedDestiny,
        starNumber: expectedStar,
        result: expectedResult,
      },
      isCorrect,
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">運命数表検証テスト</CardTitle>
          <CardDescription>PDFからの転記が正確かどうかをテストします</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="testDate">テスト日付</Label>
                <Input id="testDate" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
              </div>
              <Button onClick={handleTest} className="w-full">
                計算実行
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">クイックテスト</h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleQuickTest("1972-06-14", 60, 13, "金星人+")}
              >
                1972/6/14 (運命数60)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleQuickTest("1989-07-10", 59, 8, "土星人-")}
              >
                1989/7/10 (PDFの例)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleQuickTest("1970-01-01", 18, 17, "金星人+")}
              >
                1970/1/1
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <Alert
                className={
                  result.isCorrect !== undefined ? (result.isCorrect ? "border-green-500" : "border-red-500") : ""
                }
              >
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">計算結果: {result.result}</div>
                    <div className="text-sm space-y-1">
                      <div>入力: {result.input}</div>
                      {result.risshunAdjustment && (
                        <div className="text-blue-600">立春調整: {result.adjustedInput}</div>
                      )}
                      <div>運命数: {result.destinyNumber}</div>
                      <div>星数: {result.starNumber}</div>
                      <div>運命星: {result.destinyStar}</div>
                      <div>干支: {result.zodiac}</div>
                      <div>陽陰: {result.plusMinus}</div>
                      <div>信頼度: {(result.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {result.expected && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">期待値</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>運命数:</span>
                        <Badge variant="outline">{result.expected.destinyNumber}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>星数:</span>
                        <Badge variant="outline">{result.expected.starNumber}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>結果:</span>
                        <Badge variant="outline">{result.expected.result}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">計算値</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>運命数:</span>
                        <Badge
                          variant={result.destinyNumber === result.expected.destinyNumber ? "default" : "destructive"}
                        >
                          {result.destinyNumber}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>星数:</span>
                        <Badge variant={result.starNumber === result.expected.starNumber ? "default" : "destructive"}>
                          {result.starNumber}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>結果:</span>
                        <Badge variant={result.result === result.expected.result ? "default" : "destructive"}>
                          {result.result}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {result.calculation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">計算過程</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm font-mono">
                      {result.calculation.map((step: string, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          {step}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.isCorrect !== undefined && (
                <div className="text-center">
                  <Badge variant={result.isCorrect ? "default" : "destructive"} className="text-lg p-2">
                    {result.isCorrect ? "✅ テスト成功" : "❌ テスト失敗"}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DestinyNumberValidator />
    </div>
  )
}
