"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFortuneData } from "@/contexts/fortune-data-context"
import { useStrokeData } from "@/contexts/stroke-data-context"
import { PdfExportButton } from "@/components/pdf-export-button"
import { DataPersistenceGuide } from "@/components/data-persistence-guide"
import { CsvStrokeImporter } from "@/components/csv-stroke-importer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Edit,
  Save,
  Trash,
  X,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { saveFortuneDataLocally } from "@/lib/fortune-data-manager"

export default function StrokeFortuneListPage() {
  const [sortBy, setSortBy] = useState<"stroke" | "fortune">("stroke")
  const [isEditMode, setIsEditMode] = useState(false)
  const {
    fortuneData,
    setFortuneData,
    fortuneExplanations,
    setFortuneExplanations,
    saveChanges,
    resetToOriginal,
    defaultFortuneData,
  } = useFortuneData()
  const {
    strokeData,
    updateStrokeData,
    removeStrokeData,
    saveStrokeData,
    resetToDefault,
    updateMultipleStrokeData,
    defaultStrokeData,
  } = useStrokeData()
  const [editingStroke, setEditingStroke] = useState<string | null>(null)
  const [editingFortune, setEditingFortune] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<string>("")
  const importedDataRef = useRef<Record<string, number> | null>(null)
  const [showPersistenceGuide, setShowPersistenceGuide] = useState(false)
  const [lastImportedData, setLastImportedData] = useState<any>(null)

  // デバッグ情報を表示するための状態
  const [showDebug, setShowDebug] = useState(false)

  // 新しい漢字と画数の入力用の状態
  const [newKanji, setNewKanji] = useState("")
  const [newStrokeCount, setNewStrokeCount] = useState("")

  // 初期ロード時にデバッグ情報を設定
  useEffect(() => {
    const info = `
     現在の漢字データ: ${Object.keys(strokeData).length}件
     デフォルト漢字データ: ${Object.keys(defaultStrokeData).length}件
     サンプル漢字データ:
     ${Object.entries(strokeData)
       .slice(0, 10)
       .map(([k, v]) => `${k}: ${v}`)
       .join(", ")}
   `
    setDebugInfo(info)
  }, [strokeData, defaultStrokeData])

  // インポートされたデータを保持するための効果
  useEffect(() => {
    if (importedDataRef.current && Object.keys(importedDataRef.current).length > 0) {
      const timer = setTimeout(() => {
        // インポートされたデータを再度適用して確実に保存
        updateMultipleStrokeData(importedDataRef.current!)
        saveStrokeData()

        setDebugInfo(
          (prev) => prev + "\n\n再保存実行: " + Object.keys(importedDataRef.current!).length + "件のデータを保存",
        )

        // 保存後にクリア
        importedDataRef.current = null
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [updateMultipleStrokeData, saveStrokeData])

  // 新しい漢字と画数を追加する関数
  const addCustomKanji = () => {
    if (newKanji && newStrokeCount) {
      const strokeCount = Number.parseInt(newStrokeCount)
      if (!isNaN(strokeCount)) {
        updateStrokeData(newKanji, strokeCount)
        setNewKanji("")
        setNewStrokeCount("")
        toast({
          title: "漢字を追加しました",
          description: `${newKanji}: ${strokeCount}画`,
        })
      }
    }
  }

  // fortuneDataオブジェクトを配列に変換
  const fortuneList = Object.entries(fortuneData).map(([stroke, data]) => ({
    stroke: Number.parseInt(stroke),
    fortune: data.運勢,
    description: data.説明,
  }))

  // ソート
  const sortedList = [...fortuneList].sort((a, b) => {
    if (sortBy === "stroke") {
      return a.stroke - b.stroke
    } else {
      // 運勢の順序: 大吉 > 吉 > 中吉 > 凶 > 大凶
      const fortuneOrder = { 大吉: 5, 吉: 4, 中吉: 3, 凶: 2, 大凶: 1, 中凶: 0 }
      return (
        (fortuneOrder[b.fortune as keyof typeof fortuneOrder] || 0) -
        (fortuneOrder[a.fortune as keyof typeof fortuneOrder] || 0)
      )
    }
  })

  // 運勢ごとの色を定義
  const fortuneColors: Record<string, string> = {
    大吉: "bg-red-600 hover:bg-red-700 text-white",
    吉: "bg-pink-200 hover:bg-pink-300 text-pink-800",
    中吉: "bg-pink-700 hover:bg-pink-800 text-white",
    凶: "border border-gray-300 bg-white text-gray-800",
    大凶: "bg-black hover:bg-gray-800 text-white",
    中凶: "bg-gray-500 hover:bg-gray-600 text-white",
  }

  // 運勢ごとのアイコンを定義
  const fortuneIcons: Record<string, React.ReactNode> = {
    大吉: <CheckCircle className="h-5 w-5 text-green-600" />,
    吉: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    中吉: <Info className="h-5 w-5 text-blue-600" />,
    凶: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    大凶: <XCircle className="h-5 w-5 text-red-600" />,
    中凶: <XCircle className="h-5 w-5 text-gray-600" />,
  }

  // 運勢ごとの集計
  const fortuneCounts = sortedList.reduce(
    (acc, item) => {
      acc[item.fortune] = (acc[item.fortune] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // 編集内容を保存
  const saveFortuneData = () => {
    const fortuneSaved = saveChanges()
    const strokeSaved = saveStrokeData()

    if (fortuneSaved && strokeSaved) {
      // localStorageに永続保存
      const dataToSave = {
        fortuneData,
        fortuneExplanations,
        strokeData,
      }

      const saved = saveFortuneDataLocally(dataToSave)

      setSaveMessage("変更内容が保存されました（ローカルストレージ）")
      toast({
        title: "保存完了",
        description: saved ? "データがローカルストレージに保存されました" : "データの保存に一部問題がありました",
      })

      // デバッグ情報を更新
      const info = `
       保存後の漢字データ: ${Object.keys(strokeData).length}件
       サンプル漢字データ:
       ${Object.entries(strokeData)
         .slice(0, 10)
         .map(([k, v]) => `${k}: ${v}`)
         .join(", ")}
     `
      setDebugInfo((prev) => prev + "\n\n" + info)
    } else {
      setSaveMessage("保存中にエラーが発生しました")
      toast({
        title: "エラー",
        description: "データの保存に失敗しました",
        variant: "destructive",
      })
    }

    setTimeout(() => setSaveMessage(null), 3000)
  }

  // 編集内容をリセット
  const resetFortuneData = () => {
    if (window.confirm("編集内容をリセットしますか？基本データに戻ります。")) {
      resetToOriginal()
      resetToDefault()
      setSaveMessage("データがリセットされました")
      setTimeout(() => setSaveMessage(null), 3000)

      // デバッグ情報を更新
      const info = `
       リセット後の漢字データ: ${Object.keys(strokeData).length}件
       サンプル漢字データ:
       ${Object.entries(strokeData)
         .slice(0, 10)
         .map(([k, v]) => `${k}: ${v}`)
         .join(", ")}
     `
      setDebugInfo((prev) => prev + "\n\n" + info)
    }
  }

  // 画数の運勢を更新
  const updateStrokeFortune = (stroke: string, fortune: string, description: string) => {
    setFortuneData((prev) => ({
      ...prev,
      [stroke]: {
        運勢: fortune,
        説明: description,
      },
    }))
    setEditingStroke(null)
  }

  // 運勢の説明を更新
  const updateFortuneExplanation = (
    fortune: string,
    field: keyof (typeof fortuneExplanations)[string],
    value: string | string[] | number[],
  ) => {
    setFortuneExplanations((prev) => ({
      ...prev,
      [fortune]: {
        ...prev[fortune],
        [field]: value,
      },
    }))
  }

  // データをJSONとしてエクスポート
  const exportData = () => {
    const data = {
      fortuneData,
      fortuneExplanations,
      strokeData,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fortune-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "データをエクスポートしました",
      description: "fortune-data.jsonとして保存されました",
    })

    // デバッグ情報を更新
    const info = `
     エクスポートした漢字データ: ${Object.keys(strokeData).length}件
     サンプル漢字データ:
     ${Object.entries(strokeData)
       .slice(0, 10)
       .map(([k, v]) => `${k}: ${v}`)
       .join(", ")}
   `
    setDebugInfo((prev) => prev + "\n\n" + info)
  }

  // JSONからデータをインポート
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        console.log("Importing data:", Object.keys(data))

        // デバッグ情報を更新
        let debugLog = `インポート開始: ファイルサイズ ${file.size} バイト\n`
        debugLog += `インポートデータのキー: ${Object.keys(data).join(", ")}\n`

        if (data.fortuneData) {
          console.log("Fortune data found in import:", Object.keys(data.fortuneData).length, "entries")
          debugLog += `運勢データ: ${Object.keys(data.fortuneData).length}件\n`

          // 71～81画のデータを保持するための処理
          const mergedFortuneData = { ...data.fortuneData }

          // インポートされたデータに71～81画のデータが含まれていない場合、
          // 現在のデータまたはデフォルトデータから補完する
          for (let i = 71; i <= 81; i++) {
            const strokeKey = i.toString()
            if (!mergedFortuneData[strokeKey]) {
              // 現在のデータから取得を試みる
              if (fortuneData[strokeKey]) {
                mergedFortuneData[strokeKey] = fortuneData[strokeKey]
                debugLog += `画数${strokeKey}の運勢データを現在のデータから保持\n`
              }
              // 現在のデータにもない場合はデフォルトデータから取得（念のため）
              else if (defaultFortuneData && defaultFortuneData[strokeKey]) {
                mergedFortuneData[strokeKey] = defaultFortuneData[strokeKey]
                debugLog += `画数${strokeKey}の運勢データをデフォルトから追加\n`
              }
            }
          }

          // 運勢説明データの処理
          let mergedExplanations = { ...data.fortuneExplanations }
          if (data.fortuneExplanations) {
            console.log(
              "Fortune explanations found in import:",
              Object.keys(data.fortuneExplanations).length,
              "entries",
            )
            debugLog += `運勢説明データ: ${Object.keys(data.fortuneExplanations).length}件\n`

            // 各運勢の例に71～81画を追加（もし元のデータにあれば）
            Object.keys(mergedExplanations).forEach((fortune) => {
              const currentExamples = fortuneExplanations[fortune]?.examples || []
              const importedExamples = mergedExplanations[fortune].examples || []

              // 71～81画で、現在のデータに含まれているが、インポートデータに含まれていないものを抽出
              const highStrokesToPreserve = currentExamples.filter(
                (stroke) => stroke >= 71 && stroke <= 81 && !importedExamples.includes(stroke),
              )

              // 高画数の例を追加
              if (highStrokesToPreserve.length > 0) {
                mergedExplanations[fortune].examples = [...importedExamples, ...highStrokesToPreserve].sort(
                  (a, b) => a - b,
                )
                debugLog += `運勢「${fortune}」の高画数例を保持: ${highStrokesToPreserve.join(", ")}\n`
              }
            })
          } else {
            // 説明データがない場合は現在のデータを使用
            mergedExplanations = fortuneExplanations
          }

          // データを更新
          setFortuneData(mergedFortuneData)
          setFortuneExplanations(mergedExplanations)

          // インポートしたデータを保存
          setLastImportedData({
            fortuneData: mergedFortuneData,
            fortuneExplanations: mergedExplanations,
            strokeData: data.strokeData || strokeData,
          })

          debugLog += `★データをインポートしました（ローカルストレージに保存）★\n`
        }

        // 漢字データもインポートする（存在する場合）
        if (data.strokeData) {
          const importedStrokeCount = Object.keys(data.strokeData).length
          console.log("Stroke data found in import:", importedStrokeCount, "entries")
          debugLog += `インポートされた漢字データ: ${importedStrokeCount}件\n`

          // 新しい漢字データを作成
          const newStrokeData: Record<string, number> = {}

          // インポートされたデータを処理
          Object.entries(data.strokeData).forEach(([kanji, stroke]) => {
            // 数値に変換して保存
            const strokeNum = typeof stroke === "number" ? stroke : Number(stroke)
            if (!isNaN(strokeNum)) {
              newStrokeData[kanji] = strokeNum
            } else {
              debugLog += `警告: 漢字「${kanji}」の画数が無効です: ${stroke}\n`
            }
          })

          debugLog += `処理後の漢字データ: ${Object.keys(newStrokeData).length}件\n`

          // 漢字データを更新
          updateMultipleStrokeData(newStrokeData)
          importedDataRef.current = { ...newStrokeData }

          // 保存
          const saved = saveStrokeData()
          debugLog += `保存結果: ${saved ? "成功" : "失敗"}\n`
        }

        // 永続化ガイドを表示
        setShowPersistenceGuide(true)

        setSaveMessage("データがインポートされました（永続化するには設定が必要です）")
        toast({
          title: "データをインポートしました",
          description: "永続化するには環境変数の設定が必要です",
        })

        setTimeout(() => setSaveMessage(null), 5000)

        // デバッグ情報を更新
        setDebugInfo((prev) => prev + "\n\n" + debugLog)
      } catch (error) {
        console.error("データのインポートに失敗しました:", error)
        toast({
          title: "エラー",
          description: "データの解析に失敗しました",
          variant: "destructive",
        })

        // エラー情報をデバッグに追加
        setDebugInfo(
          (prev) => prev + "\n\nインポートエラー: " + (error instanceof Error ? error.message : String(error)),
        )
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">画数別吉凶一覧</h1>
        <div className="flex items-center gap-4">
          {/* 編集モードを表示 - 常に表示するように修正 */}
          <div className="flex items-center space-x-2">
            <Switch id="edit-mode-switch" name="editMode" checked={isEditMode} onCheckedChange={setIsEditMode} />
            <Label htmlFor="edit-mode-switch">編集モード</Label>
          </div>
          <PdfExportButton contentId="fortune-list-content" fileName="画数別吉凶一覧" />
        </div>
      </div>

      {/* 永続化ガイド */}
      {showPersistenceGuide && lastImportedData && (
        <div className="mb-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                データの永続化について
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataPersistenceGuide customData={lastImportedData} />
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowPersistenceGuide(false)}>
                  このガイドを閉じる
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* カスタムデータをデフォルトとして使用するオプションを追加 */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">画数別吉凶データエディタ</p>
              <a href="/" className="text-primary underline">
                名前分析ツールへ
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              このページでは画数別吉凶データを編集できます。編集内容は保存ボタンを押すと反映されます。
              <strong>永続化するには環境変数の設定またはデータベース統合が必要です。</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* インポート・エクスポート機能 - 常に表示するように修正 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={saveFortuneData} variant="default" size="sm">
              <Save className="h-4 w-4 mr-1" />
              保存（ローカル）
            </Button>
            <Button onClick={resetFortuneData} variant="destructive" size="sm">
              <Trash className="h-4 w-4 mr-1" />
              基本データにリセット
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </Button>
            <div className="relative">
              <input
                type="file"
                id="import-file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".json"
                onChange={importData}
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                インポート
              </Button>
            </div>
            <Button onClick={() => setShowDebug(!showDebug)} variant="ghost" size="sm">
              {showDebug ? "デバッグ情報を隠す" : "デバッグ情報を表示"}
            </Button>
          </div>
        </div>
        {saveMessage && (
          <Alert className="mt-4">
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        {/* デバッグ情報 */}
        {showDebug && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-60">
            <h3 className="font-bold mb-2">デバッグ情報</h3>
            <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>

      {/* メインタブ - 画数別吉凶詳細、漢字データ編集、CSVインポートを切り替え */}
      <Tabs defaultValue="fortune-list" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fortune-list">画数別吉凶詳細</TabsTrigger>
          <TabsTrigger value="kanji-editor">漢字データ編集</TabsTrigger>
          <TabsTrigger value="csv-import">CSVインポート</TabsTrigger>
        </TabsList>

        {/* CSVインポートタブ */}
        <TabsContent value="csv-import" className="mt-4">
          <CsvStrokeImporter />
        </TabsContent>

        {/* 漢字データ編集タブ */}
        <TabsContent value="kanji-editor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>漢字データ編集</CardTitle>
              <CardDescription>漢字の画数を追加・編集できます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(strokeData)
                  .slice(0, 100)
                  .map(([kanji, stroke]) => (
                    <Badge key={kanji} className="text-lg p-2">
                      {kanji}: {stroke}画
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-5 w-5 p-0"
                        onClick={() => {
                          removeStrokeData(kanji)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                {Object.keys(strokeData).length > 100 && (
                  <Badge className="text-lg p-2">...他 {Object.keys(strokeData).length - 100} 文字</Badge>
                )}
              </div>
              <div className="flex gap-2 mb-4">
                <Input
                  id="stroke-new-kanji"
                  name="strokeNewKanji"
                  placeholder="漢字"
                  value={newKanji}
                  onChange={(e) => setNewKanji(e.target.value)}
                  className="w-20"
                  maxLength={1}
                />
                <Input
                  id="stroke-new-count"
                  name="strokeNewCount"
                  placeholder="画数"
                  value={newStrokeCount}
                  onChange={(e) => setNewStrokeCount(e.target.value)}
                  className="w-20"
                  type="number"
                />
                <Button onClick={addCustomKanji}>追加</Button>
              </div>
              <Button onClick={saveStrokeData}>漢字データを保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 画数別吉凶詳細タブ */}
        <TabsContent value="fortune-list" className="mt-4">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSortBy("stroke")}
                className={`px-4 py-2 rounded ${sortBy === "stroke" ? "bg-primary text-white" : "bg-gray-200"}`}
              >
                画数順
              </button>
              <button
                onClick={() => setSortBy("fortune")}
                className={`px-4 py-2 rounded ${sortBy === "fortune" ? "bg-primary text-white" : "bg-gray-200"}`}
              >
                運勢順
              </button>
            </div>
          </div>

          <div id="fortune-list-content" className="space-y-8">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">画数一覧</TabsTrigger>
                <TabsTrigger value="explanation">運勢の詳細解説</TabsTrigger>
                <TabsTrigger value="statistics">統計情報</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>画数別吉凶詳細</CardTitle>
                    <CardDescription>全ての画数とその運勢、説明を一覧で表示しています</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">画数</TableHead>
                          <TableHead className="w-32">運勢</TableHead>
                          <TableHead>説明</TableHead>
                          {isEditMode && <TableHead className="w-24">操作</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedList.map((item) => (
                          <TableRow key={item.stroke}>
                            {editingStroke === item.stroke.toString() ? (
                              <>
                                <TableCell className="font-medium">{item.stroke}画</TableCell>
                                <TableCell>
                                  <select
                                    className="w-full p-2 border rounded"
                                    value={fortuneData[item.stroke.toString()].運勢}
                                    onChange={(e) =>
                                      setFortuneData((prev) => ({
                                        ...prev,
                                        [item.stroke.toString()]: {
                                          ...prev[item.stroke.toString()],
                                          運勢: e.target.value,
                                        },
                                      }))
                                    }
                                  >
                                    <option value="大吉">大吉</option>
                                    <option value="吉">吉</option>
                                    <option value="中吉">中吉</option>
                                    <option value="凶">凶</option>
                                    <option value="大凶">大凶</option>
                                    <option value="中凶">中凶</option>
                                  </select>
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    className="w-full"
                                    value={fortuneData[item.stroke.toString()].説明}
                                    onChange={(e) =>
                                      setFortuneData((prev) => ({
                                        ...prev,
                                        [item.stroke.toString()]: {
                                          ...prev[item.stroke.toString()],
                                          説明: e.target.value,
                                        },
                                      }))
                                    }
                                    rows={3}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateStrokeFortune(
                                          item.stroke.toString(),
                                          fortuneData[item.stroke.toString()].運勢,
                                          fortuneData[item.stroke.toString()].説明,
                                        )
                                      }
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingStroke(null)}>
                                      キャンセル
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="font-medium">{item.stroke}画</TableCell>
                                <TableCell>
                                  <Badge className={fortuneColors[item.fortune] || "bg-gray-100"}>{item.fortune}</Badge>
                                </TableCell>
                                <TableCell className="whitespace-pre-wrap">{item.description}</TableCell>
                                {isEditMode && (
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingStroke(item.stroke.toString())}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                )}
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="explanation" className="mt-4 space-y-8">
                {Object.entries(fortuneExplanations).map(([fortune, data]) => (
                  <Card
                    key={fortune}
                    className={`border-l-4 ${
                      fortune === "大吉"
                        ? "border-l-red-600"
                        : fortune === "吉"
                          ? "border-l-pink-200"
                          : fortune === "中吉"
                            ? "border-l-pink-700"
                            : fortune === "凶"
                              ? "border-l-gray-300"
                              : fortune === "中凶"
                                ? "border-l-gray-500"
                                : "border-l-black"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          {fortuneIcons[fortune as keyof typeof fortuneIcons]}
                          <CardTitle>{data.title}の特徴と意味</CardTitle>
                        </div>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingFortune(editingFortune === fortune ? null : fortune)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {editingFortune === fortune ? (
                        <Textarea
                          value={data.description}
                          onChange={(e) => updateFortuneExplanation(fortune, "description", e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      ) : (
                        <CardDescription>{data.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">特徴</h3>
                          {editingFortune === fortune ? (
                            <div className="space-y-2">
                              {data.characteristics.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                  <Textarea
                                    value={item}
                                    onChange={(e) => {
                                      const newCharacteristics = [...data.characteristics]
                                      newCharacteristics[index] = e.target.value
                                      updateFortuneExplanation(fortune, "characteristics", newCharacteristics)
                                    }}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newCharacteristics = data.characteristics.filter((_, i) => i !== index)
                                      updateFortuneExplanation(fortune, "characteristics", newCharacteristics)
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCharacteristics = [...data.characteristics, "新しい特徴"]
                                  updateFortuneExplanation(fortune, "characteristics", newCharacteristics)
                                }}
                              >
                                特徴を追加
                              </Button>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1">
                              {data.characteristics.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-2">アドバイス</h3>
                          {editingFortune === fortune ? (
                            <Textarea
                              value={data.advice}
                              onChange={(e) => updateFortuneExplanation(fortune, "advice", e.target.value)}
                              rows={4}
                            />
                          ) : (
                            <p>{data.advice}</p>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-2">該当する画数</h3>
                          {editingFortune === fortune ? (
                            <div>
                              <Input
                                value={data.examples.join(", ")}
                                onChange={(e) => {
                                  const values = e.target.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter((v) => v !== "")
                                    .map((v) => Number.parseInt(v, 10))
                                    .filter((v) => !isNaN(v))
                                  updateFortuneExplanation(fortune, "examples", values)
                                }}
                                placeholder="1, 2, 3, ..."
                              />
                              <p className="text-xs text-gray-500 mt-1">カンマ区切りで入力してください</p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {data.examples.map((stroke) => (
                                <Badge key={stroke} variant="outline">
                                  {stroke}画
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    {editingFortune === fortune && (
                      <CardFooter>
                        <Button variant="outline" size="sm" onClick={() => setEditingFortune(null)}>
                          完了
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="statistics" className="mt-4 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>運勢の分布</CardTitle>
                    <CardDescription>各運勢の画数の数を表示しています</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(fortuneCounts).map(([fortune, count]) => (
                          <div key={fortune} className="flex items-center">
                            <Badge className={fortuneColors[fortune] || "bg-gray-100"}>
                              {fortune}: {count}画
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-8 rounded-full overflow-hidden bg-gray-200 flex">
                        {Object.entries(fortuneCounts).map(([fortune, count]) => {
                          const percentage = (count / sortedList.length) * 100
                          let bgColor = "bg-gray-500"

                          switch (fortune) {
                            case "大吉":
                              bgColor = "bg-red-600"
                              break
                            case "吉":
                              bgColor = "bg-pink-200"
                              break
                            case "中吉":
                              bgColor = "bg-pink-700"
                              break
                            case "凶":
                              bgColor = "bg-gray-200"
                              break
                            case "大凶":
                              bgColor = "bg-black"
                              break
                            case "中凶":
                              bgColor = "bg-gray-500"
                              break
                          }

                          return (
                            <div
                              key={fortune}
                              className={`${bgColor} h-full`}
                              style={{ width: `${percentage}%` }}
                              title={`${fortune}: ${count}画 (${percentage.toFixed(1)}%)`}
                            />
                          )
                        })}
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <div>1画</div>
                        <div>81画</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
