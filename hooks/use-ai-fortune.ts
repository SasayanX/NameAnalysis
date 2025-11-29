"use client"

import { useState, useEffect, useCallback } from "react"

export interface AiFortuneUsage {
  count: number
  limit: number
}

export interface AiFortuneResult {
  success: boolean
  error?: string
  details?: any
  aiFortune?: any
  kotodama?: any
  targetName?: string
  [key: string]: any // その他のプロパティも許可
}

export interface UseAiFortuneOptions {
  currentPlan: "free" | "basic" | "premium"
  availableDragonBreathItems?: any[]
  onShowPremiumDragonBreathDialog?: () => void
  onShowConfirmDialog?: () => void
  onUpdateDragonBreathItems?: (items: any[]) => void
}

export function useAiFortune(options: UseAiFortuneOptions) {
  const {
    currentPlan,
    availableDragonBreathItems = [],
    onShowPremiumDragonBreathDialog,
    onShowConfirmDialog,
    onUpdateDragonBreathItems,
  } = options

  const [aiFortune, setAiFortune] = useState<AiFortuneResult | null>(null)
  const [isLoadingAiFortune, setIsLoadingAiFortune] = useState(false)
  // プレミアムプランの場合は初期値limit=1、それ以外は0
  const [aiFortuneUsage, setAiFortuneUsage] = useState<AiFortuneUsage>({ 
    count: 0, 
    limit: currentPlan === 'premium' ? 1 : 0 
  })

  // AI鑑定使用回数を取得
  useEffect(() => {
    const fetchAiFortuneUsage = async () => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) return

      try {
        const response = await fetch(`/api/ai-fortune/usage?userId=${userId}&plan=${currentPlan}`)
        const data = await response.json()
        if (data.success) {
          setAiFortuneUsage({ count: data.count, limit: data.limit })
        }
      } catch (error) {
        console.error("Failed to fetch AI fortune usage:", error)
      }
    }

    if (typeof window !== "undefined") {
      fetchAiFortuneUsage()
    }
  }, [currentPlan])

  // 実際のAI鑑定生成処理（使用回数チェックなし）
  const executeAiFortuneGeneration = useCallback(
    async (nameAnalysisResult: any, gogyoResult?: any, birthdate?: string) => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) {
        setAiFortune({ success: false, error: "ログインが必要です" })
        return
      }

      setIsLoadingAiFortune(true)
      setAiFortune(null)

      try {
        console.log("🤖 AI鑑定生成開始:", {
          name: nameAnalysisResult?.name,
          categories: nameAnalysisResult?.categories?.length || 0,
          gogyoResult: !!gogyoResult,
          birthdate,
          userId,
        })

        const response = await fetch("/api/ai/generate-fortune", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameAnalysisResult,
            gogyoResult,
            birthdate,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorData: any
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` }
          }
          console.error("❌ AI鑑定生成エラー:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            fullResponse: errorText,
          })
          setAiFortune({
            success: false,
            error: errorData.error || `AI鑑定の生成に失敗しました (${response.status})`,
            details: errorData.details,
          })
          return
        }

        const data = await response.json()

        // 【重要】成功していない場合（success: false）は使用回数をカウントしない
        if (!data.success) {
          console.error("❌ AI鑑定生成失敗:", data)
          setAiFortune({
            success: false,
            error: data.error || "AI鑑定の生成に失敗しました",
            details: data.details,
          })
          return // 使用回数をカウントせずに終了
        }

        console.log("✅ AI鑑定生成成功:", data)

        // 成功した場合のみ、使用回数をインクリメント
        try {
          await fetch("/api/ai-fortune/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, increment: 1, plan: currentPlan }),
          })
          setAiFortuneUsage((prev) => ({ ...prev, count: prev.count + 1 }))
        } catch (usageError) {
          console.error("⚠️ 使用回数の更新に失敗しましたが、AI鑑定結果は表示します:", usageError)
          // 使用回数の更新に失敗しても、AI鑑定結果は表示する
        }

        // 氏名情報を保存（姓名判断結果が変更されたかチェックするため）
        const targetName =
          nameAnalysisResult?.name ||
          (nameAnalysisResult?.lastName && nameAnalysisResult?.firstName
            ? `${nameAnalysisResult.lastName}${nameAnalysisResult.firstName}`
            : null)
        setAiFortune({
          ...data,
          targetName: targetName,
        })
      } catch (error: any) {
        console.error("❌ AI鑑定生成エラー:", error)
        setAiFortune({
          success: false,
          error: error.message || "AI鑑定の生成に失敗しました",
        })
      } finally {
        setIsLoadingAiFortune(false)
      }
    },
    [currentPlan]
  )

  // AI鑑定を依頼する関数（使用回数チェックあり）
  const generateAiFortune = useCallback(
    async (nameAnalysisResult: any, gogyoResult?: any, birthdate?: string) => {
      console.log("🔵 generateAiFortune called:", {
        hasNameAnalysisResult: !!nameAnalysisResult,
        hasGogyoResult: !!gogyoResult,
        birthdate,
      })
      
      // userIdを取得、存在しない場合は生成（開発環境対応）
      let userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      
      if (!userId && typeof window !== "undefined") {
        // 開発環境では、userIdが存在しない場合に自動生成
        userId = `dev-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem("userId", userId)
        console.log("⚠️ userId not found, generated new userId:", userId)
      }
      
      console.log("🔵 userId check:", { userId, hasUserId: !!userId })
      
      if (!userId) {
        console.error("❌ generateAiFortune: userId not found and could not generate")
        setAiFortune({ success: false, error: "ユーザーIDの取得に失敗しました" })
        return
      }

      // 【重要】最新の使用回数を取得（姓名判断を繰り返す場合に備えて）
      let currentUsage = aiFortuneUsage.count
      let currentLimit = aiFortuneUsage.limit
      let usageCheckFailed = false
      
      try {
        const usageResponse = await fetch(`/api/ai-fortune/usage?userId=${userId}&plan=${currentPlan}`)
        if (!usageResponse.ok) {
          const errorText = await usageResponse.text()
          console.error("❌ AI鑑定使用回数取得エラー:", {
            status: usageResponse.status,
            statusText: usageResponse.statusText,
            error: errorText,
          })
          usageCheckFailed = true
        } else {
          const usageData = await usageResponse.json()
          if (usageData.success) {
            currentUsage = usageData.count
            currentLimit = usageData.limit
            setAiFortuneUsage({ count: usageData.count, limit: usageData.limit })
            console.log("🔍 AI鑑定使用回数チェック:", {
              currentUsage,
              currentLimit,
              canUse: currentUsage < currentLimit,
              remaining: currentLimit - currentUsage,
            })
          } else {
            console.error("❌ AI鑑定使用回数取得失敗:", usageData)
            usageCheckFailed = true
          }
        }
      } catch (error: any) {
        console.error("❌ Failed to fetch latest AI fortune usage:", error)
        usageCheckFailed = true
      }
      
      // 使用回数チェックに失敗した場合は、既存の状態を使用して続行
      // （データベース接続エラーの場合でも、フロントエンドの状態で判定）

      // 使用回数チェック：使用可能回数（limit - count）が0以上の場合のみ鑑定可能
      const remainingCount = currentLimit - currentUsage
      console.log("🔵 Usage check:", {
        currentUsage,
        currentLimit,
        remainingCount,
        canProceed: remainingCount > 0,
        usageCheckFailed,
      })
      
      if (remainingCount <= 0) {
        console.warn("⚠️ generateAiFortune: Usage limit reached", {
          currentUsage,
          currentLimit,
          remainingCount,
        })
        // 使用回数が0の場合
        if (currentPlan === "premium") {
          // プレミアムプラン：龍の息吹があれば使用を促す
          if (availableDragonBreathItems && availableDragonBreathItems.length > 0) {
            onShowPremiumDragonBreathDialog?.()
          } else {
            setAiFortune({
              success: false,
              error: `AI深層言霊鑑定は1日${currentLimit}回までです。龍の息吹を購入して回数を回復できます。`,
            })
          }
        } else {
          // 無料・ベーシックプラン：龍の息吹があれば使用を促す
          if (availableDragonBreathItems && availableDragonBreathItems.length > 0) {
            onShowConfirmDialog?.()
          } else {
            setAiFortune({
              success: false,
              error: "AI深層言霊鑑定はプレミアムプラン、または龍の息吹が必要です。",
            })
          }
        }
        return
      }

      // 実際の鑑定処理を実行
      await executeAiFortuneGeneration(nameAnalysisResult, gogyoResult, birthdate)
    },
    [currentPlan, aiFortuneUsage, availableDragonBreathItems, executeAiFortuneGeneration, onShowPremiumDragonBreathDialog, onShowConfirmDialog]
  )

  // 龍の息吹を使用してから鑑定を実行する関数
  const useDragonBreathAndGenerateFortune = useCallback(
    async (nameAnalysisResult: any, gogyoResult?: any, birthdate?: string) => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!userId) {
        setAiFortune({ success: false, error: "ログインが必要です" })
        return
      }

      if (!availableDragonBreathItems || availableDragonBreathItems.length === 0) {
        setAiFortune({ success: false, error: "龍の息吹がありません。" })
        setIsLoadingAiFortune(false)
        return
      }

      if (!availableDragonBreathItems[0] || !availableDragonBreathItems[0].id) {
        setAiFortune({ success: false, error: "龍の息吹の情報が不正です。" })
        setIsLoadingAiFortune(false)
        return
      }

      setIsLoadingAiFortune(true)

      try {
        // 龍の息吹を使用（プランはサーバー側でデータベースから取得）
        const useResponse = await fetch("/api/dragon-breath/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, itemId: availableDragonBreathItems[0]?.id }),
        })
        const useResult = await useResponse.json()

        if (!useResult.success) {
          // 残り回数がある場合のエラーメッセージを分かりやすく
          if (useResult.remaining && useResult.remaining > 0) {
            setAiFortune({ 
              success: false, 
              error: `残り${useResult.remaining}回の鑑定が可能です。龍の息吹は残り回数が0回の時のみ使用できます。` 
            })
          } else {
            setAiFortune({ success: false, error: useResult.error || "龍の息吹の使用に失敗しました" })
          }
          setIsLoadingAiFortune(false)
          return
        }

        // 使用成功したらアイテムリストを更新
        onUpdateDragonBreathItems?.(useResult.remainingItems || [])
        // 使用回数を更新（limit_per_dayが増える）
        setAiFortuneUsage((prev) => ({
          ...prev,
          count: useResult.count || prev.count,
          limit: useResult.limit || prev.limit,
        }))

        // 龍の息吹使用後、鑑定を実行（使用回数チェックなしの関数を呼び出す）
        await executeAiFortuneGeneration(nameAnalysisResult, gogyoResult, birthdate)
      } catch (error: any) {
        console.error("❌ 龍の息吹使用エラー:", error)
        setAiFortune({ success: false, error: error.message || "龍の息吹の使用に失敗しました" })
        setIsLoadingAiFortune(false)
      }
    },
    [availableDragonBreathItems, executeAiFortuneGeneration, onUpdateDragonBreathItems]
  )

  // AI鑑定結果をリセット
  const resetAiFortune = useCallback(() => {
    setAiFortune(null)
  }, [])

  return {
    aiFortune,
    isLoadingAiFortune,
    aiFortuneUsage,
    generateAiFortune,
    executeAiFortuneGeneration,
    useDragonBreathAndGenerateFortune,
    resetAiFortune,
    setAiFortuneUsage,
  }
}

