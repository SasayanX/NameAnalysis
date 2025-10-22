import { SquareWebhookEventsGuide } from "@/components/square-webhook-events-guide"

export default function WebhookEventsGuidePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Square Webhook イベント設定</h1>
          <p className="text-gray-600">マネタイズ機能に必要な4つのイベントを正確に設定してください</p>
        </div>

        <SquareWebhookEventsGuide />
      </div>
    </div>
  )
}
