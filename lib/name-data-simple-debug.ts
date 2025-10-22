"use client"

// デバッグ強化版の画数データ
import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"

// デバッグモードを有効化
const DEBUG_MODE = true

// 強制的にCSVデータを優先する統合データ
export const strokeCountData: Record<string, number> = {
  ...basicNumbersData,
  ...surnamesData,
  ...givenNamesData,
  ...commonKanjiData,
  ...hiraganaData,
  ...katakanaData,
  ...extendedKanjiData,
  ...csvImportedData, // 最優先

  // 問題の文字を強制的に追加（デバッグ用）
  桑: 10,
  陸: 16,
  也: 3,
}

// デバッグ用ログ
if (DEBUG_MODE) {
  console.log("🔍 問題の文字チェック:")
  console.log("桑:", strokeCountData["桑"])
  console.log("陸:", strokeCountData["陸"])
  console.log("也:", strokeCountData["也"])
  console.log("CSVデータから桑:", csvImportedData["桑"])
  console.log("CSVデータから陸:", csvImportedData["陸"])
  console.log("CSVデータから也:", csvImportedData["也"])
}

// 「々」を削除（特別処理するため）
delete strokeCountData["々"]

// 文字の画数を取得する関数（デバッグ強化版）
export function getCharStroke(char: string): number {
  const stroke = strokeCountData[char]

  if (DEBUG_MODE && ["桑", "陸", "也"].includes(char)) {
    console.log(`🎯 getCharStroke("${char}") = ${stroke}`)
  }

  if (stroke === undefined) {
    return 0
  }
  return stroke
}

// 残りの関数は元のまま...
export function getCharStrokeWithContext(
  char: string,
  fullText: string,
  position: number,
): {
  stroke: number
  isDefault: boolean
} {
  if (DEBUG_MODE && ["桑", "陸", "也"].includes(char)) {
    console.log(`🔍 getCharStrokeWithContext: "${char}" (位置: ${position})`)
    console.log(`📊 strokeCountData["${char}"] =`, strokeCountData[char])
  }

  if (char === "々") {
    if (position > 0) {
      const prevChar = fullText.charAt(position - 1)
      const prevStroke = strokeCountData[prevChar]
      if (prevStroke === undefined) {
        return { stroke: 3, isDefault: true }
      }
      return { stroke: prevStroke, isDefault: false }
    } else {
      return { stroke: 3, isDefault: true }
    }
  }

  const stroke = strokeCountData[char]

  if (stroke === undefined) {
    const defaultStroke = getDefaultStrokeByCharType(char)
    if (DEBUG_MODE) {
      console.log(`❌ "${char}"の画数データなし → デフォルト${defaultStroke}画 (isDefault: true)`)
    }
    return { stroke: defaultStroke, isDefault: true }
  }

  if (DEBUG_MODE && ["桑", "陸", "也"].includes(char)) {
    console.log(`✅ "${char}" → ${stroke}画 (データあり)`)
  }
  return { stroke, isDefault: false }
}

function getDefaultStrokeByCharType(char: string): number {
  const REGEX_PATTERNS = {
    english: /[a-zA-Z]/,
    number: /[0-9]/,
    hiragana: /[\u3040-\u309F]/,
    katakana: /[\u30A0-\u30FF]/,
    kanji: /[\u4E00-\u9FAF]/,
  }

  if (REGEX_PATTERNS.english.test(char)) {
    return 1
  }
  if (REGEX_PATTERNS.number.test(char)) {
    return 1
  }
  if (REGEX_PATTERNS.hiragana.test(char)) {
    return 3
  }
  if (REGEX_PATTERNS.katakana.test(char)) {
    return 3
  }
  if (REGEX_PATTERNS.kanji.test(char)) {
    return 10
  }
  return 1
}

// 他の関数も同様に実装...
