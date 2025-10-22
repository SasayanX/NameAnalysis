// データベースの間違いをチェック
console.log("🔍 吉凶データベースの間違いチェック")

import { customFortuneData } from "../lib/fortune-data-custom.js"

// よく使われる画数の正確性をチェック
const commonStrokes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 31, 33,
]

console.log("📊 主要画数の運勢確認:")

commonStrokes.forEach((stroke) => {
  const fortune = customFortuneData[stroke.toString()]
  if (fortune) {
    console.log(`${stroke}画: ${fortune.運勢}`)
  } else {
    console.log(`${stroke}画: データなし ⚠️`)
  }
})

// 特に重要な画数の詳細確認
console.log("\n🎯 佐々木健人関連画数の詳細:")
const kentoStrokes = [13, 14, 15, 16, 17, 18, 31]

kentoStrokes.forEach((stroke) => {
  const fortune = customFortuneData[stroke.toString()]
  if (fortune) {
    console.log(`\n${stroke}画: ${fortune.運勢}`)
    console.log(`説明: ${fortune.説明.split("\n")[0]}`)
  }
})

// 間違いやすい画数の確認
console.log("\n⚠️ 間違いやすい画数の確認:")
const confusingStrokes = [
  { stroke: 18, expected: "中吉", note: "ユーザー指摘" },
  { stroke: 14, expected: "大凶", note: "要確認" },
  { stroke: 16, expected: "大吉", note: "要確認" },
]

confusingStrokes.forEach(({ stroke, expected, note }) => {
  const fortune = customFortuneData[stroke.toString()]
  const actual = fortune ? fortune.運勢 : "データなし"
  const match = actual === expected ? "✅" : "❌"
  console.log(`${stroke}画: 期待値=${expected}, 実際=${actual} ${match} (${note})`)
})
