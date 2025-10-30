"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Copy, ArrowRight, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SquareWebhookCreationGuide() {
  const [currentStep, setCurrentStep] = useState(2)
  const [signatureKey, setSignatureKey] = useState("")
  const [envVars, setEnvVars] = useState("")
  const { toast } = useToast()

  const webhookUrl = "https://nameanalysis216.vercel.app/api/square-webhook"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    })
  }

  const generateEnvVars = () => {
    if (!signatureKey.trim()) {
      toast({
        title: "エラー",
        description: "Signature Keyを入力してください",
        variant: "destructive",
      })
      return
    }

    const envContent = `# Square Production Environment Variables
SQUARE_APPLICATION_ID=sq0idp-CbbdF82IxFWDSqf8D2S0Pw
SQUARE_ACCESS_TOKEN=EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG
SQUARE_LOCATION_ID=L0YH3ASTVNNMA8999
SQUARE_WEBHOOK_SIGNATURE_KEY=${signatureKey}
NODE_ENV=production`

    setEnvVars(envContent)
    setCurrentStep(6)
    toast({
      title: "環境変数生成完了",
      description: "Vercel Dashboardで設定してください",
    })
  }

  const steps = [
    {
      title: "「Mainichi Seimei Handan」アプリを開く",
      description: "Square Developer Console で「Open」ボタンをクリック",
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">完了:</h4>
                <p className="text-sm text-green-700 mt-1">
                  アプリケーション設定画面が開かれました。左サイドバーに各種設定メニューが表示されています。
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "左メニューから「Webhooks」を選択",
      description: "アプリケーション設定画面で Webhooks セクションに移動",
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">現在の画面で実行:</h4>
                <p className="text-sm text-blue-700 mt-1">
                  左サイドバーの「Webhooks」をクリックしてWebhook管理画面に移動してください。
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">確認ポイント:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 左サイドバーに「Webhooks」メニューが表示されている</li>
              <li>• 現在サンドボックス用のWebhookが1つ表示されているはず</li>
              <li>• 「Create Webhook」ボタンが表示される</li>
            </ul>
          </div>
          <Button onClick={() => setCurrentStep(3)} className="w-full">
            Webhooksページに移動しました
          </Button>
        </div>
      ),
    },
    {
      title: "「Create Webhook」をクリック",
      description: "新しいWebhookを作成します",
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">作成フォームが表示されます:</h4>
            <p className="text-sm text-green-700">Webhook作成フォームが開いたら、次のステップで設定値を入力します。</p>
          </div>
          <Button onClick={() => setCurrentStep(4)} className="w-full">
            Create Webhookをクリックしました
          </Button>
        </div>
      ),
    },
    {
      title: "Webhook設定を入力",
      description: "以下の設定値を正確に入力してください",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-3">
                <div>
                  <Label className="font-medium text-gray-800">Name:</Label>
                  <div className="bg-white p-2 rounded border font-mono text-sm mt-1 flex items-center justify-between">
                    Production Payment Notifications
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("Production Payment Notifications")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-gray-800">URL:</Label>
                  <div className="bg-white p-2 rounded border font-mono text-sm mt-1 flex items-center justify-between">
                    {webhookUrl}
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-gray-800">Environment:</Label>
                  <div className="bg-red-50 p-2 rounded border mt-1">
                    <span className="font-mono text-sm text-red-600 font-bold">Production（重要）</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">選択するイベント:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-mono text-sm">payment.updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-mono text-sm">subscription.created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-mono text-sm">subscription.updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-mono text-sm">subscription.canceled</span>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => setCurrentStep(5)} className="w-full">
            設定を入力して「Create Webhook」をクリックしました
          </Button>
        </div>
      ),
    },
    {
      title: "Signature Keyをコピー",
      description: "作成完了後に表示される署名キーを取得",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">重要:</h4>
                <p className="text-sm text-red-700">
                  Signature Keyは一度しか表示されません。必ずコピーして保存してください。
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="signature-key" className="font-medium">
              Signature Key（32文字）:
            </Label>
            <Input
              id="signature-key"
              value={signatureKey}
              onChange={(e) => setSignatureKey(e.target.value)}
              placeholder="Square Dashboardで表示された32文字の文字列"
              className="font-mono text-sm mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">例: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</p>
          </div>

          <Button onClick={generateEnvVars} disabled={!signatureKey.trim()} className="w-full">
            環境変数を生成
          </Button>
        </div>
      ),
    },
    {
      title: "Vercel環境変数設定",
      description: "生成された環境変数をVercel Dashboardで設定",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">設定完了</h4>
                <p className="text-sm text-green-700">
                  すべての認証情報が揃いました。Vercel Dashboardで環境変数を設定してください。
                </p>
              </div>
            </div>
          </div>

          {envVars && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">環境変数（Vercel Dashboard用）:</Label>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(envVars)}>
                  <Copy className="h-4 w-4 mr-2" />
                  全てコピー
                </Button>
              </div>
              <Textarea value={envVars} readOnly className="font-mono text-sm h-32" />
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Vercel設定手順:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Vercel Dashboard → nameanalysis216プロジェクト選択</li>
              <li>Settings → Environment Variables</li>
              <li>上記の環境変数を1つずつ追加（Production環境にチェック）</li>
              <li>「Redeploy」ボタンでプロジェクトを再デプロイ</li>
              <li>マネタイズ機能の動作確認</li>
            </ol>
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
          <CardTitle className="flex items-center justify-between">
            Square Production Webhook作成
            <span className="text-sm font-normal text-gray-500">
              ステップ {currentStep} / {steps.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
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
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current step */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{steps[currentStep - 1].title}</h3>
                <p className="text-gray-600">{steps[currentStep - 1].description}</p>
              </div>
              {steps[currentStep - 1].content}
            </div>
          </div>
        </CardContent>
      </Card>

      {currentStep === 6 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">🎉 マネタイズ機能完成！</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-purple-700">
                環境変数設定とデプロイ完了後、月額330円・550円プランでの収益化が開始されます。
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-800">完成後の機能:</h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• 無料ユーザー: 1日3回まで姓名判断</li>
                  <li>• ベーシックプラン（330円/月）: 1日10回まで</li>
                  <li>• プレミアムプラン（550円/月）: 無制限</li>
                  <li>• 自動課金・プラン管理</li>
                  <li>• 決済完了時の自動プラン有効化</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
