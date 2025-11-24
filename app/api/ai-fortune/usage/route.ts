/**
 * AI鑑定使用回数管理API
 * - GET: 現在の使用回数と制限を取得（プラン別）
 * - POST: 使用回数を更新（1回使用）
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

// プラン別の1日あたりの制限
// 無料・ベーシック: 0回（龍の息吹がないと使えない）
// プレミアム: 1回（龍の息吹で追加で3回まで）
const PLAN_LIMITS = {
  free: 0,
  basic: 0,
  premium: 1,
} as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const plan = searchParams.get('plan') || 'free'

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

    // 今日の日付
    const today = new Date().toISOString().split('T')[0]
    const planKey = plan as keyof typeof PLAN_LIMITS
    const baseLimit = PLAN_LIMITS[planKey] ?? 1

    // 今日の使用回数を取得
    const { data, error } = await supabase
      .from('ai_fortune_usage')
      .select('count, limit_per_day')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') { // PGRST116は「行が見つからない」エラー
      console.error('AI鑑定使用回数取得エラー:', error)
      return NextResponse.json(
        { error: '使用回数の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 今日のレコードが存在しない場合、前日のlimit_per_dayを確認して繰り越す
    if (!data) {
      // 前日の日付を取得
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // 前日のレコードを取得
      const { data: yesterdayData } = await supabase
        .from('ai_fortune_usage')
        .select('limit_per_day')
        .eq('user_id', userId)
        .eq('usage_date', yesterdayStr)
        .maybeSingle()

      // 前日のlimit_per_dayから基本制限を引いた追加分を計算
      const yesterdayLimit = yesterdayData?.limit_per_day || baseLimit
      const carryOverBonus = Math.max(0, yesterdayLimit - baseLimit)
      const limit = baseLimit + carryOverBonus

      // 今日のレコードを作成（繰り越し分を含む）
      await supabase
        .from('ai_fortune_usage')
        .insert({
          user_id: userId,
          usage_date: today,
          count: 0,
          plan: planKey,
          limit_per_day: limit,
        })

      return NextResponse.json({
        success: true,
        count: 0,
        limit,
        date: today,
      })
    }

    const count = data.count || 0
    // データベースに保存されているlimit_per_dayを使用
    const limit = data.limit_per_day ?? baseLimit

    return NextResponse.json({
      success: true,
      count,
      limit,
      date: today,
    })
  } catch (error: any) {
    console.error('AI鑑定使用回数取得エラー:', error)
    return NextResponse.json(
      { error: error.message || '使用回数の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, increment = 1, plan = 'free' } = body

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

    // 今日の日付
    const today = new Date().toISOString().split('T')[0]
    const planKey = plan as keyof typeof PLAN_LIMITS
    const baseLimit = PLAN_LIMITS[planKey] || 1

    // 今日の使用回数を取得または作成
    const { data: existing, error: selectError } = await supabase
      .from('ai_fortune_usage')
      .select('id, count, limit_per_day')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('AI鑑定使用回数取得エラー:', selectError)
      return NextResponse.json(
        { error: '使用回数の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (existing) {
      // 既存レコードを更新（limit_per_dayは変更しない）
      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .update({ 
          count: existing.count + increment,
          plan: planKey,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('AI鑑定使用回数更新エラー:', error)
        return NextResponse.json(
          { error: '使用回数の更新に失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        count: data.count,
        limit: data.limit_per_day || existing.limit_per_day || baseLimit,
        date: today,
      })
    } else {
      // 新規レコードを作成（前日のlimit_per_dayを繰り越す）
      // 前日の日付を取得
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // 前日のレコードを取得
      const { data: yesterdayData } = await supabase
        .from('ai_fortune_usage')
        .select('limit_per_day')
        .eq('user_id', userId)
        .eq('usage_date', yesterdayStr)
        .maybeSingle()

      // 前日のlimit_per_dayから基本制限を引いた追加分を計算
      const yesterdayLimit = yesterdayData?.limit_per_day || baseLimit
      const carryOverBonus = Math.max(0, yesterdayLimit - baseLimit)
      const limit = baseLimit + carryOverBonus

      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .insert({
          user_id: userId,
          usage_date: today,
          count: increment,
          plan: planKey,
          limit_per_day: limit,
        })
        .select()
        .single()

      if (error) {
        console.error('AI鑑定使用回数作成エラー:', error)
        return NextResponse.json(
          { error: '使用回数の作成に失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        count: data.count,
        limit: data.limit_per_day || limit,
        date: today,
      })
    }
  } catch (error: any) {
    console.error('AI鑑定使用回数更新エラー:', error)
    return NextResponse.json(
      { error: error.message || '使用回数の更新に失敗しました' },
      { status: 500 }
    )
  }
}

