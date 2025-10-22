"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 使用制限の型定義
export interface UsageData {
  personalAnalysis: number
  companyAnalysis: number
  babyNaming: number
  csvExport: number
  pdfExport: number
  date: string
}

export interface UserPreferences {
  plan: "free" | "basic" | "premium"
  trialStartDate?: string
  trialEndDate?: string
  subscriptionId?: string
  isActive: boolean
  usage: UsageData
}

// プラン別制限
const PLAN_LIMITS = {
  free: {
    personalAnalysis: 3,
    companyAnalysis: 2,
    babyNaming: 1,
    csvExport: 0,
    pdfExport: 0,
  },
  basic: {
    personalAnalysis: -1, // 無制限
    companyAnalysis: -1,
    babyNaming: -1,
    csvExport: 5,
    pdfExport: 3,
  },
  premium: {
    personalAnalysis: -1,
    companyAnalysis: -1,
    babyNaming: -1,
    csvExport: -1,
    pdfExport: -1,
  },
}

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  incrementUsage: (feature?: keyof UsageData) => void
  canPerformAnalysis: (feature?: keyof UsageData) => boolean
  getRemainingAnalyses: (feature?: keyof UsageData) => number
  isTrialActive: () => boolean
  getTrialDaysRemaining: () => number
  getCurrentPlan: () => "free" | "basic" | "premium"
  getTodayUsage: () => UsageData | null
  resetDailyUsage: () => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

// デフォルトの使用状況を作成
function createDefaultUsage(): UsageData {
  const today = new Date().toISOString().split("T")[0]
  return {
    personalAnalysis: 0,
    companyAnalysis: 0,
    babyNaming: 0,
    csvExport: 0,
    pdfExport: 0,
    date: today,
  }
}

// デフォルトの設定を作成
function createDefaultPreferences(): UserPreferences {
  return {
    plan: "free",
    isActive: true,
    usage: createDefaultUsage(),
  }
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(createDefaultPreferences())
  const [isLoaded, setIsLoaded] = useState(false)

  // 初期化
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userPreferences")
      if (stored) {
        const parsed = JSON.parse(stored)

        // 日付チェック - 新しい日になったら使用状況をリセット
        const today = new Date().toISOString().split("T")[0]
        if (parsed.usage?.date !== today) {
          parsed.usage = createDefaultUsage()
        }

        setPreferences(parsed)
      }
    } catch (error) {
      console.error("設定の読み込みエラー:", error)
      setPreferences(createDefaultPreferences())
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 設定の保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("userPreferences", JSON.stringify(preferences))
      } catch (error) {
        console.error("設定の保存エラー:", error)
      }
    }
  }, [preferences, isLoaded])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }))
  }

  const incrementUsage = (feature: keyof UsageData = "personalAnalysis") => {
    const today = new Date().toISOString().split("T")[0]

    setPreferences((prev) => {
      // 日付が変わっていたら使用状況をリセット
      if (prev.usage.date !== today) {
        const newUsage = createDefaultUsage()
        newUsage[feature] = 1
        return {
          ...prev,
          usage: newUsage,
        }
      }

      // 通常の増加
      return {
        ...prev,
        usage: {
          ...prev.usage,
          [feature]: prev.usage[feature] + 1,
        },
      }
    })
  }

  const canPerformAnalysis = (feature: keyof UsageData = "personalAnalysis"): boolean => {
    const limits = PLAN_LIMITS[preferences.plan]
    const limit = limits[feature]

    // 無制限の場合
    if (limit === -1) return true

    // 制限チェック
    return preferences.usage[feature] < limit
  }

  const getRemainingAnalyses = (feature: keyof UsageData = "personalAnalysis"): number => {
    const limits = PLAN_LIMITS[preferences.plan]
    const limit = limits[feature]

    // 無制限の場合
    if (limit === -1) return -1

    return Math.max(0, limit - preferences.usage[feature])
  }

  const isTrialActive = (): boolean => {
    if (!preferences.trialStartDate || !preferences.trialEndDate) return false

    const now = new Date()
    const endDate = new Date(preferences.trialEndDate)

    return now <= endDate
  }

  const getTrialDaysRemaining = (): number => {
    if (!preferences.trialEndDate) return 0

    const now = new Date()
    const endDate = new Date(preferences.trialEndDate)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  const getCurrentPlan = (): "free" | "basic" | "premium" => {
    return preferences.plan
  }

  const getTodayUsage = (): UsageData | null => {
    const today = new Date().toISOString().split("T")[0]

    // 今日の使用状況でない場合はnullを返す
    if (preferences.usage.date !== today) {
      return null
    }

    return preferences.usage
  }

  const resetDailyUsage = () => {
    setPreferences((prev) => ({
      ...prev,
      usage: createDefaultUsage(),
    }))
  }

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    incrementUsage,
    canPerformAnalysis,
    getRemainingAnalyses,
    isTrialActive,
    getTrialDaysRemaining,
    getCurrentPlan,
    getTodayUsage,
    resetDailyUsage,
  }

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider")
  }
  return context
}
