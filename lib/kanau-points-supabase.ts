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
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

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
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }
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

/**
 * 今日すでに特定の理由でポイントを獲得しているかチェック
 */
export async function hasEarnedPointsToday(
  userId: string,
  reason: string,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.toISOString()

  const { data, error } = await supabase
    .from("point_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "earn")
    .eq("reason", reason)
    .gte("created_at", todayStart)
    .limit(1)

  if (error) {
    console.error("ポイント履歴チェックエラー:", error)
    return false // エラー時は許可（安全側）
  }

  return (data?.length || 0) > 0
}

export async function addPointsSupa(
  userId: string,
  amount: number,
  reason: string = "デバッグ付与",
  category: "special_reward" | "purchase" = "special_reward",
  checkDailyLimit: boolean = false,
) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  // 日次制限チェック
  if (checkDailyLimit) {
    const alreadyEarned = await hasEarnedPointsToday(userId, reason)
    if (alreadyEarned) {
      throw new Error("今日はすでにこのボーナスを獲得済みです")
    }
  }

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
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }
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
  if (!supabase) {
    return 0
  }
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

// プラン別の基礎ポイント設定
function getBasePointsByPlan(plan: "free" | "basic" | "premium" = "free"): number {
  switch (plan) {
    case "free":
      return 1
    case "basic":
      return 2
    case "premium":
      return 3
    default:
      return 1
  }
}

export async function processLoginBonusSupa(userId: string, plan?: "free" | "basic" | "premium") {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }
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

  // 連続ログイン日数の計算
  let consecutiveDays: number
  if (lastLoginDate === yesterdayStr) {
    // 昨日ログインしていた場合は連続日数を継続
    consecutiveDays = (summary.consecutive_login_days || 0) + 1
  } else {
    // ログインが途切れた場合は1日目にリセット（倍率も1に戻る）
    consecutiveDays = 1
  }

  // プラン情報が渡されていない場合はSubscriptionManagerから取得を試みる
  let userPlan: "free" | "basic" | "premium" = plan || "free"
  if (!plan && typeof window !== "undefined") {
    try {
      const { SubscriptionManager } = await import("@/lib/subscription-manager")
      const manager = SubscriptionManager.getInstance()
      const currentPlan = manager.getCurrentPlan()
      userPlan = currentPlan.id as "free" | "basic" | "premium"
    } catch (error) {
      console.warn("プラン情報の取得に失敗しました。デフォルト（無料プラン）を使用します。", error)
      userPlan = "free"
    }
  }

  const basePoints = getBasePointsByPlan(userPlan)
  // 連続ログインボーナスを廃止：基礎Kpのみ毎日獲得
  const totalPoints = basePoints

  const { data: updated, error: upErr } = await supabase
    .from("kanau_points")
    .update({
      points: (summary.points || 0) + totalPoints,
      total_earned: (summary.total_earned || 0) + totalPoints,
      consecutive_login_days: consecutiveDays, // 連続日数はカウントは継続（表示用）
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
    totalPoints,
  })

  // プラン名を取得
  const planNames = {
    free: "無料",
    basic: "ベーシック",
    premium: "プレミアム",
  }
  const planName = planNames[userPlan] || "無料"

  // メッセージ生成（基礎KPのみ）
  const message = `ログインボーナス！ ${planName}プラン特典: 基礎${basePoints}Kp獲得`

  return {
    user: updated as SupaPointsSummary,
    bonus: {
      basePoints,
      consecutiveBonus: 0, // 連続ボーナスは廃止
      totalPoints,
      consecutiveDays, // 連続日数は表示用に返す
      message,
    },
  }
}

// 今日獲得した機能実行ボーナスKpを計算（上限管理用）
export async function getTodayFeatureBonusEarned(userId: string): Promise<number> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return 0
  }
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
  if (!supabase) {
    return {
      actualAmount: 0,
      remaining: 0,
      message: "Supabase環境変数が設定されていません",
    }
  }
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

// ポイント取引履歴を取得
export interface PointTransaction {
  id: string
  user_id: string
  type: "earn" | "spend"
  amount: number
  reason: string
  category: "login_bonus" | "ranking_reward" | "ranking_entry" | "special_reward" | "purchase"
  metadata: Record<string, any> | null
  created_at: string
}

export async function getPointTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<PointTransaction[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  const { data, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data || []) as PointTransaction[]
}

// ポイント統計を取得
export interface PointStatistics {
  totalEarned: number
  totalSpent: number
  currentBalance: number
  transactionCount: number
  earnCount: number
  spendCount: number
  byCategory: Record<string, number>
  byDay: Array<{ date: string; earned: number; spent: number }>
}

export async function getPointStatistics(userId: string, days: number = 30): Promise<PointStatistics> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase環境変数が設定されていません")
  }

  const summary = await getOrCreatePointsSummary(userId)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: transactions, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })

  if (error) throw error

  const transactionsList = (transactions || []) as PointTransaction[]

  // カテゴリ別集計
  const byCategory: Record<string, number> = {}
  let earnCount = 0
  let spendCount = 0

  transactionsList.forEach((tx) => {
    if (tx.type === "earn") {
      earnCount++
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
    } else {
      spendCount++
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
    }
  })

  // 日別集計
  const byDayMap = new Map<string, { earned: number; spent: number }>()
  transactionsList.forEach((tx) => {
    const date = tx.created_at.split("T")[0]
    if (!byDayMap.has(date)) {
      byDayMap.set(date, { earned: 0, spent: 0 })
    }
    const dayData = byDayMap.get(date)!
    if (tx.type === "earn") {
      dayData.earned += tx.amount
    } else {
      dayData.spent += tx.amount
    }
  })

  const byDay = Array.from(byDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalEarned: summary.total_earned || 0,
    totalSpent: summary.total_spent || 0,
    currentBalance: summary.points || 0,
    transactionCount: transactionsList.length,
    earnCount,
    spendCount,
    byCategory,
    byDay,
  }
}


