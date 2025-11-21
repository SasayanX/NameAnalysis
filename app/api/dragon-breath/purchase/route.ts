/**
 * 龍の息吹購入API
 * 価格: 120円（固定）
 * プラン別に異なる回数を追加:
 * - 無料: 1回
 * - ベーシック: 2回
 * - プレミアム: 3回
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getOrCreatePointsSummary, spendPointsSupa } from '@/lib/kanau-points-supabase'
import { addTransaction } from '@/lib/kanau-points-supabase'

const DRAGON_BREATH_PRICE = 120 // 120円

// プラン別の回数
const PLAN_USAGE_COUNTS = {
  free: 1,
  basic: 2,
  premium: 3,
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan } = body

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'userIdとplanが必要です' },
        { status: 400 }
      )
    }

    const planKey = plan as keyof typeof PLAN_USAGE_COUNTS
    if (!(planKey in PLAN_USAGE_COUNTS)) {
      return NextResponse.json(
        { error: '無効なプランです' },
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

    // ポイント残高確認
    const summary = await getOrCreatePointsSummary(userId)
    if (summary.points < DRAGON_BREATH_PRICE) {
      return NextResponse.json(
        { error: 'ポイントが不足しています' },
        { status: 400 }
      )
    }

    // ポイント消費
    await spendPointsSupa(
      userId,
      DRAGON_BREATH_PRICE,
      `龍の息吹購入（${planKey}プラン: ${PLAN_USAGE_COUNTS[planKey]}回）`,
      'purchase'
    )

    // special_itemsテーブルに龍の息吹を保存
    const usageCount = PLAN_USAGE_COUNTS[planKey]
    const { data: savedItem, error: saveError } = await supabase
      .from('special_items')
      .insert({
        user_id: userId,
        name: '龍の息吹',
        type: 'dragon_breath',
        effect_type: 'ai_fortune_usage',
        effect_value: usageCount,
        description: `AI深層言霊鑑定を${usageCount}回利用できます`,
        is_used: false,
      })
      .select()
      .single()

    if (saveError) {
      console.error('龍の息吹保存エラー:', saveError)
      // ポイントは既に消費されているため、ロールバックは手動で行う必要がある
      return NextResponse.json(
        { error: '龍の息吹の保存に失敗しました' },
        { status: 500 }
      )
    }

    // メタデータ付きトランザクション記録
    await addTransaction(
      userId,
      'spend',
      DRAGON_BREATH_PRICE,
      `龍の息吹購入（${planKey}プラン: ${usageCount}回）`,
      'purchase',
      {
        itemId: savedItem.id,
        itemName: '龍の息吹',
        plan: planKey,
        usageCount,
      }
    )

    return NextResponse.json({
      success: true,
      item: {
        id: savedItem.id,
        name: '龍の息吹',
        usageCount,
        plan: planKey,
        obtainedAt: savedItem.obtained_at,
      },
      remainingPoints: summary.points - DRAGON_BREATH_PRICE,
    })
  } catch (error: any) {
    console.error('龍の息吹購入エラー:', error)
    return NextResponse.json(
      { error: error.message || '購入処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

