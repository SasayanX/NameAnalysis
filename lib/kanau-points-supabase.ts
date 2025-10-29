import { getSupabaseClient } from "@/lib/supabase-client"

export type SupaPointsSummary = {
  user_id: string
  points: number
  total_earned: number
  total_spent: number
  consecutive_login_days: number
  last_login_date: string | null
  last_login_bonus_date: string | null
}

export async function getOrCreatePointsSummary(userId: string): Promise<SupaPointsSummary> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("kanau_points")
    .select("user_id, points, total_earned, total_spent, consecutive_login_days, last_login_date, last_login_bonus_date")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error

  if (data) return data as SupaPointsSummary

  const insertPayload = {
    user_id: userId,
    points: 0,
    total_earned: 0,
    total_spent: 0,
    consecutive_login_days: 0,
    last_login_date: null,
    last_login_bonus_date: null,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("kanau_points")
    .insert(insertPayload)
    .select("user_id, points, total_earned, total_spent, consecutive_login_days, last_login_date, last_login_bonus_date")
    .single()

  if (insertErr) throw insertErr
  return inserted as SupaPointsSummary
}

export async function addTransaction(
  userId: string,
  type: "earn" | "spend",
  amount: number,
  reason: string,
  category: "login_bonus" | "ranking_reward" | "ranking_entry" | "special_reward" | "purchase",
  metadata?: Record<string, any>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("point_transactions").insert({
    user_id: userId,
    type,
    amount,
    reason,
    category,
    metadata,
  })
  if (error) throw error
}

export async function addPointsSupa(
  userId: string,
  amount: number,
  reason: string = "デバッグ付与",
  category: "special_reward" | "purchase" = "special_reward",
) {
  const supabase = getSupabaseClient()
  const summary = await getOrCreatePointsSummary(userId)

  const { error: upErr } = await supabase
    .from("kanau_points")
    .update({
      points: (summary.points || 0) + amount,
      total_earned: (summary.total_earned || 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (upErr) throw upErr

  await addTransaction(userId, "earn", amount, reason, category)
}

export async function spendPointsSupa(
  userId: string,
  amount: number,
  reason: string,
  category: "ranking_entry" | "purchase",
) {
  const supabase = getSupabaseClient()
  const summary = await getOrCreatePointsSummary(userId)
  if ((summary.points || 0) < amount) {
    throw new Error("ポイントが不足しています")
  }

  const { error: upErr } = await supabase
    .from("kanau_points")
    .update({
      points: (summary.points || 0) - amount,
      total_spent: (summary.total_spent || 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (upErr) throw upErr

  await addTransaction(userId, "spend", amount, reason, category)
}

export async function getSeasonalItemBonus(userId: string): Promise<number> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("special_items")
    .select("effect_value, effect_type, is_used")
    .eq("user_id", userId)
    .eq("is_used", false)
    .eq("effect_type", "seasonal_bonus")

  if (error) throw error
  const sum = (data || []).reduce((acc, r: any) => acc + (r.effect_value || 0), 0)
  return Math.min(sum, 50)
}

export async function processLoginBonusSupa(userId: string) {
  const supabase = getSupabaseClient()
  const summary = await getOrCreatePointsSummary(userId)

  const today = new Date().toISOString().split("T")[0]
  const lastLoginDate = summary.last_login_date || ""

  if (lastLoginDate === today) {
    return {
      user: summary,
      bonus: { basePoints: 0, consecutiveBonus: 0, totalPoints: 0, message: "本日は既にログインボーナスを受け取り済みです" },
    }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  let consecutiveDays = summary.consecutive_login_days || 0
  if (lastLoginDate === yesterdayStr) consecutiveDays += 1
  else consecutiveDays = 1

  const basePoints = 1
  const consecutiveBonus = Math.min(consecutiveDays - 1, 100)
  const totalPoints = basePoints + consecutiveBonus

  const { data: updated, error: upErr } = await supabase
    .from("kanau_points")
    .update({
      points: (summary.points || 0) + totalPoints,
      total_earned: (summary.total_earned || 0) + totalPoints,
      consecutive_login_days: consecutiveDays,
      last_login_date: new Date().toISOString(),
      last_login_bonus_date: today,
    })
    .eq("user_id", userId)
    .select("user_id, points, total_earned, total_spent, consecutive_login_days, last_login_date, last_login_bonus_date")
    .single()

  if (upErr) throw upErr

  await addTransaction(userId, "earn", totalPoints, "ログインボーナス", "login_bonus", {
    consecutiveDays,
    basePoints,
    consecutiveBonus,
  })

  return {
    user: updated as SupaPointsSummary,
    bonus: {
      basePoints,
      consecutiveBonus,
      totalPoints,
      message: `連続${consecutiveDays}日目のログインボーナス！ 基本${basePoints}Kp + 連続${consecutiveBonus}Kp = 合計${totalPoints}Kp`,
    },
  }
}

// 今日獲得した機能実行ボーナスKpを計算（上限管理用）
export async function getTodayFeatureBonusEarned(userId: string): Promise<number> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  const todayStart = `${today}T00:00:00.000Z`
  const todayEnd = `${today}T23:59:59.999Z`

  const { data, error } = await supabase
    .from("point_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "earn")
    .in("category", ["special_reward"])
    .gte("created_at", todayStart)
    .lte("created_at", todayEnd)

  if (error) throw error
  return (data || []).reduce((sum, tx) => sum + (tx.amount || 0), 0)
}

// 機能実行ボーナスを付与（1日上限5Kp）
export async function addFeatureBonus(
  userId: string,
  amount: number,
  featureName: string,
): Promise<{ actualAmount: number; remaining: number; message: string }> {
  const supabase = getSupabaseClient()
  const todayEarned = await getTodayFeatureBonusEarned(userId)
  const DAILY_LIMIT = 5

  const remaining = Math.max(0, DAILY_LIMIT - todayEarned)
  const actualAmount = Math.min(amount, remaining)

  if (actualAmount <= 0) {
    return {
      actualAmount: 0,
      remaining: 0,
      message: `本日の機能実行ボーナス上限（5Kp）に達しています。明日またお試しください。`,
    }
  }

  const summary = await getOrCreatePointsSummary(userId)

  const { error: upErr } = await supabase
    .from("kanau_points")
    .update({
      points: (summary.points || 0) + actualAmount,
      total_earned: (summary.total_earned || 0) + actualAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (upErr) throw upErr

  await addTransaction(userId, "earn", actualAmount, `${featureName}実行ボーナス`, "special_reward", {
    feature: featureName,
    dailyLimit: DAILY_LIMIT,
    todayEarned: todayEarned + actualAmount,
  })

  return {
    actualAmount,
    remaining: DAILY_LIMIT - (todayEarned + actualAmount),
    message: `${featureName}実行で${actualAmount}Kp獲得しました！本日の残り: ${DAILY_LIMIT - (todayEarned + actualAmount)}Kp`,
  }
}


