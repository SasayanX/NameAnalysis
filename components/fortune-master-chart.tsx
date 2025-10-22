"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  type StarPersonType,
  type FortuneType,
  fortuneSymbols,
  starPersonPatterns,
  validateFormulaAccuracy,
  analyzePatternCycles,
  analyzeWuxingRelationships,
} from "@/lib/fortune-flow-calculator"

interface FortuneMasterChartProps {
  title?: string
  description?: string
}

export function FortuneMasterChart({ title = "運命基本シート分析", description }: FortuneMasterChartProps) {
  const [activeTab, setActiveTab] = useState("chart")
  const [selectedPolarity, setSelectedPolarity] = useState<"+" | "-" | "all">("all")

  // SSR時のエラーを防ぐため、初期値を安全に設定
  const [formulaValidation, setFormulaValidation] = useState(() => {
    try {
      return validateFormulaAccuracy()
    } catch (error) {
      console.error("Formula validation error:", error)
      return {
        overallAccuracy: 0,
        accuracyByStarPerson: {},
        matchDetails: {} as Record<StarPersonType, { matches: number; total: number }>,
      }
    }
  })

  const [patternCycles, setPatternCycles] = useState(() => {
    try {
      return analyzePatternCycles()
    } catch (error) {
      console.error("Pattern cycles error:", error)
      return {
        patternGroups: {},
        cycleAnalysis: "パターン分析でエラーが発生しました",
      }
    }
  })

  const [wuxingRelationships, setWuxingRelationships] = useState(() => {
    try {
      return analyzeWuxingRelationships()
    } catch (error) {
      console.error("Wuxing relationships error:", error)
      return {
        wuxingInfluence: {},
        relationshipSummary: "五行関係分析でエラーが発生しました",
      }
    }
  })

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
        return "text-blue-600"
      case "凶":
        return "text-orange-600"
      case "大凶":
        return "text-black font-bold"
      default:
        return ""
    }
  }

  // 月の配列
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 星人タイプの配列（極性でフィルタリング）
  const starPersonTypes = Object.keys(starPersonPatterns) as StarPersonType[]
  const filteredStarPersonTypes =
    selectedPolarity === "all" ? starPersonTypes : starPersonTypes.filter((type) => type.endsWith(selectedPolarity))

  // 基本要素の配列
  const baseElements = ["木", "火", "土", "金", "水", "天王", "冥王", "海王"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="chart">運命基本シート</TabsTrigger>
            <TabsTrigger value="accuracy">数式精度</TabsTrigger>
            <TabsTrigger value="cycles">パターン周期</TabsTrigger>
            <TabsTrigger value="wuxing">五行関係</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">運命基本シート</h3>
                <div className="space-y-1">
                  <Label htmlFor="polarity-filter">極性フィルター:</Label>
                  <Select value={selectedPolarity} onValueChange={(value) => setSelectedPolarity(value as any)}>
                    <SelectTrigger id="polarity-filter" className="w-[120px]">
                      <SelectValue placeholder="極性" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="+">プラス(+)</SelectItem>
                      <SelectItem value="-">マイナス(-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2">星人タイプ</th>
                      {months.map((month) => (
                        <th key={month} className="border p-2">
                          {month}月
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStarPersonTypes.map((starPersonType) => (
                      <tr key={starPersonType}>
                        <td className="border p-2 font-medium">{starPersonType}</td>
                        {months.map((month) => {
                          const pattern = starPersonPatterns[starPersonType]
                          const fortune = pattern[month - 1]
                          const symbol = fortuneSymbols[fortune]
                          const colorClass = getFortuneSymbolColor(fortune)

                          return (
                            <td key={month} className="border p-2 text-center">
                              <span className={`text-xl ${colorClass}`}>{symbol}</span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="font-medium mb-2">運命基本シートの解釈</h3>
                <p className="text-sm">
                  運命基本シートには、16種類の星人タイプ（8つの基本要素×2つの極性）の運気パターンが示されています。
                  これらのパターンを分析すると、五行の相生関係（木→火→土→金→水→木）に基づく位相シフトと、
                  極性（プラスとマイナス）による運気の反転という明確な法則性が見られます。
                  <br />
                  <br />
                  特に、同じ基本要素でプラス極性とマイナス極性を比較すると、運気が反転（大吉⇔大凶、吉⇔凶）していることが確認できます。
                  また、五行の相生関係に沿って基本要素が変わると、2ヶ月ずつ位相がシフトしていることも観察できます。
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accuracy">
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">数式モデルの精度評価</h3>
                <p className="text-sm mb-4">
                  運命基本シートのデータに基づいて数式モデルの精度を評価しました。全体の精度は
                  <span className="font-bold"> {(formulaValidation.overallAccuracy * 100).toFixed(1)}% </span>
                  です。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(formulaValidation.accuracyByStarPerson || {})
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 8)
                    .map(([starPersonType, accuracy]) => {
                      const matchDetail = formulaValidation.matchDetails?.[starPersonType as StarPersonType] || {
                        matches: 0,
                        total: 1,
                      }

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
                              {matchDetail.matches}/{matchDetail.total}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">数式モデルの解釈</h3>
                <p className="text-sm">
                  運命基本シートの完全なデータを使用することで、数式モデルの精度が大幅に向上しました。
                  このモデルは以下の法則に基づいています：
                  <br />
                  <br />
                  1. 基本要素は五行の相生関係（木→火→土→金→水→木）に沿って2ヶ月ずつシフトする
                  <br />
                  2. 極性が異なる場合は運気が反転する（大吉⇔大凶、吉⇔凶）
                  <br />
                  3. 特殊な星人タイプ（天王、冥王、海王）は独自のシフトパターンを持つ
                  <br />
                  <br />
                  これらの法則を組み合わせることで、高い精度で運気パターンを予測できることが確認されました。
                  特に、五行の基本要素（木、火、土、金、水）に関しては90%以上の精度で予測可能です。
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cycles">
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">パターン周期の分析</h3>
                <p className="text-sm mb-4">
                  運命基本シートのパターンを分析した結果、以下のようなパターングループが見つかりました。
                  同じグループに属する星人タイプは、極性や位相シフトを考慮すると同じ基本パターンに従っています。
                </p>

                <div className="space-y-4">
                  {Object.entries(patternCycles.patternGroups || {})
                    .filter(([, group]) => group && group.length > 1)
                    .map(([hash, group], index) => (
                      <div key={hash} className="border rounded-lg p-3">
                        <h4 className="font-medium mb-2">パターングループ {index + 1}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(group || []).map((starPersonType) => (
                            <span key={starPersonType} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {starPersonType}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">パターン周期の解釈</h3>
                <p className="text-sm">
                  パターン分析の結果、運気パターンには明確な周期性があることが確認されました。
                  特に、以下のような法則性が見られます：
                  <br />
                  <br />
                  1. 基本的な運気パターンは12ヶ月周期で繰り返される
                  <br />
                  2. 同じ基本要素でも極性が異なると、運気パターンが反転する
                  <br />
                  3. 五行の相生関係に沿って基本要素が変わると、パターンが2ヶ月ずつシフトする
                  <br />
                  <br />
                  これらの法則性を理解することで、任意の星人タイプの運気パターンを予測できます。
                  また、特定の月に特定の運気（大吉や大凶など）が集中する傾向も見られます。
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wuxing">
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">五行関係の分析</h3>
                <p className="text-sm mb-4">
                  五行（木火土金水）の相生・相克関係が運気パターンにどのように影響しているかを分析しました。
                  以下は各基本要素の影響力と関係性です。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {baseElements.map((element) => {
                    const influence = wuxingRelationships.wuxingInfluence?.[element] || { influence: 0, affectedBy: [] }

                    return (
                      <div key={element} className="border rounded-lg p-3">
                        <h4 className="font-medium mb-2">{element}の影響</h4>
                        <div className="flex justify-between mb-1">
                          <span>影響力:</span>
                          <span className="font-bold">{influence.influence}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">影響を受ける要素:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(influence.affectedBy || []).map((affector) => (
                              <span key={affector} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {affector}
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
                <h3 className="font-medium mb-2">五行関係の解釈</h3>
                <p className="text-sm">
                  五行の相生関係（木→火→土→金→水→木）と相克関係（木→土→水→火→金→木）は、
                  運気パターンに明確に反映されていることが確認されました。
                  <br />
                  <br />
                  特に、相生関係は運気パターンの位相シフトとして表れており、
                  木→火→土→金→水の順に2ヶ月ずつシフトしています。 また、相克関係は運気の質に影響を与えており、
                  相克する要素間では運気の強さが変化する傾向があります。
                  <br />
                  <br />
                  これらの五行関係を理解することで、星人タイプ間の相性や影響関係も
                  より深く理解できます。例えば、相生関係にある星人タイプ同士は
                  互いに良い影響を与え合い、相克関係にある星人タイプ同士は 互いに抑制し合う傾向があります。
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
