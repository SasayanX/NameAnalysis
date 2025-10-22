import { SetupProgressTracker } from "@/components/setup-progress-tracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Settings, TestTube } from "lucide-react"

export default function SetupGuidePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">マネタイズ化セットアップガイド</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          姓名判断アプリのマネタイズ化を完了するための手順です。各ステップを順番に実行してください。
        </p>
      </div>

      <SetupProgressTracker />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Square Developer 設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Square Developer アカウントの作成から認証情報の取得まで</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="https://developer.squareup.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Square Developer Console
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a
                  href="https://developer.squareup.com/docs/subscriptions-api/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Subscriptions API ドキュメント
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              テスト・検証
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">決済フローとWebhookの動作確認</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/payment-test">
                  <TestTube className="h-4 w-4 mr-2" />
                  決済テストページ
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/webhook-test">
                  <Settings className="h-4 w-4 mr-2" />
                  Webhook テストページ
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>重要な注意事項</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">⚠️ 本番環境での注意</h4>
              <p className="text-yellow-700 text-sm mt-1">
                本番環境では実際の決済が発生します。必ずサンドボックス環境でのテストを完了してからデプロイしてください。
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">💡 セキュリティ</h4>
              <p className="text-blue-700 text-sm mt-1">
                Access Token や Webhook 署名キーは絶対に公開しないでください。Vercel
                の環境変数に安全に保存してください。
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">✅ 完了後</h4>
              <p className="text-green-700 text-sm mt-1">
                すべての設定が完了したら、実際のユーザーでの決済テストを行い、問題がないことを確認してください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
