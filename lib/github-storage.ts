// GitHub APIを使用した永続化（無料オプション）

interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch?: string
}

export class GitHubStorage {
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || "main",
    }
  }

  async saveStrokeData(data: Record<string, number>): Promise<boolean> {
    try {
      const content = `// 自動生成された画数データ
// 最終更新: ${new Date().toISOString()}

export const customStrokeData: Record<string, number> = ${JSON.stringify(data, null, 2)}
`

      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/lib/stroke-data/user-custom.ts`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${this.config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Update custom stroke data - ${Object.keys(data).length} characters`,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: this.config.branch,
            // SHA is required for updates - would need to get current file first
          }),
        },
      )

      return response.ok
    } catch (error) {
      console.error("GitHub storage error:", error)
      return false
    }
  }

  async loadStrokeData(): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/lib/stroke-data/user-custom.ts?ref=${this.config.branch}`,
      )

      if (!response.ok) return null

      const data = await response.json()
      const content = atob(data.content)

      // Extract data from the file content
      const match = content.match(/export const customStrokeData[^=]*=\s*({[\s\S]*?})/m)
      if (match) {
        return JSON.parse(match[1])
      }

      return null
    } catch (error) {
      console.error("GitHub load error:", error)
      return null
    }
  }
}
