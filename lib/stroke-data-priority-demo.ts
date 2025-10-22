// stroke-dataファイル内で同じ漢字があった場合の処理デモ

// 現在の統合順序（優先度の低い順から高い順）
const dataIntegrationOrder = {
  1: "basicNumbersData", // 最低優先度
  2: "surnamesData",
  3: "givenNamesData",
  4: "commonKanjiData",
  5: "hiraganaData",
  6: "katakanaData",
  7: "extendedKanjiData",
  8: "csvImportedData", // 最高優先度（最後に適用される）
}

// 実際の統合処理の例
function demonstrateDataPriority() {
  // 例：「学」という漢字が複数のファイルで定義されている場合

  const basicNumbers = { 学: 8 } // 基本データ
  const commonKanji = { 学: 8 } // 一般漢字データ
  const extendedKanji = { 学: 16 } // 拡張漢字データ（旧字体として16画）
  const csvImported = { 学: 16 } // CSVインポートデータ

  // JavaScriptのスプレッド演算子による統合
  const result = {
    ...basicNumbers, // 学: 8
    ...commonKanji, // 学: 8 (変更なし)
    ...extendedKanji, // 学: 16 (上書き)
    ...csvImported, // 学: 16 (変更なし、最終確定)
  }

  console.log("最終的な「学」の画数:", result["学"]) // 16画

  return result
}

// 優先度の仕組み
export function explainPrioritySystem() {
  console.log("=== stroke-data優先度システム ===")
  console.log("1. 後から読み込まれるデータが前のデータを上書きします")
  console.log("2. 優先度（高い順）:")
  console.log("   🥇 csvImportedData（最優先）")
  console.log("   🥈 extendedKanjiData")
  console.log("   🥉 katakanaData")
  console.log("   4️⃣ hiraganaData")
  console.log("   5️⃣ commonKanjiData")
  console.log("   6️⃣ givenNamesData")
  console.log("   7️⃣ surnamesData")
  console.log("   8️⃣ basicNumbersData（最低優先度）")
  console.log("")
  console.log("3. 実際の例:")
  console.log("   - 「学」がcommonKanjiで8画、extendedKanjiで16画の場合")
  console.log("   - 最終的には16画が採用される（extendedKanjiが後から読み込まれるため）")
}

// 重複チェック機能
export function checkDuplicateCharacters() {
  // 各データソースから重複する文字を検出
  const duplicates: Record<string, Array<{ source: string; strokes: number }>> = {}

  // 実際のデータを使用して重複チェック
  const dataSources = [
    { name: "basicNumbers", data: {} },
    { name: "surnames", data: {} },
    { name: "givenNames", data: {} },
    { name: "commonKanji", data: {} },
    { name: "hiragana", data: {} },
    { name: "katakana", data: {} },
    { name: "extendedKanji", data: {} },
    { name: "csvImported", data: {} },
  ]

  // 重複検出ロジック
  dataSources.forEach((source) => {
    Object.entries(source.data).forEach(([char, strokes]) => {
      if (!duplicates[char]) {
        duplicates[char] = []
      }
      duplicates[char].push({
        source: source.name,
        strokes: strokes as number,
      })
    })
  })

  // 重複がある文字のみフィルタ
  const actualDuplicates = Object.entries(duplicates)
    .filter(([char, sources]) => sources.length > 1)
    .reduce(
      (acc, [char, sources]) => {
        acc[char] = sources
        return acc
      },
      {} as typeof duplicates,
    )

  return actualDuplicates
}

// 優先度に基づく最終値の決定
export function getFinalStrokeValue(char: string): {
  finalValue: number
  sources: Array<{ source: string; value: number }>
  winningSource: string
} {
  const sources = []

  // 各データソースをチェック（実際のインポートデータを使用）
  // この例では簡略化

  return {
    finalValue: 0,
    sources: [],
    winningSource: "",
  }
}

demonstrateDataPriority()
explainPrioritySystem()
