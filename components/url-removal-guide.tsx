"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Copy, ExternalLink } from "lucide-react"

export function UrlRemovalGuide() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState("prefix")

  const removalUrls = [
    {
      url: "https://seimei.app/fortune-flow",
      reason: "不要な機能ページ",
      priority: "高",
    },
    {
      url: "https://seimei.app/fortune-comprehensive",
      reason: "不要な機能ページ",
      priority: "高",
    },
    {
      url: "https://seimei.app/roadmap",
      reason: "内部ページ",
      priority: "中",
    },
    {
      url: "https://seimei.app/stroke-fortune-list",
      reason: "不要な機能ページ",
      priority: "中",
    },
  ]

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const openSearchConsole = () => {
    window.open(
      "https://search.google.com/search-console/removals?resource_id=sc-domain%3Aseimei.app",
      "_blank",
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            URL削除の推奨設定
          </CardTitle>
          <CardDescription>Google Search ConsoleでのURL削除手順</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">✅ 推奨選択</h3>
              <div className="space-y-2">
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">この URL のみを削除</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefix" id="prefix" />
                    <Label htmlFor="prefix" className="font-bold text-green-700">
                      このプレフィックスで始まる URL をすべて削除 ← これを選択
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">📝 入力するURL</h3>
              <div className="space-y-2">
                <Input value="https://seimei.app/fortune-" readOnly className="bg-white" />
                <p className="text-sm text-blue-700">これで fortune- で始まるすべてのページが削除されます</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>削除対象ページ一覧</CardTitle>
          <CardDescription>以下のページが削除されます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {removalUrls.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={item.priority === "高" ? "destructive" : "secondary"}>{item.priority}</Badge>
                    <span className="text-sm text-muted-foreground">{item.reason}</span>
                  </div>
                  <p className="text-sm font-mono">{item.url}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(item.url)}
                  className={copiedUrl === item.url ? "bg-green-50" : ""}
                >
                  <Copy className="h-4 w-4" />
                  {copiedUrl === item.url ? "コピー済み" : "コピー"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">🚨 実行手順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold">「このプレフィックスで始まるURLをすべて削除」を選択</h3>
                <p className="text-sm text-red-700">一括削除で効率的に処理</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold">URLを入力</h3>
                <code className="text-sm bg-white px-2 py-1 rounded">https://seimei.app/fortune-</code>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold">「新しいリクエスト」を実行</h3>
                <p className="text-sm text-blue-700">24時間以内に削除完了</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={openSearchConsole} className="bg-red-600 hover:bg-red-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Search Console で実行
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
