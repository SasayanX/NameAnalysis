/**
 * 龍の息吹アイテム一覧取得API
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'データベース接続エラー' },
        { status: 500 }
      )
    }

    // 未使用の龍の息吹アイテムを取得
    const { data, error } = await supabase
      .from('special_items')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'dragon_breath')
      .eq('is_used', false)
      .order('obtained_at', { ascending: true })

    if (error) {
      console.error('龍の息吹アイテム取得エラー:', error)
      return NextResponse.json(
        { error: 'アイテムの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      items: data || [],
    })
  } catch (error: any) {
    console.error('龍の息吹アイテム取得エラー:', error)
    return NextResponse.json(
      { error: error.message || 'アイテムの取得に失敗しました' },
      { status: 500 }
    )
  }
}

