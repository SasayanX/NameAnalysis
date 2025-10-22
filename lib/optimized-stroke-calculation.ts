// 段階1: 画数計算の最適化（既存関数を拡張）
import { getCharStroke } from "./name-data-simple"
import { simpleCache } from "./simple-cache"

// 最適化された画数取得（キャッシュ付き）
export function getOptimizedCharStroke(char: string): number {
  const cacheKey = `stroke_${char}`
  const cached = simpleCache.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  const result = getCharStroke(char)
  simpleCache.set(cacheKey, result, 3600000) // 1時間キャッシュ

  return result
}

// 最適化された名前の総画数計算
export function getOptimizedNameStrokes(name: string): number {
  const cacheKey = `name_strokes_${name}`
  const cached = simpleCache.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  let total = 0
  const chars = Array.from(name)

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

  simpleCache.set(cacheKey, total, 300000) // 5分間キャッシュ
  return total
}

// バッチ処理用の画数計算
export function calculateMultipleCharStrokes(chars: string[]): number[] {
  return chars.map((char) => getOptimizedCharStroke(char))
}
