// 吉凶データベースの正確性を検証するスクリプト
console.log("🔍 吉凶データベース検証開始")

// カスタム運勢データをインポート
import { customFortuneData } from "../lib/fortune-data-custom.js"

// 佐々木健人の各格を正確に計算
const lastName = "佐々木"
const firstName = "健人"

console.log(`\n📊 ${lastName}${firstName}の詳細分析`)

// 画数計算（正確な値）
const strokeData = {
  佐: 7,
  々: 7, // 直前の文字と同じ
  木: 4,
  健: 11,
  人: 2,
}

console.log("📝 画数データ:")
Object.entries(strokeData).forEach(([char, stroke]) => {
  console.log(`  ${char}: ${stroke}画`)
})

// 各格の計算
const lastNameStrokes = 7 + 7 + 4 // 18画
const firstNameStrokes = 11 + 2 // 13画
const hasReisuuInFirstName = false // 2文字なので霊数なし

const tenFormat = lastNameStrokes // 18画
const chiFormat = firstNameStrokes // 13画（霊数なし）
const jinFormat = 4 + 11 // 木 + 健 = 15画
const totalFormat = lastNameStrokes + firstNameStrokes // 31画
const gaiFormat = tenFormat + chiFormat - jinFormat // 18 + 13 - 15 = 16画

console.log("\n🎯 各格の画数:")
console.log(`  天格: ${tenFormat}画`)
console.log(`  人格: ${jinFormat}画`)
console.log(`  地格: ${chiFormat}画`)
console.log(`  外格: ${gaiFormat}画`)
console.log(`  総格: ${totalFormat}画`)

// 各格の運勢を確認
console.log("\n✨ 各格の運勢（正確なデータベースから）:")

const fortunes = {
  天格: customFortuneData[tenFormat.toString()],
  人格: customFortuneData[jinFormat.toString()],
  地格: customFortuneData[chiFormat.toString()],
  外格: customFortuneData[gaiFormat.toString()],
  総格: customFortuneData[totalFormat.toString()],
}

Object.entries(fortunes).forEach(([kaku, fortune]) => {
  if (fortune) {
    console.log(
      `  ${kaku}(${kaku === "天格" ? tenFormat : kaku === "人格" ? jinFormat : kaku === "地格" ? chiFormat : kaku === "外格" ? gaiFormat : totalFormat}画): ${fortune.運勢}`,
    )
    console.log(`    説明: ${fortune.説明.split("\n")[0]}`)
  } else {
    const strokeCount =
      kaku === "天格"
        ? tenFormat
        : kaku === "人格"
          ? jinFormat
          : kaku === "地格"
            ? chiFormat
            : kaku === "外格"
              ? gaiFormat
              : totalFormat
    console.log(`  ${kaku}(${strokeCount}画): データなし ⚠️`)
  }
})

// スコア計算
function calculateScore(fortune) {
  if (!fortune) return 50
  switch (fortune.運勢) {
    case "大吉":
      return 100
    case "吉":
      return 80
    case "中吉":
      return 60
    case "凶":
      return 40
    case "大凶":
      return 20
    case "中凶":
      return 30
    default:
      return 50
  }
}

const scores = {
  天格: calculateScore(fortunes.天格),
  人格: calculateScore(fortunes.人格),
  地格: calculateScore(fortunes.地格),
  外格: calculateScore(fortunes.外格),
  総格: calculateScore(fortunes.総格),
}

console.log("\n📈 各格のスコア:")
Object.entries(scores).forEach(([kaku, score]) => {
  console.log(`  ${kaku}: ${score}点`)
})

// 総合スコア計算（人格と総格を重視）
const overallScore = Math.round((scores.天格 + scores.人格 * 2 + scores.地格 + scores.外格 + scores.総格 * 2) / 7)
console.log(`\n🏆 総合スコア: ${overallScore}点`)

// パワーランク判定
function determinePowerRank(totalPoints) {
  if (totalPoints >= 600) return "SSS"
  if (totalPoints >= 550) return "SS"
  if (totalPoints >= 500) return "S"
  if (totalPoints >= 450) return "A+"
  if (totalPoints >= 400) return "A"
  if (totalPoints >= 350) return "B+"
  if (totalPoints >= 300) return "B"
  if (totalPoints >= 250) return "C"
  return "D"
}

// 名前ランキングポイントも計算してみる
console.log("\n🌟 名前パワーランキング分析:")
console.log(`  基本運勢スコア: ${overallScore}点`)

// 凶数チェック
const badFortunes = Object.entries(fortunes).filter(([kaku, fortune]) => {
  return fortune && fortune.運勢.includes("凶")
})

console.log(`\n⚠️ 凶数チェック:`)
if (badFortunes.length > 0) {
  badFortunes.forEach(([kaku, fortune]) => {
    console.log(`  ${kaku}: ${fortune.運勢} ← これが除外原因の可能性`)
  })
} else {
  console.log(`  凶数なし - 除外される理由なし！`)
}

// 除外条件の確認
console.log("\n🔍 除外条件チェック:")
console.log(`  1. 大凶数がある: ${badFortunes.some(([k, f]) => f.運勢 === "大凶") ? "YES ❌" : "NO ✅"}`)
console.log(
  `  2. 凶数が2個以上: ${badFortunes.filter(([k, f]) => f.運勢.includes("凶")).length >= 2 ? "YES ❌" : "NO ✅"}`,
)
console.log(`  3. 総合スコア60未満: ${overallScore < 60 ? "YES ❌" : "NO ✅"}`)

console.log("\n🎯 結論:")
if (badFortunes.length === 0 && overallScore >= 60) {
  console.log("✅ 佐々木健人は除外される理由がありません！")
  console.log("🔧 表示されない原因は別にあります - 検索ロジックを確認が必要")
} else {
  console.log("❌ 除外される理由が見つかりました")
  console.log("💡 除外条件を緩和するか、特別扱いが必要")
}
