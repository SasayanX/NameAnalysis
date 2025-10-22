import { WebhookVerificationPanel } from "@/components/webhook-verification-panel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Webhook検証 | 姓名判断アプリ",
  description: "Square Webhook設定の検証とテスト",
}

export default function WebhookVerificationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Webhook 検証</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Square Dashboard で設定したWebhookが正常に動作するかを検証します。
        </p>
      </div>

      <WebhookVerificationPanel />
    </div>
  )
}
