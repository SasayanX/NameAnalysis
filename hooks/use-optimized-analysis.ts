"use client"

import { useCallback } from "react"
import { useAnalysis } from "@/contexts/analysis-context"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { analyzeNameFortuneCustom } from "@/lib/name-data-simple-custom"
import { analyzeCompanyName } from "@/lib/company-name-analyzer"
import { calculateSixStarFromCSV } from "@/lib/six-star"
import { calculateGogyo } from "@/lib/advanced-gogyo"
import { simpleCache } from "@/lib/simple-cache"

export function useOptimizedAnalysis() {
  const { state, dispatch, personalCacheKey, companyCacheKey } = useAnalysis()
  const { fortuneData } = useFortuneData()

  // 個人名分析の最適化版
  const analyzePersonName = useCallback(async () => {
    const { personal } = state

    if (!personal.lastName || !personal.firstName) {
      dispatch({ type: "SET_ERROR", target: "personal", error: "姓名を入力してください" })
      return
    }

    // キャッシュから結果を取得
    const cachedResult = simpleCache.get(personalCacheKey)
    if (cachedResult) {
      dispatch({
        type: "SET_PERSONAL_RESULTS",
        results: cachedResult.results,
        advancedResults: cachedResult.advancedResults,
        sixStar: cachedResult.sixStar,
      })
      return
    }

    dispatch({ type: "SET_LOADING", target: "personal", loading: true })

    try {
      // 基本分析を並列実行
      const [analysisResults, gogyoResult] = await Promise.all([
        Promise.resolve(analyzeNameFortuneCustom(personal.lastName, personal.firstName, fortuneData, personal.gender)),
        Promise.resolve(calculateGogyo(personal.lastName, personal.firstName, personal.birthdate || undefined)),
      ])

      let sixStarResult = null
      if (personal.birthdate) {
        sixStarResult = await calculateSixStarFromCSV(personal.birthdate)
      }

      const advancedResults = {
        hasBirthdate: Boolean(personal.birthdate),
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

      // 結果をキャッシュに保存
      simpleCache.set(personalCacheKey, {
        results: analysisResults,
        advancedResults,
        sixStar: sixStarResult,
      })

      dispatch({
        type: "SET_PERSONAL_RESULTS",
        results: analysisResults,
        advancedResults,
        sixStar: sixStarResult,
      })
    } catch (error) {
      console.error("Error during analysis:", error)
      dispatch({ type: "SET_ERROR", target: "personal", error: "分析中にエラーが発生しました" })
    } finally {
      dispatch({ type: "SET_LOADING", target: "personal", loading: false })
    }
  }, [state.personal, personalCacheKey, fortuneData, dispatch])

  // 会社名分析の最適化版
  const analyzeCompany = useCallback(async () => {
    const { company } = state

    if (!company.companyName.trim()) {
      dispatch({ type: "SET_ERROR", target: "company", error: "社名・商品名を入力してください" })
      return
    }

    // キャッシュから結果を取得
    const cachedResult = simpleCache.get(companyCacheKey)
    if (cachedResult) {
      dispatch({ type: "SET_COMPANY_RESULTS", results: cachedResult })
      return
    }

    dispatch({ type: "SET_LOADING", target: "company", loading: true })

    try {
      const analysisResults = analyzeCompanyName(company.companyName, fortuneData)

      // 結果をキャッシュに保存
      simpleCache.set(companyCacheKey, analysisResults)

      dispatch({ type: "SET_COMPANY_RESULTS", results: analysisResults })
    } catch (error) {
      console.error("Error during company analysis:", error)
      dispatch({ type: "SET_ERROR", target: "company", error: "分析中にエラーが発生しました" })
    } finally {
      dispatch({ type: "SET_LOADING", target: "company", loading: false })
    }
  }, [state.company, companyCacheKey, fortuneData, dispatch])

  return {
    analyzePersonName,
    analyzeCompany,
  }
}
