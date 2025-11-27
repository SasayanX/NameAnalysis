import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: "サブスクリプションIDが必要です" }, { status: 400 })
    }

    // Square API呼び出し
    const squareResponse = await fetch(
      `https://connect.squareup.com/v2/subscriptions/${subscriptionId}/actions/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
      },
    )

    const result = await squareResponse.json()

    if (squareResponse.ok) {
      // Supabaseのuser_subscriptionsテーブルも更新
      try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const now = new Date().toISOString()
          
          // user_subscriptionsを更新
          const { error: updateError } = await supabase
            .from("user_subscriptions")
            .update({
              status: "cancelled",
              expires_at: now, // 即座に無効化
              updated_at: now,
            })
            .eq("user_id", user.id)
            .eq("square_subscription_id", subscriptionId)
          
          if (updateError) {
            console.error("Supabase update error:", updateError)
          } else {
            console.log("✅ Supabaseのuser_subscriptionsを更新しました")
          }
        }
      } catch (supabaseError) {
        console.error("Supabase処理エラー:", supabaseError)
        // Supabaseエラーでも、Square解約は成功しているので継続
      }
      
      return NextResponse.json({
        success: true,
        message: "サブスクリプションをキャンセルしました",
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.errors?.[0]?.detail || "キャンセル処理に失敗しました" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
