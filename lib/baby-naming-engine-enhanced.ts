// 赤ちゃん名付けエンジン - 品質向上版
import { analyzeNameFortune } from "./name-data-simple"
import { customFortuneData } from "./fortune-data-custom"
import { calculateNameRankingPoints } from "./name-ranking"

export interface NamingRequest {
  lastName: string
  gender: "male" | "female"
  preferences?: {
    strictMode?: boolean
    avoidKyousu?: boolean
    minScore?: number
    allowSemiRecommended?: boolean
    flexibleMode?: boolean
    preferredReadings?: string[] // 好みの読み方
    avoidReadings?: string[] // 避けたい読み方
    preferredMeanings?: string[] // 好みの意味
    seasonalPreference?: "spring" | "summer" | "autumn" | "winter" | "none" // 季節の好み
  }
}

export interface BabyNameCandidate {
  kanji: string
  reading: string
  meaning: string
  totalScore: number
  powerLevel: number
  powerRank: string
  hasNoKyousu: boolean
  isGoodFortune: boolean
  fortuneAnalysis: {
    ten: number
    jin: number
    chi: number
    gai: number
    total: number
  }
  fortuneDetails: {
    tenFormat: number
    jinFormat: number
    chiFormat: number
    gaiFormat: number
    totalFormat: number
    tenFortune: string
    jinFortune: string
    chiFortune: string
    gaiFortune: string
    totalFortune: string
  }
  characteristics: string[]
  warnings?: string[]
  searchMode?: string
  // 品質向上のための新しいプロパティ
  qualityScore: number // 品質スコア（0-100）
  uniquenessScore: number // ユニーク度（0-100）
  pronunciationDifficulty: "easy" | "medium" | "hard" // 読みやすさ
  writingDifficulty: "easy" | "medium" | "hard" // 書きやすさ
  modernityScore: number // 現代性スコア（0-100）
  traditionalScore: number // 伝統性スコア（0-100）
  seasonalMatch?: string // 季節との適合性
  soundHarmony: number // 音の調和（0-100）
  detailedAnalysis: {
    strengths: string[] // 強み
    considerations: string[] // 考慮点
    recommendations: string[] // 推奨事項
  }
}

