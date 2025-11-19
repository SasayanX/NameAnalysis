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
      console.warn("⚠️ Supabaseクライアントが利用できません")
      setLoading(false)
      return
    }

    // Supabase URLを検証
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error("❌ NEXT_PUBLIC_SUPABASE_URLが設定されていません")
      setLoading(false)
      return
    }

    // URLの妥当性チェック
    try {
      const url = new URL(supabaseUrl)
      if (!url.hostname || url.hostname.length === 0) {
        console.error("❌ Supabase URLが無効です:", supabaseUrl)
        setLoading(false)
        return
      }
      
      // ダッシュボードURLが設定されている場合はエラー
      if (url.hostname.includes("supabase.com") && url.pathname.includes("/dashboard")) {
        console.error("❌ 誤ったSupabase URLが設定されています")
        console.error("   URLにはダッシュボードのURLではなく、プロジェクトのAPI URLを設定してください")
        console.error("   正しい形式: https://[プロジェクトID].supabase.co")
        console.error("   現在のURL:", supabaseUrl)
        console.error("   Supabaseダッシュボード → Settings → API → Project URL から正しいURLをコピーしてください")
        setLoading(false)
        return
      }
      
      // 正しいSupabase URLの形式チェック
      if (!url.hostname.endsWith(".supabase.co")) {
        console.warn("⚠️ Supabase URLの形式が通常と異なります:", url.hostname)
        console.warn("   通常の形式: https://[プロジェクトID].supabase.co")
      }
    } catch (e) {
      console.error("❌ Supabase URLが無効です:", supabaseUrl, e)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("❌ セッション取得エラー:", error)
        if (error.message?.includes("404") || error.status === 404) {
          console.error("❌ Supabase 404エラー: URL設定を確認してください")
        }
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // 既存セッションがある場合、メールアドレスとuserIdを保存し、サブスクリプション状態を同期
      if (session?.user && typeof window !== "undefined") {
        if (session.user.email) {
          localStorage.setItem("customerEmail", session.user.email.toLowerCase())
          console.log("✅ 既存セッション: メールアドレスをlocalStorageに保存:", session.user.email)
        }
        
        if (session.user.id) {
          localStorage.setItem("userId", session.user.id)
          console.log("✅ 既存セッション: userIdをlocalStorageに保存:", session.user.id)
        }
        
        // サブスクリプション状態を同期
        try {
          const { SubscriptionManager } = await import("@/lib/subscription-manager")
          const subscriptionManager = SubscriptionManager.getInstance()
          await subscriptionManager.syncSubscriptionFromServer()
          console.log("✅ 既存セッション: サブスクリプション状態を同期しました")
        } catch (error) {
          console.error("❌ 既存セッション: サブスクリプション状態の同期エラー:", error)
        }
      }
    }).catch((error) => {
      console.error("❌ セッション取得例外:", error)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // ログイン時にメールアドレスとuserIdをlocalStorageに保存し、サブスクリプション状態を同期
      if (session?.user && _event === "SIGNED_IN") {
        const userEmail = session.user.email
        const userId = session.user.id
        if (typeof window !== "undefined") {
          // メールアドレスをlocalStorageに保存（SubscriptionManagerが使用）
          if (userEmail) {
            localStorage.setItem("customerEmail", userEmail.toLowerCase())
            console.log("✅ メールアドレスをlocalStorageに保存:", userEmail)
          }
          
          // userIdをlocalStorageに保存（SubscriptionManagerが使用）
          if (userId) {
            localStorage.setItem("userId", userId)
            console.log("✅ userIdをlocalStorageに保存:", userId)
          }
          
          // サブスクリプション状態を同期
          try {
            const { SubscriptionManager } = await import("@/lib/subscription-manager")
            const subscriptionManager = SubscriptionManager.getInstance()
            await subscriptionManager.syncSubscriptionFromServer()
            console.log("✅ サブスクリプション状態を同期しました")
          } catch (error) {
            console.error("❌ サブスクリプション状態の同期エラー:", error)
          }
        }
        
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
      
      // ログアウト時にlocalStorageからメールアドレスとuserIdを削除
      if (_event === "SIGNED_OUT" && typeof window !== "undefined") {
        localStorage.removeItem("customerEmail")
        localStorage.removeItem("userId")
        console.log("✅ ログアウト: メールアドレスとuserIdをlocalStorageから削除しました")
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
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error) {
        console.error("❌ ログインエラー:", result.error)
        // 404エラーの場合は詳細なメッセージを表示
        if (result.error.message?.includes("404") || result.error.status === 404) {
          return {
            error: {
              message: "Supabaseサーバーに接続できません。URL設定を確認してください。",
              details: result.error.message,
            },
          }
        }
      }
      return result
    } catch (error: any) {
      console.error("❌ ログイン例外エラー:", error)
      return {
        error: {
          message: error.message || "ログインに失敗しました",
          details: error.toString(),
        },
      }
    }
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

    const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL
    const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : undefined
    const redirectTo = envBaseUrl || fallbackOrigin

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


