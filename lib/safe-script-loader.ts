// 安全なスクリプト読み込みのためのユーティリティ
export class SafeScriptLoader {
  private static loadedScripts = new Set<string>()

  // Service Workerを安全に登録
  static async registerServiceWorker(): Promise<void> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    try {
      await new Promise<void>((resolve) => {
        if (document.readyState === "loading") {
          window.addEventListener("load", () => resolve())
        } else {
          resolve()
        }
      })

      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("SW registered:", registration)
    } catch (error) {
      console.log("SW registration failed:", error)
    }
  }

  // スクリプトを安全に実行
  static safeExecute(code: string, context = "anonymous"): boolean {
    try {
      // 構文チェック
      new Function(code)

      // 実行
      const script = document.createElement("script")
      script.textContent = code
      script.setAttribute("data-context", context)

      document.head.appendChild(script)
      document.head.removeChild(script)

      return true
    } catch (error) {
      console.error(`Script execution failed in ${context}:`, error)
      return false
    }
  }

  // 外部スクリプトを安全に読み込み
  static async loadExternalScript(src: string): Promise<boolean> {
    if (this.loadedScripts.has(src)) {
      return true
    }

    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = src
      script.async = true

      script.onload = () => {
        this.loadedScripts.add(src)
        resolve(true)
      }

      script.onerror = () => {
        console.error(`Failed to load script: ${src}`)
        resolve(false)
      }

      document.head.appendChild(script)
    })
  }
}

// ブラウザ環境でのみ実行
if (typeof window !== "undefined") {
  // DOMContentLoaded後にService Workerを登録
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      SafeScriptLoader.registerServiceWorker()
    })
  } else {
    SafeScriptLoader.registerServiceWorker()
  }
}
