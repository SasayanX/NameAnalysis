// 複数の永続化オプションを統合した管理システム

import { LocalStorageManager } from "./local-storage"
import { GitHubStorage } from "./github-storage"

export type StorageMethod = "localStorage" | "github" | "supabase" | "vercelKV"

export interface StorageConfig {
  method: StorageMethod
  github?: {
    owner: string
    repo: string
    token: string
  }
  supabase?: {
    url: string
    key: string
  }
}

export class EnhancedStorageManager {
  private config: StorageConfig
  private githubStorage?: GitHubStorage

  constructor(config: StorageConfig) {
    this.config = config

    if (config.method === "github" && config.github) {
      this.githubStorage = new GitHubStorage(config.github)
    }
  }

  async saveStrokeData(data: Record<string, number>): Promise<{
    success: boolean
    method: StorageMethod
    message: string
  }> {
    switch (this.config.method) {
      case "localStorage":
        try {
          LocalStorageManager.savePreferences({
            customStrokeData: data,
          } as any)
          return {
            success: true,
            method: "localStorage",
            message: `${Object.keys(data).length}文字の画数データをローカルに保存しました`,
          }
        } catch (error) {
          return {
            success: false,
            method: "localStorage",
            message: "ローカル保存に失敗しました",
          }
        }

      case "github":
        if (!this.githubStorage) {
          return {
            success: false,
            method: "github",
            message: "GitHub設定が不完全です",
          }
        }

        const githubSuccess = await this.githubStorage.saveStrokeData(data)
        return {
          success: githubSuccess,
          method: "github",
          message: githubSuccess
            ? `${Object.keys(data).length}文字の画数データをGitHubに永続保存しました`
            : "GitHub保存に失敗しました",
        }

      default:
        return {
          success: false,
          method: this.config.method,
          message: "サポートされていない保存方法です",
        }
    }
  }

  async loadStrokeData(): Promise<Record<string, number> | null> {
    switch (this.config.method) {
      case "localStorage":
        const prefs = LocalStorageManager.getPreferences()
        return (prefs as any).customStrokeData || null

      case "github":
        if (!this.githubStorage) return null
        return await this.githubStorage.loadStrokeData()

      default:
        return null
    }
  }
}
