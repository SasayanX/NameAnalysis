"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, Clock, Lock } from "lucide-react"

interface DailyFortuneProps {
  userPlan: "free" | "basic" | "premium"
}

const fortuneData = {
  free: {
    level: "吉",
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "今日は良い一日になりそうです",
    advice: "積極的に行動してみましょう",
    showUpgrade: true,
  },
  basic: {
    level: "中吉",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "今日は良い一日になりそうです。特に午前中が好調です",
    advice: "新しいことにチャレンジするのに適した日。人との出会いを大切に",
    timeDetails: "午前：◎ 午後：○ 夜：△",
    showUpgrade: true,
  },
  premium: {
    level: "中吉（7/10）",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "今日は良い一日になりそうです。特に10-12時、15-17時が最高潮",
    advice: "新しいことにチャレンジするのに適した日。人との出会いを大切に。東南方向への移動が吉",
    timeDetails: "6-9時：○ 10-12時：◎ 13-15時：△ 15-17時：◎ 18-21時：○",
    direction: "吉方位：東南、南 / 注意方位：北西",
    showUpgrade: false,
  },
}

export default function DailyFortuneDisplay({ userPlan }: DailyFortuneProps) {
  const fortune = fortuneData[userPlan]

  return (
    <div className="space-y-4">
      {/* 今日の運勢 */}
      <Card className={`${fortune.bgColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${fortune.color}`} />
              今日の運勢
            </CardTitle>
            <Badge className={`${fortune.color} bg-white`}>{fortune.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">{fortune.description}</p>
          <p className="text-sm text-gray-600">{fortune.advice}</p>

          {userPlan !== "free" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">時間帯別運勢</span>
              </div>
              <p className="text-sm text-gray-600">{fortune.timeDetails}</p>
            </div>
          )}

          {userPlan === "premium" && fortune.direction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">方位・方角</span>
              </div>
              <p className="text-sm text-gray-600">{fortune.direction}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* アップグレード誘導 */}
      {fortune.showUpgrade && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4 text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">
              {userPlan === "free" ? "明日以降の運勢も見てみませんか？" : "さらに詳しい運勢分析"}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {userPlan === "free"
                ? "ベーシックプランなら1週間先まで、時間帯別の詳細運勢が分かります"
                : "プレミアムプランなら時間別・方位別の超詳細分析が可能です"}
            </p>
            <Button size="sm" className={userPlan === "free" ? "bg-blue-600" : "bg-purple-600"}>
              {userPlan === "free" ? "ベーシックにアップグレード" : "プレミアムにアップグレード"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
