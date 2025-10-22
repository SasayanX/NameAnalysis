// 画数データのデバッグ用ユーティリティ
import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"

// 各データソースを個別にチェック
export function debugCharacterSources(char: string) {
  console.log(`🔍 "${char}" の画数データ調査:`)

  const sources = [
    { name: "basicNumbers", data: basicNumbersData },
    { name: "surnames", data: surnamesData },
    { name: "givenNames", data: givenNamesData },
    { name: "commonKanji", data: commonKanjiData },
    { name: "hiragana", data: hiraganaData },
    { name: "katakana", data: katakanaData },
    { name: "extendedKanji", data: extendedKanjiData },
    { name: "csvImported", data: csvImportedData },
  ]

  sources.forEach((source) => {
    const stroke = source.data[char]
    if (stroke !== undefined) {
      console.log(`✅ ${source.name}: ${stroke}画`)
    } else {
      console.log(`❌ ${source.name}: 未登録`)
    }
  })

  // 最終的な統合データでの確認
  const finalData = {
    ...basicNumbersData,
    ...surnamesData,
    ...givenNamesData,
    ...commonKanjiData,
    ...hiraganaData,
    ...katakanaData,
    ...extendedKanjiData,
    ...csvImportedData,
  }

  const finalStroke = finalData[char]
  console.log(`🎯 最終結果: ${finalStroke !== undefined ? finalStroke + "画" : "未登録"}`)

  return {
    sources: sources.map((s) => ({ name: s.name, stroke: s.data[char] })),
    final: finalStroke,
  }
}

// 問題の文字を一括チェック
export function checkProblematicCharacters() {
  const chars = ["桑", "陸", "也"]
  console.log("🚨 問題の文字を一括チェック:")

  chars.forEach((char) => {
    console.log(`\n--- ${char} ---`)
    debugCharacterSources(char)
  })
}

// CSVデータの内容確認
export function verifyCsvData() {
  console.log("📊 CSVデータ確認:")
  console.log("桑:", csvImportedData["桑"])
  console.log("陸:", csvImportedData["陸"])
  console.log("也:", csvImportedData["也"])

  // 文字コードも確認
  console.log("桑の文字コード:", "桑".charCodeAt(0))
  console.log("陸の文字コード:", "陸".charCodeAt(0))
  console.log("也の文字コード:", "也".charCodeAt(0))
}

// 「斉」を含む特定の文字をチェックする関数を追加

export function checkSpecificCharacters() {
  const chars = ["桑", "陸", "也", "斉"] // 斉を追加
  console.log("🚨 特定文字の一括チェック:")

  chars.forEach((char) => {
    console.log(`\n--- ${char} ---`)
    debugCharacterSources(char)
  })
}

// 斉の文字を個別チェック
export function checkSaiCharacter() {
  console.log("🔍 「斉」の詳細調査:")

  // 文字コード確認
  console.log("斉の文字コード:", "斉".charCodeAt(0))

  // CSVデータ確認
  console.log("CSVデータ内の斉:", csvImportedData["斉"])

  // 各データソースを確認
  return debugCharacterSources("斉")
}
