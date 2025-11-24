"use client"

import { useState, useCallback, useMemo } from "react"
import { analyzeCompanyName as analyzeCompanyNameFromAnalysis } from "@/lib/company-name-analysis"
import type { UsageTracker } from "@/lib/usage-tracker"

export interface CompanyAnalysisState {
  companyName: string
  results: any
  isLoading: boolean
  error: string | null
}

export interface UseCompanyAnalysisOptions {
  usageTracker?: UsageTracker
  onUsageUpdate?: (usageStatus: any) => void
}

export function useCompanyAnalysis(options?: UseCompanyAnalysisOptions) {
  const { usageTracker, onUsageUpdate } = options || {}
  
  const [state, setState] = useState<CompanyAnalysisState>({
    companyName: "",
    results: null,
    isLoading: false,
    error: null,
  })

  // メモ化された更新関数
  const updateCompanyName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, companyName: name, error: null }))
  }, [])

  // メモ化された分析関数（ClientPage.tsxの実装に合わせる）
  const analyzeCompany = useCallback(() => {
    try {
      if (!state.companyName.trim()) {
        setState((prev) => ({ ...prev, error: "社名・商品名を入力してください" }))
        return
      }

      // 社名鑑定専用の計算を実行（company-name-analysisを使用）
      const companyResult = analyzeCompanyNameFromAnalysis(state.companyName)
      
      console.log("社名分析結果:", companyResult)
      setState((prev) => ({ ...prev, results: companyResult, error: null }))

      // usageTrackerとの統合
      if (usageTracker && usageTracker.incrementUsage("companyAnalysis")) {
        if (onUsageUpdate) {
          onUsageUpdate(usageTracker.getUsageStatus())
        }
      }
    } catch (error) {
      console.error("Error in company analysis:", error)
      setState((prev) => ({ ...prev, error: "分析中にエラーが発生しました" }))
    }
  }, [state.companyName, usageTracker, onUsageUpdate])

  // メモ化された計算値
  const hasValidInput = useMemo(() => {
    return Boolean(state.companyName.trim())
  }, [state.companyName])

  return {
    ...state,
    updateCompanyName,
    analyzeCompany,
    hasValidInput,
  }
}
