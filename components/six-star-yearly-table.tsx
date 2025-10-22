"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDownIcon, ChevronUpIcon, LockIcon, DownloadIcon } from "lucide-react"
import {
  normalizeStarPersonType,
  starPersonPatterns,
  symbolToFortuneType,
  type StarPersonType,
  type FortuneType,
} from "@/lib/fortune-flow-calculator"

// 干支の配列（子から始まる12干支）
const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 年から干支のインデックスを計算する関数（修正版）
function getZodiacIndexFromYear(year: number): number {
  // 2024年は辰年（インデックス4）
  // 2025年は巳年（インデックス5）
  // 干支は12年周期で繰り返される
  return (year - 2024 + 4) % 12
}

// 星人タイプと年から運気を計算する関数
function calculateFortuneForYear(starPerson: StarPersonType, year: number): FortuneType {
  const pattern = starPersonPatterns[starPerson]

  if (!pattern) {
    return "吉" // デフォルト値
  }

  const zodiacIndex = getZodiacIndexFromYear(year)
  const fortuneSymbol = pattern[zodiacIndex]

  return symbolToFortuneType[fortuneSymbol] || "吉"
}

// 運気タイプに応じたキーワードを返す関数
function getKeywordsForFortune(fortune: FortuneType): string[] {
  switch (fortune) {
    case "大吉":
      return ["飛躍", "成功", "幸運", "達成"]
    case "吉":
      return ["安定", "向上", "発展", "好機"]
    case "中吉":
      return ["成長", "調和", "前進", "改善"]
    case "中凶":
      return ["注意", "調整", "見直し", "準備"]
    case "凶":
      return ["困難", "障害", "試練", "忍耐"]
    case "大凶":
      return ["変革", "危機", "転換", "再生"]
    default:
      return ["変化", "流動", "適応"]
  }
}

// 運気タイプに応じたアドバイスを返す関数
function getAdviceForFortune(fortune: FortuneType): string {
  switch (fortune) {
    case "大吉":
      return "非常に恵まれた運気の年です。新しいチャレンジや大きな決断に最適な時期です。積極的に行動し、チャンスを掴みましょう。"
    case "吉":
      return "良好な運気に恵まれた年です。計画的に行動すれば、望ましい結果が得られるでしょう。安定した成長が期待できます。"
    case "中吉":
      return "まずまずの運気の年です。努力次第で良い結果につながります。バランスを保ちながら、着実に前進しましょう。"
    case "中凶":
      return "やや注意が必要な年です。慎重に行動し、無理な計画は避けましょう。基本に立ち返り、足元を固める時期です。"
    case "凶":
      return "困難に直面する可能性がある年です。忍耐強く対応し、長期的な視点を持ちましょう。試練を乗り越えることで成長できます。"
    case "大凶":
      return "大きな変化や転機となる年です。危機を好機と捉え、柔軟に対応しましょう。内省と準備の時間を大切にすることで、次の飛躍につながります。"
    default:
      return "変化の多い年です。状況に応じて柔軟に対応することが重要です。"
  }
}

// 運気タイプに応じたラッキーカラーを返す関数
function getLuckyColorsForFortune(fortune: FortuneType): string[] {
  switch (fortune) {
    case "大吉":
      return ["赤", "金", "オレンジ"]
    case "吉":
      return ["緑", "青", "水色"]
    case "中吉":
      return ["黄", "紫", "ピンク"]
    case "中凶":
      return ["茶", "グレー", "ベージュ"]
    case "凶":
      return ["白", "シルバー", "パステルカラー"]
    case "大凶":
      return ["黒", "ネイビー", "深緑"]
    default:
      return ["白", "グレー"]
  }
}

// 運気タイプに応じたラッキー方位を返す関数
function getLuckyDirectionsForFortune(fortune: FortuneType): string[] {
  switch (fortune) {
    case "大吉":
      return ["東", "南東", "南"]
    case "吉":
      return ["南", "南西", "西"]
    case "中吉":
      return ["西", "北西", "北"]
    case "中凶":
      return ["北", "北東", "東"]
    case "凶":
      return ["北東", "東", "南東"]
    case "大凶":
      return ["南西", "西", "北西"]
    default:
      return ["東", "西"]
  }
}

// 運気タイプに応じたスタイルを返す関数
function getFortuneStyle(fortune: FortuneType): string {
  switch (fortune) {
    case "大吉":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "吉":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "中吉":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "中凶":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    case "凶":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "大凶":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }
}

// 年表データを生成する関数
function generateYearlyData(starPerson: StarPersonType, startYear: number, endYear: number) {
  const result = []

  for (let year = startYear; year <= endYear; year++) {
    const fortune = calculateFortuneForYear(starPerson, year)
    const keywords = getKeywordsForFortune(fortune)
    const advice = getAdviceForFortune(fortune)
    const luckyColors = getLuckyColorsForFortune(fortune)
    const luckyDirections = getLuckyDirectionsForFortune(fortune)

    // 干支のインデックスを取得
    const zodiacIndex = getZodiacIndexFromYear(year)
    // 干支を取得
    const zodiac = zodiacSigns[zodiacIndex]

    // 運気記号を取得
    const fortuneSymbol = Object.entries(symbolToFortuneType).find(([_, type]) => type === fortune)?.[0] || "○"

    result.push({
      year,
      fortune,
      fortuneSymbol,
      zodiac,
      keywords,
      advice,
      luckyColors,
      luckyDirections,
      luckyNumbers: [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1], // ランダムな数字（実際は占術に基づいて計算）
      detailedDescription: `${year}年（${zodiac}年）は${starPerson}にとって${fortune}の年です。${advice}`,
    })
  }

  return result
}

interface SixStarYearlyTableProps {
  starPerson: string
  startYear?: number
  endYear?: number
  isPremium?: boolean
  isPremiumLevel?: number // 0: 無料, 1: ベーシック(110円), 2: プロ(330円), 3: プレミアム(550円)
}

