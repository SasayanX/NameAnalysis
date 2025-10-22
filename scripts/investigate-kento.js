// 「健人」の調査スクリプト
import { analyzeNameFortune } from "../lib/name-data-simple.js"

console.log("🔍 「健人」調査開始")

// 1. 佐々木健人の詳細分析
console.log("\n📊 佐々木健人の詳細分析:")
const kentoAnalysis = analyzeNameFortune("佐々木", "健人", "male")

console.log("=== 分析結果 ===")
console.log(`総合スコア: ${kentoAnalysis.totalScore}点`)
console.log(`天格: ${kentoAnalysis.tenFormat}画 (${kentoAnalysis.ten.運勢})`)
console.log(`人格: ${kentoAnalysis.jinFormat}画 (${kentoAnalysis.jin.運勢})`)
console.log(`地格: ${kentoAnalysis.chiFormat}画 (${kentoAnalysis.chi.運勢})`)
console.log(`外格: ${kentoAnalysis.gaiFormat}画 (${kentoAnalysis.gai.運勢})`)
console.log(`総格: ${kentoAnalysis.totalFormat}画 (${kentoAnalysis.total.運勢})`)

// 2. 各文字の画数確認
console.log("\n📝 各文字の画数:")
kentoAnalysis.characterDetails.forEach((detail) => {
  console.log(`${detail.name}: ${detail.character} (${detail.strokes}画)`)
})

// 3. パワーランク計算
function calculatePowerRank(score) {
  if (score >= 95) return "SSS"
  if (score >= 90) return "SS"
  if (score >= 85) return "S"
  if (score >= 80) return "A+"
  if (score >= 75) return "A"
  if (score >= 70) return "B+"
  if (score >= 65) return "B"
  if (score >= 60) return "C"
  return "D"
}

const powerRank = calculatePowerRank(kentoAnalysis.totalScore)
console.log(`\n🏆 パワーランク: ${powerRank}`)

// 4. 凶数チェック
const kyousuNumbers = [
  // 大凶
  2, 4, 9, 10, 12, 14, 19, 20, 22, 28, 34, 43, 44, 54,
  // 凶
  26, 27, 46, 53, 59, 72,
  // 中凶
  18, 30, 36, 40, 50, 56, 60, 62, 64, 66, 69, 70, 74, 76, 79, 80,
]

const hasKyousu = [
  kentoAnalysis.tenFormat,
  kentoAnalysis.jinFormat,
  kentoAnalysis.chiFormat,
  kentoAnalysis.gaiFormat,
  kentoAnalysis.totalFormat,
].some((strokes) => kyousuNumbers.includes(strokes))

console.log(`\n⚠️ 凶数チェック: ${hasKyousu ? "凶数あり" : "凶数なし"}`)

if (hasKyousu) {
  console.log("凶数詳細:")
  if (kyousuNumbers.includes(kentoAnalysis.tenFormat)) console.log(`  天格${kentoAnalysis.tenFormat}画: 凶数`)
  if (kyousuNumbers.includes(kentoAnalysis.jinFormat)) console.log(`  人格${kentoAnalysis.jinFormat}画: 凶数`)
  if (kyousuNumbers.includes(kentoAnalysis.chiFormat)) console.log(`  地格${kentoAnalysis.chiFormat}画: 凶数`)
  if (kyousuNumbers.includes(kentoAnalysis.gaiFormat)) console.log(`  外格${kentoAnalysis.gaiFormat}画: 凶数`)
  if (kyousuNumbers.includes(kentoAnalysis.totalFormat)) console.log(`  総格${kentoAnalysis.totalFormat}画: 凶数`)
}

// 5. 表示されない理由の分析
console.log("\n🚫 表示されない理由の分析:")
console.log(`スコア条件 (65点以上): ${kentoAnalysis.totalScore >= 65 ? "✅ クリア" : "❌ 不合格"}`)
console.log(`凶数条件 (凶数なし): ${!hasKyousu ? "✅ クリア" : "❌ 不合格"}`)
console.log(`Sランク条件 (85点以上): ${kentoAnalysis.totalScore >= 85 ? "✅ クリア" : "❌ 不合格"}`)

console.log("\n🔍 調査完了")
