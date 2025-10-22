"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface FiveElementsChartProps {
  elements: {
    woodCount: number
    fireCount: number
    earthCount: number
    metalCount: number
    waterCount: number
    dominantElement: string
    weakElement: string
  }
  healthAdvice?: {
    generalAdvice: string
    weeklyHealthForecast: string[]
    balanceAdvice: string
  }
  isPremium?: boolean
}

export function FiveElementsChart({ elements, healthAdvice, isPremium = false }: FiveElementsChartProps) {
  // 各要素の最大値を計算
  const maxCount = Math.max(
    elements.woodCount,
    elements.fireCount,
    elements.earthCount,
    elements.metalCount,
    elements.waterCount,
  )

  // 各要素のパーセンテージを計算
  const totalCount =
    elements.woodCount + elements.fireCount + elements.earthCount + elements.metalCount + elements.waterCount
  const woodPercent = Math.round((elements.woodCount / totalCount) * 100)
  const firePercent = Math.round((elements.fireCount / totalCount) * 100)
  const earthPercent = Math.round((elements.earthCount / totalCount) * 100)
  const metalPercent = Math.round((elements.metalCount / totalCount) * 100)
  const waterPercent = Math.round((elements.waterCount / totalCount) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>陰陽五行分析</CardTitle>
            <CardDescription>あなたの名前に含まれる五行のバランス</CardDescription>
          </div>
          <Badge
            className={`
            ${elements.dominantElement === "木" ? "bg-green-100 text-green-800" : ""}
            ${elements.dominantElement === "火" ? "bg-red-100 text-red-800" : ""}
            ${elements.dominantElement === "土" ? "bg-amber-100 text-amber-800" : ""}
            ${elements.dominantElement === "金" ? "bg-yellow-100 text-yellow-800" : ""}
            ${elements.dominantElement === "水" ? "bg-blue-100 text-blue-800" : ""}
          `}
          >
            {elements.dominantElement}が優勢
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">木 ({elements.woodCount})</span>
            </div>
            <span className="text-sm">{woodPercent}%</span>
          </div>
          <Progress
            value={(elements.woodCount / maxCount) * 100}
            className="h-2 bg-gray-100"
            indicatorClassName="bg-green-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">火 ({elements.fireCount})</span>
            </div>
            <span className="text-sm">{firePercent}%</span>
          </div>
          <Progress
            value={(elements.fireCount / maxCount) * 100}
            className="h-2 bg-gray-100"
            indicatorClassName="bg-red-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="font-medium">土 ({elements.earthCount})</span>
            </div>
            <span className="text-sm">{earthPercent}%</span>
          </div>
          <Progress
            value={(elements.earthCount / maxCount) * 100}
            className="h-2 bg-gray-100"
            indicatorClassName="bg-amber-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">金 ({elements.metalCount})</span>
            </div>
            <span className="text-sm">{metalPercent}%</span>
          </div>
          <Progress
            value={(elements.metalCount / maxCount) * 100}
            className="h-2 bg-gray-100"
            indicatorClassName="bg-yellow-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">水 ({elements.waterCount})</span>
            </div>
            <span className="text-sm">{waterPercent}%</span>
          </div>
          <Progress
            value={(elements.waterCount / maxCount) * 100}
            className="h-2 bg-gray-100"
            indicatorClassName="bg-blue-500"
          />
        </div>

        {healthAdvice && (
          <div className="p-4 bg-gray-50 rounded-lg mt-2">
            <h4 className="font-medium mb-2">五行バランス分析</h4>
            <p className="text-sm">{healthAdvice.generalAdvice}</p>

            {isPremium && (
              <>
                <h4 className="font-medium mt-4 mb-2">バランス調整アドバイス</h4>
                <p className="text-sm">{healthAdvice.balanceAdvice}</p>

                <h4 className="font-medium mt-4 mb-2">週間健康予報</h4>
                <div className="space-y-2">
                  {healthAdvice.weeklyHealthForecast.slice(0, 3).map((forecast, index) => (
                    <p key={index} className="text-sm">
                      {forecast}
                    </p>
                  ))}
                  {!isPremium && healthAdvice.weeklyHealthForecast.length > 3 && (
                    <p className="text-sm text-gray-500">プレミアム会員になると、残りの予報も見られます...</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {!isPremium && (
          <div className="p-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg text-center">
            <p className="text-sm font-medium text-amber-800">
              プレミアム会員になると、詳細な健康アドバイスと週間予報が見られます
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
