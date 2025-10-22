// 重複チェックスクリプト
import { MALE_NAMES, FEMALE_NAMES } from "../lib/baby-naming-engine.js"

console.log("🔍 重複チェック開始...")

// 男性名前の重複チェック
const maleKanji = MALE_NAMES.map((n) => n.kanji)
const maleDuplicates = maleKanji.filter((item, index) => maleKanji.indexOf(item) !== index)

// 女性名前の重複チェック
const femaleKanji = FEMALE_NAMES.map((n) => n.kanji)
const femaleDuplicates = femaleKanji.filter((item, index) => femaleKanji.indexOf(item) !== index)

console.log(`
📋 重複チェック結果:
   男性名前重複: ${maleDuplicates.length}個 ${maleDuplicates.length > 0 ? maleDuplicates.join(", ") : "✅ なし"}
   女性名前重複: ${femaleDuplicates.length}個 ${femaleDuplicates.length > 0 ? femaleDuplicates.join(", ") : "✅ なし"}
`)

if (maleDuplicates.length === 0 && femaleDuplicates.length === 0) {
  console.log("🎉 重複なし！データベースは完璧です。")
} else {
  console.log("⚠️  重複が見つかりました。修正が必要です。")
}
