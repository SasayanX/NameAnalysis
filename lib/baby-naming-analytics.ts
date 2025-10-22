// 赤ちゃん名付け分析・統計ライブラリ
export interface NamingAnalytics {
  popularityTrend: "rising" | "stable" | "declining"
  ageGroupPreference: "young" | "middle" | "senior" | "all"
  regionalPopularity: "high" | "medium" | "low"
  seasonalTrend: "spring" | "summer" | "autumn" | "winter" | "none"
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  uniquenessLevel: "common" | "uncommon" | "rare" | "very_rare"
}

export function analyzeNameTrends(kanji: string, reading: string): NamingAnalytics {
  // 実際の実装では外部データベースやAPIを使用
  // ここでは簡単な分析ロジックを実装

  const analytics: NamingAnalytics = {
    popularityTrend: "stable",
    ageGroupPreference: "all",
    regionalPopularity: "medium",
    seasonalTrend: "none",
    difficultyLevel: "intermediate",
    uniquenessLevel: "uncommon",
  }

  // 人気トレンド分析
  const modernKanji = ["翔", "蓮", "陽", "葵", "紬", "凛"]
  if (modernKanji.some((k) => kanji.includes(k))) {
    analytics.popularityTrend = "rising"
    analytics.ageGroupPreference = "young"
  }

  // 伝統的な漢字
  const traditionalKanji = ["太郎", "花子", "一郎", "恵子"]
  if (traditionalKanji.some((k) => kanji.includes(k))) {
    analytics.popularityTrend = "declining"
    analytics.ageGroupPreference = "senior"
  }

  // 季節性分析
  const springKanji = ["桜", "春", "芽", "若"]
  const summerKanji = ["夏", "海", "陽", "葵"]
  const autumnKanji = ["秋", "楓", "実", "穂"]
  const winterKanji = ["冬", "雪", "凛", "白"]

  if (springKanji.some((k) => kanji.includes(k))) analytics.seasonalTrend = "spring"
  else if (summerKanji.some((k) => kanji.includes(k))) analytics.seasonalTrend = "summer"
  else if (autumnKanji.some((k) => kanji.includes(k))) analytics.seasonalTrend = "autumn"
  else if (winterKanji.some((k) => kanji.includes(k))) analytics.seasonalTrend = "winter"

  // 難易度分析
  if (kanji.length <= 2 && reading.length <= 4) {
    analytics.difficultyLevel = "beginner"
  } else if (kanji.length >= 3 || reading.length >= 6) {
    analytics.difficultyLevel = "advanced"
  }

  // ユニーク度分析
  const commonReadings = ["あい", "ゆう", "けん", "さき", "みお"]
  if (commonReadings.includes(reading)) {
    analytics.uniquenessLevel = "common"
  } else if (reading.length >= 5) {
    analytics.uniquenessLevel = "rare"
  }

  return analytics
}

export function generateTrendReport(candidates: any[]): {
  overallTrend: string
  recommendations: string[]
  insights: string[]
} {
  const trendCounts = {
    rising: 0,
    stable: 0,
    declining: 0,
  }

  const uniquenessCounts = {
    common: 0,
    uncommon: 0,
    rare: 0,
    very_rare: 0,
  }

  candidates.forEach((candidate) => {
    const analytics = analyzeNameTrends(candidate.kanji, candidate.reading)
    trendCounts[analytics.popularityTrend]++
    uniquenessCounts[analytics.uniquenessLevel]++
  })

  const overallTrend = Object.keys(trendCounts).reduce((a, b) =>
    trendCounts[a as keyof typeof trendCounts] > trendCounts[b as keyof typeof trendCounts] ? a : b,
  )

  const recommendations = []
  const insights = []

  if (trendCounts.rising > 0) {
    recommendations.push("現代的で人気上昇中の名前が含まれています")
    insights.push("これらの名前は同世代で人気が高い可能性があります")
  }

  if (uniquenessCounts.rare > 0 || uniquenessCounts.very_rare > 0) {
    recommendations.push("個性的で珍しい名前が含まれています")
    insights.push("ユニークな名前は印象に残りやすい反面、読み方を説明する機会が多いかもしれません")
  }

  return {
    overallTrend,
    recommendations,
    insights,
  }
}
