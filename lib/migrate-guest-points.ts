/**
 * ゲストモードで貯めたKPをログイン後にSupabaseに移行する
 */
import { KanauPointsManager, type KanauPointsUser } from "@/lib/kanau-points-system"
import { getOrCreatePointsSummary, addPointsSupa, addTransaction } from "@/lib/kanau-points-supabase"

const GUEST_USER_ID = "demo_user_001"
const MIGRATION_KEY = "guest_points_migrated"

/**
 * ゲストKPをSupabaseに移行
 * @param userId ログインユーザーID
 * @returns 移行したKP数
 */
export async function migrateGuestPointsToSupabase(userId: string): Promise<number> {
  // 既に移行済みの場合はスキップ
  const migrationKey = `${MIGRATION_KEY}_${userId}`
  if (typeof window !== "undefined" && sessionStorage.getItem(migrationKey)) {
    console.log("📦 ゲストKPは既に移行済みです")
    return 0
  }

  try {
    // ゲストKPを読み込む
    const pointsManager = KanauPointsManager.getInstance()
    pointsManager.loadFromStorage()
    const guestUser = pointsManager.getUser(GUEST_USER_ID)

    if (!guestUser || guestUser.points === 0) {
      console.log("📦 移行するゲストKPがありません")
      return 0
    }

    const guestPoints = guestUser.points
    const guestTotalEarned = guestUser.totalEarned

    if (guestPoints <= 0) {
      console.log("📦 移行するゲストKPがありません（0KP）")
      return 0
    }

    console.log(`📦 ゲストKP移行開始: ${guestPoints}KP`)

    // Supabaseのポイント残高を取得または作成
    const summary = await getOrCreatePointsSummary(userId)

    // ゲストKPを追加（日次制限なし、1回のみ移行）
    await addPointsSupa(
      userId,
      guestPoints,
      `ゲストモードで獲得したKP移行`,
      "special_reward",
      false // 日次制限なし
    )

    // 移行完了フラグを設定
    if (typeof window !== "undefined") {
      sessionStorage.setItem(migrationKey, "true")
    }

    // ゲストKPをクリア（オプション：残しておくことも可能）
    // pointsManager.spendPoints(GUEST_USER_ID, guestPoints, "ログイン時にSupabaseへ移行")
    // pointsManager.saveToStorage()

    console.log(`✅ ゲストKP移行完了: ${guestPoints}KP → Supabase`)

    return guestPoints
  } catch (error) {
    console.error("❌ ゲストKP移行エラー:", error)
    // エラーが発生してもアプリは継続動作する
    return 0
  }
}

