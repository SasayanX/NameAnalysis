import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedServerClient: SupabaseClient | null = null

/**
 * サーバーサイド用Supabaseクライアントを取得
 * サービスロールキーを使用してRLSをバイパス
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedServerClient) return cachedServerClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // 開発環境でのみ警告を表示
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Supabaseサービスロールキーが設定されていません。サーバーサイドのSupabase機能は無効化されます。"
      )
      console.warn(
        "   設定するには: SUPABASE_SERVICE_ROLE_KEY を .env.local に追加してください"
      )
    }
    return null
  }

  // サービスロールキーを使用してクライアントを作成（RLSをバイパス）
  cachedServerClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedServerClient
}

