"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Download, Upload, FileText, Trash2, Eye, AlertTriangle } from "lucide-react"
import { csvImportManager, type ImportSession, type ConflictResolution } from "@/lib/stroke-data/csv-import-manager"

export function AdvancedCsvImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [sessionName, setSessionName] = useState<string>("")
  const [importedData, setImportedData] = useState<Record<string, number>>({})
  const [sessions, setSessions] = useState<ImportSession[]>([])
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("import")

  useEffect(() => {
    refreshSessions()
  }, [])

  const refreshSessions = () => {
    setSessions(csvImportManager.getSessions())
    setConflicts(csvImportManager.getConflicts())
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setSessionName(selectedFile.name.replace(".csv", ""))
      setError("")
      setSuccess("")
      setProgress(0)
    }
  }

  const processFile = async () => {
    if (!file || !sessionName.trim()) {
      setError("ファイルとセッション名を入力してください")
      return
    }

    setIsProcessing(true)
    setError("")
    setProgress(10)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        throw new Error("CSVファイルが空です")
      }

      setProgress(30)

      // ヘッダー行を分析
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
        throw new Error("漢字と画数のカラムを特定できませんでした")
      }

      setProgress(50)

      // データを処理
      const processedData: Record<string, number> = {}
      let processedCount = 0

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

        if (columns.length <= Math.max(kanjiColIndex, strokeColIndex)) {
          continue
        }

        const kanji = columns[kanjiColIndex]
        const strokeStr = columns[strokeColIndex]
        const strokes = Number.parseInt(strokeStr)

        if (!kanji || isNaN(strokes) || strokes <= 0 || strokes > 50) {
          continue
        }

        processedData[kanji] = strokes
        processedCount++

        const progressPercent = 50 + (processedCount / (lines.length - 1)) * 30
        setProgress(Math.min(progressPercent, 80))
      }

      if (Object.keys(processedData).length === 0) {
        throw new Error("有効なデータが見つかりませんでした")
      }

      setImportedData(processedData)
      setProgress(100)
      setSuccess(`${Object.keys(processedData).length}件のデータを読み込みました`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイル処理中にエラーが発生しました")
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddSession = () => {
    if (Object.keys(importedData).length === 0) {
      setError("インポートするデータがありません")
      return
    }

    try {
      const sessionId = csvImportManager.addSession(sessionName.trim(), file?.name || "unknown", importedData)

      setSuccess(`セッション "${sessionName}" を追加しました (ID: ${sessionId})`)
      setImportedData({})
      setFile(null)
      setSessionName("")
      refreshSessions()
      setActiveTab("sessions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "セッション追加中にエラーが発生しました")
    }
  }

  const handleRemoveSession = (id: string) => {
    csvImportManager.removeSession(id)
    refreshSessions()
    setSuccess("セッションを削除しました")
  }

  const handleResolveConflict = (
    char: string,
    resolution: "keep_current" | "use_new" | "manual",
    manualValue?: number,
  ) => {
    csvImportManager.resolveConflict(char, resolution, manualValue)
    refreshSessions()
  }

  const handleExportFinal = () => {
    try {
      const tsCode = csvImportManager.generateTypeScriptFile()

      const blob = new Blob([tsCode], { type: "text/typescript" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "csv-imported-data-merged.ts"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess("統合データをエクスポートしました")
    } catch (err) {
      setError(err instanceof Error ? err.message : "エクスポート中にエラーが発生しました")
    }
  }

  const stats = csvImportManager.getStats()

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          高度なCSV画数データインポート
        </CardTitle>
        <CardDescription>
          複数のCSVファイルからデータをインポートし、競合を解決して統合データを生成します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import">新規インポート</TabsTrigger>
            <TabsTrigger value="sessions">
              セッション管理
              {sessions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {sessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conflicts">
              競合解決
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="export">統合エクスポート</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">セッション名</Label>
                  <Input
                    id="session-name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="例: 人気名前2024"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSVファイル</Label>
                  <Input id="csv-file" type="file" accept=".csv" onChange={handleFileSelect} disabled={isProcessing} />
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>処理中...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={processFile} disabled={!file || !sessionName.trim() || isProcessing}>
                  <FileText className="h-4 w-4 mr-2" />
                  ファイル解析
                </Button>
                <Button
                  onClick={handleAddSession}
                  disabled={Object.keys(importedData).length === 0}
                  variant="secondary"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  セッションに追加
                </Button>
              </div>

              {Object.keys(importedData).length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {Object.keys(importedData).length}件のデータを読み込みました。
                    「セッションに追加」をクリックして保存してください。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">インポートセッション一覧</h3>
              <Badge variant="outline">{sessions.length}セッション</Badge>
            </div>

            {sessions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  まだセッションがありません。「新規インポート」タブからCSVファイルをインポートしてください。
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>セッション名</TableHead>
                    <TableHead>ソース</TableHead>
                    <TableHead>データ数</TableHead>
                    <TableHead>インポート日時</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell>{session.source}</TableCell>
                      <TableCell>{session.dataCount}件</TableCell>
                      <TableCell>{new Date(session.timestamp).toLocaleString("ja-JP")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{session.name} - データ詳細</DialogTitle>
                                <DialogDescription>{session.dataCount}件のデータ</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                                {Object.entries(session.data).map(([char, strokes]) => (
                                  <div key={char} className="flex items-center space-x-2 p-2 border rounded">
                                    <span className="font-bold text-lg">{char}</span>
                                    <span className="text-sm text-muted-foreground">{strokes}画</span>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveSession(session.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">データ競合の解決</h3>
              <Badge variant={conflicts.length > 0 ? "destructive" : "secondary"}>{conflicts.length}件の競合</Badge>
            </div>

            {conflicts.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>データの競合はありません。全てのセッションのデータが統合可能です。</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {conflicts.length}件のデータ競合が検出されました。各競合について解決方法を選択してください。
                  </AlertDescription>
                </Alert>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>文字</TableHead>
                      <TableHead>現在の値</TableHead>
                      <TableHead>新しい値</TableHead>
                      <TableHead>解決方法</TableHead>
                      <TableHead>最終値</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflicts.map((conflict) => (
                      <TableRow key={conflict.char}>
                        <TableCell className="font-bold text-lg">{conflict.char}</TableCell>
                        <TableCell>{conflict.currentValue}画</TableCell>
                        <TableCell>{conflict.newValue}画</TableCell>
                        <TableCell>
                          <Select
                            value={conflict.resolution}
                            onValueChange={(value: "keep_current" | "use_new" | "manual") =>
                              handleResolveConflict(conflict.char, value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="keep_current">現在の値を保持</SelectItem>
                              <SelectItem value="use_new">新しい値を使用</SelectItem>
                              <SelectItem value="manual">手動で指定</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {conflict.resolution === "keep_current" && `${conflict.currentValue}画`}
                          {conflict.resolution === "use_new" && `${conflict.newValue}画`}
                          {conflict.resolution === "manual" && (
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              className="w-20"
                              placeholder="画数"
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value)
                                if (!isNaN(value)) {
                                  handleResolveConflict(conflict.char, "manual", value)
                                }
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">統合データのエクスポート</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <p className="text-xs text-muted-foreground">セッション数</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.uniqueChars}</div>
                    <p className="text-xs text-muted-foreground">ユニーク文字数</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.totalImports}</div>
                    <p className="text-xs text-muted-foreground">総インポート数</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.conflicts}</div>
                    <p className="text-xs text-muted-foreground">競合数</p>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleExportFinal} disabled={sessions.length === 0} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                統合データをTypeScriptファイルとしてエクスポート
              </Button>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  エクスポートされたファイルを <code>lib/stroke-data/csv-imported-data.ts</code> に配置し、
                  アプリケーションを再起動してデータを反映させてください。
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        {/* エラー・成功表示 */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
