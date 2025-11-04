"use client"

import { useState, useCallback, useMemo } from "react"
import { analyzeNameFortuneCustom } from "@/lib/name-data-simple-custom"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { simpleCache } from "@/lib/simple-cache"

export interface NameAnalysisState {
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

export function useNameAnalysis() {
  const [state, setState] = useState<NameAnalysisState>({
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
  })

  const { fortuneData } = useFortuneData()

  // メモ化されたupdateField関数
  const updateField = useCallback(<K extends keyof NameAnalysisState>(field: K, value: NameAnalysisState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }, [])

  // メモ化された日付処理
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

  // キャッシュキーの生成をメモ化
  const cacheKey = useMemo(() => {
    return `${state.lastName}-${state.firstName}-${state.gender}-${state.birthdateString}`
  }, [state.lastName, state.firstName, state.gender, state.birthdateString])

  // メモ化された分析関数
  const analyzePersonName = useCallback(async () => {
    if (!state.lastName || !state.firstName) {
      updateField("error", "姓名を入力してください")
      return
    }

    // キャッシュから結果を取得
    const cachedResult = simpleCache.get(cacheKey)
    if (cachedResult) {
      updateField("results", cachedResult.results)
      updateField("advancedResults", cachedResult.advancedResults)
      updateField("sixStar", cachedResult.sixStar)
      return
    }

    updateField("isLoading", true)
    updateField("error", null)

    try {
      const analysisResults = analyzeNameFortuneCustom(state.lastName, state.firstName, fortuneData, state.gender)
      updateField("results", analysisResults)

      let sixStarResult = null
      let advancedResults = null

      if (state.birthdate) {
        sixStarResult = await calculateSixStarFromCSV(state.birthdate)
        updateField("sixStar", sixStarResult)

        const gogyoResult = calculateGogyo(state.lastName, state.firstName, state.birthdate)

        // グラフの実際の値から最大値と最小値を計算
        const elementArray = [
          { element: "木" as const, count: gogyoResult.elements.wood },
          { element: "火" as const, count: gogyoResult.elements.fire },
          { element: "土" as const, count: gogyoResult.elements.earth },
          { element: "金" as const, count: gogyoResult.elements.metal },
          { element: "水" as const, count: gogyoResult.elements.water },
        ]
        elementArray.sort((a, b) => b.count - a.count)
        const actualDominantElement = elementArray[0].element
        const actualWeakElement = elementArray[elementArray.length - 1].element

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
              dominantElement: actualDominantElement,
              weakElement: actualWeakElement,
            },
            healthAdvice: {
              generalAdvice: `あなたは${actualDominantElement}の気が強く、${actualWeakElement}の気が弱い傾向があります。`,
              weeklyHealthForecast: [],
              balanceAdvice: `バランスを整えるには、${actualWeakElement}の気を高める活動を取り入れると良いでしょう。`,
            },
          },
          gogyoResult,
        }
      } else {
        const gogyoResult = calculateGogyo(state.lastName, state.firstName)

        advancedResults = {
          hasBirthdate: false,
          fiveElements: {
            elements: {
              woodCount: gogyoResult.elements.wood,
              fireCount: gogyoResult.elements.metal,
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

      updateField("advancedResults", advancedResults)

      // 結果をキャッシュに保存
      simpleCache.set(cacheKey, {
        results: analysisResults,
        advancedResults,
        sixStar: sixStarResult,
      })
    } catch (error) {
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

  return {
    ...state,
    updateField,
    handleBirthdateChange,
    analyzePersonName,
    fullName,
    hasValidInput,
  }
}
