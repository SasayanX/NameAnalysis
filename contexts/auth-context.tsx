"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AuthContextType {
  user: null
  session: null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  userProfile: null
  refreshProfile: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading] = useState(false)

  // 認証機能を完全に無効化
  const signIn = async () => ({ error: new Error("Authentication disabled") })
  const signUp = async () => ({ error: new Error("Authentication disabled") })
  const signOut = async () => {}
  const refreshProfile = async () => {}

  const value = {
    user: null,
    session: null,
    loading,
    signIn,
    signUp,
    signOut,
    userProfile: null,
    refreshProfile,
    isSupabaseConfigured: false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
