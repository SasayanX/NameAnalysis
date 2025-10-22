"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Copy, ExternalLink, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProductionReadyChecker() {
  const [locationId, setLocationId] = useState("L0YH3ASTVNNMA8999")
  const [webhookSignatureKey, setWebhookSignatureKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [envVars, setEnvVars] = useState("")
  const { toast } = useToast()

  const productionAppId = "sq0idp-CbbdF82IxFWDSqf8D2S0Pw"
  const productionToken = "EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG"

  const generateEnvVars = () => {
    setIsGenerating(true)

    setTimeout(() => {
      const envContent = `# Square Production Environment Variables
# Vercel Dashboard → Settings → Environment Variables に設定

SQUARE_APPLICATION_ID=${productionAppId}
SQUARE_ACCESS_TOKEN=${productionToken}
SQUARE_LOCATION_ID=${locationId}
SQUARE_WEBHOOK_SIGNATURE_KEY=${webhookSignatureKey}

# フロントエンド用（公開可能）
NEXT_PUBLIC_SQUARE_APPLICATION_ID=${productionAppId}
NEXT_PUBLIC_SQUARE_LOCATION_ID=${locationId}

# 本番環境フラグ
NODE_ENV=production`

      setEnvVars(envContent)
      setIsGenerating(false)
      toast({
        title: "環境変数生成完了",
        description: "Vercel Dashboardで設定してください",
      })
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  const isFormComplete = locationId && webhookSignatureKey

  return (
    <div className="space-y-6">
      {/* 現在の状況 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            本番認証情報取得完了
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-green-700">本番環境の認証情報が設定されました:</p>
            <div className="text-sm text-green-600 space-y-1">
              <div>✅ Application ID: sq0idp-CbbdF82IxFWDSqf8D2S0Pw</div>
              <div>✅ Access Token: EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG</div>
              <div>✅ Location ID: L0YH3ASTVNNMA8999</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 残りの設定項目 */}
      <Card>
        <CardHeader>
          <CardTitle>残りの設定項目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Square Dashboard で取得が必要:</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div>1. Production → Locations → Location ID をコピー</div>
              <div>2. Webhooks → 本番Webhook作成 → Signature Key をコピー</div>
            </div>
          </div>

          <div>
            <Label htmlFor="location-id">Production Location ID</Label>
            <Input
              id="location-id"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="LM... で始まる文字列"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Square Dashboard → Production → Locations から取得</p>
          </div>

          <div>
            <Label htmlFor="webhook-signature">Production Webhook Signature Key</Label>
            <Input
              id="webhook-signature"
              value={webhookSignatureKey}
              onChange={(e) => setWebhookSignatureKey(e.target.value)}
              placeholder="32文字のランダム文字列"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Square Dashboard → Webhooks → 本番エンドポイント作成後に表示</p>
          </div>

          <Button onClick={generateEnvVars} disabled={!isFormComplete || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              "環境変数を生成"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook URL設定ガイド */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            本番Webhook設定
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
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium">Webhook URL:</div>
              <div className="font-mono text-sm text-blue-600">
                https://nameanalysis216.vercel.app/api/square-webhook
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">設定手順:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Square Dashboard → Webhooks</li>
                <li>「Create Webhook」をクリック</li>
                <li>上記URLを入力</li>
                <li>Events: payment.updated を選択</li>
                <li>Production環境で作成</li>
                <li>作成後に表示される Signature Key をコピー</li>
              </ol>
            </div>
          </div>
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">重要</h4>
                  <p className="text-sm text-red-700">
                    これらの環境変数をVercel Dashboardで設定後、必ず再デプロイを実行してください。
                  </p>
                </div>
              </div>
            </div>

            <Textarea value={envVars} readOnly className="font-mono text-sm h-40" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Vercel Dashboard
              </Button>
              <Button onClick={() => copyToClipboard(envVars)} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                環境変数をコピー
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 完了後のステップ */}
      {envVars && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🚀 デプロイ準備完了</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-blue-700 font-medium">環境変数設定後の手順:</p>
              <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
                <li>Vercel Dashboard で環境変数を設定</li>
                <li>プロジェクトを再デプロイ</li>
                <li>本番環境での決済テスト実行</li>
                <li>マネタイズ機能の本格運用開始</li>
              </ol>
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 text-sm font-medium">✅ これで完全なマネタイズ化が実現できます！</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
