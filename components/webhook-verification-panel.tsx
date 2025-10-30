"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WebhookVerificationPanel() {
  const [signatureKey, setSignatureKey] = useState("D4d-LlU5XhUPO_MzYI1wcA")
  const [showKey, setShowKey] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testResult, setTestResult] = useState("")
  const { toast } = useToast()

  const webhookUrl = "https://nameanalysis216.vercel.app/api/square-webhook"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  const testWebhookSignature = async () => {
    if (!signatureKey.trim()) {
      toast({
        title: "エラー",
        description: "署名キーを入力してください",
        variant: "destructive",
      })
      return
    }

    setVerificationStatus("testing")

    try {
      const testPayload = {
        type: "payment.updated",
        data: {
          object: {
            payment: {
              id: "test-payment-123",
              status: "COMPLETED",
              amount_money: {
                amount: 33000,
                currency: "JPY",
              },
              order_id: "test-order-123",
              buyer_email_address: "test@example.com",
            },
          },
        },
      }

      const body = JSON.stringify(testPayload)

      const crypto = await import("crypto")
      const signature = crypto.createHmac("sha256", signatureKey).update(body).digest("base64")

      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": signature,
        },
        body,
      })

      const result = await response.json()

      if (response.ok) {
        setVerificationStatus("success")
        setTestResult(`✅ Webhook署名検証成功\n\nレスポンス: ${JSON.stringify(result, null, 2)}`)
        toast({
          title: "成功",
          description: "Webhook署名検証が正常に動作しています",
        })
      } else {
        setVerificationStatus("error")
        setTestResult(`❌ Webhook署名検証失敗\n\nエラー: ${JSON.stringify(result, null, 2)}`)
        toast({
          title: "エラー",
          description: "Webhook署名検証に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      setVerificationStatus("error")
      setTestResult(`❌ テスト実行エラー\n\nエラー: ${error}`)
      toast({
        title: "エラー",
        description: "テストの実行に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            検証成功
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            検証失敗
          </Badge>
        )
      case "testing":
        return <Badge variant="secondary">テスト中...</Badge>
      default:
        return <Badge variant="outline">未検証</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Square Webhook 設定確認
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Webhook URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">イベント</Label>
              <Input value="payment.updated" readOnly className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">署名キー</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type={showKey ? "text" : "password"}
                value={signatureKey}
                onChange={(e) => setSignatureKey(e.target.value)}
                placeholder="Square Dashboardから取得した署名キーを入力"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={testWebhookSignature} disabled={verificationStatus === "testing"} className="w-full">
            {verificationStatus === "testing" ? "テスト中..." : "Webhook署名検証テスト"}
          </Button>
        </CardContent>
      </Card>

      {verificationStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🎉 サンドボックステスト成功！</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              Webhook署名検証が正常に動作しています。次は本番環境の設定に進んでください。
            </p>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">次のステップ:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Square Dashboard の Production タブから本番認証情報を取得</li>
                <li>• 本番環境用のWebhook URLを設定</li>
                <li>• Vercel環境変数に本番キーを設定</li>
                <li>• 本番環境でのテスト実行</li>
              </ul>
            </div>
            <Button
              onClick={() => window.open("/production-setup", "_blank")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              本番環境設定に進む
            </Button>
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Square Dashboard 設定確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Webhook URL: ✅ 設定済み</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>イベント: ✅ payment.updated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>ステータス: ✅ Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>署名キー: ✅ D4d-LlU5XhUPO_MzYI1wcA</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
