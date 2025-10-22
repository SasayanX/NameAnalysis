"use client"

import { useState, useCallback, useMemo } from "react"
import { analyzeCompanyName } from "@/lib/company-name-analyzer"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { simpleCache } from "@/lib/simple-cache"

export interface CompanyAnalysisState {
  companyName: string
  results: any
  isLoading: boolean
  error: string | null
}

export function useCompanyAnalysis() {
  const [state, setState] = useState<CompanyAnalysisState>({
    companyName: "",
    results: null,
    isLoading: false,
    error: null,
  })

  const { fortuneData } = useFortuneData()

  // メモ化された更新関数
  const updateCompanyName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, companyName: name, error: null }))
  }, [])

  // キャッシュキーの生成をメモ化
  const cacheKey = useMemo(() => {
    return `company-${state.companyName}`
  }, [state.companyName])

  // メモ化された分析関数
  const analyzeCompany = useCallback(async () => {
    if (!state.companyName.trim()) {
      setState((prev) => ({ ...prev, error: "社名・商品名を入力してください" }))
      return
    }

    // キャッシュから結果を取得
    const cachedResult = simpleCache.get(cacheKey)
    if (cachedResult) {
      setState((prev) => ({ ...prev, results: cachedResult }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const analysisResults = analyzeCompanyName(state.companyName, fortuneData)
      setState((prev) => ({ ...prev, results: analysisResults }))

      // 結果をキャッシュに保存
      simpleCache.set(cacheKey, analysisResults)
    } catch (error) {
      console.error("Error during company analysis:", error)
      setState((prev) => ({ ...prev, error: "分析中にエラーが発生しました" }))
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [state.companyName, fortuneData, cacheKey])

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
