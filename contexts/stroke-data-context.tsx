"use client"

import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from "react"

// 基本の漢字画数データ（一部）- これはユーザーが提供した初期データのみを含む
export const defaultStrokeData: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  // 他の基本漢字も同様に定義...
}

interface StrokeDataContextType {
  strokeData: Record<string, number>
  updateStrokeData: (kanji: string, strokeCount: number) => void
  removeStrokeData: (kanji: string) => void
  saveStrokeData: () => boolean
  resetToDefault: () => void
  isDataLoaded: boolean
  updateMultipleStrokeData: (newData: Record<string, number>) => void
  defaultStrokeData: Record<string, number>
  getStrokeCount: (kanji: string) => number
  debugInfo: string
}

const StrokeDataContext = createContext<StrokeDataContextType | undefined>(undefined)

// ローカルストレージのキー
const STROKE_DATA_KEY = "strokeData"

export function StrokeDataProvider({ children }: { children: ReactNode }) {
  // データが読み込まれたかどうかを追跡する状態
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // デバッグ情報
  const [debugInfo, setDebugInfo] = useState<string>("")

  // 漢字の画数データ - 初期値はデフォルトデータ
  const [strokeData, setStrokeData] = useState<Record<string, number>>(defaultStrokeData)

  // デバッグ情報を追加する関数
  const addDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString()
    setDebugInfo((prev) => `${prev}\n[${timestamp}] ${info}`)
    console.log(`[StrokeData] ${info}`)
  }, [])

  // 初期データの読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem(STROKE_DATA_KEY)
        addDebugInfo(`初期ロード: ローカルストレージからデータを読み込み中...`)

        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            addDebugInfo(`データ解析成功: ${Object.keys(parsedData).length}件のデータを読み込みました`)

            // 型チェックと変換を行う
            const validatedData: Record<string, number> = {}
            let invalidEntries = 0

            Object.entries(parsedData).forEach(([kanji, stroke]) => {
              // 数値に変換
              const strokeNum = typeof stroke === "number" ? stroke : Number(stroke)
              if (!isNaN(strokeNum)) {
                validatedData[kanji] = strokeNum
              } else {
                invalidEntries++
              }
            })

            if (invalidEntries > 0) {
              addDebugInfo(`警告: ${invalidEntries}件の無効なデータをスキップしました`)
            }

            // 有効なデータがあれば設定、なければデフォルトデータを使用
            if (Object.keys(validatedData).length > 0) {
              setStrokeData(validatedData)
              addDebugInfo(`有効なデータ: ${Object.keys(validatedData).length}件を設定しました`)
            } else {
              setStrokeData({ ...defaultStrokeData })
              addDebugInfo(`有効なデータがないため、デフォルトデータを使用: ${Object.keys(defaultStrokeData).length}件`)
            }
          } catch (e) {
            addDebugInfo(`エラー: データの解析に失敗しました - ${e}`)
            // パースに失敗した場合はデフォルト値を使用
            setStrokeData({ ...defaultStrokeData })
          }
        } else {
          // データがない場合はデフォルト値を使用
          addDebugInfo(
            `ローカルストレージにデータがないため、デフォルトデータを使用: ${Object.keys(defaultStrokeData).length}件`,
          )
          setStrokeData({ ...defaultStrokeData })
        }
      } catch (e) {
        addDebugInfo(`エラー: ローカルストレージからの読み込みに失敗しました - ${e}`)
        setStrokeData({ ...defaultStrokeData })
      } finally {
        setIsDataLoaded(true)
      }
    }
  }, [addDebugInfo])

  // データが変更されたときに自動的に保存
  useEffect(() => {
    if (isDataLoaded && typeof window !== "undefined" && Object.keys(strokeData).length > 0) {
      try {
        localStorage.setItem(STROKE_DATA_KEY, JSON.stringify(strokeData))
        addDebugInfo(`自動保存: ${Object.keys(strokeData).length}件のデータを保存しました`)
      } catch (e) {
        addDebugInfo(`エラー: 自動保存に失敗しました - ${e}`)
      }
    }
  }, [strokeData, isDataLoaded, addDebugInfo])

  // 漢字の画数を取得する関数（存在しない場合はデフォルト値を使用）
  const getStrokeCount = useCallback(
    (kanji: string): number => {
      // まず現在のデータから検索
      if (kanji in strokeData) {
        return strokeData[kanji]
      }
      // 次にデフォルトデータから検索
      if (kanji in defaultStrokeData) {
        return defaultStrokeData[kanji]
      }
      // どちらにも存在しない場合は0を返す
      return 0
    },
    [strokeData],
  )

  // 漢字の画数を更新
  const updateStrokeData = useCallback(
    (kanji: string, stroke: number) => {
      if (isNaN(stroke)) {
        addDebugInfo(`エラー: 無効な画数 - ${kanji}: ${stroke}`)
        return
      }

      setStrokeData((prev) => {
        const newData = { ...prev, [kanji]: stroke }
        addDebugInfo(`漢字更新: ${kanji} => ${stroke}画`)
        return newData
      })
    },
    [addDebugInfo],
  )

  // 複数漢字一括更新用の関数を追加
  const updateMultipleStrokeData = useCallback(
    (newData: Record<string, number>) => {
      // 無効なデータをフィルタリング
      const validData: Record<string, number> = {}
      let invalidCount = 0

      Object.entries(newData).forEach(([kanji, stroke]) => {
        const strokeNum = typeof stroke === "number" ? stroke : Number(stroke)
        if (!isNaN(strokeNum)) {
          validData[kanji] = strokeNum
        } else {
          invalidCount++
        }
      })

      if (invalidCount > 0) {
        addDebugInfo(`警告: 一括更新で${invalidCount}件の無効なデータをスキップしました`)
      }

      // 既存のデータを完全に置き換えるのではなく、マージする
      setStrokeData((prev) => {
        const merged = { ...prev, ...validData }
        addDebugInfo(
          `一括更新: 既存${Object.keys(prev).length}件 + 新規${Object.keys(validData).length}件 = 合計${Object.keys(merged).length}件`,
        )
        return merged
      })
    },
    [addDebugInfo],
  )

  // 漢字を削除
  const removeStrokeData = useCallback(
    (kanji: string) => {
      setStrokeData((prev) => {
        const newData = { ...prev }
        delete newData[kanji]
        addDebugInfo(`漢字削除: ${kanji}`)
        return newData
      })
    },
    [addDebugInfo],
  )

  // 変更を保存
  const saveStrokeData = useCallback(() => {
    try {
      // データが空でないことを確認
      if (Object.keys(strokeData).length === 0) {
        addDebugInfo(`警告: 空のデータを保存しようとしています。デフォルトデータを使用します。`)
        localStorage.setItem(STROKE_DATA_KEY, JSON.stringify(defaultStrokeData))
        setStrokeData({ ...defaultStrokeData })
        return true
      }

      const strokeDataString = JSON.stringify(strokeData)
      localStorage.setItem(STROKE_DATA_KEY, strokeDataString)
      addDebugInfo(`手動保存: ${Object.keys(strokeData).length}件のデータを保存しました`)

      // データの一部をログに出力
      const sampleData = Object.entries(strokeData)
        .slice(0, 5)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ")
      addDebugInfo(`保存データサンプル: ${sampleData}...`)

      return true
    } catch (e) {
      addDebugInfo(`エラー: データの保存に失敗しました - ${e}`)
      return false
    }
  }, [strokeData, addDebugInfo])

  // デフォルトデータにリセット
  const resetToDefault = useCallback(() => {
    const defaultCopy = { ...defaultStrokeData }
    setStrokeData(defaultCopy)
    localStorage.setItem(STROKE_DATA_KEY, JSON.stringify(defaultCopy))
    addDebugInfo(`リセット: デフォルトデータ(${Object.keys(defaultCopy).length}件)に戻しました`)
  }, [addDebugInfo])

  return (
    <StrokeDataContext.Provider
      value={{
        strokeData,
        updateStrokeData,
        updateMultipleStrokeData,
        removeStrokeData,
        saveStrokeData,
        resetToDefault,
        isDataLoaded,
        defaultStrokeData,
        getStrokeCount,
        debugInfo,
      }}
    >
      {children}
    </StrokeDataContext.Provider>
  )
}

export function useStrokeData() {
  const context = useContext(StrokeDataContext)
  if (context === undefined) {
    throw new Error("useStrokeData must be used within a StrokeDataProvider")
  }
  return context
}
