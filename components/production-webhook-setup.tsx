"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Copy, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProductionWebhookSetup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [webhookUrl, setWebhookUrl] = useState("https://nameanalysis216.vercel.app/api/square-webhook")
  const [signatureKey, setSignatureKey] = useState("")
  const [testResult, setTestResult] = useState("")
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  const testWebhookEndpoint = async () => {
    try {
      const response = await fetch("/api/square-webhook", {
        method: "GET",
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult(`✅ Webhookエンドポイント正常\n\n${JSON.stringify(result, null, 2)}`)
        toast({
          title: "成功",
          description: "Webhookエンドポイントが正常に動作しています",
        })
      } else {
        setTestResult(`❌ エラー ${response.status}: ${response.statusText}`)
        toast({
          title: "エラー",
          description: `HTTP ${response.status} エラーが発生しました`,
          variant: "destructive",
        })
      }
    } catch (error) {
      setTestResult(`❌ 接続エラー: ${error}`)
      toast({
        title: "エラー",
        description: "Webhookエンドポイントへの接続に失敗しました",
        variant: "destructive",
      })
    }
  }

  const steps = [
    {
      title: "Square Developer Console にアクセス",
      description: "Production環境でWebhookを作成します",
      action: (
        <Button onClick={() => window.open("https://developer.squareup.com/apps", "_blank")} className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          Square Developer Console を開く
        </Button>
      ),
    },
    {
      title: "Webhookエンドポイントテスト",
      description: "まずエンドポイントが正常に動作するか確認します",
      action: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input value={webhookUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={testWebhookEndpoint} className="w-full">
            エンドポイントテスト実行
          </Button>
        </div>
      ),
    },
    {
      title: "Production Webhook作成",
      description: "Square Dashboard でProduction環境のWebhookを作成",
      action: (
        <div className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">設定値:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Environment:</strong> Production
              </div>
              <div>
                <strong>URL:</strong> https://nameanalysis216.vercel.app/api/square-webhook
              </div>
              <div>
                <strong>Events:</strong> payment.updated, subscription.created, subscription.updated,
                subscription.canceled
              </div>
            </div>
          </div>
          <Button onClick={() => setCurrentStep(4)} className="w-full">
            Webhook作成完了
          </Button>
        </div>
      ),
    },
    {
      title: "Signature Key取得",
      description: "作成されたWebhookのSignature Keyをコピー",
      action: (
        <div className="space-y-3">
          <div>
            <Label>Signature Key</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={signatureKey}
                onChange={(e) => setSignatureKey(e.target.value)}
                placeholder="32文字のSignature Keyを入力"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(signatureKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={() => setCurrentStep(5)} disabled={!signatureKey.trim()} className="w-full">
            設定完了
          </Button>
        </div>
      ),
    },
    {
      title: "環境変数設定",
      description: "Vercel Dashboard で環境変数を設定",
      action: (
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Vercel環境変数:</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>SQUARE_APPLICATION_ID=sq0idp-CbbdF82IxFWDSqf8D2S0Pw</div>
              <div>SQUARE_ACCESS_TOKEN=EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG</div>
              <div>SQUARE_LOCATION_ID=L0YH3ASTVNNMA8999</div>
              <div>SQUARE_WEBHOOK_SIGNATURE_KEY={signatureKey || "取得したSignature Key"}</div>
            </div>
          </div>
          <Button onClick={() => window.open("https://vercel.com/dashboard", "_blank")} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Vercel Dashboard を開く
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>本番Webhook作成手順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > index + 1 ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  {currentStep >= index + 1 && step.action}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>テスト結果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">{testResult}</pre>
          </CardContent>
        </Card>
      )}

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            405エラーの対処法
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <p className="mb-2">405 Method Not Allowedエラーが発生した場合は、以下を確認してください：</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>WebhookエンドポイントがPOSTメソッドをサポートしているか</li>
            <li>URLが正確に入力されているか</li>
            <li>デプロイが完了しているか</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
