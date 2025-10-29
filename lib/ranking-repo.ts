import { getSupabaseClient } from "@/lib/supabase-client"
import { spendPointsSupa, getSeasonalItemBonus } from "@/lib/kanau-points-supabase"

export type RankingEntry = {
  id: string
  user_id: string
  season: string
  name: string
  power_score: number
  seasonal_bonus: number
  item_bonus: number
  total_score: number
  rank: number | null
  reward_points: number
  created_at: string
}

export function getCurrentSeasonKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  if (m === 12 || m === 1 || m === 2) return `${y}_winter`
  if (m >= 3 && m <= 5) return `${y}_spring`
  if (m >= 6 && m <= 8) return `${y}_summer`
  return `${y}_autumn`
}

export async function fetchSeasonRanking(seasonKey: string, limit = 100): Promise<RankingEntry[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return []
  }
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("id, user_id, season, name, power_score, seasonal_bonus, item_bonus, total_score, rank, reward_points, created_at")
    .eq("season", seasonKey)
    .order("total_score", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []) as RankingEntry[]
}

const SEASON_KANJI: Record<"spring" | "summer" | "autumn" | "winter", string[]> = {
  spring: ["春", "桜", "花", "芽", "彩"],
  summer: ["夏", "海", "陽", "光", "涼"],
  autumn: ["秋", "紅", "実", "穂", "楓"],
  winter: ["冬", "雪", "氷", "聖", "星"],
}

function getSeasonNameKey(date = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const m = date.getMonth() + 1
  if (m === 12 || m === 1 || m === 2) return "winter"
  if (m >= 3 && m <= 5) return "spring"
  if (m >= 6 && m <= 8) return "summer"
  return "autumn"
}

export function computeSeasonalBonusFromName(name: string, date = new Date()): number {
  const seasonKey = getSeasonNameKey(date)
  const list = SEASON_KANJI[seasonKey]
  return list.some((k) => name.includes(k)) ? 10 : 0
}

export async function submitRankingEntry(userId: string, name: string, powerScore: number) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }
  // 参加費5Kpを消費
  await spendPointsSupa(userId, 5, "ランキング参加", "ranking_entry")

  const seasonKey = getCurrentSeasonKey()
  const seasonalBonus = computeSeasonalBonusFromName(name)
  const itemBonus = await getSeasonalItemBonus(userId)
  const totalScore = Math.round(powerScore * (1 + (seasonalBonus + itemBonus) / 100))

  const { data, error } = await supabase
    .from("ranking_entries")
    .insert({
      user_id: userId,
      season: seasonKey,
      name,
      power_score: powerScore,
      seasonal_bonus: seasonalBonus,
      item_bonus: itemBonus,
      total_score: totalScore,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

/**
 * 姓名判断結果から自動でランキング登録（将来的に使用）
 * @param userId ユーザーID
 * @param lastName 姓
 * @param firstName 名
 * @param gender 性別
 */
export async function submitRankingEntryFromNameAnalysis(
  userId: string,
  lastName: string,
  firstName: string,
  gender: "male" | "female" = "male",
) {
  // 姓名判断結果からパワースコアを計算
  const { calculateNameRankingPoints } = await import("@/lib/name-ranking")
  const { customFortuneData } = await import("@/lib/fortune-data-custom")
  
  const nameAnalysis = calculateNameRankingPoints(
    lastName,
    firstName,
    customFortuneData,
    gender,
  )
  
  const fullName = `${lastName}${firstName}`
  const powerScore = nameAnalysis.totalPoints
  
  // ランキングに登録
  return await submitRankingEntry(userId, fullName, powerScore)
}