// 🔥 男性名前候補（品質向上版）
const ENHANCED_MALE_NAMES = [
  // 2021-2025年人気ランキング上位（詳細情報付き）
  {
    kanji: "碧",
    reading: "あお",
    meaning: "美しい青緑色",
    season: "summer",
    difficulty: "medium" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 75,
  },
  {
    kanji: "蓮",
    reading: "れん",
    meaning: "蓮の花のように清らか",
    season: "summer",
    difficulty: "easy" as const,
    modernity: 90,
    tradition: 70,
    uniqueness: 80,
  },
  {
    kanji: "陽翔",
    reading: "はると",
    meaning: "太陽のように翔ける",
    season: "spring",
    difficulty: "medium" as const,
    modernity: 95,
    tradition: 50,
    uniqueness: 85,
  },
  {
    kanji: "湊",
    reading: "みなと",
    meaning: "人が集まる港",
    season: "none",
    difficulty: "easy" as const,
    modernity: 90,
    tradition: 60,
    uniqueness: 70,
  },
  {
    kanji: "蒼",
    reading: "あおい",
    meaning: "蒼い空のように広い",
    season: "summer",
    difficulty: "medium" as const,
    modernity: 85,
    tradition: 65,
    uniqueness: 75,
  },
  {
    kanji: "樹",
    reading: "いつき",
    meaning: "大樹のように成長",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 80,
    tradition: 75,
    uniqueness: 65,
  },
  {
    kanji: "大翔",
    reading: "ひろと",
    meaning: "大きく翔ける",
    season: "none",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 70,
  },
  {
    kanji: "悠真",
    reading: "ゆうま",
    meaning: "ゆったりと真っ直ぐ",
    season: "none",
    difficulty: "easy" as const,
    modernity: 80,
    tradition: 70,
    uniqueness: 65,
  },
  {
    kanji: "結翔",
    reading: "ゆいと",
    meaning: "結ばれて翔ける",
    season: "none",
    difficulty: "medium" as const,
    modernity: 85,
    tradition: 55,
    uniqueness: 75,
  },
  {
    kanji: "律",
    reading: "りつ",
    meaning: "規律正しい",
    season: "none",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 85,
    uniqueness: 60,
  },
  // 伝統的な名前（品質向上版）
  {
    kanji: "太郎",
    reading: "たろう",
    meaning: "長男",
    season: "none",
    difficulty: "easy" as const,
    modernity: 30,
    tradition: 100,
    uniqueness: 40,
  },
  {
    kanji: "一郎",
    reading: "いちろう",
    meaning: "第一の男子",
    season: "none",
    difficulty: "easy" as const,
    modernity: 35,
    tradition: 95,
    uniqueness: 45,
  },
  // 自然系の名前（品質向上版）
  {
    kanji: "海斗",
    reading: "かいと",
    meaning: "海のように広い心",
    season: "summer",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 70,
  },
  {
    kanji: "大地",
    reading: "だいち",
    meaning: "大きな大地",
    season: "none",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 80,
    uniqueness: 60,
  },
  {
    kanji: "春太",
    reading: "はるた",
    meaning: "春のように暖かい",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 70,
    tradition: 75,
    uniqueness: 55,
  },
  {
    kanji: "夏樹",
    reading: "なつき",
    meaning: "夏の木",
    season: "summer",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 70,
    uniqueness: 60,
  },
  {
    kanji: "秋人",
    reading: "あきと",
    meaning: "秋のように実り豊か",
    season: "autumn",
    difficulty: "easy" as const,
    modernity: 70,
    tradition: 75,
    uniqueness: 55,
  },
  {
    kanji: "冬馬",
    reading: "とうま",
    meaning: "冬のように清らか",
    season: "winter",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 65,
    uniqueness: 60,
  },
  // 現代的な名前（品質向上版）
  {
    kanji: "奏",
    reading: "かなで",
    meaning: "音楽を奏でる",
    season: "none",
    difficulty: "medium" as const,
    modernity: 90,
    tradition: 50,
    uniqueness: 80,
  },
  {
    kanji: "廉",
    reading: "れん",
    meaning: "清廉な",
    season: "none",
    difficulty: "medium" as const,
    modernity: 80,
    tradition: 70,
    uniqueness: 70,
  },
  {
    kanji: "凛",
    reading: "りん",
    meaning: "凛々しい",
    season: "winter",
    difficulty: "medium" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 75,
  },
]

