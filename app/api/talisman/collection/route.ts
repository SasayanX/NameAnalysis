import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ユーザーIDが必要です" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "データベース接続エラー" },
        { status: 500 }
      )
    }

    // ユーザーのお守りコレクションを取得
    const { data: items, error } = await supabase
      .from("special_items")
      .select("id, name, type, effect_type, effect_value, description, obtained_at, is_used")
      .eq("user_id", userId)
      .eq("type", "amulet")
      .order("obtained_at", { ascending: false })

    if (error) {
      console.error("お守りコレクション取得エラー:", error)
      return NextResponse.json(
        { success: false, error: "コレクションの取得に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      collection: items || [],
      count: items?.length || 0,
    })
  } catch (error) {
    console.error("お守りコレクション取得エラー:", error)
    return NextResponse.json(
      { success: false, error: "コレクションの取得に失敗しました" },
      { status: 500 }
    )
  }
}

