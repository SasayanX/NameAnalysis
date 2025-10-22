import { ProductionWebhookSetup } from "@/components/production-webhook-setup"

export default function ProductionWebhookSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">本番Webhook作成</h1>
          <p className="text-gray-600">Square Production環境でWebhookを作成し、マネタイズ機能を有効化します。</p>
        </div>

        <ProductionWebhookSetup />
      </div>
    </div>
  )
}
