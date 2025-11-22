import { getSupabaseClient } from "@/lib/supabase-client"
import { spendPointsSupa, getSeasonalItemBonus } from "@/lib/kanau-points-supabase"

export type RankingEntry = {
  id: string
  user_id: string
  season: string
  name: string // 後方互換性のため残す（既存データ用）
  real_name?: string | null // ユーザーの本名（非公開）
  display_name_type?: "MASKED" | "NICKNAME" | null // 表示名の種類
  ranking_display_name?: string | null // ランキングに表示される名前（公開用）
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
    .select("id, user_id, season, name, real_name, display_name_type, ranking_display_name, power_score, seasonal_bonus, item_bonus, total_score, rank, reward_points, created_at")
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

export async function submitRankingEntry(
  userId: string,
  name: string,
  powerScore: number,
  options?: {
    displayNameType?: "MASKED" | "NICKNAME"
    rankingDisplayName?: string
  }
) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }
  // 参加費5Kpを消費
  await spendPointsSupa(userId, 5, "ランキング参加", "ranking_entry")

  const seasonKey = getCurrentSeasonKey()
  const seasonalBonus = computeSeasonalBonusFromName(name)
  const itemBonus = await getSeasonalItemBonus(userId)
  
  // データベースのint型に合わせて、すべての値を整数に丸める
  const roundedPowerScore = Math.round(powerScore)
  const roundedSeasonalBonus = Math.round(seasonalBonus)
  const roundedItemBonus = Math.round(itemBonus)
  const totalScore = Math.round(roundedPowerScore * (1 + (roundedSeasonalBonus + roundedItemBonus) / 100))

  // 後方互換性のため、optionsが指定されていない場合は既存の動作を維持
  const displayNameType = options?.displayNameType || "MASKED"
  const rankingDisplayName = options?.rankingDisplayName || (displayNameType === "MASKED" ? maskRealName(name) : name)

  const { data, error } = await supabase
    .from("ranking_entries")
    .insert({
      user_id: userId,
      season: seasonKey,
      name, // 後方互換性のため残す
      real_name: name, // 本名を保存
      display_name_type: displayNameType,
      ranking_display_name: rankingDisplayName,
      power_score: roundedPowerScore,
      seasonal_bonus: roundedSeasonalBonus,
      item_bonus: roundedItemBonus,
      total_score: totalScore,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

/**
 * 姓名判断結果から自動でランキング登録
 * @param userId ユーザーID
 * @param lastName 姓
 * @param firstName 名
 * @param gender 性別
 * @param options プライバシー設定オプション
 */
export async function submitRankingEntryFromNameAnalysis(
  userId: string,
  lastName: string,
  firstName: string,
  gender: "male" | "female" = "male",
  options?: {
    displayNameType: "MASKED" | "NICKNAME"
    nickname?: string
  }
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
  
  // ランキング表示名を決定
  let rankingDisplayName: string
  if (options?.displayNameType === "NICKNAME" && options.nickname) {
    rankingDisplayName = options.nickname.trim()
  } else {
    // MASKED の場合は姓の頭文字のみ残してマスキング
    rankingDisplayName = maskFullName(lastName, firstName)
  }
  
  // ランキングに登録
  return await submitRankingEntry(userId, fullName, powerScore, {
    displayNameType: options?.displayNameType || "MASKED",
    rankingDisplayName,
  })
}

/**
 * 名前をマスキングする関数
 * 姓の頭文字のみ残し、残りの文字すべてを★で置き換える
 * @param fullName フルネーム（例: "佐々木康隆"）
 * @returns マスキング済みの名前（例: "佐★★★★"）
 */
export function maskRealName(fullName: string): string {
  if (!fullName || fullName.length === 0) {
    return fullName
  }
  
  // 姓と名を分割（スペースや全角スペースで分割）
  const parts = fullName.split(/[\s　]+/)
  if (parts.length === 0) {
    return fullName
  }
  
  // 姓（最初の部分）の頭文字を取得
  const lastName = parts[0]
  if (lastName.length === 0) {
    return fullName
  }
  
  // 姓の頭文字のみ残し、残りを★で置き換え
  const maskedLastName = lastName[0] + '★'.repeat(Math.max(0, fullName.length - 1))
  
  // 名がある場合は、名もすべて★で置き換え
  // 例: "佐々木 康隆" → "佐★★★★★"
  return maskedLastName.substring(0, fullName.length)
}

/**
 * 姓の頭文字のみを残してマスキングする（より正確な実装）
 * @param lastName 姓
 * @param firstName 名
 * @returns マスキング済みの名前（例: "佐★★★★"）
 */
export function maskFullName(lastName: string, firstName: string): string {
  const fullName = `${lastName}${firstName}`
  if (!fullName || fullName.length === 0) {
    return fullName
  }
  
  // 姓の頭文字のみ残し、残りの文字数を★で埋める
  if (lastName.length === 0) {
    return '★'.repeat(fullName.length)
  }
  
  const maskedLastName = lastName[0] + '★'.repeat(lastName.length - 1)
  const maskedFirstName = '★'.repeat(firstName.length)
  
  return maskedLastName + maskedFirstName
}


