/**
 * 龍の息吹使用API
 * アイテムを使用して、AI鑑定の使用回数を追加
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId } = body

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'userIdとitemIdが必要です' },
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

    // アイテムを取得
    const { data: item, error: itemError } = await supabase
      .from('special_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .eq('type', 'dragon_breath')
      .eq('is_used', false)
      .maybeSingle()

    if (itemError || !item) {
      return NextResponse.json(
        { error: '使用可能な龍の息吹が見つかりません' },
        { status: 404 }
      )
    }

    // アイテムを使用済みにマーク
    const { error: updateError } = await supabase
      .from('special_items')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', itemId)

    if (updateError) {
      console.error('龍の息吹使用エラー:', updateError)
      return NextResponse.json(
        { error: 'アイテムの使用に失敗しました' },
        { status: 500 }
      )
    }

    // 今日の日付
    const today = new Date().toISOString().split('T')[0]
    const usageCount = item.effect_value || 1

    // 今日の使用回数を取得または作成
    const { data: existing, error: selectError } = await supabase
      .from('ai_fortune_usage')
      .select('id, count')
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
      // 既存レコードを更新
      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .update({
          count: existing.count + usageCount,
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

      // 残りのアイテムリストを取得
      const { data: remainingItems } = await supabase
        .from('special_items')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'dragon_breath')
        .eq('is_used', false)
        .order('obtained_at', { ascending: true })

      return NextResponse.json({
        success: true,
        count: data.count,
        addedCount: usageCount,
        date: today,
        remainingItems: remainingItems || [],
      })
    } else {
      // 新規レコードを作成
      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .insert({
          user_id: userId,
          usage_date: today,
          count: usageCount,
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

      // 残りのアイテムリストを取得
      const { data: remainingItems } = await supabase
        .from('special_items')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'dragon_breath')
        .eq('is_used', false)
        .order('obtained_at', { ascending: true })

      return NextResponse.json({
        success: true,
        count: data.count,
        addedCount: usageCount,
        date: today,
        remainingItems: remainingItems || [],
      })
    }
  } catch (error: any) {
    console.error('龍の息吹使用エラー:', error)
    return NextResponse.json(
      { error: error.message || 'アイテムの使用に失敗しました' },
      { status: 500 }
    )
  }
}

