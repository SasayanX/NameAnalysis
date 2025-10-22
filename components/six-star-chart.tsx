"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { sixStarData, type SixStar, type SixStarType } from "@/lib/six-star-fortune"

interface SixStarChartProps {
  birthStar: { star: SixStar; type: SixStarType }
  isPremium?: boolean
}

export function SixStarChart({ birthStar, isPremium = false }: SixStarChartProps) {
  const [activeTab, setActiveTab] = useState("personality")

  const starData = sixStarData[birthStar.star]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>六星占術分析</CardTitle>
            <CardDescription>
              あなたの運命星: {typeof birthStar.star === "string" ? `${birthStar.star}人${birthStar.type}` : "未設定"}
            </CardDescription>
          </div>
          <Badge
            className={`
            ${birthStar.star === "水星" ? "bg-blue-100 text-blue-800" : ""}
            ${birthStar.star === "金星" ? "bg-yellow-100 text-yellow-800" : ""}
            ${birthStar.star === "木星" ? "bg-green-100 text-green-800" : ""}
            ${birthStar.star === "火星" ? "bg-red-100 text-red-800" : ""}
            ${birthStar.star === "土星" ? "bg-amber-100 text-amber-800" : ""}
            ${birthStar.star === "月星" ? "bg-purple-100 text-purple-800" : ""}
          `}
          >
            {starData.element}の気
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personality" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personality">性格</TabsTrigger>
            <TabsTrigger value="strengths">強み</TabsTrigger>
            <TabsTrigger value="health">健康</TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p>{starData.personality}</p>
              <p className="mt-2 text-sm text-gray-600">
                {birthStar.type === "+"
                  ? "プラスタイプは、より外向的で積極的な傾向があります。"
                  : "マイナスタイプは、より内向的で慎重な傾向があります。"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">強み</h4>
                <p className="text-sm">{starData.strength}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-1">弱み</h4>
                <p className="text-sm">{starData.weakness}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strengths">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">あなたの強み</h4>
                <p>{starData.strength}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {birthStar.star}人{birthStar.type}の特徴:
                  {birthStar.type === "+"
                    ? " 行動力があり、自分の意見をはっきり表現できます。"
                    : " 思慮深く、安定感があります。"}
                </p>
              </div>

              {isPremium ? (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-800 mb-2">強みを活かすアドバイス</h4>
                  <p className="text-sm">
                    {birthStar.star}人{birthStar.type}の特性を活かすには、{starData.element}
                    の気を高める活動が効果的です。
                    {birthStar.star === "水星" && "知的好奇心を満たす学びの時間を作りましょう。"}
                    {birthStar.star === "金星" && "芸術や美に触れる機会を増やしましょう。"}
                    {birthStar.star === "木星" && "新しい可能性を探求する冒険を計画しましょう。"}
                    {birthStar.star === "火星" && "情熱を注げるプロジェクトに取り組みましょう。"}
                    {birthStar.star === "土星" && "長期的な目標を立て、着実に進めましょう。"}
                    {birthStar.star === "月星" && "感性を磨く瞑想や創作活動を取り入れましょう。"}
                    {birthStar.type === "+"
                      ? " プラスタイプは時に焦りがちなので、立ち止まって考える時間も大切にしましょう。"
                      : " マイナスタイプは慎重になりすぎることがあるので、時には直感を信じて行動してみましょう。"}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-sm font-medium text-amber-800">
                    プレミアム会員になると、強みを活かすための詳細なアドバイスが見られます
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">健康リスク</h4>
                <p>{starData.healthRisk}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {birthStar.type === "+"
                    ? "プラスタイプは過労に注意が必要です。"
                    : "マイナスタイプはストレスの蓄積に注意が必要です。"}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">ラッキーカラー</h4>
                <div className="flex gap-2">
                  {starData.luckyColor.split("、").map((color, index) => (
                    <Badge key={index} variant="outline" className="bg-white">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {!isPremium && (
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-sm font-medium text-amber-800">
                    プレミアム会員になると、週間健康予報や体調管理アドバイスが見られます
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
