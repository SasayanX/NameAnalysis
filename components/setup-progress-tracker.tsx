"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  category: "square" | "vercel" | "testing"
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "square-account",
    title: "Square Developerアカウント作成",
    description: "https://developer.squareup.com/ でアカウント作成",
    completed: false,
    required: true,
    category: "square",
  },
  {
    id: "square-app",
    title: "Square アプリケーション作成",
    description: "Dashboard でアプリケーション作成",
    completed: false,
    required: true,
    category: "square",
  },
  {
    id: "square-credentials",
    title: "認証情報取得",
    description: "Application ID, Access Token, Location ID を取得",
    completed: false,
    required: true,
    category: "square",
  },
  {
    id: "square-webhook",
    title: "Webhook設定",
    description: "Webhook エンドポイント設定と署名キー取得",
    completed: false,
    required: true,
    category: "square",
  },
  {
    id: "square-plans",
    title: "サブスクリプションプラン作成",
    description: "ベーシック（¥330）・プレミアム（¥550）プラン作成",
    completed: false,
    required: true,
    category: "square",
  },
  {
    id: "vercel-env",
    title: "Vercel 環境変数設定",
    description: "Square の認証情報を環境変数に設定",
    completed: false,
    required: true,
    category: "vercel",
  },
  {
    id: "vercel-deploy",
    title: "Vercel デプロイ",
    description: "本番環境にデプロイ",
    completed: false,
    required: true,
    category: "vercel",
  },
  {
    id: "webhook-update",
    title: "Webhook URL更新",
    description: "デプロイ後のURLでWebhook設定を更新",
    completed: false,
    required: true,
    category: "vercel",
  },
  {
    id: "sandbox-test",
    title: "サンドボックステスト",
    description: "テスト環境で決済フローを確認",
    completed: false,
    required: true,
    category: "testing",
  },
  {
    id: "production-test",
    title: "本番環境テスト",
    description: "実際の決済フローをテスト",
    completed: false,
    required: false,
    category: "testing",
  },
]

export function SetupProgressTracker() {
  const [steps, setSteps] = useState<SetupStep[]>(SETUP_STEPS)

  const toggleStep = (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: !step.completed } : step)))
  }

  const completedSteps = steps.filter((step) => step.completed).length
  const totalSteps = steps.length
  const requiredSteps = steps.filter((step) => step.required)
  const completedRequiredSteps = requiredSteps.filter((step) => step.completed).length

  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)
  const requiredProgressPercentage = Math.round((completedRequiredSteps / requiredSteps.length) * 100)

  const categorySteps = {
    square: steps.filter((step) => step.category === "square"),
    vercel: steps.filter((step) => step.category === "vercel"),
    testing: steps.filter((step) => step.category === "testing"),
  }

  const isReadyForLaunch = requiredSteps.every((step) => step.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            マネタイズ化セットアップ進捗
            {isReadyForLaunch ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>全体進捗</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>必須項目</span>
                <span>{requiredProgressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isReadyForLaunch ? "bg-green-600" : "bg-yellow-600"
                  }`}
                  style={{ width: `${requiredProgressPercentage}%` }}
                />
              </div>
            </div>

            {isReadyForLaunch && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎉 ローンチ準備完了！</p>
                <p className="text-green-700 text-sm">
                  すべての必須項目が完了しました。本番環境でのテストを実行してください。
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.entries(categorySteps).map(([category, categoryStepList]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {category === "square" && "Square 設定"}
              {category === "vercel" && "Vercel デプロイ"}
              {category === "testing" && "テスト・検証"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStepList.map((step) => (
                <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => toggleStep(step.id)} className="p-0 h-auto">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${step.completed ? "line-through text-gray-500" : ""}`}>
                        {step.title}
                      </h4>
                      {step.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">必須</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
