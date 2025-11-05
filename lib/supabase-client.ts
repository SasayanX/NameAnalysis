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

  // URLの妥当性チェック
  try {
    const url = new URL(supabaseUrl)
    if (!url.hostname || url.hostname.length === 0) {
      console.error("❌ Supabase URLが無効です:", supabaseUrl)
      return null
    }
  } catch (e) {
    console.error("❌ Supabase URLの解析に失敗しました:", supabaseUrl, e)
    return null
  }

  // Supabaseクライアントを作成（グローバルエラーハンドリングを設定）
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // エラーハンドリングを改善
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-client-info': 'nameanalysis-app',
      },
    },
  })

  // グローバルエラーハンドラーを設定
  if (typeof window !== "undefined") {
    cachedClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && session === null) {
        // ログアウト時は正常
        return
      }
      if (event === "TOKEN_REFRESHED") {
        // トークンリフレッシュは正常
        return
      }
      // その他のイベントでエラーがある場合はログ出力
      if (session?.error) {
        console.error("❌ Supabase認証エラー:", session.error)
      }
    })
  }

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


