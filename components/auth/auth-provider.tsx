"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase-client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // ログイン時にゲストKPを移行
      if (session?.user && _event === "SIGNED_IN") {
        // 非同期で実行（ログインをブロックしない）
        setTimeout(async () => {
          try {
            const { migrateGuestPointsToSupabase } = await import("@/lib/migrate-guest-points")
            const migratedPoints = await migrateGuestPointsToSupabase(session.user!.id)
            if (migratedPoints > 0) {
              console.log(`✅ ゲストKP移行完了: ${migratedPoints}KP`)
              
              // カスタムイベントを発行して、他のコンポーネントに通知
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("guest-points-migrated", {
                  detail: { points: migratedPoints }
                }))
              }
            }
          } catch (error) {
            console.error("ゲストKP移行エラー:", error)
            // エラーが発生してもログインは継続
          }
        }, 1000) // 1秒後に実行（ログイン処理を優先）
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { error: { message: "Supabase環境変数が設定されていません" } }
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { name },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    })
  }

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { error: { message: "Supabase環境変数が設定されていません" } }
    }
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { error: { message: "Supabase環境変数が設定されていません" } }
    }
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined
    return await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}


