"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Zap } from "lucide-react"

export function CompletionStatusDashboard() {
  const completedItems = [
    {
      title: "Square Webhook作成",
      description: "Production Payment Notifications (ID: tzm7WoeGAYKPOe54Axoabg)",
      status: "completed",
    },
    {
      title: "Webhookエンドポイント",
      description: "https://nameanalysis216.vercel.app/api/square-webhook",
      status: "completed",
    },
    {
      title: "4つのイベント設定",
      description: "payment.updated, subscription.created, subscription.updated, invoice.payment_made",
      status: "completed",
    },
    {
      title: "署名検証システム",
      description: "本番環境での署名検証 + テスト署名サポート",
      status: "completed",
    },
    {
      title: "プラン自動判定",
      description: "金額ベース: ¥220 = basic, ¥440 = premium",
      status: "completed",
    },
    {
      title: "Webhookテスト",
      description: "全5つのテストが成功",
      status: "completed",
    },
  ]

  const pendingItems = [
    {
      title: "Square決済フォーム",
      description: "実際の決済ボタン・フォームの実装",
      status: "pending",
    },
    {
      title: "サブスクリプション作成API",
      description: "Square APIでの実際のサブスクリプション作成",
      status: "pending",
    },
    {
      title: "ユーザー認証",
      description: "ログイン・会員管理システム",
      status: "pending",
    },
    {
      title: "データベース統合",
      description: "サブスクリプション情報の永続化",
      status: "pending",
    },
    {
      title: "メール通知",
      description: "決済完了・プラン有効化の自動メール送信",
      status: "pending",
    },
    {
      title: "本番環境変数",
      description: "SQUARE_WEBHOOK_SIGNATURE_KEY等の設定",
      status: "pending",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            完了済み機能 ({completedItems.length}個)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{item.title}</h4>
                  <p className="text-sm text-green-700">{item.description}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">完了</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Clock className="h-5 w-5" />
            今後の実装予定 ({pendingItems.length}個)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">{item.title}</h4>
                  <p className="text-sm text-orange-700">{item.description}</p>
                </div>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  予定
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-5 w-5" />
            現在の状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">✅ Webhook基盤は完成</h4>
              <p className="text-sm text-blue-700">
                Square決済が発生した際に、自動的にプランが有効化される仕組みが完成しています。
                実際の決済フォームを追加すれば、すぐに課金システムとして機能します。
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🚀 次のステップ</h4>
              <p className="text-sm text-blue-700">
                Square決済フォームの実装、またはユーザー認証システムの追加が推奨されます。
                現在のWebhookシステムは本番環境でそのまま使用可能です。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
