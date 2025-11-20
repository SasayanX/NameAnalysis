import { NextRequest, NextResponse } from "next/server"
import { processLoginBonusSupa } from "@/lib/kanau-points-supabase"
import { getSupabaseServerClient } from "@/lib/supabase-server"

/**
 * ログインボーナスを受け取るAPIエンドポイント
 * サーバーサイドで処理することで、RLSポリシーをバイパス
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // 認証チェック（オプション）
    // 必要に応じて、リクエストヘッダーから認証トークンを確認

    console.log("[Login Bonus API] Processing login bonus for user:", userId, "plan:", plan)

    // サーバーサイドでログインボーナスを処理
    // processLoginBonusSupaは、サーバーサイドではサービスロールキーを使用する
    const result = await processLoginBonusSupa(userId, plan || "free")

    return NextResponse.json({
      success: true,
      user: result.user,
      bonus: result.bonus,
    })
  } catch (error) {
    console.error("[Login Bonus API] Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorCode = error instanceof Error && "code" in error ? (error as any).code : undefined

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode,
        details: process.env.NODE_ENV === "development" ? {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

