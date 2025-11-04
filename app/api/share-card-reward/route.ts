/**
 * ランクカード共有後のKP還元API
 */
import { NextRequest, NextResponse } from 'next/server'
import { addPointsSupa } from '@/lib/kanau-points-supabase'
import { KP_REWARD_SHARE } from '@/constants/kp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, cardId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userIdパラメータが必要です' },
        { status: 400 }
      )
    }

    // 1日1回制限チェック（既に実装されているaddPointsSupaのcheckDailyLimitを使用）
    // ただし、カードごとに1回ずつ共有できるようにする場合は、cardIdを使用
    const reason = cardId ? `ランクカード共有_${cardId}` : 'ランクカード共有'

    // KP還元
    await addPointsSupa(
      userId,
      KP_REWARD_SHARE,
      reason,
      'special_reward',
      true // 1日1回制限を有効化
    )

    // 更新後の残高を取得
    const { getOrCreatePointsSummary } = await import('@/lib/kanau-points-supabase')
    const summary = await getOrCreatePointsSummary(userId)

    return NextResponse.json({
      success: true,
      kpReward: KP_REWARD_SHARE,
      kpBalance: summary.points,
      message: `シェア完了！＋${KP_REWARD_SHARE}KP 還元しました`,
    })
  } catch (error: any) {
    console.error('❌ KP還元エラー:', error)
    
    // 既に獲得済みの場合は、エラーではなく警告として返す
    if (error.message?.includes('すでに') || error.message?.includes('獲得済み')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || '今日はすでにシェアボーナスを獲得済みです',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'KP還元に失敗しました',
      },
      { status: 500 }
    )
  }
}

