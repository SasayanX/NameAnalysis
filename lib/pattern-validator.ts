import type { StarPersonType, FortuneType } from "./fortune-flow-calculator"

// 移植元アプリの運気パターンから「小吉」を「吉」に置き換え
export const originalPatterns: Record<StarPersonType, FortuneType[]> = {
  "木星人+": ["中吉", "中吉", "凶", "吉", "大凶", "大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉"],
  // 木星人-の運気パターンを修正します
  // 現在の木星人-のパターン:
  // "木星人-": ["凶", "凶", "中吉", "吉", "大吉", "大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶"],

  // 画像に基づいた正しいパターンに修正:
  "木星人-": ["大吉", "大凶", "大凶", "大凶", "吉", "吉", "吉", "凶", "中吉", "中凶", "大吉", "大吉"],
  "火星人+": ["大凶", "大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉", "中吉", "中吉", "凶", "吉"],
  "火星人-": ["大吉", "大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶", "凶", "凶", "中吉", "吉"],
  "土星人+": ["大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉", "中吉", "中吉", "凶", "吉", "大凶"],
  "土星人-": ["大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶", "凶", "凶", "中吉", "吉", "大吉"],
  "金星人+": ["凶", "吉", "大凶", "大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉", "中吉", "中吉"],
  "金星人-": ["中吉", "吉", "大吉", "大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶", "凶", "凶"],
  "水星人+": ["中吉", "凶", "吉", "大凶", "大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉", "中吉"],
  "水星人-": ["凶", "中吉", "吉", "大吉", "大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶", "凶"],
  "天王星人+": ["大吉", "大吉", "大吉", "大凶", "大凶", "中凶", "中吉", "中吉", "中吉", "凶", "吉", "大凶"],
  "天王星人-": ["大凶", "大凶", "大凶", "大吉", "大吉", "中凶", "凶", "凶", "凶", "中吉", "吉", "大吉"],
}

// パターンの比較結果の型定義
export interface PatternComparisonResult {
  starPerson: StarPersonType
  matches: number
  total: number
  matchPercentage: number
  differences: {
    month: number
    current: FortuneType
    original: FortuneType
  }[]
}

// 運気パターンを比較する関数
export function comparePatterns(
  currentPatterns: Record<StarPersonType, FortuneType[]>,
  originalPatterns: Record<StarPersonType, FortuneType[]>,
): Record<StarPersonType, PatternComparisonResult> {
  const results: Record<StarPersonType, PatternComparisonResult> = {} as Record<StarPersonType, PatternComparisonResult>

  // すべての星人タイプについて比較
  Object.keys(currentPatterns).forEach((starPerson) => {
    const typedStarPerson = starPerson as StarPersonType
    const currentPattern = currentPatterns[typedStarPerson]
    const originalPattern = originalPatterns[typedStarPerson]

    // 差異を検出
    const differences = []
    let matches = 0

    for (let i = 0; i < 12; i++) {
      if (currentPattern[i] === originalPattern[i]) {
        matches++
      } else {
        differences.push({
          month: i + 1,
          current: currentPattern[i],
          original: originalPattern[i],
        })
      }
    }

    // 結果を格納
    results[typedStarPerson] = {
      starPerson: typedStarPerson,
      matches,
      total: 12,
      matchPercentage: (matches / 12) * 100,
      differences,
    }
  })

  return results
}

// パターンをインポートする関数（CSVまたはJSONから）
export function importPatterns(data: string, format: "csv" | "json"): Record<StarPersonType, FortuneType[]> | null {
  try {
    if (format === "json") {
      return JSON.parse(data) as Record<StarPersonType, FortuneType[]>
    } else if (format === "csv") {
      const patterns: Record<StarPersonType, FortuneType[]> = {} as Record<StarPersonType, FortuneType[]>
      const lines = data.trim().split("\n")

      // ヘッダー行をスキップ
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",")
        const starPerson = columns[0] as StarPersonType
        const fortuneTypes = columns.slice(1, 13) as FortuneType[]

        if (starPerson && fortuneTypes.length === 12) {
          patterns[starPerson] = fortuneTypes
        }
      }

      return patterns
    }

    return null
  } catch (error) {
    console.error("パターンのインポートに失敗しました:", error)
    return null
  }
}

// パターンをエクスポートする関数（CSVまたはJSONとして）
export function exportPatterns(patterns: Record<StarPersonType, FortuneType[]>, format: "csv" | "json"): string {
  if (format === "json") {
    return JSON.stringify(patterns, null, 2)
  } else if (format === "csv") {
    const lines = ["星人タイプ,1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月"]

    Object.entries(patterns).forEach(([starPerson, fortuneTypes]) => {
      lines.push(`${starPerson},${fortuneTypes.join(",")}`)
    })

    return lines.join("\n")
  }

  return ""
}

// パターンを更新する関数
export function updatePattern(
  patterns: Record<StarPersonType, FortuneType[]>,
  starPerson: StarPersonType,
  month: number,
  newFortune: FortuneType,
): Record<StarPersonType, FortuneType[]> {
  const updatedPatterns = { ...patterns }
  const updatedPattern = [...updatedPatterns[starPerson]]
  updatedPattern[month - 1] = newFortune
  updatedPatterns[starPerson] = updatedPattern

  return updatedPatterns
}

// すべてのパターンを更新する関数
export function updateAllPatterns(
  currentPatterns: Record<StarPersonType, FortuneType[]>,
  originalPatterns: Record<StarPersonType, FortuneType[]>,
): Record<StarPersonType, FortuneType[]> {
  return { ...originalPatterns }
}
