"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type FortuneType,
  type StarPersonType,
  fortuneSymbols,
  calculateYearlyFortune,
} from "@/lib/fortune-flow-calculator"

interface YearlyFortuneSummaryProps {
  starPerson: StarPersonType
  startYear: number
  endYear: number
}

export function YearlyFortuneSummary({ starPerson, startYear, endYear }: YearlyFortuneSummaryProps) {
  const [yearlyFortunes, setYearlyFortunes] = useState<
    Record<
      number,
      {
        fortune: FortuneType
        description: string
        goodMonths: number[]
        badMonths: number[]
      }
    >
  >({})

  useEffect(() => {
    const fortunes: Record<
      number,
      {
        fortune: FortuneType
        description: string
        goodMonths: number[]
        badMonths: number[]
      }
    > = {}

    for (let year = startYear; year <= endYear; year++) {
      fortunes[year] = calculateYearlyFortune(starPerson, year)
    }

    setYearlyFortunes(fortunes)
  }, [starPerson, startYear, endYear])

  // 運気記号に応じたクラスを取得する関数
  const getFortuneClass = (fortune: FortuneType): string => {
    switch (fortune) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{starPerson}の年間運気サマリー</CardTitle>
        <CardDescription>
          {startYear}年から{endYear}年までの年間運気の傾向
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-center">年</th>
                <th className="border p-2 text-center">運気</th>
                <th className="border p-2 text-center">良い月</th>
                <th className="border p-2 text-center">注意が必要な月</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlyFortunes).map(([year, data]) => (
                <tr key={year}>
                  <td className="border p-2 text-center">{year}年</td>
                  <td className={`border p-2 text-center ${getFortuneClass(data.fortune)}`}>
                    {fortuneSymbols[data.fortune]} {data.fortune}
                  </td>
                  <td className="border p-2 text-center text-green-600">
                    {data.goodMonths.length > 0 ? data.goodMonths.map((m) => `${m}月`).join("・") : "特になし"}
                  </td>
                  <td className="border p-2 text-center text-red-600">
                    {data.badMonths.length > 0 ? data.badMonths.map((m) => `${m}月`).join("・") : "特になし"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">年間運気の見方</h4>
          <p className="text-sm">
            年間運気は、各月の運気パターンから計算された総合的な運気の傾向を示しています。
            「大吉」や「吉」の年は、新しいことに挑戦したり、大きな決断をするのに適しています。
            「大凶」や「凶」の年は、慎重に行動し、無理な計画は避けることをお勧めします。
            ただし、年間運気が良くない場合でも、月ごとの運気を確認し、良い時期を選んで行動することで、
            運気を最大限に活かすことができます。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
