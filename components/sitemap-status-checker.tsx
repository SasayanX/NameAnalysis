"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"

export function SitemapStatusChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [sitemapData, setSitemapData] = useState<any>(null)

  const checkSitemap = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/sitemap.xml")
      const text = await response.text()

      // XMLパース（簡易版）
      const urlMatches = text.match(/<url>/g)
      const urlCount = urlMatches ? urlMatches.length : 0

      setSitemapData({
        status: response.ok ? "success" : "error",
        urlCount,
        lastModified: new Date().toISOString(),
        size: text.length,
        content: text.substring(0, 500) + "...",
      })
    } catch (error) {
      setSitemapData({
        status: "error",
        error: error.message,
      })
    }
    setIsChecking(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* サイトマップ状態確認 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            サイトマップ状態確認
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkSitemap} disabled={isChecking} className="w-full mb-4">
            {isChecking ? "確認中..." : "サイトマップを確認"}
          </Button>

          {sitemapData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {sitemapData.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <Badge className={sitemapData.status === "success" ? "bg-green-600" : "bg-red-600"}>
                  {sitemapData.status === "success" ? "正常" : "エラー"}
                </Badge>
              </div>

              {sitemapData.status === "success" && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">URL数</p>
                    <p className="text-xl font-bold">{sitemapData.urlCount}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">ファイルサイズ</p>
                    <p className="text-xl font-bold">{Math.round(sitemapData.size / 1024)}KB</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">最終更新</p>
                    <p className="text-sm font-bold">{new Date(sitemapData.lastModified).toLocaleString("ja-JP")}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Search Console対応 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Google Search Console 対応手順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">既存サイトマップを削除</p>
                <p className="text-sm text-gray-600">Search Consoleで古いサイトマップを削除</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">新しいサイトマップを送信</p>
                <p className="text-sm text-gray-600">URL: https://nameanalysis216.vercel.app/sitemap.xml</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">24-48時間待機</p>
                <p className="text-sm text-gray-600">Googleの処理を待つ</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => window.open("https://search.google.com/search-console", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Google Search Console を開く
          </Button>
        </CardContent>
      </Card>

      {/* 決済戦略の重要な修正 */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            重要：決済戦略の修正が必要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-700">
              <strong>Square ≠ atone</strong> であることが判明しました。
            </p>
            <div className="p-3 bg-white border border-red-200 rounded">
              <h4 className="font-semibold mb-2">修正が必要な選択肢：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Square単体</strong>: クレジットカードのみ（手数料3.25%）
                </li>
                <li>
                  <strong>GMOペイメント</strong>: クレカ + コンビニ決済対応
                </li>
                <li>
                  <strong>PayPal</strong>: 審査が最も緩い（バックアップ）
                </li>
                <li>
                  <strong>専用コンビニ決済</strong>: atone、GMO後払い等
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
