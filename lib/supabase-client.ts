import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedClient: SupabaseClient | null = null

/**
 * Supabaseクライアントを取得
 * 環境変数が設定されていない場合はnullを返す
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

  if (!supabaseUrl || !supabaseAnonKey) {
    // 開発環境でのみ警告を表示
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Supabase環境変数が設定されていません。Supabase機能は無効化されます。"
      )
      console.warn(
        "   設定するには: NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に追加してください"
      )
    }
    return null
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}

/**
 * Supabaseクライアントが利用可能かチェック
 */
export function isSupabaseAvailable(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(supabaseUrl && supabaseAnonKey)
}


