import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, Shield, AlertTriangle, CreditCard } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">法的文書</h1>
        
        {/* 法的文書一覧 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/legal/terms-of-service">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  利用規約
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">サービスの利用条件、有料プラン、解約・返金について</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/legal/privacy-policy">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  プライバシーポリシー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">個人情報の収集、利用、保護について</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/legal/tokusho">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  特定商取引法に基づく表記
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">事業者情報、料金、支払い方法について</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/legal/disclaimer">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  免責事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">サービス利用に関する責任の範囲について</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/legal/refund-policy">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  返金・キャンセルポリシー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">返金条件、クーリングオフ、解約手続きについて</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h2>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>事業者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">事業者名</h3>
                  <p>まいにちAI姓名判断</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">代表者</h3>
                  <p>金雨 輝龍</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">所在地</h3>
                  <p>〒226-0019 神奈川県横浜市緑区中山3-1-8-207</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">電話番号</h3>
                  <p>メールでのお問い合わせのみ対応</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">メールアドレス</h3>
                  <p>kanaukiryu@gmail.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">営業時間</h3>
                  <p>メール対応：平日 9:00-18:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>サービス・料金について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">販売商品・サービス</h3>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>姓名判断サービス（基本鑑定：無料）</li>
                  <li>ベーシックプラン：月額330円（税込）</li>
                  <li>プレミアムプラン：月額550円（税込）</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">支払い方法</h3>
                <p>クレジットカード決済（StripeまたはSquare経由）</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">支払い時期</h3>
                <p>サービス申込時に即時決済</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">サービス提供時期</h3>
                <p>決済完了後、即座にサービス利用可能</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>キャンセル・返品について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">返品・キャンセル</h3>
                <p>デジタルサービスの性質上、サービス提供開始後の返品・返金は原則として承っておりません。</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">月額サービスの解約</h3>
                <p>月額サービスはいつでも解約可能です。解約後は次回請求日以降、サービスが停止されます。</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">不具合・問題がある場合</h3>
                <p>サービスに不具合がある場合は、お問い合わせください。状況に応じて返金対応いたします。</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>個人情報の取り扱い</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                お客様の個人情報は、サービス提供および決済処理のためにのみ使用し、
                適切に管理いたします。第三者への提供は行いません。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>お問い合わせ</CardTitle>
            </CardHeader>
            <CardContent>
              <p>サービスに関するお問い合わせ、苦情、相談については、 上記連絡先までご連絡ください。</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>監修者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">監修者</h3>
                <p>金雨輝龍</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">監修アプリ</h3>
                <p>無料タロット占い - 毎日の運勢とカード占い</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">専門分野</h3>
                <p>姓名判断、タロット占い、運勢鑑定</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
