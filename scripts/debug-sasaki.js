// 佐々木の画数計算デバッグスクリプト
import { getCharStrokeWithContext, analyzeNameFortune } from "../lib/name-data-simple.js"

console.log("=== 佐々木の画数計算デバッグ ===")

const lastName = "佐々木"
const chars = Array.from(lastName)

console.log(`文字数: ${chars.length}`)

let total = 0
chars.forEach((char, i) => {
  const { stroke, isDefault } = getCharStrokeWithContext(char, lastName, i)
  console.log(`${i + 1}文字目: "${char}" → ${stroke}画 (isDefault: ${isDefault})`)
  total += stroke
})

console.log(`佐々木の総画数: ${total}画`)

// 葵との組み合わせをテスト
console.log("\n=== 佐々木 葵 の分析 ===")
const analysis1 = analyzeNameFortune("佐々木", "葵", "female")
console.log(`総格: ${analysis1.totalFormat}画`)
console.log(`総合スコア: ${analysis1.totalScore}点`)

// 翔との組み合わせをテスト
console.log("\n=== 佐々木 翔 の分析 ===")
const analysis2 = analyzeNameFortune("佐々木", "翔", "male")
console.log(`総格: ${analysis2.totalFormat}画`)
console.log(`総合スコア: ${analysis2.totalScore}点`)
