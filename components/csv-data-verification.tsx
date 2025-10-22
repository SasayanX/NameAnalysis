"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { csvImportedData, csvImportStats } from "@/lib/stroke-data/csv-imported-data"

export function CsvDataVerification() {
  const [searchChar, setSearchChar] = useState("")
  const [searchResult, setSearchResult] = useState<{ char: string; strokes: number } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 重要な文字をテスト
  const importantChars = [
    { char: "翔", expected: 12 },
    { char: "愛", expected: 13 },
    { char: "心", expected: 4 },
    { char: "陽", expected: 17 },
    { char: "結", expected: 12 },
    { char: "桜", expected: 10 },
    { char: "蓮", expected: 13 },
    { char: "葵", expected: 12 },
  ]

  const handleSearch = () => {
    if (!searchChar.trim()) return

    setIsLoading(true)
    setTimeout(() => {
      const strokes = csvImportedData[searchChar.trim()]
      if (strokes !== undefined) {
        setSearchResult({ char: searchChar.trim(), strokes })
        setNotFound(false)
      } else {
        setSearchResult(null)
        setNotFound(true)
      }
      setIsLoading(false)
    }, 300)
  }

  const testImportantChars = () => {
    return importantChars.map((test) => {
      const actualStrokes = csvImportedData[test.char]
      return {
        ...test,
        actual: actualStrokes,
        isCorrect: actualStrokes === test.expected,
        exists: actualStrokes !== undefined,
      }
    })
  }

  const testResults = testImportantChars()
  const allTestsPassed = testResults.every((result) => result.isCorrect)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            CSVデータ更新確認
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{csvImportStats.totalCount}</div>
              <div className="text-sm text-muted-foreground">総文字数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{csvImportStats.newCount}</div>
              <div className="text-sm text-muted-foreground">新規追加</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{csvImportStats.updatedCount}</div>
              <div className="text-sm text-muted-foreground">更新</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{csvImportStats.duplicateCount}</div>
              <div className="text-sm text-muted-foreground">重複</div>
            </div>
          </div>

          {/* 更新日時 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              最終更新: {new Date(csvImportStats.lastUpdated).toLocaleString("ja-JP")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>重要文字テスト</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result) => (
              <div key={result.char} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{result.char}</span>
                  <div className="text-sm">
                    <div>期待値: {result.expected}画</div>
                    <div>実際: {result.exists ? `${result.actual}画` : "未登録"}</div>
                  </div>
                </div>
                <Badge variant={result.isCorrect ? "default" : "destructive"}>
                  {result.isCorrect ? "✓ 正常" : result.exists ? "✗ 不一致" : "✗ 未登録"}
                </Badge>
              </div>
            ))}
          </div>

          <Alert variant={allTestsPassed ? "default" : "destructive"} className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {allTestsPassed ? "✅ 全ての重要文字が正しく登録されています" : "❌ 一部の重要文字に問題があります"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文字検索テスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchChar}
              onChange={(e) => setSearchChar(e.target.value)}
              placeholder="検索したい文字を入力"
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchChar.trim()}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              検索
            </Button>
          </div>

          {searchResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                「{searchResult.char}」は {searchResult.strokes}画 で登録されています
              </AlertDescription>
            </Alert>
          )}

          {notFound && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>「{searchChar}」は登録されていません</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
