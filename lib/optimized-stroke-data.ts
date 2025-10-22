// 画数データの最適化版
import { strokeCountData } from "./name-data-simple"
import { cacheManager } from "./cache-manager"
import { withPerformanceMonitoring } from "./performance-monitor"

// 最適化された画数取得関数
export function getOptimizedCharStroke(char: string): number {
  // キャッシュから取得を試行
  const cacheKey = `stroke_${char}`
  const cached = cacheManager.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  // 実際の計算
  const result = withPerformanceMonitoring("getCharStroke", () => {
    const stroke = strokeCountData[char]
    if (stroke !== undefined) {
      return stroke
    }

    // デフォルト値の計算（最適化版）
    const charCode = char.charCodeAt(0)

    if (charCode >= 0x30 && charCode <= 0x39) return 1 // 数字
    if ((charCode >= 0x41 && charCode <= 0x5a) || (charCode >= 0x61 && charCode <= 0x7a)) return 1 // 英字
    if (charCode >= 0x3040 && charCode <= 0x309f) return 3 // ひらがな
    if (charCode >= 0x30a0 && charCode <= 0x30ff) return 3 // カタカナ
    if (charCode >= 0x4e00 && charCode <= 0x9faf) return 10 // 漢字

    return 1
  })

  // キャッシュに保存
  cacheManager.set(cacheKey, result, 600000) // 10分間キャッシュ

  return result
}

// バッチ処理用の最適化された関数
export function getMultipleCharStrokes(chars: string[]): number[] {
  return withPerformanceMonitoring("getMultipleCharStrokes", () => {
    return chars.map((char) => getOptimizedCharStroke(char))
  })
}

// 名前全体の画数計算（最適化版）
export function calculateOptimizedNameStrokes(name: string): number {
  const cacheKey = `name_strokes_${name}`
  const cached = cacheManager.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  const result = withPerformanceMonitoring("calculateNameStrokes", () => {
    const chars = Array.from(name)
    let total = 0

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]

      if (char === "々" && i > 0) {
        // 々は直前の文字と同じ画数
        const prevChar = chars[i - 1]
        total += getOptimizedCharStroke(prevChar)
      } else {
        total += getOptimizedCharStroke(char)
      }
    }

    return total
  })

  // キャッシュに保存
  cacheManager.set(cacheKey, result, 300000) // 5分間キャッシュ

  return result
}
