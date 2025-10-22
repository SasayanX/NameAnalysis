"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  validateDestinyNumberTableData,
  analyzeSpecificYear,
  testPDFExampleCalculation,
  calculate19720614,
} from "@/lib/rokuseisensei-calculator"

export default function DestinyNumberValidator() {
  const [validationResult, setValidationResult] = useState<any>(null)
  const [yearAnalysis, setYearAnalysis] = useState<any>(null)
  const [selectedYear, setSelectedYear] = useState<number>(1972)
  const [loading, setLoading] = useState(false)

  const handleValidation = async () => {
    setLoading(true)
    try {
      const result = validateDestinyNumberTableData()
      setValidationResult(result)
    } catch (error) {
      console.error("検証エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleYearAnalysis = async (year: number) => {
    setLoading(true)
    try {
      const result = analyzeSpecificYear(year)
      setYearAnalysis(result)
      setSelectedYear(year)
    } catch (error) {
      console.error("年分析エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const pdfExample = testPDFExampleCalculation()
  const test1972 = calculate19720614()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">運命数表検証ツール</CardTitle>
          <CardDescription>PDFからの転記が正確かどうかを検証します</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleValidation} disabled={loading} className="w-full mb-4">
            {loading ? "検証中..." : "運命数表を検証"}
          </Button>

          {validationResult && (
            <div className="space-y-4">
              <Alert className={validationResult.invalidEntries.length === 0 ? "border-green-500" : "border-red-500"}>
                <AlertDescription>
                  <div className="whitespace-pre-line">{validationResult.summary}</div>
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="errors">エラー</TabsTrigger>
                  <TabsTrigger value="tests">テスト</TabsTrigger>
                  <TabsTrigger value="patterns">パターン</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{validationResult.totalEntries}</div>
                        <div className="text-sm text-muted-foreground">総エントリ数</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{validationResult.invalidEntries.length}</div>
                        <div className="text-sm text-muted-foreground">無効エントリ</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {validationResult.missingEntries.length}
                        </div>
                        <div className="text-sm text-muted-foreground">欠損エントリ</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {validationResult.duplicatePatterns.length}
                        </div>
                        <div className="text-sm text-muted-foreground">重複パターン</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="errors" className="space-y-4">
                  {validationResult.invalidEntries.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-600">無効なエントリ</h3>
                      {validationResult.invalidEntries.slice(0, 10).map((entry: any, index: number) => (
                        <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <div className="font-medium">
                            {entry.year}年{entry.month}月
                          </div>
                          <div className="text-sm text-red-700">
                            値: {entry.value}, 問題: {entry.issue}
                          </div>
                        </div>
                      ))}
                      {validationResult.invalidEntries.length > 10 && (
                        <div className="text-sm text-muted-foreground">
                          ...他{validationResult.invalidEntries.length - 10}件
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-green-600 font-medium">✅ 無効なエントリはありません</div>
                  )}

                  {validationResult.missingEntries.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-yellow-600">欠損エントリ</h3>
                      {validationResult.missingEntries.slice(0, 10).map((entry: any, index: number) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                          {entry.year}年{entry.month}月のデータが不足
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tests" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">PDFの例 (1989/7/10)</CardTitle>
                        <CardDescription>PDFに記載された計算例の検証</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>期待運命数:</span>
                          <Badge variant="outline">{pdfExample.expectedDestinyNumber}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算運命数:</span>
                          <Badge
                            variant={
                              pdfExample.calculatedDestinyNumber === pdfExample.expectedDestinyNumber
                                ? "default"
                                : "destructive"
                            }
                          >
                            {pdfExample.calculatedDestinyNumber}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>期待星数:</span>
                          <Badge variant="outline">{pdfExample.expectedStarNumber}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算星数:</span>
                          <Badge
                            variant={
                              pdfExample.calculatedStarNumber === pdfExample.expectedStarNumber
                                ? "default"
                                : "destructive"
                            }
                          >
                            {pdfExample.calculatedStarNumber}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>期待結果:</span>
                          <Badge variant="outline">{pdfExample.expectedResult}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算結果:</span>
                          <Badge
                            variant={
                              pdfExample.calculatedResult === pdfExample.expectedResult ? "default" : "destructive"
                            }
                          >
                            {pdfExample.calculatedResult}
                          </Badge>
                        </div>
                        <div className="pt-2">
                          <Badge
                            variant={pdfExample.isCorrect ? "default" : "destructive"}
                            className="w-full justify-center"
                          >
                            {pdfExample.isCorrect ? "✅ 正常" : "❌ 要修正"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">1972/6/14テスト</CardTitle>
                        <CardDescription>運命数60の検証</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>期待運命数:</span>
                          <Badge variant="outline">{test1972.expectedDestinyNumber}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算運命数:</span>
                          <Badge
                            variant={
                              test1972.calculatedDestinyNumber === test1972.expectedDestinyNumber
                                ? "default"
                                : "destructive"
                            }
                          >
                            {test1972.calculatedDestinyNumber}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>期待星数:</span>
                          <Badge variant="outline">{test1972.expectedStarNumber}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算星数:</span>
                          <Badge
                            variant={
                              test1972.calculatedStarNumber === test1972.expectedStarNumber ? "default" : "destructive"
                            }
                          >
                            {test1972.calculatedStarNumber}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>期待結果:</span>
                          <Badge variant="outline">{test1972.expectedResult}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>計算結果:</span>
                          <Badge
                            variant={test1972.calculatedResult === test1972.expectedResult ? "default" : "destructive"}
                          >
                            {test1972.calculatedResult}
                          </Badge>
                        </div>
                        <div className="pt-2">
                          <Badge
                            variant={test1972.isCorrect ? "default" : "destructive"}
                            className="w-full justify-center"
                          >
                            {test1972.isCorrect ? "✅ 正常" : "❌ 要修正"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="patterns" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {[1970, 1971, 1972, 1973, 1989, 1990].map((year) => (
                        <Button
                          key={year}
                          variant={selectedYear === year ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleYearAnalysis(year)}
                        >
                          {year}年
                        </Button>
                      ))}
                    </div>

                    {yearAnalysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{yearAnalysis.year}年の分析</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-6 gap-2 text-sm">
                            {Object.entries(yearAnalysis.monthlyValues).map(([month, value]) => (
                              <div key={month} className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">{month}月</div>
                                <div className="text-lg">{value as number}</div>
                              </div>
                            ))}
                          </div>

                          {yearAnalysis.anomalies.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-red-600">異常値</h4>
                              {yearAnalysis.anomalies.map((anomaly: any, index: number) => (
                                <div key={index} className="bg-red-50 p-2 rounded text-sm">
                                  {anomaly.month}月: {anomaly.issue} (値: {anomaly.value})
                                </div>
                              ))}
                            </div>
                          )}

                          {yearAnalysis.comparison.previousYear && (
                            <div className="text-sm">
                              <span className="font-medium">
                                前年({yearAnalysis.comparison.previousYear.year})との類似度:{" "}
                              </span>
                              <Badge variant="outline">
                                {(yearAnalysis.comparison.previousYear.similarity * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
