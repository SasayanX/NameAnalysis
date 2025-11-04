import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Supabaseクライアントを取得（リクエストハンドラー内で初期化）
 * ビルド時に環境変数が設定されていない場合でもエラーにならないようにする
 */
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Square決済情報を確認するAPI
 * メールアドレスまたはセッションIDで最近の決済情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase環境が設定されていません" },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const sessionId = searchParams.get("sessionId")
    
    // メールアドレスまたはセッションIDが必要
    if (!email && !sessionId) {
      return NextResponse.json(
        { error: "emailまたはsessionIdが必要です" },
        { status: 400 }
      )
    }

    // 最近の決済情報を取得（24時間以内、完了済み）
    const query = supabase
      .from("square_payments")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)

    if (email) {
      query.eq("customer_email", email)
    }

    // セッションIDの場合は、localStorageのsessionIdと一致するものを探す
    // 現在はメールアドレスベースのみ対応
    
    const { data, error } = await query

    if (error) {
      console.error("Square決済情報取得エラー:", error)
      return NextResponse.json(
        { error: "決済情報の取得に失敗しました", details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: "決済情報が見つかりませんでした",
        payment: null,
      })
    }

    const payment = data[0]

    return NextResponse.json({
      success: true,
      message: "決済情報が見つかりました",
      payment: {
        id: payment.id,
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        customer_email: payment.customer_email,
        plan: payment.plan,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        webhook_received_at: payment.webhook_received_at,
        activated_at: payment.activated_at,
        expires_at: payment.expires_at,
        created_at: payment.created_at,
      },
    })
  } catch (error) {
    console.error("Square決済確認APIエラー:", error)
    return NextResponse.json(
      {
        error: "決済確認に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * プラン有効化を記録するAPI
 * フロントエンドでlocalStorageに保存した後、このAPIを呼び出して有効化時刻を記録
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase環境が設定されていません" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { payment_id, activated_at } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: "payment_idが必要です" },
        { status: 400 }
      )
    }

    // 決済情報を更新
    const { data, error } = await supabase
      .from("square_payments")
      .update({
        activated_at: activated_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", payment_id)
      .select()
      .single()

    if (error) {
      console.error("プラン有効化記録エラー:", error)
      return NextResponse.json(
        { error: "プラン有効化の記録に失敗しました", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "プラン有効化を記録しました",
      payment: data,
    })
  } catch (error) {
    console.error("プラン有効化APIエラー:", error)
    return NextResponse.json(
      {
        error: "プラン有効化の記録に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

