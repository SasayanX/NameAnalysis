"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

const SITEMAP_URLS = [
  { url: "/", priority: 1.0, type: "ホーム" },
  { url: "/", priority: 0.9, type: "メイン機能" },
  { url: "/articles", priority: 0.8, type: "記事一覧" },
  { url: "/articles/gakusuu-seimeihandan-kihon", priority: 0.9, type: "新記事" },
  { url: "/articles/kyujitai-seimeihandan", priority: 0.9, type: "SEO記事" },
  { url: "/articles/tengaku-kyousuu-myouji", priority: 0.9, type: "SEO記事" },
  { url: "/articles/2025-baby-names-ranking", priority: 0.9, type: "SEO記事" },
  { url: "/articles/gogyo-aishou-shindan", priority: 0.9, type: "SEO記事" },
  { url: "/articles/gogyo-five-elements", priority: 0.8, type: "SEO記事" },
  { url: "/articles/rokuseisensei-fortune", priority: 0.8, type: "SEO記事" },
  { url: "/privacy", priority: 0.3, type: "法的" },
  { url: "/contact", priority: 0.3, type: "サポート" },
  { url: "/pricing", priority: 0.6, type: "料金" },
  { url: "/legal/terms-of-service", priority: 0.2, type: "法的" },
  { url: "/legal/tokusho", priority: 0.2, type: "法的" },
  { url: "/legal/refund-policy", priority: 0.2, type: "法的" },
]

interface UrlStatus {
  url: string
  status: "checking" | "success" | "error"
  statusCode?: number
  error?: string
}

export default function SitemapFinalCheck() {
  const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [checkComplete, setCheckComplete] = useState(false)

  const checkAllUrls = async () => {
    setIsChecking(true)
    setCheckComplete(false)
    const baseUrl = "https://seimei.kanau-kiryu.com"

    const initialStatuses = SITEMAP_URLS.map((item) => ({
      url: item.url,
      status: "checking" as const,
    }))
    setUrlStatuses(initialStatuses)

    const results: UrlStatus[] = []

    for (const item of SITEMAP_URLS) {
      const fullUrl = `${baseUrl}${item.url}`

      try {
        const response = await fetch(fullUrl, { method: "HEAD" })
        results.push({
          url: item.url,
          status: response.ok ? "success" : "error",
          statusCode: response.status,
        })
      } catch (error) {
        results.push({
          url: item.url,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      setUrlStatuses([...results])
      await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms待機
    }

    setIsChecking(false)
    setCheckComplete(true)
  }

  const successCount = urlStatuses.filter((s) => s.status === "success").length
  const errorCount = urlStatuses.filter((s) => s.status === "error").length
  const totalCount = SITEMAP_URLS.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: string, statusCode?: number) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            OK ({statusCode})
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error ({statusCode || "N/A"})</Badge>
      default:
        return <Badge variant="secondary">チェック中...</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            サイトマップ送信前の最終チェック
          </CardTitle>
          <CardDescription>全16ページのURLが正常に動作するか確認します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={checkAllUrls} disabled={isChecking} className="w-full sm:w-auto">
              {isChecking ? "チェック中..." : "全URLをチェック"}
            </Button>

            {checkComplete && (
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✅ 成功: {successCount}</span>
                <span className="text-red-600">❌ エラー: {errorCount}</span>
                <span className="text-gray-600">合計: {totalCount}</span>
              </div>
            )}
          </div>

          {urlStatuses.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">チェック結果</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {SITEMAP_URLS.map((item, index) => {
                  const status = urlStatuses.find((s) => s.url === item.url)
                  return (
                    <div key={item.url} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {status && getStatusIcon(status.status)}
                        <div>
                          <div className="font-mono text-sm">{item.url}</div>
                          <div className="text-xs text-gray-500">
                            {item.type} (優先度: {item.priority})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status && getStatusBadge(status.status, status.statusCode)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {checkComplete && (
            <Card className={errorCount === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                {errorCount === 0 ? (
                  <div className="text-center space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <h3 className="font-semibold text-green-800">✅ 全URLが正常です！</h3>
                    <p className="text-green-700">サイトマップを安全に送信できます</p>
                    <div className="mt-4 p-4 bg-white rounded border">
                      <p className="text-sm font-semibold mb-2">Google Search Console での送信手順：</p>
                      <ol className="text-sm text-left space-y-1">
                        <li>1. Google Search Console にログイン</li>
                        <li>2. 左メニューから「サイトマップ」を選択</li>
                        <li>3. 「新しいサイトマップの追加」に「sitemap.xml」を入力</li>
                        <li>4. 「送信」ボタンをクリック</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <h3 className="font-semibold text-red-800">⚠️ エラーがあります</h3>
                    <p className="text-red-700">エラーを修正してから送信してください</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