export function SixStarYearlyTable({
  starPerson,
  startYear = new Date().getFullYear(),
  endYear = new Date().getFullYear() + 10,
  isPremium = false,
  isPremiumLevel = 0,
}: SixStarYearlyTableProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [showAllYears, setShowAllYears] = useState(false)

  // 星人タイプを正規化
  const normalizedStarPerson = normalizeStarPersonType(starPerson)

  // 年表データを生成
  const yearlyData = generateYearlyData(normalizedStarPerson, startYear, endYear)

  // 会員レベルに応じた表示制限
  // 無料プラン（レベル0）：表示しない
  // ベーシックプラン（レベル1）：1行のみ表示
  // プロプラン以上（レベル2以上）：全て表示
  const isBasic = isPremiumLevel === 1 // ベーシックプラン（110円）
  const isProOrHigher = isPremiumLevel >= 2 // プロプラン以上（330円以上）

  // 表示する年数を制限
  let visibleYears = []
  if (isPremiumLevel === 3) {
    // プレミアムプラン（550円）は10年分全て表示
    visibleYears = showAllYears ? yearlyData : yearlyData.slice(0, 10)
  } else if (isPremiumLevel === 2) {
    // プロプラン（330円）は3年分のみ表示
    visibleYears = yearlyData.slice(0, 3)
  } else if (isPremiumLevel === 1) {
    // ベーシックプラン（110円）は1年分のみ表示
    visibleYears = yearlyData.slice(0, 1)
  } else {
    // 無料プランは表示しない
    visibleYears = []
  }

  // 年をクリックしたときの処理
  const handleYearClick = (year: number) => {
    if (!isProOrHigher) return // プロプラン以上でないと詳細表示不可
    setExpandedYear(expandedYear === year ? null : year)
  }

  // 無料プランの場合は、アップグレードを促すメッセージを表示
  if (isPremiumLevel === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 dark:bg-amber-900/20 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <LockIcon className="h-5 w-5 text-amber-600 mt-0.5 dark:text-amber-500" />
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-400">有料会員限定機能です</h4>
            <p className="text-sm text-amber-700 mt-1 dark:text-amber-500">
              六星占術年表は有料会員限定機能です。 ベーシックプラン（110円/月）では今年の運気が、
              プロプラン（330円/月）以上では10年分の運気が確認できます。
            </p>
            <div className="mt-3">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800">
                有料プランに登録する
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ベーシックプランの場合は、1行のみ表示し、アップグレードを促すメッセージを表示
  if (isBasic) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">年</TableHead>
                <TableHead className="w-24">運気</TableHead>
                <TableHead className="w-1/3">キーワード</TableHead>
                <TableHead>アドバイス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleYears.map((yearData) => (
                <TableRow key={yearData.year} className="cursor-not-allowed opacity-90">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {yearData.year}
                      <span className="text-xs text-gray-500">({yearData.zodiac})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSymbolClass(yearData.fortuneSymbol)}`}>
                        {yearData.fortuneSymbol}
                      </span>
                      <Badge className={getFortuneStyle(yearData.fortune)}>{yearData.fortune}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {yearData.keywords.slice(0, 3).map((keyword, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{yearData.advice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <LockIcon className="h-5 w-5 text-amber-600 mt-0.5 dark:text-amber-500" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-400">プロプラン以上でさらに詳しく</h4>
              <p className="text-sm text-amber-700 mt-1 dark:text-amber-500">
                プロプラン（330円/月）にアップグレードすると、 3年分の運気の流れを確認できます。
                より長期的な運気の流れを把握し、計画的な決断に役立てましょう。
              </p>
              <div className="mt-3">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800">
                  プロプランにアップグレード
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // プロプラン（330円）の場合は、3年分表示して、アップグレードを促すメッセージを表示
  if (isPremiumLevel === 2) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">年</TableHead>
                <TableHead className="w-24">運気</TableHead>
                <TableHead className="w-1/3">キーワード</TableHead>
                <TableHead>アドバイス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleYears.map((yearData) => (
                <TableRow
                  key={yearData.year}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleYearClick(yearData.year)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {yearData.year}
                      <span className="text-xs text-gray-500">({yearData.zodiac})</span>
                      {expandedYear === yearData.year ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSymbolClass(yearData.fortuneSymbol)}`}>
                        {yearData.fortuneSymbol}
                      </span>
                      <Badge className={getFortuneStyle(yearData.fortune)}>{yearData.fortune}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {yearData.keywords.slice(0, 3).map((keyword, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{yearData.advice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <LockIcon className="h-5 w-5 text-amber-600 mt-0.5 dark:text-amber-500" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-400">プレミアムプラン以上でさらに詳しく</h4>
              <p className="text-sm text-amber-700 mt-1 dark:text-amber-500">
                プレミアムプラン（550円/月）にアップグレードすると、 10年分の運気の流れを確認できます。
                長期的な運気の流れを把握し、人生の重要な決断に役立てましょう。
              </p>
              <div className="mt-3">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800">
                  プレミアムプランにアップグレード
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // プレミアムプラン（550円）の場合は、通常通り表示
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">年</TableHead>
              <TableHead className="w-24">運気</TableHead>
              <TableHead className="w-1/3">キーワード</TableHead>
              <TableHead>アドバイス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleYears.map((yearData) => (
              <>
                <TableRow
                  key={yearData.year}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleYearClick(yearData.year)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {yearData.year}
                      <span className="text-xs text-gray-500">({yearData.zodiac})</span>
                      {expandedYear === yearData.year ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSymbolClass(yearData.fortuneSymbol)}`}>
                        {yearData.fortuneSymbol}
                      </span>
                      <Badge className={getFortuneStyle(yearData.fortune)}>{yearData.fortune}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {yearData.keywords.slice(0, 3).map((keyword, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{yearData.advice}</TableCell>
                </TableRow>

                {/* 詳細情報（展開時のみ表示） */}
                {expandedYear === yearData.year && (
                  <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                    <TableCell colSpan={4} className="p-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-lg mb-2">
                                {yearData.year}年（{yearData.zodiac}年）の運気詳細
                              </h4>
                              <p>{yearData.detailedDescription}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-1">ラッキー方位</h5>
                                <div className="flex flex-wrap gap-1">
                                  {yearData.luckyDirections?.map((dir, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    >
                                      {dir}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium mb-1">ラッキーカラー</h5>
                                <div className="flex flex-wrap gap-1">
                                  {yearData.luckyColors?.map((color, idx) => (
                                    <span
                                      key={idx}
                                      className="text-sm bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800"
                                    >
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium mb-1">ラッキーナンバー</h5>
                                <div className="flex flex-wrap gap-1">
                                  {yearData.luckyNumbers?.map((num, idx) => (
                                    <span
                                      key={idx}
                                      className="text-sm bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-800"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium mb-1">運気の流れ</h5>
                                <p className="text-sm">
                                  {yearData.year}年は{normalizedStarPerson}にとって{yearData.fortune}の年です。
                                  {yearData.fortune === "大吉" && "非常に恵まれた運気の年となるでしょう。"}
                                  {yearData.fortune === "吉" && "安定した良い運気に恵まれる年です。"}
                                  {yearData.fortune === "中吉" && "まずまずの運気に恵まれる年です。"}
                                  {yearData.fortune === "中凶" && "やや注意が必要な年です。"}
                                  {yearData.fortune === "凶" && "困難に直面する可能性がある年です。"}
                                  {yearData.fortune === "大凶" && "大きな変化や転機となる年です。"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 「すべての年を表示」ボタン */}
      {!showAllYears && isPremiumLevel === 3 && yearlyData.length > 10 && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setShowAllYears(true)}>
            すべての年を表示 ({yearlyData.length}年分)
          </Button>
        </div>
      )}

      {/* PDF出力ボタン */}
      <div className="flex justify-end mt-4">
        <Button variant="outline" size="sm">
          <DownloadIcon className="h-4 w-4 mr-2" />
          年表をPDF出力
        </Button>
      </div>
    </div>
  )
}

// 運気記号に応じたクラスを取得する関数（既存の関数を再利用）
function getSymbolClass(symbol: string): string {
  switch (symbol) {
    case "◎":
      return "text-red-600 font-bold"
    case "○":
      return "text-green-600"
    case "☆":
      return "text-purple-600"
    case "▲":
      return "text-orange-600"
    case "●":
      return "text-black font-bold dark:text-white"
    case "★":
      return "text-amber-600"
    default:
      return ""
  }
}
