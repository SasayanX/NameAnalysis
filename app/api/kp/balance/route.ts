/**
 * KP残高取得API
 * クライアントサイドからのCORSエラーを回避するため、サーバーサイドでSupabaseアクセスを行う
 */
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreatePointsSummary } from '@/lib/kanau-points-supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userIdパラメータが必要です' },
        { status: 400 }
      )
    }

    // サーバーサイドでKP残高を取得
    const summary = await getOrCreatePointsSummary(userId)

    return NextResponse.json({
      success: true,
      points: summary.points || 0,
      summary: summary,
    })
  } catch (error: any) {
    console.error('❌ KP残高取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'KP残高の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

