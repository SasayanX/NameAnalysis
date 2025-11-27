/**
 * ランキングシーズン確定API
 * シーズン終了時に実行され、ランキングを確定して報酬を配布する
 * 
 * 実行タイミング:
 * - 春の陣終了: 5月31日 23:59
 * - 夏の陣終了: 8月31日 23:59
 * - 秋の陣終了: 11月30日 23:59
 * - 冬の陣終了: 2月28日/29日 23:59
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'
import { 
  getPreviousSeasonKey, 
  fetchSeasonRanking, 
  calculateRewardPoints,
  getRankTitle 
} from '@/lib/ranking-repo'
import { addPointsSupa } from '@/lib/kanau-points-supabase'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（Cron Secretを使用）
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ 認証失敗: Cron Secretが一致しません")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 手動実行の場合、URLパラメータでシーズンを指定可能
    const { searchParams } = new URL(request.url)
    const manualSeason = searchParams.get('season')
    
    // 前シーズンのキーを取得（手動指定がない場合）
    const seasonKey = manualSeason || getPreviousSeasonKey()
    
    console.log(`🏆 ランキング確定処理開始: ${seasonKey}`)

    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Supabase環境変数が設定されていません")
    }

    // 1. ランキングを取得（全件、スコア順）
    const entries = await fetchSeasonRanking(seasonKey, 1000)
    
    if (entries.length === 0) {
      console.log(`⚠️ ${seasonKey} のランキングエントリが存在しません`)
      return NextResponse.json({
        success: true,
        message: "ランキングエントリが存在しません",
        season: seasonKey,
        processedCount: 0,
      })
    }

    console.log(`📊 ${entries.length}件のエントリを処理します`)

    // 2. 各エントリに順位を確定し、報酬を計算
    const results = {
      success: 0,
      failed: 0,
      totalRewards: 0,
      errors: [] as string[],
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const rank = i + 1
      const rewardPoints = calculateRewardPoints(rank)
      const title = getRankTitle(rank)

      try {
        // 3. ranking_entries テーブルを更新（順位と報酬額を記録）
        const { error: updateError } = await supabase
          .from('ranking_entries')
          .update({
            rank,
            reward_points: rewardPoints,
          })
          .eq('id', entry.id)

        if (updateError) {
          throw new Error(`ランキング更新エラー: ${updateError.message}`)
        }

        // 4. 報酬ポイントを付与（0ポイントの場合はスキップ）
        if (rewardPoints > 0) {
          await addPointsSupa(
            entry.user_id,
            rewardPoints,
            `${seasonKey}ランキング報酬（${rank}位: ${title}）`,
            'special_reward',
            false // 日次制限チェックなし（ランキング報酬は1回のみ）
          )
          
          console.log(`✅ ${rank}位: ${entry.ranking_display_name || entry.name} - ${rewardPoints} Kp付与`)
        } else {
          console.log(`ℹ️ ${rank}位: ${entry.ranking_display_name || entry.name} - 報酬なし`)
        }

        results.success++
        results.totalRewards += rewardPoints
      } catch (error: any) {
        console.error(`❌ エントリ処理エラー (${rank}位, user_id: ${entry.user_id}):`, error.message)
        results.failed++
        results.errors.push(`${rank}位: ${error.message}`)
      }
    }

    console.log(`🎉 ランキング確定処理完了: ${seasonKey}`)
    console.log(`✅ 成功: ${results.success}件`)
    console.log(`❌ 失敗: ${results.failed}件`)
    console.log(`💰 総報酬: ${results.totalRewards} Kp`)

    return NextResponse.json({
      success: true,
      message: "ランキング確定処理が完了しました",
      season: seasonKey,
      processedCount: entries.length,
      successCount: results.success,
      failedCount: results.failed,
      totalRewards: results.totalRewards,
      errors: results.errors,
    })
  } catch (error: any) {
    console.error("❌ ランキング確定処理エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "ランキング確定処理に失敗しました",
      },
      { status: 500 }
    )
  }
}

/**
 * GET: ステータス確認用
 */
export async function GET() {
  const previousSeason = getPreviousSeasonKey()
  const currentSeason = getCurrentSeasonKey()
  
  return NextResponse.json({
    message: "ランキング確定API - 稼働中",
    previousSeason,
    currentSeason,
    usage: "POST /api/ranking/finalize-season",
    auth: "Bearer <CRON_SECRET>",
    manualExecution: "POST /api/ranking/finalize-season?season=2025_spring",
  })
}

// 現在のシーズンを取得（ヘルパー関数）
function getCurrentSeasonKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  if (m === 12 || m === 1 || m === 2) return `${y}_winter`
  if (m >= 3 && m <= 5) return `${y}_spring`
  if (m >= 6 && m <= 8) return `${y}_summer`
  return `${y}_autumn`
}

