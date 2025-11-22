// サーバーサイド専用の画数取得関数
// "use client"ディレクティブなしで動作する

import { basicNumbersData } from "./stroke-data/basic-numbers"
import { surnamesData } from "./stroke-data/surnames"
import givenNamesData from "./stroke-data/given-names"
import { commonKanjiData } from "./stroke-data/common-kanji"
import { hiraganaData, katakanaData } from "./stroke-data/kana"
import { extendedKanjiData } from "./stroke-data/extended-kanji"
import { csvImportedData } from "./stroke-data/csv-imported-data"
import { csvImportedManusData } from "./stroke-data/csv-imported-manus"

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
  ...csvImportedManusData,
  // 直接追加（新データと競合する場合のみ手動上書き）
  寛: 15,
  住: 7,
  紳: 11,
  佐: 7,
  靖: 13,
  隆: 17, // 新データは12画だが、17画が正しい
  曽: 12, // 曽: 12画（曾の新字体）
  津: 10, // 津: 10画（csv-imported-manus.tsでは9画だが、10画が正しい）
  慎: 14,
  帆: 6,
  不: 4,
  室: 9,
  布: 5,
  袋: 11,
  寅: 11,
  泰: 9, // 新データは10画だが、9画が正しい
  常: 11,
  香: 9,
  申: 5,
  瀬: 20,
  証: 12,
  券: 8,
  槻: 15,
  ョ: 3,
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

/**
 * サーバーサイド専用の画数取得関数
 */
export function getCharStrokeWithContextServer(
  char: string,
  fullText: string,
  position: number,
): {
  stroke: number
  isDefault: boolean
} {
  // 「寛」の場合は15画を返す
  if (char === "寛") {
    return { stroke: 15, isDefault: false }
  }
  
  // 「曽」の場合は12画を返す
  if (char === "曽") {
    return { stroke: 12, isDefault: false }
  }
  
  // アルファベット文字の画数を取得（大文字・小文字別）
  if (REGEX_PATTERNS.english.test(char)) {
    const stroke = strokeCountData[char]
    if (stroke !== undefined) {
      return { stroke, isDefault: false }
    }
    // データベースにない場合はデフォルト値
    return { stroke: 1, isDefault: true }
  }
  
  if (char === "々") {
    if (position > 0) {
      const prevChar = fullText.charAt(position - 1)
      const prevStroke = strokeCountData[prevChar]
      if (prevStroke === undefined) {
        // 前の文字の画数が不明な場合は7画（一般的な繰り返し文字の画数）
        return { stroke: 7, isDefault: true }
      }
      return { stroke: prevStroke, isDefault: false }
    } else {
      // 最初の文字が「々」の場合は7画
      return { stroke: 7, isDefault: true }
    }
  }

  const stroke = strokeCountData[char]

  if (stroke === undefined) {
    const defaultStroke = getDefaultStrokeByCharType(char)
    return { stroke: defaultStroke, isDefault: true }
  }

  return { stroke, isDefault: false }
}

