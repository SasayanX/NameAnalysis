"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Search } from "lucide-react"

export function IndexingAccelerator() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const criticalPages = [
    {
      title: "メインページ",
      url: "https://seimei.kanau-kiryu.com/",
      status: "indexed",
      priority: "最高",
    },
    {
      title: "姓名判断ツール",
      url: "https://seimei.kanau-kiryu.com/name-analyzer",
      status: "not-indexed",
      priority: "最高",
    },
    {
      title: "記事一覧",
      url: "https://seimei.kanau-kiryu.com/articles",
      status: "not-indexed",
      priority: "高",
    },
    {
      title: "旧字体姓名判断記事",
      url: "https://seimei.kanau-kiryu.com/articles/kyujitai-seimeihandan",
      status: "not-indexed",
      priority: "高",
    },
    {
      title: "天格強数記事",
      url: "https://seimei.kanau-kiryu.com/articles/tengaku-kyousuu-myouji",
      status: "not-indexed",
      priority: "高",
    },
    {
      title: "六星占術記事",
      url: "https://seimei.kanau-kiryu.com/articles/rokuseisensei-fortune",
      status: "not-indexed",
      priority: "高",
    },
  ]

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const openGoogleSearchConsole = (url: string) => {
    const encodedUrl = encodeURIComponent(url)
    window.open(
      `https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aseimei.kanau-kiryu.com&id=${encodedUrl}`,
      "_blank",
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            インデックス状況と対策
          </CardTitle>
          <CardDescription>Google Search Consoleでの個別対応が必要なページ一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{page.title}</h3>
                    <Badge variant={page.priority === "最高" ? "destructive" : "secondary"}>{page.priority}</Badge>
                    {page.status === "indexed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{page.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(page.url)}
                    className={copiedUrl === page.url ? "bg-green-50" : ""}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedUrl === page.url ? "コピー済み" : "URL"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openGoogleSearchConsole(page.url)}>
                    <ExternalLink className="h-4 w-4" />
                    検査
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>緊急対応手順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">🚨 今すぐ実行</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
                <li>Google Search Consoleで各URLを個別に「URL検査」</li>
                <li>「インデックス登録をリクエスト」を実行</li>
                <li>サイトマップを削除して再送信</li>
                <li>24時間後に再確認</li>
              </ol>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">📈 中期対策</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>内部リンクの強化</li>
                <li>記事の相互リンク追加</li>
                <li>SNSでのシェア促進</li>
                <li>外部サイトからのリンク獲得</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
