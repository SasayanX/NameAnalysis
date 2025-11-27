/**
 * 龍の息吹使用API
 * アイテムを使用して、AI鑑定の使用回数を追加
 * 【重要】課金要素のため、厳密に管理します
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

// プラン別の回復回数
const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

/**
 * ユーザーの現在のプランをデータベースから取得
 */
async function getUserPlan(supabase: any, userId: string): Promise<'free' | 'basic' | 'premium'> {
  try {
    // 最新の有効なサブスクリプションを取得
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('last_verified_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('[Dragon Breath Use] プラン取得エラー:', error)
      return 'free'
    }

    if (!subscription) {
      return 'free'
    }

    // 有効期限をチェック
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at)
      const now = new Date()
      if (expiresAt < now) {
        return 'free'
      }
    }

    const plan = subscription.plan as 'free' | 'basic' | 'premium'
    return plan || 'free'
  } catch (error) {
    console.error('[Dragon Breath Use] プラン取得エラー:', error)
    return 'free'
  }
}

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

    // 【重要】データベースからプラン情報を取得（クライアントから送られてきた値は信用しない）
    const userPlan = await getUserPlan(supabase, userId)
    console.log('[Dragon Breath Use] ユーザープラン:', { userId, plan: userPlan })

    // プランに応じた回復回数を取得
    const planKey = userPlan as keyof typeof PLAN_USAGE_COUNTS
    const usageCount = PLAN_USAGE_COUNTS[planKey] || PLAN_USAGE_COUNTS.free

    // 【重要】アイテムを取得（is_used=falseのもののみ）
    // トランザクション的に処理するため、SELECT FOR UPDATE的な動作を期待
    const { data: item, error: itemError } = await supabase
      .from('special_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .eq('type', 'dragon_breath')
      .eq('is_used', false)
      .maybeSingle()

    if (itemError) {
      console.error('[Dragon Breath Use] アイテム取得エラー:', itemError)
      return NextResponse.json(
        { error: 'アイテムの取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!item) {
      console.warn('[Dragon Breath Use] 使用可能な龍の息吹が見つかりません:', { userId, itemId })
      return NextResponse.json(
        { error: '使用可能な龍の息吹が見つかりません' },
        { status: 404 }
      )
    }

    // 【重要】重複使用防止：再度is_usedをチェック
    if (item.is_used) {
      console.warn('[Dragon Breath Use] 既に使用済みのアイテム:', { userId, itemId })
      return NextResponse.json(
        { error: 'このアイテムは既に使用済みです' },
        { status: 409 }
      )
    }

    // 【重要】アイテムを使用済みにマーク（is_used=falseの条件を再度チェック）
    const { data: updatedItem, error: updateError } = await supabase
      .from('special_items')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('is_used', false) // 重複使用防止：更新時に再度チェック
      .select()
      .single()

    if (updateError) {
      console.error('[Dragon Breath Use] アイテム更新エラー:', updateError)
      return NextResponse.json(
        { error: 'アイテムの使用に失敗しました' },
        { status: 500 }
      )
    }

    // 更新が成功したかチェック（別プロセスが既に使用していた場合、updatedItemはnullになる）
    if (!updatedItem) {
      console.warn('[Dragon Breath Use] アイテムの更新に失敗（既に使用済みの可能性）:', { userId, itemId })
      return NextResponse.json(
        { error: 'このアイテムは既に使用済みです' },
        { status: 409 }
      )
    }

    // 今日の日付
    const today = new Date().toISOString().split('T')[0]
    console.log('[Dragon Breath Use] 使用処理開始:', { userId, itemId, plan: userPlan, usageCount, date: today })

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

    // 【新規制限】残り回数が0回の時のみ使用可能
    if (existing) {
      const currentCount = existing.count || 0
      const currentLimit = existing.limit_per_day || 0
      const remaining = currentLimit - currentCount

      if (remaining > 0) {
        console.warn('[Dragon Breath Use] 残り回数がある場合は使用できません:', { 
          userId, 
          itemId, 
          currentCount, 
          currentLimit, 
          remaining 
        })
        // アイテムの使用をロールバック
        await supabase
          .from('special_items')
          .update({ is_used: false, used_at: null })
          .eq('id', itemId)
        
        return NextResponse.json(
          { 
            error: '残り回数がある場合は龍の息吹を使用できません',
            remaining,
            currentCount,
            currentLimit,
          },
          { status: 400 }
        )
      }
    }

    if (existing) {
      // 既存レコードを更新（limit_per_dayだけを増やす、countは使用済み回数なので増やさない）
      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .update({
          limit_per_day: (existing.limit_per_day || 1) + usageCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('[Dragon Breath Use] AI鑑定使用回数更新エラー:', error)
        // エラーが発生した場合、アイテムの使用をロールバック（is_usedをfalseに戻す）
        await supabase
          .from('special_items')
          .update({ is_used: false, used_at: null })
          .eq('id', itemId)
        return NextResponse.json(
          { error: '使用回数の更新に失敗しました' },
          { status: 500 }
        )
      }

      console.log('[Dragon Breath Use] 使用回数更新成功:', { 
        userId, 
        itemId, 
        plan: userPlan, 
        usageCount, 
        newCount: data.count, 
        newLimit: data.limit_per_day 
      })

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
        count: data.count, // 使用済み回数は変更しない
        limit: data.limit_per_day || (existing.limit_per_day || 1) + usageCount,
        addedCount: usageCount,
        plan: userPlan,
        date: today,
        remainingItems: remainingItems || [],
      })
    } else {
      // 新規レコードを作成（limit_per_dayだけを設定、countは0）
      const planLimits = { free: 0, basic: 0, premium: 1 }
      const baseLimit = planLimits[userPlan as keyof typeof planLimits] || 0
      const { data, error } = await supabase
        .from('ai_fortune_usage')
        .insert({
          user_id: userId,
          usage_date: today,
          count: 0, // まだ使用していないので0
          limit_per_day: baseLimit + usageCount,
        })
        .select()
        .single()

      if (error) {
        console.error('[Dragon Breath Use] AI鑑定使用回数作成エラー:', error)
        // エラーが発生した場合、アイテムの使用をロールバック（is_usedをfalseに戻す）
        await supabase
          .from('special_items')
          .update({ is_used: false, used_at: null })
          .eq('id', itemId)
        return NextResponse.json(
          { error: '使用回数の作成に失敗しました' },
          { status: 500 }
        )
      }

      console.log('[Dragon Breath Use] 使用回数作成成功:', { 
        userId, 
        itemId, 
        plan: userPlan, 
        usageCount, 
        newCount: data.count, 
        newLimit: data.limit_per_day 
      })

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
        count: data.count, // 使用済み回数（0）
        limit: data.limit_per_day || baseLimit + usageCount,
        addedCount: usageCount,
        plan: userPlan,
        date: today,
        remainingItems: remainingItems || [],
      })
    }
  } catch (error: any) {
    console.error('[Dragon Breath Use] 予期しないエラー:', error)
    return NextResponse.json(
      { error: error.message || 'アイテムの使用に失敗しました' },
      { status: 500 }
    )
  }
}

