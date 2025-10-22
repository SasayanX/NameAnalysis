"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { analyzeNameFortuneCustom } from "@/lib/name-data-simple-custom"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { calculateNumerology } from "@/lib/numerology"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { performanceOptimizer } from "@/lib/performance-optimizer"

export interface OptimizedNameAnalysisState {
  lastName: string
  firstName: string
  gender: "male" | "female"
  birthdate: Date | null
  birthdateString: string
  results: any
  advancedResults: any
  sixStar: any
  numerologyResults: any
  isLoading: boolean
  error: string | null
}

export function useOptimizedNameAnalysis() {
  const [state, setState] = useState<OptimizedNameAnalysisState>({
    lastName: "",
    firstName: "",
    gender: "male",
    birthdate: null,
    birthdateString: "",
    results: null,
    advancedResults: null,
    sixStar: null,
    numerologyResults: null,
    isLoading: false,
    error: null,
  })

  const { fortuneData } = useFortuneData()
  const abortControllerRef = useRef<AbortController | null>(null)

  // メモ化されたupdateField関数
  const updateField = useCallback(
    <K extends keyof OptimizedNameAnalysisState>(field: K, value: OptimizedNameAnalysisState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  // メモ化されたキャッシュキー生成
  const cacheKey = useMemo(() => {
    return `${state.lastName}-${state.firstName}-${state.gender}-${state.birthdateString}`
  }, [state.lastName, state.firstName, state.gender, state.birthdateString])

  // 最適化された日付処理
  const handleBirthdateChange = useCallback(
    (dateString: string) => {
      updateField("birthdateString", dateString)

      try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          updateField("birthdate", date)
          updateField("error", null)
        } else {
          updateField("birthdate", null)
        }
      } catch (error) {
        console.error("Error parsing date:", error)
        updateField("birthdate", null)
        updateField("error", "日付の形式が正しくありません")
      }
    },
    [updateField],
  )

  // 最適化された分析関数
  const analyzePersonName = useCallback(async () => {
    if (!state.lastName || !state.firstName) {
      updateField("error", "姓名を入力してください")
      return
    }

    // 進行中の処理をキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // キャッシュから結果を取得
    const cachedResult = performanceOptimizer.getCachedResult(cacheKey)
    if (cachedResult) {
      console.log("✅ Using cached result")
      updateField("results", cachedResult.results)
      updateField("advancedResults", cachedResult.advancedResults)
      updateField("sixStar", cachedResult.sixStar)
      updateField("numerologyResults", cachedResult.numerologyResults)
      return
    }

    updateField("isLoading", true)
    updateField("error", null)

    try {
      // 並列処理で最適化
      const analysisPromises = []

      // 基本的な姓名判断
      analysisPromises.push(
        performanceOptimizer.measurePerformance("name_analysis", () =>
          analyzeNameFortuneCustom(state.lastName, state.firstName, fortuneData, state.gender),
        ),
      )

      // 数秘術計算
      const fullName = `${state.lastName}${state.firstName}`
      analysisPromises.push(
        performanceOptimizer.measurePerformance("numerology", () => calculateNumerology(fullName, state.birthdate)),
      )

      // 六星占術（生年月日がある場合のみ）
      if (state.birthdate) {
        analysisPromises.push(
          performanceOptimizer.measurePerformance("six_star", () => calculateSixStarFromCSV(state.birthdate!)),
        )
      } else {
        analysisPromises.push(Promise.resolve(null))
      }

      // 五行分析
      analysisPromises.push(
        performanceOptimizer.measurePerformance("gogyo", () =>
          calculateGogyo(state.lastName, state.firstName, state.birthdate),
        ),
      )

      // 並列実行
      const [analysisResults, numerologyResults, sixStarResult, gogyoResult] = await Promise.all(analysisPromises)

      // 中断チェック
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      // 高度な結果の構築
      let advancedResults = null
      if (state.birthdate) {
        advancedResults = {
          hasBirthdate: true,
          sixStar: sixStarResult,
          fiveElements: {
            elements: {
              woodCount: gogyoResult.elements.wood,
              fireCount: gogyoResult.elements.fire,
              earthCount: gogyoResult.elements.earth,
              metalCount: gogyoResult.elements.metal,
              waterCount: gogyoResult.elements.water,
              dominantElement: gogyoResult.dominantElement,
              weakElement: gogyoResult.weakElement,
            },
            healthAdvice: {
              generalAdvice: `あなたは${gogyoResult.dominantElement}の気が強く、${gogyoResult.weakElement}の気が弱い傾向があります。`,
              weeklyHealthForecast: [],
              balanceAdvice: `バランスを整えるには、${gogyoResult.weakElement}の気を高める活動を取り入れると良いでしょう。`,
            },
          },
          gogyoResult,
        }
      } else {
        advancedResults = {
          hasBirthdate: false,
          fiveElements: {
            elements: {
              woodCount: gogyoResult.elements.wood,
              fireCount: gogyoResult.elements.fire,
              earthCount: gogyoResult.elements.earth,
              metalCount: gogyoResult.elements.metal,
              waterCount: gogyoResult.elements.water,
              dominantElement: gogyoResult.dominantElement,
              weakElement: gogyoResult.weakElement,
            },
            healthAdvice: {
              generalAdvice: `あなたは${gogyoResult.dominantElement}の気が強く、${gogyoResult.weakElement}の気が弱い傾向があります。`,
              weeklyHealthForecast: [],
              balanceAdvice: `バランスを整えるには、${gogyoResult.weakElement}の気を高める活動を取り入れると良いでしょう。`,
            },
          },
          gogyoResult,
        }
      }

      // 結果をキャッシュに保存
      const resultToCache = {
        results: analysisResults,
        advancedResults,
        sixStar: sixStarResult,
        numerologyResults,
      }
      performanceOptimizer.cacheResult(cacheKey, resultToCache)

      // 状態更新
      updateField("results", analysisResults)
      updateField("advancedResults", advancedResults)
      updateField("sixStar", sixStarResult)
      updateField("numerologyResults", numerologyResults)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Analysis was aborted")
        return
      }
      console.error("Error during analysis:", error)
      updateField("error", "分析中にエラーが発生しました")
    } finally {
      updateField("isLoading", false)
    }
  }, [state.lastName, state.firstName, state.gender, state.birthdate, fortuneData, updateField, cacheKey])

  // メモ化された計算値
  const fullName = useMemo(() => {
    return state.lastName && state.firstName ? `${state.lastName} ${state.firstName}` : ""
  }, [state.lastName, state.firstName])

  const hasValidInput = useMemo(() => {
    return Boolean(state.lastName.trim() && state.firstName.trim())
  }, [state.lastName, state.firstName])

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    ...state,
    updateField,
    handleBirthdateChange,
    analyzePersonName,
    fullName,
    hasValidInput,
    cleanup,
  }
}
