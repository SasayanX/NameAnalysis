// 核となる型定義を統一
export interface NameAnalysisInput {
  lastName: string
  firstName: string
  gender: "male" | "female"
  birthdate?: Date
}

export interface FortuneCategory {
  name: string
  score: number
  description: string
  fortune: string
  explanation: string
  strokeCount: number
}

export interface CharacterDetail {
  name: string
  character: string
  strokes: number
  isReisuu: boolean
}

export interface FortuneDetail {
  運勢: string
  説明: string
}

// 統一されたNameAnalysisResult型
export interface NameAnalysisResult {
  totalScore: number
  categories: FortuneCategory[]
  characterDetails: CharacterDetail[]
  advice: string
  ten: FortuneDetail
  jin: FortuneDetail
  chi: FortuneDetail
  gai: FortuneDetail
  total: FortuneDetail
  tenFormat: number
  jinFormat: number
  chiFormat: number
  gaiFormat: number
  totalFormat: number
  // 追加の共通プロパティ
  name: string
  gender?: "male" | "female"
  isPremium?: boolean
  isPro?: boolean
}

export interface SixStarResult {
  star: string
  type: string
  starType: string
  year: number
  month: number
  day: number
}

// エラー型の定義
export interface AnalysisError {
  code: string
  message: string
  details?: any
}

// 設定型の定義
export interface AppConfig {
  premiumLevel: 0 | 1 | 2 | 3
  usageCount: number
  lastUsedDate: string | null
}
