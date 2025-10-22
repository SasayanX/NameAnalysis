import { WebhookEnvironmentExplanation } from "@/components/webhook-environment-explanation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Webhook環境設定について | 姓名判断アプリ",
  description: "同一URLでの本番・サンドボックス環境対応について詳しく説明します",
}

export default function WebhookEnvironmentInfoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Webhook環境設定について</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            同じWebhook URLを本番とサンドボックスの両方で使用することについて詳しく説明します。
          </p>
        </div>

        <WebhookEnvironmentExplanation />
      </div>
    </div>
  )
}
