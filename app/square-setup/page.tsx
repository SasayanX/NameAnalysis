import { SquareDeveloperSetupWizard } from "@/components/square-developer-setup-wizard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, CreditCard } from "lucide-react"

export default function SquareSetupPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Square Developer セットアップ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          姓名判断アプリのマネタイズ化に必要な Square Developer Console の設定を行います。
          各ステップを順番に実行してください。
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              セキュリティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              本番環境のアクセストークンは絶対に公開しないでください。Vercel の環境変数に安全に保存します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              決済処理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Square の安全な決済システムを使用して、月額サブスクリプションを実現します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              注意事項
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              サンドボックス環境でのテストを完了してから本番環境に移行してください。
            </p>
          </CardContent>
        </Card>
      </div>

      <SquareDeveloperSetupWizard />

      <Card>
        <CardHeader>
          <CardTitle>次のステップ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Square Developer の設定が完了したら、以下の手順に進んでください：</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>生成された環境変数を Vercel Dashboard に設定</li>
              <li>アプリケーションを Vercel にデプロイ</li>
              <li>Webhook URL を実際のドメインに更新</li>
              <li>サンドボックス環境でテスト実行</li>
              <li>本番環境での最終確認</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
