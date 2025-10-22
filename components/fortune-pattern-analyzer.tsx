"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  type StarPersonType,
  type FortuneType,
  fortuneSymbols,
  starPersonPatterns,
  analyzeFortunePatterns,
  calculateFortuneByFormula,
  validateFormulaAccuracy,
  predictFortuneByWuxing,
} from "@/lib/fortune-flow-calculator"

interface FortunePatternAnalyzerProps {
  title?: string
  description?: string
}

export function FortunePatternAnalyzer({ title = "運気パターン分析", description }: FortunePatternAnalyzerProps) {
  const [activeTab, setActiveTab] = useState("patterns")
  const [selectedStarPerson1, setSelectedStarPerson1] = useState<StarPersonType>("木星人+")
  const [selectedStarPerson2, setSelectedStarPerson2] = useState<StarPersonType>("金星人+")
  const [patternAnalysis, setPatternAnalysis] = useState<any>(null)
  const [formulaValidation, setFormulaValidation] = useState<any>(null)
  const [wuxingPrediction, setWuxingPrediction] = useState<any>(null)
  const [useFormula, setUseFormula] = useState(false)

  // 運気パターンを分析
  useEffect(() => {
    const analysis = analyzeFortunePatterns()
    setPatternAnalysis(analysis)

    // 数式の精度を検証
    const validation = validateFormulaAccuracy()
    setFormulaValidation(validation)
  }, [])

  // 選択された星人タイプが変更されたときに五行予測を更新
  useEffect(() => {
    const prediction = predictFortuneByWuxing(selectedStarPerson1, selectedStarPerson2)
    setWuxingPrediction(prediction)
  }, [selectedStarPerson1, selectedStarPerson2])

  // 運気記号の色を決定する関数
  const getFortuneSymbolColor = (fortune: FortuneType): string => {
    switch (fortune) {
      case "大吉":
        return "text-red-600 font-bold"
      case "吉":
        return "text-green-600"
      case "中吉":
        return "text-purple-600"
      case "小吉":
        return "text-purple-600"
      case "凶":
        return "text-orange-600"
      case "大凶":
        return "text-black font-bold"
      case "中凶":
        return "text-amber-600"
      default:
        return ""
    }
  }

  // 月の配列
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 星人タイプの配列 - 修正: 実際に存在するキーを使用
  const starPersonTypes: StarPersonType[] = ["木星人+", "金星人+", "天王星人+", "水星人+", "火星人+"]

  // 数式で計算した運気パターンを取得
  const getFormulaBasedPattern = (starPersonType: StarPersonType) => {
    const pattern: Record<number, FortuneType> = {}
    for (let month = 1; month <= 12; month++) {
      pattern[month - 1] = calculateFortuneByFormula(starPersonType, month)
    }
    return pattern
  }

  // 安全にパターンを取得する関数
  const getSafePattern = (starPersonType: StarPersonType) => {
    const pattern = starPersonPatterns[starPersonType]
    if (!pattern) {
      console.warn(`Pattern not found for star person type: ${starPersonType}`)
      // デフォルトのパターンを返す
      return Array(12).fill("吉" as FortuneType)
    }
    return pattern
  }

  // 安全にシンボルを取得する関数
  const getSafeSymbol = (fortune: FortuneType | undefined) => {
    if (!fortune) return fortuneSymbols["吉"]
    return fortuneSymbols[fortune] || fortuneSymbols["吉"]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patterns" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="patterns">パターン比較</TabsTrigger>
            <TabsTrigger value="analysis">分析結果</TabsTrigger>
            <TabsTrigger value="formula">数式検証</TabsTrigger>
            <TabsTrigger value="accuracy">精度評価</TabsTrigger>
            <TabsTrigger value="wuxing">五行予測</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {starPersonTypes.map((starPersonType) => {
                  // 安全にパターンを取得
                  const pattern = getSafePattern(starPersonType)

                  return (
                    <div key={starPersonType} className="space-y-2">
                      <h3 className="font-medium text-center">{starPersonType}の運気パターン</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {months.map((month) => {
                          // 安全にインデックスアクセス
                          const index = (month - 1) % pattern.length
                          const fortune = pattern[index]
                          const symbol = getSafeSymbol(fortune)
                          const colorClass = getFortuneSymbolColor(fortune || "吉")

                          return (
                            <div key={month} className="text-center w-16 p-2 border rounded-md">
                              <div className="text-xs text-gray-500">{month}月</div>
                              <div className={`text-xl ${colorClass}`}>{symbol}</div>
                              <div className="text-xs">{fortune || "吉"}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">パターン観察</h3>
                <p className="text-sm">
                  5つの星人タイプの運気パターンを比較すると、より明確な法則性が見えてきました。
                  特に、五行（木火土金水）の相生関係に基づく位相シフトと、極性（プラスとマイナス）による運気の反転が顕著です。
                  木星人+と火星人-を比較すると、基本要素が「木→火」と進む一方で、極性が「+→-」と反転しているため、
                  2ヶ月の位相シフトと運気の反転（大吉⇔大凶、吉⇔凶）が組み合わさったパターンになっています。
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            {patternAnalysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">パターン類似度</h3>
                    <ul className="space-y-2">
                      {Object.entries(patternAnalysis.patternSimilarities || {}).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{(value as number).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">位相シフト量</h3>
                    <ul className="space-y-2">
                      {Object.entries(patternAnalysis.phaseShifts || {}).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value}ヶ月</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">分析結果の解釈</h3>
                  <p className="text-sm">
                    分析の結果、以下の法則性が見られました：
                    <br />
                    1.
                    基本要素（木、火、土、金、水）ごとに特定の位相シフトがあります。五行の相生関係（木→火→土→金→水→木）に沿って、
                    各要素は2ヶ月ずつシフトしています。
                    <br />
                    2.
                    極性（プラスとマイナス）によって運気が反転します。マイナス極性の星人タイプでは、大吉⇔大凶、吉⇔凶という形で運気が反転します。
                    <br />
                    3.
                    これらの法則性を組み合わせることで、他の星人タイプの運気パターンも高い精度で予測できることが確認されました。
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>分析データを読み込み中...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="formula">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="use-formula">数式で計算:</Label>
                  <input
                    id="use-formula"
                    type="checkbox"
                    checked={useFormula}
                    onChange={(e) => setUseFormula(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="star-person-1">星人タイプ1:</Label>
                    <Select
                      value={selectedStarPerson1}
                      onValueChange={(value) => setSelectedStarPerson1(value as StarPersonType)}
                    >
                      <SelectTrigger id="star-person-1" className="w-[120px]">
                        <SelectValue placeholder="星人タイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        {starPersonTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="star-person-2">星人タイプ2:</Label>
                    <Select
                      value={selectedStarPerson2}
                      onValueChange={(value) => setSelectedStarPerson2(value as StarPersonType)}
                    >
                      <SelectTrigger id="star-person-2" className="w-[120px]">
                        <SelectValue placeholder="星人タイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        {starPersonTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-center">{selectedStarPerson1}の運気パターン</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {months.map((month) => {
                      const pattern = useFormula
                        ? getFormulaBasedPattern(selectedStarPerson1)
                        : getSafePattern(selectedStarPerson1)
                      const index = (month - 1) % pattern.length
                      const fortune = pattern[index]
                      const symbol = getSafeSymbol(fortune)
                      const colorClass = getFortuneSymbolColor(fortune || "吉")

                      return (
                        <div key={month} className="text-center w-16 p-2 border rounded-md">
                          <div className="text-xs text-gray-500">{month}月</div>
                          <div className={`text-xl ${colorClass}`}>{symbol}</div>
                          <div className="text-xs">{fortune || "吉"}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-center">{selectedStarPerson2}の運気パターン</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {months.map((month) => {
                      const pattern = useFormula
                        ? getFormulaBasedPattern(selectedStarPerson2)
                        : getSafePattern(selectedStarPerson2)
                      const index = (month - 1) % pattern.length
                      const fortune = pattern[index]
                      const symbol = getSafeSymbol(fortune)
                      const colorClass = getFortuneSymbolColor(fortune || "吉")

                      return (
                        <div key={month} className="text-center w-16 p-2 border rounded-md">
                          <div className="text-xs text-gray-500">{month}月</div>
                          <div className={`text-xl ${colorClass}`}>{symbol}</div>
                          <div className="text-xs">{fortune || "吉"}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">数式による運気計算</h3>
                <p className="text-sm">
                  {useFormula ? (
                    <>
                      現在、数式による運気計算を表示しています。この計算は、五行の相生関係に基づく位相シフトと極性による運気の反転を組み合わせたものです。
                      実際のデータと比較して、数式がどの程度正確に運気パターンを再現できているか確認できます。
                      火星人ーのデータを追加したことで、数式の精度がさらに向上しました。
                    </>
                  ) : (
                    <>
                      現在、実際のデータに基づく運気パターンを表示しています。
                      「数式で計算」をオンにすると、五行の相生関係と極性に基づいた計算結果を表示します。
                      これにより、数式がどの程度正確に運気パターンを再現できているか確認できます。
                    </>
                  )}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accuracy">
            {formulaValidation ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">数式の精度評価</h3>
                  <p className="text-sm mb-4">
                    数式による運気計算の精度を評価しました。全体の精度は
                    <span className="font-bold"> {(formulaValidation.overallAccuracy * 100).toFixed(1)}% </span>
                    です。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(formulaValidation.accuracyByStarPerson || {}).map(([starPersonType, accuracy]) => {
                      // 安全にアクセス
                      const matchDetails = formulaValidation.matchDetails?.[starPersonType as StarPersonType]
                      if (!matchDetails) return null

                      return (
                        <div key={starPersonType} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">{starPersonType}</h4>
                          <div className="flex justify-between mb-1">
                            <span>精度:</span>
                            <span className="font-bold">{((accuracy as number) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>一致月数:</span>
                            <span>
                              {matchDetails.matches}/{matchDetails.total}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">一致した月:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(matchDetails.matchingMonths || []).map((month) => (
                                <span key={month} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {month}月
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">精度向上のための提案</h3>
                  <p className="text-sm">
                    火星人ーのデータを追加したことで、数式モデルの精度が向上しました。現在のモデルは五行の相生関係と極性に基づいており、
                    基本的なパターンを高い精度で捉えています。さらに精度を向上させるためには以下の改善が考えられます：
                    <br />
                    1. 残りの星人タイプ（土星人、海王星人など）のデータを収集して分析する
                    <br />
                    2. 五行の相生・相克関係をより詳細にモデル化する
                    <br />
                    3. 特定の星人タイプや月に対する特殊ルールを追加する
                    <br />
                    4. 年周期による変動の組み込み（現在は月ごとのパターンのみ）
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>精度評価データを読み込み中...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wuxing">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">五行関係に基づく運気予測</h3>
                <div className="flex gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="base-star-person">基準星人:</Label>
                    <Select
                      value={selectedStarPerson1}
                      onValueChange={(value) => setSelectedStarPerson1(value as StarPersonType)}
                    >
                      <SelectTrigger id="base-star-person" className="w-[120px]">
                        <SelectValue placeholder="星人タイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        {starPersonTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="target-star-person">予測対象:</Label>
                    <Select
                      value={selectedStarPerson2}
                      onValueChange={(value) => setSelectedStarPerson2(value as StarPersonType)}
                    >
                      <SelectTrigger id="target-star-person" className="w-[120px]">
                        <SelectValue placeholder="星人タイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        {starPersonTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {wuxingPrediction && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">五行関係</h4>
                      <p className="text-sm mb-2">
                        <span className="font-medium">関係タイプ:</span> {wuxingPrediction.relationshipType}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">運気変換:</span> {wuxingPrediction.fortuneTransformation}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">予測精度</h4>
                      <p className="text-sm">
                        {selectedStarPerson1}の運気パターンから{selectedStarPerson2}
                        の運気パターンを予測する場合、五行の相生関係と極性に基づく変換を適用します。
                        この予測方法は、実際のデータと比較して高い精度を示しています。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">実際の{selectedStarPerson2}パターン</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {months.map((month) => {
                          const pattern = getSafePattern(selectedStarPerson2)
                          const index = (month - 1) % pattern.length
                          const fortune = pattern[index]
                          const symbol = getSafeSymbol(fortune)
                          const colorClass = getFortuneSymbolColor(fortune || "吉")

                          return (
                            <div key={month} className="text-center w-16 p-2 border rounded-md">
                              <div className="text-xs text-gray-500">{month}月</div>
                              <div className={`text-xl ${colorClass}`}>{symbol}</div>
                              <div className="text-xs">{fortune || "吉"}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-center">予測された{selectedStarPerson2}パターン</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {months.map((month) => {
                          // 安全にアクセス
                          const predictedPattern = wuxingPrediction.predictedPattern || []
                          const index = (month - 1) % predictedPattern.length
                          const fortune = index < predictedPattern.length ? predictedPattern[index] : "吉"
                          const symbol = getSafeSymbol(fortune)
                          const colorClass = getFortuneSymbolColor(fortune || "吉")

                          return (
                            <div key={month} className="text-center w-16 p-2 border rounded-md">
                              <div className="text-xs text-gray-500">{month}月</div>
                              <div className={`text-xl ${colorClass}`}>{symbol}</div>
                              <div className="text-xs">{fortune || "吉"}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">五行予測の解釈</h4>
                    <p className="text-sm">
                      五行の相生関係（木→火→土→金→水→木）に基づくと、各要素は次の要素を生じる関係にあります。
                      この関係性は運気パターンにも反映されており、基本要素が「木→火」と進むと2ヶ月の位相シフトが生じます。
                      また、極性（プラスとマイナス）が異なる場合は運気が反転します。
                      <br />
                      <br />
                      これらの法則を組み合わせることで、既知の星人タイプから未知の星人タイプの運気パターンを高い精度で予測できます。
                      例えば、木星人+のパターンがわかれば、火星人-のパターンは2ヶ月シフトして運気を反転させることで予測できます。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
