"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useMemo } from "react"
import { simpleCache } from "@/lib/simple-cache"

// 状態の型定義
interface AnalysisState {
  personal: {
    lastName: string
    firstName: string
    gender: "male" | "female"
    birthdate: Date | null
    birthdateString: string
    results: any
    advancedResults: any
    sixStar: any
    isLoading: boolean
    error: string | null
  }
  company: {
    companyName: string
    results: any
    isLoading: boolean
    error: string | null
  }
  ui: {
    activeTab: "personal" | "company"
    premiumLevel: number
    selectedStarType: string | null
    showFortuneFlow: boolean
  }
}

// アクションの型定義
type AnalysisAction =
  | { type: "SET_PERSONAL_FIELD"; field: keyof AnalysisState["personal"]; value: any }
  | { type: "SET_COMPANY_FIELD"; field: keyof AnalysisState["company"]; value: any }
  | { type: "SET_UI_FIELD"; field: keyof AnalysisState["ui"]; value: any }
  | { type: "SET_PERSONAL_RESULTS"; results: any; advancedResults?: any; sixStar?: any }
  | { type: "SET_COMPANY_RESULTS"; results: any }
  | { type: "SET_LOADING"; target: "personal" | "company"; loading: boolean }
  | { type: "SET_ERROR"; target: "personal" | "company"; error: string | null }
  | { type: "CLEAR_CACHE" }

// 初期状態
const initialState: AnalysisState = {
  personal: {
    lastName: "",
    firstName: "",
    gender: "male",
    birthdate: null,
    birthdateString: "",
    results: null,
    advancedResults: null,
    sixStar: null,
    isLoading: false,
    error: null,
  },
  company: {
    companyName: "",
    results: null,
    isLoading: false,
    error: null,
  },
  ui: {
    activeTab: "personal",
    premiumLevel: 1,
    selectedStarType: null,
    showFortuneFlow: false,
  },
}

// リデューサー
function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case "SET_PERSONAL_FIELD":
      return {
        ...state,
        personal: {
          ...state.personal,
          [action.field]: action.value,
        },
      }
    case "SET_COMPANY_FIELD":
      return {
        ...state,
        company: {
          ...state.company,
          [action.field]: action.value,
        },
      }
    case "SET_UI_FIELD":
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.field]: action.value,
        },
      }
    case "SET_PERSONAL_RESULTS":
      return {
        ...state,
        personal: {
          ...state.personal,
          results: action.results,
          advancedResults: action.advancedResults || state.personal.advancedResults,
          sixStar: action.sixStar || state.personal.sixStar,
          isLoading: false,
          error: null,
        },
      }
    case "SET_COMPANY_RESULTS":
      return {
        ...state,
        company: {
          ...state.company,
          results: action.results,
          isLoading: false,
          error: null,
        },
      }
    case "SET_LOADING":
      return {
        ...state,
        [action.target]: {
          ...state[action.target],
          isLoading: action.loading,
          error: action.loading ? null : state[action.target].error,
        },
      }
    case "SET_ERROR":
      return {
        ...state,
        [action.target]: {
          ...state[action.target],
          error: action.error,
          isLoading: false,
        },
      }
    case "CLEAR_CACHE":
      simpleCache.clear()
      return state
    default:
      return state
  }
}

// コンテキストの型定義
interface AnalysisContextType {
  state: AnalysisState
  dispatch: React.Dispatch<AnalysisAction>
  // 便利なヘルパー関数
  setPersonalField: (field: keyof AnalysisState["personal"], value: any) => void
  setCompanyField: (field: keyof AnalysisState["company"], value: any) => void
  setUIField: (field: keyof AnalysisState["ui"], value: any) => void
  clearCache: () => void
  // 計算されたプロパティ
  hasValidPersonalInput: boolean
  hasValidCompanyInput: boolean
  fullName: string
  personalCacheKey: string
  companyCacheKey: string
}

// コンテキストの作成
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

// プロバイダーコンポーネント
export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState)

  // ヘルパー関数をメモ化
  const setPersonalField = useCallback((field: keyof AnalysisState["personal"], value: any) => {
    dispatch({ type: "SET_PERSONAL_FIELD", field, value })
  }, [])

  const setCompanyField = useCallback((field: keyof AnalysisState["company"], value: any) => {
    dispatch({ type: "SET_COMPANY_FIELD", field, value })
  }, [])

  const setUIField = useCallback((field: keyof AnalysisState["ui"], value: any) => {
    dispatch({ type: "SET_UI_FIELD", field, value })
  }, [])

  const clearCache = useCallback(() => {
    dispatch({ type: "CLEAR_CACHE" })
  }, [])

  // 計算されたプロパティをメモ化
  const hasValidPersonalInput = useMemo(() => {
    return Boolean(state.personal.lastName.trim() && state.personal.firstName.trim())
  }, [state.personal.lastName, state.personal.firstName])

  const hasValidCompanyInput = useMemo(() => {
    return Boolean(state.company.companyName.trim())
  }, [state.company.companyName])

  const fullName = useMemo(() => {
    return state.personal.lastName && state.personal.firstName
      ? `${state.personal.lastName} ${state.personal.firstName}`
      : ""
  }, [state.personal.lastName, state.personal.firstName])

  const personalCacheKey = useMemo(() => {
    return `${state.personal.lastName}-${state.personal.firstName}-${state.personal.gender}-${state.personal.birthdateString}`
  }, [state.personal.lastName, state.personal.firstName, state.personal.gender, state.personal.birthdateString])

  const companyCacheKey = useMemo(() => {
    return `company-${state.company.companyName}`
  }, [state.company.companyName])

  // コンテキスト値をメモ化
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      setPersonalField,
      setCompanyField,
      setUIField,
      clearCache,
      hasValidPersonalInput,
      hasValidCompanyInput,
      fullName,
      personalCacheKey,
      companyCacheKey,
    }),
    [
      state,
      setPersonalField,
      setCompanyField,
      setUIField,
      clearCache,
      hasValidPersonalInput,
      hasValidCompanyInput,
      fullName,
      personalCacheKey,
      companyCacheKey,
    ],
  )

  return <AnalysisContext.Provider value={contextValue}>{children}</AnalysisContext.Provider>
}

// カスタムフック
export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider")
  }
  return context
}
