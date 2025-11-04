"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StrokeCountAdminPage() {
  const [kanji, setKanji] = useState("")
  const [strokeCount, setStrokeCount] = useState("")
  const [entries, setEntries] = useState<Array<{ kanji: string; strokes: number }>>([])
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleAdd = () => {
    if (!kanji || !strokeCount) {
      toast({
        title: "エラー",
        description: "漢字と画数を入力してください",
        variant: "destructive",
      })
      return
    }

    const strokes = parseInt(strokeCount)
    if (isNaN(strokes) || strokes <= 0) {
      toast({
        title: "エラー",
        description: "画数は正の整数を入力してください",
        variant: "destructive",
      })
      return
    }

    // 重複チェック
    if (entries.some((e) => e.kanji === kanji)) {
      toast({
        title: "警告",
        description: `${kanji}は既に追加済みです`,
        variant: "default",
      })
      return
    }

    setEntries([...entries, { kanji, strokes }])
    setKanji("")
    setStrokeCount("")
    toast({
      title: "追加しました",
      description: `${kanji}（${strokes}画）を追加しました`,
    })
  }

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index)
    setEntries(newEntries)
    toast({
      title: "削除しました",
      description: "エントリを削除しました",
    })
  }

  const generateCode = () => {
    if (entries.length === 0) {
      return ""
    }

    const entriesText = entries
      .map((e) => `  ${e.kanji}: ${e.strokes},`)
      .join("\n")

    return `// 追加された画数データ
${entriesText}
`
  }

  const handleCopy = () => {
    const code = generateCode()
    if (!code) {
      toast({
        title: "エラー",
        description: "コピーするデータがありません",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(code)
    setCopied(true)
    toast({
      title: "コピーしました",
      description: "コードをクリップボードにコピーしました",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBulkAdd = (text: string) => {
    // 「漢字=画数」形式のテキストをパース
    const lines = text.split("\n").filter((line) => line.trim())
    const newEntries: Array<{ kanji: string; strokes: number }> = []

    for (const line of lines) {
      const match = line.match(/([^=]+)=(\d+)/)
      if (match) {
        const kanji = match[1].trim()
        const strokes = parseInt(match[2].trim())
        if (kanji && !isNaN(strokes) && strokes > 0) {
          if (!entries.some((e) => e.kanji === kanji) && !newEntries.some((e) => e.kanji === kanji)) {
            newEntries.push({ kanji, strokes })
          }
        }
      }
    }

    if (newEntries.length > 0) {
      setEntries([...entries, ...newEntries])
      toast({
        title: "一括追加しました",
        description: `${newEntries.length}件のエントリを追加しました`,
      })
    } else {
      toast({
        title: "警告",
        description: "追加できるエントリがありませんでした",
        variant: "default",
      })
    }
  }

  const [bulkText, setBulkText] = useState("")

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>画数データ管理</CardTitle>
          <CardDescription>漢字の画数を追加して、コード生成用のテキストを取得できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 単一追加フォーム */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">単一追加</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kanji">漢字</Label>
                <Input
                  id="kanji"
                  value={kanji}
                  onChange={(e) => setKanji(e.target.value)}
                  placeholder="例: 常"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && kanji && strokeCount) {
                      handleAdd()
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="strokeCount">画数</Label>
                <Input
                  id="strokeCount"
                  type="number"
                  value={strokeCount}
                  onChange={(e) => setStrokeCount(e.target.value)}
                  placeholder="例: 11"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && kanji && strokeCount) {
                      handleAdd()
                    }
                  }}
                />
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>

          {/* 一括追加フォーム */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">一括追加</h3>
            <Alert>
              <AlertDescription>
                「漢字=画数」形式で1行に1つずつ入力してください。
                <br />
                例: 常=11
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="bulkText">一括入力</Label>
              <Textarea
                id="bulkText"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`常=11\n香=9\n布=5`}
                rows={5}
                className="font-mono"
              />
            </div>
            <Button
              onClick={() => {
                handleBulkAdd(bulkText)
                setBulkText("")
              }}
              variant="outline"
              className="w-full"
            >
              一括追加
            </Button>
          </div>

          {/* 追加済みエントリ一覧 */}
          {entries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">追加済みエントリ ({entries.length}件)</h3>
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      コードをコピー
                    </>
                  )}
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {generateCode()}
                </pre>
              </div>
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                    <span className="font-medium">
                      {entry.kanji} = {entry.strokes}画
                    </span>
                    <Button
                      onClick={() => handleRemove(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
              <Alert>
                <AlertDescription>
                  <strong>使用方法:</strong>
                  <br />
                  1. 上記のコードをコピー
                  <br />
                  2. <code className="bg-gray-200 px-1 rounded">lib/name-data-simple.ts</code>と<code className="bg-gray-200 px-1 rounded">lib/stroke-count-server.ts</code>の
                  <code className="bg-gray-200 px-1 rounded">strokeCountData</code>オブジェクト内の最後のエントリの後に貼り付け
                  <br />
                  3. 保存してコミット・プッシュ
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

