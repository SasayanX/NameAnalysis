/**
 * 画数データの差分チェックスクリプト
 * 旧データと新データ（CSVインポート）の差異を検出します
 */

import { basicNumbersData } from "../lib/stroke-data/basic-numbers"
import { surnamesData } from "../lib/stroke-data/surnames"
import givenNamesData from "../lib/stroke-data/given-names"
import { commonKanjiData } from "../lib/stroke-data/common-kanji"
import { extendedKanjiData } from "../lib/stroke-data/extended-kanji"
import { csvImportedData } from "../lib/stroke-data/csv-imported-data"
import { csvImportedManusData } from "../lib/stroke-data/csv-imported-manus"

// 旧データを統合
const oldData: Record<string, number> = {
  ...basicNumbersData,
  ...surnamesData,
  ...givenNamesData,
  ...commonKanjiData,
  ...extendedKanjiData,
}

// 新データを統合
const newData: Record<string, number> = {
  ...csvImportedData,
  ...csvImportedManusData,
}

interface DiffResult {
  char: string
  oldStroke: number
  newStroke: number
  oldSource: string
  newSource: string
}

// 旧データのソースを特定する関数
function findOldSource(char: string): string {
  if (basicNumbersData[char] !== undefined) return "basicNumbers"
  if (surnamesData[char] !== undefined) return "surnames"
  if (givenNamesData[char] !== undefined) return "givenNames"
  if (commonKanjiData[char] !== undefined) return "commonKanji"
  if (extendedKanjiData[char] !== undefined) return "extendedKanji"
  return "unknown"
}

// 新データのソースを特定する関数
function findNewSource(char: string): string {
  if (csvImportedData[char] !== undefined) return "csvImported"
  if (csvImportedManusData[char] !== undefined) return "csvImportedManus"
  return "unknown"
}

// 差分を検出
const differences: DiffResult[] = []
const allChars = new Set([...Object.keys(oldData), ...Object.keys(newData)])

for (const char of allChars) {
  const oldStroke = oldData[char]
  const newStroke = newData[char]

  // 両方に存在し、画数が異なる場合
  if (oldStroke !== undefined && newStroke !== undefined && oldStroke !== newStroke) {
    differences.push({
      char,
      oldStroke,
      newStroke,
      oldSource: findOldSource(char),
      newSource: findNewSource(char),
    })
  }
}

// 結果を表示
console.log("=".repeat(80))
console.log("画数データ差分レポート")
console.log("=".repeat(80))
console.log()

console.log(`旧データ総数: ${Object.keys(oldData).length} 文字`)
console.log(`新データ総数: ${Object.keys(newData).length} 文字`)
console.log(`重複文字数: ${new Set([...Object.keys(oldData)].filter(c => newData[c] !== undefined)).size} 文字`)
console.log(`画数が異なる文字数: ${differences.length} 文字`)
console.log()

if (differences.length === 0) {
  console.log("✅ 画数の差異は見つかりませんでした。")
} else {
  console.log("⚠️  以下の文字で画数の差異が見つかりました:")
  console.log()
  
  // 差異の大きさでソート
  differences.sort((a, b) => Math.abs(b.newStroke - b.oldStroke) - Math.abs(a.newStroke - a.oldStroke))
  
  // 統計情報
  const diffStats = {
    total: differences.length,
    maxDiff: Math.max(...differences.map(d => Math.abs(d.newStroke - d.oldStroke))),
    avgDiff: differences.reduce((sum, d) => sum + Math.abs(d.newStroke - d.oldStroke), 0) / differences.length,
    bySource: {} as Record<string, number>,
  }
  
  differences.forEach(d => {
    const key = `${d.oldSource} vs ${d.newSource}`
    diffStats.bySource[key] = (diffStats.bySource[key] || 0) + 1
  })
  
  console.log("📊 統計情報:")
  console.log(`   - 最大差異: ${diffStats.maxDiff} 画`)
  console.log(`   - 平均差異: ${diffStats.avgDiff.toFixed(2)} 画`)
  console.log()
  
  console.log("📋 ソース別差異数:")
  Object.entries(diffStats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`   - ${source}: ${count} 文字`)
    })
  console.log()
  
  // 差異が大きい順に表示（上位50件）
  const topDifferences = differences.slice(0, 50)
  console.log("🔍 差異の大きい順（上位50件）:")
  console.log()
  console.log("文字 | 旧画数 | 新画数 | 差異 | 旧ソース | 新ソース")
  console.log("-".repeat(80))
  
  topDifferences.forEach(d => {
    const diff = d.newStroke - d.oldStroke
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`
    console.log(
      `${d.char.padEnd(4)} | ${String(d.oldStroke).padStart(6)} | ${String(d.newStroke).padStart(6)} | ${diffStr.padStart(4)} | ${d.oldSource.padEnd(12)} | ${d.newSource}`
    )
  })
  
  if (differences.length > 50) {
    console.log()
    console.log(`... 他 ${differences.length - 50} 件の差異があります`)
  }
  
  console.log()
  console.log("💡 注意:")
  console.log("   - 新データ（CSVインポート）が後から展開されるため、")
  console.log("     実際に使用される画数は「新画数」になります。")
  console.log("   - 旧データの画数が正しい場合は、手動で上書きするか、")
  console.log("     CSVデータの修正を検討してください。")
}

console.log()
console.log("=".repeat(80))



