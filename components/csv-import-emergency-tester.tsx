"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateCsvImportData, applyEmergencyFix } from "@/lib/csv-import-validator"
import { getCharStroke } from "@/lib/name-data-simple-emergency"

export function CsvImportEmergencyTester() {
  const [testResults, setTestResults] = useState<any>(null)

  const handleValidateData = () => {
    const results = validateCsvImportData()
    setTestResults(results)
  }

  const handleEmergencyFix = () => {
    const fixData = applyEmergencyFix()
    setTestResults({ emergency: fixData })
  }

  const handleTestCriticalChars = () => {
    const criticalChars = ["条", "承", "桑", "陸", "也", "斉"]
    const results = criticalChars.map((char) => ({
      char,
      stroke: getCharStroke(char),
      expected:
        char === "条" ? 11 : char === "承" ? 8 : char === "桑" ? 10 : char === "陸" ? 16 : char === "也" ? 3 : 8,
    }))
    setTestResults({ critical: results })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-red-600">🚨 CSVインポート緊急修正ツール</CardTitle>
        <CardDescription>CSVインポートデータの問題を緊急修正します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 緊急テストボタン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleTestCriticalChars} variant="destructive" className="w-full">
            重要文字テスト
          </Button>
          <Button onClick={handleValidateData} variant="outline" className="w-full">
            データ検証実行
          </Button>
          <Button onClick={handleEmergencyFix} variant="secondary" className="w-full">
            緊急修正適用
          </Button>
        </div>

        {/* 問題の文字一覧 */}
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription>
            <div className="font-medium mb-2">🚨 報告された問題文字:</div>
            <ul className="text-sm space-y-1">
              <li>
                <strong>条</strong>: 11画 (CSVインポート済みのはずが未認識)
              </li>
              <li>
                <strong>承</strong>: 8画 (CSVインポート済みのはずが未認識)
              </li>
              <li>
                <strong>桑</strong>: 10画 (前回修正済み)
              </li>
              <li>
                <strong>陸</strong>: 16画 (前回修正済み)
              </li>
              <li>
                <strong>也</strong>: 3画 (前回修正済み)
              </li>
              <li>
                <strong>斉</strong>: 8画 (前回修正済み)
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* 結果表示 */}
        {testResults && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(testResults, null, 2)}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* 修正手順 */}
        <div className="space-y-2">
          <h3 className="font-medium text-red-600">🔧 緊急修正手順</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>
              <strong>重要文字テスト</strong>をクリックして現状確認
            </li>
            <li>
              <strong>Ctrl+Shift+R</strong>でページを完全リロード
            </li>
            <li>開発サーバーを再起動 (npm run dev)</li>
            <li>再度テストして修正を確認</li>
            <li>問題が続く場合は緊急修正版ファイルに切り替え</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
