import { WebhookSubscriptionGuide } from "@/components/webhook-subscription-guide"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Webhook Subscription設定 | 姓名判断アプリ",
  description: "Square Developer ConsoleでWebhook Subscriptionを作成し、マネタイズ機能を完成させます",
}

export default function WebhookSubscriptionSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Add a webhook subscription</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Square Developer Consoleで「Add subscription」ボタンをクリックして、
            ステップバイステップでWebhookを設定しましょう。
          </p>
        </div>

        <WebhookSubscriptionGuide />
      </div>
    </div>
  )
}
