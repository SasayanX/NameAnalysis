import { WebhookCreationFinalStep } from "@/components/webhook-creation-final-step"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Webhook最終設定 | 姓名判断アプリ",
  description: "Square WebhookのSignature Keyを設定してマネタイズ機能を完成させます",
}

export default function WebhookFinalSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Webhook最終設定</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            「Add subscription」ボタンが見つかりました。最終ステップでマネタイズ機能を完成させましょう。
          </p>
        </div>

        <WebhookCreationFinalStep />
      </div>
    </div>
  )
}
