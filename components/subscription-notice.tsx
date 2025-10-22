"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Bell } from "lucide-react"

export function SubscriptionNotice() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Clock className="h-5 w-5" />
          現在は月額購入制です
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-700">
          <p className="mb-2">
            <strong>現在の仕組み：</strong>毎月手動でお支払いいただく形式です
          </p>
          <ul className="space-y-1 ml-4">
            <li>• ¥220/¥440を毎月お支払い</li>
            <li>• 支払い忘れの場合は無料プランに戻ります</li>
            <li>• いつでも支払い停止可能</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
          <Bell className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            <strong>近日予定：</strong>自動課金システムを準備中です
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-white rounded border">
            <strong className="text-green-600">メリット</strong>
            <ul className="mt-1 space-y-1">
              <li>• 支払い忘れで自動停止</li>
              <li>• 解約手続き不要</li>
              <li>• 気軽に試せる</li>
            </ul>
          </div>
          <div className="p-2 bg-white rounded border">
            <strong className="text-amber-600">注意点</strong>
            <ul className="mt-1 space-y-1">
              <li>• 毎月手動支払い</li>
              <li>• 支払い忘れリスク</li>
              <li>• 通知機能なし</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
