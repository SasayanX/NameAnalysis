"use client"

import type { StarPersonType, FortuneType, FortuneData, YearlyFortuneData } from "../types/six-star"

// 干支の順序（子年から始まる12年周期）
const zodiacCycle = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 陽陰判定表（PDFから転記）
const zodiacPolarity: Record<string, "+" | "-"> = {
  子: "+", // 陽
  丑: "-", // 陰
  寅: "+", // 陽
  卯: "-", // 陰
  辰: "+", // 陽
  巳: "-", // 陰
  午: "+", // 陽
  未: "-", // 陰
  申: "+", // 陽
  酉: "-", // 陰
  戌: "+", // 陽
  亥: "-", // 陰
}

// 運気記号の定義
export const fortuneSymbols: Record<FortuneType, string> = {
  大吉: "◎",
  吉: "○",
  中吉: "☆",
  凶: "▲",
  大凶: "●",
  中凶: "★",
}

// 運気記号から運気タイプへの変換
export const symbolToFortuneType: Record<string, FortuneType> = {
  "◎": "大吉",
  "○": "吉",
  "☆": "中吉",
  "▲": "凶",
  "●": "大凶",
  "★": "中凶",
}

// 星人タイプ別の運気パターン（12ヶ月分）- 細木かおりの公式パターン
export const starPersonPatterns: Record<StarPersonType, string[]> = {
  "木星人+": ["●", "●", "●", "○", "○", "○", "▲", "☆", "★", "◎", "◎", "◎"],
  "木星人-": ["◎", "●", "●", "●", "○", "○", "○", "▲", "☆", "★", "◎", "◎"],
  "火星人+": ["★", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆"],
  "火星人-": ["☆", "★", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲"],
  "土星人+": ["◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆", "★"],
  "土星人-": ["●", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○", "▲", "☆"],
  "金星人+": ["▲", "☆", "★", "◎", "◎", "◎", "●", "●", "●", "○", "○", "○"],
  "金星人-": ["○", "▲", "☆", "★", "◎", "◎", "◎", "●", "●", "●", "○", "○"],
  "水星人+": ["●", "○", "○", "○", "▲", "☆", "★", "◎", "◎", "◎", "●", "●"],
  "水星人-": ["●", "●", "○", "○", "○", "▲", "☆", "★", "◎", "◎", "◎", "●"],
  "天王星人+": ["○", "○", "○", "▲", "☆", "★", "◎", "◎", "◎", "●", "●", "●"],
  "天王星人-": ["◎", "○", "○", "○", "▲", "☆", "★", "◎", "◎", "◎", "●", "●"],
}

// 運気データの定義
const fortuneDataMap: Record<FortuneType, Omit<FortuneData, "type">> = {
  大吉: { symbol: "◎", level: 5, description: "最高の運気", color: "#dc2626", isGood: true },
  吉: { symbol: "○", level: 4, description: "良い運気", color: "#16a34a", isGood: true },
  中吉: { symbol: "☆", level: 3, description: "まずまずの運気", color: "#7c3aed", isGood: true },
  凶: { symbol: "▲", level: 2, description: "注意が必要", color: "#ea580c", isGood: false },
  大凶: { symbol: "●", level: 1, description: "最も注意が必要", color: "#000000", isGood: false },
  中凶: { symbol: "★", level: 2, description: "やや注意が必要", color: "#ca8a04", isGood: false },
}

/**
 * 統一された六星占術計算クラス
 * 複数の計算方法を排除し、単一の正しいロジックを使用
 */
export class UnifiedSixStarCalculator {
  /**
   * 立春調整（公式の正確な方法）
   * 2月4日前は前年扱い
   */
  private static adjustForRisshun(birthDate: Date): Date {
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()
    
    // 2月4日前は前年扱い（公式の方法）
    if (month < 2 || (month === 2 && day < 4)) {
      const adjustedDate = new Date(birthDate)
      adjustedDate.setFullYear(birthDate.getFullYear() - 1)
      if (process.env.NODE_ENV === "development") {
        console.log(`🌸 立春調整: ${birthDate.getFullYear()}年 → ${adjustedDate.getFullYear()}年`)
      }
      return adjustedDate
    }
    
    return birthDate
  }

  // 定数定義
  private static readonly BASE_YEAR = 1924
  private static readonly DESTINY_CYCLE = 60
  private static readonly STAR_RANGES = [
    { min: 1, max: 10, star: "土星" },
    { min: 11, max: 20, star: "金星" },
    { min: 21, max: 30, star: "火星" },
    { min: 31, max: 40, star: "天王星" },
    { min: 41, max: 50, star: "木星" },
    { min: 51, max: 60, star: "水星" },
  ] as const

  /**
   * 正確な運命数表（最適化版 - 数値キーで高速検索）
   */
  private static readonly accurateDestinyNumberTable: Map<number, number> = new Map([
    // 2000年のデータ
    200001, 200002, 200003, 200004, 200005, 200006,
    200007, 200008, 200009, 200010, 200011, 200012,
    // 1999年のデータ
    199901, 199902, 199903, 199904, 199905, 199906,
    199907, 199908, 199909, 199910, 199911, 199912,
    // 2001年のデータ
    200101, 200102, 200103, 200104, 200105, 200106,
    200107, 200108, 200109, 200110, 200111, 200112,
    // 1969年のデータ（修正版）
    196901, 196902, 196903, 196904, 196905, 196906,
    196907, 196908, 196909, 196910, 196911, 196912,
    // 1972年のデータ（修正版）
    197201, 197202, 197203, 197204, 197205, 197206,
    197207, 197208, 197209, 197210, 197211, 197212,
    // 1985年のデータ（修正版）
    198501, 198502, 198503, 198504, 198505, 198506,
    198507, 198508, 198509, 198510, 198511, 198512,
    // 1995年のデータ（修正版）
    199501, 199502, 199503, 199504, 199505, 199506,
    199507, 199508, 199509, 199510, 199511, 199512,
    // 1989年のデータ（修正版）
    198901, 198902, 198903, 198904, 198905, 198906,
    198907, 198908, 198909, 198910, 198911, 198912,
  ].map((key, index) => [
    key,
    [
      // 2000年
      58, 58, 59, 59, 60, 60, 1, 1, 59, 2, 2, 3,
      // 1999年
      57, 57, 58, 58, 59, 59, 60, 60, 58, 1, 1, 2,
      // 2001年
      59, 59, 60, 60, 1, 1, 2, 2, 60, 3, 3, 4,
      // 1969年
      13, 12, 13, 14, 16, 44, 44, 43, 44, 45, 46, 47,
      // 1972年
      28, 28, 29, 30, 32, 38, 59, 59, 60, 61, 2, 3,
      // 1985年
      41, 41, 42, 27, 45, 45, 46, 45, 46, 47, 48, 49,
      // 1995年
      51, 51, 52, 53, 55, 55, 56, 55, 56, 57, 58, 37,
      // 1989年
      45, 45, 46, 47, 49, 49, 1, 49, 50, 51, 52, 53,
    ][index]
  ]))

  /**
   * 運命数計算（最適化版 - 高速検索）
   */
  private static calculateDestinyNumber(birthDate: Date): number {
    const year = birthDate.getFullYear()
    const month = birthDate.getMonth() + 1
    const key = year * 100 + month // 数値キーで高速検索
    
    // 1. 正確なデータベースから取得を最優先
    const destinyNumber = this.accurateDestinyNumberTable.get(key)
    if (destinyNumber !== undefined) {
      if (process.env.NODE_ENV === "development") {
        console.log(`📊 運命数: ${destinyNumber} (正確なデータベース: ${year}年${month}月)`)
      }
      return destinyNumber
    }
    
    // 2. フォールバック：計算による推定
    const yearDiff = year - this.BASE_YEAR
    let calculatedDestinyNumber = ((yearDiff % this.DESTINY_CYCLE) + month) % this.DESTINY_CYCLE
    if (calculatedDestinyNumber <= 0) calculatedDestinyNumber += this.DESTINY_CYCLE
    
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 運命数: ${calculatedDestinyNumber} (計算による推定: ${year}年${month}月)`)
    }
    return calculatedDestinyNumber
  }

  /**
   * 星数計算（公式の正確な方法）
   * 運命数 - 1 + 生まれ日 = 星数
   * 星数が61以上の場合は60を引く
   */
  private static calculateStarNumber(destinyNumber: number, day: number): number {
    let starNumber = destinyNumber - 1 + day
    
    // 公式の方法：星数が61以上の場合は60を引く
    if (starNumber > 60) {
      starNumber = starNumber - 60
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log(`⭐ 星数計算: ${destinyNumber} - 1 + ${day} = ${starNumber}`)
    }
    return starNumber
  }

  /**
   * 運命星決定（最適化版 - 配列ベースの高速検索）
   * 1-10:土星、11-20:金星、21-30:火星、31-40:天王星、41-50:木星、51-60:水星
   */
  private static determineDestinyStar(starNumber: number): string {
    // 配列ベースの高速検索（if文の連鎖を排除）
    for (const range of this.STAR_RANGES) {
      if (starNumber >= range.min && starNumber <= range.max) {
        return range.star
      }
    }
    
    // フォールバック（通常は発生しない）
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️ 星数${starNumber}は範囲外、水星を返します`)
    }
    return "水星"
  }

  /**
   * 陽陰決定（最適化版 - 環境変数チェック）
   * 干支に基づく陽陰判定
   */
  private static determinePolarity(year: number): "+" | "-" {
    const zodiac = this.getZodiac(year)
    const polarity = zodiacPolarity[zodiac] || "+"
    
    if (process.env.NODE_ENV === "development") {
      console.log(`➕➖ ${zodiac}年生まれ → ${polarity === "+" ? "陽(+)" : "陰(-)"}`)
    }
    return polarity
  }

  /**
   * 干支を取得（最適化版 - 定数使用）
   */
  private static getZodiac(year: number): string {
    // 1924年が甲子年（子年）
    const zodiacIndex = (((year - this.BASE_YEAR) % 12) + 12) % 12
    return zodiacCycle[zodiacIndex]
  }

  /**
   * メイン計算関数（統一ロジック）
   */
  static calculate(birthDate: Date): {
    starType: StarPersonType
    details: {
      originalDate: Date
      adjustedDate: Date
      isAdjusted: boolean
      destinyNumber: number
      starNumber: number
      destinyStar: string
      zodiac: string
      polarity: "+" | "-"
      calculation: string[]
    }
  } {
    const originalDate = new Date(birthDate)
    const adjustedDate = this.adjustForRisshun(birthDate)
    const isAdjusted = adjustedDate.getTime() !== originalDate.getTime()
    
    const year = adjustedDate.getFullYear()
    const month = adjustedDate.getMonth() + 1
    const day = adjustedDate.getDate()
    
    if (process.env.NODE_ENV === "development") {
      console.log(`🔮 六星占術計算開始: ${year}/${month}/${day}`)
    }
    
    // 1. 運命数の計算
    const destinyNumber = this.calculateDestinyNumber(adjustedDate)
    
    // 2. 星数の計算
    const starNumber = this.calculateStarNumber(destinyNumber, day)
    
    // 3. 運命星の決定
    const destinyStar = this.determineDestinyStar(starNumber)
    
    // 4. 陽陰の決定
    const polarity = this.determinePolarity(year)
    
    // 5. 最終結果
    const starType = `${destinyStar}人${polarity}` as StarPersonType
    
    const calculation = [
      `生年月日: ${originalDate.getFullYear()}年${originalDate.getMonth() + 1}月${originalDate.getDate()}日`,
      isAdjusted ? `立春調整: ${year}年${month}月${day}日` : "立春調整: なし",
      `【1】運命数: ${destinyNumber} (${year}年${month}月)`,
      `【2】星数: ${destinyNumber} - 1 + ${day} = ${starNumber}`,
      `【3】運命星: ${destinyStar} (星数${starNumber})`,
      `干支: ${this.getZodiac(year)}年`,
      `【4】陽陰: ${polarity} (${this.getZodiac(year)}年 = ${polarity === "+" ? "陽" : "陰"})`,
      `結果: ${starType}`,
    ]
    
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ 六星占術計算完了: ${starType}`)
      console.log(`📋 計算過程:`, calculation)
    }
    
    return {
      starType,
      details: {
        originalDate,
        adjustedDate,
        isAdjusted,
        destinyNumber,
        starNumber,
        destinyStar,
        zodiac: this.getZodiac(year),
        polarity,
        calculation,
      },
    }
  }
}

/**
 * 外部から使用する関数（統一ロジック）
 */
export function calculateStarPersonFromBirthdate(birthDate: Date): StarPersonType {
  const result = UnifiedSixStarCalculator.calculate(birthDate)
  return result.starType
}

/**
 * 詳細な計算結果を取得
 */
export function calculateStarPersonWithDetails(birthDate: Date) {
  return UnifiedSixStarCalculator.calculate(birthDate)
}

/**
 * 星人タイプの正規化関数
 */
export function normalizeStarPersonType(input: string): StarPersonType {
  const normalized = input.replace(/[　\s]/g, "").trim()
  
  const validTypes: StarPersonType[] = [
    "土星人+", "土星人-",
    "金星人+", "金星人-",
    "火星人+", "火星人-",
    "天王星人+", "天王星人-",
    "木星人+", "木星人-",
    "水星人+", "水星人-",
  ]
  
  for (const validType of validTypes) {
    if (normalized === validType || normalized.includes(validType)) {
      return validType as StarPersonType
    }
  }
  
  console.warn(`⚠️ 不明な星人タイプ: ${input}, デフォルトを使用`)
  return "水星人+"
}

/**
 * 記号から運気データを取得
 */
function getFortuneDataFromSymbol(symbol: string): FortuneData {
  const fortuneType = symbolToFortuneType[symbol] || "吉"
  const baseData = fortuneDataMap[fortuneType]
  
  return {
    type: fortuneType,
    ...baseData,
  }
}

/**
 * 星人タイプと月から運気を取得
 */
export function getFortuneByStarPersonAndMonth(starPerson: StarPersonType, month: number): FortuneType {
  const pattern = starPersonPatterns[starPerson]
  if (!pattern) {
    console.warn(`⚠️ 未知の星人タイプ: ${starPerson}`)
    return "吉"
  }
  
  const index = (month - 1) % 12
  const symbol = pattern[index]
  return symbolToFortuneType[symbol] || "吉"
}

/**
 * 現在の運気を取得
 */
export function getCurrentFortune(starPerson: StarPersonType, birthDate: Date): FortuneData {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  
  const pattern = starPersonPatterns[starPerson]
  if (!pattern) {
    console.warn(`⚠️ 運気パターンが見つかりません: ${starPerson}`)
    return getFortuneDataFromSymbol("○")
  }
  
  const symbol = pattern[(currentMonth - 1) % 12]
  return getFortuneDataFromSymbol(symbol)
}

/**
 * 年間運気表を生成
 */
export function generateYearlyFortuneTable(
  starPerson: StarPersonType,
  birthYear: number,
  targetYear?: number,
): YearlyFortuneData[] {
  const currentYear = targetYear || new Date().getFullYear()
  const results: YearlyFortuneData[] = []
  
  for (let year = currentYear - 5; year <= currentYear + 10; year++) {
    const age = year - birthYear
    
    const monthlyFortunes: FortuneData[] = []
    const pattern = starPersonPatterns[starPerson]
    
    if (!pattern) {
      console.warn(`⚠️ 運気パターンが見つかりません: ${starPerson}`)
      for (let month = 1; month <= 12; month++) {
        monthlyFortunes.push(getFortuneDataFromSymbol("○"))
      }
    } else {
      for (let month = 1; month <= 12; month++) {
        const symbol = pattern[(month - 1) % 12]
        monthlyFortunes.push(getFortuneDataFromSymbol(symbol))
      }
    }
    
    const averageLevel = monthlyFortunes.reduce((sum, f) => sum + f.level, 0) / 12
    const yearlySymbol = averageLevel >= 4 ? "◎" : averageLevel >= 3 ? "○" : averageLevel >= 2.5 ? "☆" : "▲"
    const yearlyFortune = getFortuneDataFromSymbol(yearlySymbol)
    
    results.push({
      year,
      age,
      fortune: yearlyFortune,
      monthlyFortunes,
    })
  }
  
  return results
}

/**
 * 運気記号に応じたCSSクラスを取得
 */
export function getSymbolClass(symbol: string): string {
  switch (symbol) {
    case "◎":
      return "text-red-600 font-bold"
    case "○":
      return "text-green-600"
    case "☆":
      return "text-purple-600"
    case "▲":
      return "text-orange-600"
    case "●":
      return "text-black font-bold dark:text-white"
    case "★":
      return "text-amber-600"
    default:
      return ""
  }
}

/**
 * 記号から運気タイプを取得（エクスポート用）
 */
export function getFortuneTypeFromSymbol(symbol: string): FortuneType {
  return symbolToFortuneType[symbol] || "吉"
}
