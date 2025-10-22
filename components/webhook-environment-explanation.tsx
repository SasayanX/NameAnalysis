"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Globe, TestTube } from "lucide-react"

export function WebhookEnvironmentExplanation() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            同一URLでの本番・サンドボックス対応について
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">正常な設定です</h4>
                  <p className="text-sm text-green-700 mt-1">
                    同じWebhook URL（https://nameanalysis216.vercel.app/api/square-webhook）を
                    本番環境とサンドボックス環境の両方で使用することは一般的で推奨される方法です。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-blue-600" />
                    サンドボックス環境
                    <Badge variant="secondary" className="text-xs">
                      テスト
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• テスト決済の処理</li>
                    <li>• 開発・デバッグ用</li>
                    <li>• 実際の課金なし</li>
                    <li>• 署名検証は緩い</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    本番環境
                    <Badge variant="default" className="text-xs">
                      本番
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 実際の決済処理</li>
                    <li>• 本番サービス用</li>
                    <li>• 実際の課金あり</li>
                    <li>• 署名検証は厳格</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">APIエンドポイントでの環境判定:</h4>
              <div className="bg-white p-3 rounded border font-mono text-sm">
                <div className="text-gray-600">// 環境に応じて処理を分岐</div>
                <div className="text-blue-600">const isProduction = process.env.NODE_ENV === "production"</div>
                <div className="text-green-600">// 本番: 厳格な署名検証</div>
                <div className="text-orange-600">// サンドボックス: テスト用の緩い検証</div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">メリット:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 1つのエンドポイントで両環境に対応</li>
                <li>• コードの重複を避けられる</li>
                <li>• 環境変数で動作を制御</li>
                <li>• デプロイが簡単</li>
                <li>• メンテナンスが容易</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 text-sm">現在の設定状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">サンドボックス Webhook:</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                設定済み
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">本番 Webhook:</span>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                設定中
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">共通エンドポイント:</span>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                動作中
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
