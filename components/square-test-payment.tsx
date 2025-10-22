"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function SquareTestPayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleTestPayment = async () => {
    setIsLoading(true)
    setResult("")

    try {
      // Square Web Payments SDKを使用したテスト決済
      const response = await fetch("/api/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment.updated",
          data: {
            object: {
              payment: {
                status: "COMPLETED",
                amount_money: {
                  amount: 22000, // ¥220 (cents)
                  currency: "JPY",
                },
                order_id: "test-order-" + Date.now(),
                buyer_email_address: "test@example.com",
              },
            },
          },
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`エラー: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Square決済テスト</CardTitle>
        <CardDescription>Webhook動作確認用のテストボタン</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTestPayment} disabled={isLoading} className="w-full">
          {isLoading ? "処理中..." : "¥220 テスト決済実行"}
        </Button>

        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">結果:</h3>
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold">テスト内容:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>¥220の決済完了イベントをシミュレート</li>
            <li>Webhook受信確認</li>
            <li>ベーシックプラン有効化確認</li>
            <li>署名検証テスト</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
