"use client"

// 緊急修正版 - CSVインポート問題対応
import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"
import { EMERGENCY_STROKE_DATA } from "./csv-import-validator"

const REGEX_PATTERNS = {
  english: /[a-zA-Z]/,
  number: /[0-9]/,
  hiragana: /[\u3040-\u309F]/,
  katakana: /[\u30A0-\u30FF]/,
  kanji: /[\u4E00-\u9FAF]/,
}

// 緊急修正版 - 強制的に重要文字を最優先
export const strokeCountData: Record<string, number> = {
  ...basicNumbersData,
  ...surnamesData,
  ...givenNamesData,
  ...commonKanjiData,
  ...hiraganaData,
  ...katakanaData,
  ...extendedKanjiData,
  ...csvImportedData,
  ...EMERGENCY_STROKE_DATA, // 緊急修正データを最優先で適用
}

// 「々」を削除（特別処理するため）
delete strokeCountData["々"]

// デバッグ用ログ
console.log("🚨 緊急修正版データ読み込み完了")
console.log("重要文字確認:")
Object.entries(EMERGENCY_STROKE_DATA).forEach(([char, strokes]) => {
  console.log(`${char}: ${strokeCountData[char]}画 (期待値: ${strokes}画)`)
})

export function getCharStroke(char: string): number {
  const stroke = strokeCountData[char]
  if (stroke === undefined) {
    return 0
  }
  return stroke
}

function getDefaultStrokeByCharType(char: string): number {
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

export function getCharStrokeWithContext(
  char: string,
  fullText: string,
  position: number,
): {
  stroke: number
  isDefault: boolean
} {
  // 緊急修正 - 重要文字を強制チェック
  if (EMERGENCY_STROKE_DATA[char] !== undefined) {
    console.log(`🚨 緊急修正適用: ${char} → ${EMERGENCY_STROKE_DATA[char]}画`)
    return { stroke: EMERGENCY_STROKE_DATA[char], isDefault: false }
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
    return { stroke: defaultStroke, isDefault: true }
  }

  return { stroke, isDefault: false }
}

// 以下、既存の関数は同じ実装を使用
export function getNameStrokesWithReisuuArray(
  lastName: string,
  firstName: string,
): {
  lastNameStrokes: number[]
  firstNameStrokes: number[]
  hasReisuuInLastName: boolean
  hasReisuuInFirstName: boolean
} {
  const lastNameChars = Array.from(lastName)
  const firstNameChars = Array.from(firstName)

  const baseLastNameStrokes = lastNameChars.map((char, i) => {
    const { stroke } = getCharStrokeWithContext(char, lastName, i)
    return stroke
  })

  const baseFirstNameStrokes = firstNameChars.map((char, i) => {
    const { stroke } = getCharStrokeWithContext(char, firstName, i)
    return stroke
  })

  const hasReisuuInLastName = lastNameChars.length === 1
  const hasReisuuInFirstName = firstNameChars.length === 1

  const lastNameStrokes = hasReisuuInLastName ? [...baseLastNameStrokes, 1] : baseLastNameStrokes
  const firstNameStrokes = hasReisuuInFirstName ? [...baseFirstNameStrokes, 1] : baseFirstNameStrokes

  return {
    lastNameStrokes,
    firstNameStrokes,
    hasReisuuInLastName,
    hasReisuuInFirstName,
  }
}

export function calculateTotalStrokes(name: string): number {
  return calculateNameStrokes(name)
}

export function calculateNameStrokes(name: string): number {
  let total = 0
  const chars = Array.from(name)

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const { stroke } = getCharStrokeWithContext(char, name, i)
    total += stroke
  }

  return total
}

// 簡略化された分析関数（緊急対応版）
export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>,
): any {
  // 基本的なデフォルトデータ
  if (!customFortuneData) {
    customFortuneData = {}
    for (let i = 1; i <= 81; i++) {
      const mod = i % 10
      if ([1, 3, 5, 6, 8].includes(mod)) {
        customFortuneData[i.toString()] = { 運勢: "吉", 説明: "良好な運勢です。" }
      } else if ([2, 4, 9].includes(mod)) {
        customFortuneData[i.toString()] = { 運勢: "凶", 説明: "注意が必要な運勢です。" }
      } else {
        customFortuneData[i.toString()] = { 運勢: "中吉", 説明: "普通の運勢です。" }
      }
    }
  }

  lastName = lastName.trim()
  firstName = firstName.trim()

  const { lastNameStrokes, firstNameStrokes, hasReisuuInLastName, hasReisuuInFirstName } =
    getNameStrokesWithReisuuArray(lastName, firstName)

  const lastNameCount = lastNameStrokes.reduce((sum, stroke) => sum + stroke, 0)
  const firstNameCount = firstNameStrokes.reduce((sum, stroke) => sum + stroke, 0)

  const tenFormat = lastNameCount
  const chiFormat = firstNameCount

  const actualLastNameStrokes = Array.from(lastName).reduce((sum, char, i) => {
    const { stroke } = getCharStrokeWithContext(char, lastName, i)
    return sum + stroke
  }, 0)
  const actualFirstNameStrokes = Array.from(firstName).reduce((sum, char, i) => {
    const { stroke } = getCharStrokeWithContext(char, firstName, i)
    return sum + stroke
  }, 0)
  const totalFormat = actualLastNameStrokes + actualFirstNameStrokes

  const lastCharOfLastName = lastName.charAt(lastName.length - 1)
  const firstCharOfFirstName = firstName.charAt(0)
  const { stroke: lastCharStroke } = getCharStrokeWithContext(lastCharOfLastName, lastName, lastName.length - 1)
  const { stroke: firstCharStroke } = getCharStrokeWithContext(firstCharOfFirstName, firstName, 0)
  const jinFormat = lastCharStroke + firstCharStroke

  let gaiFormat: number
  if (hasReisuuInLastName && hasReisuuInFirstName) {
    gaiFormat = 2
  } else if (hasReisuuInLastName && !hasReisuuInFirstName) {
    const lastNameChar = Array.from(firstName)[Array.from(firstName).length - 1]
    const { stroke: lastCharStrokeInFirstName } = getCharStrokeWithContext(
      lastNameChar,
      firstName,
      Array.from(firstName).length - 1,
    )
    gaiFormat = 1 + lastCharStrokeInFirstName
  } else if (!hasReisuuInLastName && hasReisuuInFirstName) {
    const firstNameChar = Array.from(lastName)[0]
    const { stroke: firstCharStrokeInLastName } = getCharStrokeWithContext(firstNameChar, lastName, 0)
    gaiFormat = firstCharStrokeInLastName + 1
  } else {
    gaiFormat = tenFormat + chiFormat - jinFormat
  }

  if (gaiFormat <= 0) {
    gaiFormat = 2
  }

  // 簡略化された結果を返す
  return {
    totalScore: 75, // 仮の値
    categories: [
      { name: "天格", score: 75, strokeCount: tenFormat },
      { name: "人格", score: 75, strokeCount: jinFormat },
      { name: "地格", score: 75, strokeCount: chiFormat },
      { name: "外格", score: 75, strokeCount: gaiFormat },
      { name: "総格", score: 75, strokeCount: totalFormat },
    ],
    characterDetails: [],
    advice: "緊急修正版での分析結果です。",
    tenFormat,
    jinFormat,
    chiFormat,
    gaiFormat,
    totalFormat,
  }
}
