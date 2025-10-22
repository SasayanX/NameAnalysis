"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCharStroke, getCharStrokeWithContext } from "@/lib/kanji"
import { csvImportedData } from "@/lib/store"

export function StrokeDataDebugger() {
  const [testChar, setTestChar] = useState("")
  const [debugResult, setDebugResult] = useState<any>(null)

  const handleDebugChar = () => {
    if (testChar) {
      const directStroke = getCharStroke(testChar)
      const contextResult = getCharStrokeWithContext(testChar, testChar, 0)
      const csvStroke = csvImportedData[testChar]

      const result = {
        char: testChar,
        directStroke,
        contextStroke: contextResult.stroke,
        isDefault: contextResult.isDefault,
        csvStroke,
        charCode: testChar.charCodeAt(0),
      }

      setDebugResult(result)
      console.log("🔍 文字デバッグ結果:", result)
    }
  }

  const handleCheckProblematic = () => {
    const problematicChars = ["桑", "陸", "也", "斉", "条", "承"]
    const results = problematicChars.map((char) => {
      const directStroke = getCharStroke(char)
      const contextResult = getCharStrokeWithContext(char, char, 0)
      const csvStroke = csvImportedData[char]

      return {
        char,
        directStroke,
        contextStroke: contextResult.stroke,
        isDefault: contextResult.isDefault,
        csvStroke,
        charCode: char.charCodeAt(0),
      }
    })

    setDebugResult({ problematic: results })
    console.log("🔍 問題の文字一括チェック:", results)
  }

  const handleVerifyCsv = () => {
    const csvKeys = Object.keys(csvImportedData)
    const csvCount = csvKeys.length
    const sampleData = csvKeys.slice(0, 10).reduce(
      (acc, key) => {
        acc[key] = csvImportedData[key]
        return acc
      },
      {} as Record<string, number>,
    )

    const result = {
      totalCount: csvCount,
      sampleData,
      hasProblematicChars: {
        桑: csvImportedData["桑"],
        陸: csvImportedData["陸"],
        也: csvImportedData["也"],
        斉: csvImportedData["斉"],
        条: csvImportedData["条"],
        承: csvImportedData["承"],
      },
    }

    setDebugResult({ csvVerification: result })
    console.log("📊 CSVデータ確認:", result)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>画数データデバッガー</CardTitle>
        <CardDescription>画数データの問題を調査・修正するためのツール</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 個別文字テスト */}
        <div className="space-y-2">
          <label className="text-sm font-medium">個別文字テスト</label>
          <div className="flex space-x-2">
            <Input
              value={testChar}
              onChange={(e) => setTestChar(e.target.value)}
              placeholder="調査したい文字を入力"
              maxLength={1}
            />
            <Button onClick={handleDebugChar}>調査</Button>
          </div>
        </div>

        {/* 問題の文字一括チェック */}
        <div className="space-y-2">
          <Button onClick={handleCheckProblematic} variant="outline" className="w-full">
            問題の文字（桑・陸・也・斉・条・承）を一括チェック
          </Button>
        </div>

        {/* CSVデータ確認 */}
        <div className="space-y-2">
          <Button onClick={handleVerifyCsv} variant="outline" className="w-full">
            CSVデータ内容確認
          </Button>
        </div>

        {/* 結果表示 */}
        {debugResult && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(debugResult, null, 2)}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* 修正手順 */}
        <div className="space-y-2">
          <h3 className="font-medium">修正手順</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>上記ボタンで問題を特定</li>
            <li>ブラウザのキャッシュをクリア（Ctrl+Shift+R）</li>
            <li>アプリケーションを再起動</li>
            <li>それでも解決しない場合は、データの優先順位を調整</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

export default StrokeDataDebugger
