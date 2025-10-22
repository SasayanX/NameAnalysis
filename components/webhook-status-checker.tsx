"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface WebhookTest {
  id: string
  name: string
  description: string
  status: "pending" | "success" | "error"
  result?: string
}

export function WebhookStatusChecker() {
  const [tests, setTests] = useState<WebhookTest[]>([
    {
      id: "endpoint",
      name: "Webhook エンドポイント",
      description: "/api/square-webhook が正常に応答するか",
      status: "pending",
    },
    {
      id: "signature",
      name: "署名検証",
      description: "Webhook署名の検証が正常に動作するか",
      status: "pending",
    },
    {
      id: "payment",
      name: "決済イベント処理",
      description: "payment.updated イベントの処理",
      status: "pending",
    },
    {
      id: "subscription",
      name: "サブスクリプションイベント処理",
      description: "subscription.* イベントの処理",
      status: "pending",
    },
  ])

  const [isTestingAll, setIsTestingAll] = useState(false)

  const testWebhookEndpoint = async () => {
    try {
      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": "test-signature",
        },
        body: JSON.stringify({
          type: "test.event",
          data: { test: true },
        }),
      })

      const result = await response.json()

      setTests((prev) =>
        prev.map((test) =>
          test.id === "endpoint"
            ? { ...test, status: response.ok ? "success" : "error", result: JSON.stringify(result) }
            : test,
        ),
      )
    } catch (error) {
      setTests((prev) =>
        prev.map((test) => (test.id === "endpoint" ? { ...test, status: "error", result: `エラー: ${error}` } : test)),
      )
    }
  }

  const testSignatureVerification = async () => {
    try {
      // 正しい署名でテスト
      const testPayload = JSON.stringify({ type: "test.signature", data: {} })
      const signature = "test-signature"

      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": signature,
        },
        body: testPayload,
      })

      const result = await response.json()

      setTests((prev) =>
        prev.map((test) =>
          test.id === "signature"
            ? { ...test, status: response.ok ? "success" : "error", result: JSON.stringify(result) }
            : test,
        ),
      )
    } catch (error) {
      setTests((prev) =>
        prev.map((test) => (test.id === "signature" ? { ...test, status: "error", result: `エラー: ${error}` } : test)),
      )
    }
  }

  const testPaymentEvent = async () => {
    try {
      const paymentEvent = {
        type: "payment.updated",
        data: {
          object: {
            payment: {
              id: "test-payment-id",
              status: "COMPLETED",
              amount_money: {
                amount: 22000, // ¥220
                currency: "JPY",
              },
              order_id: "test-order-id",
              buyer_email_address: "test@example.com",
            },
          },
        },
      }

      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": "test-signature",
        },
        body: JSON.stringify(paymentEvent),
      })

      const result = await response.json()

      setTests((prev) =>
        prev.map((test) =>
          test.id === "payment"
            ? { ...test, status: response.ok ? "success" : "error", result: JSON.stringify(result) }
            : test,
        ),
      )
    } catch (error) {
      setTests((prev) =>
        prev.map((test) => (test.id === "payment" ? { ...test, status: "error", result: `エラー: ${error}` } : test)),
      )
    }
  }

  const testSubscriptionEvent = async () => {
    try {
      const subscriptionEvent = {
        type: "subscription.created",
        data: {
          object: {
            id: "test-subscription-id",
            plan_id: "basic-plan",
            customer_id: "test-customer-id",
            status: "ACTIVE",
          },
        },
      }

      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": "test-signature",
        },
        body: JSON.stringify(subscriptionEvent),
      })

      const result = await response.json()

      setTests((prev) =>
        prev.map((test) =>
          test.id === "subscription"
            ? { ...test, status: response.ok ? "success" : "error", result: JSON.stringify(result) }
            : test,
        ),
      )
    } catch (error) {
      setTests((prev) =>
        prev.map((test) =>
          test.id === "subscription" ? { ...test, status: "error", result: `エラー: ${error}` } : test,
        ),
      )
    }
  }

  const runAllTests = async () => {
    setIsTestingAll(true)

    // すべてのテストをpendingにリセット
    setTests((prev) => prev.map((test) => ({ ...test, status: "pending" as const })))

    // 順番にテストを実行
    await testWebhookEndpoint()
    await new Promise((resolve) => setTimeout(resolve, 500))

    await testSignatureVerification()
    await new Promise((resolve) => setTimeout(resolve, 500))

    await testPaymentEvent()
    await new Promise((resolve) => setTimeout(resolve, 500))

    await testSubscriptionEvent()

    setIsTestingAll(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            成功
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">エラー</Badge>
      case "pending":
        return <Badge variant="secondary">待機中</Badge>
      default:
        return <Badge variant="outline">未実行</Badge>
    }
  }

  const successCount = tests.filter((test) => test.status === "success").length
  const totalTests = tests.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Webhook テスト結果
            <Button onClick={runAllTests} disabled={isTestingAll} className="flex items-center gap-2">
              {isTestingAll && <RefreshCw className="h-4 w-4 animate-spin" />}
              すべてテスト実行
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">進捗状況</span>
              <span className="text-sm font-medium">
                {successCount}/{totalTests} 完了
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(successCount / totalTests) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {tests.map((test) => (
        <Card key={test.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <span>{test.name}</span>
              </div>
              {getStatusBadge(test.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{test.description}</p>

            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  switch (test.id) {
                    case "endpoint":
                      testWebhookEndpoint()
                      break
                    case "signature":
                      testSignatureVerification()
                      break
                    case "payment":
                      testPaymentEvent()
                      break
                    case "subscription":
                      testSubscriptionEvent()
                      break
                  }
                }}
              >
                個別テスト実行
              </Button>
            </div>

            {test.result && (
              <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                <h5 className="font-medium mb-2">テスト結果:</h5>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{test.result}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
