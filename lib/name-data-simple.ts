"use client"

import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"

const REGEX_PATTERNS = {
  english: /[a-zA-Z]/,
  number: /[0-9]/,
  hiragana: /[\u3040-\u309F]/,
  katakana: /[\u30A0-\u30FF]/,
  kanji: /[\u4E00-\u9FAF]/,
}

export const strokeCountData: Record<string, number> = {
  ...basicNumbersData,
  ...surnamesData,
  ...givenNamesData,
  ...commonKanjiData,
  ...hiraganaData,
  ...katakanaData,
  ...extendedKanjiData,
  ...csvImportedData,
  // 直接追加
  寛: 15,
  住: 7,
  紳: 11,
}

// 「々」は繰り返し文字として7画で処理

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
  console.log(`🔍 getCharStrokeWithContext呼び出し: "${char}"`)
  
  // 「寛」の場合は15画を返す
  if (char === "寛") {
    console.log(`🔍 getCharStrokeWithContext: "寛" → 15画 (直接指定)`)
    return { stroke: 15, isDefault: false }
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
    console.log(`🔍 getCharStrokeWithContext: "${char}" → ${defaultStroke}画 (デフォルト)`)
    return { stroke: defaultStroke, isDefault: true }
  }

  console.log(`🔍 getCharStrokeWithContext: "${char}" → ${stroke}画 (データベース)`)
  return { stroke, isDefault: false }
}

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

function generateAdvice(): string {
  return "鑑定結果をお伝えします。"
}

function calculateScore(fortune: any): number {
  switch (fortune.運勢) {
    case "大吉":
      return 100
    case "中吉":
      return 80
    case "吉":
      return 60
    case "凶":
      return 40
    case "中凶":
      return 20
    case "大凶":
      return 0
    default:
      return 50
  }
}

function getFortuneFromCustomDataWithGender(
  strokes: number,
  customFortuneData: Record<string, any>,
  gender: string,
): any {
  const key = String(strokes)
  let fortune = customFortuneData[key]

  if (!fortune) {
    return { 運勢: "不明", 説明: "" }
  }

  if (gender === "female" && fortune.female) {
    fortune = fortune.female
  }

  return fortune
}

// 統一された姓名判断実装を使用
import { analyzeNameFortune as unifiedAnalyzeNameFortune } from "./name-analysis-unified"

export function analyzeNameFortune(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>,
): any {
  // 統一された実装に委譲
  return unifiedAnalyzeNameFortune(lastName, firstName, gender, customFortuneData)
}

