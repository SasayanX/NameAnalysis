"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ExternalLink } from "lucide-react"
import { useState } from "react"

interface SetupStep {
  id: string
  title: string
  description: string
  status: "pending" | "completed"
  action?: string
  url?: string
}

export function QuickSetupGuide() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "sandbox-test",
      title: "サンドボックステスト",
      description: "提供されたサンドボックス情報でテスト実行",
      status: "pending",
      action: "テスト実行",
      url: "/payment-test",
    },
    {
      id: "production-credentials",
      title: "本番環境認証情報",
      description: "Square Dashboard から本番環境の認証情報を取得",
      status: "pending",
      action: "Square Dashboard",
      url: "https://developer.squareup.com/",
    },
    {
      id: "webhook-setup",
      title: "Webhook設定",
      description: "本番環境でWebhookエンドポイントを設定",
      status: "pending",
    },
    {
      id: "environment-variables",
      title: "環境変数設定",
      description: "Vercel Dashboard で本番環境変数を設定",
      status: "pending",
      action: "Vercel Dashboard",
      url: "https://vercel.com/dashboard",
    },
    {
      id: "production-test",
      title: "本番テスト",
      description: "本番環境での決済フローテスト",
      status: "pending",
    },
  ])

  const toggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status: step.status === "completed" ? "pending" : "completed" } : step,
      ),
    )
  }

  const completedCount = steps.filter((step) => step.status === "completed").length
  const progressPercentage = (completedCount / steps.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          セットアップ進捗
          <span className="text-sm font-normal">
            {completedCount}/{steps.length} 完了
          </span>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <button onClick={() => toggleStep(step.id)} className="mt-1 flex-shrink-0">
                {step.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${step.status === "completed" ? "text-green-700 line-through" : ""}`}>
                    {index + 1}. {step.title}
                  </h3>
                  {step.action && step.url && (
                    <Button variant="outline" size="sm" asChild className="flex items-center gap-1 bg-transparent">
                      <a href={step.url} target="_blank" rel="noopener noreferrer">
                        {step.action}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {completedCount === steps.length && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">🎉 セットアップ完了！</p>
            <p className="text-green-700 text-sm mt-1">
              マネタイズ機能が有効になりました。本番環境でテストしてください。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