// 🔥 女性名前候補（品質向上版）
const ENHANCED_FEMALE_NAMES = [
  // 2021-2025年人気ランキング上位（詳細情報付き）
  {
    kanji: "紬",
    reading: "つむぎ",
    meaning: "紬のように美しい",
    season: "none",
    difficulty: "medium" as const,
    modernity: 85,
    tradition: 80,
    uniqueness: 85,
  },
  {
    kanji: "翠",
    reading: "すい",
    meaning: "翠のように美しい緑",
    season: "spring",
    difficulty: "medium" as const,
    modernity: 80,
    tradition: 75,
    uniqueness: 80,
  },
  {
    kanji: "凛",
    reading: "りん",
    meaning: "凛々しい",
    season: "winter",
    difficulty: "medium" as const,
    modernity: 90,
    tradition: 65,
    uniqueness: 85,
  },
  {
    kanji: "陽葵",
    reading: "ひまり",
    meaning: "太陽のような葵",
    season: "summer",
    difficulty: "medium" as const,
    modernity: 95,
    tradition: 55,
    uniqueness: 90,
  },
  {
    kanji: "芽依",
    reading: "めい",
    meaning: "芽のように成長",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 75,
  },
  {
    kanji: "葵",
    reading: "あおい",
    meaning: "葵の花",
    season: "summer",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 70,
    uniqueness: 70,
  },
  {
    kanji: "心陽",
    reading: "こはる",
    meaning: "心の太陽",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 90,
    tradition: 50,
    uniqueness: 80,
  },
  {
    kanji: "陽菜",
    reading: "ひな",
    meaning: "太陽の菜",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 60,
    uniqueness: 70,
  },
  {
    kanji: "美咲",
    reading: "みさき",
    meaning: "美しく咲く",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 80,
    tradition: 75,
    uniqueness: 65,
  },
  {
    kanji: "桜",
    reading: "さくら",
    meaning: "桜の花",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 90,
    uniqueness: 60,
  },
  // 伝統的な名前（品質向上版）
  {
    kanji: "愛子",
    reading: "あいこ",
    meaning: "愛される子",
    season: "none",
    difficulty: "easy" as const,
    modernity: 60,
    tradition: 95,
    uniqueness: 50,
  },
  {
    kanji: "恵子",
    reading: "けいこ",
    meaning: "恵まれた子",
    season: "none",
    difficulty: "easy" as const,
    modernity: 55,
    tradition: 90,
    uniqueness: 45,
  },
  // 花・植物系（品質向上版）
  {
    kanji: "梅",
    reading: "うめ",
    meaning: "梅の花",
    season: "winter",
    difficulty: "easy" as const,
    modernity: 60,
    tradition: 95,
    uniqueness: 70,
  },
  {
    kanji: "菊",
    reading: "きく",
    meaning: "菊の花",
    season: "autumn",
    difficulty: "easy" as const,
    modernity: 50,
    tradition: 90,
    uniqueness: 65,
  },
  {
    kanji: "蘭",
    reading: "らん",
    meaning: "蘭の花",
    season: "none",
    difficulty: "easy" as const,
    modernity: 70,
    tradition: 85,
    uniqueness: 75,
  },
  {
    kanji: "椿",
    reading: "つばき",
    meaning: "椿の花",
    season: "winter",
    difficulty: "medium" as const,
    modernity: 75,
    tradition: 85,
    uniqueness: 80,
  },
  // 現代的な名前（品質向上版）
  {
    kanji: "愛花",
    reading: "あいか",
    meaning: "愛の花",
    season: "spring",
    difficulty: "easy" as const,
    modernity: 85,
    tradition: 70,
    uniqueness: 70,
  },
  {
    kanji: "音羽",
    reading: "おとは",
    meaning: "音の羽",
    season: "none",
    difficulty: "easy" as const,
    modernity: 90,
    tradition: 55,
    uniqueness: 85,
  },
  {
    kanji: "希子",
    reading: "きこ",
    meaning: "希望の子",
    season: "none",
    difficulty: "easy" as const,
    modernity: 75,
    tradition: 80,
    uniqueness: 65,
  },
  {
    kanji: "未来",
    reading: "みらい",
    meaning: "未来",
    season: "none",
    difficulty: "easy" as const,
    modernity: 95,
    tradition: 40,
    uniqueness: 80,
  },
]

