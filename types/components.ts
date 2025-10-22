import type React from "react"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"

export interface FortuneFlowTableProps {
  title?: string
  description?: string
  starPerson?: StarPersonType | string
}

export interface NameAnalysisResultProps {
  results: any
  name: string
  gender?: "male" | "female"
  isPremium?: boolean
  isPro?: boolean
}

export interface FortuneSymbol {
  symbol: string
  className: string
  meaning: string
  score: number
}

// エラーハンドリング用の型
export interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: any) => void
}

// 安全な実行結果の型
export type SafeResult<T> = {
  success: boolean
  data?: T
  error?: Error
}
