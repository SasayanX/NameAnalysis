// ローカルストレージベースのデータ管理
export interface UserPreferences {
  theme: "light" | "dark" | "system"
  favoriteNames: string[]
  recentAnalyses: Array<{
    name: string
    date: string
    type: "person" | "company"
  }>
  premiumLevel: number // 0: 無料, 1-3: 有料プラン（デモ用）
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  favoriteNames: [],
  recentAnalyses: [],
  premiumLevel: 0,
}

export class LocalStorageManager {
  private static readonly PREFERENCES_KEY = "nameanalysis_preferences"
  private static readonly FORTUNE_DATA_KEY = "nameanalysis_fortune_data"

  static getPreferences(): UserPreferences {
    // SSR中は安全なデフォルト値を返す
    if (typeof window === "undefined") {
      return DEFAULT_PREFERENCES
    }

    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY)
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn("Failed to load preferences from localStorage:", error)
    }
    return DEFAULT_PREFERENCES
  }

  static savePreferences(preferences: Partial<UserPreferences>): void {
    if (typeof window === "undefined") return

    try {
      const current = this.getPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.warn("Failed to save preferences to localStorage:", error)
    }
  }

  static addRecentAnalysis(name: string, type: "person" | "company"): void {
    if (typeof window === "undefined") return

    const preferences = this.getPreferences()
    const newAnalysis = {
      name,
      date: new Date().toISOString(),
      type,
    }

    // 重複を削除し、最新を先頭に追加
    const filtered = preferences.recentAnalyses.filter((a) => a.name !== name)
    const updated = [newAnalysis, ...filtered].slice(0, 10) // 最大10件

    this.savePreferences({ recentAnalyses: updated })
  }

  static toggleFavoriteName(name: string): void {
    if (typeof window === "undefined") return

    const preferences = this.getPreferences()
    const favorites = preferences.favoriteNames

    if (favorites.includes(name)) {
      const updated = favorites.filter((n) => n !== name)
      this.savePreferences({ favoriteNames: updated })
    } else {
      const updated = [...favorites, name].slice(0, 20) // 最大20件
      this.savePreferences({ favoriteNames: updated })
    }
  }

  static setPremiumLevel(level: number): void {
    if (typeof window === "undefined") return
    this.savePreferences({ premiumLevel: level })
  }

  static clearAllData(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.PREFERENCES_KEY)
      localStorage.removeItem(this.FORTUNE_DATA_KEY)
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }
}
