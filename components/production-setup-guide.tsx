"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Copy, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProductionSetupGuide() {
  const [productionAppId, setProductionAppId] = useState("")
  const [productionToken, setProductionToken] = useState("")
  const [productionLocationId, setProductionLocationId] = useState("")
  const [productionSignatureKey, setProductionSignatureKey] = useState("")
  const [envVars, setEnvVars] = useState("")
  const { toast } = useToast()

  const generateEnvVars = () => {
    const envContent = `# Square Production Environment Variables
SQUARE_APPLICATION_ID=${productionAppId}
SQUARE_ACCESS_TOKEN=${productionToken}
SQUARE_LOCATION_ID=${productionLocationId}
SQUARE_WEBHOOK_SIGNATURE_KEY=${productionSignatureKey}
NODE_ENV=production`

    setEnvVars(envContent)
    toast({
      title: "環境変数生成完了",
      description: "Vercel Dashboardで設定してください",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  const isFormComplete = productionAppId && productionToken && productionLocationId && productionSignatureKey

  return (
    <div className="space-y-6">
      {/* 現在の状況 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            サンドボックステスト完了
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            サンドボックス環境での決済機能テストが成功しました。本番環境の設定を行います。
          </p>
        </CardContent>
      </Card>

      {/* Square Dashboard ガイド */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Square Dashboard - Production設定
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://developer.squareup.com/apps", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Square Dashboard
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Production タブに切り替え</h4>
                <p className="text-sm text-gray-600">アプリ選択 → Production タブをクリック</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Credentials から認証情報取得</h4>
                <p className="text-sm text-gray-600">Application ID, Access Token を取得</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Locations から Location ID 取得</h4>
                <p className="text-sm text-gray-600">本番環境のロケーションIDを確認</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Webhooks で本番URL設定</h4>
                <p className="text-sm text-gray-600">URL: https://nameanalysis216.vercel.app/api/square-webhook</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 認証情報入力フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>本番環境認証情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prod-app-id">Production Application ID</Label>
              <Input
                id="prod-app-id"
                value={productionAppId}
                onChange={(e) => setProductionAppId(e.target.value)}
                placeholder="sq0idp-..."
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="prod-location-id">Production Location ID</Label>
              <Input
                id="prod-location-id"
                value={productionLocationId}
                onChange={(e) => setProductionLocationId(e.target.value)}
                placeholder="LM..."
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prod-token">Production Access Token</Label>
            <Input
              id="prod-token"
              type="password"
              value={productionToken}
              onChange={(e) => setProductionToken(e.target.value)}
              placeholder="EAAAE..."
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="prod-signature">Production Webhook Signature Key</Label>
            <Input
              id="prod-signature"
              value={productionSignatureKey}
              onChange={(e) => setProductionSignatureKey(e.target.value)}
              placeholder="32文字のランダム文字列"
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={generateEnvVars} disabled={!isFormComplete} className="w-full">
            環境変数を生成
          </Button>
        </CardContent>
      </Card>

      {/* 環境変数設定 */}
      {envVars && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vercel 環境変数設定
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(envVars)}>
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">重要</h4>
                  <p className="text-sm text-yellow-700">
                    これらの環境変数をVercel Dashboardの Settings → Environment Variables で設定してください。
                  </p>
                </div>
              </div>
            </div>

            <Textarea value={envVars} readOnly className="font-mono text-sm h-32" />

            <div className="space-y-2">
              <h4 className="font-medium">Vercel設定手順:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Vercel Dashboard → プロジェクト選択</li>
                <li>Settings → Environment Variables</li>
                <li>上記の環境変数を1つずつ追加</li>
                <li>Production環境にチェック</li>
                <li>Redeploy実行</li>
              </ol>
            </div>

            <Button
              onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Vercel Dashboard を開く
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 次のステップ */}
      {envVars && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">次のステップ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-blue-700">環境変数設定後:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Vercelでプロジェクトを再デプロイ</li>
                <li>• 本番環境での決済テスト実行</li>
                <li>• 実際の課金処理の動作確認</li>
                <li>• マネタイズ機能の本格運用開始</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
