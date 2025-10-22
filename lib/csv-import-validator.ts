// CSVインポート機能の検証・修正ツール
import { csvImportedData } from "./stroke-data/csv-imported-data"

// 重要な文字のリスト（よく使われる漢字）
const CRITICAL_CHARACTERS = [
  { char: "条", expectedStrokes: 11 },
  { char: "承", expectedStrokes: 8 },
  { char: "桑", expectedStrokes: 10 },
  { char: "陸", expectedStrokes: 16 },
  { char: "也", expectedStrokes: 3 },
  { char: "斉", expectedStrokes: 8 },
  { char: "條", expectedStrokes: 11 }, // 旧字体
]

// CSVデータの整合性チェック
export function validateCsvImportData() {
  console.log("🔍 CSVインポートデータ検証開始")

  const results = {
    total: Object.keys(csvImportedData).length,
    missing: [] as string[],
    incorrect: [] as { char: string; expected: number; actual: number }[],
    correct: [] as string[],
  }

  CRITICAL_CHARACTERS.forEach(({ char, expectedStrokes }) => {
    const actualStrokes = csvImportedData[char]

    if (actualStrokes === undefined) {
      results.missing.push(char)
      console.log(`❌ ${char}: 未登録 (期待値: ${expectedStrokes}画)`)
    } else if (actualStrokes !== expectedStrokes) {
      results.incorrect.push({ char, expected: expectedStrokes, actual: actualStrokes })
      console.log(`⚠️ ${char}: ${actualStrokes}画 (期待値: ${expectedStrokes}画)`)
    } else {
      results.correct.push(char)
      console.log(`✅ ${char}: ${actualStrokes}画`)
    }
  })

  console.log("📊 検証結果:")
  console.log(`- 総文字数: ${results.total}`)
  console.log(`- 正常: ${results.correct.length}`)
  console.log(`- 未登録: ${results.missing.length}`)
  console.log(`- 不正確: ${results.incorrect.length}`)

  return results
}

// 緊急修正用の強制データ
export const EMERGENCY_STROKE_DATA: Record<string, number> = {
  条: 11,
  承: 8,
  桑: 10,
  陸: 16,
  也: 3,
  斉: 8,
  條: 11, // 旧字体
}

// 緊急修正データを適用
export function applyEmergencyFix() {
  console.log("🚨 緊急修正データを適用中...")

  Object.entries(EMERGENCY_STROKE_DATA).forEach(([char, strokes]) => {
    console.log(`🔧 ${char}: ${strokes}画 を強制適用`)
  })

  return EMERGENCY_STROKE_DATA
}
