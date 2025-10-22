import { PaymentFeeCalculator } from "@/components/payment-fee-calculator"

export default function PaymentComparisonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">決済プロバイダー手数料比較</h1>
        <p className="text-gray-600">
          各決済プロバイダーの手数料を詳細比較。隠れたコストも含めて実質的な費用を計算します。
        </p>
      </div>

      <PaymentFeeCalculator />

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 選択のポイント</h3>
        <ul className="list-disc list-inside space-y-1 text-yellow-700">
          <li>
            <strong>月売上1万円未満</strong>: PayPal（固定費が安い）
          </li>
          <li>
            <strong>月売上1-5万円</strong>: Square（バランス良好）
          </li>
          <li>
            <strong>月売上5万円以上</strong>: GMO・SBペイメント（信頼性重視）
          </li>
          <li>
            <strong>開業届なし</strong>: Square・PayPal
          </li>
          <li>
            <strong>即日開始</strong>: PayPal
          </li>
        </ul>
      </div>
    </div>
  )
}
