"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  timestamp: string
  type: string
  status: "success" | "error"
  data?: any
  error?: string
}

export function WebhookTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testWebhookEndpoint = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/square-webhook", {
        method: "GET",
      })
      const data = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: "GET Test",
          status: response.ok ? "success" : "error",
          data,
        },
      ])

      toast({
        title: response.ok ? "Webhookエンドポイント正常" : "Webhookエンドポイントエラー",
        description: response.ok ? "エンドポイントが正常に応答しています" : "エンドポイントに問題があります",
        variant: response.ok ? "default" : "destructive",
      })
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: "GET Test",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ])

      toast({
        title: "テストエラー",
        description: "Webhookエンドポイントのテストに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const simulateWebhookEvent = async (eventType: string) => {
    setIsLoading(true)
    try {
      const mockEvent: any = {
        type: eventType,
        data: {
          object: {},
        },
      }

      // イベントタイプに応じてモックデータを作成
      switch (eventType) {
        case "payment.updated":
          mockEvent.data.object = {
            payment: {
              id: "test-payment-id-" + Date.now(),
              status: "COMPLETED",
              amount_money: {
                amount: 33000,
                currency: "JPY",
              },
              order_id: "test-order-id-" + Date.now(),
              buyer_email_address: "test@example.com",
              created_at: new Date().toISOString(),
            },
          }
          break
        case "subscription.created":
          mockEvent.data.object = {
            id: "test-subscription-id-" + Date.now(),
            status: "ACTIVE",
            plan_id: "basic-plan",
            customer_id: "test-customer-id",
            created_at: new Date().toISOString(),
          }
          break
        case "subscription.updated":
          mockEvent.data.object = {
            id: "test-subscription-id-" + Date.now(),
            status: "ACTIVE",
            plan_id: "premium-plan",
            customer_id: "test-customer-id",
            updated_at: new Date().toISOString(),
          }
          break
        case "invoice.payment_made":
          mockEvent.data.object = {
            id: "test-invoice-id-" + Date.now(),
            status: "PAID",
            amount_money: {
              amount: 55000,
              currency: "JPY",
            },
            payment_requests: [
              {
                request_type: "BALANCE",
                due_date: new Date().toISOString(),
              },
            ],
          }
          break
      }

      const response = await fetch("/api/square-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-square-signature": "test-signature-" + Date.now(),
        },
        body: JSON.stringify(mockEvent),
      })

      const data = await response.json()

      setTestResults((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: `${eventType} Simulation`,
          status: response.ok ? "success" : "error",
          data,
        },
      ])

      toast({
        title: response.ok ? "イベントシミュレーション成功" : "イベントシミュレーション失敗",
        description: response.ok ? `${eventType} イベントが正常に処理されました` : "イベント処理に失敗しました",
        variant: response.ok ? "default" : "destructive",
      })
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: `${eventType} Simulation`,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ])

      toast({
        title: "シミュレーションエラー",
        description: `${eventType} イベントのシミュレーションに失敗しました`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    toast({
      title: "テスト結果をクリア",
      description: "すべてのテスト結果を削除しました",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Webhook テストパネル
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={testWebhookEndpoint}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-blue-50 hover:bg-blue-100"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                エンドポイントテスト
              </Button>
              <Button
                onClick={() => simulateWebhookEvent("payment.updated")}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100"
              >
                決済完了テスト
              </Button>
              <Button
                onClick={() => simulateWebhookEvent("subscription.created")}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-purple-50 hover:bg-purple-100"
              >
                サブスク作成テスト
              </Button>
              <Button
                onClick={() => simulateWebhookEvent("subscription.updated")}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-orange-50 hover:bg-orange-100"
              >
                サブスク更新テスト
              </Button>
              <Button
                onClick={() => simulateWebhookEvent("invoice.payment_made")}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-yellow-50 hover:bg-yellow-100"
              >
                請求書支払いテスト
              </Button>
              <Button onClick={clearResults} variant="destructive" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                結果クリア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>テスト結果 ({testResults.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults
                .slice()
                .reverse()
                .map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.type}</span>
                        <Badge variant={result.status === "success" ? "default" : "destructive"} className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
