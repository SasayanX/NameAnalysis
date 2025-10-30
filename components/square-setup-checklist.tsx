"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ExternalLink, AlertCircle } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  link?: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "square-account",
    title: "Square アカウント作成",
    description: "Square Developer Console でアカウントを作成",
    completed: false,
    required: true,
    link: "https://developer.squareup.com/",
  },
  {
    id: "application-created",
    title: "アプリケーション作成",
    description: "「姓名判断アプリ」アプリケーションを作成",
    completed: false,
    required: true,
  },
  {
    id: "sandbox-credentials",
    title: "サンドボックス認証情報取得",
    description: "テスト用の Application ID, Access Token, Location ID を取得",
    completed: false,
    required: true,
  },
  {
    id: "production-credentials",
    title: "本番環境認証情報取得",
    description: "本番用の Application ID, Access Token, Location ID を取得",
    completed: false,
    required: true,
  },
  {
    id: "webhook-endpoint",
    title: "Webhook エンドポイント設定",
    description: "決済イベント受信用の Webhook を設定",
    completed: false,
    required: true,
  },
  {
    id: "subscription-plans",
    title: "サブスクリプションプラン作成",
    description: "ベーシック（¥330）とプレミアム（¥550）プランを作成",
    completed: false,
    required: true,
  },
  {
    id: "webhook-signature",
    title: "Webhook 署名キー取得",
    description: "Webhook 署名検証用のキーを取得",
    completed: false,
    required: true,
  },
  {
    id: "environment-variables",
    title: "環境変数準備",
    description: "取得した認証情報を環境変数形式で準備",
    completed: false,
    required: true,
  },
]

export function SquareSetupChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS)

  const toggleItem = (itemId: string) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)))
  }

  const completedItems = items.filter((item) => item.completed).length
  const requiredItems = items.filter((item) => item.required)
  const completedRequiredItems = requiredItems.filter((item) => item.completed).length

  const progressPercentage = Math.round((completedItems / items.length) * 100)
  const requiredProgressPercentage = Math.round((completedRequiredItems / requiredItems.length) * 100)

  const isSetupComplete = requiredItems.every((item) => item.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Square セットアップ チェックリスト
            {isSetupComplete ? (
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
                    isSetupComplete ? "bg-green-600" : "bg-yellow-600"
                  }`}
                  style={{ width: `${requiredProgressPercentage}%` }}
                />
              </div>
            </div>

            {isSetupComplete && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎉 Square セットアップ完了！</p>
                <p className="text-green-700 text-sm">
                  すべての必須項目が完了しました。次は Vercel での環境変数設定に進んでください。
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Button variant="ghost" size="sm" onClick={() => toggleItem(item.id)} className="p-0 h-auto">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${item.completed ? "line-through text-gray-500" : ""}`}>
                      {item.title}
                    </h4>
                    {item.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">必須</span>}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.link && (
                    <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        リンクを開く
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
