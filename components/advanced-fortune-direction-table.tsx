"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"

interface AdvancedFortuneDirectionTableProps {
  starPerson?: StarPersonType
  name?: string
  startYear?: number
  isPremium?: boolean
}

export function AdvancedFortuneDirectionTable({
  starPerson,
  name,
  startYear = 2021,
  isPremium = false,
}: AdvancedFortuneDirectionTableProps) {
  const [baseYear, setBaseYear] = useState(startYear)
  const [fortuneData, setFortuneData] = useState<Record<string, string[]>>({})

  // 表示する年数
  const yearCount = 12
  const years = Array.from({ length: yearCount }, (_, i) => baseYear + i)

  // 月の配列
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 干支の配列
  const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

  // 方角の配列
  const directions = ["東", "南", "西", "北"]

  // 運気データの生成（実際のアプリケーションでは、APIから取得するなど）
  useEffect(() => {
    if (starPerson) {
      // 仮のデータ生成（実際のアプリケーションでは、APIから取得するなど）
      const generateFortuneData = () => {
        const patterns = {
          "木星人+": ["☆", "★", "○", "○", "○", "●", "●", "●", "○", "○", "○", "▲"],
          "火星人+": ["●", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆"],
          "土星人+": ["◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆", "●"],
          "金星人+": ["▲", "☆", "●", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○"],
          "水星人+": ["○", "▲", "☆", "●", "◎", "◎", "◎", "●", "●", "●", "○", "○"],
          "天王星人+": ["◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆", "●", "◎"],
          "木星人-": ["▲", "▲", "○", "△", "◎", "●", "●", "●", "◎", "◎", "◎", "▲"],
          "火星人-": ["◎", "●", "●", "●", "◎", "◎", "◎", "▲", "▲", "▲", "○", "△"],
          "土星人-": ["●", "●", "●", "◎", "◎", "◎", "▲", "▲", "▲", "○", "△", "◎"],
          "金星人-": ["○", "△", "◎", "●", "●", "●", "◎", "◎", "◎", "▲", "▲", "▲"],
          "水星人-": ["▲", "○", "△", "◎", "●", "●", "●", "◎", "◎", "◎", "▲", "▲"],
          "天王星人-": ["●", "●", "◎", "◎", "◎", "▲", "▲", "▲", "○", "△", "◎", "●"],
        }

        return patterns[starPerson] || patterns["木星人+"]
      }

      setFortuneData({
        fortune: generateFortuneData(),
      })
    }
  }, [starPerson])

  // 干支と年の対応を取得
  const getZodiacForYear = (year: number): string => {
    // 子年は2020, 2032, ...
    return zodiacSigns[(year - 2020) % 12]
  }

  // 前の12年を表示
  const showPreviousYears = () => {
    setBaseYear(baseYear - 12)
  }

  // 次の12年を表示
  const showNextYears = () => {
    setBaseYear(baseYear + 12)
  }

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-6">
            <h3 className="text-lg font-bold text-amber-800">プレミアム会員限定機能</h3>
            <p className="text-amber-700">
              詳細な運気方位表はプレミアム会員限定の機能です。プレミアム会員になると、方位と運気の関係を詳しく確認できます。
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 mt-2">プレミアムに登録する</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{name ? `${name}さんの運気方位表` : "運気方位表"}</CardTitle>
            <CardDescription>{starPerson ? `${starPerson}の運気と方位の関係` : "運気と方位の関係"}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={showPreviousYears}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              前の12年
            </Button>
            <Button variant="outline" size="sm" onClick={showNextYears}>
              次の12年
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="border p-2">方角</th>
                <th className="border p-2" colSpan={3}>
                  東
                </th>
                <th className="border p-2" colSpan={3}>
                  南
                </th>
                <th className="border p-2" colSpan={3}>
                  西
                </th>
                <th className="border p-2" colSpan={3}>
                  北
                </th>
                <th className="border p-2 text-amber-700">大吉</th>
                <th className="border p-2 text-green-600">◎</th>
              </tr>
              <tr>
                <th className="border p-2">干支</th>
                {zodiacSigns.map((sign, index) => (
                  <th key={`zodiac-${index}`} className="border p-2">
                    {sign}
                  </th>
                ))}
                <th className="border p-2 text-purple-600">中吉</th>
                <th className="border p-2 text-purple-600">☆</th>
              </tr>
              <tr>
                <th className="border p-2">年別</th>
                {years.map((year) => (
                  <th key={`year-${year}`} className="border p-2 text-blue-600">
                    {year}
                  </th>
                ))}
                <th className="border p-2 text-green-600">吉</th>
                <th className="border p-2 text-green-600">○</th>
              </tr>
              <tr>
                <th className="border p-2">月別</th>
                {months.map((month) => (
                  <th key={`month-${month}`} className="border p-2">
                    {month}
                  </th>
                ))}
                <th className="border p-2 text-orange-600">凶</th>
                <th className="border p-2 text-orange-600">▲</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">運気</td>
                {months.map((month, index) => {
                  const fortune = fortuneData.fortune?.[index] || "○"
                  let colorClass = ""

                  // 運気記号に応じた色を設定
                  if (fortune === "◎" || fortune === "★") colorClass = "text-red-600 font-bold"
                  else if (fortune === "○") colorClass = "text-green-600"
                  else if (fortune === "☆") colorClass = "text-purple-600"
                  else if (fortune === "△") colorClass = "text-blue-600"
                  else if (fortune === "▲") colorClass = "text-orange-600"
                  else if (fortune === "●") colorClass = "text-black font-bold"
                  else if (fortune === "▽") colorClass = "text-amber-600"

                  return (
                    <td key={`fortune-${month}`} className={`border p-2 ${colorClass}`}>
                      {fortune}
                    </td>
                  )
                })}
                <td className="border p-2 text-black font-bold">中凶</td>
                <td className="border p-2 text-black font-bold">★</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">運気方位の活用法</h4>
          <p className="text-sm mb-2">
            この表は、{starPerson || "あなた"}の運気と方位の関係を示しています。
            大吉・吉の方角は、重要な活動や旅行に適しています。
            凶・大凶の方角は避けるか、特に慎重に行動することをお勧めします。
          </p>
          <p className="text-sm">
            また、干支と年の対応を見ることで、特定の年の運気傾向も把握できます。
            月別の運気を参考に、重要な予定を立てる際の参考にしてください。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
