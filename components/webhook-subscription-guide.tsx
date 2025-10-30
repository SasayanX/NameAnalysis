"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Copy, ArrowRight, AlertTriangle, ExternalLink, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WebhookSubscriptionGuide() {
  const [currentStep, setCurrentStep] = useState(1)
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

    const envContent = `SQUARE_APPLICATION_ID=sq0idp-CbbdF82IxFWDSqf8D2S0Pw
SQUARE_ACCESS_TOKEN=EAAAl70JyBFgM448WhMHfLmnejv8XSPLQnAo39RlEiaoqQkSRpTG7CYB57D26vGG
SQUARE_LOCATION_ID=L0YH3ASTVNNMA8999
SQUARE_WEBHOOK_SIGNATURE_KEY=${signatureKey}
NODE_ENV=production`

    setEnvVars(envContent)
    setCurrentStep(5)
    toast({
      title: "環境変数生成完了",
      description: "Vercel Dashboardで設定してください",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Add a webhook subscription 設定手順
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-700 font-medium">
              Square Developer Consoleで「Add subscription」ボタンをクリックして、以下の手順で設定してください。
            </p>
          </div>
        </CardContent>
      </Card>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              ステップ1: Add subscriptionをクリック
              <span className="text-sm font-normal text-gray-500">1/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">現在の画面で実行:</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Square Developer Consoleの右上にある青い「Add subscription」ボタンをクリックしてください。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">クリック後に表示される内容:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Webhook作成フォームが開きます</li>
                  <li>• 「Name」「URL」「Events」などの入力フィールドが表示されます</li>
                  <li>• 「Production」環境が選択されていることを確認してください</li>
                </ul>
              </div>

              <Button onClick={() => setCurrentStep(2)} className="w-full">
                Add subscriptionをクリックしました
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              ステップ2: 基本設定を入力
              <span className="text-sm font-normal text-gray-500">2/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3">入力する設定値:</h4>

                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium text-gray-700">Name (名前):</Label>
                      <div className="bg-white p-3 rounded border font-mono text-sm mt-1 flex items-center justify-between">
                        Production Payment Notifications
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("Production Payment Notifications")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        この名前をコピーして「Name」フィールドに貼り付けてください
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium text-gray-700">URL (エンドポイントURL):</Label>
                      <div className="bg-white p-3 rounded border font-mono text-sm mt-1 flex items-center justify-between">
                        {webhookUrl}
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        このURLをコピーして「URL」フィールドに貼り付けてください
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium text-gray-700">Environment (環境):</Label>
                      <div className="bg-red-50 p-3 rounded border mt-1">
                        <span className="font-mono text-sm text-red-600 font-bold">Production</span>
                      </div>
                      <p className="text-xs text-red-500 mt-1 font-medium">必ずProductionを選択してください（重要）</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => setCurrentStep(3)} className="w-full">
                基本設定を入力しました
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              ステップ3: イベントを選択
              <span className="text-sm font-normal text-gray-500">3/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">選択するイベント（4つ）:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">payment.updated</span>
                    <span className="text-xs text-gray-500">- 決済状況の更新</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">subscription.created</span>
                    <span className="text-xs text-gray-500">- サブスクリプション作成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">subscription.updated</span>
                    <span className="text-xs text-gray-500">- サブスクリプション更新</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">subscription.canceled</span>
                    <span className="text-xs text-gray-500">- サブスクリプション解約</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">イベント選択方法:</h4>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>「Events」セクションでイベントを検索または選択</li>
                  <li>上記4つのイベントにチェックを入れる</li>
                  <li>他のイベントは選択しない（不要）</li>
                  <li>選択完了後、「Create」または「Save」ボタンをクリック</li>
                </ol>
              </div>

              <Button onClick={() => setCurrentStep(4)} className="w-full">
                イベントを選択して作成ボタンをクリックしました
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              ステップ4: Signature Keyを取得
              <span className="text-sm font-normal text-gray-500">4/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">重要な注意事項:</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Webhook作成完了後に表示されるSignature Keyは一度しか表示されません。
                      必ずコピーして保存してください。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">作成完了後の画面:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 「Webhook created successfully」のようなメッセージが表示される</li>
                  <li>• Signature Keyが32文字の文字列で表示される</li>
                  <li>• 「Copy」ボタンまたは手動でコピーする</li>
                  <li>• この画面を閉じると二度と表示されない</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="signature-key" className="font-medium">
                  Signature Key（32文字）:
                </Label>
                <Input
                  id="signature-key"
                  value={signatureKey}
                  onChange={(e) => setSignatureKey(e.target.value)}
                  placeholder="Square Dashboardで表示された32文字の文字列を貼り付け"
                  className="font-mono text-sm mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">例: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</p>
              </div>

              <Button onClick={generateEnvVars} disabled={!signatureKey.trim()} className="w-full">
                環境変数を生成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 5 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />🎉 Webhook設定完了！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">すべての認証情報が揃いました</h4>
                    <p className="text-sm text-green-700">
                      次はVercel Dashboardで環境変数を設定してマネタイズ機能を有効化します。
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">環境変数（Vercel Dashboard用）:</Label>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(envVars)}>
                    <Copy className="h-4 w-4 mr-2" />
                    全てコピー
                  </Button>
                </div>
                <Textarea value={envVars} readOnly className="font-mono text-sm h-32 bg-gray-50" />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">次のステップ - Vercel設定:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside bg-white p-3 rounded border">
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

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">完成後の機能:</h4>
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
