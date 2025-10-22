"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface CompatibilityRadarChartProps {
  compatibilityData: {
    nameCompatibility: {
      overallScore: number
      tenCompatibility: { score: number }
      jinCompatibility: { score: number }
      chiCompatibility: { score: number }
    }
    elementCompatibility: {
      score: number
    }
    sixStarCompatibility?: {
      score: number
    }
    overallScore: number
    myName: string
    partnerName: string
    myElement?: string
    partnerElement?: string
  }
}

export function CompatibilityRadarChart({ compatibilityData }: CompatibilityRadarChartProps) {
  const [activeTab, setActiveTab] = useState("radar")

  // レーダーチャートのデータを準備
  const chartData = [
    { axis: "天格の相性", value: compatibilityData.nameCompatibility.tenCompatibility.score / 100 },
    { axis: "人格の相性", value: compatibilityData.nameCompatibility.jinCompatibility.score / 100 },
    { axis: "地格の相性", value: compatibilityData.nameCompatibility.chiCompatibility.score / 100 },
    { axis: "五行の相性", value: compatibilityData.elementCompatibility.score / 100 },
  ]

  // 六星占術の相性がある場合は追加
  if (compatibilityData.sixStarCompatibility) {
    chartData.push({ axis: "六星占術の相性", value: compatibilityData.sixStarCompatibility.score / 100 })
  }

  // SVGのサイズとレーダーチャートのパラメータ
  const width = 300
  const height = 300
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(centerX, centerY) * 0.8

  // 各軸の角度を計算
  const angleSlice = (Math.PI * 2) / chartData.length

  // 各データポイントのSVG座標を計算
  const points = chartData.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2
    const x = centerX + radius * d.value * Math.cos(angle)
    const y = centerY + radius * d.value * Math.sin(angle)
    return { x, y }
  })

  // ポリゴンのパスを生成
  const polygonPath = points.map((p, i) => `${p.x},${p.y}`).join(" ")

  // 相性スコアに基づく色を決定
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
  }

  // 相性タイプを決定
  const getCompatibilityType = () => {
    const score = compatibilityData.overallScore
    if (score >= 85) return "理想的な相性"
    if (score >= 75) return "とても良い相性"
    if (score >= 65) return "良好な相性"
    if (score >= 55) return "普通の相性"
    if (score >= 45) return "やや課題のある相性"
    if (score >= 35) return "努力が必要な相性"
    return "難しい相性"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>相性分析チャート</CardTitle>
        <CardDescription>
          {compatibilityData.myName} と {compatibilityData.partnerName} の相性
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 transition-colors duration-300 ease-in-out">
              <span className={getScoreColor(compatibilityData.overallScore)}>{compatibilityData.overallScore}</span>
              <span className="text-gray-500 text-lg">点</span>
            </div>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-purple-200"
            >
              {getCompatibilityType()}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="radar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="radar">レーダーチャート</TabsTrigger>
            <TabsTrigger value="bar">バーチャート</TabsTrigger>
          </TabsList>

          <TabsContent value="radar" className="flex justify-center">
            <svg width={width} height={height}>
              {/* 背景の同心円 */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={radius * level}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}

              {/* 軸線 */}
              {chartData.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const lineX = centerX + radius * Math.cos(angle)
                const lineY = centerY + radius * Math.sin(angle)
                return <line key={i} x1={centerX} y1={centerY} x2={lineX} y2={lineY} stroke="#e2e8f0" strokeWidth="1" />
              })}

              {/* 軸ラベル */}
              {chartData.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const labelX = centerX + (radius + 20) * Math.cos(angle)
                const labelY = centerY + (radius + 20) * Math.sin(angle)
                const textAnchor =
                  angle === -Math.PI / 2 ? "middle" : angle < -Math.PI / 2 || angle > Math.PI / 2 ? "end" : "start"
                const alignmentBaseline = angle === 0 ? "middle" : angle > 0 ? "hanging" : "baseline"
                return (
                  <text
                    key={i}
                    x={labelX}
                    y={labelY}
                    textAnchor={textAnchor}
                    dominantBaseline={alignmentBaseline}
                    fontSize="12"
                    fill="#64748b"
                  >
                    {d.axis}
                  </text>
                )
              })}

              {/* データポリゴン */}
              <polygon
                points={polygonPath}
                fill="rgba(147, 51, 234, 0.2)"
                stroke="rgba(147, 51, 234, 0.8)"
                strokeWidth="2"
              />

              {/* データポイント */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="rgba(147, 51, 234, 0.8)" />
              ))}

              {/* スコア表示 */}
              {chartData.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const valueX = centerX + radius * d.value * 0.85 * Math.cos(angle)
                const valueY = centerY + radius * d.value * 0.85 * Math.sin(angle)
                return (
                  <text
                    key={`value-${i}`}
                    x={valueX}
                    y={valueY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#6b21a8"
                  >
                    {Math.round(d.value * 100)}
                  </text>
                )
              })}
            </svg>
          </TabsContent>

          <TabsContent value="bar">
            <div className="space-y-4">
              {chartData.map((d, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{d.axis}</span>
                    <span className="text-sm font-medium">{Math.round(d.value * 100)}点</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${d.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">総合相性スコア</span>
                  <span className={`font-bold text-lg ${getScoreColor(compatibilityData.overallScore)}`}>
                    {compatibilityData.overallScore}点
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${compatibilityData.overallScore}%` }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {compatibilityData.myElement && compatibilityData.partnerElement && (
          <div className="mt-6 p-3 bg-purple-50 rounded-lg text-sm">
            <p className="text-purple-800">
              <span className="font-medium">{compatibilityData.myName}</span>（{compatibilityData.myElement}）と
              <span className="font-medium">{compatibilityData.partnerName}</span>（{compatibilityData.partnerElement}
              ）の 相性は<span className="font-medium">{getCompatibilityType()}</span>です。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
