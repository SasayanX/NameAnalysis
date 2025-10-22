import { WebhookTestPanel } from "@/components/webhook-test-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink } from "lucide-react"

export default function WebhookTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Webhook テスト</h1>
          <p className="text-gray-600">
            作成されたSquare Webhookの動作をテストして、正常に機能することを確認してください。
          </p>
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Square Webhook 作成完了
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Webhook名:</span> Production Payment Notifications
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">ステータス:</span>
                <Badge className="bg-green-500">Enabled</Badge>
              </div>
              <div>
                <span className="font-medium">Webhook ID:</span> tzm7WoeGAYKPOe54Axoabg
              </div>
              <div>
                <span className="font-medium">API Version:</span> 2025-06-18
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">URL:</span>
                <a
                  href="https://nameanalysis216.vercel.app/api/square-webhook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  https://nameanalysis216.vercel.app/api/square-webhook
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <span className="font-medium">設定済みイベント (4個):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline">payment.updated</Badge>
                  <Badge variant="outline">subscription.created</Badge>
                  <Badge variant="outline">subscription.updated</Badge>
                  <Badge variant="outline">invoice.payment_made</Badge>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <a
                href="https://developer.squareup.com/console/en/apps/sq0idp-Cbbdf82bfWDSqfRD2S0Pw/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
              >
                Square Developer Console で確認
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>動作テスト</CardTitle>
            <CardDescription>
              各Webhookイベントをシミュレーションして、正常に処理されることを確認します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WebhookTestPanel />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">次のステップ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>✅ Webhookテストが成功したら、以下の手順で本番環境の準備を進めてください：</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Square決済フォームの実装</li>
              <li>プラン選択画面の作成</li>
              <li>ユーザー認証システムの統合</li>
              <li>サブスクリプション管理画面の構築</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
