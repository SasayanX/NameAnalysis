"use client"

import { useState, useEffect, useCallback } from "react"

export interface DragonBreathItem {
  id: string
  type: string
  is_used: boolean
  obtained_at: string
  [key: string]: any
}

export interface UseDragonBreathOptions {
  currentPlan: "free" | "basic" | "premium"
}

export function useDragonBreath(options: UseDragonBreathOptions) {
  const { currentPlan } = options

  const [availableDragonBreathItems, setAvailableDragonBreathItems] = useState<DragonBreathItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 龍の息吹アイテムを取得
  const fetchDragonBreathItems = useCallback(async () => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) {
      setAvailableDragonBreathItems([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dragon-breath/items?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setAvailableDragonBreathItems(data.items || [])
      } else {
        setError(data.error || "アイテムの取得に失敗しました")
        setAvailableDragonBreathItems([])
      }
    } catch (err) {
      console.error("Failed to fetch Dragon's Breath items:", err)
      setError("アイテムの取得に失敗しました")
      setAvailableDragonBreathItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初期ロード時とプラン変更時にアイテムを取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchDragonBreathItems()
    }
  }, [currentPlan, fetchDragonBreathItems])

  // アイテムを使用する関数
  const useItem = useCallback(
    async (itemId: string) => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) {
        return { success: false, error: "ログインが必要です" }
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/dragon-breath/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, itemId }),
        })
        const result = await response.json()

        if (result.success) {
          // 使用成功したらアイテムリストを更新
          setAvailableDragonBreathItems(result.remainingItems || [])
          return {
            success: true,
            remainingItems: result.remainingItems || [],
            count: result.count,
            limit: result.limit,
          }
        } else {
          setError(result.error || "アイテムの使用に失敗しました")
          return { success: false, error: result.error || "アイテムの使用に失敗しました" }
        }
      } catch (err: any) {
        console.error("❌ 龍の息吹使用エラー:", err)
        const errorMessage = err.message || "アイテムの使用に失敗しました"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // アイテム数を取得
  const itemCount = availableDragonBreathItems.length

  // アイテムがあるかどうか
  const hasItems = itemCount > 0

  // プラン別の龍の息吹使用回数
  const PLAN_USAGE_COUNTS = {
    free: 1,
    basic: 2,
    premium: 3,
  } as const

  const usageCount = PLAN_USAGE_COUNTS[currentPlan] || 1

  return {
    availableDragonBreathItems,
    isLoading,
    error,
    itemCount,
    hasItems,
    usageCount,
    fetchDragonBreathItems,
    useItem,
    setAvailableDragonBreathItems,
  }
}