// 旧実装（後方互換性のため保持）
function analyzeNameFortuneLegacy(
  lastName: string,
  firstName: string,
  gender = "male",
  customFortuneData?: Record<string, any>,
): any {
  if (!customFortuneData) {
    customFortuneData = {
      "1": { 運勢: "大吉", 説明: "独立心旺盛で、リーダーシップを発揮します。" },
      "2": { 運勢: "凶", 説明: "協調性はありますが、優柔不断な面があります。" },
      "3": { 運勢: "大吉", 説明: "明るく積極的で、人気者になります。" },
      "4": { 運勢: "凶", 説明: "真面目ですが、苦労が多い傾向があります。" },
      "5": { 運勢: "大吉", 説明: "バランス感覚に優れ、安定した人生を送ります。" },
      "6": { 運勢: "大吉", 説明: "責任感が強く、家族思いです。" },
      "7": { 運勢: "吉", 説明: "独立心があり、専門分野で成功します。" },
      "8": { 運勢: "大吉", 説明: "意志が強く、困難を乗り越える力があります。" },
      "9": { 運勢: "凶", 説明: "頭脳明晰ですが、変化の多い人生になります。" },
      "10": { 運勢: "凶", 説明: "波乱万丈な人生ですが、最終的には成功します。" },
    }

    for (let i = 11; i <= 81; i++) {
      if (!customFortuneData[i.toString()]) {
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

  const tenFortune = getFortuneFromCustomDataWithGender(tenFormat, customFortuneData, gender)
  const jinFortune = getFortuneFromCustomDataWithGender(jinFormat, customFortuneData, gender)
  const chiFortune = getFortuneFromCustomDataWithGender(chiFormat, customFortuneData, gender)
  const gaiFortune = getFortuneFromCustomDataWithGender(gaiFormat, customFortuneData, gender)
  const totalFortune = getFortuneFromCustomDataWithGender(totalFormat, customFortuneData, gender)

  const tenScore = calculateScore(tenFortune)
  const jinScore = calculateScore(jinFortune)
  const chiScore = calculateScore(chiFortune)
  const gaiScore = calculateScore(gaiFortune)
  const totalScore = calculateScore(totalFortune)

  const overallScore = Math.round((tenScore + jinScore * 2 + chiScore + gaiScore + totalScore * 2) / 7)

  const characterDetails = []

  if (hasReisuuInLastName) {
    characterDetails.push({
      name: "姓の霊数",
      character: "一",
      strokes: 1,
      isReisuu: true,
      isDefault: false,
    })
  }

  const lastNameChars = Array.from(lastName)
  lastNameChars.forEach((char, i) => {
    const { stroke, isDefault } = getCharStrokeWithContext(char, lastName, i)
    characterDetails.push({
      name: "姓の" + (i + 1) + "文字目",
      character: char,
      strokes: stroke,
      isReisuu: false,
      isDefault: isDefault,
    })
  })

  const firstNameChars = Array.from(firstName)
  firstNameChars.forEach((char, i) => {
    const { stroke, isDefault } = getCharStrokeWithContext(char, firstName, i)
    characterDetails.push({
      name: "名の" + (i + 1) + "文字目",
      character: char,
      strokes: stroke,
      isReisuu: false,
      isDefault: isDefault,
    })
  })

  if (hasReisuuInFirstName) {
    characterDetails.push({
      name: "名の霊数",
      character: "一",
      strokes: 1,
      isReisuu: true,
      isDefault: false,
    })
  }

  const result = {
    totalScore: overallScore,
    categories: [
      {
        name: "天格",
        score: tenScore,
        description: "社会的な成功や対外的な印象を表します",
        fortune: tenFortune.運勢 || "不明",
        explanation: tenFortune.説明 || "",
        strokeCount: tenFormat,
      },
      {
        name: "人格",
        score: jinScore,
        description: "性格や才能、人生の中心的な運勢を表します",
        fortune: jinFortune.運勢 || "不明",
        explanation: jinFortune.説明 || "",
        strokeCount: jinFormat,
      },
      {
        name: "地格",
        score: chiScore,
        description: "家庭環境や若年期の運勢を表します",
        fortune: chiFortune.運勢 || "不明",
        explanation: chiFortune.説明 || "",
        strokeCount: chiFormat,
      },
      {
        name: "外格",
        score: gaiScore,
        description: "社会的な人間関係や外部からの影響を表します",
        fortune: gaiFortune.運勢 || "不明",
        explanation: gaiFortune.説明 || "",
        strokeCount: gaiFormat,
      },
      {
        name: "総格",
        score: totalScore,
        description: "人生全体の総合的な運勢を表します",
        fortune: totalFortune.運勢 || "不明",
        explanation: totalFortune.説明 || "",
        strokeCount: totalFormat,
      },
    ],
    characterDetails: characterDetails,
    advice: generateAdvice(),
    ten: {
      運勢: tenFortune.運勢 || "不明",
      説明: tenFortune.説明 || "",
    },
    jin: {
      運勢: jinFortune.運勢 || "不明",
      説明: jinFortune.説明 || "",
    },
    chi: {
      運勢: chiFortune.運勢 || "不明",
      説明: chiFortune.説明 || "",
    },
    gai: {
      運勢: gaiFortune.運勢 || "不明",
      説明: gaiFortune.説明 || "",
    },
    total: {
      運勢: totalFortune.運勢 || "不明",
      説明: totalFortune.説明 || "",
    },
    tenFormat: tenFormat,
    jinFormat: jinFormat,
    chiFormat: chiFormat,
    gaiFormat: gaiFormat,
    totalFormat: totalFormat,
  }

  return result
}
