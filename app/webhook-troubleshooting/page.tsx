import { WebhookTroubleshootingGuide } from "@/components/webhook-troubleshooting-guide"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Webhook作成トラブルシューティング | 姓名判断アプリ",
  description: "Square Developer ConsoleでWebhook作成時の問題を解決します",
}

export default function WebhookTroubleshootingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Webhook作成トラブルシューティング</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create Webhookボタンが見つからない場合の対処法を順番に試してみましょう。
          </p>
        </div>

        <WebhookTroubleshootingGuide />
      </div>
    </div>
  )
}
