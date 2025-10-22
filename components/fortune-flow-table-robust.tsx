"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"
import { starPersonPatterns, normalizeStarPersonType } from "@/lib/fortune-flow-calculator"
import { safeExecute } from "@/lib/error-handler"

interface FortuneFlowTableProps {
  title?: string
  description?: string
  starPerson?: StarPersonType | string
}

// 運気記号に応じたクラスを取得（エラーハンドリング強化）
const getSymbolClass = (symbol: string): string => {
  return safeExecute(
    () => {
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
          return "text-black font-bold dark:text-gray-400"
        case "★":
          return "text-amber-600"
        default:
          return "text-gray-500"
      }
    },
    "text-gray-500", // fallback
    `Failed to get symbol class for: ${symbol}`,
  )
}

export function FortuneFlowTable({ title, description, starPerson = "木星人-" }: FortuneFlowTableProps) {
  const [normalizedStarPerson, setNormalizedStarPerson] = useState<StarPersonType>(
    normalizeStarPersonType(starPerson as string),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log("FortuneFlowTable received starPerson:", starPerson)
      const normalized = normalizeStarPersonType(starPerson as string)
      console.log("Normalized to:", normalized)
      setNormalizedStarPerson(normalized)
      setError(null)
    } catch (error) {
      console.error("Error normalizing star person:", error)
      setError("星人タイプの正規化に失敗しました")
    }
  }, [starPerson])

  // エラー状態の表示
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const tableTitle = title || `${normalizedStarPerson}の運気運行表`
  const pattern = starPersonPatterns[normalizedStarPerson] || []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{tableTitle}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-muted/50">
              <th className="border p-2 text-center">方角</th>
              <th className="border p-2 text-center" colSpan={3}>
                東
              </th>
              <th className="border p-2 text-center" colSpan={3}>
                南
              </th>
              <th className="border p-2 text-center" colSpan={3}>
                西
              </th>
              <th className="border p-2 text-center" colSpan={3}>
                北
              </th>
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">干支</td>
              <td className="border p-2 text-center">丑</td>
              <td className="border p-2 text-center">寅</td>
              <td className="border p-2 text-center">卯</td>
              <td className="border p-2 text-center">辰</td>
              <td className="border p-2 text-center">巳</td>
              <td className="border p-2 text-center">午</td>
              <td className="border p-2 text-center">未</td>
              <td className="border p-2 text-center">申</td>
              <td className="border p-2 text-center">酉</td>
              <td className="border p-2 text-center">戌</td>
              <td className="border p-2 text-center">亥</td>
              <td className="border p-2 text-center">子</td>
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">年別</td>
              {[2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map((year) => (
                <td key={year} className="border p-2 text-center text-red-600">
                  {year}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">月別</td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <td key={month} className="border p-2 text-center text-blue-600">
                  {month}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">運気</td>
              {pattern.length > 0
                ? pattern.map((symbol, index) => (
                    <td key={index} className={`border p-2 text-center ${getSymbolClass(symbol)}`}>
                      {symbol}
                    </td>
                  ))
                : Array(12)
                    .fill(null)
                    .map((_, index) => (
                      <td key={index} className="border p-2 text-center">
                        -
                      </td>
                    ))}
            </tr>
          </tbody>
        </table>

        <div className="mt-4 text-sm">
          <p className="mb-2">【運気記号の意味】</p>
          <ul className="space-y-1">
            <li>
              <span className="inline-block w-6 text-center text-red-600 font-bold">◎</span>: 大吉 - 非常に良い運気
              (相性100%)
            </li>
            <li>
              <span className="inline-block w-6 text-center text-purple-600">☆</span>: 中吉 - まずまずの運気 (相性85%)
            </li>
            <li>
              <span className="inline-block w-6 text-center text-green-600">○</span>: 吉 - 良い運気 (相性65%)
            </li>
            <li>
              <span className="inline-block w-6 text-center text-orange-600">▲</span>: 凶 - 注意が必要な運気 (相性35%)
            </li>
            <li>
              <span className="inline-block w-6 text-center text-amber-600">★</span>: 中凶 - やや注意が必要な運気
              (相性15%)
            </li>
            <li>
              <span className="inline-block w-6 text-center text-black font-bold dark:text-gray-400">●</span>: 大凶 -
              特に注意が必要な運気 (相性0%)
            </li>
          </ul>
        </div>

        <Alert className="mt-4">
          <AlertDescription>
            <p className="text-sm font-medium">【運気運行表の活用方法】</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>・相手の干支の位置の運気記号を見れば相性がわかります（◎100％、☆85％、〇65％、▲35％、★15％、●0％）</li>
              <li>・方角の記号がそのままこの星人の吉凶方位となります</li>
              <li>・東西南北の方角と干支の関係を確認し、運気の良い方角を選ぶことで運気を高められます</li>
              <li>・重要な決断や行動を起こす際は、運気の良い年月や方角を選ぶことをおすすめします</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
