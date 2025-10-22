"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, Line, LineChart, XAxis, YAxis } from "@/components/ui/chart"

interface FortuneChartProps {
  name: string
  birthdate?: Date
  isPremium?: boolean
}

export function FortuneChart({ name, birthdate, isPremium = false }: FortuneChartProps) {
  const [activeTab, setActiveTab] = useState("yearly")
  const [showInfo, setShowInfo] = useState(false)

  // 年間運気データを生成
  const generateYearlyData = () => {
    const currentYear = new Date().getFullYear()
    const data = []

    for (let i = 0; i < 10; i++) {
      const year = currentYear + i

      // 名前と年からシード値を生成
      const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + year

      // シード値から運気スコアを生成（60〜95の範囲）
      const baseScore = 60 + (seed % 36)

      // 年齢による変動（生年月日がある場合）
      let ageModifier = 0
      if (birthdate) {
        const age = year - birthdate.getFullYear()
        // 人生の節目（10, 20, 30, 40, 50, 60歳）で運気の変動を大きくする
        if (age % 10 === 0) {
          ageModifier = 15 * Math.sin(((seed % 100) / 100) * Math.PI)
        } else {
          ageModifier = 5 * Math.sin(((seed % 100) / 100) * Math.PI)
        }
      }

      // 最終スコアを計算（0〜100の範囲に収める）
      const score = Math.max(0, Math.min(100, Math.round(baseScore + ageModifier)))

      data.push({
        year: year.toString(),
        score: score,
        // 運気の種類を決定
        type: score >= 80 ? "大吉" : score >= 70 ? "吉" : score >= 60 ? "中吉" : score >= 50 ? "小吉" : "凶",
      })
    }

    return data
  }

  // 月間運気データを生成
  const generateMonthlyData = () => {
    const currentYear = new Date().getFullYear()
    const data = []
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

    for (let i = 0; i < 12; i++) {
      // 名前と月からシード値を生成
      const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + currentYear + i

      // シード値から運気スコアを生成（50〜95の範囲）
      const baseScore = 50 + (seed % 46)

      // 季節による変動
      const seasonModifier = 10 * Math.sin((i / 12) * Math.PI * 2)

      // 最終スコアを計算（0〜100の範囲に収める）
      const score = Math.max(0, Math.min(100, Math.round(baseScore + seasonModifier)))

      data.push({
        month: months[i],
        score: score,
        // 運気の種類を決定
        type: score >= 80 ? "大吉" : score >= 70 ? "吉" : score >= 60 ? "中吉" : score >= 50 ? "小吉" : "凶",
      })
    }

    return data
  }

  // 人生全体の運気データを生成
  const generateLifeData = () => {
    if (!birthdate) return []

    const birthYear = birthdate.getFullYear()
    const currentYear = new Date().getFullYear()
    const data = []

    // 0歳から80歳までの運気を生成
    for (let age = 0; age <= 80; age++) {
      const year = birthYear + age

      // 名前と年齢からシード値を生成
      const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + year

      // 基本スコア（60〜90の範囲）
      const baseScore = 60 + (seed % 31)

      // 年齢による変動パターン
      // 0-10歳: 上昇期、10-20歳: 変動期、20-40歳: 安定期、40-60歳: 充実期、60-80歳: 円熟期
      let ageModifier = 0

      if (age <= 10) {
        // 上昇期: 徐々に上昇
        ageModifier = age * 1.5
      } else if (age <= 20) {
        // 変動期: 大きく変動
        ageModifier = 15 * Math.sin(((age - 10) / 10) * Math.PI)
      } else if (age <= 40) {
        // 安定期: 小さな変動
        ageModifier = 5 * Math.sin(((age - 20) / 20) * Math.PI * 4)
      } else if (age <= 60) {
        // 充実期: 緩やかな上昇後、下降
        ageModifier = 10 * Math.sin(((age - 40) / 20) * Math.PI)
      } else {
        // 円熟期: 緩やかな変動
        ageModifier = 8 * Math.sin(((age - 60) / 20) * Math.PI * 2)
      }

      // 人生の節目（10, 20, 30, 40, 50, 60, 70, 80歳）で運気の変動を大きくする
      if (age % 10 === 0) {
        ageModifier += 10 * Math.sin(((seed % 100) / 100) * Math.PI)
      }

      // 最終スコアを計算（0〜100の範囲に収める）
      const score = Math.max(0, Math.min(100, Math.round(baseScore + ageModifier)))

      data.push({
        age: age.toString(),
        year: year.toString(),
        score: score,
        // 運気の種類を決定
        type: score >= 80 ? "大吉" : score >= 70 ? "吉" : score >= 60 ? "中吉" : score >= 50 ? "小吉" : "凶",
        // 現在の年齢かどうか
        isCurrent: year === currentYear,
      })
    }

    return data
  }

  const yearlyData = generateYearlyData()
  const monthlyData = generateMonthlyData()
  const lifeData = generateLifeData()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>運気グラフ</CardTitle>
            <CardDescription>
              {name}さんの運気の流れを視覚化
              {!birthdate && " (生年月日が設定されていないため、一部機能が制限されています)"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showInfo && (
          <div className="mb-4 p-3 bg-muted rounded-md text-sm">
            <p>
              このグラフは姓名判断の結果と生年月日（設定されている場合）に基づいて、運気の流れを視覚化したものです。
              実際の運勢を保証するものではなく、参考情報としてご利用ください。
            </p>
          </div>
        )}

        <Tabs defaultValue="yearly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="yearly">年間運気</TabsTrigger>
            <TabsTrigger value="monthly">月間運気</TabsTrigger>
            <TabsTrigger value="life" disabled={!birthdate || !isPremium}>
              人生運気
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yearly">
            <div className="h-[300px] w-full border rounded-md p-4">
              <ChartContainer>
                <LineChart data={yearlyData}>
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    strokeWidth={2}
                    activeDot={{ r: 6, style: { fill: "var(--primary)" } }}
                    style={{
                      stroke: "var(--primary)",
                    }}
                    label={(props) => {
                      const { x, y, value } = props
                      return (
                        <text x={x} y={y - 10} fill="var(--primary)" fontSize={12} textAnchor="middle">
                          {value}
                        </text>
                      )
                    }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <ChartTooltipContent>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">{data.year}年</p>
                              <p className="text-sm text-muted-foreground">
                                運気スコア: <span className="font-medium">{data.score}</span>
                              </p>
                              <Badge
                                variant="outline"
                                className={`
                                  ${data.type === "大吉" ? "bg-red-100 text-red-800 border-red-200" : ""}
                                  ${data.type === "吉" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                  ${data.type === "中吉" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                  ${data.type === "小吉" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                                  ${data.type === "凶" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                                `}
                              >
                                {data.type}
                              </Badge>
                            </div>
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {yearlyData.slice(0, 5).map((item, index) => (
                <div key={index} className="text-center">
                  <Badge
                    variant="outline"
                    className={`
                      ${item.type === "大吉" ? "bg-red-100 text-red-800 border-red-200" : ""}
                      ${item.type === "吉" ? "bg-green-100 text-green-800 border-green-200" : ""}
                      ${item.type === "中吉" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                      ${item.type === "小吉" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                      ${item.type === "凶" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                    `}
                  >
                    {item.type}
                  </Badge>
                  <p className="text-xs mt-1">{item.year}年</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="h-[300px] w-full border rounded-md p-4">
              <ChartContainer>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    strokeWidth={2}
                    activeDot={{ r: 6, style: { fill: "var(--primary)" } }}
                    style={{
                      stroke: "var(--primary)",
                    }}
                    label={(props) => {
                      const { x, y, value } = props
                      return (
                        <text x={x} y={y - 10} fill="var(--primary)" fontSize={12} textAnchor="middle">
                          {value}
                        </text>
                      )
                    }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <ChartTooltipContent>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">{data.month}</p>
                              <p className="text-sm text-muted-foreground">
                                運気スコア: <span className="font-medium">{data.score}</span>
                              </p>
                              <Badge
                                variant="outline"
                                className={`
                                  ${data.type === "大吉" ? "bg-red-100 text-red-800 border-red-200" : ""}
                                  ${data.type === "吉" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                  ${data.type === "中吉" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                  ${data.type === "小吉" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                                  ${data.type === "凶" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                                `}
                              >
                                {data.type}
                              </Badge>
                            </div>
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2">
              {monthlyData.slice(0, 6).map((item, index) => (
                <div key={index} className="text-center">
                  <Badge
                    variant="outline"
                    className={`
                      ${item.type === "大吉" ? "bg-red-100 text-red-800 border-red-200" : ""}
                      ${item.type === "吉" ? "bg-green-100 text-green-800 border-green-200" : ""}
                      ${item.type === "中吉" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                      ${item.type === "小吉" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                      ${item.type === "凶" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                    `}
                  >
                    {item.type}
                  </Badge>
                  <p className="text-xs mt-1">{item.month}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="life">
            {isPremium && birthdate ? (
              <>
                <div className="h-[300px] w-full border rounded-md p-4">
                  <ChartContainer>
                    <LineChart data={lifeData}>
                      <XAxis dataKey="age" />
                      <YAxis domain={[0, 100]} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        strokeWidth={2}
                        activeDot={{ r: 6, style: { fill: "var(--primary)" } }}
                        style={{
                          stroke: "var(--primary)",
                        }}
                        label={(props) => {
                          // 人生運気グラフは点が多いので、10歳ごとなど特定のポイントだけにラベルを表示
                          const { x, y, value, index, payload } = props

                          // payload が存在し、age プロパティがある場合のみ処理
                          if (payload && payload.age) {
                            // 10歳ごとまたは現在の年齢の場合のみラベルを表示
                            if (Number(payload.age) % 10 === 0 || payload.isCurrent) {
                              return (
                                <text
                                  x={x}
                                  y={y - 10}
                                  fill={payload.isCurrent ? "var(--primary)" : "var(--muted-foreground)"}
                                  fontSize={12}
                                  fontWeight={payload.isCurrent ? "bold" : "normal"}
                                  textAnchor="middle"
                                >
                                  {value}
                                </text>
                              )
                            }
                          }
                          return null
                        }}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <ChartTooltipContent>
                                <div className="flex flex-col gap-1">
                                  <p className="text-sm font-medium">
                                    {data.age}歳 ({data.year}年)
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    運気スコア: <span className="font-medium">{data.score}</span>
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${data.type === "大吉" ? "bg-red-100 text-red-800 border-red-200" : ""}
                                      ${data.type === "吉" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                      ${data.type === "中吉" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                      ${data.type === "小吉" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                                      ${data.type === "凶" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                                    `}
                                  >
                                    {data.type}
                                  </Badge>
                                  {data.isCurrent && <Badge className="mt-1">現在</Badge>}
                                </div>
                              </ChartTooltipContent>
                            )
                          }
                          return null
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">人生の節目</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-1">上昇期 (0-10歳)</h5>
                      <p className="text-xs">基礎を築く時期。教育や家庭環境が重要な影響を与えます。</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">変動期 (10-20歳)</h5>
                      <p className="text-xs">自己形成の時期。様々な経験を通じて価値観が形成されます。</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">安定期 (20-40歳)</h5>
                      <p className="text-xs">社会的基盤を確立する時期。キャリアや家庭を築きます。</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">充実期 (40-60歳)</h5>
                      <p className="text-xs">人生の収穫期。これまでの経験が実を結び、社会的地位も安定します。</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">円熟期 (60-80歳)</h5>
                      <p className="text-xs">知恵と経験を活かす時期。精神的な充実と次世代への継承が重要になります。</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  人生運気グラフはプレミアム会員限定機能です。また、生年月日の設定が必要です。
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!isPremium && activeTab !== "life" && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg text-center">
            <p className="text-sm font-medium text-amber-800">
              プレミアム会員になると、人生全体の運気グラフや詳細な運気分析が見られます
            </p>
            <p className="text-xs text-amber-700 mt-1">月額550円（ワンコイン程度）でご利用いただけます</p>
            <Button variant="default" size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
              プレミアムに登録
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
