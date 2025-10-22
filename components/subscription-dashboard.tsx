"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, User, Clock, CheckCircle, XCircle } from "lucide-react"

interface SubscriptionStatus {
  plan: "free" | "basic" | "premium"
  isActive: boolean
  expiresAt?: string
  usageCount: number
  usageLimit: number
  lastPayment?: string
}

export default function SubscriptionDashboard() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    plan: "free",
    isActive: false,
    usageCount: 0,
    usageLimit: 3,
  })

  useEffect(() => {
    // ローカルストレージから現在のプラン状況を取得
    const savedStatus = localStorage.getItem("subscriptionStatus")
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus)
        setStatus(parsed)
      } catch (error) {
        console.error("Failed to parse subscription status:", error)
      }
    }
  }, [])

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "ベーシックプラン"
      case "premium":
        return "プレミアムプラン"
      default:
        return "フリープラン"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString("ja-JP")
  }

  const isExpired = status.expiresAt && new Date(status.expiresAt) < new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 現在のプラン状況 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            現在のプラン
          </CardTitle>
          <CardDescription>あなたの現在のサブスクリプション状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={getPlanBadgeColor(status.plan)}>{getPlanName(status.plan)}</Badge>
              {status.isActive && !isExpired ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">有効</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">無効</span>
                </div>
              )}
            </div>
            {status.plan === "free" && (
              <Button asChild>
                <a href="/subscribe">プランをアップグレード</a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">有効期限</p>
                <p className="font-medium">{formatDate(status.expiresAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">最終支払い</p>
                <p className="font-medium">{formatDate(status.lastPayment)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">月額料金</p>
                <p className="font-medium">
                  {status.plan === "basic" ? "¥220" : status.plan === "premium" ? "¥550" : "¥0"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 利用状況 */}
      <Card>
        <CardHeader>
          <CardTitle>利用状況</CardTitle>
          <CardDescription>今月の姓名判断利用回数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>利用回数</span>
              <span className="font-medium">
                {status.usageCount} / {status.usageLimit === -1 ? "無制限" : status.usageLimit}
              </span>
            </div>

            {status.usageLimit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((status.usageCount / status.usageLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            )}

            {status.usageCount >= status.usageLimit && status.usageLimit !== -1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  今月の利用上限に達しました。プランをアップグレードして無制限でご利用ください。
                </p>
                <Button className="mt-2" size="sm" asChild>
                  <a href="/subscribe">プランをアップグレード</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* プラン比較 */}
      <Card>
        <CardHeader>
          <CardTitle>プラン比較</CardTitle>
          <CardDescription>各プランの機能比較</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">機能</th>
                  <th className="text-center py-2">フリー</th>
                  <th className="text-center py-2">ベーシック</th>
                  <th className="text-center py-2">プレミアム</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">月間利用回数</td>
                  <td className="text-center">3回</td>
                  <td className="text-center">30回</td>
                  <td className="text-center">無制限</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">基本姓名判断</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">詳細分析</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">相性診断</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">PDF出力</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-2">月額料金</td>
                  <td className="text-center">無料</td>
                  <td className="text-center">¥220</td>
                  <td className="text-center">¥550</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
