import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const lastName = searchParams.get('lastName')
    const firstName = searchParams.get('firstName')
    const rank = searchParams.get('rank')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userIdパラメータが必要です' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabaseクライアントが設定されていません' },
        { status: 500 }
      )
    }

    // 発行済みカードを取得（最新の1件）
    let query = supabase
      .from('issued_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    // 名前とランクでフィルタ（オプション）
    if (lastName) {
      query = query.eq('last_name', lastName)
    }
    if (firstName) {
      query = query.eq('first_name', firstName)
    }
    if (rank) {
      query = query.eq('rank', rank)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('❌ 発行済みカード取得エラー:', error)
      return NextResponse.json(
        { success: false, error: '発行済みカードの取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        card: null,
      })
    }

    return NextResponse.json({
      success: true,
      card: {
        id: data.id,
        image_url: data.image_url,
        rank: data.rank,
        total_points: data.total_points,
        power_level: data.power_level,
        created_at: data.created_at,
      },
    })
  } catch (error: any) {
    console.error('❌ 発行済みカード取得エラー:', error)
    return NextResponse.json(
      { success: false, error: error.message || '発行済みカードの取得に失敗しました' },
      { status: 500 }
    )
  }
}

