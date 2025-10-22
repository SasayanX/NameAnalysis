// 実用的なデータ管理システム

export interface FortuneDataSet {
  fortuneData: Record<string, { 運勢: string; 説明: string }>
  fortuneExplanations: Record<string, any>
  timestamp?: string
}

// 環境変数からカスタムデータを取得
export function getCustomFortuneData(): FortuneDataSet | null {
  try {
    if (typeof window !== "undefined") {
      // クライアントサイドでは localStorage を使用
      const stored = localStorage.getItem("persistentFortuneData")
      return stored ? JSON.parse(stored) : null
    } else {
      // サーバーサイドでは環境変数を使用
      const customData = process.env.CUSTOM_FORTUNE_DATA
      return customData ? JSON.parse(customData) : null
    }
  } catch (error) {
    console.error("カスタムデータの取得に失敗:", error)
    return null
  }
}

// データをlocalStorageに永続保存
export function saveFortuneDataLocally(data: FortuneDataSet): boolean {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "persistentFortuneData",
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      )
      return true
    }
    return false
  } catch (error) {
    console.error("データの保存に失敗:", error)
    return false
  }
}

// データをエクスポート（環境変数設定用）
export function generateEnvVarData(data: FortuneDataSet): string {
  return JSON.stringify(data)
}
