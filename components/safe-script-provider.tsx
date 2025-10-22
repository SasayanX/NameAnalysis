"use client"

import { useEffect } from "react"
import { SafeScriptLoader } from "@/lib/safe-script-loader"

export function SafeScriptProvider() {
  useEffect(() => {
    // Service Workerの安全な登録
    SafeScriptLoader.registerServiceWorker()

    // グローバルエラーハンドラーの設定
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error)

      // 構文エラーの場合は詳細をログ出力
      if (event.error?.name === "SyntaxError") {
        console.error("Syntax error details:", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
