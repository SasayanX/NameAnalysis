"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  type StarPersonType,
  fortuneSymbols,
  zodiacSigns,
  getFortuneByStarPersonAndMonth,
  getFortuneTypeFromSymbol,
} from "@/lib/fortune-flow-calculator"

interface FortuneDirectionTableProps {
  starPerson?: StarPersonType
  name?: string
  startYear?: number
}

export function FortuneDirectionTable({ starPerson = "木星人+", name, startYear = 2021 }: FortuneDirectionTableProps) {
  const [baseYear, setBaseYear] = useState(startYear)

  // 年の配列（12年分）
  const years = Array.from({ length: 12 }, (_, i) => baseYear + i)

  // 月の配列
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 前の12年を表示
  const showPreviousYears = () => {
    setBaseYear(baseYear - 12)
  }

  // 次の12年を表示
  const showNextYears = () => {
    setBaseYear(baseYear + 12)
  }

  // 運気記号に応じたクラスを取得
  const getSymbolClass = (symbol: string): string => {
    const fortuneType = getFortuneTypeFromSymbol(symbol)
    switch (fortuneType) {
      case "大吉":
        return "text-red-600 font-bold"
      case "吉":
        return "text-green-600"
      case "中吉":
        return "text-purple-600"
      case "凶":
        return "text-orange-600"
      case "大凶":
        return "text-black font-bold"
      case "中凶":
        return "text-amber-600"
      default:
        return ""
    }
  }

  // 干支と年の対応を取得
  const getZodiacForYear = (year: number): string => {
    // 2021年は丑年
    const baseYear = 2021
    const baseIndex = 1 // 丑年のインデックス
    const yearDiff = year - baseYear
    const zodiacIndex = (baseIndex + yearDiff) % 12
    return zodiacSigns[zodiacIndex]
  }

  // 年と干支の対応を生成
  const yearZodiacMap: Record<number, string> = {}
  years.forEach((year) => {
    yearZodiacMap[year] = getZodiacForYear(year)
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{name ? `${name}さんの運気方位表` : "運気方位表"}</CardTitle>
            <CardDescription>{starPerson}の運気と方位の関係</CardDescription>
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
          <table className="w-full border-collapse border border-gray-300 text-center">
            {/* 方角行 */}
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">方角</th>
                <th className="border border-gray-300 p-2" colSpan={3}>
                  東
                </th>
                <th className="border border-gray-300 p-2" colSpan={3}>
                  南
                </th>
                <th className="border border-gray-300 p-2" colSpan={3}>
                  西
                </th>
                <th className="border border-gray-300 p-2" colSpan={3}>
                  北
                </th>
              </tr>

              {/* 干支行 */}
              <tr>
                <th className="border border-gray-300 p-2">干支</th>
                {zodiacSigns.map((sign, index) => (
                  <td key={`zodiac-${index}`} className="border border-gray-300 p-2">
                    {sign}
                  </td>
                ))}
              </tr>

              {/* 年別行 */}
              <tr>
                <th className="border border-gray-300 p-2">年別</th>
                {years.map((year, index) => (
                  <td key={`year-${index}`} className="border border-gray-300 p-2 text-blue-600">
                    {year}
                  </td>
                ))}
              </tr>

              {/* 月別行 */}
              <tr>
                <th className="border border-gray-300 p-2">月別</th>
                {months.map((month) => (
                  <td key={`month-${month}`} className="border border-gray-300 p-2">
                    {month}
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* 運気行 */}
              <tr>
                <th className="border border-gray-300 p-2">{starPerson}</th>
                {months.map((month) => {
                  const fortune = getFortuneByStarPersonAndMonth(starPerson, month)
                  const symbol = fortuneSymbols[fortune]
                  const symbolClass = getSymbolClass(symbol)

                  return (
                    <td key={`fortune-${month}`} className={`border border-gray-300 p-2 ${symbolClass}`}>
                      {symbol}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 運気記号の説明を文章で表示 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">運気記号の説明</h4>
          <p className="text-sm mb-3">
            <span className="text-red-600 font-bold mr-1">◎</span>
            <strong>大吉</strong>：最も良い運気です。重要な決断や新しい挑戦に最適な時期です。
          </p>
          <p className="text-sm mb-3">
            <span className="text-green-600 mr-1">○</span>
            <strong>吉</strong>：良い運気です。物事が順調に進みやすい時期です。
          </p>
          <p className="text-sm mb-3">
            <span className="text-purple-600 mr-1">☆</span>
            <strong>中吉</strong>：まずまずの運気です。慎重に行動すれば良い結果が得られます。
          </p>
          <p className="text-sm mb-3">
            <span className="text-orange-600 mr-1">▲</span>
            <strong>凶</strong>：注意が必要な運気です。慎重に行動し、重要な決断は避けましょう。
          </p>
          <p className="text-sm mb-3">
            <span className="text-black font-bold mr-1">●</span>
            <strong>大凶</strong>：最も注意が必要な運気です。重要な決断や新しい挑戦は避けるべき時期です。
          </p>
          <p className="text-sm">
            <span className="text-amber-600 mr-1">★</span>
            <strong>中凶</strong>：注意が必要な運気です。慎重に行動し、リスクを最小限に抑えましょう。
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">運気方位表の活用法</h4>
          <p className="text-sm">
            この表は、{starPerson}の運気と方位の関係を示しています。大吉・吉の方角は、重要な活動や旅行に適しています。
            凶・大凶の方角は避けるか、特に慎重に行動することをお勧めします。
            また、干支と年の対応を見ることで、特定の年の運気傾向も把握できます。
            月別の運気を参考に、重要な予定を立てる際の参考にしてください。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
