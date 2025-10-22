import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. 個人情報の収集について</h2>
              <p>当サービスでは、サービス提供のために以下の個人情報を収集する場合があります：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>氏名、生年月日（姓名判断のため）</li>
                <li>メールアドレス（アカウント管理のため）</li>
                <li>決済情報（Stripe経由で処理）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. 個人情報の利用目的</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>姓名判断サービスの提供</li>
                <li>アカウント管理</li>
                <li>決済処理</li>
                <li>サービス改善のための統計分析</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. 個人情報の第三者提供</h2>
              <p>法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. 個人情報の管理</h2>
              <p>
                個人情報は適切なセキュリティ対策を講じて管理し、不正アクセス、紛失、破損、
                改ざん、漏洩などを防止します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. お問い合わせ</h2>
              <p>
                個人情報の取り扱いに関するお問い合わせは、特定商取引法に基づく表記に 記載の連絡先までご連絡ください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