// 品質向上版の名前生成関数
export function generateEnhancedOptimalNames(request: NamingRequest, maxResults = 3): BabyNameCandidate[] {
  const candidates: BabyNameCandidate[] = []
  const namePool = request.gender === "male" ? ENHANCED_MALE_NAMES : ENHANCED_FEMALE_NAMES

  console.log(`\n🎯 品質向上版名前生成開始`)
  console.log(`   姓: ${request.lastName}`)
  console.log(`   性別: ${request.gender}`)
  console.log(`   候補数: ${namePool.length}個`)

  // フィルタリング処理
  let filteredPool = namePool

  // 季節の好みでフィルタリング
  if (request.preferences?.seasonalPreference && request.preferences.seasonalPreference !== "none") {
    filteredPool = filteredPool.filter(
      (name) => name.season === request.preferences?.seasonalPreference || name.season === "none",
    )
  }

  // 好みの読み方でフィルタリング
  if (request.preferences?.preferredReadings && request.preferences.preferredReadings.length > 0) {
    filteredPool = filteredPool.filter((name) =>
      request.preferences?.preferredReadings?.some(
        (reading) => name.reading.includes(reading) || reading.includes(name.reading),
      ),
    )
  }

  // 避けたい読み方でフィルタリング
  if (request.preferences?.avoidReadings && request.preferences.avoidReadings.length > 0) {
    filteredPool = filteredPool.filter(
      (name) =>
        !request.preferences?.avoidReadings?.some(
          (reading) => name.reading.includes(reading) || reading.includes(name.reading),
        ),
    )
  }

  // 配列をシャッフル
  const shuffledNamePool = shuffleArray(filteredPool)

  for (const nameData of shuffledNamePool) {
    try {
      const analysis = analyzeNameFortune(request.lastName, nameData.kanji, request.gender, customFortuneData)
      if (!analysis) continue

      // 品質スコアを計算
      const qualityScore = calculateQualityScore(nameData, analysis, request)

      if (analysis.totalScore >= 50 && qualityScore >= 60) {
        // 名前ランキングポイントを計算
        const rankingResult = calculateNameRankingPoints(
          request.lastName,
          nameData.kanji,
          customFortuneData,
          request.gender,
        )

        // 音の調和を計算
        const soundHarmony = calculateSoundHarmony(request.lastName, nameData.reading)

        // 詳細分析を生成
        const detailedAnalysis = generateDetailedAnalysis(nameData, analysis, rankingResult)

        const candidate: BabyNameCandidate = {
          kanji: nameData.kanji,
          reading: nameData.reading,
          meaning: nameData.meaning,
          totalScore: analysis.totalScore,
          powerLevel: rankingResult.powerLevel,
          powerRank: rankingResult.powerRank,
          hasNoKyousu: !hasKyousu(analysis),
          isGoodFortune: analysis.totalScore >= 65,
          searchMode: "品質向上版",
          qualityScore,
          uniquenessScore: nameData.uniqueness,
          pronunciationDifficulty: nameData.difficulty,
          writingDifficulty: nameData.difficulty,
          modernityScore: nameData.modernity,
          traditionalScore: nameData.tradition,
          seasonalMatch: nameData.season !== "none" ? nameData.season : undefined,
          soundHarmony,
          detailedAnalysis,
          fortuneAnalysis: {
            ten: analysis.categories?.find((c: any) => c.name === "天格")?.score || 0,
            jin: analysis.categories?.find((c: any) => c.name === "人格")?.score || 0,
            chi: analysis.categories?.find((c: any) => c.name === "地格")?.score || 0,
            gai: analysis.categories?.find((c: any) => c.name === "外格")?.score || 0,
            total: analysis.categories?.find((c: any) => c.name === "総格")?.score || 0,
          },
          fortuneDetails: {
            tenFormat: analysis.tenFormat || 0,
            jinFormat: analysis.jinFormat || 0,
            chiFormat: analysis.chiFormat || 0,
            gaiFormat: analysis.gaiFormat || 0,
            totalFormat: analysis.totalFormat || 0,
            tenFortune: analysis.categories?.find((c: any) => c.name === "天格")?.fortune || "",
            jinFortune: analysis.categories?.find((c: any) => c.name === "人格")?.fortune || "",
            chiFortune: analysis.categories?.find((c: any) => c.name === "地格")?.fortune || "",
            gaiFortune: analysis.categories?.find((c: any) => c.name === "外格")?.fortune || "",
            totalFortune: analysis.categories?.find((c: any) => c.name === "総格")?.fortune || "",
          },
          characteristics: generateEnhancedCharacteristics(analysis, nameData),
        }

        candidates.push(candidate)
      }

      if (candidates.length >= maxResults * 3) break
    } catch (error) {
      console.error(`名前分析エラー: ${nameData.kanji}`, error)
      continue
    }
  }

  // 品質スコア順でソート
  candidates.sort((a, b) => {
    const qualityDiff = b.qualityScore - a.qualityScore
    if (qualityDiff !== 0) return qualityDiff
    return b.totalScore - a.totalScore
  })

  const uniqueCandidates = candidates.filter(
    (candidate, index, self) => index === self.findIndex((c) => c.kanji === candidate.kanji),
  )

  console.log(`\n📋 品質向上版最終候補: ${uniqueCandidates.length}個`)
  uniqueCandidates.slice(0, 5).forEach((c, i) => {
    console.log(`${i + 1}. ${c.kanji}（${c.reading}）- 総合${c.totalScore}点 品質${c.qualityScore}点`)
  })

  return uniqueCandidates.slice(0, maxResults)
}

