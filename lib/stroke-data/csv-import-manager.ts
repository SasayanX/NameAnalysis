// CSV インポートデータ管理システム
// 複数のCSVインポートを統合管理します

export interface ImportSession {
  id: string
  name: string
  timestamp: string
  dataCount: number
  source: string
  data: Record<string, number>
}

export interface ConflictResolution {
  char: string
  currentValue: number
  newValue: number
  resolution: "keep_current" | "use_new" | "manual"
  manualValue?: number
}

// 複数のインポートセッションを管理
export class CsvImportManager {
  private sessions: ImportSession[] = []
  private conflicts: ConflictResolution[] = []

  constructor() {
    this.loadSessions()
  }

  // セッションを追加
  addSession(name: string, source: string, data: Record<string, number>): string {
    const id = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: ImportSession = {
      id,
      name,
      timestamp: new Date().toISOString(),
      dataCount: Object.keys(data).length,
      source,
      data,
    }

    this.sessions.push(session)
    this.saveSessions()
    return id
  }

  // 全セッションのデータを統合
  getMergedData(): Record<string, number> {
    const merged: Record<string, number> = {}
    const conflicts: ConflictResolution[] = []

    // セッションを時系列順にソート（古い順）
    const sortedSessions = [...this.sessions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    for (const session of sortedSessions) {
      for (const [char, strokes] of Object.entries(session.data)) {
        if (merged[char] !== undefined && merged[char] !== strokes) {
          // 競合を記録
          const existingConflict = conflicts.find((c) => c.char === char)
          if (!existingConflict) {
            conflicts.push({
              char,
              currentValue: merged[char],
              newValue: strokes,
              resolution: "use_new", // デフォルトは新しい値を使用
            })
          }
        }
        merged[char] = strokes // 新しい値で上書き
      }
    }

    this.conflicts = conflicts
    return merged
  }

  // 競合を取得
  getConflicts(): ConflictResolution[] {
    return this.conflicts
  }

  // 競合を解決
  resolveConflict(char: string, resolution: "keep_current" | "use_new" | "manual", manualValue?: number) {
    const conflict = this.conflicts.find((c) => c.char === char)
    if (conflict) {
      conflict.resolution = resolution
      if (resolution === "manual" && manualValue !== undefined) {
        conflict.manualValue = manualValue
      }
    }
  }

  // 競合解決後の最終データを取得
  getFinalData(): Record<string, number> {
    const merged = this.getMergedData()

    for (const conflict of this.conflicts) {
      switch (conflict.resolution) {
        case "keep_current":
          merged[conflict.char] = conflict.currentValue
          break
        case "use_new":
          merged[conflict.char] = conflict.newValue
          break
        case "manual":
          if (conflict.manualValue !== undefined) {
            merged[conflict.char] = conflict.manualValue
          }
          break
      }
    }

    return merged
  }

  // セッションを削除
  removeSession(id: string) {
    this.sessions = this.sessions.filter((s) => s.id !== id)
    this.saveSessions()
  }

  // 全セッションを取得
  getSessions(): ImportSession[] {
    return [...this.sessions]
  }

  // セッションをローカルストレージに保存
  private saveSessions() {
    if (typeof window !== "undefined") {
      localStorage.setItem("csvImportSessions", JSON.stringify(this.sessions))
    }
  }

  // セッションをローカルストレージから読み込み
  private loadSessions() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("csvImportSessions")
      if (saved) {
        try {
          this.sessions = JSON.parse(saved)
        } catch (error) {
          console.error("Failed to load import sessions:", error)
          this.sessions = []
        }
      }
    }
  }

  // 統計情報を取得
  getStats() {
    const totalSessions = this.sessions.length
    const totalChars = new Set()
    let totalImports = 0

    for (const session of this.sessions) {
      totalImports += session.dataCount
      Object.keys(session.data).forEach((char) => totalChars.add(char))
    }

    return {
      totalSessions,
      totalImports,
      uniqueChars: totalChars.size,
      conflicts: this.conflicts.length,
      lastImport:
        this.sessions.length > 0 ? Math.max(...this.sessions.map((s) => new Date(s.timestamp).getTime())) : null,
    }
  }

  // TypeScriptファイルを生成
  generateTypeScriptFile(): string {
    const finalData = this.getFinalData()
    const stats = this.getStats()

    return `// CSV インポートデータ統合ファイル
// 複数のCSVインポートセッションを統合したデータです
// 最終更新: ${new Date().toLocaleString("ja-JP")}

// 統合されたデータ
export const csvImportedData: Record<string, number> = {
${Object.entries(finalData)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([kanji, strokes]) => `  "${kanji}": ${strokes},`)
  .join("\n")}
}

// インポート統計
export const csvImportStats = {
  totalSessions: ${stats.totalSessions},
  totalImports: ${stats.totalImports},
  uniqueChars: ${stats.uniqueChars},
  conflicts: ${stats.conflicts},
  lastImport: ${stats.lastImport ? `"${new Date(stats.lastImport).toISOString()}"` : "null"},
  generatedAt: "${new Date().toISOString()}"
}

// インポートセッション履歴
export const importSessions = ${JSON.stringify(this.sessions, null, 2)}

// 競合解決履歴
export const conflictResolutions = ${JSON.stringify(this.conflicts, null, 2)}

// デバッグ用
console.log("CSV統合データ読み込み完了:", csvImportStats)
`
  }
}

// シングルトンインスタンス
export const csvImportManager = new CsvImportManager()
