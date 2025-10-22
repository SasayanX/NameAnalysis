"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { calculateDailyFortune } from "@/lib/six-star-fortune"
import { calculateDailyFiveElements } from "@/lib/five-elements"
import { HeartIcon, ActivityIcon, BrainIcon } from "lucide-react"
import type { SixStar, SixStarType } from "@/lib/six-star-fortune"

interface DailyFortuneCardProps {
  birthStar?: { star: SixStar; type: SixStarType }
  isPremium?: boolean
  premiumLevel?: number // 0: 無料, 1: ベーシック(220円), 2: プレミアム(440円)
}

// 色名から実際のTailwindカラークラスへのマッピング
const colorMapping: Record<string, string> = {
  // 基本色
  赤: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800",
  青: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800",
  緑: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800",
  黄: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800",
  黒: "bg-gray-800 text-white border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800",
  白: "bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600",
  紫: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800",
  ピンク: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-800",
  オレンジ:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-800",
  茶: "bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800",
  シルバー: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600",
  ゴールド:
    "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800",
  青緑: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900 dark:text-teal-100 dark:border-teal-800",
  紅: "bg-indigo-800 text-white border-indigo-700 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-800",

  // 食べ物の色
  緑の野菜: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800",
  赤い果物: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800",
  黄色の野菜と果物:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800",
  白い食べ物: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600",
  黒い食べ物: "bg-gray-800 text-white border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800",
  根菜類: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800",
  豆類: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-800",
  雑穀: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800",
  玄米: "bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800",
  ハーブティー:
    "bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800",
  酸味のある食べ物:
    "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900 dark:text-lime-100 dark:border-lime-800",
  苦味のある食べ物:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800",
  甘味のある食べ物:
    "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-800",
  辛味のある食べ物: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800",
  塩味のある食べ物: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800",
}

// 色や食べ物の名前からスタイルを取得する関数
const getStyleForItem = (item: string): string => {
  // 完全一致で検索
  if (colorMapping[item]) {
    return colorMapping[item]
  }

  // 部分一致で検索（「〜を含む」など）
  for (const [key, value] of Object.entries(colorMapping)) {
    if (item.includes(key)) {
      return value
    }
  }

  // デフォルトスタイル
  return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
}

export function DailyFortuneCard({
  birthStar = { star: "水星", type: "+" },
  isPremium = false,
  premiumLevel = 0,
}: DailyFortuneCardProps) {
  const [fortune, setFortune] = useState<ReturnType<typeof calculateDailyFortune> | null>(null)
  const [elements, setElements] = useState<ReturnType<typeof calculateDailyFiveElements> | null>(null)
  const [showMore, setShowMore] = useState(false)

  // birthStarを安定化するためのメモ化
  const stableBirthStar = useMemo(() => {
    return {
      star: birthStar?.star || "水星",
      type: birthStar?.type || "+",
    }
  }, [birthStar])

  // 運勢計算を一度だけ実行
  useEffect(() => {
    try {
      // 六星占術の日運を計算
      const fortuneResult = calculateDailyFortune(stableBirthStar)
      setFortune(fortuneResult)

      // 陰陽五行の日運を計算
      const elementsResult = calculateDailyFiveElements()
      setElements(elementsResult)
    } catch (error) {
      console.error("Error calculating daily fortune:", error)
      // エラー時のデフォルト値を設定
      setFortune({
        luckScore: 50,
        healthScore: 50,
        relationshipScore: 50,
        advice: "今日も一日頑張りましょう。",
      })
      setElements({
        dayElement: "木",
        dayYinYang: "陽",
        luckyColors: ["緑"],
        recommendedFoods: ["緑の野菜"],
        healthAdvice: "バランスの良い食事を心がけましょう。",
      })
    }
  }, [stableBirthStar]) // 安定した依存関係

  if (!fortune || !elements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>今日の運勢</CardTitle>
          <CardDescription>データを読み込んでいます...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const today = new Date()
  const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white dark:from-indigo-600 dark:to-purple-800">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>今日の運勢</CardTitle>
            <CardDescription className="text-white/80">{dateString}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {`${stableBirthStar.star}人${stableBirthStar.type}`}
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {elements.dayElement}の日 ({elements.dayYinYang})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <span className="font-medium">運気スコア</span>
            </div>
            <span className="font-bold">{fortune.luckScore}点</span>
          </div>
          <Progress value={fortune.luckScore} className="h-2 bg-gray-100 dark:bg-gray-700" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HeartIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="font-medium">健康スコア</span>
            </div>
            <span className="font-bold">{fortune.healthScore}点</span>
          </div>
          <Progress value={fortune.healthScore} className="h-2 bg-gray-100 dark:bg-gray-700" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="font-medium">人間関係スコア</span>
            </div>
            <span className="font-bold">{fortune.relationshipScore}点</span>
          </div>
          <Progress value={fortune.relationshipScore} className="h-2 bg-gray-100 dark:bg-gray-700" />
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
          <p className="text-sm text-gray-700 dark:text-gray-200">{fortune.advice}</p>
        </div>

        {showMore && (
          <div className="mt-4 pt-4 border-t border-dashed">
            {/* ベーシック会員(220円)以上で表示 */}
            {premiumLevel >= 1 && (
              <>
                <h4 className="font-medium mb-2">今日のラッキーカラー</h4>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {elements.luckyColors.map((color, index) => (
                    <Badge key={index} variant="outline" className={getStyleForItem(color)}>
                      {color}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {/* プレミアム会員(440円)で表示 */}
            {premiumLevel >= 2 && (
              <>
                <h4 className="font-medium mb-2">おすすめの食べ物</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {elements.recommendedFoods.map((food, index) => (
                    <Badge key={index} variant="outline" className={getStyleForItem(food)}>
                      {food}
                    </Badge>
                  ))}
                </div>

                <h4 className="font-medium mb-2">健康アドバイス</h4>
                <p className="text-sm text-gray-700 dark:text-gray-200">{elements.healthAdvice}</p>
              </>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 bg-transparent"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "閉じる" : "詳細を見る"}
        </Button>

        {!isPremium && showMore && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-lg text-center">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {premiumLevel === 0
                ? "ベーシック会員(220円/月)になると、今日のラッキーカラーが見られます"
                : "プレミアム会員(440円/月)になると、おすすめの食べ物と健康アドバイスも見られます"}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">月額440円でプレミアム機能が使えます</p>
            <Button
              variant="default"
              size="sm"
              className="mt-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {premiumLevel === 0 ? "ベーシックに登録" : "プレミアムに登録"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
