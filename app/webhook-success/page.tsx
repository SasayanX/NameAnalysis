import { WebhookSuccessConfirmation } from "@/components/webhook-success-confirmation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WebhookSuccessPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Webhook 設定完了</h1>
          <p className="text-gray-600">Square Webhookが正常に作成されました。次はテストを実行してください。</p>
        </div>

        <WebhookSuccessConfirmation />

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/webhook-test">テストページへ進む</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
