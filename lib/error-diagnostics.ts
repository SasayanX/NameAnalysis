// エラー診断とデバッグ支援
export class ErrorDiagnostics {
  static logDetailedError(error: Error, context?: string) {
    console.group(`🚨 Error Diagnostics: ${context || "Unknown Context"}`)
    console.error("Error Message:", error.message)
    console.error("Error Stack:", error.stack)
    console.error("Error Name:", error.name)
    console.error("Timestamp:", new Date().toISOString())

    // ブラウザ情報
    console.log("Browser Info:", {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
    })

    // ページ情報
    console.log("Page Info:", {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
    })

    console.groupEnd()
  }

  static checkSyntaxErrors() {
    // 動的に生成されるスクリプトの構文チェック
    const scripts = document.querySelectorAll("script")
    scripts.forEach((script, index) => {
      if (script.innerHTML) {
        try {
          // 構文チェック（実行はしない）
          new Function(script.innerHTML)
        } catch (error) {
          console.error(`Syntax error in script ${index}:`, error)
          console.log("Script content:", script.innerHTML)
        }
      }
    })
  }

  static monitorDOMOperations() {
    // DOM操作の監視
    const originalAppendChild = Node.prototype.appendChild
    Node.prototype.appendChild = function (child) {
      try {
        return originalAppendChild.call(this, child)
      } catch (error) {
        console.error("appendChild error:", error)
        console.log("Parent node:", this)
        console.log("Child node:", child)
        throw error
      }
    }
  }
}

// グローバルエラーハンドラー
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    ErrorDiagnostics.logDetailedError(event.error, "Global Error Handler")
  })

  window.addEventListener("unhandledrejection", (event) => {
    ErrorDiagnostics.logDetailedError(new Error(event.reason), "Unhandled Promise Rejection")
  })
}
