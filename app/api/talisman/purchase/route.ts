import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getOrCreatePointsSummary, spendPointsSupa, addTransaction } from "@/lib/kanau-points-supabase"

// お守りマスターデータ
export interface TalismanData {
  id: string
  name: string
  price: number
  rarity: number
  attribute: string
  category: string
  description: string
  effects: string[]
  image: string
  purchaseType?: "kp" | "yen" // 購入タイプ（KPまたは円）
}

const TALISMAN_MASTER_DATA: TalismanData[] = [
  {
    id: "golden-dragon-nozomi-miko",
    name: "金龍護符 - 巫女ノゾミ",
    price: 5000,
    rarity: 4,
    attribute: "光属性",
    category: "幸運系",
    description:
      "この御守は、巫女姿の金雨希味をあしらっており「行動力と金運」の向上に効果があると伝えられています。\n持つ者の“叶う力”を高める象徴です。\n※参考文献：民明書房刊『叶龍伝』",
    effects: ["行動力大幅向上", "金運向上", "信頼運向上", "守護力向上"],
    image: "/images/kanau-nozomi-miko-golden-dragon.png",
  },
  {
    id: "golden-dragon-opening",
    name: "金龍護符 - 和装ノゾミ",
    price: 10000,
    rarity: 5,
    attribute: "光属性",
    category: "幸運系",
    description:
      "この御守は、和服姿の金雨希味をあしらっており「霊力覚醒と守護力」の向上に効果があると伝えられています。\n持つ者の“叶う力”を高める象徴です。\n※参考文献：民明書房刊『叶龍伝』",
    effects: ["行動力極大向上", "金運向上", "信頼運向上", "守護力向上", "霊力覚醒"],
    image: "/images/golden-talisman.png",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { talismanId, userId } = body

    if (!talismanId || !userId) {
      return NextResponse.json(
        { success: false, error: "必須パラメータが不足しています" },
        { status: 400 }
      )
    }

    // お守りデータを取得
    const talisman = TALISMAN_MASTER_DATA.find((t) => t.id === talismanId)
    if (!talisman) {
      return NextResponse.json(
        { success: false, error: "お守りが見つかりません" },
        { status: 404 }
      )
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "データベース接続エラー" },
        { status: 500 }
      )
    }

    // ポイント残高確認
    const summary = await getOrCreatePointsSummary(userId)
    if (summary.points < talisman.price) {
      return NextResponse.json(
        { success: false, error: "ポイントが不足しています" },
        { status: 400 }
      )
    }

    // 既に購入済みかチェック
    const { data: existingItems } = await supabase
      .from("special_items")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "amulet")
      .eq("name", talisman.name)
      .is("is_used", false)
      .maybeSingle()

    if (existingItems) {
      return NextResponse.json(
        { success: false, error: "既にこのお守りを所持しています" },
        { status: 400 }
      )
    }

    // ポイント消費
    await spendPointsSupa(userId, talisman.price, `お守り購入: ${talisman.name}`, "purchase")

    // special_itemsテーブルにお守りを保存
    const { data: savedItem, error: saveError } = await supabase
      .from("special_items")
      .insert({
        user_id: userId,
        name: talisman.name,
        type: "amulet",
        effect_type: "score_boost",
        effect_value: talisman.rarity * 10, // レア度に応じた効果値
        description: talisman.description,
        is_used: false,
      })
      .select()
      .single()

    if (saveError) {
      console.error("お守り保存エラー:", saveError)
      // ポイントは既に消費されているため、ロールバックは手動で行う必要がある
      return NextResponse.json(
        { success: false, error: "お守りの保存に失敗しました" },
        { status: 500 }
      )
    }

    // メタデータ付きトランザクション記録
    await addTransaction(
      userId,
      "spend",
      talisman.price,
      `お守り購入: ${talisman.name}`,
      "purchase",
      {
        talismanId: talisman.id,
        talismanName: talisman.name,
        rarity: talisman.rarity,
        specialItemId: savedItem.id,
      }
    )

    return NextResponse.json({
      success: true,
      talisman: {
        id: savedItem.id,
        talismanId: talisman.id,
        name: talisman.name,
        rarity: talisman.rarity,
        attribute: talisman.attribute,
        category: talisman.category,
        effects: talisman.effects,
        obtainedAt: savedItem.obtained_at,
      },
      remainingPoints: summary.points - talisman.price,
    })
  } catch (error) {
    console.error("お守り購入エラー:", error)
    return NextResponse.json(
      { success: false, error: "購入処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}

// お守り一覧を取得
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      talismans: TALISMAN_MASTER_DATA,
    })
  } catch (error) {
    console.error("お守り一覧取得エラー:", error)
    return NextResponse.json(
      { success: false, error: "お守り一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}

