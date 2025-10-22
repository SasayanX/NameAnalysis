// 名前数検証スクリプト
import { getNameCount } from "../lib/baby-naming-engine.js"

console.log("🔍 名前データベース検証開始...")

const counts = getNameCount()

console.log(`
📊 名前数統計:
   男性名前: ${counts.male}個
   女性名前: ${counts.female}個
   合計: ${counts.total}個
`)

// 目標達成チェック
const targetMale = 300
const targetFemale = 300
const targetTotal = 600

console.log(`
🎯 目標達成状況:
   男性: ${counts.male >= targetMale ? "✅" : "❌"} (目標: ${targetMale}個)
   女性: ${counts.female >= targetFemale ? "✅" : "❌"} (目標: ${targetFemale}個)
   合計: ${counts.total >= targetTotal ? "✅" : "❌"} (目標: ${targetTotal}個)
`)

if (counts.total >= targetTotal) {
  console.log("🎉 目標達成！プレミアム機能として十分な名前数を確保しました。")
} else {
  console.log(`⚠️  あと${targetTotal - counts.total}個の名前が必要です。`)
}
