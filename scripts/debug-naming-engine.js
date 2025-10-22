// 赤ちゃん名付けエンジンの徹底デバッグ
import { analyzeNameFortune } from "../lib/name-data-simple.js"
import { generateOptimalNames } from "../lib/baby-naming-engine.js"

console.log("🔍 赤ちゃん名付けエンジン徹底デバッグ開始")

// 1. 佐々木健人の直接分析
console.log("\n📊 佐々木健人の直接分析:")
const kentoAnalysis = analyzeNameFortune("佐々木", "健人", "male")

console.log("=== 実際の分析結果 ===")
console.log(`総合スコア: ${kentoAnalysis.totalScore}点`)
console.log(
  `天格: ${kentoAnalysis.tenFormat}画 (${kentoAnalysis.ten.運勢}) - スコア: ${kentoAnalysis.categories?.find((c) => c.name === "天格")?.score}点`,
)
console.log(
  `人格: ${kentoAnalysis.jinFormat}画 (${kentoAnalysis.jin.運勢}) - スコア: ${kentoAnalysis.categories?.find((c) => c.name === "人格")?.score}点`,
)
console.log(
  `地格: ${kentoAnalysis.chiFormat}画 (${kentoAnalysis.chi.運勢}) - スコア: ${kentoAnalysis.categories?.find((c) => c.name === "地格")?.score}点`,
)
console.log(
  `外格: ${kentoAnalysis.gaiFormat}画 (${kentoAnalysis.gai.運勢}) - スコア: ${kentoAnalysis.categories?.find((c) => c.name === "外格")?.score}点`,
)
console.log(
  `総格: ${kentoAnalysis.totalFormat}画 (${kentoAnalysis.total.運勢}) - スコア: ${kentoAnalysis.categories?.find((c) => c.name === "総格")?.score}点`,
)

// 2. 期待値との比較
console.log("\n🎯 期待値との比較:")
const expected = {
  totalScore: 94,
  tenFormat: 18,
  tenScore: 80,
  tenFortune: "中吉",
  jinFormat: 15,
  jinScore: 100,
  jinFortune: "大吉",
  chiFormat: 13,
  chiScore: 100,
  chiFortune: "大吉",
  gaiFormat: 16,
  gaiScore: 100,
  gaiFortune: "大吉",
  totalFormat: 31,
  totalScore: 100,
  totalFortune: "大吉",
}

console.log("期待値 vs 実際:")
console.log(
  `総合スコア: ${expected.totalScore}点 vs ${kentoAnalysis.totalScore}点 ${expected.totalScore === kentoAnalysis.totalScore ? "✅" : "❌"}`,
)
console.log(
  `天格: ${expected.tenFormat}画 vs ${kentoAnalysis.tenFormat}画 ${expected.tenFormat === kentoAnalysis.tenFormat ? "✅" : "❌"}`,
)
console.log(
  `人格: ${expected.jinFormat}画 vs ${kentoAnalysis.jinFormat}画 ${expected.jinFormat === kentoAnalysis.jinFormat ? "✅" : "❌"}`,
)
console.log(
  `地格: ${expected.chiFormat}画 vs ${kentoAnalysis.chiFormat}画 ${expected.chiFormat === kentoAnalysis.chiFormat ? "✅" : "❌"}`,
)
console.log(
  `外格: ${expected.gaiFormat}画 vs ${kentoAnalysis.gaiFormat}画 ${expected.gaiFormat === kentoAnalysis.gaiFormat ? "✅" : "❌"}`,
)
console.log(
  `総格: ${expected.totalFormat}画 vs ${kentoAnalysis.totalFormat}画 ${expected.totalFormat === kentoAnalysis.totalFormat ? "✅" : "❌"}`,
)

// 3. 画数データの確認
console.log("\n📝 画数データ確認:")
import { strokeCountData } from "../lib/name-data-simple.js"
console.log(`佐: ${strokeCountData["佐"]}画`)
console.log(`々: ${strokeCountData["々"]}画 (特殊処理)`)
console.log(`木: ${strokeCountData["木"]}画`)
console.log(`健: ${strokeCountData["健"]}画`)
console.log(`人: ${strokeCountData["人"]}画`)

// 4. 運勢データの確認
console.log("\n✨ 運勢データ確認:")
import { customFortuneData } from "../lib/fortune-data-custom.js"
console.log(`18画: ${customFortuneData["18"]?.運勢} (${customFortuneData["18"] ? "データあり" : "データなし"})`)
console.log(`15画: ${customFortuneData["15"]?.運勢} (${customFortuneData["15"] ? "データあり" : "データなし"})`)
console.log(`13画: ${customFortuneData["13"]?.運勢} (${customFortuneData["13"] ? "データあり" : "データなし"})`)
console.log(`16画: ${customFortuneData["16"]?.運勢} (${customFortuneData["16"] ? "データあり" : "データなし"})`)
console.log(`31画: ${customFortuneData["31"]?.運勢} (${customFortuneData["31"] ? "データあり" : "データなし"})`)

// 5. 名付けエンジンでの検索テスト
console.log("\n🎯 名付けエンジンでの検索テスト:")
const request = {
  lastName: "佐々木",
  gender: "male",
}

console.log("検索実行中...")
const results = generateOptimalNames(request, 5)

console.log(`\n📋 検索結果: ${results.length}個`)
results.forEach((candidate, index) => {
  console.log(`${index + 1}. ${candidate.kanji} (${candidate.reading}) - ${candidate.totalScore}点`)
  if (candidate.kanji === "健人") {
    console.log("   🎉 健人発見！")
  }
})

const kentoFound = results.find((r) => r.kanji === "健人")
if (kentoFound) {
  console.log("\n✅ 健人が結果に含まれています")
  console.log(`   スコア: ${kentoFound.totalScore}点`)
  console.log(`   ランク: ${kentoFound.powerRank}`)
} else {
  console.log("\n❌ 健人が結果に含まれていません")
  console.log("🔍 原因調査が必要です")
}

// 6. 他の高スコア名前もテスト
console.log("\n🧪 他の名前もテスト:")
const testNames = ["太郎", "一郎", "健太", "大翔", "陽翔"]
testNames.forEach((name) => {
  const analysis = analyzeNameFortune("佐々木", name, "male")
  console.log(`${name}: ${analysis.totalScore}点`)
})

console.log("\n🔍 デバッグ完了")
