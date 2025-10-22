"use client"

import { useEffect } from "react"
import { ErrorDiagnostics } from "@/lib/error-diagnostics"

export function ErrorMonitor() {
  useEffect(() => {
    // 開発環境でのみエラー監視を有効化
    if (process.env.NODE_ENV === "development") {
      ErrorDiagnostics.monitorDOMOperations()
      ErrorDiagnostics.checkSyntaxErrors()
    }
  }, [])

  return null // UIは表示しない
}
