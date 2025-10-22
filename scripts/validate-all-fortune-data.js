// 全運勢データの正確性を検証
console.log("🔍 全運勢データ検証開始")

import { customFortuneData } from "../lib/fortune-data-custom.js"

// 1-81画の全データをチェック
const errors = []
const warnings = []

console.log("📊 1-81画の運勢データ検証:")

for (let i = 1; i <= 81; i++) {
  const data = customFortuneData[i.toString()]

  if (!data) {
    errors.push(`${i}画: データなし`)
    continue
  }

  if (!data.運勢) {
    errors.push(`${i}画: 運勢データなし`)
    continue
  }

  if (!data.説明) {
    warnings.push(`${i}画: 説明なし`)
  }

  // 運勢の値をチェック
  const validFortunes = ["大吉", "吉", "中吉", "凶", "大凶", "中凶"]
  if (!validFortunes.includes(data.運勢)) {
    errors.push(`${i}画: 無効な運勢値 "${data.運勢}"`)
  }
}

console.log(`\n📈 検証結果:`)
console.log(`✅ 正常: ${81 - errors.length - warnings.length}個`)
console.log(`⚠️ 警告: ${warnings.length}個`)
console.log(`❌ エラー: ${errors.length}個`)

if (errors.length > 0) {
  console.log("\n❌ エラー詳細:")
  errors.forEach((error) => console.log(`  ${error}`))
}

if (warnings.length > 0) {
  console.log("\n⚠️ 警告詳細:")
  warnings.forEach((warning) => console.log(`  ${warning}`))
}

// 特に重要な画数をチェック
const importantStrokes = [13, 15, 16, 18, 31]
console.log("\n🎯 重要画数の詳細確認:")
importantStrokes.forEach((stroke) => {
  const data = customFortuneData[stroke.toString()]
  if (data) {
    console.log(`${stroke}画: ${data.運勢}`)
    console.log(`  説明: ${data.説明.split("\n")[0]}`)
  } else {
    console.log(`${stroke}画: ❌ データなし`)
  }
})

console.log("\n🔍 検証完了")
