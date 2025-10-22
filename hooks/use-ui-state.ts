"use client"

import { useState, useCallback, useMemo } from "react"
import type { StarPersonType } from "@/lib/fortune-flow-calculator"

export type PremiumLevel = 0 | 1 | 2 | 3
export type ActiveSection = "fortune" | "compatibility" | "baby-naming"
export type NameType = "person" | "company"
export type ActiveTab = "simple" | "detailed" | "advanced" | "ranking" | "fortune-flow"

export interface UIState {
  activeSection: ActiveSection
  nameType: NameType
  activeTab: ActiveTab
  premiumLevel: PremiumLevel
  showBirthdateInput: boolean
  showPremiumMessage: boolean
  showDetailedMessage: boolean
  selectedStarType: StarPersonType
  calculatedStarType: string
  tabsKey: number
  forceUpdateKey: number
}

export function useUIState() {
  const [state, setState] = useState<UIState>({
    activeSection: "fortune",
    nameType: "person",
    activeTab: "simple",
    premiumLevel: 0,
    showBirthdateInput: false,
    showPremiumMessage: false,
    showDetailedMessage: false,
    selectedStarType: "木星人-",
    calculatedStarType: "",
    tabsKey: Date.now(),
    forceUpdateKey: 0,
  })

  const updateState = useCallback(<K extends keyof UIState>(field: K, value: UIState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const cyclePremiumLevel = useCallback(() => {
    const nextLevel = ((state.premiumLevel + 1) % 4) as PremiumLevel
    setState((prev) => ({
      ...prev,
      premiumLevel: nextLevel,
      showPremiumMessage: false,
      showDetailedMessage: false,
    }))
  }, [state.premiumLevel])

  const handleStarTypeChange = useCallback((starType: StarPersonType) => {
    setState((prev) => ({
      ...prev,
      selectedStarType: starType,
      forceUpdateKey: prev.forceUpdateKey + 1,
      tabsKey: Date.now(),
    }))
  }, [])

  const forceUpdate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      forceUpdateKey: prev.forceUpdateKey + 1,
      tabsKey: Date.now(),
    }))
  }, [])

  // メモ化された計算値
  const premiumButtonText = useMemo(() => {
    const texts = ["無料プラン", "ベーシック会員 (110円)", "プロ会員 (330円)", "プレミアム会員 (550円)"]
    return texts[state.premiumLevel] || "会員プラン選択"
  }, [state.premiumLevel])

  const premiumButtonStyle = useMemo(() => {
    const styles = [
      "bg-white hover:bg-gray-100 text-gray-800",
      "bg-blue-500 hover:bg-blue-600 text-white",
      "bg-purple-500 hover:bg-purple-600 text-white",
      "bg-amber-500 hover:bg-amber-600 text-white",
    ]
    return styles[state.premiumLevel] || ""
  }, [state.premiumLevel])

  const getButtonClass = useCallback((condition: boolean, baseClass = "px-6 py-2 rounded-none") => {
    return condition ? `${baseClass} bg-indigo-50 text-indigo-600 font-medium` : baseClass
  }, [])

  return {
    ...state,
    updateState,
    cyclePremiumLevel,
    handleStarTypeChange,
    forceUpdate,
    premiumButtonText,
    premiumButtonStyle,
    getButtonClass,
  }
}
