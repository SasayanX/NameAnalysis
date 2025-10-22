import { SquareWebhookCreationGuide } from "@/components/square-webhook-creation-guide"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Square Webhook作成 | 姓名判断アプリ",
  description: "Square Production環境でWebhookを作成し、マネタイズ機能を完成させます",
}

export default function SquareWebhookCreationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Square Production Webhook作成</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            最終ステップです。Square Developer Consoleで本番環境のWebhookを作成し、マネタイズ機能を完成させましょう。
          </p>
        </div>

        <SquareWebhookCreationGuide />
      </div>
    </div>
  )
}
