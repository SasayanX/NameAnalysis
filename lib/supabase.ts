// Supabase関連のコードを完全に削除し、ダミー実装に置き換える

export const isSupabaseConfigured = false

export const createClient = () => null
export const createServerClient = () => null

// 型定義のみ残す（互換性のため）
export type Database = {
  public: {
    Tables: {}
  }
}
