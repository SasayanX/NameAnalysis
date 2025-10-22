"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface FortuneCalendarProps {
  userElements?: {
    dominantElement: "木" | "火" | "土" | "金" | "水"
    weakElement: "木" | "火" | "土" | "金" | "水"
  }
  isPremium?: boolean
  isPro?: boolean // プロプランかどうかを示すプロパティを追加
}

// 五行の色マッピング
const elementColors = {
  木: "bg-green-500",
  火: "bg-red-500",
  土: "bg-amber-500",
  金: "bg-yellow-500",
  水: "bg-blue-500",
}

// 五行の薄い色マッピング
const elementLightColors = {
  木: "bg-green-100 text-green-800 border-green-200",
  火: "bg-red-100 text-red-800 border-red-200",
  土: "bg-amber-100 text-amber-800 border-amber-200",
  金: "bg-yellow-100 text-yellow-800 border-yellow-200",
  水: "bg-blue-100 text-blue-800 border-blue-200",
}

// 季節と五行の関係
const seasonToElement = {
  spring: "木",
  summer: "火",
  lateSum: "土",
  autumn: "金",
  winter: "水",
}

// 月と季節の関係
const monthToSeason = {
  0: "winter", // 1月
  1: "winter", // 2月
  2: "spring", // 3月
  3: "spring", // 4月
  4: "spring", // 5月
  5: "summer", // 6月
  6: "summer", // 7月
  7: "lateSum", // 8月
  8: "autumn", // 9月
  9: "autumn", // 10月
  10: "autumn", // 11月
  11: "winter", // 12月
}

