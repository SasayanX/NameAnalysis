"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"
import { starPersonPatterns, getSymbolClass } from "@/lib/fortune-flow-calculator"

interface FortuneFlowTableProps {
  starPerson: StarPersonType
}

export function FortuneFlowTable({ starPerson }: FortuneFlowTableProps) {
  // 実際の星人タイプに基づいた運気パターンを取得
  const pattern = starPersonPatterns[starPerson]
  if (!pattern) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p>星人タイプが正しく設定されていません</p>
        </CardContent>
      </Card>
    )
  }

  // 12ヶ月分の運気データを生成
  const fortuneFlowData = [
    { direction: "東", zodiac: "寅", year: "2022", month: "2", fortune: pattern[1] },
    { direction: "東", zodiac: "卯", year: "2023", month: "3", fortune: pattern[2] },
    { direction: "東", zodiac: "辰", year: "2024", month: "4", fortune: pattern[3] },
    { direction: "南", zodiac: "巳", year: "2025", month: "5", fortune: pattern[4] },
    { direction: "南", zodiac: "午", year: "2026", month: "6", fortune: pattern[5] },
    { direction: "南", zodiac: "未", year: "2027", month: "7", fortune: pattern[6] },
    { direction: "西", zodiac: "申", year: "2028", month: "8", fortune: pattern[7] },
    { direction: "西", zodiac: "酉", year: "2029", month: "9", fortune: pattern[8] },
    { direction: "西", zodiac: "戌", year: "2030", month: "10", fortune: pattern[9] },
    { direction: "北", zodiac: "亥", year: "2031", month: "11", fortune: pattern[10] },
    { direction: "北", zodiac: "子", year: "2032", month: "12", fortune: pattern[11] },
    { direction: "北", zodiac: "丑", year: "2033", month: "1", fortune: pattern[0] },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>運気運行表 - {starPerson}</CardTitle>
        <CardDescription>12年間の運気の流れを表示します</CardDescription>
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
              {fortuneFlowData.map((item, index) => (
                <td key={index} className="border p-2 text-center">
                  {item.zodiac}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">年別</td>
              {fortuneFlowData.map((item, index) => (
                <td key={index} className="border p-2 text-center text-red-600">
                  {item.year}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">月別</td>
              {fortuneFlowData.map((item, index) => (
                <td key={index} className="border p-2 text-center text-blue-600">
                  {item.month}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-2 text-center font-medium">運気</td>
              {fortuneFlowData.map((item, index) => (
                <td key={index} className={`border p-2 text-center ${getSymbolClass(item.fortune)}`}>
                  {item.fortune}
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
