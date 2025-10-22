// 星人タイプの定義
export type StarPersonType =
  | "水星人+"
  | "水星人-"
  | "金星人+"
  | "金星人-"
  | "火星人+"
  | "火星人-"
  | "天王星人+"
  | "天王星人-"
  | "木星人+"
  | "木星人-"
  | "土星人+"
  | "土星人-"

// 運気の種類
export type FortuneType = "大吉" | "吉" | "中吉" | "凶" | "大凶" | "中凶"

// 運気データの型定義
export interface FortuneData {
  type: FortuneType
  symbol: string
  level: number // 1-5のレベル
  description: string
  color: string
  isGood: boolean
}

// 年間運気データの型定義
export interface YearlyFortuneData {
  year: number
  age: number
  fortune: FortuneData
  monthlyFortunes: FortuneData[]
}

// CSVデータの型定義
export interface SixStarCSVRow {
  year: number
  month: number
  day: number
  destinyNumber: number
  star: string
  type: string
  starNumber: number
  zodiac: string
}

// 六星占術の結果データ
export interface SixStarResult {
  starType: StarPersonType
  destinyNumber: number
  starNumber: number
  zodiac: string
  description: string
  characteristics: string[]
  luckyColors: string[]
  luckyNumbers: number[]
  source: "csv" | "calculation"
}
