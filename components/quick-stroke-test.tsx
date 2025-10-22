"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCharStroke, getCharStrokeWithContext } from "@/lib/kanji"
import { csvImportedData } from "@/lib/store"

export function QuickStrokeTest() {
  const [testResults, setTestResults] = useState<any[]>([])

  const testProblematicChars = () => {
    const chars = ["桑", "陸", "也", "斉", "条", "承"]
    const results = chars.map((char) => {
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

    setTestResults(results)
    console.log("🔍 問題の文字テスト結果:", results)
  }

  const testAllCsvData = () => {
    const csvKeys = Object.keys(csvImportedData)
    const totalCount = csvKeys.length
    const sampleResults = csvKeys.slice(0, 20).map((char) => {
      const directStroke = getCharStroke(char)
      const contextResult = getCharStrokeWithContext(char, char, 0)
      const csvStroke = csvImportedData[char]

      return {
        char,
        directStroke,
        contextStroke: contextResult.stroke,
        isDefault: contextResult.isDefault,
        csvStroke,
      }
    })

    setTestResults([{ summary: { totalCount, sampleCount: sampleResults.length } }, ...sampleResults])
    console.log("📊 CSVデータ全体テスト:", { totalCount, sampleResults })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>クイック画数テスト</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testProblematicChars} className="w-full">
          問題の文字（桑・陸・也・斉・条・承）をテスト
        </Button>

        <Button onClick={testAllCsvData} variant="outline" className="w-full">
          CSVデータ全体をテスト（サンプル20件）
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">テスト結果</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  {result.summary ? (
                    <div className="font-medium">
                      CSVデータ総数: {result.summary.totalCount}件
                      <br />
                      サンプル表示: {result.summary.sampleCount}件
                    </div>
                  ) : (
                    <>
                      <div className="font-mono text-lg mb-2">文字: {result.char}</div>
                      <div className="text-sm space-y-1">
                        <div>直接取得: {result.directStroke}画</div>
                        <div>
                          コンテキスト取得: {result.contextStroke}画{" "}
                          {result.isDefault && <span className="text-red-500">(デフォルト値)</span>}
                        </div>
                        <div>CSVデータ: {result.csvStroke}画</div>
                        <div>文字コード: {result.charCode}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>✅ 正常: 全ての値が一致し、デフォルト値でない</p>
          <p>❌ 問題: デフォルト値が使用されている、または値が不一致</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickStrokeTest
