"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Download, Upload, FileText } from "lucide-react"

interface ImportedData {
  [key: string]: number
}

interface ValidationResult {
  char: string
  strokes: number
  status: "new" | "updated" | "duplicate"
  previousStrokes?: number
}

export function CsvStrokeImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [importedData, setImportedData] = useState<ImportedData>({})
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [columnMapping, setColumnMapping] = useState<{ kanjiCol: number; strokeCol: number } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setSuccess("")
      setProgress(0)
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError("")
    setProgress(10)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        throw new Error("CSVファイルが空です")
      }

      setProgress(20)

      // ヘッダー行を分析してカラムマッピングを決定
      const headerLine = lines[0]
      const headers = headerLine.split(",").map((h) => h.trim().replace(/"/g, ""))

      let kanjiColIndex = -1
      let strokeColIndex = -1

      // カラムを自動検出
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase()
        if (
          lowerHeader.includes("漢字") ||
          lowerHeader.includes("文字") ||
          lowerHeader.includes("kanji") ||
          lowerHeader.includes("char")
        ) {
          kanjiColIndex = index
        }
        if (
          lowerHeader.includes("画数") ||
          lowerHeader.includes("stroke") ||
          lowerHeader.includes("画") ||
          lowerHeader.includes("count")
        ) {
          strokeColIndex = index
        }
      })

      // 自動検出できない場合は位置で判断
      if (kanjiColIndex === -1 || strokeColIndex === -1) {
        if (headers.length >= 2) {
          const firstDataLine = lines[1]?.split(",")
          if (firstDataLine && firstDataLine.length >= 2) {
            const firstCol = firstDataLine[0].trim().replace(/"/g, "")
            const secondCol = firstDataLine[1].trim().replace(/"/g, "")

            if (!isNaN(Number(firstCol)) && isNaN(Number(secondCol))) {
              strokeColIndex = 0
              kanjiColIndex = 1
            } else {
              kanjiColIndex = 0
              strokeColIndex = 1
            }
          }
        }
      }

      if (kanjiColIndex === -1 || strokeColIndex === -1) {
        throw new Error(
          "漢字と画数のカラムを特定できませんでした。ヘッダー行に「漢字」「画数」または「kanji」「stroke」を含めてください。",
        )
      }

      setColumnMapping({ kanjiCol: kanjiColIndex, strokeCol: strokeColIndex })
      setProgress(40)

      // 既存データを取得（実際の実装では strokeCountData から取得）
      const existingData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("strokeData") || "{}") : {}

      // データを処理
      const processedData: ImportedData = {}
      const validationResults: ValidationResult[] = []
      let processedCount = 0

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

        if (columns.length <= Math.max(kanjiColIndex, strokeColIndex)) {
          console.warn(`行 ${i + 1}: カラム数が不足しています`)
          continue
        }

        const kanji = columns[kanjiColIndex]
        const strokeStr = columns[strokeColIndex]
        const strokes = Number.parseInt(strokeStr)

        if (!kanji || isNaN(strokes) || strokes <= 0 || strokes > 50) {
          console.warn(`行 ${i + 1}: 無効なデータ - 漢字: "${kanji}", 画数: "${strokeStr}"`)
          continue
        }

        processedData[kanji] = strokes
        processedCount++

        // バリデーション結果を記録
        if (existingData[kanji] === undefined) {
          validationResults.push({
            char: kanji,
            strokes: strokes,
            status: "new",
          })
        } else if (existingData[kanji] !== strokes) {
          validationResults.push({
            char: kanji,
            strokes: strokes,
            status: "updated",
            previousStrokes: existingData[kanji],
          })
        } else {
          validationResults.push({
            char: kanji,
            strokes: strokes,
            status: "duplicate",
          })
        }

        // プログレスを更新
        const progressPercent = 40 + (processedCount / (lines.length - 1)) * 40
        setProgress(Math.min(progressPercent, 80))
      }

      if (Object.keys(processedData).length === 0) {
        throw new Error("有効なデータが見つかりませんでした")
      }

      setImportedData(processedData)
      setValidationResults(validationResults)
      setProgress(100)
      setSuccess(`${Object.keys(processedData).length}件のデータを読み込みました`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイル処理中にエラーが発生しました")
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (Object.keys(importedData).length === 0) {
      setError("インポートするデータがありません")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // TypeScriptファイルとして出力するコードを生成
      const tsCode = `// CSV インポートされた漢字画数データ
// このファイルは CSV インポート機能によって自動生成されました
// 最終更新: ${new Date().toLocaleString("ja-JP")}

export const csvImportedData: Record<string, number> = {
${Object.entries(importedData)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([kanji, strokes]) => `  "${kanji}": ${strokes},`)
  .join("\n")}
}

// 統計情報
export const csvImportStats = {
  totalCount: ${Object.keys(importedData).length},
  newCount: ${validationResults.filter((r) => r.status === "new").length},
  updatedCount: ${validationResults.filter((r) => r.status === "updated").length},
  duplicateCount: ${validationResults.filter((r) => r.status === "duplicate").length},
  lastUpdated: "${new Date().toISOString()}"
}

// デバッグ用
console.log("CSV インポートデータ読み込み完了:", csvImportStats)
`

      // ダウンロード用のリンクを作成
      const blob = new Blob([tsCode], { type: "text/typescript" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "csv-imported-data.ts"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(
        `${Object.keys(importedData).length}件のデータをエクスポートしました。ダウンロードしたファイルを lib/stroke-data/ フォルダに配置してください。`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "インポート中にエラーが発生しました")
    } finally {
      setIsProcessing(false)
    }
  }

  const newCount = validationResults.filter((r) => r.status === "new").length
  const updatedCount = validationResults.filter((r) => r.status === "updated").length
  const duplicateCount = validationResults.filter((r) => r.status === "duplicate").length

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          CSV 漢字画数データインポート
        </CardTitle>
        <CardDescription>
          UTF-8エンコードのCSVファイルから漢字と画数のデータをインポートします。 対応形式: 漢字,画数 または 画数,漢字
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ファイル選択 */}
        <div className="space-y-2">
          <Label htmlFor="csv-file-input">CSVファイルを選択</Label>
          <Input
            id="csv-file-input"
            name="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 対応形式: 漢字,画数 または 画数,漢字</p>
            <p>• エンコード: UTF-8</p>
            <p>• ヘッダー行推奨: 漢字,画数 または kanji,stroke</p>
          </div>
        </div>

        {/* プログレスバー */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>処理中...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* カラムマッピング情報 */}
        {columnMapping && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              検出されたカラム構成:
              <Badge variant="outline" className="ml-2">
                漢字 = 列{columnMapping.kanjiCol + 1}
              </Badge>
              <Badge variant="outline" className="ml-2">
                画数 = 列{columnMapping.strokeCol + 1}
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* バリデーション結果 */}
        {validationResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-green-600">
                新規: {newCount}件
              </Badge>
              <Badge variant="default" className="bg-blue-600">
                更新: {updatedCount}件
              </Badge>
              <Badge variant="outline">重複: {duplicateCount}件</Badge>
            </div>

            {/* 新規・更新データのプレビュー */}
            <div className="space-y-2">
              <Label>データプレビュー（新規・更新のみ、最初の20件）</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                {validationResults
                  .filter((r) => r.status !== "duplicate")
                  .slice(0, 20)
                  .map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <span className="font-bold text-lg">{item.char}</span>
                      <div className="text-sm">
                        <div className={item.status === "new" ? "text-green-600" : "text-blue-600"}>
                          {item.strokes}画
                        </div>
                        {item.status === "updated" && (
                          <div className="text-gray-500 line-through text-xs">{item.previousStrokes}画</div>
                        )}
                      </div>
                      <Badge
                        variant={item.status === "new" ? "default" : "secondary"}
                        className={item.status === "new" ? "bg-green-600" : "bg-blue-600"}
                      >
                        {item.status === "new" ? "NEW" : "UPD"}
                      </Badge>
                    </div>
                  ))}
              </div>
              {validationResults.filter((r) => r.status !== "duplicate").length > 20 && (
                <p className="text-sm text-muted-foreground">
                  ...他 {validationResults.filter((r) => r.status !== "duplicate").length - 20} 件
                </p>
              )}
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 成功表示 */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* インポートボタン */}
        <div className="flex space-x-2">
          <Button
            onClick={handleImport}
            disabled={isProcessing || Object.keys(importedData).length === 0}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isProcessing ? "処理中..." : "TypeScriptファイルとしてエクスポート"}
          </Button>
        </div>

        {/* 使用方法 */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              使用方法
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-1">
              <p>
                <strong>1. CSVファイルを選択</strong> - データを自動解析してプレビュー表示
              </p>
              <p>
                <strong>2. データ確認</strong> - 新規・更新・重複の件数を確認
              </p>
              <p>
                <strong>3. エクスポート実行</strong> - TypeScriptファイルとしてダウンロード
              </p>
              <p>
                <strong>4. ファイル配置</strong> - ダウンロードした csv-imported-data.ts を lib/stroke-data/ に配置
              </p>
              <p>
                <strong>5. アプリ再起動</strong> - データを反映するためにアプリケーションを再起動
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
