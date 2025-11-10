"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SquareAppSetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Square Developer アプリ作成ガイド
          </CardTitle>
          <CardDescription>決済システムを有効化するための設定手順</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 1: アカウント作成</h3>
            <div className="space-y-2">
              <p>Square Developer Dashboardにアクセス</p>
              <Button
                variant="outline"
                onClick={() => window.open("https://developer.squareup.com/", "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Square Developer Dashboard
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 2: アプリ作成</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-medium">アプリ名</label>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">Mainichi Seimei Handan</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard("Mainichi Seimei Handan")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-medium">説明</label>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Daily Japanese name fortune analysis</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard("Daily Japanese name fortune analysis service")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 3: Webhook設定</h3>
            <div className="space-y-3">
              <div>
                <label className="font-medium">Webhook URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    https://seimei.app/api/square-webhook
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard("https://seimei.app/api/square-webhook")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="font-medium">購読イベント</label>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">payment.updated</Badge>
                  <Badge variant="secondary">subscription.updated</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 4: 署名キー取得</h3>
            <div className="space-y-2">
              <p>Webhook設定後に表示される署名キーをコピー</p>
              <div className="bg-yellow-50 p-3 rounded border">
                <p className="text-sm text-yellow-800">⚠️ この署名キーは後でVercelの環境変数に設定します</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded border">
            <h4 className="font-semibold mb-2">設定完了後</h4>
            <ul className="text-sm space-y-1">
              <li>✅ アプリケーションID取得</li>
              <li>✅ Webhook署名キー取得</li>
              <li>✅ Vercel環境変数設定</li>
              <li>✅ 決済テスト実行</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
