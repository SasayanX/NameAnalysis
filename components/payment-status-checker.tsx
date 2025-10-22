"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export default function PaymentStatusChecker() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const checkSubscriptions = () => {
    setIsLoading(true)
    try {
      // ローカルストレージから購読情報を取得
      const stored = localStorage.getItem("subscriptions")
      const subs = stored ? JSON.parse(stored) : []
      setSubscriptions(subs)
    } catch (error) {
      console.error("購読情報取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSubscriptions()
  }, [])

  const clearSubscriptions = () => {
    localStorage.removeItem("subscriptions")
    setSubscriptions([])
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>📊 決済状況確認</CardTitle>
        <CardDescription>現在の購読状況とプラン情報</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkSubscriptions} disabled={isLoading}>
            {isLoading ? "確認中..." : "状況更新"}
          </Button>
          <Button variant="outline" onClick={clearSubscriptions}>
            リセット
          </Button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">購読情報がありません</div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant={sub.plan === "premium" ? "default" : "secondary"}>
                      {sub.plan.toUpperCase()}プラン
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">顧客: {sub.customerId}</p>
                  </div>
                  <Badge variant={sub.status === "active" ? "default" : "destructive"}>{sub.status}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p>注文ID: {sub.orderId}</p>
                  <p>有効化: {new Date(sub.activatedAt).toLocaleString()}</p>
                  <p>期限: {new Date(sub.expiresAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
