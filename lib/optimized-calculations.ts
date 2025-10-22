import { getCharStroke } from "./name-data-simple"
import { performanceOptimizer } from "./performance-optimizer"

// 最適化された画数計算（メモ化付き）
const strokeCache = new Map<string, number>()

export const optimizedGetCharStroke = (char: string): number => {
  // メモリキャッシュから取得
  if (strokeCache.has(char)) {
    return strokeCache.get(char)!
  }

  // 実際の計算
  const result = performanceOptimizer.measurePerformance("char_stroke", () => getCharStroke(char))

  // キャッシュに保存（最大1000文字まで）
  if (strokeCache.size < 1000) {
    strokeCache.set(char, result)
  }

  return result
}

// バッチ処理用の最適化された画数計算
export function calculateMultipleStrokes(chars: string[]): number[] {
  return performanceOptimizer.measurePerformance("multiple_strokes", () => {
    return chars.map((char) => optimizedGetCharStroke(char))
  })
}

// 最適化された名前の総画数計算
export function optimizedCalculateNameStrokes(name: string): number {
  const cacheKey = `name_total_${name}`
  const cached = performanceOptimizer.getCachedResult(cacheKey)

  if (cached !== null) {
    return cached
  }

  const result = performanceOptimizer.measurePerformance("name_strokes", () => {
    const chars = Array.from(name)
    let total = 0

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]

      if (char === "々" && i > 0) {
        // 々は直前の文字と同じ画数
        const prevChar = chars[i - 1]
        total += optimizedGetCharStroke(prevChar)
      } else {
        total += optimizedGetCharStroke(char)
      }
    }

    return total
  })

  performanceOptimizer.cacheResult(cacheKey, result)
  return result
}

// 最適化された格計算
export function optimizedCalculateFormats(
  lastNameStrokes: number[],
  firstNameStrokes: number[],
  hasReisuuInLastName: boolean,
  hasReisuuInFirstName: boolean,
): {
  tenFormat: number
  jinFormat: number
  chiFormat: number
  gaiFormat: number
  totalFormat: number
} {
  const cacheKey = `formats_${lastNameStrokes.join(",")}_${firstNameStrokes.join(",")}_${hasReisuuInLastName}_${hasReisuuInFirstName}`
  const cached = performanceOptimizer.getCachedResult(cacheKey)

  if (cached !== null) {
    return cached
  }

  const result = performanceOptimizer.measurePerformance("calculate_formats", () => {
    const lastNameCount = lastNameStrokes.reduce((sum, stroke) => sum + stroke, 0)
    const firstNameCount = firstNameStrokes.reduce((sum, stroke) => sum + stroke, 0)

    // 天格 = 姓の画数の合計（霊数含む）
    const tenFormat = lastNameCount

    // 地格 = 名の画数の合計（霊数含む）
    const chiFormat = firstNameCount

    // 総格 = 実際の文字の画数のみ（霊数は含めない）
    const actualLastNameStrokes = hasReisuuInLastName
      ? lastNameStrokes.slice(1).reduce((sum, stroke) => sum + stroke, 0)
      : lastNameCount
    const actualFirstNameStrokes = hasReisuuInFirstName
      ? firstNameStrokes.slice(0, -1).reduce((sum, stroke) => sum + stroke, 0)
      : firstNameCount
    const totalFormat = actualLastNameStrokes + actualFirstNameStrokes

    // 人格 = 姓の最後の文字と名の最初の文字の画数の合計（霊数除外）
    const lastCharStroke = hasReisuuInLastName
      ? lastNameStrokes[lastNameStrokes.length - 1]
      : lastNameStrokes[lastNameStrokes.length - 1]
    const firstCharStroke = hasReisuuInFirstName ? firstNameStrokes[0] : firstNameStrokes[0]
    const jinFormat = lastCharStroke + firstCharStroke

    // 外格の計算
    let gaiFormat: number
    if (hasReisuuInLastName && hasReisuuInFirstName) {
      gaiFormat = 2 // 霊数 + 霊数
    } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
      gaiFormat = 1 + firstNameStrokes[firstNameStrokes.length - 1]
    } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
      gaiFormat = lastNameStrokes[0] + 1
    } else {
      gaiFormat = tenFormat + chiFormat - jinFormat
    }

    // 外格が0以下になった場合の安全チェック
    if (gaiFormat <= 0) {
      gaiFormat = 2
    }

    return {
      tenFormat,
      jinFormat,
      chiFormat,
      gaiFormat,
      totalFormat,
    }
  })

  performanceOptimizer.cacheResult(cacheKey, result)
  return result
}

// メモリクリーンアップ関数
export function cleanupOptimizedCalculations(): void {
  strokeCache.clear()
  performanceOptimizer.cleanup()
}
