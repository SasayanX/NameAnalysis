"use client"

import React, { useEffect, useState } from "react"
import { getNameStrokesWithReisuuArray, getCharStrokeWithContext } from "@/lib/name-data-simple"

interface VerticalNameDisplayProps {
  lastName?: string
  firstName?: string
  name?: string
  showYinYang?: boolean // 陰陽表示のオプション
  showStrokes?: boolean // 画数表示のオプション
}

// 画数から陰陽を判定する関数
function getYinYang(strokes: number): "陽" | "陰" {
  return strokes % 2 === 1 ? "陽" : "陰"
}

// 陰陽マークを取得する関数
function getYinYangSymbol(yinYang: "陽" | "陰"): string {
  return yinYang === "陽" ? "○" : "●" // 陽=白丸、陰=黒丸
}

// 陰陽の色を取得する関数（ダークモード対応）
function getYinYangColor(yinYang: "陽" | "陰"): string {
  if (yinYang === "陽") {
    // 陽（○白丸）：ライトモードでは黒い枠線、ダークモードでは白い枠線
    return "text-gray-800 dark:text-gray-600"
  } else {
    // 陰（●黒丸）：ライトモードでは黒、ダークモードでは濃いグレー
    return "text-black dark:text-gray-600"
  }
}

export function VerticalNameDisplay({
  lastName = "",
  firstName = "",
  name,
  showYinYang = true,
  showStrokes = true,
}: VerticalNameDisplayProps) {
  const [charData, setCharData] = useState<
    Array<{
      char: string
      strokes: number
      yinYang: "陽" | "陰"
      symbol: string
      isReisuu?: boolean
      isDefault?: boolean
    }>
  >([])

  // nameが提供された場合は分割、そうでなければlastNameとfirstNameを使用
  let displayLastName = lastName
  let displayFirstName = firstName

  if (name && !lastName && !firstName) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      displayLastName = parts[0]
      displayFirstName = parts.slice(1).join("")
    } else if (parts.length === 1) {
      displayLastName = parts[0]
      displayFirstName = ""
    }
  }

  useEffect(() => {
    // 霊数を考慮した画数配列を取得
    const { lastNameStrokes, firstNameStrokes } = getNameStrokesWithReisuuArray(displayLastName, displayFirstName)

    // 実際の文字数をチェック
    const actualLastNameLength = Array.from(displayLastName).length
    const actualFirstNameLength = Array.from(displayFirstName).length

    // 霊数は一文字の場合のみ表示
    const shouldShowReisuuInLastName = actualLastNameLength === 1
    const shouldShowReisuuInFirstName = actualFirstNameLength === 1

    const data: Array<{
      char: string
      strokes: number
      yinYang: "陽" | "陰"
      symbol: string
      isReisuu?: boolean
      isDefault?: boolean
    }> = []

    // 姓の文字データ（霊数含む）- 縦書きなので上から順に
    lastNameStrokes.forEach((stroke, i) => {
      let char: string
      let isReisuu = false
      let isDefault = false

      if (shouldShowReisuuInLastName && i === 0) {
        // 一字姓の場合のみ、最初は霊数
        char = "一"
        isReisuu = true
      } else {
        // 実際の文字
        const actualIndex = shouldShowReisuuInLastName ? i - 1 : i
        char = displayLastName.charAt(actualIndex)
        // isDefault情報を取得
        const { stroke: charStroke, isDefault: charIsDefault } = getCharStrokeWithContext(
          char,
          displayLastName,
          actualIndex,
        )
        isDefault = charIsDefault
      }

      const yinYang = getYinYang(stroke)
      const symbol = getYinYangSymbol(yinYang)

      data.push({
        char,
        strokes: stroke,
        yinYang,
        symbol,
        isReisuu,
        isDefault,
      })
    })

    // 名の文字データ（霊数含む）- 姓の後に続けて縦に配置
    firstNameStrokes.forEach((stroke, i) => {
      let char: string
      let isReisuu = false
      let isDefault = false

      if (shouldShowReisuuInFirstName && i === firstNameStrokes.length - 1) {
        // 一字名の場合のみ、最後は霊数
        char = "一"
        isReisuu = true
      } else {
        // 実際の文字
        char = displayFirstName.charAt(i)
        // isDefault情報を取得
        const { stroke: charStroke, isDefault: charIsDefault } = getCharStrokeWithContext(char, displayFirstName, i)
        isDefault = charIsDefault
      }

      const yinYang = getYinYang(stroke)
      const symbol = getYinYangSymbol(yinYang)

      data.push({
        char,
        strokes: stroke,
        yinYang,
        symbol,
        isReisuu,
        isDefault,
      })
    })

    setCharData(data)
  }, [displayLastName, displayFirstName])

  if (charData.length === 0) {
    return <div className="flex justify-center items-center h-32 text-gray-400">名前を入力してください</div>
  }

  return (
    <div className="flex justify-center items-center p-6 bg-gradient-to-b from-gray-50 to-white border rounded-lg min-h-[300px]">
      {/* 縦書き一列表示 */}
      <div className="relative">
        <div className="flex flex-col items-center space-y-2">
          {charData.map((item, index) => (
            <div key={index} className="relative flex items-center">
              {/* 左側：陰陽表示 */}
              {showYinYang && (
                <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 flex items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mr-2 min-w-[20px] text-center">
                    {item.yinYang}
                  </div>
                  <div className={`text-2xl font-bold ${getYinYangColor(item.yinYang)}`}>{item.symbol}</div>
                </div>
              )}

              {/* 中央：文字 */}
              <div className="w-14 h-14 flex items-center justify-center text-3xl font-medium border-2 border-gray-300 bg-white rounded-lg shadow-sm relative text-black dark:text-gray-600">
                {item.char}
                {item.isReisuu && (
                  <span className="absolute -top-2 -right-2 text-xs text-red-500 bg-red-100 rounded-full px-1.5 py-0.5 font-bold">
                    霊
                  </span>
                )}
                {item.isDefault && (
                  <span className="absolute -bottom-2 -right-2 text-xs text-orange-500 bg-orange-100 rounded-full px-1.5 py-0.5 font-bold">
                    推
                  </span>
                )}
              </div>

              {/* 右側：画数表示 */}
              {showStrokes && (
                <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                  <div className="text-xl font-bold text-gray-700">{item.strokes}</div>
                  <div className="text-xs text-gray-500">画</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 陰陽配列を取得する関数（外部から使用可能・霊数対応）
export function getYinYangArray(lastName: string, firstName: string): Array<"陽" | "陰"> {
  const { lastNameStrokes, firstNameStrokes } = getNameStrokesWithReisuuArray(lastName, firstName)
  const result: Array<"陽" | "陰"> = []

  // 姓の陰陽（霊数含む）
  lastNameStrokes.forEach((stroke) => {
    result.push(getYinYang(stroke))
  })

  // 名の陰陽（霊数含む）
  firstNameStrokes.forEach((stroke) => {
    result.push(getYinYang(stroke))
  })

  return result
}

// 陰陽バランスを分析する関数（霊数対応）
export function analyzeYinYangBalance(yinYangArray: Array<"陽" | "陰">): {
  yangCount: number
  yinCount: number
  balance: "良好" | "陽偏重" | "陰偏重" | "極端"
  score: number
  description: string
} {
  const yangCount = yinYangArray.filter((item) => item === "陽").length
  const yinCount = yinYangArray.filter((item) => item === "陰").length
  const total = yinYangArray.length

  let balance: "良好" | "陽偏重" | "陰偏重" | "極端"
  let score: number
  let description: string

  const yangRatio = yangCount / total
  const yinRatio = yinCount / total

  if (Math.abs(yangRatio - yinRatio) <= 0.2) {
    // 差が20%以内なら良好
    balance = "良好"
    score = 20
    description = "陰陽のバランスが取れており、調和の取れた運勢を示しています。"
  } else if (yangRatio > 0.7) {
    // 陽が70%以上
    balance = "陽偏重"
    score = 10
    description = "陽の気が強く、積極的で活動的な性格を示しますが、やや攻撃的になりがちです。"
  } else if (yinRatio > 0.7) {
    // 陰が70%以上
    balance = "陰偏重"
    score = 10
    description = "陰の気が強く、内向的で思慮深い性格を示しますが、やや消極的になりがちです。"
  } else {
    // その他（極端な場合）
    balance = "極端"
    score = 5
    description = "陰陽の配置が極端で、運勢に波が生じやすい傾向があります。"
  }

  return {
    yangCount,
    yinCount,
    balance,
    score,
    description,
  }
}

// メモ化されたコンポーネントをエクスポート
export const MemoizedVerticalNameDisplay = React.memo(VerticalNameDisplay)
