"use client"

import { useState } from "react"
import { PatternComparisonTable } from "@/components/pattern-comparison-table"
import type { StarPersonType, FortuneType } from "@/lib/fortune-flow-calculator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function PatternValidatorPage() {
  const [showAlert, setShowAlert] = useState(false)

  // パターンが更新されたときの処理
  const handleUpdatePatterns = (patterns: Record<StarPersonType, FortuneType[]>) => {
    // 実際のアプリケーションでは、ここでグローバルステートやコンテキストを更新します
    // この例では、アラートを表示するだけです
    setShowAlert(true)

    // 5秒後にアラートを非表示にする
    setTimeout(() => {
      setShowAlert(false)
    }, 5000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">運気パターン検証ツール</h1>

      {showAlert && (
        <Alert variant="success" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>更新完了</AlertTitle>
          <AlertDescription>
            運気パターンが正常に更新されました。アプリを再起動するか、ページをリロードして変更を反映してください。
          </AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            ページをリロード
          </Button>
        </Alert>
      )}

      <p className="text-gray-600 mb-6">
        このツールを使用して、現在のアプリの運気パターンと移植元アプリの運気パターンを比較・検証できます。
        不一致がある場合は、移植元アプリのパターンに更新することができます。
      </p>

      <PatternComparisonTable onUpdatePatterns={handleUpdatePatterns} />
    </div>
  )
}
