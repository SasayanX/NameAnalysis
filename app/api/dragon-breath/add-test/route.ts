/**
 * テスト用：龍の息吹を追加するAPI
 * 開発環境でのみ使用可能
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

// プラン別の回復回数
const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, count = 1, plan = 'premium', testKey } = body

    // テスト用キーで保護（本番環境でも使用可能）
    // 環境変数 TEST_DRAGON_BREATH_KEY が設定されている場合は、それをチェック
    const expectedTestKey = process.env.TEST_DRAGON_BREATH_KEY || 'test-key-12345'
    if (testKey !== expectedTestKey) {
      return NextResponse.json(
        { error: 'テスト用キーが必要です。testKeyパラメータを追加してください。' },
        { status: 403 }
      )
    }

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

    const planKey = plan as keyof typeof PLAN_USAGE_COUNTS
    const usageCount = PLAN_USAGE_COUNTS[planKey] || PLAN_USAGE_COUNTS.free

    // 指定された個数分、龍の息吹を追加
    const items = []
    for (let i = 0; i < count; i++) {
      const { data: savedItem, error: saveError } = await supabase
        .from('special_items')
        .insert({
          user_id: userId,
          name: '龍の息吹',
          type: 'dragon_breath',
          effect_type: 'ai_fortune_usage',
          effect_value: usageCount,
          usage_count: usageCount,
          description: `AI深層言霊鑑定を${usageCount}回利用できます（テスト用）`,
          is_used: false,
          metadata: {
            test: true,
            addedAt: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (saveError) {
        console.error(`龍の息吹${i + 1}個目保存エラー:`, saveError)
        return NextResponse.json(
          { error: `龍の息吹の保存に失敗しました（${i + 1}個目）: ${saveError.message}` },
          { status: 500 }
        )
      }

      items.push(savedItem)
    }

    // 追加後のアイテム一覧を取得
    const { data: allItems } = await supabase
      .from('special_items')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'dragon_breath')
      .eq('is_used', false)
      .order('obtained_at', { ascending: true })

    return NextResponse.json({
      success: true,
      message: `${count}個の龍の息吹を追加しました`,
      addedItems: items,
      totalItems: allItems?.length || 0,
      plan: planKey,
      usageCount,
    })
  } catch (error: any) {
    console.error('テスト用龍の息吹追加エラー:', error)
    return NextResponse.json(
      { error: error.message || '龍の息吹の追加に失敗しました' },
      { status: 500 }
    )
  }
}

