import { SquareWebhookEventsCorrected } from "@/components/square-webhook-events-corrected"

export default function WebhookEventsCorrectedPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Square Webhook Events - 修正版</h1>
          <p className="text-gray-600">
            あなたのSquare Dashboardのスクリーンショットから確認された、実際に存在するイベント名を表示しています。
          </p>
        </div>
        <SquareWebhookEventsCorrected />
      </div>
    </div>
  )
}