// 品質スコア計算関数
function calculateQualityScore(nameData: any, analysis: any, request: NamingRequest): number {
  let score = 50 // 基本点

  // 姓名判断スコアの影響（30%）
  score += (analysis.totalScore - 50) * 0.3

  // 現代性・伝統性のバランス（20%）
  const balanceScore = 100 - Math.abs(nameData.modernity - nameData.tradition)
  score += balanceScore * 0.2

  // ユニーク度（15%）
  score += nameData.uniqueness * 0.15

  // 読みやすさ（15%）
  const difficultyScore = nameData.difficulty === "easy" ? 100 : nameData.difficulty === "medium" ? 70 : 40
  score += difficultyScore * 0.15

  // 季節マッチング（10%）
  if (request.preferences?.seasonalPreference && request.preferences.seasonalPreference !== "none") {
    if (nameData.season === request.preferences.seasonalPreference) {
      score += 10
    }
  }

  // 凶数なしボーナス（10%）
  if (!hasKyousu(analysis)) {
    score += 10
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

// 音の調和計算関数
function calculateSoundHarmony(lastName: string, reading: string): number {
  // 簡単な音の調和計算（実際にはより複雑な音韻学的分析が必要）
  let harmony = 70 // 基本点

  // 母音の連続チェック
  const fullName = lastName + reading
  const vowels = fullName.match(/[aiueo]/gi) || []
  const vowelRatio = vowels.length / fullName.length

  if (vowelRatio >= 0.3 && vowelRatio <= 0.6) {
    harmony += 15 // 適度な母音比率
  }

  // 音の長さバランス
  if (reading.length >= 2 && reading.length <= 4) {
    harmony += 15 // 適度な長さ
  }

  return Math.min(100, harmony)
}

// 凶数チェック関数
function hasKyousu(analysis: any): boolean {
  if (!analysis.categories) return false

  return analysis.categories.some((category: any) => {
    const fortune = category.fortune || ""
    return fortune.includes("凶") || fortune.includes("大凶")
  })
}

// 詳細分析生成関数
function generateDetailedAnalysis(
  nameData: any,
  analysis: any,
  rankingResult: any,
): {
  strengths: string[]
  considerations: string[]
  recommendations: string[]
} {
  const strengths = []
  const considerations = []
  const recommendations = []

  // 強みの分析
  if (analysis.totalScore >= 80) {
    strengths.push("非常に優れた姓名判断結果")
  }
  if (nameData.modernity >= 80) {
    strengths.push("現代的で親しみやすい響き")
  }
  if (nameData.tradition >= 80) {
    strengths.push("伝統的で格調高い印象")
  }
  if (nameData.uniqueness >= 80) {
    strengths.push("個性的で印象に残りやすい")
  }
  if (nameData.difficulty === "easy") {
    strengths.push("読みやすく書きやすい")
  }

  // 考慮点の分析
  if (nameData.difficulty === "hard") {
    considerations.push("読み方や書き方が少し難しい場合があります")
  }
  if (nameData.uniqueness >= 90) {
    considerations.push("非常に個性的なため、周囲の反応を考慮してください")
  }
  if (analysis.totalScore < 70) {
    considerations.push("姓名判断の結果が平均的です")
  }

  // 推奨事項
  recommendations.push("家族でよく話し合って決めることをおすすめします")
  if (nameData.season !== "none") {
    recommendations.push(`${nameData.season}生まれのお子様に特に適しています`)
  }
  recommendations.push("実際に声に出して呼んでみて響きを確認してください")

  return { strengths, considerations, recommendations }
}

// 強化された特徴生成関数
function generateEnhancedCharacteristics(analysis: any, nameData: any): string[] {
  const characteristics = []

  // 姓名判断ベースの特徴
  if (analysis.totalScore >= 90) {
    characteristics.push("非常に優秀", "指導力がある", "成功運が強い")
  } else if (analysis.totalScore >= 80) {
    characteristics.push("優秀", "協調性がある", "安定した運勢")
  } else if (analysis.totalScore >= 70) {
    characteristics.push("良好", "努力家", "堅実な運勢")
  }

  // 名前の特性ベースの特徴
  if (nameData.modernity >= 80) {
    characteristics.push("現代的", "親しみやすい")
  }
  if (nameData.tradition >= 80) {
    characteristics.push("伝統的", "格調高い")
  }
  if (nameData.uniqueness >= 80) {
    characteristics.push("個性的", "印象的")
  }

  // 季節ベースの特徴
  if (nameData.season === "spring") {
    characteristics.push("明るい", "成長力がある")
  } else if (nameData.season === "summer") {
    characteristics.push("活発", "エネルギッシュ")
  } else if (nameData.season === "autumn") {
    characteristics.push("実り豊か", "安定感がある")
  } else if (nameData.season === "winter") {
    characteristics.push("清らか", "意志が強い")
  }

  return characteristics.slice(0, 6) // 最大6個まで
}

// 配列シャッフル関数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 名前数取得関数
export function getEnhancedNameCount(): { male: number; female: number; total: number } {
  return {
    male: ENHANCED_MALE_NAMES.length,
    female: ENHANCED_FEMALE_NAMES.length,
    total: ENHANCED_MALE_NAMES.length + ENHANCED_FEMALE_NAMES.length,
  }
}
