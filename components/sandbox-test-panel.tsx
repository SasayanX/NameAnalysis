"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Play } from "lucide-react"

interface TestResult {
  test: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  duration?: number
}

export function SandboxTestPanel() {
  const [tests, setTests] = useState<TestResult[]>([
    { test: "Square SDK 初期化", status: "pending" },
    { test: "認証情報検証", status: "pending" },
    { test: "決済フォーム表示", status: "pending" },
    { test: "テスト決済実行", status: "pending" },
    { test: "Webhook受信", status: "pending" },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)

    for (let i = 0; i < tests.length; i++) {
      setTests((prev) => prev.map((test, index) => (index === i ? { ...test, status: "running" } : test)))

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // サンドボックステストのシミュレーション
      const success = Math.random() > 0.2 // 80%の成功率

      setTests((prev) =>
        prev.map((test, index) =>
          index === i
            ? {
                ...test,
                status: success ? "success" : "error",
                message: success ? "テスト成功" : "設定を確認してください",
                duration: Math.floor(Math.random() * 500) + 200,
              }
            : test,
        ),
      )
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Badge variant="secondary">実行中</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            成功
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">失敗</Badge>
      default:
        return <Badge variant="outline">待機中</Badge>
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          サンドボックステスト
          <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunning ? "テスト実行中..." : "テスト開始"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">成功</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">失敗</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{tests.length - successCount - errorCount}</div>
              <div className="text-sm text-gray-600">待機中</div>
            </div>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && <span className="text-xs text-gray-500">{test.duration}ms</span>}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>

          {successCount === tests.length && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ すべてのテストが成功しました！</p>
              <p className="text-green-700 text-sm mt-1">
                サンドボックス環境での動作確認が完了しました。本番環境の設定に進んでください。
              </p>
            </div>
          )}

          {errorCount > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ 一部のテストが失敗しました</p>
              <p className="text-red-700 text-sm mt-1">Square Dashboard の設定を確認してください。</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
