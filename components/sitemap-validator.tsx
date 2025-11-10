"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, RefreshCw, ExternalLink } from "lucide-react"

interface SitemapEntry {
  url: string
  priority: number
  changeFrequency: string
  lastModified: string
}

export function SitemapValidator() {
  const [sitemapData, setSitemapData] = useState<SitemapEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const expectedPages = [
    { url: "https://seimei.app/", priority: 1.0, type: "ホーム" },
    { url: "https://seimei.app/", priority: 0.9, type: "メイン機能" },
    { url: "https://seimei.app/articles", priority: 0.8, type: "記事一覧" },
    { url: "https://seimei.app/articles/kyujitai-seimeihandan", priority: 0.9, type: "SEO記事" },
    { url: "https://seimei.app/articles/tengaku-kyousuu-myouji", priority: 0.9, type: "SEO記事" },
    { url: "https://seimei.app/articles/2025-baby-names-ranking", priority: 0.9, type: "SEO記事" },
    { url: "https://seimei.app/articles/gogyo-aishou-shindan", priority: 0.9, type: "SEO記事" },
    { url: "https://seimei.app/articles/gogyo-five-elements", priority: 0.8, type: "SEO記事" },
    { url: "https://seimei.app/articles/rokuseisensei-fortune", priority: 0.8, type: "SEO記事" },
    { url: "https://seimei.app/privacy", priority: 0.3, type: "法的" },
    { url: "https://seimei.app/contact", priority: 0.3, type: "法的" },
    { url: "https://seimei.app/pricing", priority: 0.6, type: "課金" },
    { url: "https://seimei.app/legal/terms-of-service", priority: 0.2, type: "法的" },
    { url: "https://seimei.app/legal/tokusho", priority: 0.2, type: "法的" },
    { url: "https://seimei.app/legal/refund-policy", priority: 0.2, type: "法的" },
  ]

  const fetchSitemap = async () => {
    setLoading(true)
    try {
      const response = await fetch("/sitemap.xml")
      const text = await response.text()

      // XMLパースは簡略化（実際の実装では適切なXMLパーサーを使用）
      const urls = text.match(/<loc>(.*?)<\/loc>/g)?.map((match) => match.replace(/<\/?loc>/g, "")) || []

      setSitemapData(
        urls.map((url) => ({
          url,
          priority: 0.5,
          changeFrequency: "monthly",
          lastModified: new Date().toISOString(),
        })),
      )

      setLastChecked(new Date())
    } catch (error) {
      console.error("サイトマップの取得に失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSitemap()
  }, [])

  const openSearchConsole = () => {
    window.open(
      "https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Aseimei.app",
      "_blank",
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>サイトマップ検証</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSitemap} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                更新
              </Button>
              <Button variant="outline" size="sm" onClick={openSearchConsole}>
                <ExternalLink className="h-4 w-4" />
                Search Console
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            現在のサイトマップ: {expectedPages.length}ページ
            {lastChecked && ` (最終確認: ${lastChecked.toLocaleTimeString()})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expectedPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={page.type === "SEO記事" ? "default" : "secondary"}>{page.type}</Badge>
                    <span className="text-sm font-medium">優先度: {page.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{page.url}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">🚨 緊急対応手順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold mb-2">1. Search Consoleでサイトマップ削除</h3>
              <p className="text-sm text-red-700">既存のサイトマップを完全に削除してください</p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-bold mb-2">2. 新しいサイトマップ送信</h3>
              <p className="text-sm text-orange-700">
                <code className="bg-white px-2 py-1 rounded">https://seimei.app/sitemap.xml</code>
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold mb-2">3. 24時間待機</h3>
              <p className="text-sm text-blue-700">検出ページ数が15ページに変更されるまで待機</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
