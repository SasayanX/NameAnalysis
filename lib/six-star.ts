import type { StarPersonType } from "../types/six-star"
import {
  calculateStarPersonFromBirthdate,
  calculateStarPersonFromCSV,
  normalizeStarPersonType,
} from "./fortune-flow-calculator"

// 後方互換性のための型定義
export interface SixStarResult {
  star: string
  type: "+" | "-"
  starType: string
  fortune: {
    love: string
    work: string
    money: string
    health: string
  }
}

// メイン計算関数（同期版）
export function calculateStarPersonFromBirthdateSync(birthDate: Date): StarPersonType {
  return calculateStarPersonFromBirthdate(birthDate)
}

// 非同期版（CSVデータ使用）
export async function calculateStarPersonFromBirthdateAsync(birthDate: Date): Promise<{
  starType: StarPersonType
  confidence: number
  source: "csv" | "calculation"
}> {
  return await calculateStarPersonFromCSV(birthDate)
}

// 後方互換性のための関数（旧形式のSixStarResult型を返す）
export async function calculateSixStarFromCSV(birthdate: Date): Promise<SixStarResult> {
  try {
    const result = await calculateStarPersonFromCSV(birthdate)

    // StarPersonTypeから星と極性を分離
    const starType = result.starType
    const star = starType.replace(/人[+-]$/, "")
    const type = starType.includes("+") ? "+" : ("-" as "+" | "-")

    // 運勢メッセージを生成
    const fortuneMessages = {
      love: result.confidence > 0.8 ? "良好な時期です。積極的な行動が吉。" : "慎重な判断が必要な時期です。",
      work: result.confidence > 0.8 ? "新しいチャレンジに適した時期です。" : "基盤を固める時期に適しています。",
      money: result.confidence > 0.8 ? "堅実な投資や貯蓄を心がけましょう。" : "無駄遣いを控え、貯蓄に励みましょう。",
      health: result.confidence > 0.8 ? "規則正しい生活を心がけてください。" : "ストレス管理に注意してください。",
    }

    return {
      star,
      type,
      starType,
      fortune: fortuneMessages,
    }
  } catch (error) {
    console.error("calculateSixStarFromCSV エラー:", error)

    // フォールバック
    return {
      star: "水星",
      type: "+",
      starType: "水星人+",
      fortune: {
        love: "運勢に応じたアドバイスです。",
        work: "仕事運は安定しています。",
        money: "金運は普通です。",
        health: "健康に注意してください。",
      },
    }
  }
}

// 基本的な六星占術計算（同期版、後方互換性のため）
export function calculateSixStar(birthdate: Date): SixStarResult {
  try {
    const starType = calculateStarPersonFromBirthdate(birthdate)
    const star = starType.replace(/人[+-]$/, "")
    const type = starType.includes("+") ? "+" : ("-" as "+" | "-")

    return {
      star,
      type,
      starType,
      fortune: {
        love: "運勢に応じたアドバイスです。",
        work: "仕事運は安定しています。",
        money: "金運は普通です。",
        health: "健康に注意してください。",
      },
    }
  } catch (error) {
    console.error("calculateSixStar エラー:", error)
    return {
      star: "水星",
      type: "+",
      starType: "水星人+",
      fortune: {
        love: "運勢に応じたアドバイスです。",
        work: "仕事運は安定しています。",
        money: "金運は普通です。",
        health: "健康に注意してください。",
      },
    }
  }
}

// 星人タイプの正規化（再エクスポート）
export { normalizeStarPersonType }

// 年から干支を取得
export function getZodiacFromYear(year: number): string {
  const zodiacSigns = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
  const baseYear = 1924 // 甲子の年
  const yearDiff = year - baseYear
  const zodiacIndex = yearDiff % 12
  const adjustedIndex = zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex
  return zodiacSigns[adjustedIndex]
}

// 星人タイプから五行要素を取得
export function getElementFromStarPerson(starPerson: StarPersonType): string {
  const elementMap: Record<string, string> = {
    "水星人+": "水",
    "水星人-": "水",
    "木星人+": "木",
    "木星人-": "木",
    "火星人+": "火",
    "火星人-": "火",
    "土星人+": "土",
    "土星人-": "土",
    "金星人+": "金",
    "金星人-": "金",
  }

  return elementMap[starPerson] || "水"
}

// 星人タイプの詳細情報を取得
export function getStarPersonDetails(starPerson: StarPersonType): {
  element: string
  polarity: "+" | "-"
  characteristics: string[]
  compatibility: string[]
} {
  const element = getElementFromStarPerson(starPerson)
  const polarity = starPerson.includes("+") ? "+" : "-"

  const characteristicsMap: Record<StarPersonType, string[]> = {
    "水星人+": ["直感力が鋭い", "コミュニケーション能力が高い", "変化を好む"],
    "水星人-": ["慎重で思慮深い", "分析力に優れる", "安定を求める"],
    "金星人+": ["美的センスがある", "社交的", "調和を重視する"],
    "金星人-": ["芸術的才能", "感受性が豊か", "完璧主義"],
    "火星人+": ["行動力がある", "リーダーシップを発揮", "チャレンジ精神旺盛"],
    "火星人-": ["情熱的", "集中力が高い", "目標達成能力"],
    "木星人+": ["寛容で包容力がある", "成長志向", "教育者気質"],
    "木星人-": ["知識欲旺盛", "哲学的思考", "精神的な深さ"],
    "土星人+": ["責任感が強い", "忍耐力がある", "現実的"],
    "土星人-": ["堅実", "伝統を重んじる", "長期的視野"],
  }

  const compatibilityMap: Record<StarPersonType, string[]> = {
    "水星人+": ["金星人+", "木星人-"],
    "水星人-": ["金星人-", "木星人+"],
    "金星人+": ["水星人+", "土星人-"],
    "金星人-": ["水星人-", "土星人+"],
    "火星人+": ["木星人+", "土星人-"],
    "火星人-": ["木星人-", "土星人+"],
    "木星人+": ["火星人+", "水星人-"],
    "木星人-": ["火星人-", "水星人+"],
    "土星人+": ["金星人-", "火星人-"],
    "土星人-": ["金星人+", "火星人+"],
  }

  return {
    element,
    polarity,
    characteristics: characteristicsMap[starPerson] || ["バランスの取れた性格"],
    compatibility: compatibilityMap[starPerson] || [],
  }
}
