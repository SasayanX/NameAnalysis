"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Search, Globe } from "lucide-react"

interface CheckResult {
  name: string
  status: "success" | "error" | "warning" | "checking"
  message: string
  action?: string
  url?: string
}

export function SEOEmergencyChecker() {
  const [checks, setChecks] = useState<CheckResult[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const performChecks = async () => {
    setIsChecking(true)
    setChecks([])

    const checkItems = [
      {
        name: "サイトマップ確認",
        check: async () => {
          try {
            const response = await fetch("/sitemap.xml")
            if (response.ok) {
              const text = await response.text()
              if (text.includes("<urlset")) {
                return { status: "success" as const, message: "サイトマップが正常に生成されています" }
              } else {
                return { status: "error" as const, message: "サイトマップの形式が正しくありません" }
              }
            } else {
              return { status: "error" as const, message: `サイトマップにアクセスできません (${response.status})` }
            }
          } catch (error) {
            return { status: "error" as const, message: "サイトマップの確認中にエラーが発生しました" }
          }
        },
      },
      {
        name: "robots.txt確認",
        check: async () => {
          try {
            const response = await fetch("/robots.txt")
            if (response.ok) {
              const text = await response.text()
              if (text.includes("Sitemap:") && !text.includes("Disallow: /")) {
                return { status: "success" as const, message: "robots.txtが適切に設定されています" }
              } else if (text.includes("Disallow: /")) {
                return {
                  status: "error" as const,
                  message: "robots.txtでサイト全体がブロックされています！",
                  action: "robots.txtを修正してください",
                }
              } else {
                return { status: "warning" as const, message: "robots.txtにサイトマップの記載がありません" }
              }
            } else {
              return { status: "warning" as const, message: "robots.txtが見つかりません" }
            }
          } catch (error) {
            return { status: "error" as const, message: "robots.txtの確認中にエラーが発生しました" }
          }
        },
      },
      {
        name: "メタタグ確認",
        check: async () => {
          const title = document.title
          const description = document.querySelector('meta[name="description"]')?.getAttribute("content")

          if (!title || title.length < 30) {
            return { status: "error" as const, message: "タイトルタグが短すぎるか存在しません" }
          }
          if (!description || description.length < 120) {
            return { status: "error" as const, message: "メタディスクリプションが短すぎるか存在しません" }
          }
          return { status: "success" as const, message: "基本的なメタタグが設定されています" }
        },
      },
      {
        name: "構造化データ確認",
        check: async () => {
          const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
          if (structuredData.length === 0) {
            return { status: "warning" as const, message: "構造化データが見つかりません" }
          }
          return { status: "success" as const, message: `${structuredData.length}個の構造化データが設定されています` }
        },
      },
      {
        name: "インデックス可能性確認",
        check: async () => {
          const noindex = document.querySelector('meta[name="robots"][content*="noindex"]')
          if (noindex) {
            return {
              status: "error" as const,
              message: "noindexタグが設定されています！",
              action: "noindexタグを削除してください",
            }
          }
          return { status: "success" as const, message: "インデックス可能な状態です" }
        },
      },
    ]

    for (const item of checkItems) {
      setChecks((prev) => [...prev, { name: item.name, status: "checking", message: "確認中..." }])

      const result = await item.check()

      setChecks((prev) => prev.map((check) => (check.name === item.name ? { ...check, ...result } : check)))

      // 少し待機してUIを更新
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsChecking(false)
  }

  const getStatusIcon = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "checking":
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusBadge = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            正常
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">エラー</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            警告
          </Badge>
        )
      case "checking":
        return <Badge variant="outline">確認中</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO緊急診断
          </CardTitle>
          <CardDescription>Google Search Consoleでアクセスがゼロの原因を特定します</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={performChecks} disabled={isChecking} className="mb-4">
            {isChecking ? "診断中..." : "緊急診断を開始"}
          </Button>

          {checks.length > 0 && (
            <div className="space-y-3">
              {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-gray-600">{check.message}</div>
                      {check.action && (
                        <div className="text-sm text-red-600 font-medium mt-1">対処法: {check.action}</div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            外部ツールでの確認
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                リッチリザルトテスト
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.google.com/webmasters/tools/mobile-friendly/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                モバイルフレンドリーテスト
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                PageSpeed Insights
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Search Console
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>緊急チェックポイント:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• robots.txtでサイト全体がブロックされていないか</li>
            <li>• noindexタグが設定されていないか</li>
            <li>• サイトマップが正しく生成されているか</li>
            <li>• Google Search Consoleにサイトマップが送信されているか</li>
            <li>• サイトが実際にアクセス可能か</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
