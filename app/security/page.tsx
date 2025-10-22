import { StripeSecurityInfo } from "@/components/stripe-security-info"

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">セキュリティについて</h1>

        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            当サービスでは、お客様の決済情報の安全性を最優先に考え、 業界最高水準のセキュリティ対策を実施しています。
          </p>
        </div>

        <StripeSecurityInfo />

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">割賦販売法への対応</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ カード情報の適切な管理（PCI DSS準拠）</li>
            <li>✅ 3Dセキュアによる本人確認</li>
            <li>✅ セキュリティコードの毎回確認</li>
            <li>✅ 不正利用の検知・防止システム</li>
            <li>✅ 特定商取引法に基づく表記の掲載</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
