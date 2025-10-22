"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, CreditCard, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"

interface SubscriptionStatus {
  plan: "free" | "basic" | "premium"
  status: "active" | "inactive" | "pending"
  usageToday: number
  usageLimit: number
  nextBillingDate?: string
  amount?: number
}

export function SubscriptionStatusCard() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    plan: "free",
    status: "inactive",
    usageToday: 2,
    usageLimit: 3,
  })

  useEffect(() => {
    // In a real app, fetch from API
    // For demo, simulate different states
    const mockStatus: SubscriptionStatus = {
      plan: "basic",
      status: "active",
      usageToday: 5,
      usageLimit: 10,
      nextBillingDate: "2024-02-15",
      amount: 220,
    }
    setStatus(mockStatus)
  }, [])

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "ベーシックプラン"
      case "premium":
        return "プレミアムプラン"
      default:
        return "無料プラン"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-500"
      case "premium":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">有効</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">処理中</Badge>
      default:
        return <Badge variant="secondary">無効</Badge>
    }
  }

  const usagePercentage = (status.usageToday / status.usageLimit) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPlanColor(status.plan)}`} />
              {getPlanName(status.plan)}
            </span>
            {getStatusBadge(status.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.status === "active" && status.nextBillingDate && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">プラン有効中</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>次回更新日: {new Date(status.nextBillingDate).toLocaleDateString("ja-JP")}</div>
                <div>月額: ¥{status.amount?.toLocaleString()}</div>
              </div>
            </div>
          )}

          {status.status === "pending" && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">決済処理中</span>
              </div>
              <p className="text-sm text-yellow-700">
                決済処理が完了次第、プランが自動的に有効化されます。通常1-2分で完了します。
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">今日の利用状況</span>
              <span className="text-sm text-gray-600">
                {status.usageToday} / {status.usageLimit === -1 ? "無制限" : status.usageLimit}
              </span>
            </div>
            {status.usageLimit !== -1 && <Progress value={usagePercentage} className="h-2" />}
            {status.usageLimit !== -1 && usagePercentage >= 80 && (
              <p className="text-sm text-orange-600 mt-1">利用制限に近づいています</p>
            )}
          </div>

          {status.plan === "free" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">プランをアップグレード</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">より多くの機能と利用回数でお楽しみいただけます</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/subscribe">プランを選択</Link>
              </Button>
            </div>
          )}

          {status.status === "active" && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  支払い方法
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  解約
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">利用履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-01-15", count: 8, type: "姓名判断" },
              { date: "2024-01-14", count: 5, type: "相性診断" },
              { date: "2024-01-13", count: 12, type: "姓名判断" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{item.date}</div>
                  <div className="text-sm text-gray-600">{item.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.count}回</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