export function FortuneCalendar({ userElements, isPremium = false, isPro = false }: FortuneCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; element: string; score: number }>>([])
  const [activeTab, setActiveTab] = useState("calendar")

  // 現在の月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // 現在の季節を取得
  const currentSeason = monthToSeason[currentDate.getMonth() as keyof typeof monthToSeason]
  const seasonElement = seasonToElement[currentSeason as keyof typeof seasonToElement]

  // カレンダーの日付を生成
  useEffect(() => {
    const days = []
    // 月の最初の日の曜日を取得（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // 前月の日を追加
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i)
      days.push({
        date,
        element: generateDailyElement(date),
        score: calculateDailyScore(date, userElements),
      })
    }

    // 現在の月の日を追加
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      days.push({
        date,
        element: generateDailyElement(date),
        score: calculateDailyScore(date, userElements),
      })
    }

    // 次月の日を追加（6週間分になるまで）
    const daysNeeded = 42 - days.length
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      days.push({
        date,
        element: generateDailyElement(date),
        score: calculateDailyScore(date, userElements),
      })
    }

    setCalendarDays(days)

    // 今日の日付を選択
    const today = new Date()
    if (today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth()) {
      setSelectedDate(today)
    } else if (!selectedDate) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
    }
  }, [currentDate, userElements])

  // 日付から五行要素を生成（簡易版）
  function generateDailyElement(date: Date): string {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    const elements = ["木", "火", "土", "金", "水"]
    return elements[dayOfYear % 5]
  }

  // 日付からスコアを計算（ユーザーの五行との相性）
  function calculateDailyScore(date: Date, userElements?: { dominantElement: string; weakElement: string }): number {
    if (!userElements) return 50 // デフォルト値

    const dayElement = generateDailyElement(date)

    // 相性スコアの基本値
    let score = 50

    // 日の五行がユーザーの弱い五行と同じ場合、スコアアップ
    if (dayElement === userElements.weakElement) {
      score += 30
    }

    // 日の五行がユーザーの強い五行と同じ場合、スコアアップ（ただし弱い五行ほどではない）
    if (dayElement === userElements.dominantElement) {
      score += 10
    }

    // 季節の影響
    const season = monthToSeason[date.getMonth() as keyof typeof monthToSeason]
    const seasonElement = seasonToElement[season as keyof typeof seasonToElement]

    // 季節の五行と日の五行が一致する場合、その五行の影響が強まる
    if (dayElement === seasonElement) {
      // 季節の五行がユーザーの弱い五行と一致する場合、さらにスコアアップ
      if (seasonElement === userElements.weakElement) {
        score += 10
      }
    }

    // 日付による変動（-10〜+10）
    const dateVariation = Math.sin(date.getDate() * 0.7) * 10
    score += dateVariation

    return Math.min(100, Math.max(0, Math.round(score)))
  }

  // 前月へ
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 次月へ
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 今月へ
  const currentMonth = () => {
    setCurrentDate(new Date())
  }

  // 日付を選択
  const selectDate = (date: Date) => {
    setSelectedDate(date)
  }

  // 選択された日付の詳細情報
  const selectedDateDetails = selectedDate
    ? {
        element: generateDailyElement(selectedDate),
        score: calculateDailyScore(selectedDate, userElements),
        date: selectedDate,
        advice: generateDailyAdvice(selectedDate, userElements),
        activities: generateRecommendedActivities(selectedDate, userElements),
        foods: generateRecommendedFoods(selectedDate, userElements),
      }
    : null

  // 日付からアドバイスを生成
  function generateDailyAdvice(date: Date, userElements?: { dominantElement: string; weakElement: string }): string {
    const dayElement = generateDailyElement(date)
    const score = calculateDailyScore(date, userElements)

    if (!userElements) return "あなたの五行情報がないため、一般的なアドバイスとなります。"

    // プロプランでは「〇の気を高める」アドバイスを表示しない
    if (isPro && !isPremium) {
      if (score >= 80) {
        return `今日は${dayElement}の気が強く、バランスの取れた一日になりそうです。積極的に行動するとよいでしょう。`
      } else if (score >= 60) {
        return `今日は${dayElement}の気が適度に流れており、バランスの取れた一日になりそうです。無理せず計画通りに進めましょう。`
      } else if (score >= 40) {
        return `今日は${dayElement}の気が普通に流れています。特別なことはせず、日常を大切にしましょう。`
      } else {
        return `今日は${dayElement}の気の流れがやや弱い日です。重要な決断は避け、静かに過ごすことをおすすめします。`
      }
    } else {
      // プレミアムプランまたは通常プランでは元のアドバイスを表示
      if (score >= 80) {
        return `今日は${dayElement}の気が強く、あなたの弱い五行（${userElements.weakElement}）を補うのに最適な日です。積極的に行動し、新しいことに挑戦するとよいでしょう。`
      } else if (score >= 60) {
        return `今日は${dayElement}の気が適度に流れており、バランスの取れた一日になりそうです。無理せず計画通りに進めましょう。`
      } else if (score >= 40) {
        return `今日は${dayElement}の気が普通に流れています。特別なことはせず、日常を大切にしましょう。`
      } else {
        return `今日は${dayElement}の気があなたの強い五行（${userElements.dominantElement}）と調和しにくい日です。重要な決断は避け、静かに過ごすことをおすすめします。`
      }
    }
  }

  // 日付からおすすめの活動を生成
  function generateRecommendedActivities(
    date: Date,
    userElements?: { dominantElement: string; weakElement: string },
  ): string[] {
    const dayElement = generateDailyElement(date)

    switch (dayElement) {
      case "木":
        return ["ウォーキング", "ストレッチ", "新しい計画を立てる", "創造的な活動", "自然の中で過ごす"]
      case "火":
        return ["有酸素運動", "社交活動", "プレゼンテーション", "情熱を注ぐ活動", "明るい場所で過ごす"]
      case "土":
        return ["瞑想", "ガーデニング", "家族との時間", "整理整頓", "安定した環境で過ごす"]
      case "金":
        return ["筋力トレーニング", "精密な作業", "分析的思考", "芸術鑑賞", "洗練された環境で過ごす"]
      case "水":
        return ["水泳", "読書", "内省的な活動", "創造的思考", "静かな環境で過ごす"]
      default:
        return []
    }
  }

  // 日付からおすすめの食べ物を生成
  function generateRecommendedFoods(
    date: Date,
    userElements?: { dominantElement: string; weakElement: string },
  ): string[] {
    const dayElement = generateDailyElement(date)

    switch (dayElement) {
      case "木":
        return ["緑の野菜", "酸味のある食品", "新鮮な果物", "発酵食品", "ハーブティー"]
      case "火":
        return ["赤い食品", "スパイシーな食品", "温かい食事", "ビタミン豊富な食品", "ハーブティー"]
      case "土":
        return ["黄色や茶色の食品", "根菜類", "甘味のある食品", "バランスの取れた食事", "ハーブティー"]
      case "金":
        return ["白い食品", "辛味のある食品", "ミネラル豊富な食品", "乾燥食品", "ハーブティー"]
      case "水":
        return ["黒や濃紺色の食品", "塩味のある食品", "水分豊富な食品", "魚介類", "ハーブティー"]
      default:
        return []
    }
  }

  // 月間サマリーを生成
  function generateMonthlySummary(): { text: string; goodDays: number[]; badDays: number[] } {
    // 良い日と悪い日を抽出
    const currentMonthDays = calendarDays.filter((day) => day.date.getMonth() === currentDate.getMonth())

    const goodDays = currentMonthDays.filter((day) => day.score >= 80).map((day) => day.date.getDate())

    const badDays = currentMonthDays.filter((day) => day.score <= 30).map((day) => day.date.getDate())

    // 月間の傾向テキスト
    let text = ""
    const monthName = currentDate.toLocaleString("ja-JP", { month: "long" })

    if (!userElements) {
      text = `${monthName}は一般的に${seasonElement}の気が強まる時期です。`
    } else {
      // プロプランでは「〇の気を高める」アドバイスを表示しない
      if (isPro && !isPremium) {
        text = `${monthName}は${seasonElement}の気が強まる時期です。バランスを意識して過ごしましょう。`
      } else {
        // プレミアムプランまたは通常プランでは元のアドバイスを表示
        if (seasonElement === userElements.weakElement) {
          text = `${monthName}は${seasonElement}の気が強まる時期で、あなたの弱い五行（${userElements.weakElement}）を補うのに適した月です。積極的に行動しましょう。`
        } else if (seasonElement === userElements.dominantElement) {
          text = `${monthName}は${seasonElement}の気が強まる時期で、あなたの強い五行（${userElements.dominantElement}）がさらに強まります。バランスを意識して過ごしましょう。`
        } else {
          text = `${monthName}は${seasonElement}の気が強まる時期です。あなたの五行バランスを意識して過ごしましょう。`
        }
      }
    }

    return { text, goodDays, badDays }
  }

  const monthlySummary = generateMonthlySummary()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>運気カレンダー</CardTitle>
            <CardDescription>五行の流れとあなたの相性を日ごとに表示</CardDescription>
          </div>
          <Badge className={elementLightColors[seasonElement as keyof typeof elementLightColors]}>
            {seasonElement}の季節
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            <TabsTrigger value="monthly">月間サマリー</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {/* カレンダーヘッダー */}
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">
                {currentDate.toLocaleString("ja-JP", { year: "numeric", month: "long" })}
              </h3>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={currentMonth}>
                  今月
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                <div
                  key={i}
                  className={cn("text-sm font-medium py-1", i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "")}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダー日付 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isCurrentMonth = day.date.getMonth() === currentDate.getMonth()
                const isToday = day.date.toDateString() === new Date().toDateString()
                const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()

                return (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "relative h-12 rounded-md flex flex-col items-center justify-center p-1 hover:bg-gray-100 transition-colors",
                            !isCurrentMonth && "text-gray-400",
                            isToday && "font-bold",
                            isSelected && "bg-gray-100",
                          )}
                          onClick={() => selectDate(day.date)}
                        >
                          <span className="text-sm">{day.date.getDate()}</span>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full mt-1",
                              elementColors[day.element as keyof typeof elementColors],
                              day.score >= 80 ? "ring-2 ring-green-300" : day.score <= 30 ? "ring-2 ring-red-300" : "",
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p>{day.date.toLocaleDateString()}</p>
                          <p>
                            {day.element}の日: {day.score}点
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>

            {/* 凡例 */}
            <div className="flex flex-wrap gap-3 justify-center mt-2 text-xs">
              {Object.entries(elementColors).map(([element, color]) => (
                <div key={element} className="flex items-center gap-1">
                  <div className={cn("w-3 h-3 rounded-full", color)} />
                  <span>{element}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300 ring-2 ring-green-300" />
                <span>良い日</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300 ring-2 ring-red-300" />
                <span>注意日</span>
              </div>
            </div>

            {/* 選択された日の詳細 */}
            {selectedDateDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">
                    {selectedDateDetails.date.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                  <Badge className={elementLightColors[selectedDateDetails.element as keyof typeof elementLightColors]}>
                    {selectedDateDetails.element}の日
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">運気スコア:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        selectedDateDetails.score >= 80
                          ? "bg-green-500"
                          : selectedDateDetails.score >= 60
                            ? "bg-blue-500"
                            : selectedDateDetails.score >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500",
                      )}
                      style={{ width: `${selectedDateDetails.score}%` }}
                    />
                  </div>
                  <span className="font-medium">{selectedDateDetails.score}</span>
                </div>

                <p className="text-sm mb-3">{selectedDateDetails.advice}</p>

                {isPremium || isPro ? (
                  <>
                    <h5 className="font-medium text-sm mt-3 mb-1">おすすめの活動</h5>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedDateDetails.activities.map((activity, i) => (
                        <Badge key={i} variant="outline" className="bg-white">
                          {activity}
                        </Badge>
                      ))}
                    </div>

                    <h5 className="font-medium text-sm mt-3 mb-1">おすすめの食べ物</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedDateDetails.foods.map((food, i) => (
                        <Badge key={i} variant="outline" className="bg-white">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 p-2 bg-amber-50 rounded text-center text-xs text-amber-800">
                    プレミアム会員になると、おすすめの活動や食べ物が表示されます
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">
                {currentDate.toLocaleString("ja-JP", { year: "numeric", month: "long" })}の運気傾向
              </h4>
              <p className="text-sm mb-4">{monthlySummary.text}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2 text-green-700">良い日</h5>
                  {monthlySummary.goodDays.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {monthlySummary.goodDays.map((day) => (
                        <Badge key={day} variant="outline" className="bg-green-50 border-green-200 text-green-800">
                          {day}日
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">特に良い日はありません</p>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2 text-red-700">注意が必要な日</h5>
                  {monthlySummary.badDays.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {monthlySummary.badDays.map((day) => (
                        <Badge key={day} variant="outline" className="bg-red-50 border-red-200 text-red-800">
                          {day}日
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">特に注意が必要な日はありません</p>
                  )}
                </div>
              </div>
            </div>

            {isPremium ? (
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-2">月間アドバイス</h4>
                <p className="text-sm mb-3">
                  {currentDate.toLocaleString("ja-JP", { month: "long" })}は{seasonElement}の気が強まる
                  {currentSeason === "spring"
                    ? "春"
                    : currentSeason === "summer"
                      ? "夏"
                      : currentSeason === "lateSum"
                        ? "晩夏"
                        : currentSeason === "autumn"
                          ? "秋"
                          : "冬"}
                  の季節です。
                  {userElements &&
                    (seasonElement === userElements.weakElement
                      ? `あなたの弱い五行（${userElements.weakElement}）を補うのに適した時期ですので、積極的に行動しましょう。`
                      : seasonElement === userElements.dominantElement
                        ? `あなたの強い五行（${userElements.dominantElement}）がさらに強まる時期ですので、バランスを意識して過ごしましょう。`
                        : `あなたの五行バランスを意識して過ごしましょう。`)}
                </p>

                <h5 className="font-medium text-sm mt-3 mb-1">月間おすすめの活動</h5>
                <div className="flex flex-wrap gap-1 mb-3">
                  {generateRecommendedActivities(
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
                    userElements,
                  ).map((activity, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {activity}
                    </Badge>
                  ))}
                </div>

                <h5 className="font-medium text-sm mt-3 mb-1">月間おすすめの食べ物</h5>
                <div className="flex flex-wrap gap-1">
                  {generateRecommendedFoods(
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
                    userElements,
                  ).map((food, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : isPro ? (
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-2">月間アドバイス（プロ会員向け）</h4>
                <p className="text-sm mb-3">
                  {currentDate.toLocaleString("ja-JP", { month: "long" })}は{seasonElement}の気が強まる
                  {currentSeason === "spring"
                    ? "春"
                    : currentSeason === "summer"
                      ? "夏"
                      : currentSeason === "lateSum"
                        ? "晩夏"
                        : currentSeason === "autumn"
                          ? "秋"
                          : "冬"}
                  の季節です。バランスを意識して過ごしましょう。
                </p>

                <h5 className="font-medium text-sm mt-3 mb-1">月間おすすめの活動</h5>
                <div className="flex flex-wrap gap-1 mb-3">
                  {generateRecommendedActivities(
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
                    userElements,
                  ).map((activity, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {activity}
                    </Badge>
                  ))}
                </div>

                <h5 className="font-medium text-sm mt-3 mb-1">月間おすすめの食べ物</h5>
                <div className="flex flex-wrap gap-1">
                  {generateRecommendedFoods(
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
                    userElements,
                  ).map((food, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {food}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 p-2 bg-amber-50 rounded text-center text-xs text-amber-800">
                  プレミアム会員にアップグレードすると、より詳細な五行バランスのアドバイスが表示されます
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg text-center">
                <p className="text-sm font-medium text-amber-800">
                  会員登録すると、月間アドバイスや詳細な運気傾向が見られます
                </p>
                <p className="text-xs text-amber-700 mt-1">ベーシック(110円/月)から詳細機能が使えます</p>
                <Button variant="default" size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600">
                  会員登録する
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span>運気スコアはあなたの五行バランスと日々の気の流れから算出されます</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          <span>毎日更新</span>
        </div>
      </CardFooter>
    </Card>
  )
}
