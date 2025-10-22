// 共通の型定義を統一 - 重複を避けるためcore.tsから再エクスポート
export type { NameAnalysisResult } from './core'

export interface FortuneFlowTableProps {
  title?: string
  description?: string
  starPerson?: string
}

export interface FortuneSymbol {
  symbol: string
  meaning: string
  score: number
}

export interface ComponentError {
  message: string
  component: string
  timestamp: Date
}
