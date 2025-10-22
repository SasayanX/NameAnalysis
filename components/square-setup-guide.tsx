"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ExternalLink, Copy, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function SquareSetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [copiedText, setCopiedText] = useState<string>("")

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((n) => n !== stepNumber) : [...prev, stepNumber],
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(""), 2000)
  }

  const webhookUrl = "https://your-domain.vercel.app/api/square-webhook"

  const steps = [
    {
      id: 1,
      title: "Square Developerアカウント作成",
      description: "Square Developer Dashboardにアクセス",
      action: "https://developer.squareup.com/",
      details: ["Square Developerにサインアップ", "新しいアプリケーションを作成", "アプリ名: 'Name Analysis Tool'"],
    },
    {
      id: 2,
      title: "Webhook設定",
      description: "決済完了通知を受け取る設定",
      action: "Dashboard → Webhooks",
      details: [`Webhook URL: ${webhookUrl}`, "Events: payment.updated を選択", "署名キーをコピーして保存"],
    },
    {
      id: 3,
      title: "環境変数設定",
      description: "Vercelに署名キーを設定",
      action: "Vercel Dashboard",
      details: [
        "SQUARE_WEBHOOK_SIGNATURE_KEY=your_signature_key",
        "本番環境とプレビュー環境両方に設定",
        "デプロイして反映",
      ],
    },
    {
      id: 4,
      title: "決済テスト",
      description: "実際に¥220で決済テスト",
      action: "テスト決済実行",
      details: ["テストカード: 4111 1111 1111 1111", "CVV: 111, 有効期限: 12/25", "Webhook受信確認"],
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Square決済システム設定ガイド</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-white">
              完了: {completedSteps.length}/4
            </Badge>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedSteps.length / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id)

              return (
                <Card key={step.id} className={`${isCompleted ? "bg-green-50 border-green-200" : "bg-white"}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleStep(step.id)} className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${isCompleted ? "text-green-800" : "text-gray-900"}`}>
                            Step {step.id}: {step.title}
                          </h3>
                          {step.action.startsWith("http") && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={step.action} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                開く
                              </a>
                            </Button>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                        <div className="space-y-2">
                          {step.details.map((detail, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              <span className="flex-1">{detail}</span>
                              {detail.includes("webhook") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(webhookUrl, "webhook")}
                                >
                                  <Copy className="h-3 w-3" />
                                  {copiedText === "webhook" ? "コピー済み" : "コピー"}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {completedSteps.length === 4 && (
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">設定完了！</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  これで決済システムが動作します。実際にテスト決済を行ってください。
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            重要な注意点
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-amber-700">
            <p className="font-medium mb-2">本番環境での注意:</p>
            <ul className="space-y-1 ml-4">
              <li>• Webhook署名キーは必ず設定してください</li>
              <li>• テスト環境と本番環境のURLを分けてください</li>
              <li>• 決済テストは少額（¥100など）で行ってください</li>
              <li>• ログを確認して正常動作を確認してください</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
