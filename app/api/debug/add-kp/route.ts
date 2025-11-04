/**
 * デバッグ用: KP付与API
 * 開発環境のみ使用可能
 */
import { NextRequest, NextResponse } from 'next/server'
import { addPointsSupa, getOrCreatePointsSummary } from '@/lib/kanau-points-supabase'

export async function POST(request: NextRequest) {
  // 開発環境チェック（本番環境では使用不可）
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: '本番環境では使用できません' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId, amount = 100 } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userIdパラメータが必要です' },
        { status: 400 }
      )
    }

    // KP付与
    await addPointsSupa(
      userId,
      amount,
      'デバッグ用KP付与',
      'special_reward',
      false // 日次制限なし
    )

    // 更新後の残高を取得
    const summary = await getOrCreatePointsSummary(userId)

    return NextResponse.json({
      success: true,
      amount,
      kpBalance: summary.points,
      message: `${amount}KP付与しました。現在の残高: ${summary.points}KP`,
    })
  } catch (error: any) {
    console.error('❌ デバッグKP付与エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'KP付与に失敗しました',
      },
      { status: 500 }
    )
  }
}

